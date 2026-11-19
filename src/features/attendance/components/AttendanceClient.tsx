"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Users,
  Calendar,
  TrendingUp,
  Download,
} from "lucide-react";
import {
  type AttendanceOverviewData,
  createAttendanceSession,
  updateStudentAttendance,
  syncAttendanceToGradebook,
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
  const [data] = useState<AttendanceOverviewData>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  // Form state
  const [newMeetingNumber, setNewMeetingNumber] = useState<number>(
    data.sessions.length + 1
  );
  const [newSessionDate, setNewSessionDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [newTopic, setNewTopic] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  const isLocked = data.classInfo.gradingLockedAt !== null;

  const filteredStudents = data.students.filter((st) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      st.name.toLowerCase().includes(q) ||
      st.studentNumber.toLowerCase().includes(q)
    );
  });

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

  const handleStatusChange = async (
    sessionId: string,
    studentUserId: string,
    status: "present" | "sick" | "excused" | "absent"
  ) => {
    const res = await updateStudentAttendance(
      data.classInfo.id,
      sessionId,
      studentUserId,
      status
    );

    if (res.error) {
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
          <select
            value={data.classInfo.id}
            onChange={(e) => router.push(`/attendance?classId=${e.target.value}`)}
            className="rounded-lg border border-[#E4E9F2] bg-white px-3 py-2 text-xs font-medium text-[#172033] focus:outline-none focus:border-[#2457D6]"
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

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">
                Total Pertemuan
              </p>
              <p className="text-2xl font-bold text-[#172033] mt-1 tabular-nums">
                {data.sessions.length}
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#E4E9F2] pl-8 pr-3 py-1.5 text-xs text-[#172033] focus:outline-none focus:border-[#2457D6]"
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16845B]" /> H = Hadir
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2878B8]" /> S = Sakit
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B7791F]" /> I = Izin
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C43D4B]" /> A = Alpa
            </span>
          </div>
        </div>

        {/* Matrix Table */}
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
                      className="py-2.5 px-3 font-semibold text-center border-r border-[#E4E9F2] min-w-[70px]"
                      title={`Pertemuan ${sess.meetingNumber} (${formatDate(sess.sessionDate)}): ${sess.topic || "Tanpa topik"}`}
                    >
                      <div className="font-bold text-[#172033]">
                        P{sess.meetingNumber}
                      </div>
                      <div className="text-[10px] text-[#667085] font-normal">
                        {sess.sessionDate.slice(5)}
                      </div>
                    </th>
                  ))
                )}

                <th className="py-3 px-3 font-semibold text-center bg-[#EEF3FF] min-w-[70px]">
                  Hadir
                </th>
                <th className="py-3 px-3 font-semibold text-center bg-[#EEF3FF] min-w-[75px]">
                  Persentase
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E4E9F2]">
              {filteredStudents.map((st) => (
                <tr key={st.studentUserId} className="hover:bg-[#F6F8FC]/50 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-[#172033] sticky left-0 z-10 bg-white tabular-nums">
                    {st.studentNumber}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-[#172033] sticky left-28 z-10 bg-white border-r border-[#E4E9F2] truncate max-w-[190px]">
                    {st.name}
                  </td>

                  {/* Sessions status */}
                  {data.sessions.map((sess) => {
                    const record = st.records[sess.id] || { status: "absent" };
                    return (
                      <td
                        key={sess.id}
                        className="py-1.5 px-1.5 border-r border-[#E4E9F2] text-center"
                      >
                        <select
                          value={record.status}
                          onChange={(e) =>
                            handleStatusChange(
                              sess.id,
                              st.studentUserId,
                              e.target.value as "present" | "sick" | "excused" | "absent"
                            )
                          }
                          className={`text-[11px] font-bold rounded py-0.5 px-1 focus:outline-none cursor-pointer border ${
                            record.status === "present"
                              ? "bg-[#E8F5EF] text-[#16845B] border-[#16845B]/30"
                              : record.status === "sick"
                              ? "bg-[#EDF5FA] text-[#2878B8] border-[#2878B8]/30"
                              : record.status === "excused"
                              ? "bg-[#FDF5E6] text-[#B7791F] border-[#B7791F]/30"
                              : "bg-[#FCECEE] text-[#C43D4B] border-[#C43D4B]/30"
                          }`}
                        >
                          <option value="present">H</option>
                          <option value="sick">S</option>
                          <option value="excused">I</option>
                          <option value="absent">A</option>
                        </select>
                      </td>
                    );
                  })}

                  <td className="py-2.5 px-3 text-center tabular-nums bg-[#EEF3FF]/30 font-semibold text-[#172033]">
                    {st.stats.presentCount} / {st.stats.totalSessions}
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
      </Card>

      {/* Modal Buat Sesi Pertemuan */}
      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title="Buat Sesi Pertemuan Presensi"
        description="Buka sesi presensi untuk perkuliahan hari ini atau tanggal tertentu."
      >
        <form onSubmit={handleCreateSession} className="space-y-3.5">
          <Input
            label="Pertemuan Ke-"
            type="number"
            min={1}
            max={32}
            value={newMeetingNumber}
            onChange={(e) => setNewMeetingNumber(parseInt(e.target.value) || 1)}
            required
            disabled={isLoading}
          />

          <Input
            label="Tanggal Perkuliahan"
            type="date"
            value={newSessionDate}
            onChange={(e) => setNewSessionDate(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label="Topik / Pokok Bahasan (Opsional)"
            placeholder="Contoh: Pengantar Tree dan Binary Search Tree"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            disabled={isLoading}
          />

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
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Buka Sesi Presensi
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
        description="Hitung persentase kehadiran dan masukkan otomatis sebagai nilai ke Gradebook."
      >
        <div className="space-y-4 text-xs">
          {syncResult ? (
            <div className="p-3 bg-[#E8F5EF] border border-[#16845B]/20 rounded-lg text-[#16845B]">
              {syncResult}
            </div>
          ) : (
            <div className="space-y-2 text-[#667085]">
              <p>
                Sistem akan menghitung nilai persentase presensi:{" "}
                <strong>(Hadir / Total Sesi) &times; 100</strong> untuk seluruh{" "}
                {data.students.length} mahasiswa terdaftar.
              </p>
              <p>
                Nilai ini akan disimpan pada item penilaian{" "}
                <strong>&quot;Rekap Presensi Perkuliahan&quot;</strong> di bawah
                kategori <strong>Presensi</strong> pada Gradebook kelas ini.
              </p>
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
            >
              Tutup
            </Button>
            {!syncResult && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSyncToGradebook}
                isLoading={isSyncing}
              >
                Mulai Sinkronisasi Sekarang
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
