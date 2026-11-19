import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { LecturerLayout } from "@/components/layout/LecturerLayout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "lecturer") {
    redirect("/student/dashboard");
  }

  return <LecturerLayout user={user}>{children}</LecturerLayout>;
}
