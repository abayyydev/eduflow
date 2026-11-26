"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Clock,
  ArrowLeft,
  Upload,
  ExternalLink,
  Download,
  AlertTriangle,
  CheckCircle2,
  Send,
  Save,
  FileText,
  X,
} from "lucide-react";
import { formatDateTime, formatFileSize, isPastDeadline } from "@/lib/utils";
import { submitStudentAssignment } from "../actions";

export interface StudentAssignmentDetailData {
  id: string;
  title: string;
  instructions: string;
  maxScore: string;
  opensAt: Date | null;
  dueAt: Date | null;
  allowLate: boolean;
  submissionMode: "file" | "url" | "both";
  maxFileSizeMb: number;
  status: "draft" | "published" | "closed";
  classId: string;
  classDisplayName: string;
  courseCode: string;
  lecturerName: string;
}

export interface StudentSubmissionData {
  id: string;
  assignmentId: string;
  studentId?: string;
  studentUserId?: string;
  status:
    | "draft"
    | "submitted"
    | "late"
    | "returned_for_revision"
    | "resubmitted"
    | "graded";
  submittedAt: Date | null;
  currentVersion: number;
  score: string | null;
  feedback: string | null;
  gradedAt: Date | null;
}

export interface SubmissionFileItem {
  id: string;
  fileObjectKey: string;
  originalFilename: string;
  fileSize: number;
}

export interface StudentVersionData {
  id: string;
  submissionId: string;
  versionNumber: number;
  fileObjectKey: string | null;
  originalFilename: string | null;
  externalUrl: string | null;
  note: string | null;
  submittedAt: Date;
  files?: SubmissionFileItem[];
}

interface StudentSubmissionClientProps {
  assignment: StudentAssignmentDetailData;
  submission: StudentSubmissionData | null;
  versions: StudentVersionData[];
}

