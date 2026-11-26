"use server";

import { db } from "@/server/db";
import {
  assignments,
  classes,
  courses,
  enrollments,
  students,
  submissions,
  submissionVersions,
  assessmentItems,
  gradingCategories,
  grades,
  notifications,
  auditLogs,
} from "@/server/db/schema";
import { requireLecturer, requireUser } from "@/server/auth/session";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";

const assignmentSchema = z.object({
  classId: z.string().min(1, "Kelas wajib dipilih"),
  title: z.string().min(3, "Judul tugas minimal 3 karakter").max(180),
  instructions: z.string().min(5, "Instruksi tugas minimal 5 karakter"),
  maxScore: z.coerce.number().min(1).max(1000).default(100),
  opensAt: z.string().optional(),
  dueAt: z.string().min(1, "Tenggat waktu wajib ditentukan"),
  allowLate: z.boolean().default(false),
  submissionMode: z.enum(["file", "url", "both"]).default("both"),
  maxFileSizeMb: z.coerce.number().min(1).max(50).default(10),
  status: z.enum(["draft", "published", "closed"]).default("published"),
  createGradeItem: z.boolean().default(true),
});

const updateAssignmentSchema = z.object({
  title: z.string().min(3, "Judul tugas minimal 3 karakter").max(180),
  instructions: z.string().min(5, "Instruksi tugas minimal 5 karakter"),
  maxScore: z.coerce.number().min(1).max(1000).default(100),
  dueAt: z.string().min(1, "Tenggat waktu wajib ditentukan"),
  allowLate: z.boolean().default(false),
  submissionMode: z.enum(["file", "url", "both"]).default("both"),
  maxFileSizeMb: z.coerce.number().min(1).max(50).default(10),
  status: z.enum(["draft", "published", "closed"]).default("published"),
});

export async function getLecturerAssignments(classIdFilter?: string) {
  const lecturer = await requireLecturer();

  const whereClause = classIdFilter
    ? and(
        eq(courses.lecturerId, lecturer.userId),
        eq(assignments.classId, classIdFilter)
      )
    : eq(courses.lecturerId, lecturer.userId);

  const list = await db
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
      assessmentItemId: assignments.assessmentItemId,
      totalSubmissions: sql<number>`count(distinct ${submissions.id})`,
      gradedSubmissions: sql<number>`count(distinct case when ${submissions.status} = 'graded' then ${submissions.id} end)`,
      pendingSubmissions: sql<number>`count(distinct case when ${submissions.status} in ('submitted', 'resubmitted', 'late') then ${submissions.id} end)`,
    })
    .from(assignments)
    .innerJoin(classes, eq(assignments.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .leftJoin(submissions, eq(submissions.assignmentId, assignments.id))
    .where(whereClause)
    .groupBy(assignments.id, classes.id, courses.id)
    .orderBy(desc(assignments.createdAt));

  return list;
}

export async function getAssignmentDetail(assignmentId: string) {
  const user = await requireUser();

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
      allowedMimeTypes: assignments.allowedMimeTypes,
      maxFileSizeMb: assignments.maxFileSizeMb,
      status: assignments.status,
      assessmentItemId: assignments.assessmentItemId,
      classId: classes.id,
      classDisplayName: classes.displayName,
      classCode: classes.classCode,
      courseCode: courses.code,
      courseName: courses.name,
      ownerUserId: courses.lecturerId,
    })
    .from(assignments)
    .innerJoin(classes, eq(assignments.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(assignments.id, assignmentId))
    .limit(1);

  if (!assignment) return null;

  if (user.role === "lecturer" && assignment.ownerUserId !== user.userId) {
    throw new Error("FORBIDDEN_NOT_OWNER");
  }

  return assignment;
}

