"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  FileCheck2,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  Filter,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { createAssignment } from "../actions";

export interface AssignmentListItem {
  id: string;
  title: string;
  maxScore: string;
  opensAt: Date | null;
  dueAt: Date | null;
  allowLate: boolean;
  submissionMode: "file" | "url" | "both";
  status: "draft" | "published" | "closed";
  classId: string;
  classDisplayName: string;
  courseCode: string;
  totalSubmissions: number;
  gradedSubmissions: number;
  pendingSubmissions: number;
}

export interface ClassOption {
  id: string;
  displayName: string;
  courseCode: string;
}

interface AssignmentsListClientProps {
  initialAssignments: AssignmentListItem[];
  classesList: ClassOption[];
}

export function AssignmentsListClient({
  initialAssignments,
  classesList,
}: AssignmentsListClientProps) {
  const [assignmentsList] = useState(initialAssignments);
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = assignmentsList.filter((a) => {
    const matchesClass =
      selectedClassId === "all" || a.classId === selectedClassId;
    const matchesStatus =
      selectedStatus === "all" || a.status === selectedStatus;
    const matchesQuery =
      !searchQuery.trim() ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.classDisplayName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesStatus && matchesQuery;
  });

  const handleCreateAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createAssignment(formData);

    if (res.error) {
      setFormError(res.error);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setIsModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
            Tugas &amp; Pengumpulan
          </h1>
          <p className="text-sm text-[#667085] mt-0.5">
            Buat instruksi tugas, tentukan tenggat waktu, dan periksa submission mahasiswa.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" /> Buat Tugas Baru
        </Button>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E4E9F2]">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#667085]" />
          <input
            type="text"
            placeholder="Cari judul tugas atau kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#E4E9F2] pl-9 pr-3 py-1.5 text-xs text-[#172033] placeholder:text-[#667085] focus:outline-none focus:border-[#2457D6]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Class Filter */}
          <div className="flex items-center gap-1 text-xs text-[#667085]">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="rounded-lg border border-[#E4E9F2] bg-white px-2.5 py-1.5 text-xs text-[#172033] focus:outline-none focus:border-[#2457D6]"
            >
              <option value="all">Semua Kelas</option>
              {classesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-[#E4E9F2] bg-white px-2.5 py-1.5 text-xs text-[#172033] focus:outline-none focus:border-[#2457D6]"
          >
            <option value="all">Semua Status</option>
            <option value="published">Dipublikasikan</option>
            <option value="draft">Draft</option>
            <option value="closed">Ditutup</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      {filtered.length === 0 ? (
        <Card className="py-12 text-center">
          <FileCheck2 className="mx-auto h-12 w-12 text-[#667085]/40 mb-3" />
          <h3 className="text-base font-semibold text-[#172033]">
            Tidak ada tugas ditemukan
          </h3>
          <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
            Belum ada tugas yang dibuat atau tidak cocok dengan filter pencarian.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((asg) => (
            <Card
              key={asg.id}
              className="hover:shadow-md hover:border-[#2457D6]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#EEF3FF] text-[#2457D6] uppercase tracking-wider">
                    {asg.courseCode}
                  </span>
                  <Badge status={asg.status} />
                </div>

                <h3 className="text-base font-bold text-[#172033] line-clamp-1">
                  {asg.title}
                </h3>
                <p className="text-xs text-[#667085] mt-0.5 line-clamp-1">
                  {asg.classDisplayName}
                </p>

                <div className="mt-3 space-y-1 text-xs">
                  <p className="text-[#B7791F] font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Tenggat: {formatDateTime(asg.dueAt)}</span>
                  </p>
                  <p className="text-[#667085]">
                    Metode:{" "}
                    <span className="font-medium text-[#172033]">
                      {asg.submissionMode === "both"
                        ? "File & Tautan URL"
                        : asg.submissionMode === "file"
                        ? "Unggah File"
                        : "Tautan URL"}
                    </span>{" "}
                    &bull; Max {asg.maxScore} Poin
                  </p>
                </div>

                {/* Submissions Stats */}
                <div className="mt-4 pt-3 border-t border-[#E4E9F2] grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-[#B7791F]" />
                    <span className="text-[#667085]">
                      Perlu dinilai:{" "}
                      <strong className="text-[#172033] tabular-nums">
                        {asg.pendingSubmissions}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-right justify-end">
                    <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
                    <span className="text-[#667085]">
                      Dinilai:{" "}
                      <strong className="text-[#172033] tabular-nums">
                        {asg.gradedSubmissions}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E4E9F2]">
                <Link href={`/assignments/${asg.id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <span>Lihat &amp; Nilai Submisi</span>
                    <ArrowRight className="w-4 h-4 text-[#2457D6]" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Buat Tugas Baru */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Tugas Baru"
        description="Rancang tugas untuk kelas terpilih, lengkap dengan aturan dan tenggat waktu."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-3.5">
          {formError && (
            <div className="p-2.5 rounded-lg bg-[#FCECEE] border border-[#C43D4B]/20 text-xs text-[#C43D4B]">
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#172033]">
              Pilih Kelas
            </label>
            <select
              name="classId"
              required
              className="w-full rounded-lg border border-[#E4E9F2] bg-white px-3.5 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6]"
              disabled={isLoading}
            >
              <option value="">-- Pilih Kelas --</option>
              {classesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Judul Tugas"
            name="title"
            placeholder="Contoh: Tugas 1: Algoritma Sorting & Pencarian"
            required
            disabled={isLoading}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#172033]">
              Instruksi / Deskripsi Pengerjaan
            </label>
            <textarea
              name="instructions"
              rows={4}
              placeholder="Jelaskan petunjuk pengumpulan tugas, kriteria penilaian, dan format yang diharapkan..."
              required
              className="w-full rounded-lg border border-[#E4E9F2] bg-white p-3 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6]"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Tenggat Waktu (Deadline)"
              name="dueAt"
              type="datetime-local"
              required
              disabled={isLoading}
            />
            <Input
              label="Skor Maksimum"
              name="maxScore"
              type="number"
              defaultValue={100}
              min={1}
              max={1000}
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#172033]">
                Metode Pengumpulan
              </label>
              <select
                name="submissionMode"
                defaultValue="both"
                className="w-full rounded-lg border border-[#E4E9F2] bg-white px-3.5 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6]"
                disabled={isLoading}
              >
                <option value="both">Unggah File &amp; Tautan URL</option>
                <option value="file">Hanya Unggah File</option>
                <option value="url">Hanya Tautan URL</option>
              </select>
            </div>

            <Input
              label="Batas Maksimum File (MB)"
              name="maxFileSizeMb"
              type="number"
              defaultValue={10}
              min={1}
              max={50}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E4E9F2]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="allowLate"
                value="true"
                defaultChecked={true}
                className="h-4 w-4 rounded border-gray-300 text-[#2457D6] focus:ring-[#2457D6]"
              />
              <span className="text-xs font-medium text-[#172033]">
                Izinkan pengumpulan terlambat (status akan ditandai Terlambat)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="createGradeItem"
                value="true"
                defaultChecked={true}
                className="h-4 w-4 rounded border-gray-300 text-[#2457D6] focus:ring-[#2457D6]"
              />
              <span className="text-xs font-medium text-[#172033]">
                Hubungkan otomatis sebagai item nilai ke Gradebook (Kategori Tugas)
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Terbitkan Tugas
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
