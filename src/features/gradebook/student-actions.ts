"use server";

import { db } from "@/server/db";
import {
  classes,
  courses,
  academicTerms,
  enrollments,
  gradingCategories,
  assessmentItems,
  grades,
  gradeScales,
  users,
} from "@/server/db/schema";
import { requireStudent } from "@/server/auth/session";
import { eq, and, sql, desc, asc } from "drizzle-orm";
import {
  calculateFinalGrade,
  type CategoryConfig,
  type GradeItemInput,
  type GradeScaleConfig,
  type FinalGradeResult,
} from "./engine";

export interface StudentClassGradeSummary {
  classId: string;
  className: string;
  courseCode: string;
  courseName: string;
  creditUnits: number | null;
  termName: string;
  lecturerName: string;
  isPublished: boolean;
  publishedAt: Date | null;
  calculation: FinalGradeResult | null;
  items: Array<{
    itemId: string;
    itemTitle: string;
    categoryName: string;
    maxScore: number;
    score: number | null;
    feedback: string | null;
  }>;
}

export async function getStudentGradesOverview(): Promise<StudentClassGradeSummary[]> {
  const student = await requireStudent();

  // 1. Get active enrolled classes
  const enrolledClasses = await db
    .select({
      classId: classes.id,
      className: classes.displayName,
      gradesPublishedAt: classes.gradesPublishedAt,
      courseCode: courses.code,
      courseName: courses.name,
      creditUnits: courses.creditUnits,
      termName: academicTerms.name,
      lecturerName: users.name,
    })
    .from(enrollments)
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
    .innerJoin(users, eq(courses.ownerUserId, users.id))
    .where(
      and(
        eq(enrollments.studentUserId, student.userId),
        eq(enrollments.enrollmentStatus, "active"),
        eq(classes.status, "active")
      )
    )
    .orderBy(courses.code);

  const results: StudentClassGradeSummary[] = [];

  for (const cls of enrolledClasses) {
    const isPublished = cls.gradesPublishedAt !== null;

    // Fetch categories
    const catList = await db
      .select()
      .from(gradingCategories)
      .where(eq(gradingCategories.classId, cls.classId))
      .orderBy(asc(gradingCategories.sortOrder));

    const catIds = catList.map((c) => c.id);

    // Fetch items
    const itemList =
      catIds.length > 0
        ? await db
            .select()
            .from(assessmentItems)
            .where(
              sql`${assessmentItems.categoryId} IN (${sql.join(
                catIds.map((id) => sql`${id}`),
                sql`, `
              )})`
            )
        : [];

    const itemIds = itemList.map((i) => i.id);

    // Fetch this student's grades
    const studentGrades =
      itemIds.length > 0
        ? await db
            .select()
            .from(grades)
            .where(
              and(
                eq(grades.studentUserId, student.userId),
                sql`${grades.assessmentItemId} IN (${sql.join(
                  itemIds.map((id) => sql`${id}`),
                  sql`, `
                )})`
              )
            )
        : [];

    const gradesMap = new Map(studentGrades.map((g) => [g.assessmentItemId, g]));
    const catMap = new Map(catList.map((c) => [c.id, c.name]));

    // Fetch scales
    const scalesList = await db
      .select()
      .from(gradeScales)
      .where(eq(gradeScales.classId, cls.classId))
      .orderBy(desc(gradeScales.minScore));

    const scalesConfig: GradeScaleConfig[] = scalesList.map((s) => ({
      letterGrade: s.letterGrade,
      minScore: parseFloat(s.minScore),
      maxScore: parseFloat(s.maxScore),
      gradePoint: s.gradePoint ? parseFloat(s.gradePoint) : null,
    }));

    const categoriesConfig: CategoryConfig[] = catList.map((c) => ({
      categoryId: c.id,
      name: c.name,
      weightPercent: parseFloat(c.weightPercent),
      aggregationMethod: c.aggregationMethod,
    }));

    const engineItems: GradeItemInput[] = itemList.map((it) => {
      const g = gradesMap.get(it.id);
      return {
        itemId: it.id,
        categoryId: it.categoryId,
        score: g && g.score !== null ? parseFloat(g.score) : null,
        maxScore: parseFloat(it.maxScore),
      };
    });

    const calculation = isPublished
      ? calculateFinalGrade(categoriesConfig, engineItems, scalesConfig)
      : null;

    const itemsSummary = itemList.map((it) => {
      const g = gradesMap.get(it.id);
      return {
        itemId: it.id,
        itemTitle: it.title,
        categoryName: catMap.get(it.categoryId) || "Lainnya",
        maxScore: parseFloat(it.maxScore),
        score: g && g.score !== null ? parseFloat(g.score) : null,
        feedback: g?.feedback || null,
      };
    });

    results.push({
      classId: cls.classId,
      className: cls.className,
      courseCode: cls.courseCode,
      courseName: cls.courseName,
      creditUnits: cls.creditUnits,
      termName: cls.termName,
      lecturerName: cls.lecturerName,
      isPublished,
      publishedAt: cls.gradesPublishedAt,
      calculation,
      items: itemsSummary,
    });
  }

  return results;
}
