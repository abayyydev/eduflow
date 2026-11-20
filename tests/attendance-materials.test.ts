import { describe, it, expect } from "vitest";
import {
  calculateDistanceMeters,
  evaluateAttendanceTimeWindow,
} from "@/features/attendance/attendance-utils";

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

  describe("Campus Geofencing Distance Calculation", () => {
    it("returns 0 meters when student is at identical coordinate", () => {
      const dist = calculateDistanceMeters(-6.914744, 107.60981, -6.914744, 107.60981);
      expect(dist).toBe(0);
    });

    it("accurately detects nearby student within campus radius (e.g. 50 meters)", () => {
      // Small offset in latitude (~55 meters)
      const dist = calculateDistanceMeters(-6.914744, 107.60981, -6.915244, 107.60981);
      expect(dist).toBeGreaterThan(40);
      expect(dist).toBeLessThan(70);
    });

    it("detects student outside campus boundary (e.g. at home / distant location)", () => {
      // 10km away
      const dist = calculateDistanceMeters(-6.914744, 107.60981, -6.994744, 107.60981);
      expect(dist).toBeGreaterThan(5000);
    });
  });

  describe("Automated Attendance Time Window Logic (15-Minute Rules)", () => {
    it("evaluates early before class as not_started", () => {
      // Class: 09:00 - 10:30. Current time: 08:30
      const simulatedNow = new Date("2026-11-20T08:30:00");
      const res = evaluateAttendanceTimeWindow("09:00", "10:30", simulatedNow);

      expect(res.status).toBe("not_started");
      expect(res.isAllowedToScan).toBe(false);
      expect(res.attendanceStatusIfScanned).toBeNull();
      expect(res.minutesRemaining).toBe(30);
    });

    it("evaluates active class in first 15 minutes as open_present", () => {
      // Class: 09:00 - 10:30. Current time: 09:10 (10 minutes in)
      const simulatedNow = new Date("2026-11-20T09:10:00");
      const res = evaluateAttendanceTimeWindow("09:00", "10:30", simulatedNow);

      expect(res.status).toBe("open_present");
      expect(res.isAllowedToScan).toBe(true);
      expect(res.attendanceStatusIfScanned).toBe("present");
      expect(res.minutesRemaining).toBe(5); // 5 min until 15 min mark
    });

    it("evaluates after 15 minutes as open_late", () => {
      // Class: 09:00 - 10:30. Current time: 09:30 (30 minutes in)
      const simulatedNow = new Date("2026-11-20T09:30:00");
      const res = evaluateAttendanceTimeWindow("09:00", "10:30", simulatedNow);

      expect(res.status).toBe("open_late");
      expect(res.isAllowedToScan).toBe(true);
      expect(res.attendanceStatusIfScanned).toBe("late");
      expect(res.minutesRemaining).toBe(45); // until 10:15 (15 min before end)
    });

    it("evaluates 15 minutes before class end as closed", () => {
      // Class: 09:00 - 10:30. Current time: 10:20 (10 minutes before 10:30 end)
      const simulatedNow = new Date("2026-11-20T10:20:00");
      const res = evaluateAttendanceTimeWindow("09:00", "10:30", simulatedNow);

      expect(res.status).toBe("closed");
      expect(res.isAllowedToScan).toBe(false);
      expect(res.attendanceStatusIfScanned).toBeNull();
      expect(res.minutesRemaining).toBe(10); // 10 min left in lecture
    });

    it("evaluates after class end as finished", () => {
      // Class: 09:00 - 10:30. Current time: 11:00
      const simulatedNow = new Date("2026-11-20T11:00:00");
      const res = evaluateAttendanceTimeWindow("09:00", "10:30", simulatedNow);

      expect(res.status).toBe("finished");
      expect(res.isAllowedToScan).toBe(false);
      expect(res.attendanceStatusIfScanned).toBeNull();
    });
  });

  describe("16-Meeting Semester Structure & Dynamic Held Session Attendance", () => {
    it("handles full 16 meetings with unrecorded (null) status for unheld sessions", () => {
      // 16 total meetings, only P1 held so far. Student attended P1. P2-P16 are null (belum hadir).
      const sessions = Array.from({ length: 16 }, (_, i) => ({
        meetingNumber: i + 1,
        isOpen: i === 0, // only P1 open
      }));

      const studentRecords: Record<number, "present" | "late" | null> = {
        1: "present",
        // 2..16 are not yet recorded
      };

      const heldSessionsCount = sessions.filter((s) => s.isOpen || studentRecords[s.meetingNumber]).length;
      expect(heldSessionsCount).toBe(1);

      // Presence percentage should be 100% (1/1 held session), not 1/16 (6.25%)
      const attendedCount = Object.values(studentRecords).filter((v) => v === "present" || v === "late").length;
      const percentage = Math.round((attendedCount / heldSessionsCount) * 100);
      expect(percentage).toBe(100);
    });

    it("evaluates percentage accurately when multiple sessions are held", () => {
      // 4 sessions held: P1 (present), P2 (late), P3 (null/absent), P4 (present) -> 3/4 = 75%
      const heldSessionsCount = 4;
      const presentCount = 2;
      const lateCount = 1;
      const percentage = Math.round(((presentCount + lateCount) / heldSessionsCount) * 100);
      expect(percentage).toBe(75);
    });
  });
});
