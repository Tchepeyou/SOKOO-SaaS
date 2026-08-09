"use client";

import { useState, useMemo } from "react";
import { 
  Building2, 
  Users, 
  CreditCard, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Download,
  RefreshCw,
  MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

const sparklineData1 = [{ value: 10 }, { value: 20 }, { value: 15 }, { value: 30 }, { value: 25 }, { value: 40 }, { value: 35 }, { value: 50 }, { value: 45 }];
const sparklineData2 = [{ value: 50 }, { value: 40 }, { value: 45 }, { value: 30 }, { value: 35 }, { value: 20 }, { value: 25 }, { value: 15 }, { value: 10 }];
const sparklineData3 = [{ value: 10 }, { value: 15 }, { value: 12 }, { value: 20 }, { value: 18 }, { value: 25 }, { value: 22 }, { value: 30 }, { value: 28 }];

const COLORS = ['#2563EB', '#F59E0B', '#10B981'];

export default function AdminDashboardClient({ initialMetrics, organizations, payments, risks }: any) {
  // Use today's date for the date picker mock
  const today = new Date();
  const dateStr = today.toLocaleDateString("fr-FR", { month: 'short', day: 'numeric', year: 'numeric' });

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
      // Show 0 if no organizations
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
    <div className="space-y-6 pb-12">
      {/* Top Actions Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => toast.info("Le filtrage par date globale sera disponible prochainement.")}
        >
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">1 Jan, 2024 - {dateStr}</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </button>
          <button 
            type="button"
            onClick={() => toast.info("Module de création de campagne Email/Marketing en cours de développement.")}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-600/20 transition-colors text-sm font-medium"
          >
            Créer une campagne
          </button>
        </div>
      </div>

      {/* Row 1: Sparkline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SparklineCard 
          title="Organisations Totales" 
          value={initialMetrics.totalOrgs?.toLocaleString("fr-FR") || "0"}
          percent={initialMetrics.totalOrgs > 0 ? "+12.5%" : "0%"}
          trend={initialMetrics.totalOrgs > 0 ? "up" : "down"}
          data={sparklineData1}
          color="#2563EB"
        />
        <SparklineCard 
          title="Nouveaux Clients (Mois)" 
          value={initialMetrics.newCustomersThisMonth?.toLocaleString("fr-FR") || "0"}
          percent={initialMetrics.newCustomersThisMonth > 0 ? "+22.4%" : "0%"}
          trend={initialMetrics.newCustomersThisMonth > 0 ? "up" : "down"}
          data={sparklineData3}
          color="#2563EB"
        />
        <SparklineCard 
          title="Revenu Mensuel (MRR)" 
          value={`${initialMetrics.mrr?.toLocaleString("fr-FR") || "0"} FCFA`}
          percent={initialMetrics.mrr > 0 ? "+5.5%" : "0%"}
          trend={initialMetrics.mrr > 0 ? "up" : "down"}
          data={sparklineData2}
          color="#2563EB"
        />
      </div>

      {/* Row 2: Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Horizontal Bar Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-slate-900">Sources d'Acquisition</h2>
            <div className="flex gap-2">
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md cursor-pointer hover:text-slate-900">Mois</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md cursor-pointer">Semaine</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <ProgressBar label="Recherche Google" value={0} max={50000} color="bg-green-500" />
            <ProgressBar label="Réseaux Sociaux" value={0} max={50000} color="bg-yellow-400" />
            <ProgressBar label="Bouche à oreille" value={0} max={50000} color="bg-blue-600" />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-2 px-1">
              <span>10k</span>
              <span>20k</span>
              <span>30k</span>
              <span>40k</span>
              <span>50k</span>
            </div>
          </div>
        </div>

        {/* Large Area Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Évolution du MRR</h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900">{initialMetrics.mrr?.toLocaleString("fr-FR") || "0"} <span className="text-sm font-medium text-slate-500">FCFA</span></span>
                <span className={`text-xs font-semibold flex items-center ${initialMetrics.mrr > 0 ? "text-green-600" : "text-slate-400"}`}>
                  <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={initialMetrics.mrr > 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M5 12h14"} />
                  </svg>
                  {initialMetrics.mrr > 0 ? "5.5%" : "0%"}
                </span>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
          </div>
          <div className="h-48 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={initialMetrics.chartData || sparklineData1} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMRRLarge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey={initialMetrics.mrr > 0 ? "MRR" : "value"} stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorMRRLarge)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-bold text-slate-900">Profils Clients</h2>
            <span className="text-xs font-medium text-blue-600 cursor-pointer hover:underline">Détails</span>
          </div>
          <div className="flex-1 relative flex items-center justify-center">
            {totalClients > 0 ? (
              <div className="h-40 w-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[pieData.findIndex(p => p.name === entry.name) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-slate-400 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center mb-2">
                  <span className="text-xs">Aucun Client</span>
                </div>
              </div>
            )}
          </div>
          <div className="mt-2 space-y-2">
            {pieData.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                  <span className="text-slate-500 font-medium">{entry.name}</span>
                </div>
                <span className="font-bold text-slate-900">
                  {totalClients > 0 ? ((entry.value / totalClients) * 100).toFixed(1) : "0.0"}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Table and List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-slate-900">Dernières Organisations</h2>
            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100">
                  <th className="pb-3 font-medium">Nom de l'organisation</th>
                  <th className="pb-3 font-medium">Création</th>
                  <th className="pb-3 font-medium">Statut</th>
                  <th className="pb-3 font-medium text-right">Produits</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50">
                {organizations?.slice(0, 5).map((org: any) => (
                  <tr key={org.id} className="group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                          {org.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900">{org.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 font-medium">{new Date(org.created_at).toLocaleDateString("fr-FR", { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        org.subscription_status === 'active' ? 'bg-green-100 text-green-700' :
                        org.subscription_status === 'trialing' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {org.subscription_status || 'Trial'}
                      </span>
                    </td>
                    <td className="py-4 text-slate-900 font-bold text-right">{org.products?.[0]?.count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Rating equivalent -> Risks List */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-slate-900">Alerte Rétention</h2>
            <span className="text-xs font-medium text-blue-600 cursor-pointer hover:underline">Voir tout</span>
          </div>
          
          <div className="space-y-4">
            {risks?.slice(0, 5).map((risk: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 font-bold text-xs uppercase">
                    {risk.orgName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{risk.orgName}</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 truncate max-w-[120px]">
                      {risk.type === "TRIAL_ENDING" && "Fin d'essai proche"}
                      {risk.type === "INACTIVE_CLIENT" && `${risk.daysInactive}j inactif`}
                      {risk.type === "NO_ACTIVITY_YET" && "Aucune activité"}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                  À Risque
                </span>
              </div>
            ))}
            {(!risks || risks.length === 0) && (
              <div className="text-center text-sm text-slate-500 py-8">Aucune alerte en cours</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Subcomponents

function SparklineCard({ title, value, percent, trend, data, color }: any) {
  const isUp = trend === "up";
  // Fix for SVG gradient ID (cannot contain spaces)
  const gradId = `grad-${title.replace(/[\s\W]+/g, '-')}`;
  
  return (
    <div className="bg-white p-5 md:p-6 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60 flex items-center justify-between group hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
      <div>
        <p className="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{title}</p>
        <p className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{value}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <div className={`flex items-center justify-center w-5 h-5 rounded-full ${isUp ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={isUp ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </div>
          <span className={`text-[11px] font-bold ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>{percent}</span>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, max, color }: any) {
  const percentage = (value / max) * 100;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-bold text-slate-700">{label}</span>
        <span className="text-xs font-bold text-slate-400">{value.toLocaleString("fr-FR")}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
