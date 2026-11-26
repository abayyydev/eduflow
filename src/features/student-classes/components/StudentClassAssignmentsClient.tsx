"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Clock,
  ArrowRight,
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Award,
  Video,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { formatDateTime, isPastDeadline, isDeadlineApproaching } from "@/lib/utils";

export interface StudentClassAssignmentItem {
  id: string;
  title: string;
  instructions: string;
  dueAt: Date | null;
  opensAt: Date | null;
  maxScore: string;
  submissionMode: "file" | "url" | "both";
  allowLate: boolean;
  submissionId: string | null;
  submissionStatus:
    | "draft"
    | "submitted"
    | "late"
    | "returned_for_revision"
    | "resubmitted"
    | "graded"
    | null;
  score: string | null;
  submittedAt: Date | null;
  gradedAt: Date | null;
  feedback: string | null;
}

interface StudentClassAssignmentsClientProps {
  classInfo: {
    id: string;
    displayName: string;
    classCode: string;
    scheduleText: string | null;
    courseCode: string;
    courseName: string;
    creditUnits: number | null;
    termName: string;
    lecturerName: string;
    lecturerEmail: string;
  };
  assignments: StudentClassAssignmentItem[];
}

export function StudentClassAssignmentsClient({
  classInfo,
  assignments,
}: StudentClassAssignmentsClientProps) {
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter assignments
  const filtered = assignments.filter((a) => {
    const matchesSearch =
      !searchQuery.trim() ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.instructions.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (filter === "pending") {
      matchesFilter = !a.submissionStatus || a.submissionStatus === "draft";
    } else if (filter === "submitted") {
      matchesFilter =
        a.submissionStatus === "submitted" ||
        a.submissionStatus === "late" ||
        a.submissionStatus === "resubmitted";
    } else if (filter === "graded") {
      matchesFilter = a.submissionStatus === "graded";
    } else if (filter === "revision") {
      matchesFilter = a.submissionStatus === "returned_for_revision";
    }

    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedAssignments = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Statistics
  const totalCount = assignments.length;
  const submittedCount = assignments.filter(
    (a) => a.submissionStatus && a.submissionStatus !== "draft"
  ).length;
  const pendingCount = totalCount - submittedCount;
  const gradedAssignments = assignments.filter(
    (a) => a.submissionStatus === "graded" && a.score !== null
  );
  const avgScore =
    gradedAssignments.length > 0
      ? (
          gradedAssignments.reduce((acc, a) => acc + parseFloat(a.score || "0"), 0) /
          gradedAssignments.length
        ).toFixed(1)
      : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Back Button & Class Banner */}
      <div>
        <Link
          href={`/student/classes/${classInfo.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Kelas</span>
        </Link>

        {/* Top Header / LMS Navigation Card */}
        <div className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-md p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-cyan-50 border border-cyan-200 text-cyan-800 uppercase tracking-wider">
                  {classInfo.courseCode} &bull; Kelas {classInfo.classCode}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {classInfo.creditUnits} SKS &bull; {classInfo.termName}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {classInfo.displayName}
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>Dosen: <strong className="text-slate-800">{classInfo.lecturerName}</strong></span>
                <span>&bull;</span>
                <span>{classInfo.scheduleText || "Jadwal Reguler"}</span>
              </p>
            </div>

            {/* Navigation Tabs (Overview, Materials, Assignments) */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl self-start md:self-auto text-xs font-bold">
              <Link
                href={`/student/classes/${classInfo.id}`}
                className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-white/80 transition"
              >
                Overview
              </Link>
              <Link
                href={`/student/materials?classId=${classInfo.id}`}
                className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-white/80 transition flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Materials</span>
              </Link>
              <span className="px-3.5 py-1.5 rounded-lg bg-white text-cyan-700 shadow-xs flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-cyan-600" />
                <span>Assignments</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-white/80 bg-white/70 backdrop-blur-md shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total Tugas</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tugas aktif semester ini</p>
        </div>

        <div className="p-4 rounded-xl border border-white/80 bg-white/70 backdrop-blur-md shadow-xs">
          <p className="text-xs font-semibold text-emerald-700">Sudah Dikirim</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{submittedCount}</p>
          <p className="text-[11px] text-emerald-600/70 mt-0.5">Telah dikumpulkan</p>
        </div>

        <div className="p-4 rounded-xl border border-white/80 bg-white/70 backdrop-blur-md shadow-xs">
          <p className="text-xs font-semibold text-amber-700">Belum Dikirim</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
          <p className="text-[11px] text-amber-600/70 mt-0.5">Menunggu pengumpulan</p>
        </div>

        <div className="p-4 rounded-xl border border-white/80 bg-white/70 backdrop-blur-md shadow-xs">
          <p className="text-xs font-semibold text-blue-700">Rata-rata Nilai</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">
            {avgScore !== null ? `${avgScore}` : "—"}
          </p>
          <p className="text-[11px] text-blue-600/70 mt-0.5">
            {gradedAssignments.length} tugas dinilai
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-white/80 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari tugas di kelas ini..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-200/80 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 mr-1" />
          {[
            { id: "all", label: "Semua" },
            { id: "pending", label: "Belum Dikirim" },
            { id: "submitted", label: "Sudah Dikirim" },
            { id: "graded", label: "Dinilai" },
            { id: "revision", label: "Perlu Revisi" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                filter === tab.id
                  ? "bg-cyan-600 text-white shadow-xs"
                  : "bg-slate-100/70 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List */}
      {filtered.length === 0 ? (
        <Card className="py-16 text-center border-white/80 bg-white/60 backdrop-blur-md">
          <FileCheck2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            Tidak Ada Tugas Ditemukan
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || filter !== "all"
              ? "Tidak ada tugas yang cocok dengan filter atau pencarian Anda."
              : "Dosen belum memberikan tugas aktif pada kelas ini."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginatedAssignments.map((a) => {
            const isDueSoon = isDeadlineApproaching(a.dueAt);
            const isOverdue = isPastDeadline(a.dueAt);

            return (
              <div
                key={a.id}
                className="p-5 rounded-2xl border border-white/80 bg-white/70 backdrop-blur-md hover:border-cyan-200 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider">
                      Mode: {a.submissionMode === "both" ? "File / Link URL" : a.submissionMode === "file" ? "Upload File" : "Link URL"}
                    </span>

                    {/* Status Badge */}
                    {a.submissionStatus === "graded" ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Dinilai ({parseFloat(a.score || "0")}/{parseFloat(a.maxScore)})</span>
                      </span>
                    ) : a.submissionStatus === "submitted" ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Sudah Dikirim</span>
                      </span>
                    ) : a.submissionStatus === "late" ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Terkirim Terlambat</span>
                      </span>
                    ) : a.submissionStatus === "returned_for_revision" ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Perlu Revisi</span>
                      </span>
                    ) : isOverdue ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Tenggat Terlewat</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Belum Mengumpulkan</span>
                      </span>
                    )}

                    <span className="text-[11px] text-slate-500 font-medium">
                      Nilai Maks: {parseFloat(a.maxScore)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {a.title}
                  </h3>

                  {a.instructions && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {a.instructions}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Tenggat:{" "}
                        <strong className={isOverdue && !a.submissionStatus ? "text-red-600" : isDueSoon ? "text-amber-600" : "text-slate-800"}>
                          {a.dueAt ? formatDateTime(a.dueAt) : "Tidak ada tenggat"}
                        </strong>
                      </span>
                    </span>

                    {a.submittedAt && (
                      <span className="text-slate-400">
                        Dikirim: {formatDateTime(a.submittedAt)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center">
                  <Link href={`/student/assignments/${a.id}`} className="w-full md:w-auto">
                    <Button
                      variant={a.submissionStatus ? "outline" : "primary"}
                      size="sm"
                      className="w-full md:w-auto flex items-center gap-1.5 text-xs font-bold"
                    >
                      <span>
                        {a.submissionStatus === "graded"
                          ? "Lihat Nilai & Evaluasi"
                          : a.submissionStatus
                          ? "Detail Pengumpulan"
                          : "Kumpulkan Tugas"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Pagination Component */}
          {filtered.length > pageSize && (
            <div className="pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={pageSize}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
