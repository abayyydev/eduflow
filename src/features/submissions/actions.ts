"use server";

import { db } from "@/server/db";
import {
  assignments,
  classes,
  enrollments,
  submissions,
  submissionVersions,
  courses,
  users,
} from "@/server/db/schema";
import { requireStudent } from "@/server/auth/session";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { savePrivateFile } from "@/server/storage";

export async function getStudentAssignmentDetail(assignmentId: string) {
  const student = await requireStudent();

  // 1. Get assignment and class info
  const [assignment] = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      instructions: assignments.instructions,
      maxScore: assignments.maxScore,
      opensAt: assignments.opensAt,
      dueAt: assignments.dueAt,
      allowLate: assignments.allowLate,
      submissionMode: assignments.submissionMode,
      maxFileSizeMb: assignments.maxFileSizeMb,
      status: assignments.status,
      classId: classes.id,
      classDisplayName: classes.displayName,
      courseCode: courses.code,
      lecturerName: users.name,
    })
    .from(assignments)
    .innerJoin(classes, eq(assignments.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .innerJoin(users, eq(courses.ownerUserId, users.id))
    .where(
      and(
        eq(assignments.id, assignmentId),
        eq(assignments.status, "published")
      )
    )
    .limit(1);

  if (!assignment) return null;

  // 2. Check that student is enrolled in this class
  const [enrollment] = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.classId, assignment.classId),
        eq(enrollments.studentUserId, student.userId),
        eq(enrollments.enrollmentStatus, "active")
      )
    )
    .limit(1);

  if (!enrollment) {
    throw new Error("FORBIDDEN_NOT_ENROLLED");
  }

  // 3. Get student's submission (if any)
  const [submission] = await db
    .select()
    .from(submissions)
    .where(
      and(
        eq(submissions.assignmentId, assignmentId),
        eq(submissions.studentUserId, student.userId)
      )
    )
    .limit(1);

  // 4. Get submission versions
  const versions = submission
    ? await db
        .select()
        .from(submissionVersions)
        .where(eq(submissionVersions.submissionId, submission.id))
        .orderBy(desc(submissionVersions.versionNumber))
    : [];

  return {
    assignment,
    submission: submission || null,
    versions,
  };
}

