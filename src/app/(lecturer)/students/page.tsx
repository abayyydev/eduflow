import { getAllStudents } from "@/features/students/actions";
import { StudentsClient } from "@/features/students/components/StudentsClient";

export default async function StudentsPage() {
  const students = await getAllStudents();

  return <StudentsClient initialStudents={students} />;
}
