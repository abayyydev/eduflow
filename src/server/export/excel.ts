import ExcelJS from "exceljs";

export interface GradebookExportData {
  courseCode: string;
  courseName: string;
  classCode: string;
  className: string;
  termName: string;
  lecturerName: string;
  items: Array<{
    id: string;
    title: string;
    maxScore: number;
    categoryName: string;
  }>;
  students: Array<{
    nim: string;
    name: string;
    scores: Record<string, number | null>;
    finalScore: number | null;
    letterGrade: string | null;
  }>;
}

export interface AttendanceExportData {
  courseCode: string;
  courseName: string;
  classCode: string;
  className: string;
  termName: string;
  lecturerName: string;
  sessions: Array<{
    meetingNumber: number;
    sessionDate: string;
    topic: string | null;
  }>;
  students: Array<{
    nim: string;
    name: string;
    records: Record<number, string>; // meetingNumber -> status (Hadir, Sakit, Izin, Alpa)
    presentCount: number;
    sickCount: number;
    excusedCount: number;
    absentCount: number;
    percentage: number;
  }>;
}

export async function createGradebookWorkbook(
  data: GradebookExportData
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "EDUFlow Academic System";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Rekap Nilai", {
    views: [{ showGridLines: true }],
  });

  // 1. Title & Meta
  sheet.addRow([`REKAPITULASI NILAI AKHIR — ${data.className.toUpperCase()}`]);
  sheet.addRow([`Mata Kuliah: ${data.courseCode} - ${data.courseName}`]);
  sheet.addRow([`Semester: ${data.termName} | Kelas: ${data.classCode}`]);
  sheet.addRow([`Dosen Pengampu: ${data.lecturerName}`]);
  sheet.addRow([`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`]);
  sheet.addRow([]); // Blank spacer

  // Header row
  const headerRow = [
    "No",
    "NIM",
    "Nama Mahasiswa",
    ...data.items.map((it) => `${it.title} (Max ${it.maxScore})`),
    "Nilai Akhir (0-100)",
    "Huruf Mutu",
  ];
  const rowObj = sheet.addRow(headerRow);

  // Style header row
  rowObj.font = { bold: true, color: { argb: "FFFFFFFF" } };
  rowObj.alignment = { vertical: "middle", horizontal: "center" };
  rowObj.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2457D6" },
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFCCCCCC" } },
      left: { style: "thin", color: { argb: "FFCCCCCC" } },
      bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
      right: { style: "thin", color: { argb: "FFCCCCCC" } },
    };
  });

  // Student rows
  data.students.forEach((st, idx) => {
    const rowValues = [
      idx + 1,
      st.nim,
      st.name,
      ...data.items.map((it) => {
        const val = st.scores[it.id];
        return val !== null && val !== undefined ? val : "-";
      }),
      st.finalScore !== null && st.finalScore !== undefined ? st.finalScore : "-",
      st.letterGrade || "-",
    ];

    const dataRow = sheet.addRow(rowValues);
    dataRow.alignment = { vertical: "middle" };

    // Format numbers alignment
    dataRow.eachCell((cell, colNumber) => {
      if (colNumber === 1 || colNumber === 2 || colNumber > 3) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      }
      cell.border = {
        top: { style: "thin", color: { argb: "FFE4E9F2" } },
        left: { style: "thin", color: { argb: "FFE4E9F2" } },
        bottom: { style: "thin", color: { argb: "FFE4E9F2" } },
        right: { style: "thin", color: { argb: "FFE4E9F2" } },
      };
    });
  });

  // Auto-fit column widths
  sheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell?.({ includeEmpty: false }, (cell) => {
      const cellLength = cell.value ? cell.value.toString().length : 0;
      if (cellLength > maxLength) {
        maxLength = Math.min(cellLength + 3, 35);
      }
    });
    column.width = maxLength;
  });

  return workbook;
}

export async function createAttendanceWorkbook(
  data: AttendanceExportData
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "EDUFlow Academic System";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Rekap Presensi", {
    views: [{ showGridLines: true }],
  });

  sheet.addRow([`REKAPITULASI PRESENSI PERKULIAHAN — ${data.className.toUpperCase()}`]);
  sheet.addRow([`Mata Kuliah: ${data.courseCode} - ${data.courseName}`]);
  sheet.addRow([`Semester: ${data.termName} | Kelas: ${data.classCode}`]);
  sheet.addRow([`Dosen Pengampu: ${data.lecturerName}`]);
  sheet.addRow([`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`]);
  sheet.addRow([]);

  // Header row
  const headerRow = [
    "No",
    "NIM",
    "Nama Mahasiswa",
    ...data.sessions.map((s) => `Pert. ${s.meetingNumber}\n(${s.sessionDate})`),
    "Hadir",
    "Sakit",
    "Izin",
    "Alpa",
    "% Kehadiran",
  ];
  const rowObj = sheet.addRow(headerRow);

  rowObj.font = { bold: true, color: { argb: "FFFFFFFF" } };
  rowObj.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  rowObj.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF16845B" },
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFCCCCCC" } },
      left: { style: "thin", color: { argb: "FFCCCCCC" } },
      bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
      right: { style: "thin", color: { argb: "FFCCCCCC" } },
    };
  });

  data.students.forEach((st, idx) => {
    const rowValues = [
      idx + 1,
      st.nim,
      st.name,
      ...data.sessions.map((s) => st.records[s.meetingNumber] || "-"),
      st.presentCount,
      st.sickCount,
      st.excusedCount,
      st.absentCount,
      `${st.percentage}%`,
    ];

    const dataRow = sheet.addRow(rowValues);
    dataRow.alignment = { vertical: "middle" };

    dataRow.eachCell((cell, colNumber) => {
      if (colNumber === 1 || colNumber === 2 || colNumber > 3) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      }
      cell.border = {
        top: { style: "thin", color: { argb: "FFE4E9F2" } },
        left: { style: "thin", color: { argb: "FFE4E9F2" } },
        bottom: { style: "thin", color: { argb: "FFE4E9F2" } },
        right: { style: "thin", color: { argb: "FFE4E9F2" } },
      };
    });
  });

  sheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell?.({ includeEmpty: false }, (cell) => {
      const cellLength = cell.value ? cell.value.toString().length : 0;
      if (cellLength > maxLength) {
        maxLength = Math.min(cellLength + 3, 35);
      }
    });
    column.width = maxLength;
  });

  return workbook;
}
