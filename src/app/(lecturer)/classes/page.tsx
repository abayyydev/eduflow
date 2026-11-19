import {
  getLecturerClasses,
  getLecturerCourses,
  getAllAcademicTerms,
} from "@/features/classes/actions";
import { ClassesClient } from "@/features/classes/components/ClassesClient";

export default async function ClassesPage() {
  const [classesList, coursesList, termsList] = await Promise.all([
    getLecturerClasses("active"),
    getLecturerCourses(),
    getAllAcademicTerms(),
  ]);

  return (
    <ClassesClient
      initialClasses={classesList}
      courses={coursesList}
      terms={termsList}
    />
  );
}
