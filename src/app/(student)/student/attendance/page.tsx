import { getStudentAttendanceHubData } from "@/features/attendance/actions";
import { StudentAttendanceScanClient } from "@/features/attendance/components/StudentAttendanceScanClient";

export default async function StudentAttendancePage() {
  const data = await getStudentAttendanceHubData();

  return <StudentAttendanceScanClient initialData={data} />;
}
