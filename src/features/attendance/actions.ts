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
import { requireLecturer, requireStudent } from "@/server/auth/session";
import { eq, and, sql, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export interface StudentAttendanceRow {
  studentUserId: string;
  name: string;
  studentNumber: string;
  records: Record<
    string,
    {
      status: "present" | "late" | "sick" | "excused" | "absent";
      note: string | null;
    }
  >;
  stats: {
    totalSessions: number;
    presentCount: number;
    lateCount?: number;
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
      { status: "present" | "late" | "sick" | "excused" | "absent"; note: string | null }
    > = {};

    let presentCount = 0;
    let lateCount = 0;
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
      else if (status === "late") lateCount++;
      else if (status === "sick") sickCount++;
      else if (status === "excused") excusedCount++;
      else absentCount++;
    }

    const totalSessions = sessions.length;
    const percentage =
      totalSessions > 0
        ? Math.round(((presentCount + lateCount) / totalSessions) * 100 * 100) / 100
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
        lateCount,
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

import {
  calculateDistanceMeters,
  evaluateAttendanceTimeWindow,
} from "./attendance-utils";

// ---------------------------------------------------------------------------
// Barcode / QR Code Attendance & Campus Geofencing System
// ---------------------------------------------------------------------------

export async function getClassBarcodeData(classId: string) {
  const lecturer = await requireLecturer();

  const [cls] = await db
    .select({
      id: classes.id,
      displayName: classes.displayName,
      classCode: classes.classCode,
      courseCode: courses.code,
      courseName: courses.name,
      termName: academicTerms.name,
      scheduleText: classes.scheduleText,
      qrCodeToken: classes.qrCodeToken,
      scheduleDay: classes.scheduleDay,
      startTime: classes.startTime,
      endTime: classes.endTime,
      campusLatitude: classes.campusLatitude,
      campusLongitude: classes.campusLongitude,
      campusRadiusMeters: classes.campusRadiusMeters,
      ownerUserId: courses.lecturerId,
    })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls || cls.ownerUserId !== lecturer.userId) {
    throw new Error("Akses ditolak");
  }

  let token = cls.qrCodeToken;
  if (!token) {
    token = "EDF-" + randomUUID().slice(0, 8).toUpperCase();
    await db.update(classes).set({ qrCodeToken: token }).where(eq(classes.id, classId));
  }

  const timeWindow = evaluateAttendanceTimeWindow(
    cls.startTime || "09:00",
    cls.endTime || "10:30"
  );

  // Today's session records
  const todayDate = new Date().toISOString().split("T")[0];
  const [todaySession] = await db
    .select()
    .from(attendanceSessions)
    .where(
      and(
        eq(attendanceSessions.classId, classId),
        eq(attendanceSessions.sessionDate, todayDate)
      )
    )
    .limit(1);

  let attendedStudents: Array<{
    name: string;
    studentNumber: string;
    status: string;
    distanceMeters: number | null;
    scannedAt: Date | null;
  }> = [];

  if (todaySession) {
    attendedStudents = await db
      .select({
        name: students.name,
        studentNumber: students.studentNumber,
        status: attendanceRecords.status,
        distanceMeters: attendanceRecords.distanceMeters,
        scannedAt: attendanceRecords.scannedAt,
      })
      .from(attendanceRecords)
      .innerJoin(students, eq(attendanceRecords.studentId, students.id))
      .where(eq(attendanceRecords.sessionId, todaySession.id))
      .orderBy(desc(attendanceRecords.scannedAt));
  }

  return {
    classInfo: {
      ...cls,
      qrCodeToken: token,
      startTime: cls.startTime || "09:00",
      endTime: cls.endTime || "10:30",
      campusRadiusMeters: cls.campusRadiusMeters || 300,
      campusLatitude: parseFloat(cls.campusLatitude || "-6.914744"),
      campusLongitude: parseFloat(cls.campusLongitude || "107.60981"),
    },
    timeWindow,
    attendedStudents,
  };
}

export async function scanStudentQrAttendance(input: {
  qrToken: string;
  latitude: number;
  longitude: number;
  isSimulation?: boolean;
}) {
  const student = await requireStudent();

  const tokenClean = input.qrToken.trim().toUpperCase();

  // 1. Find class by QR token
  const [cls] = await db
    .select({
      id: classes.id,
      displayName: classes.displayName,
      classCode: classes.classCode,
      courseCode: courses.code,
      courseName: courses.name,
      scheduleDay: classes.scheduleDay,
      startTime: classes.startTime,
      endTime: classes.endTime,
      campusLatitude: classes.campusLatitude,
      campusLongitude: classes.campusLongitude,
      campusRadiusMeters: classes.campusRadiusMeters,
      lecturerId: courses.lecturerId,
    })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(classes.qrCodeToken, tokenClean))
    .limit(1);

  if (!cls) {
    return {
      error: "Kode QR presensi tidak valid atau tidak dikenali dalam sistem.",
    };
  }

  // 2. Verify student enrollment in this class
  const [enrollment] = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.classId, cls.id),
        eq(enrollments.studentId, student.userId),
        eq(enrollments.enrollmentStatus, "active")
      )
    )
    .limit(1);

  if (!enrollment) {
    return {
      error: `Anda tidak terdaftar sebagai peserta aktif di kelas ${cls.displayName}.`,
    };
  }

  // 3. Verify Geofence / Campus Radius
  const campusLat = parseFloat(cls.campusLatitude || "-6.914744");
  const campusLon = parseFloat(cls.campusLongitude || "107.60981");
  const allowedRadius = cls.campusRadiusMeters || 300;

  const distanceMeters = calculateDistanceMeters(
    input.latitude,
    input.longitude,
    campusLat,
    campusLon
  );

  if (distanceMeters > allowedRadius && !input.isSimulation) {
    return {
      error: `Presensi Ditolak: Anda terdeteksi berada di luar area kampus (${distanceMeters}m dari kampus, batas toleransi ${allowedRadius}m). Presensi hanya dapat dilakukan secara fisik di lingkungan kampus.`,
      distanceMeters,
      allowedRadius,
    };
  }

  // 4. Verify Automatic Time Window
  const timeWindow = evaluateAttendanceTimeWindow(
    cls.startTime || "09:00",
    cls.endTime || "10:30"
  );

  if (!timeWindow.isAllowedToScan && !input.isSimulation) {
    return {
      error: timeWindow.message,
      timeWindowStatus: timeWindow.status,
    };
  }

  const finalStatus: "present" | "late" = input.isSimulation
    ? "present"
    : (timeWindow.attendanceStatusIfScanned || "present");

  // 5. Find or create today's session
  const todayDate = new Date().toISOString().split("T")[0];
  let [todaySession] = await db
    .select()
    .from(attendanceSessions)
    .where(
      and(
        eq(attendanceSessions.classId, cls.id),
        eq(attendanceSessions.sessionDate, todayDate)
      )
    )
    .limit(1);

  if (!todaySession) {
    const existingSessions = await db
      .select({ count: sql<number>`count(*)` })
      .from(attendanceSessions)
      .where(eq(attendanceSessions.classId, cls.id));

    const nextMeeting = (existingSessions[0]?.count || 0) + 1;
    const newSessionId = randomUUID();

    await db.insert(attendanceSessions).values({
      id: newSessionId,
      classId: cls.id,
      meetingNumber: nextMeeting,
      sessionDate: todayDate,
      topic: `Pertemuan Ke-${nextMeeting}`,
    });

    [todaySession] = await db
      .select()
      .from(attendanceSessions)
      .where(eq(attendanceSessions.id, newSessionId))
      .limit(1);
  }

  // 6. Check existing attendance record
  const [existingRecord] = await db
    .select()
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.sessionId, todaySession.id),
        eq(attendanceRecords.studentId, student.userId)
      )
    )
    .limit(1);

  const now = new Date();

  if (existingRecord) {
    if (existingRecord.status === "present" || existingRecord.status === "late") {
      return {
        success: true,
        alreadyRecorded: true,
        status: existingRecord.status,
        message: `Anda sudah tercatat melakukan presensi hari ini (${existingRecord.status === "present" ? "HADIR" : "TERLAMBAT"}).`,
        className: cls.displayName,
        distanceMeters,
      };
    }

    await db
      .update(attendanceRecords)
      .set({
        status: finalStatus,
        latitude: input.latitude.toFixed(7),
        longitude: input.longitude.toFixed(7),
        distanceMeters,
        scannedAt: now,
        note: `Scan Barcode QR (${distanceMeters}m dari kampus)`,
      })
      .where(eq(attendanceRecords.id, existingRecord.id));
  } else {
    await db.insert(attendanceRecords).values({
      id: randomUUID(),
      sessionId: todaySession.id,
      studentId: student.userId,
      status: finalStatus,
      latitude: input.latitude.toFixed(7),
      longitude: input.longitude.toFixed(7),
      distanceMeters,
      scannedAt: now,
      note: `Scan Barcode QR (${distanceMeters}m dari kampus)`,
      updatedBy: cls.lecturerId,
    });
  }

  revalidatePath(`/student/attendance`);
  revalidatePath(`/attendance?classId=${cls.id}`);

  return {
    success: true,
    status: finalStatus,
    className: cls.displayName,
    courseCode: cls.courseCode,
    distanceMeters,
    message:
      finalStatus === "present"
        ? "Presensi Berhasil: Anda tercatat HADIR tepat waktu!"
        : "Presensi Berhasil: Anda tercatat TERLAMBAT (lewat 15 menit pertama).",
  };
}

