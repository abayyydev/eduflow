import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { users, lecturers, students } from "@/server/db/schema";
import { eq, or } from "drizzle-orm";
import { verifyPassword, createSession, type SessionUser } from "@/server/auth/session";

const loginSchema = z.object({
  identifier: z.string().min(1, "NIM atau Email wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawIdentifier = body.identifier || body.email;
    const parsed = loginSchema.safeParse({
      identifier: rawIdentifier,
      password: body.password,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { identifier, password } = parsed.data;
    const cleanId = identifier.trim().toLowerCase();

    let authenticatedUser: SessionUser | null = null;
    let redirectUrl = "/dashboard";

    // 1. Check in students table first (NIM or Email)
    const [student] = await db
      .select()
      .from(students)
      .where(
        or(
          eq(students.studentNumber, identifier.trim()),
          eq(students.email, cleanId)
        )
      )
      .limit(1);

    if (student && student.isActive) {
      const isValid = await verifyPassword(password, student.passwordHash);
      if (isValid) {
        await db
          .update(students)
          .set({ lastLoginAt: new Date() })
          .where(eq(students.id, student.id));

        authenticatedUser = {
          userId: student.id,
          name: student.name,
          email: student.email,
          role: "student",
        };
        redirectUrl = "/student/dashboard";
      }
    }

    // 2. Check in lecturers table (Email or NIP)
    if (!authenticatedUser) {
      const [lecturer] = await db
        .select()
        .from(lecturers)
        .where(
          or(
            eq(lecturers.email, cleanId),
            eq(lecturers.nip, identifier.trim())
          )
        )
        .limit(1);

      if (lecturer && lecturer.isActive) {
        const isValid = await verifyPassword(password, lecturer.passwordHash);
        if (isValid) {
          await db
            .update(lecturers)
            .set({ lastLoginAt: new Date() })
            .where(eq(lecturers.id, lecturer.id));

          authenticatedUser = {
            userId: lecturer.id,
            name: lecturer.name,
            email: lecturer.email,
            role: "lecturer",
          };
          redirectUrl = "/dashboard";
        }
      }
    }

    // 3. Check in users table (superadmin / admin)
    if (!authenticatedUser) {
      const [adminUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, cleanId))
        .limit(1);

      if (adminUser && adminUser.isActive) {
        const isValid = await verifyPassword(password, adminUser.passwordHash);
        if (isValid) {
          await db
            .update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, adminUser.id));

          authenticatedUser = {
            userId: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
          };
          redirectUrl = "/dashboard";
        }
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { error: "NIM / Email atau kata sandi tidak sesuai" },
        { status: 401 }
      );
    }

    // Create secure HTTP-only session cookie
    await createSession(authenticatedUser);

    return NextResponse.json({
      success: true,
      user: {
        id: authenticatedUser.userId,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        role: authenticatedUser.role,
      },
      redirectUrl,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server" },
      { status: 500 }
    );
  }
}
