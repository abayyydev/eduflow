import { describe, it, expect, beforeAll } from "vitest";
import { db } from "../src/server/db";
import { users, courses, classes, enrollments } from "../src/server/db/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../src/server/auth/session";

describe("Academic Structure & Multi-User Isolation Tests", () => {
  let lecturerUser: any;
  let enrolledStudent: any;
  let nonEnrolledStudent: any;
  let testClass1: any;
  let testClass2: any;

  beforeAll(async () => {
    // 1. Fetch lecturer
    const [lecturer] = await db
      .select()
      .from(users)
      .where(eq(users.role, "lecturer"))
      .limit(1);
    lecturerUser = lecturer;

    // 2. Fetch ASD Class A (enrolled for first 12 students)
    const [c1] = await db
      .select()
      .from(classes)
      .where(eq(classes.displayName, "Algoritma dan Struktur Data - Kelas A"))
      .limit(1);
    testClass1 = c1;

    // 3. Fetch ASD Class B (enrolled for students 13-20)
    const [c2] = await db
      .select()
      .from(classes)
      .where(eq(classes.displayName, "Algoritma dan Struktur Data - Kelas B"))
      .limit(1);
    testClass2 = c2;

    // 4. Fetch mhs1 (enrolled in Class 1)
    const [m1] = await db
      .select()
      .from(users)
      .where(eq(users.email, "mhs1@eduflow.test"))
      .limit(1);
    enrolledStudent = m1;

    // 5. Fetch mhs15 (enrolled in Class 2, NOT in Class 1)
    const [m15] = await db
      .select()
      .from(users)
      .where(eq(users.email, "mhs15@eduflow.test"))
      .limit(1);
    nonEnrolledStudent = m15;
  });

  it("verifies strong password hashing and secure verification", async () => {
    const plain = "mypassword123";
    const hashed = await hashPassword(plain);
    expect(hashed).not.toBe(plain);
    expect(hashed.length).toBeGreaterThan(20);

    const matches = await verifyPassword(plain, hashed);
    expect(matches).toBe(true);

    const invalidMatches = await verifyPassword("wrongpass", hashed);
    expect(invalidMatches).toBe(false);
  });

  it("ensures student A is enrolled in Class 1", async () => {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.classId, testClass1.id),
          eq(enrollments.studentUserId, enrolledStudent.id),
          eq(enrollments.enrollmentStatus, "active")
        )
      );

    expect(enrollment).toBeDefined();
    expect(enrollment.studentUserId).toBe(enrolledStudent.id);
  });

  it("ensures student B is NOT enrolled in Class 1 (Multi-User Isolation)", async () => {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.classId, testClass1.id),
          eq(enrollments.studentUserId, nonEnrolledStudent.id),
          eq(enrollments.enrollmentStatus, "active")
        )
      );

    expect(enrollment).toBeUndefined();
  });

  it("verifies lecturer course ownership relationship", async () => {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.ownerUserId, lecturerUser.id))
      .limit(1);

    expect(course).toBeDefined();
    expect(course.ownerUserId).toBe(lecturerUser.id);
  });
});
