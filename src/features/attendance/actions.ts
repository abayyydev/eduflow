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
import {
  calculateDistanceMeters,
  evaluateAttendanceTimeWindow,
} from "./attendance-utils";

export interface StudentAttendanceRow {
  studentUserId: string;
  name: string;
  studentNumber: string;
  records: Record<
    string,
    {
      status: "present" | "late" | "sick" | "excused" | "absent" | null;
      note: string | null;
    }
  >;
  stats: {
    totalSessions: number;
    heldSessionsCount?: number;
    presentCount: number;
    lateCount: number;
    sickCount: number;
    excusedCount: number;
    absentCount: number;
    unrecordedCount?: number;
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
    isOpen: boolean;
  }>;
  students: StudentAttendanceRow[];
  averageAttendancePercent: number;
  heldSessionsCount?: number;
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

  // Calculate held sessions (sessions where isOpen is true OR at least one student has an attendance record)
  const heldSessionIds = new Set<string>();
  for (const sess of sessions) {
    if (sess.isOpen) heldSessionIds.add(sess.id);
  }
  for (const r of records) {
    heldSessionIds.add(r.sessionId);
  }
  const totalHeldSessions = heldSessionIds.size;

  const studentRows: StudentAttendanceRow[] = [];
  let totalPercentSum = 0;

  for (const st of enrolledStudents) {
    const studentRecords: Record<
      string,
      { status: "present" | "late" | "sick" | "excused" | "absent" | null; note: string | null }
    > = {};

    let presentCount = 0;
    let lateCount = 0;
    let sickCount = 0;
    let excusedCount = 0;
    let absentCount = 0;
    let unrecordedCount = 0;

    for (const sess of sessions) {
      const rec = recordMap.get(`${st.studentUserId}:${sess.id}`);
      const status = rec ? rec.status : null;

      studentRecords[sess.id] = {
        status,
        note: rec?.note || null,
      };

      if (status === "present") presentCount++;
      else if (status === "late") lateCount++;
      else if (status === "sick") sickCount++;
      else if (status === "excused") excusedCount++;
      else if (status === "absent") absentCount++;
      else unrecordedCount++;
    }

    const totalSessions = sessions.length; // Full 16 sessions
    const denominator = totalHeldSessions > 0 ? totalHeldSessions : 1;
    const percentage =
      totalHeldSessions > 0
        ? Math.round(((presentCount + lateCount) / denominator) * 100 * 100) / 100
        : 100;

    totalPercentSum += percentage;

    studentRows.push({
      studentUserId: st.studentUserId,
      name: st.name,
      studentNumber: st.studentNumber,
      records: studentRecords,
      stats: {
        totalSessions,
        heldSessionsCount: totalHeldSessions,
        presentCount,
        lateCount,
        sickCount,
        excusedCount,
        absentCount,
        unrecordedCount,
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
      isOpen: s.isOpen ?? false,
    })),
    students: studentRows,
    averageAttendancePercent,
    heldSessionsCount: totalHeldSessions,
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
    isOpen: false,
  });

  // Notice: students are NOT automatically marked present. They remain unrecorded/belum hadir until scanned or marked.

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

export async function toggleAttendanceSessionOpen(
  classId: string,
  sessionId: string,
  isOpen: boolean
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

  if (isOpen) {
    // Single active open session: close other sessions in this class
    await db
      .update(attendanceSessions)
      .set({ isOpen: false })
      .where(eq(attendanceSessions.classId, classId));

    await db
      .update(attendanceSessions)
      .set({ isOpen: true })
      .where(eq(attendanceSessions.id, sessionId));
  } else {
    await db
      .update(attendanceSessions)
      .set({ isOpen: false })
      .where(eq(attendanceSessions.id, sessionId));
  }

  revalidatePath(`/attendance?classId=${classId}`);
  revalidatePath(`/student/attendance`);
  return { success: true };
}

