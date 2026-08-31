"use client";

import StatCard from "@/components/dashboard/StatCard";
import { Package, AlertTriangle, TrendingUp, ArchiveX, ArrowRight, ShoppingCart, ArrowRightLeft, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { useLocation } from "@/lib/contexts/LocationContext";
import { db } from "@/lib/db";
import { useMemo, useState, useEffect } from "react";
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

export default function DashboardPage() {
  const { activeLocationId } = useLocation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const products = useLiveQuery(() => {
    if (activeLocationId) {
      return db.products.where('locationId').equals(activeLocationId).toArray();
    }
    return [];
  }, [activeLocationId]) || [];

  const recentMovements = useLiveQuery(() => {
    if (activeLocationId) {
      return db.movements.where('locationId').equals(activeLocationId).reverse().sortBy('timestamp').then(arr => arr.slice(0, 5));
    }
    return [];
  }, [activeLocationId]) || [];

  const allSales = useLiveQuery(() => {
    if (activeLocationId) {
      return db.sales.where('locationId').equals(activeLocationId).toArray();
    }
    return [];
  }, [activeLocationId]) || [];

  const inStockCount = products.filter(p => p.stock > 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  // Calculate today's sales
  const todaySalesCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return allSales.filter(s => s.date.startsWith(today)).length;
  }, [allSales]);

  // Generate chart data for the last 7 days
  const chartData = useMemo(() => {
    const data = [];
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      
      const salesOnDate = allSales.filter(s => s.date.startsWith(dateString)).length;
      
      data.push({
        name: days[d.getDay()],
        ventes: salesOnDate
      });
    }
    return data;
  }, [allSales]);

  if (!isMounted) {
    return <div className="p-8 text-center text-slate-500">Chargement du tableau de bord...</div>;
  }

  const hour = new Date().getHours();
  let greeting = "Bonjour";
  let emoji = "☀️";
  if (hour >= 18) {
    greeting = "Bonsoir";
    emoji = "🌙";
  } else if (hour >= 12) {
    greeting = "Bon après-midi";
    emoji = "🌤️";
  }

  return (
    <div className="space-y-8">
        <div className="flex flex-col gap-6 mb-8 mt-2">
          <div>
            <h2 className="text-[32px] sm:text-[40px] font-normal text-slate-900 flex items-center gap-2 tracking-tight">
              {greeting} <span className="text-3xl">{emoji}</span>
            </h2>
            <p className="text-sm text-slate-500 mt-2 flex items-center gap-1.5">
              <span className="text-yellow-500">💡</span> Voici l'état de votre stock aujourd'hui - prêt à faire des ventes !
            </p>
          </div>
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
          value={todaySalesCount.toString()}
          icon={TrendingUp}
          variant="green"
          description="Opérations de caisse"
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
        <div className="lg:col-span-2 bg-[#f8f9fa] rounded-[24px] p-4 sm:p-6 flex flex-col relative overflow-hidden">
          {/* Subtle background flair */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-blue/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">Évolution des ventes</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Aperçu des 7 derniers jours</p>
            </div>
          </div>
          
          <div className="h-56 sm:h-72 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
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
                  padding={{ left: 15, right: 15 }}
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
        <div className="bg-[#f8f9fa] rounded-[24px] p-4 sm:p-6 flex flex-col">
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
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition-colors group shadow-sm"
          >
            Voir tout l'historique
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
