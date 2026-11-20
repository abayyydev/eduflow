"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import jsQR from "jsqr";
import {
  QrCode,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Camera,
  CameraOff,
  Navigation,
  RefreshCw,
  Sparkles,
  BookOpen,
  Send,
  Calendar,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  scanStudentQrAttendance,
} from "../actions";
import { calculateDistanceMeters } from "../attendance-utils";

interface StudentAttendanceScanProps {
  initialData: {
    classes: Array<{
      classId: string;
      displayName: string;
      classCode: string;
      courseCode: string;
      courseName: string;
      scheduleText: string | null;
      qrCodeToken: string | null;
      startTime: string;
      endTime: string;
      campusRadiusMeters: number | null;
      campusLatitude: string | null;
      campusLongitude: string | null;
      timeWindow: {
        status: "open_present" | "open_late" | "closed" | "not_started" | "finished";
        label: string;
        isAllowedToScan: boolean;
        message: string;
        minutesRemaining: number;
      };
      todayStatus: string | null;
      activeOpenMeeting?: number | null;
    }>;
    recentRecords: Array<{
      classId: string;
      className: string;
      meetingNumber: number;
      sessionDate: string;
      status: string;
      scannedAt: Date | null;
      distanceMeters: number | null;
    }>;
  };
}

export function StudentAttendanceScanClient({ initialData }: StudentAttendanceScanProps) {
  const [data, setData] = useState(initialData);
  const [selectedClassId, setSelectedClassId] = useState<string>(
    data.classes[0]?.classId || ""
  );

  // Scanner state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [manualToken, setManualToken] = useState<string>("");
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(true);

  // Scan result state
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    status?: "present" | "late";
    distanceMeters?: number;
  } | null>(null);

  const [isSimulation, setIsSimulation] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const selectedClass = data.classes.find((c) => c.classId === selectedClassId) || data.classes[0];

  // Campus coordinates from selected class
  const campusLat = parseFloat(selectedClass?.campusLatitude || "-6.914744");
  const campusLon = parseFloat(selectedClass?.campusLongitude || "107.60981");
  const campusRadius = selectedClass?.campusRadiusMeters || 300;

  // Calculate distance if location available
  const currentDistance = userLocation
    ? calculateDistanceMeters(userLocation.lat, userLocation.lon, campusLat, campusLon)
    : null;

  const isInsideCampus = currentDistance !== null && currentDistance <= campusRadius;

  // 1. Get GPS Location
  const requestLocation = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError("Perangkat atau peramban tidak mendukung Geolocation GPS.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setGpsLoading(false);
      },
      (err) => {
        console.warn("Geolocation warning:", err.message);
        // Default fallback coordinate near campus for demo if blocked
        setUserLocation({
          lat: -6.914800,
          lon: 107.609750,
        });
        setGpsError("GPS peramban tidak diizinkan. Menggunakan simulasi koordinat kampus.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // 2. Start / Stop Camera Scanner
  const startCamera = async () => {
    setCameraError(null);
    setScanResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setIsCameraActive(true);
        scanFrame();
      }
    } catch (err: any) {
      console.error(err);
      setCameraError("Kamera tidak dapat diakses atau izin ditolak. Anda dapat memasukkan kode token manual di bawah.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Continuous frame scanning with jsQR
  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        canvas.height = videoRef.current.videoHeight;
        canvas.width = videoRef.current.videoWidth;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          stopCamera();
          handleProcessAttendance(code.data);
          return;
        }
      }
    }

    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // 3. Process Attendance
  const handleProcessAttendance = (tokenToSubmit: string) => {
    if (!tokenToSubmit.trim()) {
      alert("Masukkan token presensi yang valid");
      return;
    }

    const lat = userLocation ? userLocation.lat : campusLat;
    const lon = userLocation ? userLocation.lon : campusLon;

    startTransition(async () => {
      const res = await scanStudentQrAttendance({
        qrToken: tokenToSubmit.trim(),
        latitude: lat,
        longitude: lon,
        isSimulation,
      });

      if (res.error) {
        setScanResult({
          success: false,
          message: res.error,
          distanceMeters: res.distanceMeters,
        });
      } else {
        setScanResult({
          success: true,
          status: res.status,
          message: res.message || "Presensi berhasil dicatat!",
          distanceMeters: res.distanceMeters,
        });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-extrabold uppercase tracking-wider mb-2">
          <QrCode className="w-3.5 h-3.5" />
          <span>Presensi Mahasiswa</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Scan Barcode Presensi Kuliah
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Arahkan kamera ke Barcode / QR Code yang ditampilkan oleh Dosen di kelas. Presensi otomatis memvalidasi waktu perkuliahan dan radius kehadiran di area kampus.
        </p>
      </div>

      {/* Main Scanner & GPS Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Scanner */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 rounded-3xl border-white/80 bg-white/70 backdrop-blur-md shadow-sm space-y-5">
            {/* GPS Campus Geofence Status Pill */}
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${isInsideCampus || isSimulation
                ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                : "bg-red-50/80 border-red-200 text-red-900"
                }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${isInsideCampus || isSimulation
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                    }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-extrabold text-sm">
                    {isInsideCampus || isSimulation
                      ? "Di Dalam Wilayah Kampus ✓"
                      : "Di Luar Wilayah Kampus ✕"}
                  </p>
                  <p className="text-[11px] opacity-80">
                    Jarak ke kampus:{" "}
                    <strong>
                      {currentDistance !== null ? `${currentDistance} meter` : "Mendeteksi..."}
                    </strong>{" "}
                    (Batas toleransi radius: {campusRadius}m)
                  </p>
                </div>
              </div>

              <button
                onClick={requestLocation}
                disabled={gpsLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-white/90 text-xs font-bold hover:bg-white transition self-end sm:self-auto shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${gpsLoading ? "animate-spin" : ""}`} />
                <span>Perbarui GPS</span>
              </button>
            </div>

            {/* Camera Scanner Viewfinder */}
            <div className="relative aspect-video sm:aspect-[4/3] w-full max-h-[380px] rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-200 shadow-inner flex flex-col items-center justify-center">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${!isCameraActive ? "hidden" : ""}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder Target Graphic */}
              {isCameraActive ? (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-cyan-400 rounded-2xl relative shadow-lg">
                    <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-cyan-400" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-cyan-400" />
                    <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-cyan-400" />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-cyan-400" />
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse mt-28" />
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 text-slate-400 space-y-3">
                  <div className="h-16 w-16 rounded-2xl bg-slate-800 text-cyan-400 flex items-center justify-center mx-auto border border-slate-700">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Kamera Belum Aktif</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Klik tombol di bawah untuk mengaktifkan pemindai barcode kamera perangkat Anda.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Control Buttons */}
            <div className="flex items-center justify-between gap-3">
              {isCameraActive ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={stopCamera}
                  className="rounded-xl flex items-center gap-2"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>Matikan Kamera</span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={startCamera}
                  className="rounded-xl flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700"
                >
                  <Camera className="w-4 h-4" />
                  <span>Buka Pemindai Barcode</span>
                </Button>
              )}

              {/* Simulation Mode Toggle */}
              <button
                onClick={() => setIsSimulation(!isSimulation)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${isSimulation
                  ? "bg-amber-50 border-amber-300 text-amber-800"
                  : "bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-slate-200/70"
                  }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isSimulation ? "Mode Uji Coba: Aktif" : "Uji Coba Mandiri"}</span>
              </button>
            </div>

            {cameraError && (
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                {cameraError}
              </p>
            )}

            {/* Manual Token Input Alternative */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Atau Masukkan Kode Token Barcode Manual:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Contoh: EDF-A89F"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value.toUpperCase())}
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono font-bold tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProcessAttendance(manualToken)}
                  disabled={isPending || !manualToken.trim()}
                  className="rounded-xl shrink-0"
                >
                  <Send className="w-3.5 h-3.5 mr-1 text-cyan-600" />
                  <span>Kirim Presensi</span>
                </Button>
              </div>
            </div>

            {/* Result Alert Box */}
            {scanResult && (
              <div
                className={`p-4 rounded-2xl border text-xs font-bold flex items-start gap-3 ${scanResult.success
                  ? "bg-teal-50 border-teal-200 text-teal-900"
                  : "bg-red-50 border-red-200 text-red-900"
                  }`}
              >
                {scanResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="text-sm font-extrabold">{scanResult.message}</p>
                  {scanResult.distanceMeters && (
                    <p className="text-[11px] font-medium opacity-80">
                      Jarak GPS Tercatat: {scanResult.distanceMeters} meter dari kampus.
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Col: Class Info & Rules */}
        <div className="space-y-4">
          {/* Rules Card */}
          <Card className="p-5 rounded-3xl border-white/80 bg-white/70 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Aturan Waktu Presensi
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <span className="font-extrabold text-emerald-800 block">
                  🟢 15 Menit Pertama
                </span>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Mahasiswa yang scan dalam 15 menit pertama jam kuliah dicatat <strong>HADIR</strong> penuh.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 space-y-1">
                <span className="font-extrabold text-amber-800 block">
                  🟡 Setelah 15 Menit
                </span>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Scan setelah 15 menit pertama hingga 15 menit sebelum kuliah selesai dicatat <strong>TERLAMBAT</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-red-50/70 border border-red-100 space-y-1">
                <span className="font-extrabold text-red-800 block">
                  🔴 15 Menit Sebelum Selesai
                </span>
                <p className="text-[11px] text-red-700 leading-relaxed">
                  Presensi ditutup otomatis. Mahasiswa yang belum scan tidak dapat absen dan dicatat <strong>ALPHA</strong>.
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Class Token Preview */}
          <Card className="p-5 rounded-3xl border-white/80 bg-white/70 backdrop-blur-md shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Jadwal Kuliah Anda
            </h3>

            <div className="space-y-2">
              {data.classes.map((cls) => (
                <div
                  key={cls.classId}
                  onClick={() => {
                    setSelectedClassId(cls.classId);
                    if (cls.qrCodeToken) setManualToken(cls.qrCodeToken);
                  }}
                  className={`p-3 rounded-2xl border text-xs cursor-pointer transition ${selectedClassId === cls.classId
                    ? "bg-cyan-50 border-cyan-300 shadow-xs"
                    : "bg-white/60 border-slate-200/70 hover:bg-white"
                    }`}
                >
                  <p className="font-bold text-slate-900 line-clamp-1">{cls.displayName}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {cls.scheduleText || "Jadwal reguler"}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px]">
                    <div className="flex items-center gap-1.5 font-bold text-cyan-700">
                      <span>Token: {cls.qrCodeToken}</span>
                      {cls.activeOpenMeeting && (
                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[9px]">
                          P{cls.activeOpenMeeting} BUKA
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded font-extrabold ${cls.todayStatus === "present"
                        ? "bg-emerald-100 text-emerald-800"
                        : cls.todayStatus === "late"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                        }`}
                    >
                      {cls.todayStatus === "present"
                        ? "Hadir ✓"
                        : cls.todayStatus === "late"
                          ? "Terlambat"
                          : "Belum Absen"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Attendance History Table */}
      <Card className="p-6 rounded-3xl border-white/80 bg-white/70 backdrop-blur-md shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-600" />
            <h3 className="text-sm font-extrabold text-slate-900">
              Riwayat Presensi Terbaru Anda
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {data.recentRecords.length} Catatan Presensi
          </span>
        </div>

        {data.recentRecords.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-6 text-center">
            Belum ada riwayat presensi tercatat.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 px-3 font-bold">Mata Kuliah</th>
                  <th className="py-2.5 px-3 font-bold">Pertemuan</th>
                  <th className="py-2.5 px-3 font-bold">Tanggal</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                  <th className="py-2.5 px-3 font-bold">Jarak Kampus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentRecords.map((r, idx) => (
                  <tr key={idx} className="hover:bg-cyan-50/20">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{r.className}</td>
                    <td className="py-2.5 px-3 text-slate-600">Ke-{r.meetingNumber}</td>
                    <td className="py-2.5 px-3 text-slate-600">{r.sessionDate}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-extrabold text-[11px] ${r.status === "present"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : r.status === "late"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                      >
                        {r.status === "present"
                          ? "Hadir"
                          : r.status === "late"
                            ? "Terlambat"
                            : r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {r.distanceMeters !== null ? `${r.distanceMeters}m` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

