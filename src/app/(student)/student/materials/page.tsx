import { notFound } from "next/navigation";
import {
  getStudentCurriculumWithProgress,
  getStudentMaterialsOverview,
} from "@/features/materials/actions";
import { StudentMaterialViewerClient } from "@/features/materials/components/StudentMaterialViewerClient";
import { StudentMaterialsOverviewClient } from "@/features/materials/components/StudentMaterialsOverviewClient";

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

  // 2. If classId is selected -> Show the Learning Hub with Progress Tracker & Interactive Viewer
  let curriculum;
  try {
    curriculum = await getStudentCurriculumWithProgress(classId);
  } catch {
    notFound();
  }

  if (!curriculum) notFound();

  return (
    <StudentMaterialViewerClient
      classInfo={curriculum.classInfo}
      initialSections={curriculum.sections}
      initialProgressPercentage={curriculum.progressPercentage}
      initialTotalMaterials={curriculum.totalMaterials}
      initialCompletedCount={curriculum.completedCount}
    />
  );
}