export async function getAssignmentSubmissionsList(assignmentId: string) {
  const lecturer = await requireLecturer();

  // Verify ownership
  const assignment = await getAssignmentDetail(assignmentId);
  if (!assignment || assignment.ownerUserId !== lecturer.userId) {
    throw new Error("FORBIDDEN_NOT_OWNER");
  }

  // Get all enrolled students for the class
  const enrolledStudents = await db
    .select({
      studentUserId: students.id,
      name: students.name,
      email: students.email,
      studentNumber: students.studentNumber,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .where(
      and(
        eq(enrollments.classId, assignment.classId),
        eq(enrollments.enrollmentStatus, "active")
      )
    )
    .orderBy(students.studentNumber);

  // Get all submissions for this assignment
  const subList = await db
    .select({
      id: submissions.id,
      studentUserId: submissions.studentId,
      status: submissions.status,
      submittedAt: submissions.submittedAt,
      currentVersion: submissions.currentVersion,
      score: submissions.score,
      feedback: submissions.feedback,
      gradedAt: submissions.gradedAt,
    })
    .from(submissions)
    .where(eq(submissions.assignmentId, assignmentId));

  const subMap = new Map(subList.map((s) => [s.studentUserId, s]));

  // Get latest versions for all submissions
  const subIds = subList.map((s) => s.id);
  const versions =
    subIds.length > 0
      ? await db
          .select()
          .from(submissionVersions)
          .where(
            sql`${submissionVersions.submissionId} IN (${sql.join(
              subIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          )
          .orderBy(desc(submissionVersions.versionNumber))
      : [];

  const versionMap = new Map<string, typeof versions[0]>();
  for (const v of versions) {
    if (!versionMap.has(v.submissionId)) {
      versionMap.set(v.submissionId, v);
    }
  }

  return enrolledStudents.map((st) => {
    const sub = subMap.get(st.studentUserId) || null;
    const latestVersion = sub ? versionMap.get(sub.id) || null : null;

    return {
      studentUserId: st.studentUserId,
      name: st.name,
      email: st.email,
      studentNumber: st.studentNumber,
      submissionId: sub?.id || null,
      status: sub?.status || "draft",
      hasSubmitted: sub !== null && sub.status !== "draft",
      submittedAt: sub?.submittedAt || null,
      currentVersion: sub?.currentVersion || 1,
      score: sub?.score ? parseFloat(sub.score) : null,
      feedback: sub?.feedback || null,
      gradedAt: sub?.gradedAt || null,
      latestVersion: latestVersion
        ? {
            id: latestVersion.id,
            versionNumber: latestVersion.versionNumber,
            originalFilename: latestVersion.originalFilename,
            externalUrl: latestVersion.externalUrl,
            note: latestVersion.note,
            submittedAt: latestVersion.submittedAt,
          }
        : null,
    };
  });
}

export async function createAssignment(formData: FormData) {
  const lecturer = await requireLecturer();

  const validated = assignmentSchema.safeParse({
    classId: formData.get("classId"),
    title: formData.get("title"),
    instructions: formData.get("instructions"),
    maxScore: formData.get("maxScore"),
    opensAt: formData.get("opensAt") || undefined,
    dueAt: formData.get("dueAt"),
    allowLate: formData.get("allowLate") === "true",
    submissionMode: formData.get("submissionMode") || "both",
    maxFileSizeMb: formData.get("maxFileSizeMb") || 10,
    status: formData.get("status") || "published",
    createGradeItem: formData.get("createGradeItem") === "true",
  });

  if (!validated.success) {
    return {
      error: "Validasi gagal: " + Object.values(validated.error.flatten().fieldErrors).flat().join(", "),
    };
  }

  const {
    classId,
    title,
    instructions,
    maxScore,
    opensAt,
    dueAt,
    allowLate,
    submissionMode,
    maxFileSizeMb,
    status,
    createGradeItem,
  } = validated.data;

  // Check class ownership
  const [cls] = await db
    .select({ ownerUserId: courses.lecturerId })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.ownerUserId !== lecturer.userId) {
    return { error: "Kelas tidak ditemukan atau bukan milik Anda" };
  }

  let assessmentItemId: string | null = null;

  // Automatically create assessment item in gradebook category "Tugas" if requested
  if (createGradeItem) {
    const [tugasCat] = await db
      .select()
      .from(gradingCategories)
      .where(
        and(
          eq(gradingCategories.classId, classId),
          eq(gradingCategories.name, "Tugas")
        )
      )
      .limit(1);

    const categoryId =
      tugasCat?.id ||
      (
        await db
          .select()
          .from(gradingCategories)
          .where(eq(gradingCategories.classId, classId))
          .limit(1)
      )[0]?.id;

    if (categoryId) {
      assessmentItemId = randomUUID();
      await db.insert(assessmentItems).values({
        id: assessmentItemId,
        categoryId,
        title: title.trim(),
        maxScore: maxScore.toFixed(2),
        isPublished: true,
      });
    }
  }

  const newAssignmentId = randomUUID();

  const parsedDueAt = new Date(
    dueAt.includes("Z") ? dueAt : (dueAt.length === 16 ? dueAt + ":00Z" : dueAt + "Z")
  );

  await db.insert(assignments).values({
    id: newAssignmentId,
    classId,
    title: title.trim(),
    instructions: instructions.trim(),
    maxScore: maxScore.toFixed(2),
    opensAt: opensAt ? new Date(opensAt) : new Date(),
    dueAt: parsedDueAt,
    allowLate,
    submissionMode,
    maxFileSizeMb,
    status,
    assessmentItemId,
  });

  // Audit log
  await db.insert(auditLogs).values({
    id: randomUUID(),
    actorUserId: lecturer.userId,
    entityType: "assignments",
    entityId: newAssignmentId,
    action: "create_assignment",
    afterData: { title, maxScore, dueAt, submissionMode, classId },
  });

  revalidatePath("/assignments");
  revalidatePath(`/classes/${classId}`);
  return { success: true, assignmentId: newAssignmentId };
}

export async function updateAssignment(assignmentId: string, formData: FormData) {
  const lecturer = await requireLecturer();

  const validated = updateAssignmentSchema.safeParse({
    title: formData.get("title"),
    instructions: formData.get("instructions"),
    maxScore: formData.get("maxScore"),
    dueAt: formData.get("dueAt"),
    allowLate: formData.get("allowLate") === "true",
    submissionMode: formData.get("submissionMode") || "both",
    maxFileSizeMb: formData.get("maxFileSizeMb") || 10,
    status: formData.get("status") || "published",
  });

  if (!validated.success) {
    return {
      error: "Validasi gagal: " + Object.values(validated.error.flatten().fieldErrors).flat().join(", "),
    };
  }

  // Check ownership
  const [existing] = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      classId: assignments.classId,
      assessmentItemId: assignments.assessmentItemId,
      ownerUserId: courses.lecturerId,
    })
    .from(assignments)
    .innerJoin(classes, eq(assignments.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(assignments.id, assignmentId))
    .limit(1);

  if (!existing || existing.ownerUserId !== lecturer.userId) {
    return { error: "Tugas tidak ditemukan atau bukan milik Anda" };
  }

  const { title, instructions, maxScore, dueAt, allowLate, submissionMode, maxFileSizeMb, status } = validated.data;

  const parsedDueAt = new Date(
    dueAt.includes("Z") ? dueAt : (dueAt.length === 16 ? dueAt + ":00Z" : dueAt + "Z")
  );

  await db
    .update(assignments)
    .set({
      title: title.trim(),
      instructions: instructions.trim(),
      maxScore: maxScore.toFixed(2),
      dueAt: parsedDueAt,
      allowLate,
      submissionMode,
      maxFileSizeMb,
      status,
      updatedAt: new Date(),
    })
    .where(eq(assignments.id, assignmentId));

  if (existing.assessmentItemId) {
    await db
      .update(assessmentItems)
      .set({
        title: title.trim(),
        maxScore: maxScore.toFixed(2),
      })
      .where(eq(assessmentItems.id, existing.assessmentItemId));
  }

  await db.insert(auditLogs).values({
    id: randomUUID(),
    actorUserId: lecturer.userId,
    entityType: "assignments",
    entityId: assignmentId,
    action: "update_assignment",
    afterData: { title, maxScore, dueAt, submissionMode, status },
  });

  revalidatePath("/assignments");
  revalidatePath(`/assignments/${assignmentId}`);
  revalidatePath(`/classes/${existing.classId}`);

  return { success: true };
}

export async function deleteAssignment(assignmentId: string) {
  const lecturer = await requireLecturer();

  const [existing] = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      classId: assignments.classId,
      assessmentItemId: assignments.assessmentItemId,
      ownerUserId: courses.lecturerId,
    })
    .from(assignments)
    .innerJoin(classes, eq(assignments.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(assignments.id, assignmentId))
    .limit(1);

  if (!existing || existing.ownerUserId !== lecturer.userId) {
    return { error: "Tugas tidak ditemukan atau bukan milik Anda" };
  }

  // Delete assignment (cascades to submissions and submissionVersions)
  await db.delete(assignments).where(eq(assignments.id, assignmentId));

  // If there was an associated assessmentItem, delete it as well
  if (existing.assessmentItemId) {
    await db.delete(assessmentItems).where(eq(assessmentItems.id, existing.assessmentItemId));
  }

  await db.insert(auditLogs).values({
    id: randomUUID(),
    actorUserId: lecturer.userId,
    entityType: "assignments",
    entityId: assignmentId,
    action: "delete_assignment",
    beforeData: { title: existing.title, classId: existing.classId },
  });

  revalidatePath("/assignments");
  revalidatePath(`/classes/${existing.classId}`);

  return { success: true };
}

export async function gradeSubmission(
  submissionId: string,
  scoreInput: number | null,
  feedback: string | null,
  requestRevision: boolean = false
) {
  const lecturer = await requireLecturer();

  // Fetch submission and verify ownership
  const [sub] = await db
    .select({
      id: submissions.id,
      assignmentId: submissions.assignmentId,
      studentUserId: submissions.studentId,
      currentScore: submissions.score,
      maxScore: assignments.maxScore,
      assessmentItemId: assignments.assessmentItemId,
      assignmentTitle: assignments.title,
      ownerUserId: courses.lecturerId,
    })
    .from(submissions)
    .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
    .innerJoin(classes, eq(assignments.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(submissions.id, submissionId))
    .limit(1);

  if (!sub || sub.ownerUserId !== lecturer.userId) {
    return { error: "Submission tidak ditemukan atau bukan wewenang Anda" };
  }

  const maxScoreNum = parseFloat(sub.maxScore);

  if (scoreInput !== null) {
    if (scoreInput < 0 || scoreInput > maxScoreNum) {
      return { error: `Nilai harus berada pada rentang 0 sampai ${maxScoreNum}` };
    }
  }

  const newStatus = requestRevision
    ? "returned_for_revision"
    : scoreInput !== null
    ? "graded"
    : "submitted";

  const scoreFormatted = scoreInput !== null ? scoreInput.toFixed(2) : null;

  await db
    .update(submissions)
    .set({
      score: scoreFormatted,
      feedback: feedback?.trim() || null,
      status: newStatus,
      gradedBy: lecturer.userId,
      gradedAt: new Date(),
    })
    .where(eq(submissions.id, submissionId));

  // Sync to grades table if assessmentItemId is linked
  if (sub.assessmentItemId) {
    const [existingGrade] = await db
      .select()
      .from(grades)
      .where(
        and(
          eq(grades.assessmentItemId, sub.assessmentItemId),
          eq(grades.studentId, sub.studentUserId)
        )
      )
      .limit(1);

    if (existingGrade) {
      await db
        .update(grades)
        .set({
          score: scoreFormatted,
          feedback: feedback?.trim() || null,
          gradedBy: lecturer.userId,
          gradedAt: new Date(),
        })
        .where(eq(grades.id, existingGrade.id));
    } else {
      await db.insert(grades).values({
        id: randomUUID(),
        assessmentItemId: sub.assessmentItemId,
        studentId: sub.studentUserId,
        score: scoreFormatted,
        feedback: feedback?.trim() || null,
        gradedBy: lecturer.userId,
        gradedAt: new Date(),
      });
    }
  }

  // Notify student
  await db.insert(notifications).values({
    id: randomUUID(),
    userId: sub.studentUserId,
    title: requestRevision
      ? `Revisi Diperlukan: ${sub.assignmentTitle}`
      : `Tugas Telah Dinilai: ${sub.assignmentTitle}`,
    body: requestRevision
      ? `Dosen meminta Anda merevisi tugas '${sub.assignmentTitle}'. Catatan: ${feedback || "Silakan cek halaman tugas"}`
      : `Nilai Anda untuk '${sub.assignmentTitle}' adalah ${scoreFormatted}/${maxScoreNum}.`,
    type: "assignment_graded",
    targetUrl: `/student/assignments/${sub.assignmentId}`,
  });

  // Audit log
  await db.insert(auditLogs).values({
    id: randomUUID(),
    actorUserId: lecturer.userId,
    entityType: "submissions",
    entityId: submissionId,
    action: "grade_submission",
    beforeData: { score: sub.currentScore },
    afterData: { score: scoreFormatted, status: newStatus, feedback },
  });

  revalidatePath(`/assignments/${sub.assignmentId}`);
  return { success: true };
}
