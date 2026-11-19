"use server";

import { db } from "@/server/db";
import { enrollments, users, studentProfiles, classes, courses } from "@/server/db/schema";
import { requireLecturer } from "@/server/auth/session";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function getClassEnrolledStudents(classId: string) {
  const lecturer = await requireLecturer();

  // Verify class ownership
  const [cls] = await db
    .select({ ownerUserId: courses.ownerUserId })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.ownerUserId !== lecturer.userId) {
    throw new Error("FORBIDDEN_NOT_CLASS_OWNER");
  }

  return db
    .select({
      enrollmentId: enrollments.id,
      enrollmentStatus: enrollments.enrollmentStatus,
      enrolledAt: enrollments.enrolledAt,
      studentUserId: users.id,
      name: users.name,
      email: users.email,
      studentNumber: studentProfiles.studentNumber,
      studyProgram: studentProfiles.studyProgram,
      cohort: studentProfiles.cohort,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.studentUserId, users.id))
    .innerJoin(studentProfiles, eq(users.id, studentProfiles.userId))
    .where(
      and(
        eq(enrollments.classId, classId),
        eq(enrollments.enrollmentStatus, "active")
      )
    )
    .orderBy(studentProfiles.studentNumber);
}

export async function getAvailableStudentsForClass(classId: string) {
  await requireLecturer();

  // Find enrolled student IDs
  const enrolledList = await db
    .select({ studentUserId: enrollments.studentUserId })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.classId, classId),
        eq(enrollments.enrollmentStatus, "active")
      )
    );

  const enrolledIds = new Set(enrolledList.map((e) => e.studentUserId));

  // Get all active students
  const allStudents = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      studentNumber: studentProfiles.studentNumber,
      studyProgram: studentProfiles.studyProgram,
    })
    .from(users)
    .innerJoin(studentProfiles, eq(users.id, studentProfiles.userId))
    .where(eq(users.role, "student"))
    .orderBy(studentProfiles.studentNumber);

  return allStudents.filter((s) => !enrolledIds.has(s.id));
}

export async function enrollStudentToClass(classId: string, studentUserId: string) {
  const lecturer = await requireLecturer();

  // Verify class ownership
  const [cls] = await db
    .select({ ownerUserId: courses.ownerUserId })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.ownerUserId !== lecturer.userId) {
    return { error: "Kelas tidak ditemukan atau bukan milik Anda." };
  }

  // Check if already enrolled
  const [existing] = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.classId, classId),
        eq(enrollments.studentUserId, studentUserId)
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
      studentUserId,
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
    .select({ ownerUserId: courses.ownerUserId })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.ownerUserId !== lecturer.userId) {
    return { error: "Akses ditolak." };
  }

  await db
    .update(enrollments)
    .set({ enrollmentStatus: "dropped" })
    .where(
      and(
        eq(enrollments.classId, classId),
        eq(enrollments.studentUserId, studentUserId)
      )
    );

  revalidatePath(`/classes/${classId}`);
  revalidatePath("/classes");
  return { success: true };
}
