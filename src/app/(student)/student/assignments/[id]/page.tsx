import { notFound } from "next/navigation";
import Link from "next/link";
import { getStudentAssignmentDetail } from "@/features/submissions/actions";
import { StudentSubmissionClient } from "@/features/submissions/components/StudentSubmissionClient";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

interface StudentAssignmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentAssignmentDetailPage({
  params,
}: StudentAssignmentDetailPageProps) {
  const { id } = await params;

  let data;
  try {
    data = await getStudentAssignmentDetail(id);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "FORBIDDEN_NOT_ENROLLED") {
      return (
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-[#FCECEE] text-[#C43D4B] flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#172033]">Akses Ditolak</h2>
          <p className="text-xs text-[#667085]">
            Anda tidak terdaftar sebagai peserta aktif di kelas pemilik tugas ini.
          </p>
          <Link href="/student/assignments">
            <Button variant="outline" size="sm">
              Kembali ke Daftar Tugas
            </Button>
          </Link>
        </div>
      );
    }
    notFound();
  }

  if (!data) notFound();

  return (
    <StudentSubmissionClient
      assignment={data.assignment}
      submission={data.submission}
      versions={data.versions}
    />
  );
}
