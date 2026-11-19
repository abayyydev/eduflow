"use server";

import { db } from "@/server/db";
import { students } from "@/server/db/schema";
import { requireStudent, verifyPassword, hashPassword } from "@/server/auth/session";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(150),
  phone: z.string().max(30).optional().nullable(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
  newPassword: z.string().min(6, "Kata sandi baru minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi kata sandi minimal 6 karakter"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Konfirmasi kata sandi tidak cocok",
  path: ["confirmPassword"],
});

export async function updateStudentProfile(data: { name: string; phone?: string | null }) {
  const session = await requireStudent();

  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Data profil tidak valid",
    };
  }

  try {
    await db
      .update(students)
      .set({
        name: parsed.data.name.trim(),
        phone: parsed.data.phone?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(students.id, session.userId));

    revalidatePath("/student/profile");
    return { success: true, message: "Profil berhasil diperbarui." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui profil";
    return { success: false, error: message };
  }
}

export async function changeStudentPassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const session = await requireStudent();

  const parsed = changePasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validasi gagal",
    };
  }

  try {
    const [student] = await db
      .select({ id: students.id, passwordHash: students.passwordHash })
      .from(students)
      .where(eq(students.id, session.userId))
      .limit(1);

    if (!student) {
      return { success: false, error: "Data mahasiswa tidak ditemukan." };
    }

    const isMatch = await verifyPassword(parsed.data.currentPassword, student.passwordHash);
    if (!isMatch) {
      return { success: false, error: "Kata sandi saat ini tidak tepat." };
    }

    const newHashed = await hashPassword(parsed.data.newPassword);
    await db
      .update(students)
      .set({
        passwordHash: newHashed,
        updatedAt: new Date(),
      })
      .where(eq(students.id, session.userId));

    revalidatePath("/student/profile");
    return { success: true, message: "Kata sandi berhasil diubah." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengubah kata sandi";
    return { success: false, error: message };
  }
}
