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
} from "lucide-react";
import { formatDateTime, isPastDeadline } from "@/lib/utils";
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

export interface StudentVersionData {
  id: string;
  submissionId: string;
  versionNumber: number;
  fileObjectKey: string | null;
  originalFilename: string | null;
  externalUrl: string | null;
  note: string | null;
  submittedAt: Date;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  const handleSubmit = async (action: "draft" | "submit") => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append("assignmentId", assignment.id);
    formData.append("action", action);
    if (externalUrl) formData.append("externalUrl", externalUrl);
    if (note) formData.append("note", note);
    if (selectedFile) formData.append("file", selectedFile);

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

      {/* Revision / Feedback Alert Banner */}
      {submission?.status === "returned_for_revision" && (
        <div className="p-4 rounded-xl border border-[#B7791F]/30 bg-[#FDF5E6] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#B7791F] shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-[#B7791F]">Perlu Revisi dari Dosen</h4>
            <p className="text-[#172033]">
              Catatan Dosen: <em>&quot;{submission.feedback || "Silakan perbaiki tugas sesuai petunjuk."}&quot;</em>
            </p>
            <p className="text-[#667085]">
              Silakan unggah versi perbaikan di bawah ini dan klik &quot;Kirim Tugas&quot;.
            </p>
          </div>
        </div>
      )}

      {/* Graded Result Card */}
      {submission?.status === "graded" && (
        <Card className="border-[#16845B]/30 bg-[#E8F5EF]/30 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#16845B] uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Tugas Selesai Dinilai
              </span>
              <p className="text-xs text-[#667085]">
                Dinilai pada: {formatDateTime(submission.gradedAt)}
              </p>
              {submission.feedback && (
                <div className="pt-2 text-xs">
                  <span className="font-semibold text-[#172033]">Feedback Dosen:</span>
                  <p className="p-2.5 bg-white rounded-lg border border-[#E4E9F2] text-[#172033] mt-1">
                    {submission.feedback}
                  </p>
                </div>
              )}
            </div>

            <div className="text-center sm:text-right bg-white p-3.5 rounded-xl border border-[#16845B]/20">
              <span className="text-xs text-[#667085] block">Nilai yang Diperoleh</span>
              <span className="text-3xl font-extrabold text-[#16845B] tabular-nums">
                {submission.score}
              </span>
              <span className="text-xs text-[#667085]"> / {assignment.maxScore}</span>
            </div>
          </div>
        </Card>
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
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#172033]">
                  Unggah File Dokumen / ZIP
                </label>
                <div className="border-2 border-dashed border-[#E4E9F2] rounded-xl p-5 text-center hover:border-[#2457D6]/50 transition-colors">
                  <input
                    type="file"
                    id="fileUpload"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="fileUpload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-6 h-6 text-[#2457D6]" />
                    <span className="text-xs font-semibold text-[#2457D6]">
                      {selectedFile
                        ? selectedFile.name
                        : "Pilih file untuk diunggah"}
                    </span>
                    <span className="text-[11px] text-[#667085]">
                      Maksimum ukuran file: {assignment.maxFileSizeMb} MB
                    </span>
                  </label>
                </div>
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
                    <th className="py-2.5 px-4 font-semibold">Lampiran / Link</th>
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
                        <div className="flex flex-col gap-1">
                          {v.originalFilename && (
                            <a
                              href={`/api/files/submission/${v.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#2457D6] hover:underline font-medium"
                            >
                              <Download className="w-3 h-3" /> {v.originalFilename}
                            </a>
                          )}
                          {v.externalUrl && (
                            <a
                              href={v.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#16845B] hover:underline font-medium"
                            >
                              <ExternalLink className="w-3 h-3" /> Buka Tautan Eksternal
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
