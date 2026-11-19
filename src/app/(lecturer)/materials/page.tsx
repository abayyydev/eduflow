import { notFound } from "next/navigation";
import { getLecturerClasses } from "@/features/classes/actions";
import {
  getClassCurriculum,
  getLecturerMaterialsOverview,
} from "@/features/materials/actions";
import { MaterialStudioClient } from "@/features/materials/components/MaterialStudioClient";
import { MaterialsOverviewClient } from "@/features/materials/components/MaterialsOverviewClient";

interface MaterialsPageProps {
  searchParams: Promise<{ classId?: string }>;
}

export default async function MaterialsPage({ searchParams }: MaterialsPageProps) {
  const { classId } = await searchParams;

  // 1. If NO classId selected -> Display the Class Directory / Overview Hub first
  if (!classId) {
    const overview = await getLecturerMaterialsOverview();
    return <MaterialsOverviewClient classesList={overview} />;
  }

  // 2. If classId is specified -> Open the Material Studio Editor for this class
  const classesList = await getLecturerClasses("active");
  let curriculum;
  try {
    curriculum = await getClassCurriculum(classId);
  } catch {
    notFound();
  }

  if (!curriculum) notFound();

  const availableClasses = classesList.map((c) => ({
    id: c.id,
    displayName: c.displayName,
  }));

  return (
    <MaterialStudioClient
      classInfo={curriculum.classInfo}
      initialSections={curriculum.sections}
      availableClasses={availableClasses}
    />
  );
}
