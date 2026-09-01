import { createAdminClient } from "@/lib/supabase/admin";
import { Users, TrendingUp, Store, Activity } from 'lucide-react';
import { GrowthChart, ActivityChart } from './AnalyticsChartsClient';
import { getAdminMetrics } from "@/lib/actions/admin";
import ExportPDFButton from "@/components/admin/ExportPDFButton";

export const metadata = {
  title: "Statistiques | Sokoo Admin",
};

export default async function AdminAnalyticsPage() {
  const supabase = createAdminClient();

  // Get total organizations
  const { count: boutiquesCount } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true });

  // Get total users
  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Get total sales
  const { count: salesCount } = await supabase
    .from('sales')
    .select('*', { count: 'exact', head: true });

  // Fetch dynamic metrics for charts
  const { chartData, activityData } = await getAdminMetrics();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Statistiques Globales</h2>
          <p className="text-sm text-slate-500 mt-1">Analyse détaillée des performances de Sokoo SaaS.</p>
        </div>
        <ExportPDFButton />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Boutiques Totales</p>
            <p className="text-2xl font-bold text-slate-900">{boutiquesCount || 0}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Utilisateurs Inscrits</p>
            <p className="text-2xl font-bold text-slate-900">{usersCount || 0}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Transactions Réalisées</p>
            <p className="text-2xl font-bold text-slate-900">{salesCount || 0}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Croissance Globale</p>
            <p className="text-2xl font-bold text-slate-900">+100%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Croissance Boutiques */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Évolution des Inscriptions</h3>
          <GrowthChart data={chartData} />
        </div>

        {/* Activité Hebdomadaire */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Transactions par Jour</h3>
          <ActivityChart data={activityData} />
        </div>
      </div>
    </div>
  );
}
