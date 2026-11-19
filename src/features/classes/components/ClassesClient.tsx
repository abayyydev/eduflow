"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  GraduationCap,
  Plus,
  Users,
  Calendar,
  BookOpen,
  ArrowRight,
  Search,
} from "lucide-react";
import { createClass, createCourse } from "../actions";

export interface ClassItem {
  id: string;
  classCode: string;
  displayName: string;
  scheduleText: string | null;
  status: "active" | "archived";
  gradingLockedAt: Date | null;
  gradesPublishedAt: Date | null;
  courseId: string;
  courseCode: string;
  courseName: string;
  creditUnits: number | null;
  termId: string;
  termName: string;
  studentCount: number;
}

export interface CourseItem {
  id: string;
  code: string;
  name: string;
  creditUnits: number | null;
}

export interface TermItem {
  id: string;
  name: string;
  isActive: boolean;
}

interface ClassesClientProps {
  initialClasses: ClassItem[];
  courses: CourseItem[];
  terms: TermItem[];
}

export function ClassesClient({
  initialClasses,
  courses,
  terms,
}: ClassesClientProps) {
  const [classesList] = useState(initialClasses);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "archived">("active");

  // Modal states
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredClasses = classesList.filter((cls) => {
    const matchesStatus = cls.status === statusFilter;
    const matchesQuery =
      cls.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.classCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const handleCreateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createCourse(formData);

    if (res.error) {
      setFormError(res.error);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setIsCourseModalOpen(false);
    window.location.reload();
  };

  const handleCreateClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createClass(formData);

    if (res.error) {
      setFormError(res.error);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setIsClassModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
            Mata Kuliah &amp; Kelas
          </h1>
          <p className="text-sm text-[#667085] mt-0.5">
            Kelola ruang kelas, mahasiswa terdaftar, dan administrasi akademik.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFormError(null);
              setIsCourseModalOpen(true);
            }}
          >
            <BookOpen className="w-4 h-4 mr-1.5" /> Tambah Mata Kuliah
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFormError(null);
              setIsClassModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Buat Kelas Baru
          </Button>
        </div>
      </div>

      {/* Toolbar & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E4E9F2]">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#667085]" />
          <input
            type="text"
            placeholder="Cari kelas atau kode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#E4E9F2] pl-9 pr-3 py-1.5 text-xs text-[#172033] placeholder:text-[#667085] focus:outline-none focus:border-[#2457D6]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === "active"
                ? "bg-[#2457D6] text-white"
                : "text-[#667085] hover:bg-[#F6F8FC]"
            }`}
          >
            Kelas Aktif
          </button>
          <button
            onClick={() => setStatusFilter("archived")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === "archived"
                ? "bg-[#2457D6] text-white"
                : "text-[#667085] hover:bg-[#F6F8FC]"
            }`}
          >
            Diarsipkan
          </button>
        </div>
      </div>

      {/* Classes Cards Grid */}
      {filteredClasses.length === 0 ? (
        <Card className="py-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-[#667085]/40 mb-3" />
          <h3 className="text-base font-semibold text-[#172033]">
            Tidak ada kelas ditemukan
          </h3>
          <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
            Belum ada kelas dengan filter ini atau belum dibuat. Silakan tambahkan mata kuliah lalu buat kelas baru.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsClassModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1" /> Buat Kelas
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => (
            <Card
              key={cls.id}
              className="hover:shadow-md hover:border-[#2457D6]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#EEF3FF] text-[#2457D6] uppercase tracking-wider">
                    {cls.courseCode} &bull; Kelas {cls.classCode}
                  </span>
                  <Badge status={cls.status} />
                </div>

                <h3 className="text-base font-bold text-[#172033] line-clamp-1">
                  {cls.displayName}
                </h3>
                <p className="text-xs text-[#667085] mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#667085]" />
                  <span>{cls.scheduleText || "Jadwal belum ditentukan"}</span>
                </p>

                <div className="mt-4 pt-3 border-t border-[#E4E9F2] grid grid-cols-2 gap-2 text-xs text-[#667085]">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#2457D6]" />
                    <span className="font-semibold text-[#172033]">
                      {cls.studentCount || 0}
                    </span>{" "}
                    Mahasiswa
                  </div>
                  <div className="text-right text-[11px] text-[#667085]">
                    {cls.termName}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3">
                <Link href={`/classes/${cls.id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <span>Kelola Kelas</span>
                    <ArrowRight className="w-4 h-4 text-[#2457D6]" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Buat Mata Kuliah */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title="Tambah Mata Kuliah"
        description="Mata kuliah master yang diampu sebelum membuka kelas."
      >
        <form onSubmit={handleCreateCourse} className="space-y-3.5">
          {formError && (
            <div className="p-2.5 rounded-lg bg-[#FCECEE] border border-[#C43D4B]/20 text-xs text-[#C43D4B]">
              {formError}
            </div>
          )}
          <Input
            label="Kode Mata Kuliah"
            name="code"
            placeholder="Contoh: IF101"
            required
            disabled={isLoading}
          />
          <Input
            label="Nama Mata Kuliah"
            name="name"
            placeholder="Contoh: Algoritma dan Struktur Data"
            required
            disabled={isLoading}
          />
          <Input
            label="Bobot SKS"
            name="creditUnits"
            type="number"
            defaultValue={3}
            min={1}
            max={12}
            disabled={isLoading}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#172033]">
              Deskripsi Mata Kuliah (Opsional)
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Deskripsi ringkas capaian pembelajaran..."
              className="w-full rounded-lg border border-[#E4E9F2] bg-white p-3 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6]"
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCourseModalOpen(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Simpan Mata Kuliah
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Buat Kelas Baru */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title="Buat Kelas Baru"
        description="Buka penawaran kelas baru untuk semester aktif."
      >
        <form onSubmit={handleCreateClass} className="space-y-3.5">
          {formError && (
            <div className="p-2.5 rounded-lg bg-[#FCECEE] border border-[#C43D4B]/20 text-xs text-[#C43D4B]">
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#172033]">
              Pilih Mata Kuliah
            </label>
            <select
              name="courseId"
              required
              className="w-full rounded-lg border border-[#E4E9F2] bg-white px-3.5 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6]"
              disabled={isLoading}
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name} ({c.creditUnits} SKS)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#172033]">
              Semester / Tahun Akademik
            </label>
            <select
              name="academicTermId"
              required
              defaultValue={terms[0]?.id}
              className="w-full rounded-lg border border-[#E4E9F2] bg-white px-3.5 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6]"
              disabled={isLoading}
            >
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.isActive ? "(Aktif)" : ""}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Kode Kelas"
            name="classCode"
            placeholder="Contoh: A, B, atau Reg-01"
            required
            disabled={isLoading}
          />

          <Input
            label="Jadwal Perkuliahan"
            name="scheduleText"
            placeholder="Contoh: Senin, 08:00 - 10:30 WIB (Lab 1)"
            disabled={isLoading}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsClassModalOpen(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Buat Kelas
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
