import { redirect } from "next/navigation";

interface StudentClassMaterialsPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentClassMaterialsRedirectPage({
  params,
}: StudentClassMaterialsPageProps) {
  const { id } = await params;
  redirect(`/student/materials?classId=${id}`);
}
