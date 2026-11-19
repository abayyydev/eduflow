"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  GraduationCap,
  Users,
  BookOpen,
  FileCheck2,
  CalendarCheck,
  Calculator,
  Settings,
  Trash2,
  UserPlus,
  Calendar,
  Archive,
  ArrowLeft,
} from "lucide-react";
import { enrollStudentToClass, removeStudentFromClass } from "@/features/enrollments/actions";
import { archiveClass } from "@/features/classes/actions";

export interface ClassDetailData {
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
  courseDescription: string | null;
  creditUnits: number | null;
  ownerUserId: string;
  termId: string;
  termName: string;
}

export interface EnrolledStudentData {
  enrollmentId: string;
  enrollmentStatus: "active" | "dropped" | "completed";
  enrolledAt: Date;
  studentUserId: string;
  name: string;
  email: string;
  studentNumber: string;
  studyProgram: string | null;
  cohort: string | null;
}

export interface AvailableStudentData {
  id: string;
  name: string;
  email: string;
  studentNumber: string;
  studyProgram: string | null;
}

interface ClassDetailClientProps {
  classData: ClassDetailData;
  enrolledStudents: EnrolledStudentData[];
  availableStudents: AvailableStudentData[];
}

type TabType =
  | "overview"
  | "students"
  | "materials"
  | "assignments"
  | "attendance"
  | "gradebook"
  | "settings";

