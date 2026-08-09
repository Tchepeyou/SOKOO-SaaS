import { getAdminMetrics, getAdminOrganizations, getAdminPayments, getHealthRisks } from "@/lib/actions/admin";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage() {
  const [initialMetrics, organizations, payments, risks] = await Promise.all([
    getAdminMetrics(0),
    getAdminOrganizations(),
    getAdminPayments(),
    getHealthRisks()
  ]);

  return (
    <AdminDashboardClient 
      initialMetrics={initialMetrics}
      organizations={organizations}
      payments={payments}
      risks={risks}
    />
  );
}
