import { notFound, redirect } from "next/navigation";
import { getLecturerClasses } from "@/features/classes/actions";
import { getClassGradebookData } from "@/features/gradebook/actions";
import { GradebookClient } from "@/features/gradebook/components/GradebookClient";

interface GradebookPageProps {
  searchParams: Promise<{ classId?: string }>;
}

export default async function GradebookPage({ searchParams }: GradebookPageProps) {
  const { classId } = await searchParams;

  const classesList = await getLecturerClasses("active");
  if (classesList.length === 0) {
    redirect("/classes");
  }

  const targetClassId = classId || classesList[0].id;
  const gradebookData = await getClassGradebookData(targetClassId);

  if (!gradebookData) {
    notFound();
  }

  const availableClasses = classesList.map((c) => ({
    id: c.id,
    displayName: c.displayName,
  }));

  return (
    <GradebookClient
      initialData={gradebookData}
      availableClasses={availableClasses}
    />
  );
}
