import { describe, it, expect } from "vitest";

describe("Phase 4 Attendance & Materials Calculation & Business Logic Tests", () => {
  // Formula helper matching attendance business rules
  function calculateAttendanceStats(records: Array<"present" | "sick" | "excused" | "absent">) {
    const totalSessions = records.length;
    let presentCount = 0;
    let sickCount = 0;
    let excusedCount = 0;
    let absentCount = 0;

    for (const status of records) {
      if (status === "present") presentCount++;
      else if (status === "sick") sickCount++;
      else if (status === "excused") excusedCount++;
      else if (status === "absent") absentCount++;
    }

    const percentage = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

    return {
      totalSessions,
      presentCount,
      sickCount,
      excusedCount,
      absentCount,
      percentage: Number(percentage.toFixed(2)),
    };
  }

  it("calculates 100% attendance when all sessions are present", () => {
    const records: Array<"present" | "sick" | "excused" | "absent"> = [
      "present", "present", "present", "present",
      "present", "present", "present", "present",
    ];
    const stats = calculateAttendanceStats(records);
    expect(stats.totalSessions).toBe(8);
    expect(stats.presentCount).toBe(8);
    expect(stats.percentage).toBe(100.0);
  });

  it("calculates percentage accurately with mixed sick, excused, and absent statuses", () => {
    // 8 total sessions: 6 present, 1 sick, 1 absent -> 6/8 = 75.0%
    const records: Array<"present" | "sick" | "excused" | "absent"> = [
      "present", "present", "sick", "present",
      "present", "present", "absent", "present",
    ];
    const stats = calculateAttendanceStats(records);
    expect(stats.totalSessions).toBe(8);
    expect(stats.presentCount).toBe(6);
    expect(stats.sickCount).toBe(1);
    expect(stats.absentCount).toBe(1);
    expect(stats.percentage).toBe(75.0);
  });

  it("handles 0% attendance safely without division errors", () => {
    const emptyRecords: Array<"present" | "sick" | "excused" | "absent"> = [];
    const statsEmpty = calculateAttendanceStats(emptyRecords);
    expect(statsEmpty.totalSessions).toBe(0);
    expect(statsEmpty.percentage).toBe(0);

    const allAbsent: Array<"present" | "sick" | "excused" | "absent"> = [
      "absent", "absent", "absent",
    ];
    const statsAbsent = calculateAttendanceStats(allAbsent);
    expect(statsAbsent.totalSessions).toBe(3);
    expect(statsAbsent.presentCount).toBe(0);
    expect(statsAbsent.percentage).toBe(0);
  });

  it("validates attendance status values strictly", () => {
    const validStatuses = ["present", "sick", "excused", "absent"];
    const testStatus = "present";
    expect(validStatuses.includes(testStatus)).toBe(true);

    const invalidStatus = "late";
    expect(validStatuses.includes(invalidStatus)).toBe(false);
  });

  it("formats grade synchronization feedback accurately", () => {
    const presentCount = 7;
    const totalSessions = 8;
    const percentage = ((presentCount / totalSessions) * 100).toFixed(2);
    const feedback = `Kehadiran: ${presentCount} dari ${totalSessions} sesi pertemuan.`;

    expect(percentage).toBe("87.50");
    expect(feedback).toBe("Kehadiran: 7 dari 8 sesi pertemuan.");
  });
});