export async function getStudentAttendanceHubData() {
  const student = await requireStudent();

  // Enrolled active classes
  const enrolled = await db
    .select({
      classId: classes.id,
      displayName: classes.displayName,
      classCode: classes.classCode,
      courseCode: courses.code,
      courseName: courses.name,
      scheduleText: classes.scheduleText,
      qrCodeToken: classes.qrCodeToken,
      startTime: classes.startTime,
      endTime: classes.endTime,
      campusRadiusMeters: classes.campusRadiusMeters,
      campusLatitude: classes.campusLatitude,
      campusLongitude: classes.campusLongitude,
    })
    .from(enrollments)
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(
      and(
        eq(enrollments.studentId, student.userId),
        eq(enrollments.enrollmentStatus, "active"),
        eq(classes.status, "active")
      )
    );

  const todayDate = new Date().toISOString().split("T")[0];

  // Fetch student's attendance records across these classes
  const records = await db
    .select({
      classId: classes.id,
      className: classes.displayName,
      meetingNumber: attendanceSessions.meetingNumber,
      sessionDate: attendanceSessions.sessionDate,
      status: attendanceRecords.status,
      scannedAt: attendanceRecords.scannedAt,
      distanceMeters: attendanceRecords.distanceMeters,
    })
    .from(attendanceRecords)
    .innerJoin(attendanceSessions, eq(attendanceRecords.sessionId, attendanceSessions.id))
    .innerJoin(classes, eq(attendanceSessions.classId, classes.id))
    .where(eq(attendanceRecords.studentId, student.userId))
    .orderBy(desc(attendanceSessions.sessionDate), desc(attendanceRecords.scannedAt));

  const classesWithStatus = enrolled.map((cls) => {
    const timeWindow = evaluateAttendanceTimeWindow(
      cls.startTime || "09:00",
      cls.endTime || "10:30"
    );

    const todayRecord = records.find(
      (r) => r.classId === cls.classId && r.sessionDate === todayDate
    );

    return {
      ...cls,
      startTime: cls.startTime || "09:00",
      endTime: cls.endTime || "10:30",
      timeWindow,
      todayStatus: todayRecord ? todayRecord.status : null,
    };
  });

  return {
    classes: classesWithStatus,
    recentRecords: records.slice(0, 15),
  };
}
