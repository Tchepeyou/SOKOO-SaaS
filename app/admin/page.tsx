import { getAdminMetrics, getAdminOrganizations, getAdminPayments, getHealthRisks } from "@/lib/actions/admin";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { days?: string };
}) {
  const days = searchParams.days ? parseInt(searchParams.days, 10) : undefined;

  const [initialMetrics, organizations, payments, risks] = await Promise.all([
    getAdminMetrics(0, days),
    getAdminOrganizations(days),
    getAdminPayments(days),
    getHealthRisks(days)
  ]);

  return (
    <AdminDashboardClient 
      initialMetrics={initialMetrics}
      organizations={organizations}
      payments={payments}
      risks={risks}
      currentDays={days}
    />
  );
}
