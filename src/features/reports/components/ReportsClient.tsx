"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Download,
  Users,
  FileCheck2,
  Lock,
  Globe,
} from "lucide-react";
import { type ClassReportSummary } from "../actions";

interface ReportsClientProps {
  initialReports: ClassReportSummary[];
}

export const ReportsClient: React.FC<ReportsClientProps> = ({ initialReports }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>("all");

  const filteredReports =
    selectedClassId === "all"
      ? initialReports
      : initialReports.filter((r) => r.classId === selectedClassId);

  // Overall aggregate
  const totalClasses = initialReports.length;
  const totalStudentsEnrolled = initialReports.reduce((acc, r) => acc + r.totalStudents, 0);
  const totalSubmissionsGathered = initialReports.reduce((acc, r) => acc + r.totalSubmissions, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
            Laporan Akademik & Ekspor Data
          </h1>
          <p className="text-sm text-[#667085] mt-0.5">
            Analisis performa kelas, distribusi huruf mutu, dan pusat unduhan berkas akademik (XLSX/CSV).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="rounded-lg border border-[#E4E9F2] bg-white px-3 py-2 text-xs font-medium text-[#172033] focus:outline-none focus:border-[#2457D6]"
          >
            <option value="all">Semua Kelas ({totalClasses})</option>
            {initialReports.map((c) => (
              <option key={c.classId} value={c.classId}>
                {c.courseCode} - {c.className}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Aggregate KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">
                Total Kelas Aktif
              </p>
              <p className="text-2xl font-bold text-[#172033] mt-1 tabular-nums">
                {totalClasses}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#EEF3FF] text-[#2457D6] flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">
                Total Mahasiswa Terdaftar
              </p>
              <p className="text-2xl font-bold text-[#172033] mt-1 tabular-nums">
                {totalStudentsEnrolled}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#E8F5EF] text-[#16845B] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">
                Total Pengumpulan Tugas
              </p>
              <p className="text-2xl font-bold text-[#172033] mt-1 tabular-nums">
                {totalSubmissionsGathered}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#EDF5FA] text-[#2878B8] flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Reports per Class */}
      {filteredReports.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-xs text-[#667085]">Tidak ada data kelas yang dapat ditampilkan.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredReports.map((report) => (
            <Card key={report.classId} className="p-6 space-y-6">
              {/* Class Header & Status */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E9F2] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#EEF3FF] text-[#2457D6] uppercase tracking-wider">
                      {report.courseCode} &bull; {report.classCode}
                    </span>
                    <span className="text-xs text-[#667085]">{report.termName}</span>
                    {report.isGradingLocked && (
                      <Badge variant="danger">
                        <Lock className="w-3 h-3 mr-1" /> Terkunci
                      </Badge>
                    )}
                    {report.isGradesPublished ? (
                      <Badge variant="success">
                        <Globe className="w-3 h-3 mr-1" /> Nilai Terbit
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Draft Belum Terbit
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-[#172033]">
                    {report.className}
                  </h3>
                </div>

                {/* Quick Exports */}
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`/api/export/gradebook?classId=${report.classId}&format=xlsx`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2457D6] text-white hover:bg-[#1D47B2] shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Rekap Nilai (XLSX)</span>
                  </a>

                  <a
                    href={`/api/export/attendance?classId=${report.classId}&format=xlsx`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#16845B] text-white hover:bg-[#116A49] shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Rekap Presensi (XLSX)</span>
                  </a>

                  <a
                    href={`/api/export/gradebook?classId=${report.classId}&format=csv`}
                    download
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-[#E4E9F2] text-[#667085] hover:bg-[#F6F8FC] shadow-2xs transition-colors"
                  >
                    <span>CSV Nilai</span>
                  </a>

                  <a
                    href={`/api/export/attendance?classId=${report.classId}&format=csv`}
                    download
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-[#E4E9F2] text-[#667085] hover:bg-[#F6F8FC] shadow-2xs transition-colors"
                  >
                    <span>CSV Presensi</span>
                  </a>
                </div>
              </div>

              {/* Class Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-[#F6F8FC] rounded-xl border border-[#E4E9F2]">
                  <p className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                    Peserta Kelas
                  </p>
                  <p className="text-xl font-bold text-[#172033] mt-1 tabular-nums">
                    {report.totalStudents} Mahasiswa
                  </p>
                </div>

                <div className="p-3 bg-[#F6F8FC] rounded-xl border border-[#E4E9F2]">
                  <p className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                    Rata-rata Nilai
                  </p>
                  <p className="text-xl font-bold text-[#2457D6] mt-1 tabular-nums">
                    {report.averageGrade !== null ? report.averageGrade : "—"}
                  </p>
                </div>

                <div className="p-3 bg-[#F6F8FC] rounded-xl border border-[#E4E9F2]">
                  <p className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                    Rata-rata Kehadiran
                  </p>
                  <p className="text-xl font-bold text-[#16845B] mt-1 tabular-nums">
                    {report.averageAttendancePercent}%
                  </p>
                </div>

                <div className="p-3 bg-[#F6F8FC] rounded-xl border border-[#E4E9F2]">
                  <p className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                    Tugas & Pengumpulan
                  </p>
                  <p className="text-xl font-bold text-[#172033] mt-1 tabular-nums">
                    {report.totalSubmissions} / {report.totalAssignments * report.totalStudents}
                  </p>
                </div>
              </div>

              {/* Grade Distribution Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                    Distribusi Huruf Mutu
                  </h4>
                  <span className="text-[11px] text-[#667085]">
                    Total: {report.totalStudents} Mahasiswa
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {Object.entries(report.gradeDistribution).map(([grade, count]) => {
                    const pct =
                      report.totalStudents > 0
                        ? Math.round((count / report.totalStudents) * 100)
                        : 0;

                    const colorClass =
                      grade.startsWith("A")
                        ? "text-[#16845B] bg-[#E8F5EF] border-[#16845B]/20"
                        : grade.startsWith("B")
                        ? "text-[#2457D6] bg-[#EEF3FF] border-[#2457D6]/20"
                        : grade.startsWith("C")
                        ? "text-[#B7791F] bg-[#FDF5E6] border-[#B7791F]/20"
                        : grade === "Belum Lengkap"
                        ? "text-[#667085] bg-[#F6F8FC] border-[#E4E9F2]"
                        : "text-[#C43D4B] bg-[#FCECEE] border-[#C43D4B]/20";

                    return (
                      <div
                        key={grade}
                        className={`p-2.5 rounded-lg border flex flex-col items-center justify-center ${colorClass}`}
                      >
                        <span className="text-base font-bold tabular-nums">{count}</span>
                        <span className="text-[10px] font-medium opacity-80">
                          {grade} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
