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
import { getClassGradebookData } from "@/features/gradebook/actions";
import { createGradebookWorkbook } from "@/server/export/excel";

export async function GET(request: NextRequest) {
  try {
    const lecturer = await requireLecturer();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const format = searchParams.get("format") || "xlsx";

    if (!classId) {
      return NextResponse.json({ error: "classId wajib disertakan" }, { status: 400 });
    }

    // 1. Verify ownership & fetch class metadata
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

    // 2. Fetch full gradebook overview
    const gradebook = await getClassGradebookData(classId);
    if (!gradebook) {
      return NextResponse.json({ error: "Data gradebook tidak ditemukan" }, { status: 404 });
    }

    const allItems = gradebook.categories.flatMap((cat) =>
      cat.items.map((it) => ({
        id: it.id,
        title: it.title,
        maxScore: Number(it.maxScore),
        categoryName: cat.name,
      }))
    );

    const exportData = {
      courseCode: cls.courseCode,
      courseName: cls.courseName,
      classCode: cls.classCode,
      className: cls.displayName,
      termName: cls.termName,
      lecturerName: cls.lecturerName,
      items: allItems,
      students: gradebook.students.map((st) => {
        const scoresMap: Record<string, number | null> = {};
        for (const [itemId, info] of Object.entries(st.itemScores)) {
          scoresMap[itemId] = info.score;
        }
        return {
          nim: st.studentNumber,
          name: st.name,
          scores: scoresMap,
          finalScore: st.calculation.finalScore,
          letterGrade: st.calculation.letterGrade,
        };
      }),
    };

    const workbook = await createGradebookWorkbook(exportData);
    const safeFilename = `Rekap_Nilai_${cls.courseCode}_${cls.classCode}`.replace(/\s+/g, "_");

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
