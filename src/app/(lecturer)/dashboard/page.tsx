import { getCurrentUser } from "@/server/auth/session";
import { db } from "@/server/db";
import { classes, enrollments, assignments, submissions } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  FileCheck2,
  Clock,
  PlusCircle,
  Calculator,
  ArrowRight,
} from "lucide-react";

export default async function LecturerDashboardPage() {
  const user = await getCurrentUser();

  // Query KPIs from DB
  const [classCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(classes)
    .where(eq(classes.status, "active"));

  const [studentCountResult] = await db
    .select({ count: sql<number>`count(distinct ${enrollments.studentUserId})` })
    .from(enrollments);

  const [assignmentCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(assignments)
    .where(eq(assignments.status, "published"));

  const [pendingGradingResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(submissions)
    .where(eq(submissions.status, "submitted"));

  const activeClasses = await db.query?.classes
    ? await db.select().from(classes).where(eq(classes.status, "active")).limit(5)
    : await db.select().from(classes).where(eq(classes.status, "active")).limit(5);

  return (
    <div className="space-y-6">
      {/* Top Greeting & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
            Selamat Datang, {user?.name}
          </h1>
          <p className="text-sm text-[#667085] mt-0.5">
            Kelola aktivitas pengajaran, presensi, dan penilaian akademik dalam satu tempat.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/assignments">
            <Button variant="secondary" size="sm">
              <PlusCircle className="w-4 h-4 mr-1" /> Buat Tugas
            </Button>
          </Link>
          <Link href="/gradebook">
            <Button variant="primary" size="sm">
              <Calculator className="w-4 h-4 mr-1" /> Buka Gradebook
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-[#2457D6]/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">
                Kelas Aktif
              </p>
              <p className="text-2xl font-bold text-[#172033] mt-1 tabular-nums">
                {classCountResult?.count || 0}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#EEF3FF] text-[#2457D6] flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-[#16845B]/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">
                Total Mahasiswa
              </p>
              <p className="text-2xl font-bold text-[#172033] mt-1 tabular-nums">
                {studentCountResult?.count || 0}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#E8F5EF] text-[#16845B] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-[#B7791F]/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">
                Tugas Berjalan
              </p>
              <p className="text-2xl font-bold text-[#172033] mt-1 tabular-nums">
                {assignmentCountResult?.count || 0}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#FDF5E6] text-[#B7791F] flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-[#C43D4B]/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">
                Perlu Dinilai
              </p>
              <p className="text-2xl font-bold text-[#172033] mt-1 tabular-nums">
                {pendingGradingResult?.count || 0}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#FCECEE] text-[#C43D4B] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Daftar Kelas yang Diampu</CardTitle>
                <p className="text-xs text-[#667085] mt-0.5">
                  Semester 2026/2027 Ganjil
                </p>
              </div>
              <Link href="/classes" className="text-xs font-medium text-[#2457D6] hover:underline flex items-center gap-1">
                Semua Kelas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-[#E4E9F2]">
                {activeClasses.map((cls) => (
                  <div key={cls.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[#172033]">
                        {cls.displayName}
                      </h4>
                      <p className="text-xs text-[#667085] mt-0.5">
                        {cls.scheduleText || "Jadwal belum ditentukan"} &bull; Kode Kelas: {cls.classCode}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/classes/${cls.id}`}>
                        <Button variant="outline" size="sm">
                          Kelola Kelas
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attention Box */}
        <div className="space-y-4">
          <Card className="border-[#2457D6]/20 bg-[#EEF3FF]/30">
            <CardHeader>
              <CardTitle className="text-[#2457D6]">Perhatian Sistem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-white rounded-lg border border-[#E4E9F2] text-xs space-y-1">
                <span className="font-semibold text-[#172033] block">
                  Pengumpulan Perlu Dinilai
                </span>
                <p className="text-[#667085]">
                  Terdapat {pendingGradingResult?.count || 0} tugas mahasiswa yang telah dikumpulkan dan menunggu review serta penilaian.
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E4E9F2] text-xs space-y-1">
                <span className="font-semibold text-[#172033] block">
                  Komponen Nilai &amp; Bobot
                </span>
                <p className="text-[#667085]">
                  Seluruh 3 kelas aktif telah memiliki konfigurasi bobot standar 100%. Nilai dapat langsung dimasukkan dan dihitung.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
