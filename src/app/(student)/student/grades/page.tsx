import { getStudentGradesOverview } from "@/features/gradebook/student-actions";
import { StudentGradesClient } from "@/features/gradebook/components/StudentGradesClient";

export default async function StudentGradesPage() {
  const gradesData = await getStudentGradesOverview();

  return <StudentGradesClient classesGrades={gradesData} />;
}
