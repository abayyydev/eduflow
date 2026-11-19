"use server";

import { db } from "@/server/db";
import {
  classes,
  courses,
  academicTerms,
  assignments,
  submissions,
} from "@/server/db/schema";
import { requireLecturer } from "@/server/auth/session";
import { eq, and, sql } from "drizzle-orm";
import { getClassGradebookData } from "@/features/gradebook/actions";
import { getClassAttendanceOverview } from "@/features/attendance/actions";

export interface ClassReportSummary {
  classId: string;
  className: string;
  classCode: string;
  courseCode: string;
  courseName: string;
  termName: string;
  isGradingLocked: boolean;
  isGradesPublished: boolean;
  totalStudents: number;
  totalAssignments: number;
  totalSubmissions: number;
  averageGrade: number | null;
  averageAttendancePercent: number;
  gradeDistribution: Record<string, number>; // e.g. { "A": 5, "B": 3, "C": 2, "D": 0, "E": 0, "Belum Lengkap": 2 }
}

export async function getReportsOverview(): Promise<ClassReportSummary[]> {
  const lecturer = await requireLecturer();

  // 1. Fetch all lecturer classes
  const lecturerClasses = await db
    .select({
      id: classes.id,
      displayName: classes.displayName,
      classCode: classes.classCode,
      courseCode: courses.code,
      courseName: courses.name,
      termName: academicTerms.name,
      gradingLockedAt: classes.gradingLockedAt,
      gradesPublishedAt: classes.gradesPublishedAt,
    })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
    .where(
      and(
        eq(courses.ownerUserId, lecturer.userId),
        eq(classes.status, "active")
      )
    );

  const results: ClassReportSummary[] = [];

  for (const cls of lecturerClasses) {
    // 2. Fetch gradebook data for calculation & grade distribution
    const gradebook = await getClassGradebookData(cls.id);
    const attendance = await getClassAttendanceOverview(cls.id);

    // 3. Count assignments & submissions
    const [assignmentCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(assignments)
      .where(eq(assignments.classId, cls.id));

    const [submissionCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(submissions)
      .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
      .where(eq(assignments.classId, cls.id));

    const distribution: Record<string, number> = {
      A: 0,
      "A-": 0,
      "B+": 0,
      B: 0,
      "B-": 0,
      "C+": 0,
      C: 0,
      D: 0,
      E: 0,
      "Belum Lengkap": 0,
    };

    if (gradebook) {
      for (const st of gradebook.students) {
        const letter = st.calculation?.letterGrade;
        if (letter && distribution[letter] !== undefined) {
          distribution[letter]++;
        } else if (letter) {
          distribution[letter] = (distribution[letter] || 0) + 1;
        } else {
          distribution["Belum Lengkap"]++;
        }
      }
    }

    results.push({
      classId: cls.id,
      className: cls.displayName,
      classCode: cls.classCode,
      courseCode: cls.courseCode,
      courseName: cls.courseName,
      termName: cls.termName,
      isGradingLocked: cls.gradingLockedAt !== null,
      isGradesPublished: cls.gradesPublishedAt !== null,
      totalStudents: gradebook ? gradebook.students.length : 0,
      totalAssignments: Number(assignmentCount?.count || 0),
      totalSubmissions: Number(submissionCount?.count || 0),
      averageGrade: gradebook?.classStats.averageScore ?? null,
      averageAttendancePercent: attendance?.averageAttendancePercent ?? 0,
      gradeDistribution: distribution,
    });
  }

  return results;
}
