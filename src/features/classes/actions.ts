"use server";

import { db } from "@/server/db";
import {
  classes,
  courses,
  academicTerms,
  enrollments,
  gradingCategories,
  gradeScales,
  auditLogs,
} from "@/server/db/schema";
import { requireLecturer, requireUser } from "@/server/auth/session";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";

// Create Course Schema
const createCourseSchema = z.object({
  code: z.string().min(2, "Kode mata kuliah minimal 2 karakter").max(30),
  name: z.string().min(3, "Nama mata kuliah minimal 3 karakter").max(180),
  description: z.string().optional(),
  creditUnits: z.coerce.number().min(1).max(12).optional(),
});

// Create Class Schema
const createClassSchema = z.object({
  courseId: z.string().min(1, "Mata kuliah wajib dipilih"),
  academicTermId: z.string().min(1, "Semester wajib dipilih"),
  classCode: z.string().min(1, "Kode kelas wajib diisi (misal: A, B, Reg-1)").max(30),
  scheduleText: z.string().max(180).optional(),
});

export async function getActiveAcademicTerm() {
  const [activeTerm] = await db
    .select()
    .from(academicTerms)
    .where(eq(academicTerms.isActive, true))
    .limit(1);

  if (!activeTerm) {
    const [anyTerm] = await db.select().from(academicTerms).limit(1);
    return anyTerm || null;
  }
  return activeTerm;
}

export async function getAllAcademicTerms() {
  return db.select().from(academicTerms).orderBy(desc(academicTerms.startsOn));
}

export async function getLecturerCourses() {
  const lecturer = await requireLecturer();
  return db
    .select()
    .from(courses)
    .where(
      and(
        eq(courses.ownerUserId, lecturer.userId),
        isNull(courses.archivedAt)
      )
    )
    .orderBy(courses.code);
}

export async function createCourse(formData: FormData) {
  const lecturer = await requireLecturer();

  const validated = createCourseSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    creditUnits: formData.get("creditUnits") || undefined,
  });

  if (!validated.success) {
    return {
      error: "Validasi gagal: " + Object.values(validated.error.flatten().fieldErrors).flat().join(", "),
    };
  }

  const { code, name, description, creditUnits } = validated.data;
  const newCourseId = randomUUID();

  await db.insert(courses).values({
    id: newCourseId,
    code: code.toUpperCase().trim(),
    name: name.trim(),
    description: description?.trim() || null,
    creditUnits: creditUnits || 3,
    ownerUserId: lecturer.userId,
  });

  revalidatePath("/classes");
  return { success: true, courseId: newCourseId };
}

export async function getLecturerClasses(statusFilter: "active" | "archived" = "active") {
  const lecturer = await requireLecturer();

  const result = await db
    .select({
      id: classes.id,
      classCode: classes.classCode,
      displayName: classes.displayName,
      scheduleText: classes.scheduleText,
      status: classes.status,
      gradingLockedAt: classes.gradingLockedAt,
      gradesPublishedAt: classes.gradesPublishedAt,
      courseId: courses.id,
      courseCode: courses.code,
      courseName: courses.name,
      creditUnits: courses.creditUnits,
      termId: academicTerms.id,
      termName: academicTerms.name,
      studentCount: sql<number>`count(distinct ${enrollments.studentUserId})`,
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
        eq(courses.ownerUserId, lecturer.userId),
        eq(classes.status, statusFilter)
      )
    )
    .groupBy(classes.id, courses.id, academicTerms.id)
    .orderBy(courses.code, classes.classCode);

  return result;
}

export async function getClassDetail(classId: string) {
  const user = await requireUser();

  const [classData] = await db
    .select({
      id: classes.id,
      classCode: classes.classCode,
      displayName: classes.displayName,
      scheduleText: classes.scheduleText,
      status: classes.status,
      gradingLockedAt: classes.gradingLockedAt,
      gradesPublishedAt: classes.gradesPublishedAt,
      courseId: courses.id,
      courseCode: courses.code,
      courseName: courses.name,
      courseDescription: courses.description,
      creditUnits: courses.creditUnits,
      ownerUserId: courses.ownerUserId,
      termId: academicTerms.id,
      termName: academicTerms.name,
    })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!classData) return null;

  // Multi-user authorization check
  if (user.role === "lecturer") {
    if (classData.ownerUserId !== user.userId) {
      throw new Error("FORBIDDEN_NOT_CLASS_OWNER");
    }
  } else {
    // For student: check if enrolled
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

  return classData;
}

