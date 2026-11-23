import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getStudentClassAssignments } from "@/features/submissions/actions";
import { StudentClassAssignmentsClient } from "@/features/student-classes/components/StudentClassAssignmentsClient";
import { Button } from "@/components/ui/button";
import { GraduationCap, AlertCircle } from "lucide-react";

interface StudentClassAssignmentsPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentClassAssignmentsPage({
  params,
}: StudentClassAssignmentsPageProps) {
  const { id } = await params;

  let data;
  try {
    data = await getStudentClassAssignments(id);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED" || msg === "FORBIDDEN_NOT_STUDENT") {
      redirect("/login");
    }
    if (msg === "FORBIDDEN_NOT_ENROLLED" || msg.includes("ENROLLED")) {
      return (
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Akses Ditolak</h2>
          <p className="text-xs text-slate-500">
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
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Kelas Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">
          Data kelas yang Anda cari tidak tersedia atau sedang diperbarui.
        </p>
        <Link href="/student/classes">
          <Button variant="outline" size="sm">
            Kembali ke Kelas Saya
          </Button>
        </Link>
      </div>
    );
  }

  if (!data) notFound();

  return (
    <StudentClassAssignmentsClient
      classInfo={data.classInfo}
      assignments={data.assignments}
    />
  );
}
