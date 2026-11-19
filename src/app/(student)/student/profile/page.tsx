import { requireStudent } from "@/server/auth/session";
import { db } from "@/server/db";
import { students, enrollments, classes, courses } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { StudentProfileClient } from "./StudentProfileClient";

export default async function StudentProfilePage() {
  const user = await requireStudent();

  const [profile] = await db
    .select()
    .from(students)
    .where(eq(students.id, user.userId))
    .limit(1);

  const enrolledClasses = await db
    .select({
      id: classes.id,
      displayName: classes.displayName,
      classCode: classes.classCode,
      courseCode: courses.code,
      courseName: courses.name,
      creditUnits: courses.creditUnits,
    })
    .from(enrollments)
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(
      and(
        eq(enrollments.studentId, user.userId),
        eq(enrollments.enrollmentStatus, "active")
      )
    );

  if (!profile) {
    return (
      <div className="p-8 text-center text-sm text-[#667085]">
        Data profil mahasiswa tidak ditemukan.
      </div>
    );
  }

  return (
    <StudentProfileClient
      student={{
        id: profile.id,
        name: profile.name,
        email: profile.email,
        studentNumber: profile.studentNumber,
        studyProgram: profile.studyProgram,
        cohort: profile.cohort,
        phone: profile.phone,
      }}
      enrolledClasses={enrolledClasses}
    />
  );
}
