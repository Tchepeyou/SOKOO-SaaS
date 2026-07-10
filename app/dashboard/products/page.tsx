"use client";

import { Suspense } from "react";

import { Plus, Search, Filter, X, ArrowUpRight, ArrowDownRight, Package, Calendar, ArrowLeft, ChevronDown, Check, Edit } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { useLiveQuery } from "dexie-react-hooks";
import { db, Product, Movement } from "@/lib/db";

function ProductsContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search");
  const rawProducts = useLiveQuery(() => db.products.toArray().then(arr => arr.sort((a, b) => b.createdAt - a.createdAt)));
  const products = rawProducts || [];
  const [searchQuery, setSearchQuery] = useState(urlSearch || "");
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<"in" | "out">("in");
  const [isCreatingNewProduct, setIsCreatingNewProduct] = useState(false);

  // Sync URL search param on load
  useEffect(() => {
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = activeFilter === "Tous" || 
                            (activeFilter === "En stock" && p.stock > 10) ||
                            (activeFilter === "Stock Faible" && p.stock > 0 && p.stock <= 10) ||
                            (activeFilter === "Rupture" && p.stock === 0);
                            
      return matchesSearch && matchesFilter;
    });
  }, [products, searchQuery, activeFilter]);

  const handleAddMovement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const qty = parseInt(formData.get("quantity") as string) || 0;
    const motif = formData.get("motif") as string || "";
    const dateInput = formData.get("date") as string;
    
    if (isCreatingNewProduct) {
      const name = formData.get("new_product_name") as string;
      const category = formData.get("new_product_category") as string;
      const price = parseInt(formData.get("new_product_price") as string) || 0;
      
      const stock = movementType === "in" ? qty : -qty;
      const newProduct: Product = {
        id: crypto.randomUUID(),
        name,
        category,
        stock,
        price,
        status: stock <= 0 ? "Rupture" : (stock <= 10 ? "Stock Faible" : "En stock"),
        createdAt: Date.now()
      };
      
      const newProductId = await db.products.add(newProduct) as string;
      
      await db.movements.add({
        id: crypto.randomUUID(),
        productId: newProductId,
        productName: name,
        type: movementType,
        quantity: qty,
        motif: motif || "Création de produit",
        date: new Date(dateInput).toISOString(),
        timestamp: Date.now(),
        user: "Vous"
      });
      
    } else {
      const productId = formData.get("product_id") as string;
      const product = products.find(p => p.id === productId);
      if (product) {
        const newStock = movementType === "in" ? product.stock + qty : Math.max(0, product.stock - qty);
        
        await db.products.update(productId, {
          stock: newStock,
          status: newStock === 0 ? "Rupture" : (newStock <= 10 ? "Stock Faible" : "En stock")
        });
        
        await db.movements.add({
          id: crypto.randomUUID(),
          productId: product.id!,
          productName: product.name,
          type: movementType,
          quantity: qty,
          motif: motif || (movementType === "in" ? "Entrée de stock" : "Sortie de stock"),
          date: new Date(dateInput).toISOString(),
          timestamp: Date.now(),
          user: "Vous"
        });
      }
    }
    
    setIsModalOpen(false);
  };

  const handleEditProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.id) return;
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = parseInt(formData.get("price") as string) || 0;
    
    await db.products.update(editingProduct.id, {
      name,
      category,
      price
    });
    
    setEditingProduct(null);
  };
  
  const handleSave = () => {};
  const handleEditSubmit = () => {};

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500 relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Inventaire & Mouvements</h2>
            <p className="text-slate-500">Gérez vos produits et enregistrez les entrées/sorties de stock.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setIsCreatingNewProduct(true);
                setMovementType("in");
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-medium shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Nouveau Produit</span>
              <span className="sm:hidden">Produit</span>
            </button>
            <button 
              onClick={() => {
                setIsCreatingNewProduct(false);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2.5 rounded-xl font-medium shadow-sm hover:bg-brand-blue/90 hover:shadow-md transition-all active:scale-95"
            >
              <ArrowDownRight className="w-5 h-5" />
              <span className="hidden sm:inline">Nouveau Mouvement</span>
              <span className="sm:hidden">Mouvement</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
            
            {/* Search */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit, une catégorie..." 
                className="w-full pl-10 pr-10 py-2 border-0 ring-1 ring-inset ring-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue bg-white outline-none transition-shadow"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Filter */}
            <div className="relative w-full sm:w-auto">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all w-full sm:w-auto justify-center font-medium"
              >
                <Filter className="w-4 h-4" />
                {activeFilter !== "Tous" ? `Filtre: ${activeFilter}` : "Filtres"}
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">État du stock</div>
                  {["Tous", "En stock", "Stock Faible", "Rupture"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setActiveFilter(filter);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                        activeFilter === filter ? "text-brand-blue font-medium bg-brand-blue/5" : "text-slate-700"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Produit</th>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4 text-right">En Stock</th>
                  <th className="px-6 py-4 text-right">Prix Unitaire</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="w-12 h-12 text-slate-300 mb-3" />
                        <p className="text-base font-medium text-slate-900">Aucun produit trouvé</p>
                        <p className="text-sm mt-1">Modifiez vos filtres ou votre recherche.</p>
                        <button 
                          onClick={() => { setSearchQuery(""); setActiveFilter("Tous"); }}
                          className="mt-4 text-brand-blue hover:underline font-medium"
                        >
                          Réinitialiser
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        {item.stock}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.price.toLocaleString()} FCFA
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                          item.stock === 0 
                            ? "bg-red-50 text-red-700 ring-red-600/20" 
                            : item.stock <= 10
                            ? "bg-orange-50 text-orange-700 ring-orange-600/20"
                            : "bg-green-50 text-green-700 ring-green-600/20"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingProduct(item)}
                          className="text-brand-blue bg-brand-blue/10 border border-brand-blue/20 sm:border-transparent sm:bg-transparent hover:bg-brand-blue/10 px-4 py-2 sm:px-3 sm:py-1.5 rounded-lg text-sm font-semibold sm:font-medium transition-colors shadow-sm sm:shadow-none"
                        >
                          Gérer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-sm text-slate-500 text-center flex items-center justify-between">
            <span>Affichage de {filteredProducts.length} produit(s)</span>
            <span className="hidden sm:inline">Fin de la liste</span>
          </div>
        </div>
      </div>

      {/* Main Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white sticky top-0 z-10 shrink-0">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-blue" />
                Nouveau Produit
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex justify-between">
                        Nom du produit <span className="text-red-500">*</span>
                      </label>
                      <input name="name" required type="text" placeholder="Ex: Riz parfumé (Sac 50kg)" className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Catégorie</label>
                      <select name="category" defaultValue="Alimentation" className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none appearance-none">
                        <option>Alimentation</option>
                        <option>Boisson</option>
                        <option>Hygiène</option>
                        <option>Autre</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Description courte</label>
                      <textarea name="description" rows={3} placeholder="Détails du produit..." className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none resize-none"></textarea>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex justify-between">
                        Prix unitaire (FCFA) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input name="price" required type="number" min="0" placeholder="0" className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none pr-12" />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <span className="text-slate-400 text-sm font-medium">FCFA</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex justify-between">
                        Prix d'achat (FCFA)
                        <span className="text-xs text-slate-400 font-normal">Optionnel</span>
                      </label>
                      <div className="relative">
                        <input name="purchasePrice" type="number" min="0" placeholder="0" className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none pr-12" />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <span className="text-slate-400 text-sm font-medium">FCFA</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex justify-between">
                        Quantité initiale <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Plus className="w-4 h-4 text-slate-400" />
                        </div>
                        <input name="stock" required type="number" min="0" placeholder="0" className="w-full pl-9 pr-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer inside form to trigger submit */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex gap-3 sticky bottom-0 bg-white">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
                    Annuler
                  </button>
                  <button type="submit" className="flex-1 px-4 py-3.5 bg-brand-dark text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm flex justify-center items-center gap-2">
                    <Check className="w-5 h-5" />
                    Enregistrer le produit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setEditingProduct(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-brand-blue" />
                Modifier: {editingProduct.name}
              </h3>
              <button type="button" onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nom du produit</label>
                <input name="name" defaultValue={editingProduct.name} required type="text" className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Catégorie</label>
                <select name="category" defaultValue={editingProduct.category} className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none appearance-none">
                  <option>Alimentation</option>
                  <option>Boisson</option>
                  <option>Hygiène</option>
                  <option>Autre</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Prix unitaire (FCFA)</label>
                <div className="relative">
                  <input name="price" defaultValue={editingProduct.price} required type="number" min="0" className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none pr-12" />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 text-sm font-medium">FCFA</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
                  Annuler
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm flex justify-center items-center">
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Chargement...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
