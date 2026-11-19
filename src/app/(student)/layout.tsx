import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { StudentLayout } from "@/components/layout/StudentLayout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "student") {
    redirect("/dashboard");
  }

  return <StudentLayout user={user}>{children}</StudentLayout>;
}
