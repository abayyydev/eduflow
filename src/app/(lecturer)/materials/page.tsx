import { notFound } from "next/navigation";
import { getLecturerClasses, getClassDetail } from "@/features/classes/actions";
import {
  getClassMaterials,
  getLecturerMaterialsOverview,
} from "@/features/materials/actions";
import {
  MaterialsClient,
  type MaterialItem,
} from "@/features/materials/components/MaterialsClient";
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

  // 2. If classId is specified -> Display materials for this specific class
  const classesList = await getLecturerClasses("active");
  let classData;
  try {
    classData = await getClassDetail(classId);
  } catch {
    notFound();
  }

  if (!classData) notFound();

  const materials = await getClassMaterials(classId);

  const availableClasses = classesList.map((c) => ({
    id: c.id,
    displayName: c.displayName,
  }));

  return (
    <MaterialsClient
      initialMaterials={materials as MaterialItem[]}
      currentClass={{
        id: classData.id,
        displayName: classData.displayName,
        courseCode: classData.courseCode,
        classCode: classData.classCode,
        termName: classData.termName,
      }}
      availableClasses={availableClasses}
    />
  );
}