export async function createClass(formData: FormData) {
  const lecturer = await requireLecturer();

  const validated = createClassSchema.safeParse({
    courseId: formData.get("courseId"),
    academicTermId: formData.get("academicTermId"),
    classCode: formData.get("classCode"),
    scheduleText: formData.get("scheduleText") || undefined,
  });

  if (!validated.success) {
    return {
      error: "Validasi gagal: " + Object.values(validated.error.flatten().fieldErrors).flat().join(", "),
    };
  }

  const { courseId, academicTermId, classCode, scheduleText } = validated.data;

  // Verify course belongs to lecturer
  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, courseId), eq(courses.ownerUserId, lecturer.userId)))
    .limit(1);

  if (!course) {
    return { error: "Mata kuliah tidak valid atau bukan milik Anda" };
  }

  // Check unique (course_id, academic_term_id, class_code)
  const [existing] = await db
    .select()
    .from(classes)
    .where(
      and(
        eq(classes.courseId, courseId),
        eq(classes.academicTermId, academicTermId),
        eq(classes.classCode, classCode.toUpperCase().trim())
      )
    )
    .limit(1);

  if (existing) {
    return { error: `Kelas dengan kode '${classCode.toUpperCase().trim()}' sudah ada untuk mata kuliah ini di semester tersebut.` };
  }

  const newClassId = randomUUID();
  const displayName = `${course.name} - Kelas ${classCode.toUpperCase().trim()}`;

  await db.insert(classes).values({
    id: newClassId,
    courseId,
    academicTermId,
    classCode: classCode.toUpperCase().trim(),
    displayName,
    scheduleText: scheduleText?.trim() || null,
    status: "active",
  });

  // Automatically initialize default grading categories & scales for this class
  // Standard categories: Presensi (10%), Tugas (20%), Kuis (15%), Praktikum (15%), UTS (20%), UAS (20%) = 100%
  await db.insert(gradingCategories).values([
    { id: randomUUID(), classId: newClassId, name: "Presensi", weightPercent: "10.00", aggregationMethod: "average", isRequired: true, sortOrder: 1 },
    { id: randomUUID(), classId: newClassId, name: "Tugas", weightPercent: "20.00", aggregationMethod: "average", isRequired: true, sortOrder: 2 },
    { id: randomUUID(), classId: newClassId, name: "Kuis", weightPercent: "15.00", aggregationMethod: "average", isRequired: false, sortOrder: 3 },
    { id: randomUUID(), classId: newClassId, name: "Praktikum", weightPercent: "15.00", aggregationMethod: "average", isRequired: false, sortOrder: 4 },
    { id: randomUUID(), classId: newClassId, name: "UTS", weightPercent: "20.00", aggregationMethod: "average", isRequired: true, sortOrder: 5 },
    { id: randomUUID(), classId: newClassId, name: "UAS", weightPercent: "20.00", aggregationMethod: "average", isRequired: true, sortOrder: 6 },
  ]);

  // Standard grade scales
  await db.insert(gradeScales).values([
    { id: randomUUID(), classId: newClassId, letterGrade: "A", minScore: "85.00", maxScore: "100.00", gradePoint: "4.00" },
    { id: randomUUID(), classId: newClassId, letterGrade: "A-", minScore: "80.00", maxScore: "84.99", gradePoint: "3.70" },
    { id: randomUUID(), classId: newClassId, letterGrade: "B+", minScore: "75.00", maxScore: "79.99", gradePoint: "3.30" },
    { id: randomUUID(), classId: newClassId, letterGrade: "B", minScore: "70.00", maxScore: "74.99", gradePoint: "3.00" },
    { id: randomUUID(), classId: newClassId, letterGrade: "B-", minScore: "65.00", maxScore: "69.99", gradePoint: "2.70" },
    { id: randomUUID(), classId: newClassId, letterGrade: "C+", minScore: "60.00", maxScore: "64.99", gradePoint: "2.30" },
    { id: randomUUID(), classId: newClassId, letterGrade: "C", minScore: "55.00", maxScore: "59.99", gradePoint: "2.00" },
    { id: randomUUID(), classId: newClassId, letterGrade: "D", minScore: "40.00", maxScore: "54.99", gradePoint: "1.00" },
    { id: randomUUID(), classId: newClassId, letterGrade: "E", minScore: "0.00", maxScore: "39.99", gradePoint: "0.00" },
  ]);

  // Audit log
  await db.insert(auditLogs).values({
    id: randomUUID(),
    actorUserId: lecturer.userId,
    entityType: "classes",
    entityId: newClassId,
    action: "create_class",
    afterData: { displayName, classCode, courseId, academicTermId },
  });

  revalidatePath("/classes");
  return { success: true, classId: newClassId };
}

export async function archiveClass(classId: string) {
  const lecturer = await requireLecturer();

  const classData = await getClassDetail(classId);
  if (!classData || classData.ownerUserId !== lecturer.userId) {
    return { error: "Kelas tidak ditemukan atau tidak memiliki akses" };
  }

  await db
    .update(classes)
    .set({ status: "archived" })
    .where(eq(classes.id, classId));

  await db.insert(auditLogs).values({
    id: randomUUID(),
    actorUserId: lecturer.userId,
    entityType: "classes",
    entityId: classId,
    action: "archive_class",
    beforeData: { status: "active" },
    afterData: { status: "archived" },
  });

  revalidatePath("/classes");
  return { success: true };
}
