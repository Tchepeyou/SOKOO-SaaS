"use client";

import { useState, useMemo, useEffect } from "react";
import StatCard from "@/components/dashboard/StatCard";
import { BarChart3, TrendingUp, ShoppingBag, PiggyBank, Calendar, Trophy, Download } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useLocation } from "@/lib/contexts/LocationContext";
import { db } from "@/lib/db";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ReportsPage() {
  const { activeLocationId } = useLocation();
  const [isMounted, setIsMounted] = useState(false);
  
  // Initialize to current month (e.g. "2024-05")
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const allSales = useLiveQuery(() => {
    if (activeLocationId) {
      return db.sales.where('locationId').equals(activeLocationId).toArray();
    }
    return [];
  }, [activeLocationId]) || [];

  const allProducts = useLiveQuery(() => {
    if (activeLocationId) {
      return db.products.where('locationId').equals(activeLocationId).toArray();
    }
    return [];
  }, [activeLocationId]) || [];

  // Generate options for the last 12 months
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return options;
  }, []);

  // Filter sales by selected month
  const monthlySales = useMemo(() => {
    return allSales.filter(sale => sale.date.startsWith(selectedMonth));
  }, [allSales, selectedMonth]);

  // Compute metrics
  const totalRevenue = monthlySales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalTransactions = monthlySales.length;
  const averageTicket = totalTransactions > 0 ? (totalRevenue / totalTransactions) : 0;

  // Compute estimated profit and best products
  const { estimatedProfit, topProducts } = useMemo(() => {
    let profit = 0;
    const productStats: Record<string, { name: string, quantity: number, revenue: number }> = {};

    // Create a map of product purchase prices for quick lookup
    const productCosts: Record<string, number> = {};
    allProducts.forEach(p => {
      productCosts[p.id] = p.purchasePrice || 0;
    });

    monthlySales.forEach(sale => {
      sale.items.forEach(item => {
        // Profit calculation
        const cost = productCosts[item.productId] || 0;
        const itemRevenue = item.price * item.quantity;
        const itemCost = cost * item.quantity;
        profit += (itemRevenue - itemCost);

        // Top products calculation
        if (!productStats[item.productId]) {
          productStats[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
        }
        productStats[item.productId].quantity += item.quantity;
        productStats[item.productId].revenue += itemRevenue;
      });
    });

    // Discount reduction from profit (assuming discount comes out of profit)
    const totalDiscounts = monthlySales.reduce((sum, sale) => sum + (sale.discount || 0), 0);
    profit -= totalDiscounts;

    const sortedProducts = Object.values(productStats).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

    return { estimatedProfit: profit, topProducts: sortedProducts };
  }, [monthlySales, allProducts]);

  // Generate chart data for the selected month (daily sales)
  const chartData = useMemo(() => {
    const data = [];
    const [year, month] = selectedMonth.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${selectedMonth}-${String(day).padStart(2, '0')}`;
      
      const salesOnDate = monthlySales.filter(s => s.date.startsWith(dateString));
      const dailyRevenue = salesOnDate.reduce((sum, s) => sum + (s.total || 0), 0);
      
      data.push({
        name: String(day),
        date: dateString,
        ca: dailyRevenue
      });
    }
    return data;
  }, [monthlySales, selectedMonth]);

  if (!isMounted) {
    return <div className="p-8 text-center text-slate-500">Chargement des rapports...</div>;
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 });
  };

  return (
    <div className="report-container space-y-8 pb-8 print:space-y-6 print:pb-0 print:bg-white">
      
      {/* En-tête d'impression (visible uniquement à l'impression) */}
      <div className="hidden print:flex flex-col border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Rapport d'Activité</h1>
            <p className="text-base text-slate-500 mt-1 font-medium">Sokoo - Solution de Gestion</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">Période : {monthOptions.find(o => o.value === selectedMonth)?.label}</p>
            <p className="text-xs text-slate-500 mt-1">Édité le {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 print:hidden">
        <div>
          <h2 className="text-[32px] sm:text-[40px] font-normal text-slate-900 tracking-tight flex items-center gap-2">
            Rapports <BarChart3 className="h-8 w-8 text-brand-blue" />
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Analysez les performances de votre boutique.
          </p>
        </div>
        
        <div className="flex items-center gap-3 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
          >
            <Download className="h-4 w-4" />
            Exporter (PDF)
          </button>
          
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <Calendar className="h-5 w-5 text-slate-400" />
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
            >
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-4 print:w-full">
        <StatCard
          title="Chiffre d'Affaires"
          value={formatCurrency(totalRevenue)}
          icon={TrendingUp}
          variant="green"
          description="Total encaissé"
        />
        <StatCard
          title="Ventes réalisées"
          value={totalTransactions.toString()}
          icon={ShoppingBag}
          variant="blue"
          description="Nombre de reçus"
        />
        <StatCard
          title="Panier moyen"
          value={formatCurrency(averageTicket)}
          icon={BarChart3}
          variant="orange"
          description="Moyenne par vente"
        />
        <StatCard
          title="Bénéfice brut estimé"
          value={formatCurrency(estimatedProfit > 0 ? estimatedProfit : 0)}
          icon={PiggyBank}
          variant="purple"
          description="Basé sur le prix d'achat"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:flex print:flex-col print:gap-8">
        {/* Évolution du CA (Graphique) */}
        <div className="lg:col-span-2 bg-[#f8f9fa] rounded-[24px] p-4 sm:p-6 flex flex-col relative overflow-hidden print:bg-white print:border print:border-slate-200 print:break-inside-avoid print:shadow-none">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-blue/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none print:hidden" />
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">Évolution du Chiffre d'Affaires</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Données journalières pour le mois sélectionné</p>
            </div>
          </div>
          
          <div className="h-64 sm:h-80 w-full relative z-10 print:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), 'CA']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const dateStr = payload[0].payload.date;
                      const dateObj = new Date(dateStr);
                      return dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
                    }
                    return label;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="ca" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCa)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Meilleurs produits */}
        <div className="bg-[#f8f9fa] rounded-[24px] p-4 sm:p-6 flex flex-col print:bg-white print:border print:border-slate-200 print:break-inside-avoid print:shadow-none">
          <div className="flex items-center gap-2 mb-6 print:mb-4">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Meilleures Ventes</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-1 print:overflow-visible">
            <ul className="space-y-4 print:space-y-3">
              {topProducts.length === 0 ? (
                <li className="text-center py-8 text-slate-500 bg-white rounded-xl border border-slate-100">
                  Aucune donnée pour ce mois.
                </li>
              ) : (
                topProducts.map((product, index) => (
                  <li key={index} className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow print:shadow-none print:border-slate-200 print:py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.quantity} unités vendues</p>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 text-sm text-right pl-2">
                      {formatCurrency(product.revenue)}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
