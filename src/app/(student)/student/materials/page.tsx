import { notFound } from "next/navigation";
import {
  getStudentEnrolledClasses,
  getStudentClassDetail,
} from "@/features/student-classes/actions";
import {
  getClassMaterials,
  getStudentMaterialsOverview,
} from "@/features/materials/actions";
import {
  StudentMaterialsClient,
} from "@/features/materials/components/StudentMaterialsClient";
import { StudentMaterialsOverviewClient } from "@/features/materials/components/StudentMaterialsOverviewClient";
import { type MaterialItem } from "@/features/materials/components/MaterialsClient";

interface StudentMaterialsPageProps {
  searchParams: Promise<{ classId?: string }>;
}

export default async function StudentMaterialsPage({
  searchParams,
}: StudentMaterialsPageProps) {
  const { classId } = await searchParams;

  // 1. If NO classId selected -> Show Student Materials Class Hub / Overview first
  if (!classId) {
    const overview = await getStudentMaterialsOverview();
    return <StudentMaterialsOverviewClient enrolledClasses={overview} />;
  }

  // 2. If classId is selected -> Show Materials for that specific class
  const enrolledClasses = await getStudentEnrolledClasses();

  let detail;
  try {
    detail = await getStudentClassDetail(classId);
  } catch {
    notFound();
  }

  if (!detail) notFound();

  const materials = await getClassMaterials(classId);

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
