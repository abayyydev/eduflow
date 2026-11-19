import { notFound, redirect } from "next/navigation";
import { getLecturerClasses, getClassDetail } from "@/features/classes/actions";
import { getClassMaterials } from "@/features/materials/actions";
import { MaterialsClient, type MaterialItem } from "@/features/materials/components/MaterialsClient";

interface MaterialsPageProps {
  searchParams: Promise<{ classId?: string }>;
}

export default async function MaterialsPage({ searchParams }: MaterialsPageProps) {
  const { classId } = await searchParams;

  const classesList = await getLecturerClasses("active");
  if (classesList.length === 0) {
    redirect("/classes");
  }

  const targetClassId = classId || classesList[0].id;

  let classData;
  try {
    classData = await getClassDetail(targetClassId);
  } catch {
    notFound();
  }

  if (!classData) notFound();

  const materials = await getClassMaterials(targetClassId);

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
