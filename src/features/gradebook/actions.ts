"use server";

import { db } from "@/server/db";
import {
  classes,
  courses,
  academicTerms,
  enrollments,
  users,
  studentProfiles,
  gradingCategories,
  assessmentItems,
  grades,
  gradeScales,
  auditLogs,
  notifications,
} from "@/server/db/schema";
import { requireLecturer } from "@/server/auth/session";
import { eq, and, sql, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import {
  calculateFinalGrade,
  type CategoryConfig,
  type GradeItemInput,
  type GradeScaleConfig,
  type FinalGradeResult,
} from "./engine";

export interface StudentGradeRow {
  studentUserId: string;
  studentNumber: string;
  name: string;
  itemScores: Record<string, { score: number | null; gradeId?: string }>;
  calculation: FinalGradeResult;
}

export interface GradebookData {
  classInfo: {
    id: string;
    displayName: string;
    classCode: string;
    courseCode: string;
    courseName: string;
    status: "active" | "archived";
    gradingLockedAt: Date | null;
    gradesPublishedAt: Date | null;
    termName: string;
  };
  categories: Array<{
    id: string;
    name: string;
    weightPercent: number;
    aggregationMethod: "average" | "sum_normalized" | "manual";
    items: Array<{
      id: string;
      title: string;
      maxScore: number;
      assessmentDate: string | null;
      isPublished: boolean;
    }>;
  }>;
  scales: GradeScaleConfig[];
  students: StudentGradeRow[];
  totalActiveWeight: number;
  classStats: {
    averageScore: number | null;
    highestScore: number | null;
    lowestScore: number | null;
    passingRatePercent: number;
  };
}

export async function getClassGradebookData(classId: string): Promise<GradebookData | null> {
  const lecturer = await requireLecturer();

  // 1. Verify class ownership
  const [cls] = await db
    .select({
      id: classes.id,
      displayName: classes.displayName,
      classCode: classes.classCode,
      status: classes.status,
      gradingLockedAt: classes.gradingLockedAt,
      gradesPublishedAt: classes.gradesPublishedAt,
      courseCode: courses.code,
      courseName: courses.name,
      ownerUserId: courses.ownerUserId,
      termName: academicTerms.name,
    })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.ownerUserId !== lecturer.userId) {
    throw new Error("FORBIDDEN_NOT_CLASS_OWNER");
  }

  // 2. Fetch categories and items
  const catList = await db
    .select()
    .from(gradingCategories)
    .where(eq(gradingCategories.classId, classId))
    .orderBy(asc(gradingCategories.sortOrder));

  const catIds = catList.map((c) => c.id);

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
          .orderBy(asc(assessmentItems.createdAt))
      : [];

  const itemsByCat = new Map<string, typeof itemList>();
  for (const item of itemList) {
    const list = itemsByCat.get(item.categoryId) || [];
    list.push(item);
    itemsByCat.set(item.categoryId, list);
  }

  const structuredCategories = catList.map((cat) => ({
    id: cat.id,
    name: cat.name,
    weightPercent: parseFloat(cat.weightPercent),
    aggregationMethod: cat.aggregationMethod,
    items: (itemsByCat.get(cat.id) || []).map((it) => ({
      id: it.id,
      title: it.title,
      maxScore: parseFloat(it.maxScore),
      assessmentDate: it.assessmentDate,
      isPublished: it.isPublished,
    })),
  }));

  // 3. Fetch grade scales
  const scalesList = await db
    .select()
    .from(gradeScales)
    .where(eq(gradeScales.classId, classId))
    .orderBy(desc(gradeScales.minScore));

  const structuredScales: GradeScaleConfig[] = scalesList.map((s) => ({
    letterGrade: s.letterGrade,
    minScore: parseFloat(s.minScore),
    maxScore: parseFloat(s.maxScore),
    gradePoint: s.gradePoint ? parseFloat(s.gradePoint) : null,
  }));

  // 4. Fetch enrolled students
  const enrolledStudents = await db
    .select({
      studentUserId: users.id,
      name: users.name,
      studentNumber: studentProfiles.studentNumber,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.studentUserId, users.id))
    .innerJoin(studentProfiles, eq(users.id, studentProfiles.userId))
    .where(
      and(
        eq(enrollments.classId, classId),
        eq(enrollments.enrollmentStatus, "active")
      )
    )
    .orderBy(asc(studentProfiles.studentNumber));

  // 5. Fetch all grades for this class's assessment items
  const allItemIds = itemList.map((it) => it.id);
  const gradesList =
    allItemIds.length > 0
      ? await db
          .select()
          .from(grades)
          .where(
            sql`${grades.assessmentItemId} IN (${sql.join(
              allItemIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          )
      : [];

  // Map grades by studentUserId:itemId
  const gradesMap = new Map<string, typeof gradesList[0]>();
  for (const g of gradesList) {
    gradesMap.set(`${g.studentUserId}:${g.assessmentItemId}`, g);
  }

  // 6. Calculate for each student
  const categoriesConfig: CategoryConfig[] = structuredCategories.map((c) => ({
    categoryId: c.id,
    name: c.name,
    weightPercent: c.weightPercent,
    aggregationMethod: c.aggregationMethod,
  }));

  const itemMaxScores = new Map(itemList.map((i) => [i.id, parseFloat(i.maxScore)]));

  const studentRows: StudentGradeRow[] = [];
  const finalScoresList: number[] = [];

  for (const st of enrolledStudents) {
    const itemScores: Record<string, { score: number | null; gradeId?: string }> = {};
    const engineItems: GradeItemInput[] = [];

    for (const item of itemList) {
      const gradeRecord = gradesMap.get(`${st.studentUserId}:${item.id}`);
      const scoreVal =
        gradeRecord && gradeRecord.score !== null ? parseFloat(gradeRecord.score) : null;

      itemScores[item.id] = {
        score: scoreVal,
        gradeId: gradeRecord?.id,
      };

      engineItems.push({
        itemId: item.id,
        categoryId: item.categoryId,
        score: scoreVal,
        maxScore: itemMaxScores.get(item.id) || 100,
      });
    }

    const calcResult = calculateFinalGrade(
      categoriesConfig,
      engineItems,
      structuredScales
    );

    if (calcResult.finalScore !== null) {
      finalScoresList.push(calcResult.finalScore);
    }

    studentRows.push({
      studentUserId: st.studentUserId,
      studentNumber: st.studentNumber,
      name: st.name,
      itemScores,
      calculation: calcResult,
    });
  }

  // 7. Calculate class statistics
  let averageScore: number | null = null;
  let highestScore: number | null = null;
  let lowestScore: number | null = null;
  let passingRatePercent = 0;

  if (finalScoresList.length > 0) {
    const sum = finalScoresList.reduce((acc, curr) => acc + curr, 0);
    averageScore = Math.round((sum / finalScoresList.length) * 100) / 100;
    highestScore = Math.max(...finalScoresList);
    lowestScore = Math.min(...finalScoresList);

    // Passing threshold typically >= 55 (C)
    const passed = finalScoresList.filter((s) => s >= 55).length;
    passingRatePercent = Math.round((passed / finalScoresList.length) * 100);
  }

  const totalActiveWeight = categoriesConfig.reduce(
    (acc, curr) => acc + curr.weightPercent,
    0
  );

  return {
    classInfo: {
      id: cls.id,
      displayName: cls.displayName,
      classCode: cls.classCode,
      courseCode: cls.courseCode,
      courseName: cls.courseName,
      status: cls.status,
      gradingLockedAt: cls.gradingLockedAt,
      gradesPublishedAt: cls.gradesPublishedAt,
      termName: cls.termName,
    },
    categories: structuredCategories,
    scales: structuredScales,
    students: studentRows,
    totalActiveWeight: Math.round(totalActiveWeight * 100) / 100,
    classStats: {
      averageScore,
      highestScore,
      lowestScore,
      passingRatePercent,
    },
  };
}

export async function updateGradeScore(
  classId: string,
  assessmentItemId: string,
  studentUserId: string,
  scoreInput: number | null
) {
  const lecturer = await requireLecturer();

  // 1. Verify class ownership and lock status
  const [cls] = await db
    .select({
      id: classes.id,
      gradingLockedAt: classes.gradingLockedAt,
      ownerUserId: courses.ownerUserId,
    })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.ownerUserId !== lecturer.userId) {
    return { error: "Kelas tidak ditemukan atau bukan wewenang Anda" };
  }

  if (cls.gradingLockedAt !== null) {
    return { error: "Nilai kelas ini telah dikunci. Buka kunci terlebih dahulu untuk mengedit nilai." };
  }

  // 2. Fetch item to validate max score
  const [item] = await db
    .select()
    .from(assessmentItems)
    .where(eq(assessmentItems.id, assessmentItemId))
    .limit(1);

  if (!item) {
    return { error: "Item penilaian tidak ditemukan" };
  }

  const maxScore = parseFloat(item.maxScore);

  if (scoreInput !== null) {
    if (isNaN(scoreInput) || scoreInput < 0 || scoreInput > maxScore) {
      return { error: `Nilai harus berada pada rentang 0 sampai ${maxScore}` };
    }
  }

  const scoreFormatted = scoreInput !== null ? scoreInput.toFixed(2) : null;

  // 3. Check existing grade
  const [existing] = await db
    .select()
    .from(grades)
    .where(
      and(
        eq(grades.assessmentItemId, assessmentItemId),
        eq(grades.studentUserId, studentUserId)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .update(grades)
      .set({
        score: scoreFormatted,
        gradedBy: lecturer.userId,
        gradedAt: scoreFormatted !== null ? new Date() : null,
      })
      .where(eq(grades.id, existing.id));

    // Audit log
    await db.insert(auditLogs).values({
      id: randomUUID(),
      actorUserId: lecturer.userId,
      entityType: "grades",
      entityId: existing.id,
      action: "update_grade",
      beforeData: { score: existing.score },
      afterData: { score: scoreFormatted },
    });
  } else {
    const newGradeId = randomUUID();
    await db.insert(grades).values({
      id: newGradeId,
      assessmentItemId,
      studentUserId,
      score: scoreFormatted,
      gradedBy: lecturer.userId,
      gradedAt: scoreFormatted !== null ? new Date() : null,
    });

    await db.insert(auditLogs).values({
      id: randomUUID(),
      actorUserId: lecturer.userId,
      entityType: "grades",
      entityId: newGradeId,
      action: "insert_grade",
      afterData: { score: scoreFormatted, assessmentItemId, studentUserId },
    });
  }

  revalidatePath(`/gradebook?classId=${classId}`);
  return { success: true };
}

export async function createAssessmentItem(
  classId: string,
  categoryId: string,
  title: string,
  maxScore: number = 100,
  assessmentDate?: string
) {
  const lecturer = await requireLecturer();

  // Verify class ownership & check lock
  const [cls] = await db
    .select({
      id: classes.id,
      gradingLockedAt: classes.gradingLockedAt,
      ownerUserId: courses.ownerUserId,
    })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.ownerUserId !== lecturer.userId) {
    return { error: "Akses ditolak" };
  }

  if (cls.gradingLockedAt !== null) {
    return { error: "Nilai kelas ini telah dikunci." };
  }

  if (!title || title.trim().length < 2) {
    return { error: "Judul item nilai minimal 2 karakter" };
  }

  const newItemId = randomUUID();
  await db.insert(assessmentItems).values({
    id: newItemId,
    categoryId,
    title: title.trim(),
    maxScore: maxScore.toFixed(2),
    assessmentDate: assessmentDate || null,
    isPublished: true,
  });

  await db.insert(auditLogs).values({
    id: randomUUID(),
    actorUserId: lecturer.userId,
    entityType: "assessment_items",
    entityId: newItemId,
    action: "create_assessment_item",
    afterData: { title, maxScore, categoryId },
  });

  revalidatePath(`/gradebook?classId=${classId}`);
  return { success: true, itemId: newItemId };
}

export async function updateCategoryWeights(
  classId: string,
  categoriesData: Array<{ id: string; weightPercent: number }>
) {
  const lecturer = await requireLecturer();

  const [cls] = await db
    .select({
      id: classes.id,
      gradingLockedAt: classes.gradingLockedAt,
      ownerUserId: courses.ownerUserId,
    })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.ownerUserId !== lecturer.userId) {
    return { error: "Akses ditolak" };
  }

  if (cls.gradingLockedAt !== null) {
    return { error: "Nilai kelas telah dikunci. Buka kunci untuk mengubah bobot." };
  }

  const total = categoriesData.reduce((acc, curr) => acc + curr.weightPercent, 0);
  if (Math.abs(total - 100) > 0.01) {
    return { error: `Total bobot harus tepat 100%. Saat ini berjumlah ${total.toFixed(2)}%` };
  }

  for (const cat of categoriesData) {
    await db
      .update(gradingCategories)
      .set({ weightPercent: cat.weightPercent.toFixed(2) })
      .where(
        and(
          eq(gradingCategories.id, cat.id),
          eq(gradingCategories.classId, classId)
        )
      );
  }

  await db.insert(auditLogs).values({
    id: randomUUID(),
    actorUserId: lecturer.userId,
    entityType: "grading_categories",
    entityId: classId,
    action: "update_category_weights",
    afterData: { categoriesData, totalWeight: 100 },
  });

  revalidatePath(`/gradebook?classId=${classId}`);
  return { success: true };
}

export async function toggleLockGrades(classId: string, shouldLock: boolean) {
  const lecturer = await requireLecturer();

  const [cls] = await db
    .select({
      id: classes.id,
      displayName: classes.displayName,
      gradingLockedAt: classes.gradingLockedAt,
      ownerUserId: courses.ownerUserId,
    })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.ownerUserId !== lecturer.userId) {
    return { error: "Akses ditolak" };
  }

  if (shouldLock) {
    // Verify total weight is 100% before locking
    const catList = await db
      .select({ weightPercent: gradingCategories.weightPercent })
      .from(gradingCategories)
      .where(eq(gradingCategories.classId, classId));

    const totalWeight = catList.reduce(
      (acc, curr) => acc + parseFloat(curr.weightPercent),
      0
    );

    if (Math.abs(totalWeight - 100) > 0.01) {
      return { error: `Total bobot kategori harus 100% untuk mengunci nilai (saat ini ${totalWeight}%).` };
    }

    await db
      .update(classes)
      .set({ gradingLockedAt: new Date() })
      .where(eq(classes.id, classId));

    await db.insert(auditLogs).values({
      id: randomUUID(),
      actorUserId: lecturer.userId,
      entityType: "classes",
      entityId: classId,
      action: "lock_grades",
      afterData: { lockedAt: new Date() },
    });
  } else {
    await db
      .update(classes)
      .set({ gradingLockedAt: null })
      .where(eq(classes.id, classId));

    await db.insert(auditLogs).values({
      id: randomUUID(),
      actorUserId: lecturer.userId,
      entityType: "classes",
      entityId: classId,
      action: "unlock_grades",
      afterData: { unlockedAt: new Date() },
    });
  }

  revalidatePath(`/gradebook?classId=${classId}`);
  return { success: true, isLocked: shouldLock };
}

export async function togglePublishGrades(classId: string, shouldPublish: boolean) {
  const lecturer = await requireLecturer();

  const [cls] = await db
    .select({
      id: classes.id,
      displayName: classes.displayName,
      gradesPublishedAt: classes.gradesPublishedAt,
      ownerUserId: courses.ownerUserId,
    })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.ownerUserId !== lecturer.userId) {
    return { error: "Akses ditolak" };
  }

  const now = new Date();

  await db
    .update(classes)
    .set({ gradesPublishedAt: shouldPublish ? now : null })
    .where(eq(classes.id, classId));

  // If publishing, send in-app notification to all enrolled students
  if (shouldPublish) {
    const enrolledStudents = await db
      .select({ studentUserId: enrollments.studentUserId })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.classId, classId),
          eq(enrollments.enrollmentStatus, "active")
        )
      );

    for (const st of enrolledStudents) {
      await db.insert(notifications).values({
        id: randomUUID(),
        userId: st.studentUserId,
        title: `Nilai Akhir Dipublikasikan: ${cls.displayName}`,
        body: `Dosen telah mempublikasikan nilai akhir untuk kelas ${cls.displayName}. Silakan periksa di menu Nilai Saya.`,
        type: "grades_published",
        targetUrl: "/student/grades",
      });
    }
  }

  await db.insert(auditLogs).values({
    id: randomUUID(),
    actorUserId: lecturer.userId,
    entityType: "classes",
    entityId: classId,
    action: shouldPublish ? "publish_grades" : "unpublish_grades",
    afterData: { gradesPublishedAt: shouldPublish ? now : null },
  });

  revalidatePath(`/gradebook?classId=${classId}`);
  return { success: true, isPublished: shouldPublish };
}
