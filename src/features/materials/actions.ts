"use server";

import { db } from "@/server/db";
import {
  learningMaterials,
  classes,
  courses,
  enrollments,
  auditLogs,
} from "@/server/db/schema";
import { requireLecturer, requireUser } from "@/server/auth/session";
import { eq, and, asc } from "drizzle-orm";
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

export async function getClassMaterials(classId: string) {
  const user = await requireUser();

  // Verify access
  if (user.role === "lecturer") {
    const [cls] = await db
      .select({ ownerUserId: courses.ownerUserId })
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
          eq(enrollments.studentUserId, user.userId),
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
    .select({ ownerUserId: courses.ownerUserId })
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
  revalidatePath(`/classes/${classId}`);
  return { success: true, materialId: newMaterialId };
}

export async function deleteMaterial(materialId: string) {
  const lecturer = await requireLecturer();

  const [mat] = await db
    .select({
      id: learningMaterials.id,
      classId: learningMaterials.classId,
      ownerUserId: courses.ownerUserId,
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
  return { success: true };
}
