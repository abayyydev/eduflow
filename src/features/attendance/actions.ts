"use server";

import { db } from "@/server/db";
import {
  attendanceSessions,
  attendanceRecords,
  classes,
  courses,
  academicTerms,
  enrollments,
  students,
  gradingCategories,
  assessmentItems,
  grades,
  auditLogs,
} from "@/server/db/schema";
import { requireLecturer } from "@/server/auth/session";
import { eq, and, sql, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export interface StudentAttendanceRow {
  studentUserId: string;
  name: string;
  studentNumber: string;
  records: Record<
    string,
    {
      status: "present" | "sick" | "excused" | "absent";
      note: string | null;
    }
  >;
  stats: {
    totalSessions: number;
    presentCount: number;
    sickCount: number;
    excusedCount: number;
    absentCount: number;
    percentage: number;
  };
}

export interface AttendanceOverviewData {
  classInfo: {
    id: string;
    displayName: string;
    classCode: string;
    courseCode: string;
    courseName: string;
    termName: string;
    gradingLockedAt: Date | null;
  };
  sessions: Array<{
    id: string;
    meetingNumber: number;
    sessionDate: string;
    topic: string | null;
  }>;
  students: StudentAttendanceRow[];
  averageAttendancePercent: number;
}

export async function getClassAttendanceOverview(
  classId: string
): Promise<AttendanceOverviewData | null> {
  const lecturer = await requireLecturer();

  // 1. Verify class ownership
  const [cls] = await db
    .select({
      id: classes.id,
      displayName: classes.displayName,
      classCode: classes.classCode,
      courseCode: courses.code,
      courseName: courses.name,
      termName: academicTerms.name,
      ownerUserId: courses.lecturerId,
      gradingLockedAt: classes.gradingLockedAt,
    })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.ownerUserId !== lecturer.userId) {
    throw new Error("FORBIDDEN_NOT_CLASS_OWNER");
  }

  // 2. Fetch sessions
  const sessions = await db
    .select()
    .from(attendanceSessions)
    .where(eq(attendanceSessions.classId, classId))
    .orderBy(asc(attendanceSessions.meetingNumber));

  // 3. Fetch enrolled students
  const enrolledStudents = await db
    .select({
      studentUserId: students.id,
      name: students.name,
      studentNumber: students.studentNumber,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .where(
      and(
        eq(enrollments.classId, classId),
        eq(enrollments.enrollmentStatus, "active")
      )
    )
    .orderBy(asc(students.studentNumber));

  // 4. Fetch all attendance records for these sessions
  const sessionIds = sessions.map((s) => s.id);
  const records =
    sessionIds.length > 0
      ? await db
          .select()
          .from(attendanceRecords)
          .where(
            sql`${attendanceRecords.sessionId} IN (${sql.join(
              sessionIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          )
      : [];

  const recordMap = new Map<string, typeof records[0]>();
  for (const r of records) {
    recordMap.set(`${r.studentId}:${r.sessionId}`, r);
  }

  const studentRows: StudentAttendanceRow[] = [];
  let totalPercentSum = 0;

  for (const st of enrolledStudents) {
    const studentRecords: Record<
      string,
      { status: "present" | "sick" | "excused" | "absent"; note: string | null }
    > = {};

    let presentCount = 0;
    let sickCount = 0;
    let excusedCount = 0;
    let absentCount = 0;

    for (const sess of sessions) {
      const rec = recordMap.get(`${st.studentUserId}:${sess.id}`);
      const status = rec ? rec.status : "absent";

      studentRecords[sess.id] = {
        status,
        note: rec?.note || null,
      };

      if (status === "present") presentCount++;
      else if (status === "sick") sickCount++;
      else if (status === "excused") excusedCount++;
      else absentCount++;
    }

    const totalSessions = sessions.length;
    const percentage =
      totalSessions > 0
        ? Math.round((presentCount / totalSessions) * 100 * 100) / 100
        : 100;

    totalPercentSum += percentage;

    studentRows.push({
      studentUserId: st.studentUserId,
      name: st.name,
      studentNumber: st.studentNumber,
      records: studentRecords,
      stats: {
        totalSessions,
        presentCount,
        sickCount,
        excusedCount,
        absentCount,
        percentage,
      },
    });
  }

  const averageAttendancePercent =
    studentRows.length > 0
      ? Math.round((totalPercentSum / studentRows.length) * 100) / 100
      : 100;

  return {
    classInfo: {
      id: cls.id,
      displayName: cls.displayName,
      classCode: cls.classCode,
      courseCode: cls.courseCode,
      courseName: cls.courseName,
      termName: cls.termName,
      gradingLockedAt: cls.gradingLockedAt,
    },
    sessions: sessions.map((s) => ({
      id: s.id,
      meetingNumber: s.meetingNumber,
      sessionDate: s.sessionDate,
      topic: s.topic,
    })),
    students: studentRows,
    averageAttendancePercent,
  };
}

export async function createAttendanceSession(
  classId: string,
  meetingNumber: number,
  sessionDate: string,
  topic?: string
) {
  const lecturer = await requireLecturer();

  // Verify class ownership
  const [cls] = await db
    .select({ ownerUserId: courses.lecturerId })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.ownerUserId !== lecturer.userId) {
    return { error: "Akses ditolak" };
  }

  const newSessionId = randomUUID();

  await db.insert(attendanceSessions).values({
    id: newSessionId,
    classId,
    meetingNumber,
    sessionDate,
    topic: topic?.trim() || null,
  });

  // Automatically create default 'present' records for all enrolled students
  const enrolledStudents = await db
    .select({ studentUserId: enrollments.studentId })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.classId, classId),
        eq(enrollments.enrollmentStatus, "active")
      )
    );

  for (const st of enrolledStudents) {
    await db.insert(attendanceRecords).values({
      id: randomUUID(),
      sessionId: newSessionId,
      studentId: st.studentUserId,
      status: "present",
      updatedBy: lecturer.userId,
    });
  }

  await db.insert(auditLogs).values({
    id: randomUUID(),
    actorUserId: lecturer.userId,
    entityType: "attendance_sessions",
    entityId: newSessionId,
    action: "create_attendance_session",
    afterData: { meetingNumber, sessionDate, topic },
  });

  revalidatePath(`/attendance?classId=${classId}`);
  return { success: true, sessionId: newSessionId };
}

export async function updateStudentAttendance(
  classId: string,
  sessionId: string,
  studentUserId: string,
  status: "present" | "sick" | "excused" | "absent",
  note?: string
) {
  const lecturer = await requireLecturer();

  // Verify ownership
  const [cls] = await db
    .select({ ownerUserId: courses.lecturerId })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.ownerUserId !== lecturer.userId) {
    return { error: "Akses ditolak" };
  }

  const [existing] = await db
    .select()
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.sessionId, sessionId),
        eq(attendanceRecords.studentId, studentUserId)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .update(attendanceRecords)
      .set({
        status,
        note: note !== undefined ? note : existing.note,
        updatedBy: lecturer.userId,
      })
      .where(eq(attendanceRecords.id, existing.id));
  } else {
    await db.insert(attendanceRecords).values({
      id: randomUUID(),
      sessionId,
      studentId: studentUserId,
      status,
      note: note || null,
      updatedBy: lecturer.userId,
    });
  }

  revalidatePath(`/attendance?classId=${classId}`);
  return { success: true };
}

export async function syncAttendanceToGradebook(classId: string) {
  const lecturer = await requireLecturer();

  // Verify ownership and lock
  const [cls] = await db
    .select({
      id: classes.id,
      gradingLockedAt: classes.gradingLockedAt,
      ownerUserId: courses.lecturerId,
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

  // 1. Get Presensi category
  let [catPresensi] = await db
    .select()
    .from(gradingCategories)
    .where(
      and(
        eq(gradingCategories.classId, classId),
        eq(gradingCategories.name, "Presensi")
      )
    )
    .limit(1);

  if (!catPresensi) {
    const newCatId = randomUUID();
    await db.insert(gradingCategories).values({
      id: newCatId,
      classId,
      name: "Presensi",
      weightPercent: "10.00",
      aggregationMethod: "average",
      isRequired: true,
      sortOrder: 1,
    });
    const [created] = await db
      .select()
      .from(gradingCategories)
      .where(eq(gradingCategories.id, newCatId))
      .limit(1);
    catPresensi = created;
  }

  // 2. Find or create assessment item for attendance
  let [attItem] = await db
    .select()
    .from(assessmentItems)
    .where(
      and(
        eq(assessmentItems.categoryId, catPresensi.id),
        eq(assessmentItems.title, "Rekap Presensi Perkuliahan")
      )
    )
    .limit(1);

  if (!attItem) {
    const newItemId = randomUUID();
    await db.insert(assessmentItems).values({
      id: newItemId,
      categoryId: catPresensi.id,
      title: "Rekap Presensi Perkuliahan",
      maxScore: "100.00",
      isPublished: true,
    });
    const [createdItem] = await db
      .select()
      .from(assessmentItems)
      .where(eq(assessmentItems.id, newItemId))
      .limit(1);
    attItem = createdItem;
  }

  // 3. Compute attendance percentage for each student
  const overview = await getClassAttendanceOverview(classId);
  if (!overview) return { error: "Gagal menghitung presensi" };

  for (const st of overview.students) {
    const percent = st.stats.percentage.toFixed(2);

    const [existingGrade] = await db
      .select()
      .from(grades)
      .where(
        and(
          eq(grades.assessmentItemId, attItem.id),
          eq(grades.studentId, st.studentUserId)
        )
      )
      .limit(1);

    if (existingGrade) {
      await db
        .update(grades)
        .set({
          score: percent,
          feedback: `Kehadiran: ${st.stats.presentCount} dari ${st.stats.totalSessions} sesi pertemuan.`,
          gradedBy: lecturer.userId,
          gradedAt: new Date(),
        })
        .where(eq(grades.id, existingGrade.id));
    } else {
      await db.insert(grades).values({
        id: randomUUID(),
        assessmentItemId: attItem.id,
        studentId: st.studentUserId,
        score: percent,
        feedback: `Kehadiran: ${st.stats.presentCount} dari ${st.stats.totalSessions} sesi pertemuan.`,
        gradedBy: lecturer.userId,
        gradedAt: new Date(),
      });
    }
  }

  await db.insert(auditLogs).values({
    id: randomUUID(),
    actorUserId: lecturer.userId,
    entityType: "grades",
    entityId: attItem.id,
    action: "sync_attendance_to_gradebook",
    afterData: { classId, syncedStudentsCount: overview.students.length },
  });

  revalidatePath(`/gradebook?classId=${classId}`);
  revalidatePath(`/attendance?classId=${classId}`);
  return { success: true, count: overview.students.length };
}
