import { getCurrentUser } from "@/server/auth/session";
import { db } from "@/server/db";
import { enrollments, classes, assignments, studentProfiles } from "@/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  GraduationCap,
  Clock,
  ArrowRight,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  const [profile] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, user!.userId))
    .limit(1);

  // Get enrolled classes
  const enrolledClasses = await db
    .select({
      enrollmentId: enrollments.id,
      classId: classes.id,
      displayName: classes.displayName,
      classCode: classes.classCode,
      scheduleText: classes.scheduleText,
    })
    .from(enrollments)
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .where(
      and(
        eq(enrollments.studentUserId, user!.userId),
        eq(enrollments.enrollmentStatus, "active")
      )
    );

  const enrolledClassIds = enrolledClasses.map((c) => c.classId);

  // Get upcoming assignments for these classes
  const upcomingAssignments = enrolledClassIds.length > 0
    ? await db
        .select({
          id: assignments.id,
          title: assignments.title,
          dueAt: assignments.dueAt,
          submissionMode: assignments.submissionMode,
          classDisplayName: classes.displayName,
        })
        .from(assignments)
        .innerJoin(classes, eq(assignments.classId, classes.id))
        .where(
          and(
            eq(assignments.status, "published"),
            sql`${assignments.classId} IN (${sql.join(
              enrolledClassIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          )
        )
        .limit(5)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#2457D6] to-[#173B96] p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white mb-2">
              Semester 2026/2027 Ganjil
            </span>
            <h1 className="text-2xl font-bold tracking-tight">
              Halo, {user?.name}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1">
              NIM: {profile?.studentNumber || "—"} &bull; {profile?.studyProgram || "Teknik Informatika"} (Angkatan {profile?.cohort || "2024"})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/student/assignments">
              <Button variant="secondary" size="sm" className="bg-white text-[#2457D6] hover:bg-white/90">
                Lihat Semua Tugas
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Classes & Active Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Kelas yang Diikuti</CardTitle>
                <p className="text-xs text-[#667085] mt-0.5">
                  Anda terdaftar pada {enrolledClasses.length} kelas aktif semester ini
                </p>
              </div>
              <Link href="/student/classes" className="text-xs font-medium text-[#2457D6] hover:underline flex items-center gap-1">
                Detail Kelas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {enrolledClasses.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#667085]">
                  Belum ada kelas yang terdaftar. Hubungi dosen pengampu.
                </div>
              ) : (
                <div className="divide-y divide-[#E4E9F2]">
                  {enrolledClasses.map((cls) => (
                    <div key={cls.classId} className="py-3.5 flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-xl bg-[#EEF3FF] text-[#2457D6] flex items-center justify-center shrink-0 mt-0.5">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#172033]">
                            {cls.displayName}
                          </h4>
                          <p className="text-xs text-[#667085] mt-0.5">
                            {cls.scheduleText || "Jadwal belum ditentukan"}
                          </p>
                        </div>
                      </div>
                      <Link href={`/student/classes/${cls.classId}`}>
                        <Button variant="outline" size="sm">
                          Buka
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Assignments */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B7791F]" />
                Tenggat Terdekat
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAssignments.length === 0 ? (
                <p className="text-xs text-[#667085] py-4 text-center">
                  Tidak ada tugas aktif yang mendekati tenggat.
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingAssignments.map((asg) => (
                    <div key={asg.id} className="p-3 bg-[#F6F8FC] rounded-lg border border-[#E4E9F2] space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-[#172033] line-clamp-1">
                          {asg.title}
                        </span>
                        <Badge variant="info">Aktif</Badge>
                      </div>
                      <p className="text-[11px] text-[#667085]">
                        {asg.classDisplayName}
                      </p>
                      <p className="text-[11px] font-medium text-[#B7791F]">
                        Tenggat: {formatDateTime(asg.dueAt)}
                      </p>
                      <div className="pt-1">
                        <Link href={`/student/assignments/${asg.id}`}>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            Kumpulkan Tugas
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
