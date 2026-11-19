import { NextRequest, NextResponse } from "next/server";
import { requireLecturer } from "@/server/auth/session";
import { db } from "@/server/db";
import {
  classes,
  courses,
  academicTerms,
  lecturers,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getClassAttendanceOverview } from "@/features/attendance/actions";
import { createAttendanceWorkbook } from "@/server/export/excel";

export async function GET(request: NextRequest) {
  try {
    const lecturer = await requireLecturer();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const format = searchParams.get("format") || "xlsx";

    if (!classId) {
      return NextResponse.json({ error: "classId wajib disertakan" }, { status: 400 });
    }

    const [cls] = await db
      .select({
        id: classes.id,
        displayName: classes.displayName,
        classCode: classes.classCode,
        courseCode: courses.code,
        courseName: courses.name,
        termName: academicTerms.name,
        ownerUserId: courses.lecturerId,
        lecturerName: lecturers.name,
      })
      .from(classes)
      .innerJoin(courses, eq(classes.courseId, courses.id))
      .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
      .innerJoin(lecturers, eq(courses.lecturerId, lecturers.id))
      .where(eq(classes.id, classId))
      .limit(1);

    if (!cls || cls.ownerUserId !== lecturer.userId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const attendanceOverview = await getClassAttendanceOverview(classId);
    if (!attendanceOverview) {
      return NextResponse.json({ error: "Data presensi tidak ditemukan" }, { status: 404 });
    }

    const exportData = {
      courseCode: cls.courseCode,
      courseName: cls.courseName,
      classCode: cls.classCode,
      className: cls.displayName,
      termName: cls.termName,
      lecturerName: cls.lecturerName,
      sessions: attendanceOverview.sessions.map((s) => ({
        meetingNumber: s.meetingNumber,
        sessionDate: s.sessionDate,
        topic: s.topic,
      })),
      students: attendanceOverview.students.map((st) => {
        const recordsMap: Record<number, string> = {};
        attendanceOverview.sessions.forEach((s) => {
          const rec = st.records[s.id];
          if (rec) {
            const statusLabel =
              rec.status === "present"
                ? "Hadir"
                : rec.status === "sick"
                ? "Sakit"
                : rec.status === "excused"
                ? "Izin"
                : "Alpa";
            recordsMap[s.meetingNumber] = statusLabel;
          } else {
            recordsMap[s.meetingNumber] = "-";
          }
        });

        return {
          nim: st.studentNumber,
          name: st.name,
          records: recordsMap,
          presentCount: st.stats.presentCount,
          sickCount: st.stats.sickCount,
          excusedCount: st.stats.excusedCount,
          absentCount: st.stats.absentCount,
          percentage: st.stats.percentage,
        };
      }),
    };

    const workbook = await createAttendanceWorkbook(exportData);
    const safeFilename = `Rekap_Presensi_${cls.courseCode}_${cls.classCode}`.replace(/\s+/g, "_");

    if (format === "csv") {
      const buffer = await workbook.csv.writeBuffer();
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${safeFilename}.csv"`,
        },
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${safeFilename}.xlsx"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
