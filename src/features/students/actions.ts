"use server";

import { db } from "@/server/db";
import { students, enrollments } from "@/server/db/schema";
import { requireLecturer } from "@/server/auth/session";
import { hashPassword } from "@/server/auth/session";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";

const createStudentSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(150),
  email: z.string().email("Format email tidak valid").max(190),
  studentNumber: z.string().min(3, "NIM minimal 3 karakter").max(50),
  studyProgram: z.string().max(150).optional(),
  cohort: z.string().max(30).optional(),
  phone: z.string().max(30).optional(),
});

export async function getAllStudents(searchQuery?: string) {
  await requireLecturer();

  const baseQuery = db
    .select({
      id: students.id,
      name: students.name,
      email: students.email,
      isActive: students.isActive,
      studentNumber: students.studentNumber,
      studyProgram: students.studyProgram,
      cohort: students.cohort,
      phone: students.phone,
      enrolledClassesCount: sql<number>`count(distinct ${enrollments.classId})`,
    })
    .from(students)
    .leftJoin(
      enrollments,
      and(
        eq(enrollments.studentId, students.id),
        eq(enrollments.enrollmentStatus, "active")
      )
    )
    .groupBy(students.id)
    .orderBy(students.studentNumber);

  const results = await baseQuery;

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    return results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentNumber.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }

  return results;
}

export async function createStudent(formData: FormData) {
  await requireLecturer();

  const validated = createStudentSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    studentNumber: formData.get("studentNumber"),
    studyProgram: formData.get("studyProgram") || undefined,
    cohort: formData.get("cohort") || undefined,
    phone: formData.get("phone") || undefined,
  });

  if (!validated.success) {
    return {
      error: "Validasi gagal: " + Object.values(validated.error.flatten().fieldErrors).flat().join(", "),
    };
  }

  const { name, email, studentNumber, studyProgram, cohort, phone } = validated.data;

  // Check email uniqueness in students table
  const [existingEmail] = await db
    .select()
    .from(students)
    .where(eq(students.email, email.toLowerCase().trim()))
    .limit(1);

  if (existingEmail) {
    return { error: "Email sudah terdaftar dalam sistem." };
  }

  // Check student number uniqueness in students table
  const [existingNim] = await db
    .select()
    .from(students)
    .where(eq(students.studentNumber, studentNumber.trim()))
    .limit(1);

  if (existingNim) {
    return { error: "NIM sudah terdaftar dalam sistem." };
  }

  const newStudentId = randomUUID();
  const defaultPasswordHash = await hashPassword("password123");

  await db.insert(students).values({
    id: newStudentId,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: defaultPasswordHash,
    studentNumber: studentNumber.trim(),
    studyProgram: studyProgram?.trim() || "Teknik Informatika",
    cohort: cohort?.trim() || "2024",
    phone: phone?.trim() || null,
    isActive: true,
  });

  revalidatePath("/students");
  return { success: true, studentId: newStudentId };
}
