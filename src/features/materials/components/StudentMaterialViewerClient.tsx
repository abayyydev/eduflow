"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  FileText,
  FileSpreadsheet,
  Video,
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Maximize2,
  ArrowLeft,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Clock,
  Sparkles,
  Download,
} from "lucide-react";
import {
  toggleStudentMaterialProgress,
  type CurriculumSection,
  type CurriculumMaterialItem,
} from "@/features/materials/actions";
import { formatEmbedUrl } from "./MaterialStudioClient";

interface StudentMaterialViewerProps {
  classInfo: {
    id: string;
    displayName: string;
    courseCode: string;
    courseName: string;
    termName: string;
    lecturerName: string;
  };
  initialSections: CurriculumSection[];
  initialProgressPercentage: number;
  initialTotalMaterials: number;
  initialCompletedCount: number;
}

export function StudentMaterialViewerClient({
  classInfo,
  initialSections,
  initialProgressPercentage,
  initialTotalMaterials,
  initialCompletedCount,
}: StudentMaterialViewerProps) {
  const [isPending, startTransition] = useTransition();

  const [sections, setSections] = useState<CurriculumSection[]>(initialSections);
  const [completedCount, setCompletedCount] = useState<number>(initialCompletedCount);
  const [totalMaterials] = useState<number>(initialTotalMaterials);
  const [progressPercentage, setProgressPercentage] = useState<number>(
    initialProgressPercentage
  );

  // Active Material selection
  const firstMaterial =
    sections.find((s) => s.materials.length > 0)?.materials[0] || null;
  const [activeMaterial, setActiveMaterial] = useState<CurriculumMaterialItem | null>(
    firstMaterial
  );

  // Sidebar expanded / collapsed
  const [isWideScreen, setIsWideScreen] = useState<boolean>(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});

  // Toggle material completion
  const handleToggleComplete = (material: CurriculumMaterialItem) => {
    const newStatus = !material.isCompleted;

    startTransition(async () => {
      // Optimistic update
      const updatedSections = sections.map((sec) => ({
        ...sec,
        materials: sec.materials.map((m) =>
          m.id === material.id ? { ...m, isCompleted: newStatus } : m
        ),
      }));
      setSections(updatedSections);

      const newCompletedCount = newStatus
        ? completedCount + 1
        : Math.max(0, completedCount - 1);
      setCompletedCount(newCompletedCount);
      setProgressPercentage(
        totalMaterials > 0 ? Math.round((newCompletedCount / totalMaterials) * 100) : 0
      );

      if (activeMaterial?.id === material.id) {
        setActiveMaterial({ ...activeMaterial, isCompleted: newStatus });
      }

      await toggleStudentMaterialProgress(material.id, newStatus);
    });
  };

  const embedUrl = activeMaterial?.externalUrl
    ? formatEmbedUrl(activeMaterial.externalUrl)
    : "";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 pb-12">
      {/* Top Header / LMS Navigation */}
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/80 backdrop-blur-md px-6 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/student/materials"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Kelas</span>
          </Link>
          <div className="h-4 w-px bg-slate-300" />
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              {classInfo.displayName}
            </h1>
            <p className="text-xs text-slate-500">
              {classInfo.courseCode} • Dosen: {classInfo.lecturerName} • {classInfo.termName}
            </p>
          </div>
        </div>

        {/* Tab Links (Overview, Materials, Live Session, Assignments) */}
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <Link
            href={`/student/classes/${classInfo.id}`}
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          >
            Overview
          </Link>
          <span className="px-3 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 shadow-xs">
            Materials
          </span>
          <Link
            href={`/student/classes/${classInfo.id}/assignments`}
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          >
            Assignments
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 gap-6">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: DAFTAR MATERI ACCORDION & PROGRESS (Image 4) */}
        {/* ========================================================================= */}
        {!isWideScreen && (
          <aside className="w-80 shrink-0 flex flex-col gap-4">
            <div className="bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-sm">
              {/* Header Title with collapse toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Daftar Materi
                  </span>
                </div>
                <button
                  onClick={() => setIsWideScreen(true)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Sembunyikan Menu"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              {/* Progres Belajar Bar */}
              <div className="py-3 border-b border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-600">Progres Belajar</span>
                  <span className="text-cyan-700">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 text-right">
                  {completedCount} dari {totalMaterials} modul selesai
                </p>
              </div>

              {/* Sections Accordion */}
              <div className="mt-3 space-y-2.5">
                {sections.map((section, sIdx) => {
                  const isCollapsed = collapsedSections[sIdx] || false;
                  return (
                    <div
                      key={sIdx}
                      className="rounded-xl border border-slate-200/80 bg-white/60 overflow-hidden shadow-xs"
                    >
                      {/* Section Accordion Title */}
                      <button
                        onClick={() =>
                          setCollapsedSections((prev) => ({
                            ...prev,
                            [sIdx]: !prev[sIdx],
                          }))
                        }
                        className="w-full p-3 flex items-center justify-between text-left hover:bg-white/80 transition"
                      >
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-tight line-clamp-1">
                          {section.sectionName}
                        </span>
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-cyan-600 shrink-0" />
                        )}
                      </button>

                      {/* Material Items */}
                      {!isCollapsed && (
                        <div className="px-2 pb-2 space-y-1 border-t border-slate-100 pt-1">
                          {section.materials.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic px-2 py-1">
                              Belum ada modul di bagian ini.
                            </p>
                          ) : (
                            section.materials.map((mat) => {
                              const isCurrent = activeMaterial?.id === mat.id;
                              return (
                                <button
                                  key={mat.id}
                                  onClick={() => setActiveMaterial(mat)}
                                  className={`w-full group flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left text-xs transition ${
                                    isCurrent
                                      ? "bg-cyan-50/90 border border-cyan-200 text-cyan-900 font-semibold shadow-xs"
                                      : "text-slate-600 hover:bg-slate-100/80 font-medium"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    {mat.materialType === "article" ? (
                                      <FileText className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                                    ) : mat.materialType === "video" ? (
                                      <Video className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                    ) : (
                                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    )}
                                    <span className="truncate">{mat.title}</span>
                                  </div>

                                  {/* Status indicator & quick download */}
                                  <div className="shrink-0 flex items-center gap-1.5">
                                    <a
                                      href={`/api/files/material/${mat.id}`}
                                      download
                                      onClick={(e) => e.stopPropagation()}
                                      className="p-1 rounded text-slate-400 hover:text-cyan-700 hover:bg-cyan-100 transition opacity-0 group-hover:opacity-100"
                                      title="Unduh Materi Ini"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </a>
                                    {mat.isCompleted ? (
                                      <CheckCircle2 className="w-4 h-4 text-teal-600 stroke-[2.5]" />
                                    ) : isCurrent ? (
                                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
                                    ) : (
                                      <Circle className="w-3.5 h-3.5 text-slate-300" />
                                    )}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: MAIN LEARNING VIEWER (Image 4) */}
        {/* ========================================================================= */}
        <main className="flex-1 min-w-0 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {activeMaterial ? (
            <>
              {/* Top Viewer Control Bar (Image 4) */}
              <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                {/* Badge Type */}
                <div className="flex items-center gap-3">
                  {isWideScreen && (
                    <button
                      onClick={() => setIsWideScreen(false)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                      title="Buka Daftar Materi"
                    >
                      <PanelLeftOpen className="w-4 h-4" />
                    </button>
                  )}

                  {activeMaterial.materialType === "pdf" && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wide">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>DOKUMEN LAMPIRAN</span>
                    </div>
                  )}
                  {activeMaterial.materialType === "article" && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold tracking-wide">
                      <FileText className="w-3.5 h-3.5" />
                      <span>MODUL BACAAN</span>
                    </div>
                  )}
                  {activeMaterial.materialType === "video" && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide">
                      <Video className="w-3.5 h-3.5" />
                      <span>MATERI VIDEO</span>
                    </div>
                  )}
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Download File Button */}
                  <a
                    href={`/api/files/material/${activeMaterial.id}`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-200 bg-cyan-50/90 hover:bg-cyan-100 text-cyan-800 text-xs font-bold shadow-xs transition"
                    title="Unduh file materi untuk dibaca offline"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-700" />
                    <span>Unduh File</span>
                  </a>

                  <button
                    onClick={() => setIsWideScreen(!isWideScreen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white/80 hover:bg-white text-slate-700 text-xs font-semibold shadow-xs transition"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>{isWideScreen ? "Tutup Lebar" : "Layar Lebar"}</span>
                  </button>

                  {embedUrl && (
                    <a
                      href={activeMaterial.externalUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white/80 hover:bg-white text-slate-700 text-xs font-semibold shadow-xs transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Penuh</span>
                    </a>
                  )}

                  {/* Mark as Completed Button */}
                  <button
                    onClick={() => handleToggleComplete(activeMaterial)}
                    disabled={isPending}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm transition ${
                      activeMaterial.isCompleted
                        ? "bg-teal-500 hover:bg-teal-600 text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {activeMaterial.isCompleted ? "Selesai Dipelajari ✓" : "Tandai Selesai"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Material Title */}
              <div className="px-6 pt-5 pb-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {activeMaterial.title}
                </h2>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  <span>{activeMaterial.sectionName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>~{activeMaterial.durationMinutes || 2} menit pembelajaran</span>
                  </span>
                </div>
              </div>

              {/* Download Banner / Attachment Box */}
              <div className="mx-6 my-2 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      File Materi: {activeMaterial.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {activeMaterial.materialType === "pdf"
                        ? "Dokumen Lampiran / Slide Perkuliahan (PDF)"
                        : activeMaterial.materialType === "video"
                        ? "Materi Video & Referensi Pembelajaran"
                        : "Modul Pembelajaran Lengkap (Dapat diunduh dan dibaca offline)"}
                    </p>
                  </div>
                </div>

                <a
                  href={`/api/files/material/${activeMaterial.id}`}
                  download
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs transition shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File</span>
                </a>
              </div>

              {/* Main Content Area */}
              <div className="p-6 pt-2 flex-1 flex flex-col">
                {/* 1. PDF / Slide Viewer (Image 4 exact) */}
                {activeMaterial.materialType === "pdf" && (
                  <div className="flex-1 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md min-h-[580px] flex items-center justify-center relative">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full min-h-[580px] border-0"
                        allow="autoplay; encrypted-media; fullscreen"
                        allowFullScreen
                      />
                    ) : (
                      <div className="text-center text-slate-400 p-8">
                        <FileSpreadsheet className="w-16 h-16 mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-semibold">Tautan dokumen belum disetel oleh Dosen.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Video Player */}
                {activeMaterial.materialType === "video" && (
                  <div className="flex-1 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md aspect-video max-h-[640px] flex items-center justify-center relative">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full border-0"
                        allow="autoplay; encrypted-media; fullscreen"
                        allowFullScreen
                      />
                    ) : (
                      <div className="text-center text-slate-400 p-8">
                        <Video className="w-16 h-16 mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-semibold">Tautan video belum disetel oleh Dosen.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Article Reader */}
                {activeMaterial.materialType === "article" && (
                  <div className="flex-1 rounded-2xl border border-slate-200/90 bg-white/90 p-8 shadow-sm">
                    <div className="max-w-3xl mx-auto prose prose-slate">
                      {activeMaterial.contentBody ? (
                        <div className="text-sm leading-relaxed text-slate-800 space-y-4 whitespace-pre-line font-normal">
                          {activeMaterial.contentBody}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">Belum ada konten artikel pada materi ini.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <Sparkles className="w-12 h-12 mb-3 text-cyan-500 opacity-60" />
              <h3 className="text-base font-bold text-slate-700">Pilih Modul Pembelajaran</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Silakan klik salah satu bab atau materi di panel samping kiri untuk mulai belajar.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
