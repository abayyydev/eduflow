import { notFound } from "next/navigation";
import {
  getAssignmentDetail,
  getAssignmentSubmissionsList,
} from "@/features/assignments/actions";
import { AssignmentDetailClient } from "@/features/assignments/components/AssignmentDetailClient";

interface AssignmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssignmentDetailPage({
  params,
}: AssignmentDetailPageProps) {
  const { id } = await params;

  let assignment;
  try {
    assignment = await getAssignmentDetail(id);
  } catch {
    notFound();
  }

  if (!assignment) notFound();

  const submissions = await getAssignmentSubmissionsList(id);

  return (
    <AssignmentDetailClient
      assignment={assignment}
      submissionsList={submissions}
    />
  );
}
