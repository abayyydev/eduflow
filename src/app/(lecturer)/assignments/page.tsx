import { getLecturerAssignments } from "@/features/assignments/actions";
import { getLecturerClasses } from "@/features/classes/actions";
import { AssignmentsListClient } from "@/features/assignments/components/AssignmentsListClient";

export default async function AssignmentsPage() {
  const [assignments, classesList] = await Promise.all([
    getLecturerAssignments(),
    getLecturerClasses("active"),
  ]);

  const classesOptions = classesList.map((c) => ({
    id: c.id,
    displayName: c.displayName,
    courseCode: c.courseCode,
  }));

  return (
    <AssignmentsListClient
      initialAssignments={assignments}
      classesList={classesOptions}
    />
  );
}