export function StudentSubmissionClient({
  assignment,
  submission,
  versions,
}: StudentSubmissionClientProps) {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [externalUrl, setExternalUrl] = useState(
    submission?.status === "draft" && versions[0]?.externalUrl
      ? versions[0].externalUrl
      : ""
  );
  const [note, setNote] = useState(
    submission?.status === "draft" && versions[0]?.note
      ? versions[0].note
      : ""
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isLate = isPastDeadline(assignment.dueAt);
  const isClosed = assignment.status === "closed" || (isLate && !assignment.allowLate);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const incoming = Array.from(e.target.files);
    const maxBytes = (assignment.maxFileSizeMb || 10) * 1024 * 1024;
    const oversized = incoming.filter((f) => f.size > maxBytes);
    if (oversized.length > 0) {
      setErrorMsg(
        `File "${oversized.map((f) => f.name).join(", ")}" melebihi batas ${assignment.maxFileSizeMb} MB per file.`
      );
      e.target.value = "";
      return;
    }
    setErrorMsg(null);
    setSelectedFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const newlyAdded = incoming.filter((f) => !existingNames.has(f.name));
      return [...prev, ...newlyAdded];
    });
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (action: "draft" | "submit") => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append("assignmentId", assignment.id);
    formData.append("action", action);
    if (externalUrl) formData.append("externalUrl", externalUrl);
    if (note) formData.append("note", note);
    for (const file of selectedFiles) {
      formData.append("files", file);
    }

    const res = await submitStudentAssignment(formData);

    if (res.error) {
      setErrorMsg(res.error);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setSuccessMsg(
      action === "draft"
        ? "Draft berhasil disimpan."
        : "Tugas berhasil dikirimkan ke dosen!"
    );
    setSelectedFiles([]);
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/student/assignments"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#667085] hover:text-[#172033] mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Tugas
        </Link>

        {/* Assignment Header Card */}
        <div className="bg-white rounded-2xl border border-[#E4E9F2] p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#EEF3FF] text-[#2457D6] uppercase tracking-wider">
                  {assignment.courseCode} &bull; {assignment.classDisplayName}
                </span>
                {submission?.status ? (
                  <Badge status={submission.status} />
                ) : (
                  <Badge variant="default">Belum Mengumpulkan</Badge>
                )}
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
                    ? "File & Tautan URL"
                    : assignment.submissionMode === "file"
                    ? "Unggah File"
                    : "Tautan URL"}
                </span>
                <span>&bull;</span>
                <span>Dosen: {assignment.lecturerName}</span>
              </p>
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

      {/* Grade / Feedback Card if graded */}
      {submission?.status === "graded" && (
        <Card className="border-[#16845B]/30 bg-[#E8F5EF]/30">
          <CardHeader>
            <CardTitle className="text-[#16845B] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Hasil Penilaian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#16845B]">
                {submission.score}
              </span>
              <span className="text-sm font-medium text-[#667085]">
                / {assignment.maxScore} Poin
              </span>
            </div>
            {submission.feedback && (
              <div className="p-3 rounded-lg bg-white border border-[#E4E9F2] text-xs">
                <span className="font-semibold text-[#172033] block mb-1">
                  Catatan dari Dosen:
                </span>
                <p className="text-[#667085] whitespace-pre-line leading-relaxed">
                  {submission.feedback}
                </p>
              </div>
            )}
            {submission.gradedAt && (
              <p className="text-[11px] text-[#667085]">
                Dinilai pada: {formatDateTime(submission.gradedAt)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Revision Notice if returned for revision */}
      {submission?.status === "returned_for_revision" && (
        <div className="p-4 rounded-xl bg-[#FDF5E6] border border-[#B7791F]/30 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#B7791F] mb-1">
            <AlertTriangle className="w-4 h-4" /> Tugas Diminta Revisi oleh Dosen
          </div>
          {submission.feedback && (
            <p className="text-[#172033] mt-1 pl-6">
              Catatan perbaikan: &quot;{submission.feedback}&quot;
            </p>
          )}
          <p className="text-[#667085] mt-1 pl-6">
            Silakan perbaiki file atau tautan tugas Anda di bawah dan kirim ulang.
          </p>
        </div>
      )}

      {/* Submission Form Card */}
      {!isClosed && submission?.status !== "graded" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#2457D6]" />
              Form Pengumpulan Tugas
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-[#FCECEE] border border-[#C43D4B]/20 text-xs text-[#C43D4B]">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-lg bg-[#E8F5EF] border border-[#16845B]/20 text-xs text-[#16845B]">
                {successMsg}
              </div>
            )}

            {isLate && assignment.allowLate && (
              <div className="p-3 rounded-lg bg-[#FDF5E6] border border-[#B7791F]/20 text-xs text-[#B7791F] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Waktu pengumpulan telah melewati batas tenggat. Pengumpulan Anda akan ditandai sebagai <strong>Terlambat</strong>.
                </span>
              </div>
            )}

            {/* File Upload Section */}
            {assignment.submissionMode !== "url" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-[#172033]">
                    Unggah File Tugas (Bisa Multiple File)
                  </label>
                  <span className="text-[11px] text-[#667085]">
                    Maks. {assignment.maxFileSizeMb} MB per file
                  </span>
                </div>

                <div className="border-2 border-dashed border-[#E4E9F2] rounded-xl p-5 text-center hover:border-[#2457D6]/50 transition-colors bg-white">
                  <input
                    type="file"
                    id="fileUpload"
                    multiple
                    className="hidden"
                    onChange={handleFilesChange}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="fileUpload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#EEF3FF] flex items-center justify-center text-[#2457D6]">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#2457D6]">
                        Klik untuk memilih file (bisa pilih beberapa file sekaligus)
                      </span>
                      <p className="text-[11px] text-[#667085] mt-0.5">
                        Dokumen PDF, Word, Excel, ZIP, Gambar, atau source code
                      </p>
                    </div>
                  </label>
                </div>

                {/* List of selected files to upload */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-medium text-[#172033]">
                      <span>File terpilih ({selectedFiles.length}):</span>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles([])}
                        className="text-[#C43D4B] hover:underline text-[11px]"
                      >
                        Hapus Semua
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={`${file.name}-${idx}`}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#F6F8FC] border border-[#E4E9F2] text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-[#2457D6] shrink-0" />
                            <span className="font-medium text-[#172033] truncate">
                              {file.name}
                            </span>
                            <span className="text-[#667085] text-[11px] shrink-0">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="text-[#667085] hover:text-[#C43D4B] p-1 rounded-md transition-colors"
                            title="Hapus file ini"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* External URL Section */}
            {assignment.submissionMode !== "file" && (
              <Input
                label="Tautan URL Eksternal (Google Drive / GitHub / Figma)"
                placeholder="https://drive.google.com/... atau https://github.com/..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                disabled={isLoading}
                helperText="Pastikan akses tautan publik atau dapat dilihat oleh dosen pengampu."
              />
            )}

            {/* Catatan Mahasiswa */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#172033]">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder="Tulis pesan atau keterangan untuk dosen jika ada..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-lg border border-[#E4E9F2] bg-white p-3 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6]"
                disabled={isLoading}
              />
            </div>

            {/* Submit Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-[#E4E9F2]">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => handleSubmit("draft")}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-1.5" /> Simpan Draft
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => handleSubmit("submit")}
                isLoading={isLoading}
                className="w-full sm:w-auto"
              >
                <Send className="w-4 h-4 mr-1.5" /> Kirim Tugas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isClosed && (
        <div className="p-4 rounded-xl bg-[#F6F8FC] border border-[#E4E9F2] text-xs text-[#667085] text-center">
          Tenggat pengumpulan tugas ini telah berakhir dan pengumpulan telah ditutup.
        </div>
      )}

      {/* Submission Versions History */}
      {versions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Versi Pengumpulan</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F8FC] border-y border-[#E4E9F2] text-[#667085]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Versi</th>
                    <th className="py-2.5 px-4 font-semibold">Waktu Pengumpulan</th>
                    <th className="py-2.5 px-4 font-semibold">Lampiran Berkas / Tautan</th>
                    <th className="py-2.5 px-4 font-semibold">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E9F2]">
                  {versions.map((v) => (
                    <tr key={v.id} className="hover:bg-[#F6F8FC]/50">
                      <td className="py-2.5 px-4 font-bold text-[#172033] tabular-nums">
                        v{v.versionNumber}
                      </td>
                      <td className="py-2.5 px-4 text-[#667085] tabular-nums">
                        {formatDateTime(v.submittedAt)}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-col gap-1.5">
                          {v.files && v.files.length > 0 ? (
                            v.files.map((file) => (
                              <a
                                key={file.id}
                                href={`/api/files/submission/${v.id}?fileId=${file.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[#2457D6] hover:underline font-medium"
                              >
                                <Download className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{file.originalFilename}</span>
                                {file.fileSize > 0 && (
                                  <span className="text-[10px] text-[#667085] shrink-0">
                                    ({formatFileSize(file.fileSize)})
                                  </span>
                                )}
                              </a>
                            ))
                          ) : v.originalFilename ? (
                            <a
                              href={`/api/files/submission/${v.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[#2457D6] hover:underline font-medium"
                            >
                              <Download className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{v.originalFilename}</span>
                            </a>
                          ) : null}

                          {v.externalUrl && (
                            <a
                              href={v.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#16845B] hover:underline font-medium"
                            >
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" /> Buka Tautan Eksternal
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-[#667085] italic">
                        {v.note || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
