import { getStudentAssignmentsList } from "@/features/submissions/actions";
import { StudentAssignmentsListClient } from "@/features/submissions/components/StudentAssignmentsListClient";

export default async function StudentAssignmentsPage() {
  const assignments = await getStudentAssignmentsList();

  return (
    <StudentAssignmentsListClient
      initialAssignments={assignments}
    />
  );
}
