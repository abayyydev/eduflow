import { requireLecturer } from "@/server/auth/session";
import { db } from "@/server/db";
import { academicTerms, courses, classes } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  GraduationCap,
  Database,
  ShieldCheck,
  Server,
  Calendar,
} from "lucide-react";
import { ThemeSettingsCard } from "@/components/theme/ThemeSettingsCard";

export default async function SettingsPage() {
  const user = await requireLecturer();

  const terms = await db.select().from(academicTerms).orderBy(academicTerms.startsOn);
  const [activeClassesCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(classes)
    .where(eq(classes.status, "active"));

  const [coursesCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(courses)
    .where(eq(courses.lecturerId, user.userId));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
          Pengaturan & Konfigurasi Sistem
        </h1>
        <p className="text-sm text-[#667085] mt-0.5">
          Informasi profil dosen pengampu, tahun akademik aktif, dan parameter sistem EDUFlow.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <User className="w-5 h-5 text-[#2457D6]" />
            <CardTitle>Profil Dosen Pemilik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#2457D6]/10 text-[#2457D6] font-bold text-lg flex items-center justify-center shrink-0">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-[#172033]">{user.name}</p>
                <p className="text-[#667085]">{user.email}</p>
                <Badge variant="primary" className="mt-1">
                  Dosen Pemilik (Owner)
                </Badge>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E4E9F2]">
              <div className="flex justify-between py-1">
                <span className="text-[#667085]">Status Autentikasi:</span>
                <span className="font-semibold text-[#16845B] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi Aman
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#667085]">Mata Kuliah Diampu:</span>
                <span className="font-semibold text-[#172033]">
                  {coursesCount?.count || 0} Mata Kuliah
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#667085]">Kelas Aktif:</span>
                <span className="font-semibold text-[#172033]">
                  {activeClassesCount?.count || 0} Kelas
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Terms Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <Calendar className="w-5 h-5 text-[#16845B]" />
            <CardTitle>Tahun Akademik & Semester</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {terms.map((term) => (
                <div
                  key={term.id}
                  className={`p-3 rounded-lg border flex items-center justify-between text-xs ${term.isActive
                      ? "bg-[#E8F5EF] border-[#16845B]/30"
                      : "bg-[#F6F8FC] border-[#E4E9F2]"
                    }`}
                >
                  <div>
                    <p className="font-bold text-[#172033]">{term.name}</p>
                    <p className="text-[11px] text-[#667085]">
                      Tahun: {term.academicYear} &bull; Semester: {term.semester}
                    </p>
                  </div>
                  {term.isActive ? (
                    <Badge variant="success">
                      Aktif Berjalan
                    </Badge>
                  ) : (
                    <span className="text-[11px] text-[#667085]">Selesai</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* UI Themes Customizer */}
        <ThemeSettingsCard />

        {/* System & Storage Environment */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <Server className="w-5 h-5 text-[#667085]" />
            <CardTitle>Status Lingkungan & Arsitektur Sistem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-[#F6F8FC] rounded-lg border border-[#E4E9F2] space-y-1">
                <p className="text-[#667085] font-medium flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[#2457D6]" /> Database
                </p>
                <p className="font-bold text-[#172033]">MySQL 8.0 (InnoDB)</p>
                <p className="text-[11px] text-[#667085]">19 Relational Tables &bull; Pool Connection</p>
              </div>

              <div className="p-3 bg-[#F6F8FC] rounded-lg border border-[#E4E9F2] space-y-1">
                <p className="text-[#667085] font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#16845B]" /> Security & Storage
                </p>
                <p className="font-bold text-[#172033]">Private Object Storage</p>
                <p className="text-[11px] text-[#667085]">Authorized Route Streaming Handler</p>
              </div>

              <div className="p-3 bg-[#F6F8FC] rounded-lg border border-[#E4E9F2] space-y-1">
                <p className="text-[#667085] font-medium flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#B7791F]" /> Formula Penilaian
                </p>
                <p className="font-bold text-[#172033]">Weighted Normalized 100%</p>
                <p className="text-[11px] text-[#667085]">Skala Standar Dikti (A s/d E) & Audit Log</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
