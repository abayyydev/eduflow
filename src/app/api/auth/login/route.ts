import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession } from "@/server/auth/session";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Email atau kata sandi tidak sesuai" },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Email atau kata sandi tidak sesuai" },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Create secure HTTP-only session cookie
    await createSession({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const redirectUrl = user.role === "lecturer" ? "/dashboard" : "/student/dashboard";

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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
