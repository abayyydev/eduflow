"use server";

import { db } from "@/server/db";
import {
  learningMaterials,
  materialProgress,
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

// -------------------------------------------------------------
// New Advanced Studio Actions (Curriculum Sections & Progress)
// -------------------------------------------------------------

export interface CurriculumMaterialItem {
  id: string;
  classId: string;
  meetingNumber: number | null;
  title: string;
  materialType: "article" | "pdf" | "video";
  sectionName: string;
  contentBody: string | null;
  externalUrl: string | null;
  fileObjectKey?: string | null;
  sortOrder: number;
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
  isCompleted?: boolean;
}

export interface CurriculumSection {
  sectionName: string;
  materials: CurriculumMaterialItem[];
}

export async function getClassCurriculum(classId: string) {
  const user = await requireUser();

  const [cls] = await db
    .select({
      id: classes.id,
      displayName: classes.displayName,
      classCode: classes.classCode,
      scheduleText: classes.scheduleText,
      courseCode: courses.code,
      courseName: courses.name,
      creditUnits: courses.creditUnits,
      termName: academicTerms.name,
      ownerUserId: courses.lecturerId,
    })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls) {
    throw new Error("Kelas tidak ditemukan");
  }

  const rawMaterials = await db
    .select()
    .from(learningMaterials)
    .where(eq(learningMaterials.classId, classId))
    .orderBy(asc(learningMaterials.sortOrder), asc(learningMaterials.createdAt));

  // Group materials by sectionName
  const sectionMap = new Map<string, CurriculumMaterialItem[]>();

  for (const m of rawMaterials) {
    const section = m.sectionName?.trim() || "MATERI 1: PERSIAPAN & PENDAHULUAN";
    if (!sectionMap.has(section)) {
      sectionMap.set(section, []);
    }
    sectionMap.get(section)!.push({
      id: m.id,
      classId: m.classId,
      meetingNumber: m.meetingNumber,
      title: m.title,
      materialType: (m.materialType as "article" | "pdf" | "video") || "article",
      sectionName: section,
      contentBody: m.contentBody,
      externalUrl: m.externalUrl,
      fileObjectKey: m.fileObjectKey,
      sortOrder: m.sortOrder,
      durationMinutes: m.durationMinutes,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    });
  }

  // Convert to array of sections
  const sections: CurriculumSection[] = Array.from(sectionMap.entries()).map(
    ([sectionName, materials]) => ({
      sectionName,
      materials,
    })
  );

  return {
    classInfo: cls,
    sections,
  };
}

export async function saveCurriculumMaterial(data: {
  id?: string;
  classId: string;
  sectionName: string;
  title: string;
  materialType: "article" | "pdf" | "video";
  contentBody?: string;
  externalUrl?: string;
  durationMinutes?: number;
}) {
  const lecturer = await requireLecturer();

  // Validate class
  const [cls] = await db
    .select({ ownerUserId: courses.lecturerId })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.id, data.classId))
    .limit(1);

  if (!cls || cls.ownerUserId !== lecturer.userId) {
    return { error: "Wewenang tidak valid untuk kelas ini" };
  }

  if (data.id) {
    // Update existing material
    await db
      .update(learningMaterials)
      .set({
        title: data.title.trim(),
        sectionName: data.sectionName.trim(),
        materialType: data.materialType,
        contentBody: data.contentBody ?? null,
        externalUrl: data.externalUrl?.trim() ?? null,
        durationMinutes: data.durationMinutes ?? 2,
        updatedAt: new Date(),
      })
      .where(eq(learningMaterials.id, data.id));

    revalidatePath(`/materials?classId=${data.classId}`);
    return { success: true, materialId: data.id };
  } else {
    // Count existing materials in section to set sortOrder
    const existing = await db
      .select({ count: sql<number>`count(*)` })
      .from(learningMaterials)
      .where(eq(learningMaterials.classId, data.classId));

    const newId = randomUUID();
    const sortOrder = (existing[0]?.count || 0) + 1;

    await db.insert(learningMaterials).values({
      id: newId,
      classId: data.classId,
      meetingNumber: 1,
      title: data.title.trim(),
      materialType: data.materialType,
      sectionName: data.sectionName.trim(),
      contentBody: data.contentBody ?? null,
      externalUrl: data.externalUrl?.trim() ?? null,
      sortOrder,
      durationMinutes: data.durationMinutes ?? 2,
      createdBy: lecturer.userId,
      publishedAt: new Date(),
    });

    revalidatePath(`/materials?classId=${data.classId}`);
    return { success: true, materialId: newId };
  }
}

