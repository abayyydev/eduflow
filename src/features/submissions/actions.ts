"use server";

import { db } from "@/server/db";
import {
  assignments,
  classes,
  enrollments,
  submissions,
  submissionVersions,
  submissionFiles,
  courses,
  lecturers,
  academicTerms,
} from "@/server/db/schema";
import { requireStudent } from "@/server/auth/session";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { savePrivateFile } from "@/server/storage";
import { isPastDeadline } from "@/lib/utils";

let hasEnsuredSubmissionFilesTable = false;
export async function ensureSubmissionFilesTable() {
  if (hasEnsuredSubmissionFilesTable) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS \`submission_files\` (
        \`id\` varchar(36) NOT NULL,
        \`version_id\` varchar(36) NOT NULL,
        \`file_object_key\` varchar(500) NOT NULL,
        \`original_filename\` varchar(255) NOT NULL,
        \`file_size\` int NOT NULL DEFAULT 0,
        \`mime_type\` varchar(120) DEFAULT NULL,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_sub_files_version\` (\`version_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    hasEnsuredSubmissionFilesTable = true;
  } catch {
    // Handled gracefully if table exists or permissions are restricted
  }
}

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
      lecturerName: lecturers.name,
    })
    .from(assignments)
    .innerJoin(classes, eq(assignments.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .innerJoin(lecturers, eq(courses.lecturerId, lecturers.id))
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
        eq(enrollments.studentId, student.userId),
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
        eq(submissions.studentId, student.userId)
      )
    )
    .limit(1);

  // 4. Get submission versions with files
  let versionsWithFiles: Array<{
    id: string;
    submissionId: string;
    versionNumber: number;
    fileObjectKey: string | null;
    originalFilename: string | null;
    externalUrl: string | null;
    note: string | null;
    submittedAt: Date;
    files: Array<{
      id: string;
      fileObjectKey: string;
      originalFilename: string;
      fileSize: number;
    }>;
  }> = [];

  if (submission) {
    await ensureSubmissionFilesTable();
    const rawVersions = await db
      .select()
      .from(submissionVersions)
      .where(eq(submissionVersions.submissionId, submission.id))
      .orderBy(desc(submissionVersions.versionNumber));

    if (rawVersions.length > 0) {
      const versionIds = rawVersions.map((v) => v.id);
      let allFiles: Array<{
        id: string;
        versionId: string;
        fileObjectKey: string;
        originalFilename: string;
        fileSize: number;
      }> = [];

      try {
        allFiles = await db
          .select({
            id: submissionFiles.id,
            versionId: submissionFiles.versionId,
            fileObjectKey: submissionFiles.fileObjectKey,
            originalFilename: submissionFiles.originalFilename,
            fileSize: submissionFiles.fileSize,
          })
          .from(submissionFiles)
          .where(
            sql`${submissionFiles.versionId} IN (${sql.join(
              versionIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          );
      } catch {
        // Fallback if table query fails
      }

      const filesByVersion = new Map<string, typeof allFiles>();
      for (const f of allFiles) {
        if (!filesByVersion.has(f.versionId)) filesByVersion.set(f.versionId, []);
        filesByVersion.get(f.versionId)!.push(f);
      }

      versionsWithFiles = rawVersions.map((v) => {
        const vFiles = filesByVersion.get(v.id) || [];
        const finalFiles =
          vFiles.length > 0
            ? vFiles
            : v.fileObjectKey
            ? [
                {
                  id: v.id,
                  fileObjectKey: v.fileObjectKey,
                  originalFilename: v.originalFilename || "submission_file.bin",
                  fileSize: 0,
                },
              ]
            : [];

        return {
          ...v,
          files: finalFiles,
        };
      });
    }
  }

  return {
    assignment,
    submission: submission || null,
    versions: versionsWithFiles,
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
        eq(enrollments.studentId, student.userId),
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
        eq(submissions.studentId, student.userId)
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

  // Retrieve multiple uploaded files or fallback to single file
  const rawFiles = formData.getAll("files");
  const singleFile = formData.get("file");
  const uploadedFiles: File[] = [];

  for (const item of rawFiles) {
    if (item && typeof item === "object" && "size" in item && (item as File).size > 0) {
      uploadedFiles.push(item as File);
    }
  }

  if (uploadedFiles.length === 0 && singleFile && typeof singleFile === "object" && "size" in singleFile && (singleFile as File).size > 0) {
    uploadedFiles.push(singleFile as File);
  }

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
  // Deadline check
  const isLate = isPastDeadline(assignment.dueAt);

  if (!isDraft && isLate && !assignment.allowLate) {
    return { error: "Tenggat waktu pengumpulan telah berakhir dan keterlambatan tidak diizinkan." };
  }

  const hasFiles = uploadedFiles.length > 0;

  // Validation of input based on mode (if not draft)
  if (!isDraft) {
    if (assignment.submissionMode === "url" && !externalUrl) {
      return { error: "Tautan URL wajib diisi untuk tugas ini." };
    }
    if (assignment.submissionMode === "file" && !hasFiles) {
      if (!submission || (await getPreviousFileVersion(submission.id)) === null) {
        return { error: "File pengumpulan wajib diunggah untuk tugas ini." };
      }
    }
    if (
      assignment.submissionMode === "both" &&
      !externalUrl &&
      !hasFiles
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

  // Handle files save if uploaded
  const maxBytes = assignment.maxFileSizeMb * 1024 * 1024;
  for (const f of uploadedFiles) {
    if (f.size > maxBytes) {
      return {
        error: `File "${f.name}" melebihi batas maksimum (${assignment.maxFileSizeMb} MB).`,
      };
    }
  }

  await ensureSubmissionFilesTable();

  const savedFiles: Array<{
    id: string;
    fileObjectKey: string;
    originalFilename: string;
    fileSize: number;
    mimeType: string;
  }> = [];

  for (const f of uploadedFiles) {
    const saved = await savePrivateFile(f, `asg_${assignmentId.slice(0, 8)}`);
    savedFiles.push({
      id: randomUUID(),
      fileObjectKey: saved.fileObjectKey,
      originalFilename: saved.originalFilename,
      fileSize: saved.fileSize,
      mimeType: saved.mimeType,
    });
  }

  let fileObjectKey: string | null = null;
  let originalFilename: string | null = null;

  if (savedFiles.length > 0) {
    fileObjectKey = savedFiles[0].fileObjectKey;
    originalFilename =
      savedFiles.length === 1
        ? savedFiles[0].originalFilename
        : `${savedFiles[0].originalFilename} (+${savedFiles.length - 1} file lainnya)`;
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
      studentId: student.userId,
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

  const newVersionId = randomUUID();

  // Create submission version entry
  await db.insert(submissionVersions).values({
    id: newVersionId,
    submissionId: submissionId!,
    versionNumber: nextVersionNumber,
    fileObjectKey,
    originalFilename,
    externalUrl,
    note,
    submittedAt: now,
  });

  // Save each file in submission_files
  if (savedFiles.length > 0) {
    for (const sf of savedFiles) {
      try {
        await db.insert(submissionFiles).values({
          id: sf.id,
          versionId: newVersionId,
          fileObjectKey: sf.fileObjectKey,
          originalFilename: sf.originalFilename,
          fileSize: sf.fileSize,
          mimeType: sf.mimeType,
        });
      } catch {
        // Fallback
      }
    }
  }

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

export async function getStudentClassAssignments(classId: string) {
  const student = await requireStudent();

  // 1. Verify enrollment in class
  const [enrollment] = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.classId, classId),
        eq(enrollments.studentId, student.userId),
        eq(enrollments.enrollmentStatus, "active")
      )
    )
    .limit(1);

  if (!enrollment) {
    throw new Error("FORBIDDEN_NOT_ENROLLED");
  }

  // 2. Class info
  const [classInfo] = await db
    .select({
      id: classes.id,
      displayName: classes.displayName,
      classCode: classes.classCode,
      scheduleText: classes.scheduleText,
      courseCode: courses.code,
      courseName: courses.name,
      creditUnits: courses.creditUnits,
      termName: academicTerms.name,
      lecturerName: lecturers.name,
      lecturerEmail: lecturers.email,
    })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
    .innerJoin(lecturers, eq(courses.lecturerId, lecturers.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!classInfo) return null;

  // 3. Assignments for this class
  const classAssignments = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      instructions: assignments.instructions,
      dueAt: assignments.dueAt,
      opensAt: assignments.opensAt,
      maxScore: assignments.maxScore,
      submissionMode: assignments.submissionMode,
      allowLate: assignments.allowLate,
      submissionId: submissions.id,
      submissionStatus: submissions.status,
      score: submissions.score,
      submittedAt: submissions.submittedAt,
      gradedAt: submissions.gradedAt,
      feedback: submissions.feedback,
    })
    .from(assignments)
    .leftJoin(
      submissions,
      and(
        eq(submissions.assignmentId, assignments.id),
        eq(submissions.studentId, student.userId)
      )
    )
    .where(
      and(
        eq(assignments.classId, classId),
        eq(assignments.status, "published")
      )
    )
    .orderBy(desc(assignments.dueAt));

  return {
    classInfo,
    assignments: classAssignments,
  };
}
