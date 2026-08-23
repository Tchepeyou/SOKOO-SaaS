"use client";

import { useState, useEffect, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Sale } from "@/lib/db";
import { ReceiptText, Search, Calendar, ChevronRight, X, Printer, Wallet, Smartphone, CreditCard, Banknote, ShoppingCart } from "lucide-react";
import { Receipt } from "@/components/dashboard/Receipt";

import { useLocation } from "@/lib/contexts/LocationContext";
import { cn } from "@/lib/utils";

export default function SalesPage() {
  const { activeLocationId } = useLocation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const allSales = useLiveQuery(() => {
    if (activeLocationId) {
      return db.sales.where('locationId').equals(activeLocationId).reverse().sortBy('timestamp');
    }
    return [];
  }, [activeLocationId]) || [];
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMethod, setFilterMethod] = useState<string>("Toutes");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const { todayRevenue, todaySalesCount, averageBasket } = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysSales = allSales.filter(s => s.date.startsWith(today));
    
    const revenue = todaysSales.reduce((sum, s) => sum + s.total, 0);
    const count = todaysSales.length;
    
    return {
      todayRevenue: revenue,
      todaySalesCount: count,
      averageBasket: count > 0 ? Math.round(revenue / count) : 0
    };
  }, [allSales]);

  const filteredSales = allSales.filter(sale => {
    const matchesSearch = sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sale.user.toLowerCase().includes(searchQuery.toLowerCase());
    const method = sale.paymentMethod || "Espèces";
    const matchesMethod = filterMethod === "Toutes" || method === filterMethod;
    return matchesSearch && matchesMethod;
  });

  const getPaymentIcon = (method?: string) => {
    switch(method) {
      case "Mobile Money": return <Smartphone className="w-4 h-4" />;
      case "Carte": return <CreditCard className="w-4 h-4" />;
      case "Espèces": 
      default: return <Banknote className="w-4 h-4" />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isMounted) {
    return <div className="p-8 text-center text-slate-500">Chargement de l'historique...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden print:h-auto print:overflow-visible relative">
      
      {/* Hidden Receipt for Printing */}
      {selectedSale && (
        <div className="hidden print:block">
          <Receipt 
            saleId={selectedSale.id}
            cart={selectedSale.items}
            subtotal={selectedSale.subtotal}
            discount={selectedSale.discount}
            total={selectedSale.total}
            date={selectedSale.date}
            user={selectedSale.user}
          />
        </div>
      )}

      <div className="mb-6 shrink-0 print:hidden space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Historique des Ventes</h2>
          <p className="text-slate-500">Consultez et réimprimez vos tickets de caisse.</p>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">CA d'Aujourd'hui</p>
              <p className="text-xl font-bold text-slate-900">{todayRevenue.toLocaleString()} FCFA</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Panier Moyen</p>
              <p className="text-xl font-bold text-slate-900">{averageBasket.toLocaleString()} FCFA</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <ReceiptText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Ventes d'Aujourd'hui</p>
              <p className="text-xl font-bold text-slate-900">{todaySalesCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0 print:hidden">
        
        {/* Left Side: Sales List */}
        <div className={cn(
          "flex-1 flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-0",
          selectedSale ? "hidden lg:flex" : "flex"
        )}>
          <div className="p-4 border-b border-slate-100 shrink-0 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher par ID ou vendeur..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <select 
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="py-2.5 px-4 bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue text-slate-700 font-medium"
            >
              <option value="Toutes">Toutes les méthodes</option>
              <option value="Espèces">Espèces</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Carte">Carte bancaire</option>
            </select>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
            <div className="space-y-3">
              {filteredSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10">
                  <ReceiptText className="w-12 h-12 mb-3 text-slate-300" />
                  <p>Aucune vente trouvée.</p>
                </div>
              ) : (
                filteredSales.map(sale => {
                  const dateObj = new Date(sale.date);
                  const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
                  const formattedTime = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <button
                      key={sale.id}
                      onClick={() => setSelectedSale(sale)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                        selectedSale?.id === sale.id 
                          ? "bg-blue-50 border-brand-blue ring-1 ring-brand-blue" 
                          : "bg-white border-slate-200 hover:border-brand-blue hover:shadow-md group"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${selectedSale?.id === sale.id ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500 group-hover:bg-brand-blue/10 group-hover:text-brand-blue"}`}>
                          <ReceiptText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900">#{sale.id.split('-')[0].toUpperCase()}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Réglé</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Calendar className="w-4 h-4" />
                            {formattedDate} à {formattedTime} • par {sale.user}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-slate-600 bg-slate-100 w-fit px-2 py-0.5 rounded-md">
                            {getPaymentIcon(sale.paymentMethod)}
                            {sale.paymentMethod || "Espèces"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-black text-lg text-brand-dark">{sale.total.toLocaleString()} FCFA</p>
                          <p className="text-xs text-slate-400">{sale.items.length} article(s)</p>
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-transform ${selectedSale?.id === sale.id ? "text-brand-blue" : "text-slate-300 group-hover:text-brand-blue group-hover:translate-x-1"}`} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Sale Details */}
        <div className={cn(
          "w-full lg:w-[400px] flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-0 shrink-0",
          !selectedSale ? "hidden lg:flex" : "flex flex-1"
        )}>
          {selectedSale ? (
            <>
              <div className="p-4 border-b border-slate-100 bg-brand-dark text-white flex items-center justify-between shrink-0">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  Détail du Ticket
                </h3>
                <button onClick={() => setSelectedSale(null)} className="lg:hidden text-slate-300 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 bg-slate-50/30">
                <div className="text-center mb-6">
                  <p className="text-sm font-semibold text-slate-500">TICKET #{selectedSale.id.split('-')[0].toUpperCase()}</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">{selectedSale.total.toLocaleString()} FCFA</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {new Date(selectedSale.date).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2">Articles ({selectedSale.items.length})</h4>
                  <div className="space-y-3">
                    {selectedSale.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{item.productName}</p>
                          <p className="text-xs text-slate-500">{item.quantity} x {item.price.toLocaleString()} FCFA</p>
                        </div>
                        <p className="font-semibold text-slate-900 text-sm">{item.total.toLocaleString()} FCFA</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 space-y-2 border-t border-slate-200 pt-4 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Sous-total</span>
                    <span>{selectedSale.subtotal.toLocaleString()} FCFA</span>
                  </div>
                  {selectedSale.discount > 0 && (
                    <div className="flex justify-between text-orange-500">
                      <span>Remise</span>
                      <span>- {selectedSale.discount.toLocaleString()} FCFA</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500 items-center">
                    <span>Mode de Paiement</span>
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      {getPaymentIcon(selectedSale.paymentMethod)}
                      {selectedSale.paymentMethod || "Espèces"}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-base pt-2">
                    <span>Total Payé</span>
                    <span>{selectedSale.total.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <button 
                  onClick={handlePrint}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                >
                  <Printer className="w-5 h-5" />
                  Réimprimer le ticket
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
              <ReceiptText className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-600 mb-1">Aucun ticket sélectionné</p>
              <p className="text-sm">Cliquez sur une vente dans la liste pour voir les détails et réimprimer le ticket.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
