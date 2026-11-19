"use server";

import { db } from "@/server/db";
import {
  learningMaterials,
  classes,
  courses,
  academicTerms,
  lecturers,
  enrollments,
  auditLogs,
} from "@/server/db/schema";
import { requireLecturer, requireStudent, requireUser } from "@/server/auth/session";
import { eq, and, asc, sql, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { savePrivateFile } from "@/server/storage";
import { z } from "zod";

const createMaterialSchema = z.object({
  classId: z.string().min(1, "Kelas wajib dipilih"),
  meetingNumber: z.coerce.number().min(1).max(32).optional(),
  title: z.string().min(3, "Judul materi minimal 3 karakter").max(180),
  description: z.string().optional(),
  externalUrl: z.string().optional(),
});

export async function getLecturerMaterialsOverview() {
  const lecturer = await requireLecturer();

  return db
    .select({
      id: classes.id,
      classCode: classes.classCode,
      displayName: classes.displayName,
      scheduleText: classes.scheduleText,
      status: classes.status,
      courseId: courses.id,
      courseCode: courses.code,
      courseName: courses.name,
      creditUnits: courses.creditUnits,
      termName: academicTerms.name,
      studentCount: sql<number>`count(distinct ${enrollments.studentId})`,
      materialsCount: sql<number>`(select count(*) from learning_materials where learning_materials.class_id = ${classes.id})`,
    })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
    .leftJoin(
      enrollments,
      and(
        eq(enrollments.classId, classes.id),
        eq(enrollments.enrollmentStatus, "active")
      )
    )
    .where(
      and(
        eq(courses.lecturerId, lecturer.userId),
        eq(classes.status, "active"),
        isNull(courses.archivedAt)
      )
    )
    .groupBy(classes.id, courses.id, academicTerms.id)
    .orderBy(courses.code, classes.classCode);
}

export async function getStudentMaterialsOverview() {
  const student = await requireStudent();

  return db
    .select({
      classId: classes.id,
      displayName: classes.displayName,
      classCode: classes.classCode,
      scheduleText: classes.scheduleText,
      courseCode: courses.code,
      courseName: courses.name,
      creditUnits: courses.creditUnits,
      termName: academicTerms.name,
      lecturerName: lecturers.name,
      materialsCount: sql<number>`(select count(*) from learning_materials where learning_materials.class_id = ${classes.id})`,
    })
    .from(enrollments)
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
    .innerJoin(lecturers, eq(courses.lecturerId, lecturers.id))
    .where(
      and(
        eq(enrollments.studentId, student.userId),
        eq(enrollments.enrollmentStatus, "active"),
        eq(classes.status, "active")
      )
    )
    .orderBy(courses.code);
}

export async function getClassMaterials(classId: string) {
  const user = await requireUser();

  // Verify access
  if (user.role === "lecturer") {
    const [cls] = await db
      .select({ ownerUserId: courses.lecturerId })
      .from(classes)
      .innerJoin(courses, eq(classes.courseId, courses.id))
      .where(eq(classes.id, classId))
      .limit(1);

    if (!cls || cls.ownerUserId !== user.userId) {
      throw new Error("FORBIDDEN_NOT_CLASS_OWNER");
    }
  } else {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.classId, classId),
          eq(enrollments.studentId, user.userId),
          eq(enrollments.enrollmentStatus, "active")
        )
      )
      .limit(1);

    if (!enrollment) {
      throw new Error("FORBIDDEN_NOT_ENROLLED");
    }
  }

  return db
    .select()
    .from(learningMaterials)
    .where(eq(learningMaterials.classId, classId))
    .orderBy(asc(learningMaterials.meetingNumber));
}

export async function createMaterial(formData: FormData) {
  const lecturer = await requireLecturer();

  const validated = createMaterialSchema.safeParse({
    classId: formData.get("classId"),
    meetingNumber: formData.get("meetingNumber") || undefined,
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    externalUrl: formData.get("externalUrl") || undefined,
  });

  if (!validated.success) {
    return {
      error: "Validasi gagal: " + Object.values(validated.error.flatten().fieldErrors).flat().join(", "),
    };
  }

  const { classId, meetingNumber, title, description, externalUrl } = validated.data;

  // Verify class ownership
  const [cls] = await db
    .select({ ownerUserId: courses.lecturerId })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.ownerUserId !== lecturer.userId) {
    return { error: "Kelas tidak ditemukan atau bukan milik Anda" };
  }

  let fileObjectKey: string | null = null;
  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    const saved = await savePrivateFile(file, `mat_${classId.slice(0, 6)}`);
    fileObjectKey = saved.fileObjectKey;
  }

  const newMaterialId = randomUUID();

  await db.insert(learningMaterials).values({
    id: newMaterialId,
    classId,
    meetingNumber: meetingNumber || 1,
    title: title.trim(),
    description: description?.trim() || null,
    externalUrl: externalUrl?.trim() || null,
    fileObjectKey,
    createdBy: lecturer.userId,
    publishedAt: new Date(),
  });

  await db.insert(auditLogs).values({
    id: randomUUID(),
    actorUserId: lecturer.userId,
    entityType: "learning_materials",
    entityId: newMaterialId,
    action: "create_material",
    afterData: { title, meetingNumber, classId },
  });

  revalidatePath(`/materials?classId=${classId}`);
  revalidatePath(`/materials`);
  revalidatePath(`/classes/${classId}`);
  return { success: true, materialId: newMaterialId };
}

export async function deleteMaterial(materialId: string) {
  const lecturer = await requireLecturer();

  const [mat] = await db
    .select({
      id: learningMaterials.id,
      classId: learningMaterials.classId,
      ownerUserId: courses.lecturerId,
    })
    .from(learningMaterials)
    .innerJoin(classes, eq(learningMaterials.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(learningMaterials.id, materialId))
    .limit(1);

  if (!mat || mat.ownerUserId !== lecturer.userId) {
    return { error: "Materi tidak ditemukan atau bukan wewenang Anda" };
  }

  await db
    .delete(learningMaterials)
    .where(eq(learningMaterials.id, materialId));

  revalidatePath(`/materials?classId=${mat.classId}`);
  revalidatePath(`/materials`);
  return { success: true };
}
