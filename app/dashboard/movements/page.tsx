"use client";

import { Search, Filter, ArrowUpRight, ArrowDownRight, Download, X } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useState, useRef, useEffect } from "react";

export default function MovementsPage() {
  const allMovements = useLiveQuery(() => db.movements.orderBy('timestamp').reverse().toArray()) || [];
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "in" | "out">("all");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMovements = allMovements.filter((movement) => {
    const matchesSearch = movement.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          movement.user.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || movement.type === filterType;

    return matchesSearch && matchesType;
  });

  const handleExportCSV = () => {
    if (filteredMovements.length === 0) {
      alert("Aucune donnée à exporter.");
      return;
    }

    const headers = ["Date", "Type", "Produit", "Quantité", "Utilisateur"];
    
    const rows = filteredMovements.map(m => {
      const isOut = m.type === "out";
      const dateObj = new Date(m.date);
      const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      // Escape commas/quotes in strings for CSV
      const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
      return [
        escapeCsv(formattedDate),
        escapeCsv(isOut ? "Sortie" : "Entrée"),
        escapeCsv(m.productName),
        escapeCsv(isOut ? `-${m.quantity}` : `+${m.quantity}`),
        escapeCsv(m.user)
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mouvements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Historique des Mouvements</h2>
          <p className="text-slate-500">Toutes les entrées, sorties et ajustements de stock.</p>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-brand-blue/90 transition-colors w-full sm:w-auto justify-center">
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 rounded-t-2xl">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par produit ou utilisateur..." 
              className="w-full pl-10 pr-4 py-2 border-0 ring-1 ring-inset ring-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue bg-white"
            />
          </div>
          
          <div className="relative w-full sm:w-auto" ref={filterRef}>
            <button 
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="flex items-center gap-2 text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center"
            >
              <Filter className="w-4 h-4" />
              Filtres {filterType !== 'all' && <span className="bg-brand-blue text-white w-2 h-2 rounded-full inline-block ml-1"></span>}
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-full sm:w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type de mouvement</div>
                <button 
                  onClick={() => { setFilterType("all"); setIsFilterDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${filterType === 'all' ? 'bg-blue-50 text-brand-blue font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  Tous les mouvements
                </button>
                <button 
                  onClick={() => { setFilterType("in"); setIsFilterDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${filterType === 'in' ? 'bg-blue-50 text-brand-blue font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  Entrées uniquement
                </button>
                <button 
                  onClick={() => { setFilterType("out"); setIsFilterDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${filterType === 'out' ? 'bg-blue-50 text-brand-blue font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  Sorties uniquement
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4 text-right">Quantité</th>
                <th className="px-6 py-4">Utilisateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    {allMovements.length === 0 
                      ? "Aucun mouvement enregistré pour l'instant."
                      : "Aucun mouvement ne correspond à votre recherche."}
                  </td>
                </tr>
              ) : (
                filteredMovements.map((movement) => {
                  const isOut = movement.type === "out";
                  const dateObj = new Date(movement.date);
                  const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ', ' + dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <tr key={movement.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-500">{formattedDate}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${isOut ? 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20' : 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'}`}>
                          {isOut ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {isOut ? 'Sortie' : 'Entrée'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{movement.productName}</td>
                      <td className={`px-6 py-4 text-right font-bold ${isOut ? 'text-red-600' : 'text-green-600'}`}>
                        {isOut ? '-' : '+'}{movement.quantity}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {movement.user}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
