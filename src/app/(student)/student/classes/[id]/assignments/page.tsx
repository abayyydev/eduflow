import { notFound } from "next/navigation";
import Link from "next/link";
import { getStudentClassAssignments } from "@/features/submissions/actions";
import { StudentClassAssignmentsClient } from "@/features/student-classes/components/StudentClassAssignmentsClient";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

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
    if (error instanceof Error && error.message === "FORBIDDEN_NOT_ENROLLED") {
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
    notFound();
  }

  if (!data) notFound();

  return (
    <StudentClassAssignmentsClient
      classInfo={data.classInfo}
      assignments={data.assignments}
    />
  );
}
