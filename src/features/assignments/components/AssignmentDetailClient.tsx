"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  FileCheck2,
  Clock,
  Download,
  ExternalLink,
  ArrowLeft,
  Search,
  Check,
  RotateCcw,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { formatDateTime, toDateTimeLocalString, formatFileSize } from "@/lib/utils";
import { gradeSubmission, updateAssignment, deleteAssignment } from "../actions";

export interface AssignmentDetailData {
  id: string;
  title: string;
  instructions: string;
  maxScore: string;
  opensAt: Date | null;
  dueAt: Date | null;
  allowLate: boolean;
  submissionMode: "file" | "url" | "both";
  maxFileSizeMb?: number | null;
  status: "draft" | "published" | "closed";
  classId: string;
  classDisplayName: string;
  classCode: string;
  courseCode: string;
  courseName: string;
  ownerUserId: string;
}

export interface StudentSubmissionRow {
  studentUserId: string;
  name: string;
  email: string;
  studentNumber: string;
  submissionId: string | null;
  status:
    | "draft"
    | "submitted"
    | "late"
    | "returned_for_revision"
    | "resubmitted"
    | "graded";
  hasSubmitted: boolean;
  submittedAt: Date | null;
  currentVersion: number;
  score: number | null;
  feedback: string | null;
  gradedAt: Date | null;
  latestVersion: {
    id: string;
    versionNumber: number;
    originalFilename: string | null;
    externalUrl: string | null;
    note: string | null;
    submittedAt: Date;
    files?: Array<{
      id: string;
      fileObjectKey: string;
      originalFilename: string;
      fileSize: number;
    }>;
  } | null;
}

interface AssignmentDetailClientProps {
  assignment: AssignmentDetailData;
  submissionsList: StudentSubmissionRow[];
}

