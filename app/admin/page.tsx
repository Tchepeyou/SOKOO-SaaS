import { getAdminMetrics, getAdminOrganizations, getAdminPayments, getHealthRisks } from "@/lib/actions/admin";
import AdminDashboardClient from "./AdminDashboardClient";
import { Suspense } from "react";

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
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <AdminDashboardClient 
        initialMetrics={initialMetrics}
        organizations={organizations}
        payments={payments}
        risks={risks}
        currentDays={days}
      />
    </Suspense>
  );
}
