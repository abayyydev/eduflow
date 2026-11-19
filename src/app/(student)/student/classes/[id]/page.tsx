import { notFound } from "next/navigation";
import Link from "next/link";
import { getStudentClassDetail } from "@/features/student-classes/actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Calendar,
  UserCheck,
  BookOpen,
  FileCheck2,
  ExternalLink,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface StudentClassDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentClassDetailPage({
  params,
}: StudentClassDetailPageProps) {
  const { id } = await params;

  let data;
  try {
    data = await getStudentClassDetail(id);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "FORBIDDEN_NOT_ENROLLED") {
      return (
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-[#FCECEE] text-[#C43D4B] flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#172033]">Akses Ditolak</h2>
          <p className="text-xs text-[#667085]">
            Anda tidak terdaftar sebagai peserta aktif di kelas ini.
          </p>
          <Link href="/student/classes">
            <Button variant="outline" size="sm">
              Kembali ke Kelas Saya
            </Button>
          </Link>
        </div>
      );
    }
    notFound();
  }

  if (!data) notFound();

  const { classData, materials, assignments: classAssignments } = data;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/student/classes"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#667085] hover:text-[#172033] mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Kelas Saya
        </Link>

        {/* Class Banner */}
        <div className="bg-white rounded-2xl border border-[#E4E9F2] p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#EEF3FF] text-[#2457D6] uppercase tracking-wider">
              {classData.courseCode} &bull; Kelas {classData.classCode}
            </span>
            <span className="text-xs text-[#667085]">
              {classData.creditUnits} SKS &bull; {classData.termName}
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
            {classData.displayName}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#E4E9F2] text-xs text-[#667085]">
            <p className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#2457D6]" />
              <span>Dosen: <strong className="text-[#172033]">{classData.lecturerName}</strong> ({classData.lecturerEmail})</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#667085]" />
              <span>{classData.scheduleText || "Jadwal belum ditentukan"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Assignments & Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assignments */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#2457D6]" />
                <CardTitle>Tugas Kuliah</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {classAssignments.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#667085]">
                  Belum ada tugas aktif untuk kelas ini.
                </div>
              ) : (
                <div className="divide-y divide-[#E4E9F2]">
                  {classAssignments.map((asg) => (
                    <div key={asg.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-[#172033]">
                          {asg.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-[#B7791F] font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Tenggat: {formatDateTime(asg.dueAt)}
                          </span>
                          <span className="text-[#667085]">&bull; Nilai Maks: {asg.maxScore}</span>
                        </div>
                      </div>
                      <div>
                        <Link href={`/student/assignments/${asg.id}`}>
                          <Button variant="primary" size="sm">
                            Pengumpulan
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

        {/* Right Column: Materials */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#16845B]" />
                <CardTitle>Materi Pertemuan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {materials.length === 0 ? (
                <p className="text-xs text-[#667085] py-4 text-center">
                  Belum ada materi pembelajaran yang dipublikasikan.
                </p>
              ) : (
                <div className="space-y-3">
                  {materials.map((mat) => (
                    <div key={mat.id} className="p-3 bg-[#F6F8FC] rounded-lg border border-[#E4E9F2] space-y-1.5">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#E8F5EF] text-[#16845B]">
                        Pertemuan {mat.meetingNumber || "—"}
                      </span>
                      <h4 className="text-xs font-bold text-[#172033] pt-1">
                        {mat.title}
                      </h4>
                      {mat.description && (
                        <p className="text-[11px] text-[#667085]">
                          {mat.description}
                        </p>
                      )}
                      {mat.externalUrl && (
                        <div className="pt-1">
                          <a
                            href={mat.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#2457D6] hover:underline"
                          >
                            <span>Buka Materi</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
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
