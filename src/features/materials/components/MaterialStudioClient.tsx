"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  FileSpreadsheet,
  Video,
  MoreVertical,
  Plus,
  Trash2,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Info,
  Lock,
  ArrowLeft,
  Edit2,
  Save,
  Clock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  Maximize2,
  RotateCcw,
  RotateCw,
  Highlighter,
  Link2,
} from "lucide-react";
import {
  saveCurriculumMaterial,
  deleteMaterial,
  updateSectionName,
  deleteSection,
  type CurriculumSection,
  type CurriculumMaterialItem,
} from "@/features/materials/actions";
import { TipTapWysiwygEditor } from "./TipTapWysiwygEditor";

interface MaterialStudioProps {
  classInfo: {
    id: string;
    displayName: string;
    courseCode: string;
    courseName: string;
    termName: string;
    classCode: string;
  };
  initialSections: CurriculumSection[];
  availableClasses: { id: string; displayName: string }[];
}

export function formatEmbedUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  const url = rawUrl.trim();

  // Google Drive File (video or pdf)
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  // Google Presentation / Slides
  const slidesMatch = url.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (slidesMatch && slidesMatch[1]) {
    return `https://docs.google.com/presentation/d/${slidesMatch[1]}/embed?start=false&loop=false&delayms=3000`;
  }

  // Google Docs
  const docsMatch = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docsMatch && docsMatch[1]) {
    return `https://docs.google.com/document/d/${docsMatch[1]}/preview`;
  }

  return url;
}

