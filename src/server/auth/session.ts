import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users, lecturers, students } from "../db/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "eduflow_session";
const SESSION_EXPIRY = "7d";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function getSecretKey(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ||
    "default-eduflow-insecure-secret-key-change-this-in-production-min32";
  return new TextEncoder().encode(secret);
}

export interface SessionUser {
  userId: string;
  name: string;
  email: string;
  role: "lecturer" | "student" | "admin" | "superadmin";
}

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function verifyPassword(
  plainText: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRY)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      userId: payload.userId as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as "lecturer" | "student" | "admin" | "superadmin",
    };
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await signSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  // Double check user still exists and is active in its respective table
  if (session.role === "lecturer") {
    const [lecturer] = await db
      .select({
        id: lecturers.id,
        name: lecturers.name,
        email: lecturers.email,
        isActive: lecturers.isActive,
      })
      .from(lecturers)
      .where(eq(lecturers.id, session.userId))
      .limit(1);

    if (!lecturer || !lecturer.isActive) return null;
    return {
      userId: lecturer.id,
      name: lecturer.name,
      email: lecturer.email,
      role: "lecturer",
    };
  } else if (session.role === "student") {
    const [student] = await db
      .select({
        id: students.id,
        name: students.name,
        email: students.email,
        isActive: students.isActive,
      })
      .from(students)
      .where(eq(students.id, session.userId))
      .limit(1);

    if (!student || !student.isActive) return null;
    return {
      userId: student.id,
      name: student.name,
      email: student.email,
      role: "student",
    };
  } else {
    const [admin] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!admin || !admin.isActive) return null;
    return {
      userId: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireLecturer(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "lecturer" && user.role !== "superadmin" && user.role !== "admin") {
    throw new Error("FORBIDDEN_NOT_LECTURER");
  }
  return user;
}

export async function requireStudent(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "student") {
    throw new Error("FORBIDDEN_NOT_STUDENT");
  }
  return user;
}
