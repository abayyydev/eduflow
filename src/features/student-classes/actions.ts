"use server";

import { db } from "@/server/db";
import {
  classes,
  courses,
  academicTerms,
  enrollments,
  lecturers,
  learningMaterials,
  assignments,
} from "@/server/db/schema";
import { requireStudent } from "@/server/auth/session";
import { eq, and, desc } from "drizzle-orm";

export async function getStudentEnrolledClasses() {
  const student = await requireStudent();

  return db
    .select({
      enrollmentId: enrollments.id,
      classId: classes.id,
      displayName: classes.displayName,
      classCode: classes.classCode,
      scheduleText: classes.scheduleText,
      courseCode: courses.code,
      courseName: courses.name,
      creditUnits: courses.creditUnits,
      termName: academicTerms.name,
      lecturerName: lecturers.name,
    })
    .from(enrollments)
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
    .innerJoin(lecturers, eq(courses.lecturerId, lecturers.id))
    .where(
      and(
        eq(enrollments.studentId, student.userId),
        eq(enrollments.enrollmentStatus, "active"),
        eq(classes.status, "active")
      )
    )
    .orderBy(courses.code);
}

export async function getStudentClassDetail(classId: string) {
  const student = await requireStudent();

  // 1. Verify enrollment in class
  const [enrollment] = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.classId, classId),
        eq(enrollments.studentId, student.userId),
        eq(enrollments.enrollmentStatus, "active")
      )
    )
    .limit(1);

  if (!enrollment) {
    throw new Error("FORBIDDEN_NOT_ENROLLED");
  }

  // 2. Fetch class data
  const [classData] = await db
    .select({
      id: classes.id,
      displayName: classes.displayName,
      classCode: classes.classCode,
      scheduleText: classes.scheduleText,
      courseCode: courses.code,
      courseName: courses.name,
      courseDescription: courses.description,
      creditUnits: courses.creditUnits,
      termName: academicTerms.name,
      lecturerName: lecturers.name,
      lecturerEmail: lecturers.email,
    })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
    .innerJoin(lecturers, eq(courses.lecturerId, lecturers.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!classData) return null;

  // 3. Fetch materials for this class
  const materials = await db
    .select()
    .from(learningMaterials)
    .where(eq(learningMaterials.classId, classId))
    .orderBy(learningMaterials.meetingNumber);

  // 4. Fetch assignments for this class
  const classAssignments = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      instructions: assignments.instructions,
      dueAt: assignments.dueAt,
      submissionMode: assignments.submissionMode,
      maxScore: assignments.maxScore,
    })
    .from(assignments)
    .where(
      and(
        eq(assignments.classId, classId),
        eq(assignments.status, "published")
      )
    )
    .orderBy(desc(assignments.dueAt));

  return {
    classData,
    materials,
    assignments: classAssignments,
  };
}
