import { notFound, redirect } from "next/navigation";
import { getLecturerClasses } from "@/features/classes/actions";
import { getClassAttendanceOverview } from "@/features/attendance/actions";
import { AttendanceClient } from "@/features/attendance/components/AttendanceClient";

interface AttendancePageProps {
  searchParams: Promise<{ classId?: string }>;
}

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const { classId } = await searchParams;

  const classesList = await getLecturerClasses("active");
  if (classesList.length === 0) {
    redirect("/classes");
  }

  const targetClassId = classId || classesList[0].id;
  const attendanceData = await getClassAttendanceOverview(targetClassId);

  if (!attendanceData) {
    notFound();
  }

  const availableClasses = classesList.map((c) => ({
    id: c.id,
    displayName: c.displayName,
  }));

  return (
    <AttendanceClient
      key={targetClassId}
      initialData={attendanceData}
      availableClasses={availableClasses}
    />
  );
}
