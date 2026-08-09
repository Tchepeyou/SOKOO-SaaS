"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { 
  Building2, 
  Users, 
  CreditCard, 
  Activity,
  Calendar,
  RefreshCw,
  MoreHorizontal,
  ChevronDown,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

const sparklineData1 = [{ value: 10 }, { value: 20 }, { value: 15 }, { value: 30 }, { value: 25 }, { value: 40 }, { value: 35 }, { value: 50 }, { value: 45 }];

const COLORS = ['#2563EB', '#F59E0B', '#10B981'];

export default function AdminDashboardClient({ initialMetrics, organizations, payments, risks, currentDays }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);

  const dateOptions = [
    { label: "Aujourd'hui", value: "1" },
    { label: "7 derniers jours", value: "7" },
    { label: "30 derniers jours", value: "30" },
    { label: "90 derniers jours", value: "90" },
    { label: "Tout le temps", value: "0" }
  ];

  const currentOption = dateOptions.find(opt => opt.value === (currentDays?.toString() || "0")) || dateOptions[4];

  const handleDateChange = (days: string) => {
    setIsDateMenuOpen(false);
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (days !== "0") {
        params.set("days", days);
      } else {
        params.delete("days");
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Calculate dynamic pie data from organizations
  const pieData = useMemo(() => {
    let essai = 0;
    let actif = 0;
    let inactif = 0;

    if (organizations && organizations.length > 0) {
      organizations.forEach((org: any) => {
        if (org.subscription_status === 'trialing' || !org.subscription_status) essai++;
        else if (org.subscription_status === 'active') actif++;
        else inactif++;
      });
    } else {
      return [
        { name: 'Essai', value: 0 },
        { name: 'Actif', value: 0 },
        { name: 'Inactif', value: 0 },
      ];
    }

    return [
      { name: 'Essai', value: essai },
      { name: 'Actif', value: actif },
      { name: 'Inactif', value: inactif },
    ];
  }, [organizations]);

  const totalClients = pieData.reduce((a, b) => a + b.value, 0);

  return (
    <div className={`space-y-6 pb-12 transition-opacity duration-300 ${isPending ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
      {/* Top Actions Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
            className="flex items-center justify-between min-w-[200px] gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm cursor-pointer hover:border-slate-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500 group-hover:text-blue-500 transition-colors" />
              <span className="text-sm font-semibold text-slate-700">{currentOption.label}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDateMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDateMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden">
              {dateOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleDateChange(opt.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 ${currentOption.value === opt.value ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => {
               startTransition(() => {
                 router.refresh();
               });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 hover:shadow-md transition-all text-sm font-medium text-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin text-blue-500' : ''}`} />
            <span>Actualiser</span>
          </button>
          <button 
            type="button"
            onClick={() => toast.info("Module de création de campagne Email/Marketing en cours de développement.")}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-all text-sm font-medium"
          >
            Créer une campagne
          </button>
        </div>
      </div>

      {/* Row 1: Sparkline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Organisations" 
          value={initialMetrics.totalOrgs?.toLocaleString("fr-FR") || "0"}
          trend={initialMetrics.totalOrgs > 0 ? "up" : "down"}
          icon={<Building2 className="w-5 h-5 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <MetricCard 
          title="Nouveaux Clients" 
          value={initialMetrics.newCustomersThisMonth?.toLocaleString("fr-FR") || "0"}
          trend={initialMetrics.newCustomersThisMonth > 0 ? "up" : "down"}
          icon={<Users className="w-5 h-5 text-indigo-600" />}
          bgColor="bg-indigo-50"
        />
        <MetricCard 
          title="MRR / Revenus" 
          value={`${initialMetrics.mrr?.toLocaleString("fr-FR") || "0"} FCFA`}
          trend={initialMetrics.mrr > 0 ? "up" : "down"}
          icon={<CreditCard className="w-5 h-5 text-emerald-600" />}
          bgColor="bg-emerald-50"
        />
        <MetricCard 
          title="Taux de Churn" 
          value={`${initialMetrics.churnRate?.toFixed(1) || "0"}%`}
          trend={initialMetrics.churnRate > 5 ? "down" : "up"}
          icon={<Activity className="w-5 h-5 text-rose-600" />}
          bgColor="bg-rose-50"
        />
      </div>

      {/* Row 2: Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Large Area Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Évolution du Revenu</h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{initialMetrics.mrr?.toLocaleString("fr-FR") || "0"} <span className="text-lg font-bold text-slate-400">FCFA</span></span>
              </div>
            </div>
            <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
               <span className="text-xs font-bold text-slate-900 bg-white shadow-sm px-3 py-1.5 rounded-md cursor-pointer">MRR</span>
               <span className="text-xs font-semibold text-slate-500 px-3 py-1.5 rounded-md cursor-pointer hover:text-slate-900 transition-colors">Utilisateurs</span>
            </div>
          </div>
          <div className="h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={initialMetrics.chartData && initialMetrics.chartData.length > 0 ? initialMetrics.chartData : sparklineData1} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMRRPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dx={-10} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} />
                <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="MRR" stroke="#0F172A" strokeWidth={3} fillOpacity={1} fill="url(#colorMRRPremium)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Répartition Clients</h2>
            <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" />
          </div>
          <div className="flex-1 relative flex items-center justify-center min-h-[200px]">
            {totalClients > 0 ? (
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[pieData.findIndex(p => p.name === entry.name) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-slate-400 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center mb-2">
                  <span className="text-xs font-semibold">Aucun Client</span>
                </div>
              </div>
            )}
            {/* Center Text in Donut */}
            {totalClients > 0 && (
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-3xl font-black text-slate-900">{totalClients}</span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
               </div>
            )}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {pieData.map((entry, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-xl flex flex-col items-center justify-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">{entry.name}</span>
                </div>
                <span className="font-black text-slate-900 text-sm">
                  {totalClients > 0 ? ((entry.value / totalClients) * 100).toFixed(0) : "0"}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Table and List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Nouvelles Organisations ({organizations?.length || 0})</h2>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">Voir tout</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-4 pl-2">Organisation</th>
                  <th className="pb-4">Date de Création</th>
                  <th className="pb-4">Statut</th>
                  <th className="pb-4 text-right pr-2">Produits</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50">
                {organizations?.slice(0, 6).map((org: any) => (
                  <tr key={org.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pr-4 pl-2 rounded-l-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-black text-sm uppercase shadow-sm group-hover:bg-white transition-colors">
                          {org.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900">{org.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(org.created_at).toLocaleDateString("fr-FR", { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${
                        org.subscription_status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                        org.subscription_status === 'trialing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {org.subscription_status || 'Trial'}
                      </span>
                    </td>
                    <td className="py-4 text-slate-900 font-black text-right pr-4 rounded-r-xl">{org.products?.[0]?.count || 0}</td>
                  </tr>
                ))}
                {(!organizations || organizations.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm font-medium text-slate-500">
                      Aucune organisation trouvée pour cette période.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risks List */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Alertes Rétention</h2>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600">
              {risks?.length || 0}
            </span>
          </div>
          
          <div className="space-y-4">
            {risks?.slice(0, 6).map((risk: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-rose-100 bg-rose-50/30 hover:bg-rose-50/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-rose-100 shadow-sm flex items-center justify-center text-rose-600 font-black text-sm uppercase">
                    {risk.orgName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{risk.orgName}</p>
                    <p className="text-xs font-semibold text-rose-600 mt-0.5">
                      {risk.type === "TRIAL_ENDING" && `Fin d'essai dans ${risk.daysLeft}j`}
                      {risk.type === "INACTIVE_CLIENT" && `${risk.daysInactive}j inactif`}
                      {risk.type === "NO_ACTIVITY_YET" && "Aucune activité"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {(!risks || risks.length === 0) && (
              <div className="text-center flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-slate-900">Tout va bien !</span>
                <span className="text-xs font-medium text-slate-500 mt-1">Aucune alerte en cours</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Subcomponents

function MetricCard({ title, value, trend, icon, bgColor }: any) {
  const isUp = trend === "up";
  
  return (
    <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden group hover:-translate-y-1">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3.5 rounded-2xl ${bgColor} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={isUp ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
          </svg>
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1.5">{title}</p>
      </div>
    </div>
  );
}