export function MaterialStudioClient({
  classInfo,
  initialSections,
  availableClasses,
}: MaterialStudioProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [sections, setSections] = useState<CurriculumSection[]>(initialSections);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const [activeMaterial, setActiveMaterial] = useState<CurriculumMaterialItem | null>(null);

  // Form State
  const [title, setTitle] = useState<string>("");
  const [materialType, setMaterialType] = useState<"article" | "pdf" | "video">("article");
  const [contentBody, setContentBody] = useState<string>("");
  const [externalUrl, setExternalUrl] = useState<string>("");
  const [durationMinutes, setDurationMinutes] = useState<number>(2);

  // UI state
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [menuOpenSectionIndex, setMenuOpenSectionIndex] = useState<number | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});

  // Initialize active material
  useEffect(() => {
    if (sections.length > 0) {
      const firstSec = sections[0];
      if (firstSec.materials.length > 0) {
        loadMaterialToEditor(firstSec.materials[0]);
      } else {
        createNewMaterialInMemory(firstSec.sectionName, "article");
      }
    } else {
      // Create initial default section if empty
      const defaultSecName = "MATERI 1: PERSIAPAN & PENDAHULUAN";
      const initialSec: CurriculumSection = {
        sectionName: defaultSecName,
        materials: [],
      };
      setSections([initialSec]);
      createNewMaterialInMemory(defaultSecName, "article");
    }
  }, []);

  function loadMaterialToEditor(mat: CurriculumMaterialItem) {
    setActiveMaterial(mat);
    setTitle(mat.title);
    setMaterialType(mat.materialType);
    setContentBody(mat.contentBody || "");
    setExternalUrl(mat.externalUrl || "");
    setDurationMinutes(mat.durationMinutes || 2);
    setIsSaved(true);
  }

  function createNewMaterialInMemory(sectionName: string, type: "article" | "pdf" | "video") {
    const defaultTitle =
      type === "article"
        ? "Judul Modul Bacaan Baru"
        : type === "video"
        ? "Tutorial Video Baru"
        : "Slide Panduan Baru";

    const defaultContent =
      type === "article"
        ? "Tuliskan isi materi perkuliahan di sini. Anda dapat membagikan konsep teori, panduan instalasi, langkah-langkah praktikum, maupun ringkasan penting."
        : "";

    const tempMat: CurriculumMaterialItem = {
      id: "",
      classId: classInfo.id,
      meetingNumber: 1,
      title: defaultTitle,
      materialType: type,
      sectionName: sectionName,
      contentBody: defaultContent,
      externalUrl: "",
      sortOrder: 0,
      durationMinutes: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setActiveMaterial(tempMat);
    setTitle(defaultTitle);
    setMaterialType(type);
    setContentBody(defaultContent);
    setExternalUrl("");
    setDurationMinutes(2);
    setIsSaved(false);
  }

  // Handle Save
  const handleSave = () => {
    if (!title.trim()) {
      alert("Judul materi tidak boleh kosong");
      return;
    }

    const currentSectionName =
      sections[activeSectionIndex]?.sectionName || "MATERI 1: PERSIAPAN & PENDAHULUAN";

    startTransition(async () => {
      const res = await saveCurriculumMaterial({
        id: activeMaterial?.id || undefined,
        classId: classInfo.id,
        sectionName: currentSectionName,
        title: title.trim(),
        materialType,
        contentBody,
        externalUrl: externalUrl ? formatEmbedUrl(externalUrl) : "",
        durationMinutes,
      });

      if (res?.success) {
        setIsSaved(true);
        // Refresh local curriculum state
        router.refresh();
        if (res.materialId && activeMaterial) {
          setActiveMaterial({
            ...activeMaterial,
            id: res.materialId,
            title,
            materialType,
            contentBody,
            externalUrl: externalUrl ? formatEmbedUrl(externalUrl) : "",
          });
        }
      } else {
        alert(res?.error || "Gagal menyimpan materi");
      }
    });
  };

  // Handle Delete Material ("Hapus Bab")
  const handleDeleteActiveMaterial = () => {
    if (!activeMaterial?.id) {
      // Just clear
      if (sections[0]?.materials.length > 0) {
        loadMaterialToEditor(sections[0].materials[0]);
      }
      return;
    }

    if (!confirm(`Hapus materi "${activeMaterial.title}"?`)) return;

    startTransition(async () => {
      const res = await deleteMaterial(activeMaterial.id);
      if (res?.success) {
        router.refresh();
      } else {
        alert(res?.error || "Gagal menghapus materi");
      }
    });
  };

  // Handle Add New Section ("+ Tambah Bagian Baru")
  const handleAddNewSection = () => {
    const secNum = sections.length + 1;
    const name = prompt(
      "Masukkan nama bagian baru (misal: MATERI 5: INTEGRASI REST API):",
      `MATERI ${secNum}: TOPIK PEMBELAJARAN BARU`
    );
    if (!name || !name.trim()) return;

    const trimmed = name.trim();
    const updated = [...sections, { sectionName: trimmed, materials: [] }];
    setSections(updated);
    setActiveSectionIndex(updated.length - 1);
    createNewMaterialInMemory(trimmed, "article");
  };

  // Handle Rename Section
  const handleRenameSection = (secIndex: number) => {
    const currentName = sections[secIndex].sectionName;
    const newName = prompt("Ubah nama bagian kurikulum:", currentName);
    if (!newName || !newName.trim() || newName.trim() === currentName) return;

    startTransition(async () => {
      const res = await updateSectionName(classInfo.id, currentName, newName.trim());
      if (res?.success) {
        const updated = [...sections];
        updated[secIndex].sectionName = newName.trim();
        setSections(updated);
        setMenuOpenSectionIndex(null);
        router.refresh();
      } else {
        alert(res?.error || "Gagal mengubah nama bagian");
      }
    });
  };

  // Handle Delete Section
  const handleDeleteSection = (secIndex: number) => {
    const currentName = sections[secIndex].sectionName;
    if (
      !confirm(
        `Hapus seluruh bagian "${currentName}" beserta semua materi di dalamnya?`
      )
    )
      return;

    startTransition(async () => {
      const res = await deleteSection(classInfo.id, currentName);
      if (res?.success) {
        const updated = sections.filter((_, idx) => idx !== secIndex);
        setSections(updated);
        setMenuOpenSectionIndex(null);
        if (updated.length > 0) {
          setActiveSectionIndex(0);
          if (updated[0].materials.length > 0) {
            loadMaterialToEditor(updated[0].materials[0]);
          }
        }
        router.refresh();
      } else {
        alert(res?.error || "Gagal menghapus bagian");
      }
    });
  };

  // Add material to specific section
  const handleAddMaterialToSection = (
    secIndex: number,
    type: "article" | "pdf" | "video"
  ) => {
    setActiveSectionIndex(secIndex);
    setMenuOpenSectionIndex(null);
    createNewMaterialInMemory(sections[secIndex].sectionName, type);
  };

  // Stats calculation for article (stripped of HTML tags)
  const plainText = contentBody ? contentBody.replace(/<[^>]*>/g, " ").trim() : "";
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const charCount = plainText ? plainText.length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 120));

  const embedUrl = externalUrl ? formatEmbedUrl(externalUrl) : "";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 pb-12">
      {/* Top Header / Switcher Bar */}
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/80 backdrop-blur-md px-6 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/materials"
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
              {classInfo.courseCode} • Kelas {classInfo.classCode} • {classInfo.termName}
            </p>
          </div>
        </div>

        {/* Switcher & Save Button */}
        <div className="flex items-center space-x-3">
          {availableClasses.length > 1 && (
            <select
              value={classInfo.id}
              onChange={(e) => router.push(`/materials?classId=${e.target.value}`)}
              className="text-xs font-medium border border-slate-200 bg-white/90 rounded-lg px-3 py-1.5 text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {availableClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleSave}
            disabled={isPending}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
              isSaved
                ? "bg-teal-500 hover:bg-teal-600 text-white shadow-teal-500/20"
                : "bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/30 animate-pulse"
            }`}
          >
            {isPending ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Tersimpan</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Studio Two-Column Grid */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 gap-6">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: KURIKULUM SIDEBAR (Images 1, 2, 3) */}
        {/* ========================================================================= */}
        <aside className="w-80 shrink-0 flex flex-col gap-4">
          <div className="bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Kurikulum
              </span>
              <span className="text-[11px] font-semibold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-100">
                {sections.reduce((acc, s) => acc + s.materials.length, 0)} Modul
              </span>
            </div>

            {/* Sections List */}
            <div className="mt-3 space-y-2.5">
              {sections.map((section, sIdx) => {
                const isMenuOpen = menuOpenSectionIndex === sIdx;
                const isCollapsed = collapsedSections[sIdx] || false;
                const isSectionActive = activeSectionIndex === sIdx;

                return (
                  <div
                    key={sIdx}
                    className={`rounded-xl border transition-all duration-200 ${
                      isSectionActive
                        ? "border-cyan-400 bg-white/95 shadow-sm shadow-cyan-100"
                        : "border-slate-200/80 bg-white/60 hover:border-slate-300"
                    }`}
                  >
                    {/* Section Header Card */}
                    <div className="p-3 flex items-center justify-between gap-2 relative">
                      <button
                        onClick={() => {
                          setActiveSectionIndex(sIdx);
                          setCollapsedSections((prev) => ({
                            ...prev,
                            [sIdx]: !prev[sIdx],
                          }));
                        }}
                        className="flex-1 flex items-center gap-2 text-left"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-cyan-600 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-800 leading-snug line-clamp-1">
                          {section.sectionName}
                        </span>
                      </button>

                      {/* 3-Dots Action Menu Trigger */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenSectionIndex(isMenuOpen ? null : sIdx);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          title="Opsi Bagian"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu Popup (Exact match to Image 1) */}
                        {isMenuOpen && (
                          <div className="absolute right-0 top-8 z-40 w-56 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-xl shadow-xl p-2 text-xs">
                            <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                              Tambah Materi
                            </div>
                            <button
                              onClick={() => handleAddMaterialToSection(sIdx, "article")}
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 font-medium transition text-left"
                            >
                              <FileText className="w-4 h-4 text-cyan-600" />
                              <span>Artikel Teks</span>
                            </button>
                            <button
                              onClick={() => handleAddMaterialToSection(sIdx, "pdf")}
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium transition text-left"
                            >
                              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                              <span>File PDF / Slides (Link)</span>
                            </button>
                            <button
                              onClick={() => handleAddMaterialToSection(sIdx, "video")}
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition text-left"
                            >
                              <Video className="w-4 h-4 text-blue-600" />
                              <span>Video (Link)</span>
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                              Pengaturan Bagian
                            </div>
                            <button
                              onClick={() => handleRenameSection(sIdx)}
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition text-left"
                            >
                              <Edit2 className="w-4 h-4 text-slate-500" />
                              <span>Ubah Nama</span>
                            </button>
                            <button
                              onClick={() => handleDeleteSection(sIdx)}
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 font-medium transition text-left"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                              <span>Hapus Bagian</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section Body: Materials List */}
                    {!isCollapsed && (
                      <div className="px-3 pb-3 space-y-1.5">
                        {section.materials.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic py-1 px-2">
                            Belum ada modul di bagian ini.
                          </p>
                        ) : (
                          section.materials.map((mat) => {
                            const isCurrent = activeMaterial?.id === mat.id;
                            return (
                              <button
                                key={mat.id}
                                onClick={() => {
                                  setActiveSectionIndex(sIdx);
                                  loadMaterialToEditor(mat);
                                }}
                                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs transition ${
                                  isCurrent
                                    ? "bg-cyan-50 border border-cyan-200 text-cyan-900 font-semibold shadow-xs"
                                    : "text-slate-600 hover:bg-slate-100 font-medium"
                                }`}
                              >
                                {mat.materialType === "article" ? (
                                  <FileText className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                                ) : mat.materialType === "video" ? (
                                  <Video className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                ) : (
                                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                )}
                                <span className="truncate flex-1">{mat.title}</span>
                                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                              </button>
                            );
                          })
                        )}

                        {/* Inline button "+ Tambah Materi ke Bagian Ini" */}
                        <div className="pt-1">
                          <button
                            onClick={() => {
                              setActiveSectionIndex(sIdx);
                              setMenuOpenSectionIndex(isMenuOpen ? null : sIdx);
                            }}
                            className="w-full py-1.5 px-2 rounded-lg border border-dashed border-slate-300 text-slate-600 hover:text-cyan-700 hover:border-cyan-400 hover:bg-cyan-50/50 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                          >
                            <Plus className="w-3.5 h-3.5 text-slate-400" />
                            <span>+ Tambah Materi ke Bagian Ini</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Button "+ Tambah Bagian Baru" */}
            <button
              onClick={handleAddNewSection}
              className="mt-4 w-full py-2.5 px-3 rounded-xl border border-slate-300 bg-white/80 hover:bg-white text-slate-700 hover:text-cyan-700 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Plus className="w-4 h-4 text-cyan-600" />
              <span>+ TAMBAH BAGIAN BARU</span>
            </button>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: RICH MATERIAL STUDIO EDITOR */}
        {/* ========================================================================= */}
        <main className="flex-1 min-w-0 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {/* 1. Editor Header & Metadata (Matching Images 1, 2, 3) */}
          <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            {/* Left badge */}
            <div>
              {materialType === "article" && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold tracking-wide">
                  <FileText className="w-3.5 h-3.5" />
                  <span>MODUL BACAAN</span>
                </div>
              )}
              {materialType === "video" && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide">
                  <Video className="w-3.5 h-3.5" />
                  <span>MATERI VIDEO (GOOGLE DRIVE)</span>
                </div>
              )}
              {materialType === "pdf" && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wide">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>FILE PDF / SLIDES (LINK)</span>
                </div>
              )}
            </div>

            {/* Right actions: Hapus Bab + Tersimpan */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteActiveMaterial}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 transition"
                title="Hapus Bab"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Bab</span>
              </button>

              <button
                onClick={handleSave}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold shadow-sm transition"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{isPending ? "Menyimpan..." : "Tersimpan"}</span>
              </button>
            </div>
          </div>

          {/* 3. Title Editable Input */}
          <div className="px-6 pt-5 pb-2">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setIsSaved(false);
              }}
              placeholder="Ketikkan Judul Materi..."
              className="w-full text-2xl sm:text-3xl font-extrabold text-slate-900 border-none bg-transparent focus:outline-none focus:ring-0 placeholder:text-slate-300"
            />
          </div>

          {/* 4. Type-Specific Editor Body */}
          <div className="p-6 pt-2 flex-1 flex flex-col">
            {/* ---------------------------------------------------- */}
            {/* A. ARTIKEL TEKS (Image 1 with TipTap WYSIWYG Editor) */}
            {/* ---------------------------------------------------- */}
            {materialType === "article" && (
              <div className="flex-1 flex flex-col relative min-h-[420px]">
                <TipTapWysiwygEditor
                  content={contentBody}
                  onChange={(val) => {
                    setContentBody(val);
                    setIsSaved(false);
                  }}
                  placeholder="Tuliskan modul bacaan di sini..."
                />

                {/* Article Statistics Floating Pill (Exact to Image 1) */}
                <div className="mt-4 self-end inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs text-xs font-medium text-slate-600">
                  <span className="flex items-center gap-1">
                    <AlignLeft className="w-3 h-3 text-slate-400" />
                    <span>{wordCount} kata</span>
                  </span>
                  <span>•</span>
                  <span>{charCount.toLocaleString("id-ID")} karakter</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-cyan-700 font-semibold">
                    <Clock className="w-3 h-3 text-cyan-600" />
                    <span>~{readingTime} mnt baca</span>
                  </span>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* B. VIDEO GOOGLE DRIVE (Image 2) */}
            {/* ---------------------------------------------------- */}
            {materialType === "video" && (
              <div className="space-y-4">
                <hr className="border-slate-100 my-2" />

                <div className="rounded-2xl border border-slate-200/90 bg-white/80 backdrop-blur-md p-6 shadow-sm space-y-4">
                  {/* URL Input Row with Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800">
                        URL Video (Khusus Google Drive Video)
                      </label>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                        <Lock className="w-3 h-3" />
                        <span>Google Drive Saja</span>
                      </span>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        value={externalUrl}
                        onChange={(e) => {
                          setExternalUrl(e.target.value);
                          setIsSaved(false);
                        }}
                        placeholder="https://drive.google.com/file/d/1kFVVeDWggS.../preview"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/90 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  {/* Info Notice Box */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-blue-900 text-xs leading-relaxed">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p>
                      Materi video dibatasi khusus <strong>Google Drive Video</strong>. Tautan
                      akan otomatis diubah ke format <code>/preview</code> agar video dapat langsung
                      diputar oleh siswa. Pastikan hak akses file di Google Drive diatur ke{" "}
                      <strong>&quot;Siapa saja yang memiliki tautan&quot; (Anyone with the link)</strong>.
                    </p>
                  </div>

                  {/* Embedded 16:9 Video Player Preview */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner flex items-center justify-center">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full border-0"
                        allow="autoplay; encrypted-media; fullscreen"
                        allowFullScreen
                      />
                    ) : (
                      <div className="text-center text-slate-400 p-6">
                        <Video className="w-12 h-12 mx-auto mb-2 text-slate-500 opacity-60" />
                        <p className="text-xs font-medium">
                          Masukkan URL video Google Drive di atas untuk melihat pratinjau live player.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Video Status Footer */}
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <div className="flex items-center gap-1.5 text-teal-700 font-semibold">
                      <Check className="w-4 h-4 text-teal-600 stroke-[2.5]" />
                      <span>Google Drive Video siap diputar langsung</span>
                    </div>

                    {embedUrl && (
                      <a
                        href={externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold transition"
                      >
                        <span>Buka di Tab Baru</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* C. FILE PDF / SLIDES LINK (Image 3) */}
            {/* ---------------------------------------------------- */}
            {materialType === "pdf" && (
              <div className="space-y-4">
                <hr className="border-slate-100 my-2" />

                <div className="rounded-2xl border border-slate-200/90 bg-white/80 backdrop-blur-md p-6 shadow-sm space-y-4">
                  {/* URL Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      URL File PDF / Slides (Google Drive, Docs, Slides, Link PDF)
                    </label>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        value={externalUrl}
                        onChange={(e) => {
                          setExternalUrl(e.target.value);
                          setIsSaved(false);
                        }}
                        placeholder="https://drive.google.com/file/d/1aA_3i1FpF8kPs.../preview"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/90 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                      />
                    </div>
                  </div>

                  {/* Info Notice Box */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-blue-900 text-xs leading-relaxed">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p>
                      Mendukung tautan dari <strong>Google Drive (PDF/File)</strong>,{" "}
                      <strong>Google Slides</strong>, <strong>Google Docs</strong>, atau link
                      langsung <strong>.pdf / .ppt</strong>. Pastikan akses tautan disetel ke{" "}
                      <strong>&quot;Siapa saja yang memiliki tautan&quot; (Anyone with the link)</strong>.
                    </p>
                  </div>

                  {/* Embedded PDF/Slide Viewer Preview */}
                  <div className="relative w-full h-[520px] rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner flex items-center justify-center">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full border-0"
                        allow="autoplay; encrypted-media; fullscreen"
                        allowFullScreen
                      />
                    ) : (
                      <div className="text-center text-slate-400 p-6">
                        <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 text-slate-500 opacity-60" />
                        <p className="text-xs font-medium">
                          Masukkan URL PDF / Slides di atas untuk melihat pratinjau live dokumen.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* PDF Status Footer */}
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <div className="flex items-center gap-1.5 text-teal-700 font-semibold">
                      <Check className="w-4 h-4 text-teal-600 stroke-[2.5]" />
                      <span>Tautan dokumen aktif</span>
                    </div>

                    {embedUrl && (
                      <a
                        href={externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-semibold transition"
                      >
                        <span>Buka di Tab Baru</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
