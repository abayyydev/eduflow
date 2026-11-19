"use server";

import { db } from "@/server/db";
import { users, studentProfiles, enrollments } from "@/server/db/schema";
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
      id: users.id,
      name: users.name,
      email: users.email,
      isActive: users.isActive,
      studentNumber: studentProfiles.studentNumber,
      studyProgram: studentProfiles.studyProgram,
      cohort: studentProfiles.cohort,
      phone: studentProfiles.phone,
      enrolledClassesCount: sql<number>`count(distinct ${enrollments.classId})`,
    })
    .from(users)
    .innerJoin(studentProfiles, eq(users.id, studentProfiles.userId))
    .leftJoin(
      enrollments,
      and(
        eq(enrollments.studentUserId, users.id),
        eq(enrollments.enrollmentStatus, "active")
      )
    )
    .where(eq(users.role, "student"))
    .groupBy(users.id, studentProfiles.id)
    .orderBy(studentProfiles.studentNumber);

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

  // Check email uniqueness
  const [existingEmail] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);

  if (existingEmail) {
    return { error: "Email sudah terdaftar dalam sistem." };
  }

  // Check student number uniqueness
  const [existingNim] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.studentNumber, studentNumber.trim()))
    .limit(1);

  if (existingNim) {
    return { error: "NIM sudah terdaftar dalam sistem." };
  }

  const newUserId = randomUUID();
  const defaultPasswordHash = await hashPassword("password123");

  await db.insert(users).values({
    id: newUserId,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: defaultPasswordHash,
    role: "student",
    isActive: true,
  });

  await db.insert(studentProfiles).values({
    id: randomUUID(),
    userId: newUserId,
    studentNumber: studentNumber.trim(),
    studyProgram: studyProgram?.trim() || "Teknik Informatika",
    cohort: cohort?.trim() || "2024",
    phone: phone?.trim() || null,
  });

  revalidatePath("/students");
  return { success: true, studentId: newUserId };
}
