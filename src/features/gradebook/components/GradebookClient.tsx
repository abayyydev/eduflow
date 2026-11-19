"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Calculator,
  Lock,
  Unlock,
  Globe,
  Plus,
  Sliders,
  Search,
  CheckCircle2,
  Info,
  TrendingUp,
  Award,
  Download,
  Trash2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  type GradebookData,
  type StudentGradeRow,
  updateGradeScore,
  createAssessmentItem,
  deleteAssessmentItem,
  createGradingCategory,
  deleteGradingCategory,
  updateCategoryWeights,
  toggleLockGrades,
  togglePublishGrades,
} from "../actions";
import {
  calculateFinalGrade,
  type CalculatedCategory,
  type GradeItemInput,
  type CategoryConfig,
} from "../engine";

interface GradebookClientProps {
  initialData: GradebookData;
  availableClasses: Array<{ id: string; displayName: string }>;
}

export function GradebookClient({
  initialData,
  availableClasses,
}: GradebookClientProps) {
  const router = useRouter();
  const [data, setData] = useState<GradebookData>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentDetail, setSelectedStudentDetail] =
    useState<StudentGradeRow | null>(null);

  // Modals
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isNewCatModalOpen, setIsNewCatModalOpen] = useState(false);

  // Form states
  const [categoryWeights, setCategoryWeights] = useState<
    Array<{ id: string; name: string; weightPercent: number }>
  >(
    initialData.categories.map((c) => ({
      id: c.id,
      name: c.name,
      weightPercent: c.weightPercent,
    }))
  );

  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemCategoryId, setNewItemCategoryId] = useState(
    initialData.categories[0]?.id || ""
  );
  const [newItemMaxScore, setNewItemMaxScore] = useState("100");

  const [newCatName, setNewCatName] = useState("");
  const [newCatWeight, setNewCatWeight] = useState("10");

  const [savingCells, setSavingCells] = useState<Record<string, boolean>>({});
  const [activeCellError, setActiveCellError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Sync state whenever server revalidates initialData
  useEffect(() => {
    setData(initialData);
    setCategoryWeights(
      initialData.categories.map((c) => ({
        id: c.id,
        name: c.name,
        weightPercent: c.weightPercent,
      }))
    );
    if (!newItemCategoryId && initialData.categories.length > 0) {
      setNewItemCategoryId(initialData.categories[0].id);
    }
  }, [initialData]);

  const isLocked = data.classInfo.gradingLockedAt !== null;
  const isPublished = data.classInfo.gradesPublishedAt !== null;

  // Flattened assessment items list for table headers
  const allItems = data.categories.flatMap((cat) =>
    cat.items.map((item) => ({
      ...item,
      categoryName: cat.name,
      categoryWeight: cat.weightPercent,
      categoryId: cat.id,
    }))
  );

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredStudents = data.students.filter((st) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      st.name.toLowerCase().includes(q) ||
      st.studentNumber.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Instant optimistic calculation on cell edit
  const handleCellBlur = async (
    assessmentItemId: string,
    studentUserId: string,
    currentScore: number | null,
    val: string
  ) => {
    setActiveCellError(null);
    const cellKey = `${studentUserId}:${assessmentItemId}`;

    let newScore: number | null = null;
    if (val.trim() !== "" && val.trim() !== "—") {
      newScore = parseFloat(val.trim());
      if (isNaN(newScore)) {
        setActiveCellError("Skor harus berupa angka valid");
        return;
      }
    }

    if (newScore === currentScore) return;

    // 1. Optimistic Local Recalculation
    const updatedStudents = data.students.map((st) => {
      if (st.studentUserId !== studentUserId) return st;

      const updatedScores = {
        ...st.itemScores,
        [assessmentItemId]: {
          ...st.itemScores[assessmentItemId],
          score: newScore,
        },
      };

      const categoriesConfig: CategoryConfig[] = data.categories.map((c) => ({
        categoryId: c.id,
        name: c.name,
        weightPercent: c.weightPercent,
        aggregationMethod: c.aggregationMethod,
      }));

      const engineItems: GradeItemInput[] = allItems.map((item) => ({
        itemId: item.id,
        categoryId: item.categoryId,
        score: item.id === assessmentItemId ? newScore : updatedScores[item.id]?.score ?? null,
        maxScore: item.maxScore,
      }));

      const calcResult = calculateFinalGrade(
        categoriesConfig,
        engineItems,
        data.scales
      );

      return {
        ...st,
        itemScores: updatedScores,
        calculation: calcResult,
      };
    });

    const allFinalScores = updatedStudents
      .map((s) => s.calculation.finalScore)
      .filter((s): s is number => s !== null);

    let averageScore: number | null = null;
    let highestScore: number | null = null;
    let lowestScore: number | null = null;
    let passingRatePercent = 0;

    if (allFinalScores.length > 0) {
      const sum = allFinalScores.reduce((acc, curr) => acc + curr, 0);
      averageScore = Math.round((sum / allFinalScores.length) * 100) / 100;
      highestScore = Math.max(...allFinalScores);
      lowestScore = Math.min(...allFinalScores);
      const passed = allFinalScores.filter((s) => s >= 55).length;
      passingRatePercent = Math.round((passed / allFinalScores.length) * 100);
    }

    setData({
      ...data,
      students: updatedStudents,
      classStats: {
        averageScore,
        highestScore,
        lowestScore,
        passingRatePercent,
      },
    });

    // 2. Persist to server in background
    setSavingCells((prev) => ({ ...prev, [cellKey]: true }));
    const res = await updateGradeScore(
      data.classInfo.id,
      assessmentItemId,
      studentUserId,
      newScore
    );
    setSavingCells((prev) => ({ ...prev, [cellKey]: false }));

    if (res.error) {
      setActiveCellError(res.error);
      router.refresh();
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  // Add assessment item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    const res = await createAssessmentItem(
      data.classInfo.id,
      newItemCategoryId || data.categories[0]?.id,
      newItemTitle.trim(),
      parseFloat(newItemMaxScore) || 100
    );

    if (res.error) {
      alert(res.error);
      return;
    }

    setIsAddItemModalOpen(false);
    setNewItemTitle("");
    router.refresh();
  };

  // Delete assessment item
  const handleDeleteItem = async (itemId: string, itemTitle: string) => {
    if (!confirm(`Hapus kolom penilaian "${itemTitle}" beserta seluruh nilai mahasiswa di dalamnya?`)) {
      return;
    }

    const res = await deleteAssessmentItem(data.classInfo.id, itemId);
    if (res.error) {
      alert(res.error);
      return;
    }
    router.refresh();
  };

  // Save category weights
  const handleSaveWeights = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateCategoryWeights(
      data.classInfo.id,
      categoryWeights.map((c) => ({
        id: c.id,
        weightPercent: c.weightPercent,
      }))
    );

    if (res.error) {
      alert(res.error);
      return;
    }

    setIsWeightsModalOpen(false);
    router.refresh();
  };

  // Add new category
  const handleAddNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const res = await createGradingCategory(
      data.classInfo.id,
      newCatName.trim(),
      parseFloat(newCatWeight) || 10
    );

    if (res.error) {
      alert(res.error);
      return;
    }

    setIsNewCatModalOpen(false);
    setNewCatName("");
    router.refresh();
  };

  // Delete category
  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Hapus kategori "${catName}" beserta seluruh kolom item nilai di dalamnya?`)) {
      return;
    }

    const res = await deleteGradingCategory(data.classInfo.id, catId);
    if (res.error) {
      alert(res.error);
      return;
    }
    router.refresh();
  };

  // Lock grades toggle
  const handleToggleLock = async () => {
    const res = await toggleLockGrades(data.classInfo.id, !isLocked);
    if (res.error) {
      alert(res.error);
      return;
    }
    setIsLockModalOpen(false);
    router.refresh();
  };

  // Publish grades toggle
  const handleTogglePublish = async () => {
    const res = await togglePublishGrades(data.classInfo.id, !isPublished);
    if (res.error) {
      alert(res.error);
      return;
    }
    setIsPublishModalOpen(false);
    router.refresh();
  };

  const totalModalWeight = categoryWeights.reduce(
    (acc, curr) => acc + curr.weightPercent,
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Class Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-cyan-50 border border-cyan-200 text-cyan-800 uppercase tracking-wider">
              {data.classInfo.courseCode} &bull; Kelas {data.classInfo.classCode}
            </span>
            {isLocked && <Badge status="locked" />}
            {isPublished && <Badge status="published" />}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Gradebook &amp; Kalkulasi Nilai
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {data.classInfo.displayName} &bull; Semester {data.classInfo.termName}
          </p>
        </div>

        {/* Switch Class Dropdown & Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={data.classInfo.id}
            onChange={(e) => router.push(`/gradebook?classId=${e.target.value}`)}
            className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {availableClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayName}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsWeightsModalOpen(true)}
            disabled={isLocked}
            className="rounded-xl"
          >
            <Sliders className="w-4 h-4 mr-1.5" /> Bobot Kategori
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddItemModalOpen(true)}
            disabled={isLocked}
            className="rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Tambah Item Nilai
          </Button>

          <Button
            variant={isLocked ? "destructive" : "outline"}
            size="sm"
            onClick={() => setIsLockModalOpen(true)}
            className="rounded-xl"
          >
            {isLocked ? (
              <>
                <Lock className="w-4 h-4 mr-1.5" /> Buka Kunci
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-1.5" /> Kunci Nilai
              </>
            )}
          </Button>

          <Button
            variant={isPublished ? "success" : "primary"}
            size="sm"
            onClick={() => setIsPublishModalOpen(true)}
            className="rounded-xl"
          >
            <Globe className="w-4 h-4 mr-1.5" />
            {isPublished ? "Nilai Terbit" : "Terbitkan Nilai"}
          </Button>

          <a
            href={`/api/export/gradebook?classId=${data.classInfo.id}&format=xlsx`}
            download
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 border border-slate-200 text-slate-800 hover:bg-slate-100 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-teal-600" />
            Ekspor XLSX
          </a>

          <a
            href={`/api/export/gradebook?classId=${data.classInfo.id}&format=csv`}
            download
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 border border-slate-200 text-slate-600 hover:bg-slate-100 shadow-2xs transition-colors"
          >
            Ekspor CSV
          </a>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-white/80 bg-white/70 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Rata-rata Kelas
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {data.classStats.averageScore !== null
                  ? data.classStats.averageScore
                  : "—"}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-white/80 bg-white/70 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Nilai Tertinggi
              </p>
              <p className="text-2xl font-extrabold text-teal-600 mt-1 tabular-nums">
                {data.classStats.highestScore !== null
                  ? data.classStats.highestScore
                  : "—"}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-white/80 bg-white/70 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Kelulusan (≥ 55)
              </p>
              <p className="text-2xl font-extrabold text-blue-600 mt-1 tabular-nums">
                {data.classStats.passingRatePercent}%
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-white/80 bg-white/70 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Bobot Aktif
              </p>
              <p
                className={`text-2xl font-extrabold mt-1 tabular-nums ${
                  Math.abs(data.totalActiveWeight - 100) < 0.01
                    ? "text-teal-600"
                    : "text-red-600"
                }`}
              >
                {data.totalActiveWeight}%
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100/80 text-slate-600 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {activeCellError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
          <Info className="w-4 h-4 text-red-500 shrink-0" />
          <span>{activeCellError}</span>
        </div>
      )}

      {/* Gradebook Table Card */}
      <Card className="overflow-hidden border-white/80 bg-white/70 backdrop-blur-md shadow-sm">
        {/* Search & Notice Bar */}
        <div className="p-3 bg-white/80 border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari NIM atau nama mahasiswa..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Info className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>
              Ketik nilai lalu tekan <strong>Enter</strong> atau tab untuk kalkulasi instan otomatis. Kosong = Belum Dinilai.
            </span>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto max-h-[650px] relative">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/90 sticky top-0 z-20 shadow-xs backdrop-blur-md">
              {/* Category Grouping Row */}
              <tr className="border-b border-slate-200 text-[11px]">
                <th
                  colSpan={2}
                  className="py-2.5 px-4 font-bold text-slate-800 bg-slate-100/95 sticky left-0 z-30 border-r border-slate-200"
                >
                  Identitas Mahasiswa
                </th>

                {data.categories.map((cat) => (
                  <th
                    key={cat.id}
                    colSpan={Math.max(cat.items.length, 1)}
                    className="py-2 px-3 font-extrabold text-center border-r border-slate-200 bg-slate-200/60 text-slate-800"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{cat.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-700">
                        {cat.weightPercent}%
                      </span>
                    </div>
                  </th>
                ))}

                <th
                  colSpan={3}
                  className="py-2 px-4 font-extrabold text-center bg-cyan-100/70 text-cyan-900"
                >
                  Kalkulasi Nilai Akhir
                </th>
              </tr>

              {/* Assessment Item Headers */}
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="py-2.5 px-4 font-bold sticky left-0 z-30 bg-slate-100/95 w-32 border-r border-slate-100">
                  NIM
                </th>
                <th className="py-2.5 px-4 font-bold sticky left-32 z-30 bg-slate-100/95 border-r border-slate-200 w-52">
                  Nama Mahasiswa
                </th>

                {allItems.length === 0 ? (
                  <th className="py-2.5 px-4 text-center italic text-slate-400">
                    Belum ada item penilaian. Tambahkan item di tombol atas.
                  </th>
                ) : (
                  allItems.map((item) => (
                    <th
                      key={item.id}
                      className="py-2.5 px-3 font-semibold text-center border-r border-slate-200 min-w-[120px] group relative"
                      title={`Kategori: ${item.categoryName} (${item.categoryWeight}%)`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="line-clamp-1 font-bold text-slate-800">{item.title}</span>
                        {!isLocked && (
                          <button
                            onClick={() => handleDeleteItem(item.id, item.title)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition p-0.5 rounded"
                            title="Hapus kolom item nilai ini"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Max {item.maxScore}
                      </div>
                    </th>
                  ))
                )}

                <th className="py-2.5 px-3 font-bold text-center bg-cyan-50/80 min-w-[90px] text-cyan-900">
                  Nilai Akhir
                </th>
                <th className="py-2.5 px-3 font-bold text-center bg-cyan-50/80 min-w-[70px] text-cyan-900">
                  Huruf
                </th>
                <th className="py-2.5 px-3 font-bold text-center bg-cyan-50/80 min-w-[80px] text-cyan-900">
                  Detail
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.map((st) => (
                <tr key={st.studentUserId} className="hover:bg-cyan-50/30 transition-colors">
                  {/* Sticky Student Columns with Solid Background to prevent overlap */}
                  <td className="py-2.5 px-4 font-bold text-slate-800 sticky left-0 z-10 bg-white/95 backdrop-blur-md tabular-nums border-r border-slate-100">
                    {st.studentNumber}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900 sticky left-32 z-10 bg-white/95 backdrop-blur-md border-r border-slate-200 truncate max-w-[210px]">
                    {st.name}
                  </td>

                  {/* Assessment Items Inputs */}
                  {allItems.map((item) => {
                    const itemData = st.itemScores[item.id];
                    const currentScore = itemData?.score ?? null;
                    const cellKey = `${st.studentUserId}:${item.id}`;
                    const isSaving = savingCells[cellKey];

                    return (
                      <td
                        key={item.id}
                        className="py-1 px-2 border-r border-slate-200/80 text-center"
                      >
                        <input
                          key={`${st.studentUserId}:${item.id}:${currentScore ?? "empty"}`}
                          type="text"
                          defaultValue={currentScore !== null ? String(currentScore) : ""}
                          placeholder="—"
                          disabled={isLocked || isSaving}
                          onBlur={(e) =>
                            handleCellBlur(
                              item.id,
                              st.studentUserId,
                              currentScore,
                              e.target.value
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className={`w-16 py-1 px-1.5 text-center text-xs font-bold rounded-lg border transition-all focus:outline-none tabular-nums ${
                            currentScore !== null
                              ? "border-slate-200 bg-white hover:border-cyan-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-slate-900"
                              : "border-dashed border-slate-300 bg-slate-50/70 text-slate-400 focus:bg-white focus:border-cyan-500"
                          } ${isSaving ? "opacity-40 animate-pulse" : ""}`}
                        />
                      </td>
                    );
                  })}

                  {/* Calculated Final Score */}
                  <td className="py-2.5 px-3 text-center font-extrabold tabular-nums bg-cyan-50/30">
                    {st.calculation.finalScore !== null ? (
                      <span className="text-slate-900 text-sm">
                        {st.calculation.finalScore}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal text-[11px]">
                        Belum Lengkap
                      </span>
                    )}
                  </td>

                  {/* Letter Grade */}
                  <td className="py-2.5 px-3 text-center bg-cyan-50/30 font-bold">
                    {st.calculation.letterGrade ? (
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-extrabold ${
                          st.calculation.letterGrade.startsWith("A")
                            ? "bg-teal-50 border border-teal-200 text-teal-700"
                            : st.calculation.letterGrade.startsWith("B")
                            ? "bg-blue-50 border border-blue-200 text-blue-700"
                            : st.calculation.letterGrade.startsWith("C")
                            ? "bg-amber-50 border border-amber-200 text-amber-700"
                            : "bg-red-50 border border-red-200 text-red-700"
                        }`}
                      >
                        {st.calculation.letterGrade}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">—</span>
                    )}
                  </td>

                  {/* Detail Action */}
                  <td className="py-2.5 px-3 text-center bg-cyan-50/30">
                    <button
                      onClick={() => setSelectedStudentDetail(st)}
                      className="px-2.5 py-1 text-[11px] font-bold text-cyan-700 hover:bg-cyan-100 rounded-lg transition"
                    >
                      Rincian
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredStudents.length}
          pageSize={pageSize}
        />
      </Card>

      {/* Modal Rincian Kalkulasi Mahasiswa */}
      <Modal
        isOpen={selectedStudentDetail !== null}
        onClose={() => setSelectedStudentDetail(null)}
        title="Rincian Kalkulasi Nilai Mahasiswa"
        description={
          selectedStudentDetail
            ? `${selectedStudentDetail.name} (${selectedStudentDetail.studentNumber})`
            : ""
        }
      >
        {selectedStudentDetail && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block">
                  Nilai Akhir Terkalkulasi
                </span>
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {selectedStudentDetail.calculation.finalScore !== null
                    ? selectedStudentDetail.calculation.finalScore
                    : "Belum Lengkap"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block">
                  Huruf Mutu
                </span>
                <span className="text-3xl font-extrabold text-teal-600">
                  {selectedStudentDetail.calculation.letterGrade || "—"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Kontribusi Komponen Penilaian
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                {selectedStudentDetail.calculation.categories.map((cat: CalculatedCategory) => (
                  <div key={cat.categoryId} className="p-3 flex items-center justify-between bg-white/80">
                    <div>
                      <span className="font-bold text-slate-900">
                        {cat.name}
                      </span>
                      <span className="text-slate-500 block text-[11px] mt-0.5">
                        Bobot: <strong>{cat.weightPercent}%</strong> &bull; {cat.gradedItems} dari {cat.totalItems} item dinilai
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 tabular-nums block">
                        {cat.scoreNormalized !== null ? cat.scoreNormalized : "—"}
                      </span>
                      {cat.scoreNormalized !== null && (
                        <span className="text-[10px] font-bold text-teal-600">
                          +{( (cat.scoreNormalized * cat.weightPercent) / 100 ).toFixed(2)} poin akhir
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStudentDetail(null)}
                className="rounded-xl"
              >
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Tambah Item Nilai */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Tambah Item Penilaian Baru"
        description="Tambahkan kolom penilaian baru ke dalam salah satu kategori penilaian."
      >
        <form onSubmit={handleAddItem} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Pilih Kategori Penilaian
            </label>
            <select
              value={newItemCategoryId}
              onChange={(e) => setNewItemCategoryId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {data.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Bobot {c.weightPercent}%)
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Nama Item Penilaian"
            placeholder="Contoh: Tugas 3: REST API & Backend"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            required
          />

          <Input
            label="Nilai Maksimum"
            type="number"
            value={newItemMaxScore}
            onChange={(e) => setNewItemMaxScore(e.target.value)}
            min={1}
            max={1000}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddItemModalOpen(false)}
              className="rounded-xl"
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-xl">
              Tambahkan Kolom
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Atur Bobot Kategori */}
      <Modal
        isOpen={isWeightsModalOpen}
        onClose={() => setIsWeightsModalOpen(false)}
        title="Atur Bobot Kategori Penilaian"
        description="Total seluruh bobot kategori aktif wajib berjumlah 100% untuk kalkulasi dan finalisasi nilai."
      >
        <form onSubmit={handleSaveWeights} className="space-y-4">
          <div className="space-y-3">
            {categoryWeights.map((cat, idx) => (
              <div key={cat.id} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {cat.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="text-slate-400 hover:text-red-600 transition p-1"
                    title="Hapus Kategori"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={cat.weightPercent}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const next = [...categoryWeights];
                      next[idx].weightPercent = val;
                      setCategoryWeights(next);
                    }}
                    className="w-20 rounded-lg border border-slate-200 px-2.5 py-1.5 text-right text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsNewCatModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:text-cyan-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kategori Baru</span>
            </button>
          </div>

          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
              Math.abs(totalModalWeight - 100) < 0.01
                ? "bg-teal-50 text-teal-700 border-teal-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            <span>Total Bobot:</span>
            <span>{totalModalWeight}% / 100% {Math.abs(totalModalWeight - 100) < 0.01 ? "✓ Sesuai" : "⚠ Harus 100%"}</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsWeightsModalOpen(false)}
              className="rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={Math.abs(totalModalWeight - 100) > 0.01}
              className="rounded-xl"
            >
              Simpan Perubahan Bobot
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Tambah Kategori Baru */}
      <Modal
        isOpen={isNewCatModalOpen}
        onClose={() => setIsNewCatModalOpen(false)}
        title="Tambah Kategori Penilaian Baru"
        description="Masukkan nama kategori baru (misal: Praktikum, Sikap, dsb)."
      >
        <form onSubmit={handleAddNewCategory} className="space-y-3.5">
          <Input
            label="Nama Kategori"
            placeholder="Contoh: Praktikum Laboratorium"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            required
          />
          <Input
            label="Bobot Persentase (%)"
            type="number"
            min={1}
            max={100}
            value={newCatWeight}
            onChange={(e) => setNewCatWeight(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewCatModalOpen(false)}
              className="rounded-xl"
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-xl">
              Tambah Kategori
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Kunci Nilai */}
      <Modal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        title={isLocked ? "Buka Kunci Nilai Kelas" : "Kunci Nilai Akhir Kelas"}
        description="Penguncian mencegah perubahan nilai secara tidak disengaja."
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            {isLocked
              ? "Apakah Anda ingin membuka kunci nilai kelas ini? Setelah dibuka, sel nilai dapat diedit kembali oleh dosen."
              : "Setelah dikunci, seluruh sel nilai akan menjadi read-only dan tidak dapat diubah hingga dosen membuka kunci kembali secara sadar."}
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsLockModalOpen(false)}
              className="rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant={isLocked ? "outline" : "destructive"}
              size="sm"
              onClick={handleToggleLock}
              className="rounded-xl"
            >
              {isLocked ? "Buka Kunci Sekarang" : "Kunci Nilai Sekarang"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Publikasikan Nilai */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title={isPublished ? "Tarik Publikasi Nilai" : "Publikasikan Nilai Mahasiswa"}
        description="Publikasi memungkinkan mahasiswa melihat nilai akhir dan rincian komponennya."
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            {isPublished
              ? "Apakah Anda ingin menarik publikasi nilai? Mahasiswa tidak akan dapat melihat nilai akhir hingga dipublikasikan kembali."
              : `Seluruh ${data.students.length} mahasiswa terdaftar akan dapat melihat nilai akhir dan capaian huruf mutu mereka di portal mahasiswa.`}
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPublishModalOpen(false)}
              className="rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleTogglePublish}
              className="rounded-xl"
            >
              {isPublished ? "Tarik Publikasi" : "Publikasikan Sekarang"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
