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

/**
 * Gets minutes from midnight in Indonesia Western Time (WIB / Asia/Jakarta).
 * Guarantees consistent evaluation across servers (Vercel/cPanel UTC) and clients.
 */
export function getJakartaMinutes(simulatedNow?: Date): number {
  if (simulatedNow) {
    return simulatedNow.getHours() * 60 + simulatedNow.getMinutes();
  }
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  let h = 0;
  let m = 0;
  for (const p of parts) {
    if (p.type === "hour") h = parseInt(p.value, 10);
    if (p.type === "minute") m = parseInt(p.value, 10);
  }
  if (h === 24) h = 0;
  return h * 60 + m;
}

/**
 * Evaluates attendance time window based on lecturer control and class schedule.
 * User requirement:
 * - Pembukaan presensi dikontrol oleh dosen (begitu dibuka oleh dosen, mahasiswa langsung bisa absen).
 * - Tidak ada blokir otomatis sebelum mulai jika dosen sudah membuka sesi.
 * - Presensi hanya otomatis mati saat jam pelajaran selesai (now > endTime).
 * - Status kehadiran:
 *   - Jika absen dalam 15 menit pertama jadwal kuliah (atau jika dibuka lebih awal): HADIR.
 *   - Jika absen setelah 15 menit pertama hingga jam kuliah habis: TERLAMBAT.
 *   - Jika jam kuliah habis: FINISHED (Presensi ditutup otomatis).
 */
export function evaluateAttendanceTimeWindow(
  startTimeStr: string = "09:00",
  endTimeStr: string = "10:30",
  simulatedNow?: Date,
  isSessionOpen?: boolean
): TimeWindowEvaluation {
  const currentMinutes = getJakartaMinutes(simulatedNow);

  const [startH, startM] = startTimeStr.split(":").map(Number);
  const [endH, endM] = endTimeStr.split(":").map(Number);

  const startMinutes = (startH || 9) * 60 + (startM || 0);
  const endMinutes = (endH || 10) * 60 + (endM || 30);

  const presentEndMinutes = startMinutes + 15; // 15 menit pertama dari jadwal = HADIR

  // 1. Jika jam perkuliahan sudah selesai/habis (melewati jam selesai perkuliahan): otomatis mati
  if (currentMinutes > endMinutes) {
    return {
      status: "finished",
      label: "Perkuliahan Selesai",
      isAllowedToScan: false,
      attendanceStatusIfScanned: null,
      message: `Jadwal perkuliahan telah berakhir (pukul ${endTimeStr} WIB). Presensi otomatis ditutup.`,
      minutesRemaining: 0,
    };
  }

  // 2. Tentukan status keterbukaan sesi
  // Jika isSessionOpen tidak dipassing secara eksplisit, tentukan berdasarkan rentang jam kuliah
  const open = isSessionOpen !== undefined
    ? isSessionOpen
    : (currentMinutes >= startMinutes && currentMinutes <= endMinutes);

  if (!open) {
    const diff = Math.max(0, startMinutes - currentMinutes);
    return {
      status: "not_started",
      label: "Sesi Belum Dibuka",
      isAllowedToScan: false,
      attendanceStatusIfScanned: null,
      message: "Sesi presensi belum dibuka oleh dosen. Mahasiswa dapat memindai presensi setelah dosen membuka pertemuan di kelas.",
      minutesRemaining: diff,
    };
  }

  // 3. Sesi dibuka oleh dosen & jam perkuliahan belum habis:
  // a. Tepat waktu (sebelum jadwal atau dalam 15 menit pertama)
  if (currentMinutes <= presentEndMinutes) {
    const diff = Math.max(0, presentEndMinutes - currentMinutes);
    return {
      status: "open_present",
      label: "Buka (Hadir)",
      isAllowedToScan: true,
      attendanceStatusIfScanned: "present",
      message: diff > 0
        ? `Sesi presensi HADIR aktif (sisa ${diff} menit sebelum batas toleransi keterlambatan).`
        : "Sesi presensi HADIR aktif dibuka oleh dosen.",
      minutesRemaining: diff,
    };
  }

  // b. Terlambat (setelah 15 menit pertama hingga jam kuliah habis)
  const remainingUntilEnd = Math.max(0, endMinutes - currentMinutes);
  return {
    status: "open_late",
    label: "Buka (Terlambat)",
    isAllowedToScan: true,
    attendanceStatusIfScanned: "late",
    message: `Sesi presensi aktif dibuka oleh dosen (Status: TERLAMBAT). Sesi otomatis berakhir saat kuliah selesai (${remainingUntilEnd} menit lagi).`,
    minutesRemaining: remainingUntilEnd,
  };
}
