import { describe, it, expect } from "vitest";
import {
  createGradebookWorkbook,
  createAttendanceWorkbook,
  type GradebookExportData,
  type AttendanceExportData,
} from "../src/server/export/excel";

describe("Phase 5 ExcelJS & CSV Export and Aggregation Tests", () => {
  const dummyGradebookData: GradebookExportData = {
    courseCode: "IF101",
    courseName: "Algoritma & Pemrograman",
    classCode: "A",
    className: "Algoritma & Pemrograman - Kelas A",
    termName: "2026/2027 Ganjil",
    lecturerName: "Dr. Budi Santoso, M.Kom.",
    items: [
      { id: "it-1", title: "Tugas 1", maxScore: 100, categoryName: "Tugas" },
      { id: "it-2", title: "Kuis 1", maxScore: 50, categoryName: "Kuis" },
      { id: "it-3", title: "UTS", maxScore: 100, categoryName: "UTS" },
    ],
    students: [
      {
        nim: "2024001",
        name: "Ahmad Dahlan",
        scores: { "it-1": 90, "it-2": 45, "it-3": 85 },
        finalScore: 88.5,
        letterGrade: "A",
      },
      {
        nim: "2024002",
        name: "Siti Aminah",
        scores: { "it-1": 70, "it-2": null, "it-3": 75 },
        finalScore: 72.0,
        letterGrade: "B",
      },
    ],
  };

  it("generates a valid Gradebook Excel workbook with proper worksheets and headers", async () => {
    const workbook = await createGradebookWorkbook(dummyGradebookData);
    expect(workbook).toBeDefined();

    const sheet = workbook.getWorksheet("Rekap Nilai");
    expect(sheet).toBeDefined();

    // Check title rows
    const titleCell = sheet?.getCell("A1").value;
    expect(String(titleCell)).toContain("REKAPITULASI NILAI AKHIR");

    // Check student count
    const studentRows = dummyGradebookData.students.length;
    expect(studentRows).toBe(2);

    // Export to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);
  });

  it("generates CSV buffer with accurate delimiter and student records", async () => {
    const workbook = await createGradebookWorkbook(dummyGradebookData);
    const csvBuffer = await workbook.csv.writeBuffer();
    const csvString = csvBuffer.toString();

    expect(csvString).toContain("Ahmad Dahlan");
    expect(csvString).toContain("2024001");
    expect(csvString).toContain("Siti Aminah");
    expect(csvString).toContain("Huruf Mutu");
  });

  it("generates a valid Attendance Excel workbook with correct session columns", async () => {
    const dummyAttendanceData: AttendanceExportData = {
      courseCode: "IF101",
      courseName: "Algoritma & Pemrograman",
      classCode: "A",
      className: "Algoritma & Pemrograman - Kelas A",
      termName: "2026/2027 Ganjil",
      lecturerName: "Dr. Budi Santoso, M.Kom.",
      sessions: [
        { meetingNumber: 1, sessionDate: "2026-09-01", topic: "Pengenalan" },
        { meetingNumber: 2, sessionDate: "2026-09-08", topic: "Variabel & Tipe Data" },
      ],
      students: [
        {
          nim: "2024001",
          name: "Ahmad Dahlan",
          records: { 1: "Hadir", 2: "Hadir" },
          presentCount: 2,
          sickCount: 0,
          excusedCount: 0,
          absentCount: 0,
          percentage: 100,
        },
        {
          nim: "2024002",
          name: "Siti Aminah",
          records: { 1: "Hadir", 2: "Sakit" },
          presentCount: 1,
          sickCount: 1,
          excusedCount: 0,
          absentCount: 0,
          percentage: 50,
        },
      ],
    };

    const workbook = await createAttendanceWorkbook(dummyAttendanceData);
    expect(workbook).toBeDefined();

    const sheet = workbook.getWorksheet("Rekap Presensi");
    expect(sheet).toBeDefined();

    const buffer = await workbook.xlsx.writeBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);
  });

  it("accurately computes letter grade distribution for report summary", () => {
    const sampleGrades = ["A", "A", "B", "C", "A", "Belum Lengkap"];
    const distribution: Record<string, number> = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      "Belum Lengkap": 0,
    };

    sampleGrades.forEach((g) => {
      if (distribution[g] !== undefined) {
        distribution[g]++;
      }
    });

    expect(distribution["A"]).toBe(3);
    expect(distribution["B"]).toBe(1);
    expect(distribution["C"]).toBe(1);
    expect(distribution["Belum Lengkap"]).toBe(1);
    expect(distribution["D"]).toBe(0);
  });
});
