"use client";

import React, { useState, useTransition } from "react";
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
} from "lucide-react";
import {
  type GradebookData,
  type StudentGradeRow,
  updateGradeScore,
  createAssessmentItem,
  updateCategoryWeights,
  toggleLockGrades,
  togglePublishGrades,
} from "../actions";
import { type CalculatedCategory } from "../engine";

interface GradebookClientProps {
  initialData: GradebookData;
  availableClasses: Array<{ id: string; displayName: string }>;
}

export function GradebookClient({
  initialData,
  availableClasses,
}: GradebookClientProps) {
  const router = useRouter();
  const [data] = useState<GradebookData>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentDetail, setSelectedStudentDetail] =
    useState<StudentGradeRow | null>(null);

  // Modals
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  // Form states
  const [categoryWeights, setCategoryWeights] = useState<
    Array<{ id: string; name: string; weightPercent: number }>
  >(
    data.categories.map((c) => ({
      id: c.id,
      name: c.name,
      weightPercent: c.weightPercent,
    }))
  );

  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemCategoryId, setNewItemCategoryId] = useState(
    data.categories[0]?.id || ""
  );
  const [newItemMaxScore, setNewItemMaxScore] = useState("100");

  const [savingCells, setSavingCells] = useState<Record<string, boolean>>({});
  const [activeCellError, setActiveCellError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

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
      return;
    }

    // Refresh data in transition
    startTransition(() => {
      router.refresh();
    });
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    const res = await createAssessmentItem(
      data.classInfo.id,
      newItemCategoryId,
      newItemTitle,
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

  const handleToggleLock = async () => {
    const res = await toggleLockGrades(data.classInfo.id, !isLocked);
    if (res.error) {
      alert(res.error);
      return;
    }
    setIsLockModalOpen(false);
    router.refresh();
  };

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
    <div className="space-y-6">
      {/* Header & Class Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#EEF3FF] text-[#2457D6] uppercase tracking-wider">
              {data.classInfo.courseCode} &bull; Kelas {data.classInfo.classCode}
            </span>
            {isLocked && <Badge status="locked" />}
            {isPublished && <Badge status="published" />}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
            Gradebook &amp; Kalkulasi Nilai
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            {data.classInfo.displayName} &bull; Semester {data.classInfo.termName}
          </p>
        </div>

        {/* Switch Class Dropdown & Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={data.classInfo.id}
            onChange={(e) => router.push(`/gradebook?classId=${e.target.value}`)}
            className="rounded-lg border border-[#E4E9F2] bg-white px-3 py-2 text-xs font-medium text-[#172033] focus:outline-none focus:border-[#2457D6]"
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
          >
            <Sliders className="w-4 h-4 mr-1.5" /> Bobot Kategori
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddItemModalOpen(true)}
            disabled={isLocked}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Tambah Item Nilai
          </Button>

          <Button
            variant={isLocked ? "destructive" : "outline"}
            size="sm"
            onClick={() => setIsLockModalOpen(true)}
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
          >
            <Globe className="w-4 h-4 mr-1.5" />
            {isPublished ? "Nilai Terbit" : "Terbitkan Nilai"}
          </Button>

          <a
            href={`/api/export/gradebook?classId=${data.classInfo.id}&format=xlsx`}
            download
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#E4E9F2] text-[#172033] hover:bg-[#F6F8FC] shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-[#16845B]" />
            Ekspor XLSX
          </a>

          <a
            href={`/api/export/gradebook?classId=${data.classInfo.id}&format=csv`}
            download
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#E4E9F2] text-[#667085] hover:bg-[#F6F8FC] shadow-2xs transition-colors"
          >
            Ekspor CSV
          </a>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">
                Rata-rata Kelas
              </p>
              <p className="text-2xl font-bold text-[#172033] mt-1 tabular-nums">
                {data.classStats.averageScore !== null
                  ? data.classStats.averageScore
                  : "—"}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#EEF3FF] text-[#2457D6] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">
                Nilai Tertinggi
              </p>
              <p className="text-2xl font-bold text-[#16845B] mt-1 tabular-nums">
                {data.classStats.highestScore !== null
                  ? data.classStats.highestScore
                  : "—"}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#E8F5EF] text-[#16845B] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">
                Kelulusan (≥ 55)
              </p>
              <p className="text-2xl font-bold text-[#2457D6] mt-1 tabular-nums">
                {data.classStats.passingRatePercent}%
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#EEF3FF] text-[#2457D6] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">
                Total Bobot Aktif
              </p>
              <p
                className={`text-2xl font-bold mt-1 tabular-nums ${
                  Math.abs(data.totalActiveWeight - 100) < 0.01
                    ? "text-[#16845B]"
                    : "text-[#C43D4B]"
                }`}
              >
                {data.totalActiveWeight}%
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#F6F8FC] text-[#667085] flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {activeCellError && (
        <div className="p-3 bg-[#FCECEE] border border-[#C43D4B]/20 rounded-xl text-xs text-[#C43D4B]">
          {activeCellError}
        </div>
      )}

      {/* Gradebook Table Card */}
      <Card className="overflow-hidden">
        {/* Search & Notice Bar */}
        <div className="p-3 bg-white border-b border-[#E4E9F2] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#667085]" />
            <input
              type="text"
              placeholder="Cari NIM atau nama mahasiswa..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-[#E4E9F2] pl-8 pr-3 py-1.5 text-xs text-[#172033] focus:outline-none focus:border-[#2457D6]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-[#667085]">
            <Info className="w-4 h-4 text-[#2457D6] shrink-0" />
            <span>
              Ketik nilai lalu tekan <strong>Enter</strong> atau klik di luar kotak untuk menyimpan otomatis. Kosong = Belum Dinilai.
            </span>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto max-h-[650px] relative">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F6F8FC] sticky top-0 z-20 shadow-xs">
              {/* Category Grouping Row */}
              <tr className="border-b border-[#E4E9F2] text-[11px]">
                <th
                  colSpan={2}
                  className="py-2.5 px-4 font-semibold text-[#172033] bg-[#F6F8FC] sticky left-0 z-30 border-r border-[#E4E9F2]"
                >
                  Identitas Mahasiswa
                </th>

                {data.categories.map((cat) => (
                  <th
                    key={cat.id}
                    colSpan={Math.max(cat.items.length, 1)}
                    className="py-2 px-3 font-bold text-center border-r border-[#E4E9F2] bg-[#F0F3F9] text-[#172033]"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{cat.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#2457D6]/10 text-[#2457D6]">
                        {cat.weightPercent}%
                      </span>
                    </div>
                  </th>
                ))}

                <th
                  colSpan={3}
                  className="py-2 px-4 font-bold text-center bg-[#EEF3FF] text-[#2457D6]"
                >
                  Kalkulasi Nilai Akhir
                </th>
              </tr>

              {/* Assessment Item Headers */}
              <tr className="border-b border-[#E4E9F2] text-[#667085]">
                <th className="py-2.5 px-4 font-semibold sticky left-0 z-30 bg-[#F6F8FC] w-28">
                  NIM
                </th>
                <th className="py-2.5 px-4 font-semibold sticky left-28 z-30 bg-[#F6F8FC] border-r border-[#E4E9F2] w-48">
                  Nama Mahasiswa
                </th>

                {allItems.length === 0 ? (
                  <th className="py-2.5 px-4 text-center italic text-[#667085]">
                    Belum ada item penilaian. Tambahkan item di tombol atas.
                  </th>
                ) : (
                  allItems.map((item) => (
                    <th
                      key={item.id}
                      className="py-2.5 px-3 font-semibold text-center border-r border-[#E4E9F2] min-w-[110px]"
                      title={`Kategori: ${item.categoryName} (${item.categoryWeight}%)`}
                    >
                      <div className="line-clamp-1">{item.title}</div>
                      <div className="text-[10px] text-[#667085] font-normal">
                        Max {item.maxScore}
                      </div>
                    </th>
                  ))
                )}

                <th className="py-2.5 px-3 font-semibold text-center bg-[#EEF3FF]/70 min-w-[90px]">
                  Nilai Akhir
                </th>
                <th className="py-2.5 px-3 font-semibold text-center bg-[#EEF3FF]/70 min-w-[70px]">
                  Huruf
                </th>
                <th className="py-2.5 px-3 font-semibold text-center bg-[#EEF3FF]/70 min-w-[90px]">
                  Detail
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E4E9F2]">
              {paginatedStudents.map((st) => (
                <tr key={st.studentUserId} className="hover:bg-[#F6F8FC]/60 transition-colors">
                  {/* Sticky Student Columns */}
                  <td className="py-2.5 px-4 font-medium text-[#172033] sticky left-0 z-10 bg-white tabular-nums">
                    {st.studentNumber}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-[#172033] sticky left-28 z-10 bg-white border-r border-[#E4E9F2] truncate max-w-[190px]">
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
                        className="py-1 px-2 border-r border-[#E4E9F2] text-center"
                      >
                        <input
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
                          className={`w-16 py-1 px-1.5 text-center text-xs font-semibold rounded border transition-colors focus:outline-none tabular-nums ${
                            currentScore !== null
                              ? "border-transparent bg-white hover:border-gray-300 focus:border-[#2457D6] text-[#172033]"
                              : "border-dashed border-gray-200 bg-gray-50/50 text-[#667085] focus:bg-white focus:border-[#2457D6]"
                          } ${isSaving ? "opacity-40 animate-pulse" : ""}`}
                        />
                      </td>
                    );
                  })}

                  {/* Calculated Final Score */}
                  <td className="py-2.5 px-3 text-center font-bold tabular-nums bg-[#EEF3FF]/20">
                    {st.calculation.finalScore !== null ? (
                      <span className="text-[#172033]">
                        {st.calculation.finalScore}
                      </span>
                    ) : (
                      <span className="text-[#667085] font-normal text-[11px]">
                        Belum Lengkap
                      </span>
                    )}
                  </td>

                  {/* Letter Grade */}
                  <td className="py-2.5 px-3 text-center bg-[#EEF3FF]/20 font-bold">
                    {st.calculation.letterGrade ? (
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-[#16845B]/10 text-[#16845B]">
                        {st.calculation.letterGrade}
                      </span>
                    ) : (
                      <span className="text-[#667085] font-normal">—</span>
                    )}
                  </td>

                  {/* Detail Action */}
                  <td className="py-2.5 px-3 text-center bg-[#EEF3FF]/20">
                    <button
                      onClick={() => setSelectedStudentDetail(st)}
                      className="px-2 py-1 text-[11px] font-medium text-[#2457D6] hover:bg-[#EEF3FF] rounded transition-colors"
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
            <div className="p-4 rounded-xl bg-[#F6F8FC] border border-[#E4E9F2] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#667085] uppercase tracking-wider font-semibold block">
                  Nilai Akhir Mahasiswa
                </span>
                <span className="text-3xl font-extrabold text-[#172033] tabular-nums">
                  {selectedStudentDetail.calculation.finalScore !== null
                    ? selectedStudentDetail.calculation.finalScore
                    : "Belum Lengkap"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#667085] uppercase tracking-wider font-semibold block">
                  Huruf Mutu
                </span>
                <span className="text-2xl font-bold text-[#16845B]">
                  {selectedStudentDetail.calculation.letterGrade || "—"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                Kontribusi Komponen Penilaian
              </h4>
              <div className="divide-y divide-[#E4E9F2] border border-[#E4E9F2] rounded-xl overflow-hidden text-xs">
                {selectedStudentDetail.calculation.categories.map((cat: CalculatedCategory) => (
                  <div key={cat.categoryId} className="p-3 flex items-center justify-between bg-white">
                    <div>
                      <span className="font-semibold text-[#172033]">
                        {cat.name}
                      </span>
                      <span className="text-[#667085] block text-[11px]">
                        Bobot: {cat.weightPercent}% &bull; {cat.gradedItems} dari {cat.totalItems} item dinilai
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#172033] tabular-nums block">
                        {cat.scoreNormalized !== null ? cat.scoreNormalized : "—"}
                      </span>
                      {cat.scoreNormalized !== null && (
                        <span className="text-[10px] text-[#16845B]">
                          +{( (cat.scoreNormalized * cat.weightPercent) / 100 ).toFixed(2)} poin
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
        description="Tambahkan kolom penilaian baru ke dalam kategori penilaian yang ada."
      >
        <form onSubmit={handleAddItem} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#172033]">
              Pilih Kategori Penilaian
            </label>
            <select
              value={newItemCategoryId}
              onChange={(e) => setNewItemCategoryId(e.target.value)}
              required
              className="w-full rounded-lg border border-[#E4E9F2] bg-white px-3.5 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6]"
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
            placeholder="Contoh: Tugas 2: Tree Traversal"
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
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
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
        description="Total seluruh bobot kategori aktif wajib berjumlah 100% untuk finalisasi nilai."
      >
        <form onSubmit={handleSaveWeights} className="space-y-4">
          <div className="space-y-3">
            {categoryWeights.map((cat, idx) => (
              <div key={cat.id} className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[#172033]">
                  {cat.name}
                </span>
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
                    className="w-20 rounded-lg border border-[#E4E9F2] px-2.5 py-1.5 text-right text-sm font-semibold text-[#172033] focus:outline-none focus:border-[#2457D6]"
                  />
                  <span className="text-sm font-semibold text-[#667085]">%</span>
                </div>
              </div>
            ))}
          </div>

          <div
            className={`p-3 rounded-lg border flex items-center justify-between text-xs font-bold ${
              Math.abs(totalModalWeight - 100) < 0.01
                ? "bg-[#E8F5EF] text-[#16845B] border-[#16845B]/20"
                : "bg-[#FCECEE] text-[#C43D4B] border-[#C43D4B]/20"
            }`}
          >
            <span>Total Bobot:</span>
            <span>{totalModalWeight}% / 100%</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsWeightsModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={Math.abs(totalModalWeight - 100) > 0.01}
            >
              Simpan Perubahan Bobot
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
        <div className="space-y-4 text-xs text-[#667085]">
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
            >
              Batal
            </Button>
            <Button
              type="button"
              variant={isLocked ? "outline" : "destructive"}
              size="sm"
              onClick={handleToggleLock}
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
        <div className="space-y-4 text-xs text-[#667085]">
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
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleTogglePublish}
            >
              {isPublished ? "Tarik Publikasi" : "Publikasikan Sekarang"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
