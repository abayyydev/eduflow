"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  QrCode,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X,
  Maximize2,
  Users,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { getClassBarcodeData } from "../actions";
import { evaluateAttendanceTimeWindow } from "../attendance-utils";
import { Button } from "@/components/ui/button";

interface ClassBarcodePresenterModalProps {
  classId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ClassBarcodePresenterModal({
  classId,
  isOpen,
  onClose,
}: ClassBarcodePresenterModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [data, setData] = useState<any>(null);
  const [isSimulation, setIsSimulation] = useState(false);
  const [simulatedWindow, setSimulatedWindow] = useState<"present" | "late">("present");
  const [loading, setLoading] = useState(true);

  // Fetch barcode data
  const fetchData = async () => {
    try {
      const res = await getClassBarcodeData(classId);
      setData(res);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchData();
      const interval = setInterval(fetchData, 4000); // Polling scanned students
      return () => clearInterval(interval);
    }
  }, [isOpen, classId]);

  // Render QR Code onto canvas
  useEffect(() => {
    if (data?.classInfo?.qrCodeToken && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        data.classInfo.qrCodeToken,
        {
          width: 280,
          margin: 2,
          color: {
            dark: "#0F172A",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) console.error(error);
        }
      );
    }
  }, [data?.classInfo?.qrCodeToken, isOpen]);

  if (!isOpen) return null;

  const timeWindow = isSimulation
    ? {
        status: simulatedWindow === "present" ? "open_present" : "open_late",
        label: simulatedWindow === "present" ? "Terbuka: Hadir" : "Terbuka: Terlambat",
        isAllowedToScan: true,
        message:
          simulatedWindow === "present"
            ? "Presensi dibuka tepat waktu (15 menit pertama = HADIR)."
            : "Presensi dibuka terlambat (Status: TERLAMBAT).",
        minutesRemaining: 15,
      }
    : (data?.timeWindow || evaluateAttendanceTimeWindow());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-white/60 max-w-2xl w-full p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-extrabold uppercase tracking-wider">
            <QrCode className="w-3.5 h-3.5" />
            <span>Barcode Presensi Perkuliahan</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {data?.classInfo?.displayName || "Memuat Mata Kuliah..."}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Jadwal: {data?.classInfo?.scheduleDay?.toUpperCase()} &bull; Pukul {data?.classInfo?.startTime} - {data?.classInfo?.endTime} WIB
          </p>
        </div>

        {/* Real-time Status Banner */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold transition-all ${
            timeWindow.status === "open_present"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : timeWindow.status === "open_late"
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-extrabold text-sm">{timeWindow.label}</p>
              <p className="font-medium text-[11px] opacity-90">{timeWindow.message}</p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-white/80 border text-[11px] font-extrabold">
              {timeWindow.status === "open_present"
                ? "🟢 15 Mnt Pertama"
                : timeWindow.status === "open_late"
                ? "🟡 Terlambat"
                : "🔴 Selesai/Tutup"}
            </span>
          </div>
        </div>

        {/* QR Code Canvas and Info */}
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
          {/* Canvas */}
          <div className="p-4 bg-white rounded-2xl border-2 border-slate-200/80 shadow-md flex flex-col items-center justify-center">
            <canvas ref={canvasRef} className="rounded-lg" />
            <span className="text-[11px] font-mono font-extrabold tracking-widest text-slate-800 mt-2">
              TOKEN: {data?.classInfo?.qrCodeToken}
            </span>
          </div>

          {/* Rules & Live Feed */}
          <div className="space-y-4 max-w-xs text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-cyan-600" />
                <span>Geofencing Kampus Aktif</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Hanya mahasiswa yang berada dalam radius <strong>{data?.classInfo?.campusRadiusMeters || 300} meter</strong> dari kampus yang dapat melakukan scan barcode.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>Presensi Hari Ini</span>
                </div>
                <span className="text-teal-700 font-extrabold">
                  {data?.attendedStudents?.length || 0} Mahasiswa
                </span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] text-slate-600">
                {data?.attendedStudents?.length === 0 ? (
                  <p className="text-slate-400 italic">Menunggu mahasiswa scan...</p>
                ) : (
                  data?.attendedStudents?.map((st: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-0.5 border-b border-slate-100">
                      <span className="truncate max-w-[140px] font-semibold">{st.name}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          st.status === "present"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {st.status === "present" ? "Hadir" : "Terlambat"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Testing Controls */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-600">Mode Uji Coba / Simulasi:</span>
            <button
              onClick={() => setIsSimulation(!isSimulation)}
              className={`px-2.5 py-1 rounded-lg font-bold border transition ${
                isSimulation
                  ? "bg-amber-50 border-amber-300 text-amber-800"
                  : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {isSimulation ? "Simulasi Aktif" : "Gunakan Jam Nyata"}
            </button>

            {isSimulation && (
              <select
                value={simulatedWindow}
                onChange={(e) => setSimulatedWindow(e.target.value as any)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-800 bg-white"
              >
                <option value="present">Status: Hadir (&lt; 15 Mnt)</option>
                <option value="late">Status: Terlambat (&gt; 15 Mnt)</option>
              </select>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
            Tutup Layar
          </Button>
        </div>
      </div>
    </div>
  );
}