export async function updateSectionName(
  classId: string,
  oldSectionName: string,
  newSectionName: string
) {
  const lecturer = await requireLecturer();

  const [cls] = await db
    .select({ ownerUserId: courses.lecturerId })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.ownerUserId !== lecturer.userId) {
    return { error: "Wewenang tidak valid" };
  }

  await db
    .update(learningMaterials)
    .set({ sectionName: newSectionName.trim() })
    .where(
      and(
        eq(learningMaterials.classId, classId),
        eq(learningMaterials.sectionName, oldSectionName.trim())
      )
    );

  revalidatePath(`/materials?classId=${classId}`);
  return { success: true };
}

export async function deleteSection(classId: string, sectionName: string) {
  const lecturer = await requireLecturer();

  const [cls] = await db
    .select({ ownerUserId: courses.lecturerId })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.ownerUserId !== lecturer.userId) {
    return { error: "Wewenang tidak valid" };
  }

  await db
    .delete(learningMaterials)
    .where(
      and(
        eq(learningMaterials.classId, classId),
        eq(learningMaterials.sectionName, sectionName.trim())
      )
    );

  revalidatePath(`/materials?classId=${classId}`);
  return { success: true };
}

// -------------------------------------------------------------
// Student Progress Tracking
// -------------------------------------------------------------

export async function getStudentCurriculumWithProgress(classId: string) {
  const student = await requireStudent();

  const [cls] = await db
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
    })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
    .innerJoin(lecturers, eq(courses.lecturerId, lecturers.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls) {
    throw new Error("Kelas tidak ditemukan");
  }

  const rawMaterials = await db
    .select()
    .from(learningMaterials)
    .where(eq(learningMaterials.classId, classId))
    .orderBy(asc(learningMaterials.sortOrder), asc(learningMaterials.createdAt));

  const progressRecords = await db
    .select()
    .from(materialProgress)
    .where(eq(materialProgress.studentId, student.userId));

  const completedSet = new Set(
    progressRecords.filter((p) => p.isCompleted).map((p) => p.materialId)
  );

  const sectionMap = new Map<string, CurriculumMaterialItem[]>();
  let totalMaterials = 0;
  let completedCount = 0;

  for (const m of rawMaterials) {
    totalMaterials++;
    const isCompleted = completedSet.has(m.id);
    if (isCompleted) completedCount++;

    const section = m.sectionName?.trim() || "MATERI 1: PERSIAPAN & PENDAHULUAN";
    if (!sectionMap.has(section)) {
      sectionMap.set(section, []);
    }
    sectionMap.get(section)!.push({
      id: m.id,
      classId: m.classId,
      meetingNumber: m.meetingNumber,
      title: m.title,
      materialType: (m.materialType as "article" | "pdf" | "video") || "article",
      sectionName: section,
      contentBody: m.contentBody,
      externalUrl: m.externalUrl,
      fileObjectKey: m.fileObjectKey,
      sortOrder: m.sortOrder,
      durationMinutes: m.durationMinutes,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      isCompleted,
    });
  }

  const progressPercentage =
    totalMaterials > 0 ? Math.round((completedCount / totalMaterials) * 100) : 0;

  const sections: CurriculumSection[] = Array.from(sectionMap.entries()).map(
    ([sectionName, materials]) => ({
      sectionName,
      materials,
    })
  );

  return {
    classInfo: cls,
    sections,
    progressPercentage,
    totalMaterials,
    completedCount,
  };
}

export async function toggleStudentMaterialProgress(
  materialId: string,
  isCompleted: boolean
) {
  const student = await requireStudent();

  const [existing] = await db
    .select()
    .from(materialProgress)
    .where(
      and(
        eq(materialProgress.studentId, student.userId),
        eq(materialProgress.materialId, materialId)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .update(materialProgress)
      .set({
        isCompleted,
        completedAt: new Date(),
      })
      .where(eq(materialProgress.id, existing.id));
  } else {
    await db.insert(materialProgress).values({
      id: randomUUID(),
      studentId: student.userId,
      materialId,
      isCompleted,
      completedAt: new Date(),
    });
  }

  return { success: true, isCompleted };
}
