"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Users,
  Calendar,
  TrendingUp,
  Download,
  QrCode,
  Radio,
} from "lucide-react";
import { ClassBarcodePresenterModal } from "./ClassBarcodePresenterModal";
import {
  type AttendanceOverviewData,
  createAttendanceSession,
  updateStudentAttendance,
  syncAttendanceToGradebook,
  toggleAttendanceSessionOpen,
} from "../actions";
import { formatDate } from "@/lib/utils";

interface AttendanceClientProps {
  initialData: AttendanceOverviewData;
  availableClasses: Array<{ id: string; displayName: string }>;
}

export function AttendanceClient({
  initialData,
  availableClasses,
}: AttendanceClientProps) {
  const router = useRouter();
  const [data, setData] = useState<AttendanceOverviewData>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  // Sync state if initialData changes
  useEffect(() => {
    setData(initialData);
    setCurrentPage(1);
  }, [initialData]);

  // Form state
  const [newMeetingNumber, setNewMeetingNumber] = useState<number>(
    data.sessions.length + 1
  );
  const [newSessionDate, setNewSessionDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [newTopic, setNewTopic] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const isLocked = data.classInfo.gradingLockedAt !== null;

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

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await createAttendanceSession(
      data.classInfo.id,
      newMeetingNumber,
      newSessionDate,
      newTopic
    );

    if (res.error) {
      alert(res.error);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setIsSessionModalOpen(false);
    setNewTopic("");
    router.refresh();
  };

  const handleToggleSession = async (sessionId: string, currentOpen: boolean) => {
    startTransition(async () => {
      // Optimistic update
      setData((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) => ({
          ...s,
          isOpen: s.id === sessionId ? !currentOpen : false,
        })),
      }));

      const res = await toggleAttendanceSessionOpen(data.classInfo.id, sessionId, !currentOpen);
      if (res?.error) {
        alert(res.error);
      }
      router.refresh();
    });
  };

  const handleStatusChange = async (
    sessionId: string,
    studentUserId: string,
    status: "present" | "late" | "sick" | "excused" | "absent" | "unrecorded"
  ) => {
    // Optimistic update
    setData((prev) => {
      const updatedStudents = prev.students.map((st) => {
        if (st.studentUserId !== studentUserId) return st;
        const currentRecord = st.records[sessionId] || { status: null, note: null };
        return {
          ...st,
          records: {
            ...st.records,
            [sessionId]: {
              ...currentRecord,
              status: status === "unrecorded" ? null : status,
            },
          },
        };
      });
      return { ...prev, students: updatedStudents };
    });

    const res = await updateStudentAttendance(
      data.classInfo.id,
      sessionId,
      studentUserId,
      status
    );

    if (res?.error) {
      alert(res.error);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  const handleSyncToGradebook = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    const res = await syncAttendanceToGradebook(data.classInfo.id);

    if (res.error) {
      setSyncResult(`Gagal: ${res.error}`);
      setIsSyncing(false);
      return;
    }

    setSyncResult(
      `Sukses menyinkronkan persentase presensi untuk ${res.count} mahasiswa ke item penilaian di Gradebook.`
    );
    setIsSyncing(false);
    router.refresh();
  };

  const activeOpenSession = data.sessions.find((s) => s.isOpen);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#EEF3FF] text-[#2457D6] uppercase tracking-wider">
              {data.classInfo.courseCode} &bull; Kelas {data.classInfo.classCode}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
            Presensi Perkuliahan
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            {data.classInfo.displayName} &bull; Semester {data.classInfo.termName}
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Dropdown with instant router navigation */}
          <select
            value={data.classInfo.id}
            onChange={(e) => {
              const newId = e.target.value;
              startTransition(() => {
                router.push(`/attendance?classId=${newId}`);
              });
            }}
            disabled={isPending}
            className="rounded-lg border border-[#E4E9F2] bg-white px-3 py-2 text-xs font-semibold text-[#172033] focus:outline-none focus:border-[#2457D6] shadow-xs cursor-pointer"
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
            onClick={() => setIsBarcodeModalOpen(true)}
            className="border-cyan-200 text-cyan-800 bg-cyan-50/60 hover:bg-cyan-100 font-semibold"
          >
            <QrCode className="w-4 h-4 mr-1.5 text-cyan-600" /> Tampilkan Barcode Presensi
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSessionModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Buat Sesi Pertemuan
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSyncModalOpen(true)}
            disabled={isLocked || data.sessions.length === 0}
          >
            <RefreshCw className="w-4 h-4 mr-1.5" /> Sinkronkan ke Gradebook
          </Button>

          <a
            href={`/api/export/attendance?classId=${data.classInfo.id}&format=xlsx`}
            download
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#E4E9F2] text-[#172033] hover:bg-[#F6F8FC] shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-[#16845B]" />
            Ekspor XLSX
          </a>

          <a
            href={`/api/export/attendance?classId=${data.classInfo.id}&format=csv`}
            download
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#E4E9F2] text-[#667085] hover:bg-[#F6F8FC] shadow-2xs transition-colors"
          >
            Ekspor CSV
          </a>
        </div>
      </div>

      {/* Active Session Alert Banner (if a meeting is currently opened) */}
      {activeOpenSession && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 flex items-center justify-between text-xs text-emerald-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="font-extrabold">
              Pertemuan {activeOpenSession.meetingNumber} ({activeOpenSession.topic || "Sesi Kuliah"}) SEDANG DIBUKA untuk Presensi Barcode.
            </span>
          </div>
          <button
            onClick={() => handleToggleSession(activeOpenSession.id, true)}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs"
          >
            Tutup Sesi
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">
                Total Pertemuan
              </p>
              <p className="text-2xl font-bold text-[#172033] mt-1 tabular-nums">
                {data.sessions.length} Sesi
              </p>
              <p className="text-[10px] text-[#667085] mt-0.5">
                {activeOpenSession ? (
                  <span className="text-emerald-600 font-bold">
                    ● P{activeOpenSession.meetingNumber} Aktif Dibuka
                  </span>
                ) : (
                  <span>{data.heldSessionsCount || 0} Sesi Terlaksana</span>
                )}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#EEF3FF] text-[#2457D6] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">
                Rata-rata Kehadiran
              </p>
              <p className="text-2xl font-bold text-[#16845B] mt-1 tabular-nums">
                {data.averageAttendancePercent}%
              </p>
              <p className="text-[10px] text-[#667085] mt-0.5">
                Dari {data.heldSessionsCount || 1} sesi terlaksana
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#E8F5EF] text-[#16845B] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">
                Total Mahasiswa
              </p>
              <p className="text-2xl font-bold text-[#172033] mt-1 tabular-nums">
                {data.students.length}
              </p>
              <p className="text-[10px] text-[#667085] mt-0.5">
                Peserta aktif terdaftar
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#F6F8FC] text-[#667085] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">
                Status Integrasi
              </p>
              <p className="text-sm font-bold text-[#2457D6] mt-2">
                Presensi &rarr; Gradebook
              </p>
              <p className="text-[10px] text-[#667085] mt-0.5">
                Sinkronisasi otomatis
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#EEF3FF] text-[#2457D6] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Attendance Matrix Card */}
      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="p-3 bg-white border-b border-[#E4E9F2] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
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

          <div className="flex items-center flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16845B]" /> H = Hadir
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /> T = Terlambat
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2878B8]" /> S = Sakit
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B7791F]" /> I = Izin
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C43D4B]" /> A = Alpa
            </span>
            <span className="flex items-center gap-1 font-medium text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> - = Belum Hadir
            </span>
          </div>
        </div>

        {/* Matrix Table (Full 16 Sessions) */}
        <div className="overflow-x-auto max-h-[600px] relative">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F6F8FC] sticky top-0 z-20 shadow-xs border-b border-[#E4E9F2]">
              <tr>
                <th className="py-3 px-4 font-semibold sticky left-0 z-30 bg-[#F6F8FC] w-28">
                  NIM
                </th>
                <th className="py-3 px-4 font-semibold sticky left-28 z-30 bg-[#F6F8FC] border-r border-[#E4E9F2] w-48">
                  Nama Mahasiswa
                </th>

                {data.sessions.length === 0 ? (
                  <th className="py-3 px-4 text-center italic text-[#667085]">
                    Belum ada sesi pertemuan dibuat.
                  </th>
                ) : (
                  data.sessions.map((sess) => (
                    <th
                      key={sess.id}
                      className={`py-2 px-2 font-semibold text-center border-r border-[#E4E9F2] min-w-[76px] transition-colors ${
                        sess.isOpen ? "bg-emerald-50/90" : "bg-[#F6F8FC]"
                      }`}
                      title={`Pertemuan ${sess.meetingNumber} (${formatDate(sess.sessionDate)}): ${sess.topic || "Tanpa topik"}`}
                    >
                      <div className="font-extrabold text-[#172033]">
                        P{sess.meetingNumber}
                      </div>
                      <div className="text-[10px] text-[#667085] font-normal">
                        {sess.sessionDate.slice(5)}
                      </div>
                      {/* Dosen Toggle Buka/Tutup Sesi Presensi */}
                      <div className="mt-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSession(sess.id, sess.isOpen)}
                          className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 transition ${
                            sess.isOpen
                              ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                              : "bg-slate-200 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800"
                          }`}
                          title={
                            sess.isOpen
                              ? "Sesi pertemuan ini sedang DIBUKA untuk scan barcode mahasiswa. Klik untuk menutup."
                              : "Sesi pertemuan ini DITUTUP. Klik untuk membuka sesi pertemuan ini."
                          }
                        >
                          {sess.isOpen ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              <span>BUKA</span>
                            </>
                          ) : (
                            <span>TUTUP</span>
                          )}
                        </button>
                      </div>
                    </th>
                  ))
                )}

                <th className="py-3 px-3 font-semibold text-center bg-[#EEF3FF] min-w-[75px]">
                  Hadir
                </th>
                <th className="py-3 px-3 font-semibold text-center bg-[#EEF3FF] min-w-[80px]">
                  Persentase
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E4E9F2]">
              {paginatedStudents.map((st) => (
                <tr key={st.studentUserId} className="hover:bg-[#F6F8FC]/50 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-[#172033] sticky left-0 z-10 bg-white tabular-nums">
                    {st.studentNumber}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-[#172033] sticky left-28 z-10 bg-white border-r border-[#E4E9F2] truncate max-w-[190px]">
                    {st.name}
                  </td>

                  {/* Sessions status */}
                  {data.sessions.map((sess) => {
                    const record = st.records[sess.id];
                    const status = record?.status;
                    return (
                      <td
                        key={sess.id}
                        className={`py-1.5 px-1 border-r border-[#E4E9F2] text-center ${
                          sess.isOpen ? "bg-emerald-50/20" : ""
                        }`}
                      >
                        <select
                          value={status || "unrecorded"}
                          onChange={(e) =>
                            handleStatusChange(
                              sess.id,
                              st.studentUserId,
                              e.target.value as any
                            )
                          }
                          className={`text-[11px] font-bold rounded py-0.5 px-1 focus:outline-none cursor-pointer border ${
                            status === "present"
                              ? "bg-[#E8F5EF] text-[#16845B] border-[#16845B]/30"
                              : status === "late"
                              ? "bg-amber-50 text-amber-700 border-amber-300"
                              : status === "sick"
                              ? "bg-[#EDF5FA] text-[#2878B8] border-[#2878B8]/30"
                              : status === "excused"
                              ? "bg-[#FDF5E6] text-[#B7791F] border-[#B7791F]/30"
                              : status === "absent"
                              ? "bg-[#FCECEE] text-[#C43D4B] border-[#C43D4B]/30"
                              : "bg-slate-100 text-slate-400 border-slate-200"
                          }`}
                        >
                          <option value="unrecorded">-</option>
                          <option value="present">H</option>
                          <option value="late">T</option>
                          <option value="sick">S</option>
                          <option value="excused">I</option>
                          <option value="absent">A</option>
                        </select>
                      </td>
                    );
                  })}

                  <td className="py-2.5 px-3 text-center tabular-nums bg-[#EEF3FF]/30 font-semibold text-[#172033]">
                    {st.stats.presentCount + (st.stats.lateCount || 0)} / {st.stats.heldSessionsCount || data.sessions.length}
                  </td>
                  <td className="py-2.5 px-3 text-center tabular-nums bg-[#EEF3FF]/30 font-bold">
                    <span
                      className={
                        st.stats.percentage >= 75
                          ? "text-[#16845B]"
                          : "text-[#C43D4B]"
                      }
                    >
                      {st.stats.percentage}%
                    </span>
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

      {/* Modal Buat Sesi Pertemuan */}
      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title="Buat Sesi Pertemuan Baru"
        description="Tambahkan sesi perkuliahan manual untuk kelas ini."
      >
        <form onSubmit={handleCreateSession} className="space-y-4">
          <Input
            label="Pertemuan Ke-"
            type="number"
            min={1}
            max={32}
            value={newMeetingNumber}
            onChange={(e) => setNewMeetingNumber(parseInt(e.target.value) || 1)}
            required
          />

          <Input
            label="Tanggal Pertemuan"
            type="date"
            value={newSessionDate}
            onChange={(e) => setNewSessionDate(e.target.value)}
            required
          />

          <Input
            label="Topik / Materi Perkuliahan (Opsional)"
            type="text"
            placeholder="cth: Pengenalan State Management"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
          />

          <p className="text-[11px] text-[#667085]">
            * Mahasiswa akan tercatat &ldquo;Belum Hadir&rdquo; sampai melakukan absensi barcode atau status diisi oleh dosen.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSessionModalOpen(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? "Menyimpan..." : "Simpan Sesi"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Sinkronisasi ke Gradebook */}
      <Modal
        isOpen={isSyncModalOpen}
        onClose={() => {
          setIsSyncModalOpen(false);
          setSyncResult(null);
        }}
        title="Sinkronisasi Presensi ke Gradebook"
        description="Kalkulasi persentase kehadiran setiap mahasiswa dan masukkan ke item penilaian Presensi di Gradebook secara otomatis."
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-[#EEF3FF] p-3 text-xs text-[#2457D6] space-y-1">
            <p className="font-semibold">Mekanisme Kalkulasi:</p>
            <p>
              Nilai dihitung berdasarkan persentase kehadiran (Hadir &amp; Terlambat) dari total pertemuan yang telah terlaksana ({data.heldSessionsCount || data.sessions.length} pertemuan).
            </p>
          </div>

          {syncResult && (
            <div className="rounded-lg bg-[#E8F5EF] p-3 text-xs text-[#16845B] font-medium">
              {syncResult}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsSyncModalOpen(false);
                setSyncResult(null);
              }}
              disabled={isSyncing}
            >
              Tutup
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSyncToGradebook}
              disabled={isSyncing}
            >
              {isSyncing ? "Menyinkronkan..." : "Mulai Sinkronisasi"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Barcode Presensi Kampus */}
      <ClassBarcodePresenterModal
        classId={data.classInfo.id}
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
      />
    </div>
  );
}