export function AssignmentDetailClient({
  assignment,
  submissionsList,
}: AssignmentDetailClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Grading Modal State
  const [selectedSub, setSelectedSub] = useState<StudentSubmissionRow | null>(null);
  const [scoreInput, setScoreInput] = useState<string>("");
  const [feedbackInput, setFeedbackInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit & Delete modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const maxScore = parseFloat(assignment.maxScore);

  // Statistics
  const totalStudents = submissionsList.length;
  const submittedCount = submissionsList.filter((s) => s.hasSubmitted).length;
  const gradedCount = submissionsList.filter((s) => s.status === "graded").length;
  const pendingCount = submissionsList.filter(
    (s) => s.status === "submitted" || s.status === "late" || s.status === "resubmitted"
  ).length;

  const filtered = submissionsList.filter((s) => {
    const matchesSearch =
      !searchQuery.trim() ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentNumber.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "pending") {
      matchesStatus = s.status === "submitted" || s.status === "late" || s.status === "resubmitted";
    } else if (statusFilter === "graded") {
      matchesStatus = s.status === "graded";
    } else if (statusFilter === "not_submitted") {
      matchesStatus = !s.hasSubmitted;
    }

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedSubmissions = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const openGradingModal = (row: StudentSubmissionRow) => {
    setSelectedSub(row);
    setScoreInput(row.score !== null ? String(row.score) : "");
    setFeedbackInput(row.feedback || "");
    setErrorMsg(null);
  };

  const handleSaveGrade = async (requestRevision: boolean = false) => {
    if (!selectedSub || !selectedSub.submissionId) return;
    setIsLoading(true);
    setErrorMsg(null);

    const scoreNum = scoreInput !== "" ? parseFloat(scoreInput) : null;
    if (scoreNum !== null && (isNaN(scoreNum) || scoreNum < 0 || scoreNum > maxScore)) {
      setErrorMsg(`Nilai harus berupa angka antara 0 sampai ${maxScore}`);
      setIsLoading(false);
      return;
    }

    const res = await gradeSubmission(
      selectedSub.submissionId,
      scoreNum,
      feedbackInput,
      requestRevision
    );

    if (res.error) {
      setErrorMsg(res.error);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setSelectedSub(null);
    router.refresh();
  };

  const handleUpdateAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditError(null);
    setEditLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await updateAssignment(assignment.id, formData);

    if (res.error) {
      setEditError(res.error);
      setEditLoading(false);
      return;
    }

    setEditLoading(false);
    setIsEditOpen(false);
    router.refresh();
  };

  const handleDeleteAssignment = async () => {
    setDeleteError(null);
    setDeleteLoading(true);

    const res = await deleteAssignment(assignment.id);

    if (res.error) {
      setDeleteError(res.error);
      setDeleteLoading(false);
      return;
    }

    setDeleteLoading(false);
    setIsDeleteOpen(false);
    router.push("/assignments");
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div>
        <Link
          href="/assignments"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#667085] hover:text-[#172033] mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Tugas
        </Link>

        {/* Assignment Header Card */}
        <div className="bg-white rounded-2xl border border-[#E4E9F2] p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#EEF3FF] text-[#2457D6] uppercase tracking-wider">
                  {assignment.courseCode} &bull; {assignment.classDisplayName}
                </span>
                <Badge status={assignment.status} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
                {assignment.title}
              </h1>
              <p className="text-xs text-[#667085] mt-1.5 flex flex-wrap items-center gap-3">
                <span className="text-[#B7791F] font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Tenggat: {formatDateTime(assignment.dueAt)}
                </span>
                <span>&bull;</span>
                <span>Nilai Maks: {assignment.maxScore} Poin</span>
                <span>&bull;</span>
                <span>
                  Metode:{" "}
                  {assignment.submissionMode === "both"
                    ? "File & URL"
                    : assignment.submissionMode === "file"
                    ? "File"
                    : "URL"}
                </span>
                <span>&bull;</span>
                <span>
                  Keterlambatan: {assignment.allowLate ? "Diizinkan" : "Tidak diizinkan"}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditError(null);
                  setIsEditOpen(true);
                }}
              >
                <Pencil className="w-4 h-4 mr-1.5" /> Edit Tugas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#C43D4B] hover:text-[#C43D4B] hover:bg-[#FCECEE]"
                onClick={() => {
                  setDeleteError(null);
                  setIsDeleteOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4 mr-1.5" /> Hapus
              </Button>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="mt-5 p-4 rounded-xl bg-[#F6F8FC] border border-[#E4E9F2]">
            <span className="text-xs font-bold text-[#172033] block mb-1">
              Petunjuk Pengerjaan:
            </span>
            <p className="text-xs text-[#667085] whitespace-pre-line leading-relaxed">
              {assignment.instructions}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">
            Total Mahasiswa
          </p>
          <p className="text-2xl font-bold text-[#172033] mt-1 tabular-nums">
            {totalStudents}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">
            Sudah Terkumpul
          </p>
          <p className="text-2xl font-bold text-[#172033] mt-1 tabular-nums">
            {submittedCount}
          </p>
        </Card>
        <Card className="p-4 border-[#B7791F]/30 bg-[#FDF5E6]/30">
          <p className="text-xs font-medium text-[#B7791F] uppercase tracking-wider">
            Perlu Dinilai
          </p>
          <p className="text-2xl font-bold text-[#B7791F] mt-1 tabular-nums">
            {pendingCount}
          </p>
        </Card>
        <Card className="p-4 border-[#16845B]/30 bg-[#E8F5EF]/30">
          <p className="text-xs font-medium text-[#16845B] uppercase tracking-wider">
            Selesai Dinilai
          </p>
          <p className="text-2xl font-bold text-[#16845B] mt-1 tabular-nums">
            {gradedCount}
          </p>
        </Card>
      </div>

      {/* Submissions Table Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E9F2] pb-4">
          <CardTitle>Daftar Pengumpulan Mahasiswa</CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#667085]" />
              <input
                type="text"
                placeholder="Cari NIM atau nama..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-[#E4E9F2] pl-8 pr-3 py-1.5 text-xs text-[#172033] focus:outline-none focus:border-[#2457D6]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto rounded-lg border border-[#E4E9F2] bg-white px-2.5 py-1.5 text-xs text-[#172033] focus:outline-none focus:border-[#2457D6]"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Perlu Dinilai</option>
              <option value="graded">Sudah Dinilai</option>
              <option value="not_submitted">Belum Mengumpulkan</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F8FC] border-b border-[#E4E9F2] text-[#667085]">
                <tr>
                  <th className="py-3 px-4 font-semibold">NIM</th>
                  <th className="py-3 px-4 font-semibold">Nama Mahasiswa</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold">Waktu Pengumpulan</th>
                  <th className="py-3 px-4 font-semibold text-center">Versi</th>
                  <th className="py-3 px-4 font-semibold text-center">Nilai</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E9F2]">
                {paginatedSubmissions.map((st) => (
                  <tr key={st.studentUserId} className="hover:bg-[#F6F8FC]/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#172033] tabular-nums">
                      {st.studentNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#172033]">
                      {st.name}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {st.hasSubmitted ? (
                        <Badge status={st.status} />
                      ) : (
                        <Badge variant="default">Belum Mengumpulkan</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#667085] tabular-nums">
                      {st.submittedAt ? formatDateTime(st.submittedAt) : "—"}
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums">
                      {st.hasSubmitted ? `v${st.currentVersion}` : "—"}
                    </td>
                    <td className="py-3 px-4 text-center font-bold tabular-nums">
                      {st.score !== null ? (
                        <span className="text-[#16845B]">
                          {st.score} / {maxScore}
                        </span>
                      ) : (
                        <span className="text-[#667085] font-normal">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {st.hasSubmitted ? (
                        <Button
                          variant={st.status === "graded" ? "outline" : "primary"}
                          size="sm"
                          onClick={() => openGradingModal(st)}
                        >
                          {st.status === "graded" ? "Lihat / Edit Nilai" : "Beri Nilai"}
                        </Button>
                      ) : (
                        <span className="text-xs text-[#667085] italic">Menunggu</span>
                      )}
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
            totalItems={filtered.length}
            pageSize={pageSize}
          />
        </CardContent>
      </Card>

      {/* Grading Modal */}
      <Modal
        isOpen={selectedSub !== null}
        onClose={() => setSelectedSub(null)}
        title="Penilaian & Review Submisi"
        description={
          selectedSub
            ? `Pemeriksaan tugas untuk ${selectedSub.name} (${selectedSub.studentNumber})`
            : ""
        }
        maxWidth="lg"
      >
        {selectedSub && (
          <div className="space-y-4">
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-[#FCECEE] border border-[#C43D4B]/20 text-xs text-[#C43D4B]">
                {errorMsg}
              </div>
            )}

            {/* Submission Preview Card */}
            <div className="p-4 rounded-xl bg-[#F6F8FC] border border-[#E4E9F2] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#172033]">
                  Versi {selectedSub.currentVersion}
                </span>
                <span className="text-[#667085] tabular-nums">
                  Dikumpulkan: {formatDateTime(selectedSub.submittedAt)}
                </span>
              </div>

              {/* File Attachment(s) */}
              {selectedSub.latestVersion?.files && selectedSub.latestVersion.files.length > 0 ? (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#667085] block">
                    Berkas Lampiran Mahasiswa ({selectedSub.latestVersion.files.length}):
                  </span>
                  {selectedSub.latestVersion.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-[#E4E9F2]"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileCheck2 className="w-4 h-4 text-[#2457D6] shrink-0" />
                        <span className="text-xs font-medium text-[#172033] truncate">
                          {file.originalFilename}
                        </span>
                        {file.fileSize > 0 && (
                          <span className="text-[11px] text-[#667085] shrink-0">
                            ({formatFileSize(file.fileSize)})
                          </span>
                        )}
                      </div>
                      <a
                        href={`/api/files/submission/${selectedSub.latestVersion?.id}?fileId=${file.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-[#EEF3FF] text-[#2457D6] hover:bg-[#DCE7FD] transition-colors shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" /> Unduh
                      </a>
                    </div>
                  ))}
                </div>
              ) : selectedSub.latestVersion?.originalFilename ? (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E4E9F2]">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileCheck2 className="w-4 h-4 text-[#2457D6] shrink-0" />
                    <span className="text-xs font-medium text-[#172033] truncate">
                      {selectedSub.latestVersion.originalFilename}
                    </span>
                  </div>
                  <a
                    href={`/api/files/submission/${selectedSub.latestVersion.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md bg-[#EEF3FF] text-[#2457D6] hover:bg-[#DCE7FD] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh File
                  </a>
                </div>
              ) : null}

              {/* External URL */}
              {selectedSub.latestVersion?.externalUrl && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E4E9F2]">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <ExternalLink className="w-4 h-4 text-[#16845B] shrink-0" />
                    <span className="text-xs font-medium text-[#172033] truncate">
                      {selectedSub.latestVersion.externalUrl}
                    </span>
                  </div>
                  <a
                    href={selectedSub.latestVersion.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md bg-[#E8F5EF] text-[#16845B] hover:bg-[#D2EEDF] transition-colors"
                  >
                    Buka Tautan <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Student Note */}
              {selectedSub.latestVersion?.note && (
                <div className="text-xs space-y-0.5">
                  <span className="text-[#667085] font-medium">Catatan Mahasiswa:</span>
                  <p className="p-2.5 bg-white rounded-lg border border-[#E4E9F2] text-[#172033] italic">
                    &quot;{selectedSub.latestVersion.note}&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Score & Feedback Form */}
            <div className="space-y-3.5 pt-2">
              <Input
                label={`Nilai Tugas (Skala 0 - ${maxScore})`}
                type="number"
                min={0}
                max={maxScore}
                step="0.01"
                placeholder={`0 - ${maxScore}`}
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                disabled={isLoading}
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#172033]">
                  Feedback / Masukan Dosen
                </label>
                <textarea
                  rows={3}
                  placeholder="Berikan umpan balik atau instruksi perbaikan..."
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full rounded-lg border border-[#E4E9F2] bg-white p-3 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6]"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-[#E4E9F2]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-[#B7791F] border-[#B7791F]/30 hover:bg-[#FDF5E6] w-full sm:w-auto"
                onClick={() => handleSaveGrade(true)}
                isLoading={isLoading}
              >
                <RotateCcw className="w-4 h-4 mr-1.5" /> Minta Revisi
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSub(null)}
                  disabled={isLoading}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleSaveGrade(false)}
                  isLoading={isLoading}
                >
                  <Check className="w-4 h-4 mr-1.5" /> Simpan Nilai
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Edit Tugas */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Tugas"
        description="Perbarui informasi instruksi, batas waktu deadline, atau pengaturan tugas."
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateAssignment} className="space-y-3.5">
          {editError && (
            <div className="p-2.5 rounded-lg bg-[#FCECEE] border border-[#C43D4B]/20 text-xs text-[#C43D4B]">
              {editError}
            </div>
          )}

          <div className="p-2.5 rounded-lg bg-[#F4F7FE] border border-[#2457D6]/20 text-xs text-[#2457D6]">
            Kelas: <strong>{assignment.classDisplayName}</strong> ({assignment.courseCode})
          </div>

          <Input
            label="Judul Tugas"
            name="title"
            defaultValue={assignment.title}
            required
            disabled={editLoading}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#172033]">
              Instruksi / Deskripsi Pengerjaan
            </label>
            <textarea
              name="instructions"
              rows={4}
              defaultValue={assignment.instructions}
              required
              className="w-full rounded-lg border border-[#E4E9F2] bg-white p-3 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6]"
              disabled={editLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Tenggat Waktu (Deadline)"
              name="dueAt"
              type="datetime-local"
              defaultValue={toDateTimeLocalString(assignment.dueAt)}
              required
              disabled={editLoading}
            />
            <Input
              label="Skor Maksimum"
              name="maxScore"
              type="number"
              defaultValue={assignment.maxScore}
              min={1}
              max={1000}
              required
              disabled={editLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#172033]">
                Metode Pengumpulan
              </label>
              <select
                name="submissionMode"
                defaultValue={assignment.submissionMode}
                className="w-full rounded-lg border border-[#E4E9F2] bg-white px-3.5 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6]"
                disabled={editLoading}
              >
                <option value="both">Unggah File &amp; Tautan URL</option>
                <option value="file">Hanya Unggah File</option>
                <option value="url">Hanya Tautan URL</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#172033]">
                Status Tugas
              </label>
              <select
                name="status"
                defaultValue={assignment.status}
                className="w-full rounded-lg border border-[#E4E9F2] bg-white px-3.5 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6]"
                disabled={editLoading}
              >
                <option value="published">Dipublikasikan</option>
                <option value="draft">Draft</option>
                <option value="closed">Ditutup</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Batas Maksimum File (MB)"
              name="maxFileSizeMb"
              type="number"
              defaultValue={assignment.maxFileSizeMb || 10}
              min={1}
              max={50}
              disabled={editLoading}
            />

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="allowLate"
                  value="true"
                  defaultChecked={assignment.allowLate}
                  className="h-4 w-4 rounded border-gray-300 text-[#2457D6] focus:ring-[#2457D6]"
                />
                <span className="text-xs font-medium text-[#172033]">
                  Izinkan pengumpulan terlambat
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E4E9F2]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(false)}
              disabled={editLoading}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={editLoading}>
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Hapus Tugas */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Tugas"
        description="Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan."
        maxWidth="md"
      >
        <div className="space-y-4">
          {deleteError && (
            <div className="p-2.5 rounded-lg bg-[#FCECEE] border border-[#C43D4B]/20 text-xs text-[#C43D4B]">
              {deleteError}
            </div>
          )}

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FCECEE]/50 border border-[#C43D4B]/20 text-xs text-[#172033]">
            <AlertTriangle className="w-5 h-5 text-[#C43D4B] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#C43D4B]">Peringatan Penghapusan</p>
              <p className="mt-1 text-[#667085]">
                Menghapus tugas <strong>&quot;{assignment.title}&quot;</strong> akan menghapus seluruh data pengumpulan (submisi mahasiswa), riwayat file versi tugas, dan item nilai terkait di Gradebook.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deleteLoading}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteAssignment}
              isLoading={deleteLoading}
            >
              Hapus Tugas
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