export function ClassDetailClient({
  classData,
  enrolledStudents,
  availableStudents,
}: ClassDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Modal states
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setIsLoading(true);
    setErrorMsg(null);

    const res = await enrollStudentToClass(classData.id, selectedStudentId);
    if (res.error) {
      setErrorMsg(res.error);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setIsEnrollModalOpen(false);
    setSelectedStudentId("");
    router.refresh();
  };

  const handleRemoveStudent = async (studentUserId: string, studentName: string) => {
    if (!confirm(`Hapus ${studentName} dari kelas ini?`)) return;
    setIsLoading(true);
    const res = await removeStudentFromClass(classData.id, studentUserId);
    if (res.error) {
      alert(res.error);
    }
    setIsLoading(false);
    router.refresh();
  };

  const handleArchive = async () => {
    setIsLoading(true);
    const res = await archiveClass(classData.id);
    if (res.error) {
      alert(res.error);
      setIsLoading(false);
      return;
    }
    router.push("/classes");
    router.refresh();
  };

  const tabs = [
    { id: "overview", label: "Ringkasan", icon: GraduationCap },
    { id: "students", label: `Mahasiswa (${enrolledStudents.length})`, icon: Users },
    { id: "materials", label: "Materi", icon: BookOpen },
    { id: "assignments", label: "Tugas", icon: FileCheck2 },
    { id: "attendance", label: "Presensi", icon: CalendarCheck },
    { id: "gradebook", label: "Gradebook", icon: Calculator },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button & Top Navigation */}
      <div>
        <Link
          href="/classes"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#667085] hover:text-[#172033] mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Kelas
        </Link>

        {/* Class Banner Card */}
        <div className="bg-white rounded-2xl border border-[#E4E9F2] p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#EEF3FF] text-[#2457D6] uppercase tracking-wider">
                  {classData.courseCode} &bull; Kelas {classData.classCode}
                </span>
                <span className="text-xs text-[#667085]">
                  {classData.creditUnits} SKS &bull; {classData.termName}
                </span>
                <Badge status={classData.status} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
                {classData.displayName}
              </h1>
              <p className="text-xs text-[#667085] mt-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#667085]" />
                {classData.scheduleText || "Jadwal belum ditentukan"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/gradebook?classId=${classData.id}`}>
                <Button variant="secondary" size="sm">
                  <Calculator className="w-4 h-4 mr-1.5" /> Buka Gradebook
                </Button>
              </Link>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 mt-6 border-b border-[#E4E9F2] overflow-x-auto pt-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-[#2457D6] text-[#2457D6] font-semibold"
                      : "border-transparent text-[#667085] hover:text-[#172033] hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab 1: Ringkasan */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tentang Mata Kuliah</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[#172033]">
                <p>
                  {classData.courseDescription ||
                    "Belum ada deskripsi yang ditambahkan untuk mata kuliah ini."}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E4E9F2] text-xs">
                  <div>
                    <span className="text-[#667085] block">Bobot SKS</span>
                    <span className="font-semibold text-[#172033]">
                      {classData.creditUnits} SKS
                    </span>
                  </div>
                  <div>
                    <span className="text-[#667085] block">Tahun Akademik</span>
                    <span className="font-semibold text-[#172033]">
                      {classData.termName}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Kelas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs py-1 border-b border-[#E4E9F2]">
                  <span className="text-[#667085]">Jumlah Mahasiswa</span>
                  <span className="font-semibold text-[#172033]">
                    {enrolledStudents.length} Orang
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 border-b border-[#E4E9F2]">
                  <span className="text-[#667085]">Status Kelas</span>
                  <Badge status={classData.status} />
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setActiveTab("students")}
                  >
                    <UserPlus className="w-4 h-4 mr-1.5" /> Kelola Mahasiswa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Mahasiswa */}
      {activeTab === "students" && (
        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-1">
            <div>
              <h3 className="text-base font-bold text-[#172033]">
                Mahasiswa Terdaftar ({enrolledStudents.length})
              </h3>
              <p className="text-xs text-[#667085]">
                Daftar mahasiswa yang memiliki hak akses ke materi, tugas, dan nilai kelas ini.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setErrorMsg(null);
                setIsEnrollModalOpen(true);
              }}
            >
              <UserPlus className="w-4 h-4 mr-1.5" /> Daftarkan Mahasiswa
            </Button>
          </div>

          {enrolledStudents.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#667085]">
              Belum ada mahasiswa terdaftar di kelas ini. Klik tombol di atas untuk mendaftarkan mahasiswa.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F8FC] border-y border-[#E4E9F2] text-[#667085]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">NIM</th>
                    <th className="py-3 px-4 font-semibold">Nama Mahasiswa</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Program Studi</th>
                    <th className="py-3 px-4 font-semibold">Angkatan</th>
                    <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E9F2]">
                  {enrolledStudents.map((st) => (
                    <tr key={st.enrollmentId} className="hover:bg-[#F6F8FC]/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-[#172033] tabular-nums">
                        {st.studentNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#172033]">
                        {st.name}
                      </td>
                      <td className="py-3 px-4 text-[#667085]">{st.email}</td>
                      <td className="py-3 px-4 text-[#667085]">{st.studyProgram}</td>
                      <td className="py-3 px-4 text-[#667085] tabular-nums">{st.cohort}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleRemoveStudent(st.studentUserId, st.name)}
                          className="p-1 text-[#667085] hover:text-[#C43D4B] rounded-md hover:bg-gray-100 transition-colors"
                          title="Hapus dari kelas"
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 3: Materi */}
      {activeTab === "materials" && (
        <Card className="py-8 text-center space-y-3">
          <BookOpen className="mx-auto h-10 w-10 text-[#2457D6]/50" />
          <h3 className="text-base font-semibold text-[#172033]">
            Materi Pembelajaran
          </h3>
          <p className="text-xs text-[#667085] max-w-sm mx-auto">
            Kelola materi slide, modul, dan link Google Drive per pertemuan.
          </p>
          <div className="pt-2">
            <Link href={`/materials?classId=${classData.id}`}>
              <Button variant="primary" size="sm">
                Buka Pengelolaan Materi
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Tab 4: Tugas */}
      {activeTab === "assignments" && (
        <Card className="py-8 text-center space-y-3">
          <FileCheck2 className="mx-auto h-10 w-10 text-[#2457D6]/50" />
          <h3 className="text-base font-semibold text-[#172033]">
            Tugas &amp; Submission
          </h3>
          <p className="text-xs text-[#667085] max-w-sm mx-auto">
            Kelola instruksi tugas, tenggat waktu, review file/URL mahasiswa, dan feedback nilai.
          </p>
          <div className="pt-2">
            <Link href={`/assignments?classId=${classData.id}`}>
              <Button variant="primary" size="sm">
                Buka Halaman Tugas
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Tab 5: Presensi */}
      {activeTab === "attendance" && (
        <Card className="py-8 text-center space-y-3">
          <CalendarCheck className="mx-auto h-10 w-10 text-[#2457D6]/50" />
          <h3 className="text-base font-semibold text-[#172033]">
            Presensi Perkuliahan
          </h3>
          <p className="text-xs text-[#667085] max-w-sm mx-auto">
            Pencatatan sesi hadir, sakit, izin, dan alpa mahasiswa serta rekap persentase.
          </p>
          <div className="pt-2">
            <Link href={`/attendance?classId=${classData.id}`}>
              <Button variant="primary" size="sm">
                Buka Presensi Kelas
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Tab 6: Gradebook */}
      {activeTab === "gradebook" && (
        <Card className="py-8 text-center space-y-3">
          <Calculator className="mx-auto h-10 w-10 text-[#2457D6]/50" />
          <h3 className="text-base font-semibold text-[#172033]">
            Gradebook &amp; Kalkulasi Nilai
          </h3>
          <p className="text-xs text-[#667085] max-w-sm mx-auto">
            Tabel rekap nilai lengkap, kalkulasi bobot otomatis, finalisasi, dan ekspor data.
          </p>
          <div className="pt-2">
            <Link href={`/gradebook?classId=${classData.id}`}>
              <Button variant="primary" size="sm">
                Buka Gradebook Kelas
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Tab 7: Pengaturan */}
      {activeTab === "settings" && (
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Pengaturan &amp; Status Kelas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl border border-[#C43D4B]/20 bg-[#FCECEE]/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-[#C43D4B] flex items-center gap-1.5">
                  <Archive className="w-4 h-4" /> Arsipkan Kelas Ini
                </h4>
                <p className="text-xs text-[#667085] mt-0.5">
                  Kelas yang diarsipkan tidak lagi muncul dalam daftar aktif mahasiswa, namun data riwayat dan nilai tetap tersimpan aman.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsArchiveModalOpen(true)}
                disabled={classData.status === "archived"}
              >
                {classData.status === "archived" ? "Sudah Diarsipkan" : "Arsipkan Kelas"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal Enroll Mahasiswa */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Daftarkan Mahasiswa ke Kelas"
        description="Pilih mahasiswa dari master data untuk didaftarkan ke kelas ini."
      >
        <form onSubmit={handleEnroll} className="space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-[#FCECEE] border border-[#C43D4B]/20 text-xs text-[#C43D4B]">
              {errorMsg}
            </div>
          )}

          {availableStudents.length === 0 ? (
            <p className="text-xs text-[#667085] py-2">
              Seluruh mahasiswa di master data telah terdaftar di kelas ini.
            </p>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#172033]">
                Pilih Mahasiswa
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
                className="w-full rounded-lg border border-[#E4E9F2] bg-white px-3.5 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6]"
              >
                <option value="">-- Pilih Mahasiswa --</option>
                {availableStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.studentNumber} - {s.name} ({s.studyProgram})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEnrollModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!selectedStudentId || isLoading}
              isLoading={isLoading}
            >
              Daftarkan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Arsip */}
      <Modal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        title="Konfirmasi Arsipkan Kelas"
        description="Apakah Anda yakin ingin mengarsipkan kelas ini?"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#667085]">
            Kelas <strong>{classData.displayName}</strong> akan dipindahkan ke tab arsip. Seluruh mahasiswa dan histori nilai tidak akan terhapus.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsArchiveModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleArchive}
              isLoading={isLoading}
            >
              Ya, Arsipkan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
