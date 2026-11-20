/**
 * Pure utility functions for Attendance Geofencing & Time Windows
 * Safe for both Client and Server usage.
 */

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export type TimeWindowEvaluation = {
  status: "not_started" | "open_present" | "open_late" | "closed" | "finished";
  label: string;
  isAllowedToScan: boolean;
  attendanceStatusIfScanned: "present" | "late" | null;
  message: string;
  minutesRemaining: number;
};

export function evaluateAttendanceTimeWindow(
  startTimeStr: string = "09:00",
  endTimeStr: string = "10:30",
  simulatedNow?: Date
): TimeWindowEvaluation {
  const now = simulatedNow || new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = startTimeStr.split(":").map(Number);
  const [endH, endM] = endTimeStr.split(":").map(Number);

  const startMinutes = (startH || 9) * 60 + (startM || 0);
  const endMinutes = (endH || 10) * 60 + (endM || 30);

  const presentEndMinutes = startMinutes + 15; // 15 menit pertama = HADIR
  const lateEndMinutes = endMinutes - 15;      // 15 menit sebelum selesai = batas TERLAMBAT

  if (currentMinutes < startMinutes) {
    const diff = startMinutes - currentMinutes;
    return {
      status: "not_started",
      label: "Belum Dimulai",
      isAllowedToScan: false,
      attendanceStatusIfScanned: null,
      message: `Presensi otomatis aktif pukul ${startTimeStr} WIB (dalam ${diff} menit).`,
      minutesRemaining: diff,
    };
  }

  if (currentMinutes >= startMinutes && currentMinutes < presentEndMinutes) {
    const diff = presentEndMinutes - currentMinutes;
    return {
      status: "open_present",
      label: "Buka (Hadir)",
      isAllowedToScan: true,
      attendanceStatusIfScanned: "present",
      message: `Sesi presensi HADIR aktif (sisa ${diff} menit sebelum terhitung terlambat).`,
      minutesRemaining: diff,
    };
  }

  if (currentMinutes >= presentEndMinutes && currentMinutes < lateEndMinutes) {
    const diff = lateEndMinutes - currentMinutes;
    return {
      status: "open_late",
      label: "Buka (Terlambat)",
      isAllowedToScan: true,
      attendanceStatusIfScanned: "late",
      message: `Presensi terhitung TERLAMBAT. Sesi ditutup otomatis dalam ${diff} menit (15 mnt sebelum kuliah usai).`,
      minutesRemaining: diff,
    };
  }

  if (currentMinutes >= lateEndMinutes && currentMinutes <= endMinutes) {
    const diff = endMinutes - currentMinutes;
    return {
      status: "closed",
      label: "Presensi Ditutup",
      isAllowedToScan: false,
      attendanceStatusIfScanned: null,
      message: `Presensi ditutup otomatis pada 15 menit sebelum kuliah selesai. Perkuliahan usai dalam ${diff} menit.`,
      minutesRemaining: diff,
    };
  }

  return {
    status: "finished",
    label: "Perkuliahan Selesai",
    isAllowedToScan: false,
    attendanceStatusIfScanned: null,
    message: "Jadwal perkuliahan untuk hari ini telah selesai. Barcode akan otomatis aktif kembali pada jam kuliah jadwal berikutnya.",
    minutesRemaining: 0,
  };
}