export async function updateStudentAttendance(
  classId: string,
  sessionId: string,
  studentUserId: string,
  status: "present" | "late" | "sick" | "excused" | "absent" | "unrecorded",
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

  if (status === "unrecorded") {
    // Delete record if exists so student is "belum hadir"
    if (existing) {
      await db.delete(attendanceRecords).where(eq(attendanceRecords.id, existing.id));
    }
  } else if (existing) {
    await db
      .update(attendanceRecords)
      .set({
        status,
        note: note || existing.note,
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

// ---------------------------------------------------------------------------
// Barcode / QR Code Attendance & Campus Geofencing System
// ---------------------------------------------------------------------------

// Re-export async wrappers for backward compatibility if called from client
export async function calculateDistanceMetersAsync(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<number> {
  return calculateDistanceMeters(lat1, lon1, lat2, lon2);
}

export async function evaluateAttendanceTimeWindowAsync(
  startTimeStr: string = "09:00",
  endTimeStr: string = "10:30"
) {
  return evaluateAttendanceTimeWindow(startTimeStr, endTimeStr);
}

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

  // Fetch all sessions (16 meetings)
  const sessions = await db
    .select()
    .from(attendanceSessions)
    .where(eq(attendanceSessions.classId, classId))
    .orderBy(asc(attendanceSessions.meetingNumber));

  // Find currently open session (latest opened)
  const activeSession = sessions.slice().reverse().find((s) => s.isOpen) || sessions[0] || null;

  let attendedStudents: Array<{
    name: string;
    studentNumber: string;
    status: string;
    distanceMeters: number | null;
    scannedAt: Date | null;
  }> = [];

  if (activeSession) {
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
      .where(eq(attendanceRecords.sessionId, activeSession.id))
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
    sessions: sessions.map((s) => ({
      id: s.id,
      meetingNumber: s.meetingNumber,
      sessionDate: s.sessionDate,
      topic: s.topic,
      isOpen: s.isOpen ?? false,
    })),
    activeSession: activeSession
      ? {
          id: activeSession.id,
          meetingNumber: activeSession.meetingNumber,
          sessionDate: activeSession.sessionDate,
          topic: activeSession.topic,
          isOpen: activeSession.isOpen ?? false,
        }
      : null,
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

  // 5. User Requirement: Otomatis hadir di saat pertemuan terakhir yang di-open oleh dosen
  const [openSession] = await db
    .select()
    .from(attendanceSessions)
    .where(
      and(
        eq(attendanceSessions.classId, cls.id),
        eq(attendanceSessions.isOpen, true)
      )
    )
    .orderBy(desc(attendanceSessions.meetingNumber))
    .limit(1);

  if (!openSession) {
    return {
      error: "Sesi presensi belum dibuka oleh dosen untuk pertemuan saat ini. Silakan tunggu hingga dosen mengaktifkan/membuka pertemuan di kelas.",
    };
  }

  // 6. Check existing attendance record for this open session
  const [existingRecord] = await db
    .select()
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.sessionId, openSession.id),
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
        meetingNumber: openSession.meetingNumber,
        message: `Anda sudah tercatat melakukan presensi untuk Pertemuan Ke-${openSession.meetingNumber} (${existingRecord.status === "present" ? "HADIR" : "TERLAMBAT"}).`,
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
      sessionId: openSession.id,
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
    meetingNumber: openSession.meetingNumber,
    distanceMeters,
    message:
      finalStatus === "present"
        ? `Presensi Berhasil: Anda tercatat HADIR untuk Pertemuan Ke-${openSession.meetingNumber} tepat waktu!`
        : `Presensi Berhasil: Anda tercatat TERLAMBAT untuk Pertemuan Ke-${openSession.meetingNumber} (lewat 15 menit pertama).`,
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

  // Fetch active open session for each class
  const openSessions = await db
    .select({
      classId: attendanceSessions.classId,
      meetingNumber: attendanceSessions.meetingNumber,
      topic: attendanceSessions.topic,
    })
    .from(attendanceSessions)
    .where(eq(attendanceSessions.isOpen, true));

  const openSessionMap = new Map<string, typeof openSessions[0]>();
  for (const os of openSessions) {
    openSessionMap.set(os.classId, os);
  }

  const classesWithStatus = enrolled.map((cls) => {
    const timeWindow = evaluateAttendanceTimeWindow(
      cls.startTime || "09:00",
      cls.endTime || "10:30"
    );

    const todayRecord = records.find(
      (r) => r.classId === cls.classId && r.sessionDate === todayDate
    );

    const activeOpen = openSessionMap.get(cls.classId);

    return {
      ...cls,
      startTime: cls.startTime || "09:00",
      endTime: cls.endTime || "10:30",
      timeWindow,
      todayStatus: todayRecord ? todayRecord.status : null,
      activeOpenMeeting: activeOpen ? activeOpen.meetingNumber : null,
    };
  });

  return {
    classes: classesWithStatus,
    recentRecords: records.slice(0, 15),
  };
}
