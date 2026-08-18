import { getAdminMetrics, getAdminOrganizations, getAdminPayments, getHealthRisks } from "@/lib/actions/admin";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const start = typeof searchParams?.start === "string" ? searchParams.start : undefined;
  const end = typeof searchParams?.end === "string" ? searchParams.end : undefined;

  const [initialMetrics, organizations, payments, risks] = await Promise.all([
    getAdminMetrics(0, start, end),
    getAdminOrganizations(start, end),
    getAdminPayments(),
    getHealthRisks()
  ]);

  return (
    <AdminDashboardClient 
      initialMetrics={initialMetrics}
      organizations={organizations}
      payments={payments}
      risks={risks}
      currentStartDate={start}
      currentEndDate={end}
    />
  );
}
