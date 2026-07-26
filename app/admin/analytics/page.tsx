import { createAdminClient } from "@/lib/supabase/admin";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Users, TrendingUp, Store, Activity } from 'lucide-react';

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

  const growthData = [
    { name: 'Jan', boutiques: 40, revenus: 2400 },
    { name: 'Fév', boutiques: 65, revenus: 4300 },
    { name: 'Mar', boutiques: 85, revenus: 6800 },
    { name: 'Avr', boutiques: 120, revenus: 9500 },
    { name: 'Mai', boutiques: 165, revenus: 13000 },
    { name: 'Jui', boutiques: boutiquesCount || 210, revenus: 18500 },
  ];

  const activityData = [
    { day: 'Lun', active: 145 },
    { day: 'Mar', active: 180 },
    { day: 'Mer', active: 195 },
    { day: 'Jeu', active: 185 },
    { day: 'Ven', active: 200 },
    { day: 'Sam', active: 150 },
    { day: 'Dim', active: 95 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Statistiques Globales</h2>
        <p className="text-sm text-slate-500 mt-1">Analyse détaillée des performances de Sokoo SaaS.</p>
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
          <h3 className="text-lg font-bold text-slate-900 mb-6">Évolution des Inscriptions (Démo)</h3>
          <div className="h-[300px] w-full bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">Graphique dynamique bientôt disponible</p>
          </div>
        </div>

        {/* Activité Hebdomadaire */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Transactions par Jour (Démo)</h3>
          <div className="h-[300px] w-full bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">Graphique dynamique bientôt disponible</p>
          </div>
        </div>
      </div>
    </div>
  );
}
