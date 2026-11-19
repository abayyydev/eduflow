"use server";

import { db } from "@/server/db";
import { enrollments, students, classes, courses } from "@/server/db/schema";
import { requireLecturer } from "@/server/auth/session";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function getClassEnrolledStudents(classId: string) {
  const lecturer = await requireLecturer();

  // Verify class ownership
  const [cls] = await db
    .select({ lecturerId: courses.lecturerId })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.lecturerId !== lecturer.userId) {
    throw new Error("FORBIDDEN_NOT_CLASS_OWNER");
  }

  return db
    .select({
      enrollmentId: enrollments.id,
      enrollmentStatus: enrollments.enrollmentStatus,
      enrolledAt: enrollments.enrolledAt,
      studentUserId: students.id,
      name: students.name,
      email: students.email,
      studentNumber: students.studentNumber,
      studyProgram: students.studyProgram,
      cohort: students.cohort,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .where(
      and(
        eq(enrollments.classId, classId),
        eq(enrollments.enrollmentStatus, "active")
      )
    )
    .orderBy(students.studentNumber);
}

export async function getAvailableStudentsForClass(classId: string) {
  await requireLecturer();

  // Find enrolled student IDs
  const enrolledList = await db
    .select({ studentId: enrollments.studentId })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.classId, classId),
        eq(enrollments.enrollmentStatus, "active")
      )
    );

  const enrolledIds = new Set(enrolledList.map((e) => e.studentId));

  // Get all active students
  const allStudents = await db
    .select({
      id: students.id,
      name: students.name,
      email: students.email,
      studentNumber: students.studentNumber,
      studyProgram: students.studyProgram,
    })
    .from(students)
    .where(eq(students.isActive, true))
    .orderBy(students.studentNumber);

  return allStudents.filter((s) => !enrolledIds.has(s.id));
}

export async function enrollStudentToClass(classId: string, studentUserId: string) {
  const lecturer = await requireLecturer();

  // Verify class ownership
  const [cls] = await db
    .select({ lecturerId: courses.lecturerId })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.lecturerId !== lecturer.userId) {
    return { error: "Kelas tidak ditemukan atau bukan milik Anda." };
  }

  // Check if already enrolled
  const [existing] = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.classId, classId),
        eq(enrollments.studentId, studentUserId)
      )
    )
    .limit(1);

  if (existing) {
    if (existing.enrollmentStatus === "active") {
      return { error: "Mahasiswa sudah terdaftar di kelas ini." };
    }
    // Re-activate
    await db
      .update(enrollments)
      .set({ enrollmentStatus: "active" })
      .where(eq(enrollments.id, existing.id));
  } else {
    await db.insert(enrollments).values({
      id: randomUUID(),
      classId,
      studentId: studentUserId,
      enrollmentStatus: "active",
    });
  }

  revalidatePath(`/classes/${classId}`);
  revalidatePath("/classes");
  return { success: true };
}

export async function removeStudentFromClass(classId: string, studentUserId: string) {
  const lecturer = await requireLecturer();

  const [cls] = await db
    .select({ lecturerId: courses.lecturerId })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.lecturerId !== lecturer.userId) {
    return { error: "Akses ditolak." };
  }

  await db
    .update(enrollments)
    .set({ enrollmentStatus: "dropped" })
    .where(
      and(
        eq(enrollments.classId, classId),
        eq(enrollments.studentId, studentUserId)
      )
    );

  revalidatePath(`/classes/${classId}`);
  revalidatePath("/classes");
  return { success: true };
}
