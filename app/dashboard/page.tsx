"use client";

import StatCard from "@/components/dashboard/StatCard";
import { Package, AlertTriangle, TrendingUp, ArchiveX, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const mockChartData = [
  { name: "Lun", ventes: 40 },
  { name: "Mar", ventes: 30 },
  { name: "Mer", ventes: 55 },
  { name: "Jeu", ventes: 45 },
  { name: "Ven", ventes: 80 },
  { name: "Sam", ventes: 110 },
  { name: "Dim", ventes: 90 },
];



export default function DashboardPage() {
  const products = useLiveQuery(() => db.products.toArray()) || [];
  const recentMovements = useLiveQuery(() => db.movements.orderBy('timestamp').reverse().limit(5).toArray()) || [];

  const inStockCount = products.filter(p => p.stock > 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Tableau de Bord</h2>
        <p className="text-slate-500">Voici l'état de votre stock aujourd'hui.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Produits en stock"
          value={inStockCount.toString()}
          icon={Package}
          variant="blue"
          description="Produits disponibles"
        />
        <StatCard
          title="Ventes du jour"
          value="45"
          icon={TrendingUp}
          variant="green"
          description="En hausse de 10%"
        />
        <StatCard
          title="Stock Faible"
          value={lowStockCount.toString()}
          icon={AlertTriangle}
          variant="orange"
          description="Moins de 10 unités"
        />
        <StatCard
          title="En Rupture"
          value={outOfStockCount.toString()}
          icon={ArchiveX}
          variant="red"
          description="Action requise"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Chart section */}
        <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 flex flex-col relative overflow-hidden">
          {/* Subtle background flair */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-blue/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">Évolution des ventes</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Aperçu des 7 derniers jours</p>
            </div>
            <div className="bg-green-50 text-green-600 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center gap-1 border border-green-100 shadow-sm">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              +15%
            </div>
          </div>
          
          <div className="h-56 sm:h-72 w-full relative z-10 -ml-4 sm:ml-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="ventes" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVentes)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent movements */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 flex flex-col">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-6">Mouvements Récents</h3>
          <div className="flex-1 overflow-y-auto pr-1 sm:pr-2">
            <ul className="space-y-4">
              {recentMovements.length === 0 ? (
                <li className="text-center py-4 text-slate-500">Aucun mouvement récent.</li>
              ) : (
                recentMovements.map((movement) => {
                  const dateObj = new Date(movement.date);
                  const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ', ' + dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <li key={movement.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-full",
                          movement.type === "in" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                        )}>
                          {movement.type === "in" ? <TrendingUp className="h-4 w-4" /> : <ArchiveX className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{movement.productName}</p>
                          <p className="text-sm text-slate-500">{formattedDate}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "font-bold",
                        movement.type === "in" ? "text-green-600" : "text-red-600"
                      )}>
                        {movement.type === "in" ? "+" : "-"}{movement.quantity}
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
          <Link 
            href="/dashboard/movements"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-slate-600 hover:text-brand-blue bg-slate-50 hover:bg-brand-blue/5 rounded-xl transition-colors group"
          >
            Voir tout l'historique
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
