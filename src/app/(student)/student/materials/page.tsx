import { notFound } from "next/navigation";
import {
  getStudentEnrolledClasses,
  getStudentClassDetail,
} from "@/features/student-classes/actions";
import { getClassMaterials } from "@/features/materials/actions";
import {
  StudentMaterialsClient,
} from "@/features/materials/components/StudentMaterialsClient";
import { type MaterialItem } from "@/features/materials/components/MaterialsClient";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface StudentMaterialsPageProps {
  searchParams: Promise<{ classId?: string }>;
}

export default async function StudentMaterialsPage({
  searchParams,
}: StudentMaterialsPageProps) {
  const { classId } = await searchParams;

  const enrolledClasses = await getStudentEnrolledClasses();
  if (enrolledClasses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
            Materi Pembelajaran
          </h1>
          <p className="text-sm text-[#667085] mt-0.5">
            Akses materi dan modul perkuliahan dari kelas yang Anda ikuti.
          </p>
        </div>
        <Card className="py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-[#667085]/40 mb-3" />
          <h3 className="text-base font-semibold text-[#172033]">
            Belum Terdaftar di Kelas Apapun
          </h3>
          <p className="text-xs text-[#667085] mt-1">
            Hubungi dosen pengampu untuk mendaftarkan Anda ke kelas aktif.
          </p>
        </Card>
      </div>
    );
  }

  const targetClassId = classId || enrolledClasses[0].classId;

  let detail;
  try {
    detail = await getStudentClassDetail(targetClassId);
  } catch {
    notFound();
  }

  if (!detail) notFound();

  const materials = await getClassMaterials(targetClassId);

  const classOptions = enrolledClasses.map((c) => ({
    id: c.classId,
    displayName: c.displayName,
  }));

  return (
    <StudentMaterialsClient
      initialMaterials={materials as MaterialItem[]}
      currentClass={{
        id: detail.classData.id,
        displayName: detail.classData.displayName,
        courseCode: detail.classData.courseCode,
        classCode: detail.classData.classCode,
        termName: detail.classData.termName,
        lecturerName: detail.classData.lecturerName,
      }}
      enrolledClasses={classOptions}
    />
  );
}
