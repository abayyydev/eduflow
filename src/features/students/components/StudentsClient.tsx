"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
} from "lucide-react";
import { createStudent } from "../actions";

export interface StudentItem {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  studentNumber: string;
  studyProgram: string | null;
  cohort: string | null;
  phone: string | null;
  enrolledClassesCount: number;
}

interface StudentsClientProps {
  initialStudents: StudentItem[];
}

export function StudentsClient({ initialStudents }: StudentsClientProps) {
  const [studentsList] = useState(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const pageSize = 10;

  const filteredStudents = studentsList.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.studentNumber.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.studyProgram && s.studyProgram.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleCreateStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createStudent(formData);

    if (res.error) {
      setFormError(res.error);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setIsAddModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
            Daftar Mahasiswa
          </h1>
          <p className="text-sm text-[#667085] mt-0.5">
            Master data mahasiswa yang terdaftar dalam ruang kerja akademik.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setFormError(null);
            setIsAddModalOpen(true);
          }}
        >
          <UserPlus className="w-4 h-4 mr-1.5" /> Tambah Mahasiswa
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E4E9F2]">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#667085]" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, NIM, atau email..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-lg border border-[#E4E9F2] pl-9 pr-3 py-1.5 text-xs text-[#172033] placeholder:text-[#667085] focus:outline-none focus:border-[#2457D6]"
          />
        </div>

        <div className="text-xs text-[#667085] flex items-center gap-1.5">
          <Users className="w-4 h-4 text-[#2457D6]" />
          Total: <span className="font-semibold text-[#172033]">{studentsList.length}</span> Mahasiswa Terdata
        </div>
      </div>

      {/* Table Card */}
      <Card>
        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-[#667085]/40 mb-3" />
            <h3 className="text-base font-semibold text-[#172033]">
              Tidak ada mahasiswa ditemukan
            </h3>
            <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
              Tidak ditemukan data yang cocok dengan pencarian &quot;{searchQuery}&quot;.
            </p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F8FC] border-b border-[#E4E9F2] text-[#667085]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">NIM</th>
                    <th className="py-3 px-4 font-semibold">Nama Lengkap</th>
                    <th className="py-3 px-4 font-semibold">Kontak</th>
                    <th className="py-3 px-4 font-semibold">Program Studi</th>
                    <th className="py-3 px-4 font-semibold">Angkatan</th>
                    <th className="py-3 px-4 font-semibold text-center">Kelas Aktif</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E9F2]">
                  {paginatedStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F6F8FC]/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#172033] tabular-nums">
                        {s.studentNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#172033]">
                        {s.name}
                      </td>
                      <td className="py-3 px-4 text-[#667085]">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#667085]" /> {s.email}
                          </span>
                          {s.phone && (
                            <span className="flex items-center gap-1 text-[11px]">
                              <Phone className="w-3 h-3 text-[#667085]" /> {s.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#172033]">{s.studyProgram || "—"}</td>
                      <td className="py-3 px-4 text-[#667085] tabular-nums">{s.cohort || "—"}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#EEF3FF] text-[#2457D6] tabular-nums">
                          {s.enrolledClassesCount} Kelas
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={s.isActive ? "success" : "danger"}>
                          {s.isActive ? "Aktif" : "Non-aktif"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination if data > 10 */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredStudents.length}
              pageSize={pageSize}
            />
          </div>
        )}
      </Card>

      {/* Modal Tambah Mahasiswa */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Mahasiswa Baru"
        description="Daftarkan akun mahasiswa ke dalam sistem (password default: password123)."
      >
        <form onSubmit={handleCreateStudent} className="space-y-3.5">
          {formError && (
            <div className="p-2.5 rounded-lg bg-[#FCECEE] border border-[#C43D4B]/20 text-xs text-[#C43D4B]">
              {formError}
            </div>
          )}

          <Input
            label="Nomor Induk Mahasiswa (NIM)"
            name="studentNumber"
            placeholder="Contoh: 20240021"
            required
            disabled={isLoading}
          />

          <Input
            label="Nama Lengkap"
            name="name"
            placeholder="Contoh: Muhammad Ilham"
            required
            disabled={isLoading}
          />

          <Input
            label="Email Mahasiswa"
            name="email"
            type="email"
            placeholder="Contoh: ilham@student.ac.id"
            required
            disabled={isLoading}
          />

          <Input
            label="Program Studi"
            name="studyProgram"
            defaultValue="Teknik Informatika"
            disabled={isLoading}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tahun Angkatan"
              name="cohort"
              defaultValue="2024"
              disabled={isLoading}
            />
            <Input
              label="Nomor Telepon / WA"
              name="phone"
              placeholder="0812xxxxxxxx"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Simpan Mahasiswa
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
