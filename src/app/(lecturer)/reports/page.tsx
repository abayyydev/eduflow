import { getReportsOverview } from "@/features/reports/actions";
import { ReportsClient } from "@/features/reports/components/ReportsClient";

export default async function ReportsPage() {
  const reports = await getReportsOverview();

  return <ReportsClient initialReports={reports} />;
}
