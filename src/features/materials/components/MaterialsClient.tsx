"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Plus,
  ExternalLink,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { createMaterial, deleteMaterial } from "../actions";

export interface MaterialItem {
  id: string;
  meetingNumber: number | null;
  title: string;
  description: string | null;
  externalUrl: string | null;
  fileObjectKey: string | null;
  publishedAt: Date | null;
  createdAt: Date;
}

interface MaterialsClientProps {
  initialMaterials: MaterialItem[];
  currentClass: {
    id: string;
    displayName: string;
    courseCode: string;
    classCode: string;
    termName: string;
  };
  availableClasses: Array<{ id: string; displayName: string }>;
}

export function MaterialsClient({
  initialMaterials,
  currentClass,
  availableClasses,
}: MaterialsClientProps) {
  const router = useRouter();
  const [materials] = useState<MaterialItem[]>(initialMaterials);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("classId", currentClass.id);

    const res = await createMaterial(formData);

    if (res.error) {
      setFormError(res.error);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setIsModalOpen(false);
    router.refresh();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus materi "${title}"?`)) return;
    const res = await deleteMaterial(id);
    if (res.error) {
      alert(res.error);
      return;
    }
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Breadcrumbs */}
      <div>
        <Link
          href="/materials"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#667085] hover:text-[#2457D6] transition-colors group mb-1"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Daftar Kelas</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#EEF3FF] text-[#2457D6] uppercase tracking-wider">
              {currentClass.courseCode} &bull; Kelas {currentClass.classCode}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
            Materi: {currentClass.displayName}
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Semester {currentClass.termName} &bull; Kelola slide, modul, dan link pembelajaran
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={currentClass.id}
            onChange={(e) => router.push(`/materials?classId=${e.target.value}`)}
            className="rounded-lg border border-[#E4E9F2] bg-white px-3 py-2 text-xs font-medium text-[#172033] focus:outline-none focus:border-[#2457D6]"
          >
            {availableClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayName}
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFormError(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Tambah Materi
          </Button>
        </div>
      </div>

      {/* Materials List */}
      {materials.length === 0 ? (
        <Card className="py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-[#667085]/40 mb-3" />
          <h3 className="text-base font-semibold text-[#172033]">
            Belum ada materi pembelajaran
          </h3>
          <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
            Tambahkan slide presentasi, modul, atau tautan Google Drive untuk membantu mahasiswa belajar.
          </p>
          <div className="mt-4">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Tambah Materi
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((mat) => (
            <Card
              key={mat.id}
              className="hover:border-[#2457D6]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#E8F5EF] text-[#16845B]">
                    Pertemuan {mat.meetingNumber || "—"}
                  </span>
                  <button
                    onClick={() => handleDelete(mat.id, mat.title)}
                    className="p-1 text-[#667085] hover:text-[#C43D4B] rounded hover:bg-gray-100 transition-colors"
                    title="Hapus materi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-[#172033]">
                  {mat.title}
                </h3>

                {mat.description && (
                  <p className="text-xs text-[#667085] mt-1.5 line-clamp-2">
                    {mat.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#E4E9F2] flex items-center justify-between text-xs">
                {mat.externalUrl ? (
                  <a
                    href={mat.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#2457D6] hover:underline"
                  >
                    <span>Buka Tautan Materi</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-[#667085] italic">Tersedia di kelas</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Tambah Materi */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Materi Pembelajaran"
        description="Unggah atau sematkan bahan ajar untuk pertemuan tertentu."
      >
        <form onSubmit={handleCreate} className="space-y-3.5">
          {formError && (
            <div className="p-2.5 rounded-lg bg-[#FCECEE] border border-[#C43D4B]/20 text-xs text-[#C43D4B]">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Input
                label="Pertemuan Ke-"
                name="meetingNumber"
                type="number"
                min={1}
                max={32}
                defaultValue={materials.length + 1}
                required
                disabled={isLoading}
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Judul Materi"
                name="title"
                placeholder="Contoh: Pengantar Algoritma dan Notasi Big-O"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#172033]">
              Deskripsi Singkat (Opsional)
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Jelaskan ringkasan materi atau tujuan pembelajaran pertemuan ini..."
              className="w-full rounded-lg border border-[#E4E9F2] bg-white p-3 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6]"
              disabled={isLoading}
            />
          </div>

          <Input
            label="Tautan URL Eksternal (Google Drive / GitHub / Slides)"
            name="externalUrl"
            placeholder="https://drive.google.com/..."
            disabled={isLoading}
            helperText="Pastikan akses link dapat dibuka oleh mahasiswa."
          />

          <div className="flex justify-end gap-2 pt-2">
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
              Simpan Materi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
