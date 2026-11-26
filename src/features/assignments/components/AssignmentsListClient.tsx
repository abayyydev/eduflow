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
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { formatDateTime, toDateTimeLocalString } from "@/lib/utils";
import { createAssignment, updateAssignment, deleteAssignment } from "../actions";

export interface AssignmentListItem {
  id: string;
  title: string;
  instructions?: string | null;
  maxScore: string;
  opensAt: Date | null;
  dueAt: Date | null;
  allowLate: boolean;
  submissionMode: "file" | "url" | "both";
  maxFileSizeMb?: number | null;
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

  // Edit & Delete modal states
  const [editingAssignment, setEditingAssignment] = useState<AssignmentListItem | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingAssignment, setDeletingAssignment] = useState<AssignmentListItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleUpdateAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAssignment) return;
    setEditError(null);
    setEditLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await updateAssignment(editingAssignment.id, formData);

    if (res.error) {
      setEditError(res.error);
      setEditLoading(false);
      return;
    }

    setEditLoading(false);
    setEditingAssignment(null);
    window.location.reload();
  };

  const handleDeleteAssignment = async () => {
    if (!deletingAssignment) return;
    setDeleteError(null);
    setDeleteLoading(true);

    const res = await deleteAssignment(deletingAssignment.id);

    if (res.error) {
      setDeleteError(res.error);
      setDeleteLoading(false);
      return;
    }

    setDeleteLoading(false);
    setDeletingAssignment(null);
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
          <div className="flex items-center gap-1 text-xs text-[#667085]">
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
      </div>

      {/* Assignment Grid */}
      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <FileCheck2 className="w-12 h-12 text-[#667085] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-semibold text-[#172033]">
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

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-[#E4E9F2] flex items-center gap-2">
                <Link href={`/assignments/${asg.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <span>Lihat &amp; Nilai Submisi</span>
                    <ArrowRight className="w-4 h-4 text-[#2457D6]" />
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-2.5 text-[#667085] hover:text-[#2457D6] hover:bg-[#EEF3FF]"
                  title="Edit Tugas"
                  onClick={() => {
                    setEditingAssignment(asg);
                    setEditError(null);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-2.5 text-[#667085] hover:text-[#C43D4B] hover:bg-[#FCECEE]"
                  title="Hapus Tugas"
                  onClick={() => {
                    setDeletingAssignment(asg);
                    setDeleteError(null);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
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

      {/* Modal Edit Tugas */}
      <Modal
        isOpen={editingAssignment !== null}
        onClose={() => setEditingAssignment(null)}
        title="Edit Tugas"
        description="Perbarui informasi instruksi, batas waktu deadline, atau pengaturan tugas."
        maxWidth="lg"
      >
        {editingAssignment && (
          <form onSubmit={handleUpdateAssignment} className="space-y-3.5">
            {editError && (
              <div className="p-2.5 rounded-lg bg-[#FCECEE] border border-[#C43D4B]/20 text-xs text-[#C43D4B]">
                {editError}
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-[#F4F7FE] border border-[#2457D6]/20 text-xs text-[#2457D6]">
              Mengedit tugas pada kelas: <strong>{editingAssignment.classDisplayName}</strong> ({editingAssignment.courseCode})
            </div>

            <Input
              label="Judul Tugas"
              name="title"
              defaultValue={editingAssignment.title}
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
                defaultValue={editingAssignment.instructions || ""}
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
                defaultValue={toDateTimeLocalString(editingAssignment.dueAt)}
                required
                disabled={editLoading}
              />
              <Input
                label="Skor Maksimum"
                name="maxScore"
                type="number"
                defaultValue={editingAssignment.maxScore || "100"}
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
                  defaultValue={editingAssignment.submissionMode}
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
                  defaultValue={editingAssignment.status}
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
                defaultValue={editingAssignment.maxFileSizeMb || 10}
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
                    defaultChecked={editingAssignment.allowLate}
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
                onClick={() => setEditingAssignment(null)}
                disabled={editLoading}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={editLoading}>
                Simpan Perubahan
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Hapus Tugas */}
      <Modal
        isOpen={deletingAssignment !== null}
        onClose={() => setDeletingAssignment(null)}
        title="Hapus Tugas"
        description="Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan."
        maxWidth="md"
      >
        {deletingAssignment && (
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
                  Menghapus tugas <strong>&quot;{deletingAssignment.title}&quot;</strong> akan menghapus seluruh data pengumpulan (submisi mahasiswa), riwayat file versi tugas, dan item nilai terkait di Gradebook.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingAssignment(null)}
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
        )}
      </Modal>
    </div>
  );
}