export async function getStudentAssignmentsList() {
  const student = await requireStudent();

  // Enrolled active classes
  const enrolledClasses = await db
    .select({ classId: enrollments.classId })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.studentUserId, student.userId),
        eq(enrollments.enrollmentStatus, "active")
      )
    );

  const classIds = enrolledClasses.map((c) => c.classId);
  if (classIds.length === 0) return [];

  const list = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      dueAt: assignments.dueAt,
      maxScore: assignments.maxScore,
      submissionMode: assignments.submissionMode,
      classDisplayName: classes.displayName,
      courseCode: courses.code,
      submissionId: submissions.id,
      submissionStatus: submissions.status,
      score: submissions.score,
      submittedAt: submissions.submittedAt,
    })
    .from(assignments)
    .innerJoin(classes, eq(assignments.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .leftJoin(
      submissions,
      and(
        eq(submissions.assignmentId, assignments.id),
        eq(submissions.studentUserId, student.userId)
      )
    )
    .where(
      and(
        eq(assignments.status, "published"),
        sql`${assignments.classId} IN (${sql.join(
          classIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      )
    )
    .orderBy(desc(assignments.dueAt));

  return list;
}

export async function submitStudentAssignment(formData: FormData) {
  const student = await requireStudent();

  const assignmentId = formData.get("assignmentId") as string;
  const isDraft = formData.get("action") === "draft";
  const externalUrl = (formData.get("externalUrl") as string)?.trim() || null;
  const note = (formData.get("note") as string)?.trim() || null;
  const file = formData.get("file") as File | null;

  if (!assignmentId) {
    return { error: "ID tugas tidak valid." };
  }

  // 1. Fetch assignment and verify enrollment
  const data = await getStudentAssignmentDetail(assignmentId);
  if (!data) {
    return { error: "Tugas tidak ditemukan atau tidak dipublikasikan." };
  }

  const { assignment, submission } = data;
  const now = new Date();
  const dueDate = assignment.dueAt ? new Date(assignment.dueAt) : null;

  // Deadline check
  const isLate = dueDate ? now.getTime() > dueDate.getTime() : false;

  if (!isDraft && isLate && !assignment.allowLate) {
    return { error: "Tenggat waktu pengumpulan telah berakhir dan keterlambatan tidak diizinkan." };
  }

  // Validation of input based on mode (if not draft)
  if (!isDraft) {
    if (assignment.submissionMode === "url" && !externalUrl) {
      return { error: "Tautan URL wajib diisi untuk tugas ini." };
    }
    if (assignment.submissionMode === "file" && (!file || file.size === 0)) {
      if (!submission || (await getPreviousFileVersion(submission.id)) === null) {
        return { error: "File pengumpulan wajib diunggah untuk tugas ini." };
      }
    }
    if (
      assignment.submissionMode === "both" &&
      !externalUrl &&
      (!file || file.size === 0)
    ) {
      if (!submission) {
        return { error: "Harap unggah file atau cantumkan tautan URL tugas." };
      }
    }
  }

  if (externalUrl) {
    try {
      const parsedUrl = new URL(externalUrl);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return { error: "URL harus berformat http:// atau https://" };
      }
    } catch {
      return { error: "Format tautan URL tidak valid." };
    }
  }

  // Handle file save if uploaded
  let fileObjectKey: string | null = null;
  let originalFilename: string | null = null;

  if (file && file.size > 0) {
    const maxBytes = assignment.maxFileSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      return {
        error: `Ukuran file melebihi batas maksimum (${assignment.maxFileSizeMb} MB).`,
      };
    }

    const saved = await savePrivateFile(file, `asg_${assignmentId.slice(0, 8)}`);
    fileObjectKey = saved.fileObjectKey;
    originalFilename = saved.originalFilename;
  }

  // Determine submission status
  let finalStatus:
    | "draft"
    | "submitted"
    | "late"
    | "resubmitted" = "submitted";

  if (isDraft) {
    finalStatus = "draft";
  } else if (isLate) {
    finalStatus = "late";
  } else if (submission && (submission.status === "returned_for_revision" || submission.status === "submitted" || submission.status === "graded")) {
    finalStatus = "resubmitted";
  }

  let submissionId = submission?.id;
  let nextVersionNumber = 1;

  if (!submission) {
    submissionId = randomUUID();
    await db.insert(submissions).values({
      id: submissionId,
      assignmentId,
      studentUserId: student.userId,
      status: finalStatus,
      submittedAt: isDraft ? null : now,
      currentVersion: 1,
    });
  } else {
    nextVersionNumber = submission.currentVersion + (isDraft ? 0 : 1);
    await db
      .update(submissions)
      .set({
        status: finalStatus,
        submittedAt: isDraft ? submission.submittedAt : now,
        currentVersion: nextVersionNumber,
      })
      .where(eq(submissions.id, submission.id));
  }

  // Create submission version entry
  await db.insert(submissionVersions).values({
    id: randomUUID(),
    submissionId: submissionId!,
    versionNumber: nextVersionNumber,
    fileObjectKey,
    originalFilename,
    externalUrl,
    note,
    submittedAt: now,
  });

  revalidatePath(`/student/assignments/${assignmentId}`);
  revalidatePath("/student/assignments");
  revalidatePath(`/assignments/${assignmentId}`);

  return { success: true, status: finalStatus };
}

async function getPreviousFileVersion(submissionId: string) {
  const [version] = await db
    .select({ fileObjectKey: submissionVersions.fileObjectKey })
    .from(submissionVersions)
    .where(eq(submissionVersions.submissionId, submissionId))
    .orderBy(desc(submissionVersions.versionNumber))
    .limit(1);

  return version?.fileObjectKey || null;
}
