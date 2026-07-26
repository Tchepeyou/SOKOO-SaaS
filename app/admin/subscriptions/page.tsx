import { createAdminClient } from "@/lib/supabase/admin";
import { CreditCard, TrendingUp, Download, CheckCircle, Clock } from "lucide-react";

export const metadata = {
  title: "Abonnements | Sokoo Admin",
};

export default async function AdminSubscriptionsPage() {
  const supabase = createAdminClient();

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select(`
      id,
      plan,
      status,
      created_at,
      current_period_end,
      organizations (
        name
      )
    `)
    .order('created_at', { ascending: false });

  // Calculate MRR
  let mrr = 0;
  let activeCount = 0;
  
  const planPrices: Record<string, number> = {
    "Starter": 5000,
    "Pro": 15000,
    "Enterprise": 50000
  };

  const planCounts: Record<string, number> = {};

  if (subscriptions) {
    subscriptions.forEach(sub => {
      if (sub.status === "Actif") {
        activeCount++;
        mrr += planPrices[sub.plan] || 0;
      }
      planCounts[sub.plan] = (planCounts[sub.plan] || 0) + 1;
    });
  }

  // Find popular plan
  let popularPlan = "Aucun";
  let maxCount = 0;
  Object.entries(planCounts).forEach(([plan, count]) => {
    if (count > maxCount) {
      popularPlan = plan;
      maxCount = count;
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Revenus & Abonnements</h2>
          <p className="text-sm text-slate-500 mt-1">Gérez les abonnements des boutiques à la plateforme Sokoo.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all">
          <Download className="w-4 h-4" />
          Exporter le rapport
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
            <CreditCard className="w-24 h-24 text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">MRR (Revenu Mensuel)</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{mrr.toLocaleString()} FCFA</p>
          <div className="flex items-center gap-2 mt-4 text-sm font-medium text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            <span>À jour</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Abonnements Actifs</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{activeCount}</p>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm bg-gradient-to-br from-brand-dark to-slate-900 text-white">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Plan Populaire</h3>
          <p className="text-3xl font-bold text-white mt-2">{popularPlan}</p>
          <p className="text-sm text-slate-400 mt-4">Le plus choisi par vos clients.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-900">Dernières Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-500">ID</th>
                <th className="px-6 py-4 font-semibold text-slate-500">Boutique</th>
                <th className="px-6 py-4 font-semibold text-slate-500">Forfait</th>
                <th className="px-6 py-4 font-semibold text-slate-500">Montant</th>
                <th className="px-6 py-4 font-semibold text-slate-500">Date</th>
                <th className="px-6 py-4 font-semibold text-slate-500">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subscriptions && subscriptions.length > 0 ? subscriptions.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-400 text-xs">{sub.id.substring(0,8)}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{sub.organizations?.name || "Inconnu"}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-semibold">
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {planPrices[sub.plan] ? `${planPrices[sub.plan].toLocaleString()} FCFA` : "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(sub.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    {sub.status === "Actif" && (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
                        <CheckCircle className="w-4 h-4" /> Actif
                      </span>
                    )}
                    {sub.status === "En attente" && (
                      <span className="inline-flex items-center gap-1.5 text-amber-500 font-medium text-xs">
                        <Clock className="w-4 h-4" /> En attente
                      </span>
                    )}
                    {sub.status === "Expiré" && (
                      <span className="inline-flex items-center gap-1.5 text-red-500 font-medium text-xs">
                        <div className="w-2 h-2 rounded-full bg-red-500" /> Expiré
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Aucun abonnement trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
