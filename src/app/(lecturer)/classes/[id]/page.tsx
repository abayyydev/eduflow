import { notFound } from "next/navigation";
import { getClassDetail } from "@/features/classes/actions";
import {
  getClassEnrolledStudents,
  getAvailableStudentsForClass,
} from "@/features/enrollments/actions";
import { ClassDetailClient } from "@/features/classes/components/ClassDetailClient";

interface ClassDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  const { id } = await params;

  let classData;
  try {
    classData = await getClassDetail(id);
  } catch {
    notFound();
  }

  if (!classData) {
    notFound();
  }

  const [enrolledStudents, availableStudents] = await Promise.all([
    getClassEnrolledStudents(id),
    getAvailableStudentsForClass(id),
  ]);

  return (
    <ClassDetailClient
      classData={classData}
      enrolledStudents={enrolledStudents}
      availableStudents={availableStudents}
    />
  );
}
