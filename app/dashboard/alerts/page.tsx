"use client";

import { AlertTriangle, CheckCircle2, PackagePlus, X } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Product } from "@/lib/db";
import { useState } from "react";

export default function AlertsPage() {
  // Get all products that are either out of stock or low stock
  const allAlertProducts = useLiveQuery(
    () => db.products.filter(p => p.status === "Stock Faible" || p.status === "Rupture").toArray()
  ) || [];

  const [ignoredAlertIds, setIgnoredAlertIds] = useState<string[]>([]);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);

  const activeAlerts = allAlertProducts.filter(p => p.id && !ignoredAlertIds.includes(p.id));

  const handleIgnore = (id: string) => {
    // In MVP, we might just mark it as resolved or remove it from view
    console.log("Alerte ignorée:", id);
    setIgnoredAlertIds(prev => [...prev, id]);
  };

  const handleRestockSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!restockProduct || !restockProduct.id) return;

    const formData = new FormData(e.currentTarget);
    const quantity = parseInt(formData.get("quantity") as string, 10);

    if (isNaN(quantity) || quantity <= 0) return;

    const newStock = restockProduct.stock + quantity;
    const newStatus = newStock > 5 ? "En stock" : (newStock > 0 ? "Stock Faible" : "Rupture");

    try {
      await db.transaction('rw', db.products, db.movements, async () => {
        // Update product
        await db.products.update(restockProduct.id!, {
          stock: newStock,
          status: newStatus
        });

        // Add movement
        await db.movements.add({
          productId: restockProduct.id!,
          productName: restockProduct.name,
          type: "in",
          quantity: quantity,
          date: new Date().toISOString(),
          timestamp: Date.now(),
          user: "Moi (Gérant)" // Fallback user name
        });
      });

      setRestockProduct(null);
    } catch (error) {
      console.error("Erreur lors du réapprovisionnement", error);
      alert("Une erreur est survenue lors du réapprovisionnement.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Alertes de Stock</h2>
        <p className="text-slate-500">Consultez les produits en rupture ou sous le seuil d'alerte.</p>
      </div>

      {activeAlerts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeAlerts.map((product) => (
            <div key={product.id} className={`bg-white rounded-2xl p-5 shadow-sm border flex flex-col gap-4 ${product.status === "Rupture" ? "border-red-200" : "border-orange-100"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${product.status === "Rupture" ? "bg-red-100 text-red-600" : "bg-orange-100 text-brand-orange"}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{product.name}</h4>
                    <p className={`text-sm font-medium ${product.status === "Rupture" ? "text-red-500" : "text-orange-500"}`}>
                      {product.status === "Rupture" ? "Rupture de stock (0)" : `Reste ${product.stock} unités`}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => setRestockProduct(product)}
                  className="flex-1 bg-brand-dark text-white py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Commander
                </button>
                <button 
                  onClick={() => handleIgnore(product.id!)}
                  className="flex items-center justify-center gap-1 flex-1 bg-slate-100 text-slate-600 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Ignorer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">Tout va bien !</h3>
          <p className="text-slate-500 mt-1">Vous n'avez aucune alerte de stock pour le moment.</p>
        </div>
      )}

      {/* Restock Modal */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setRestockProduct(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-brand-blue" />
                Réapprovisionner
              </h3>
              <button onClick={() => setRestockProduct(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleRestockSubmit} className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl mb-4">
                <p className="text-sm font-medium text-blue-900">Produit concerné</p>
                <p className="text-lg font-bold text-brand-blue mt-1">{restockProduct.name}</p>
                <p className="text-sm text-blue-700 mt-1">Stock actuel : {restockProduct.stock}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Quantité à ajouter</label>
                <input name="quantity" required type="number" min="1" placeholder="Ex: 50" className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setRestockProduct(null)} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
                  Annuler
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm">
                  Valider l'entrée
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
