"use client";

import { Suspense } from "react";

import { Plus, Search, Filter, X, ArrowUpRight, ArrowDownRight, Package, Calendar, ArrowLeft, ChevronDown } from "lucide-react";
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
        name,
        category,
        stock,
        price,
        status: stock <= 0 ? "Rupture" : (stock <= 10 ? "Stock Faible" : "En stock"),
        createdAt: Date.now()
      };
      
      const newProductId = await db.products.add(newProduct) as number;
      
      await db.movements.add({
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
      const productId = parseInt(formData.get("product_id") as string);
      const product = products.find(p => p.id === productId);
      if (product) {
        const newStock = movementType === "in" ? product.stock + qty : Math.max(0, product.stock - qty);
        
        await db.products.update(productId, {
          stock: newStock,
          status: newStock === 0 ? "Rupture" : (newStock <= 10 ? "Stock Faible" : "En stock")
        });
        
        await db.movements.add({
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

  return (
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

      {/* Modal Nouveau Mouvement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {isCreatingNewProduct ? "Créer un nouveau produit" : "Enregistrer un mouvement"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddMovement} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto hide-scrollbar">
              {/* Type de mouvement (Tabs) */}
              {!isCreatingNewProduct && (
                <div className="flex p-1 bg-slate-100 rounded-xl">
                <button 
                  type="button"
                  onClick={() => setMovementType("in")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                    movementType === "in" ? "bg-white text-brand-green shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  Entrée (+ de stock)
                </button>
                <button 
                  type="button"
                  onClick={() => setMovementType("out")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                    movementType === "out" ? "bg-white text-brand-red shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Sortie (- de stock)
                </button>
              </div>
              )}

              <div className="space-y-4">
                {isCreatingNewProduct ? (
                  <div className="space-y-4 bg-brand-blue/5 p-5 rounded-2xl border border-brand-blue/10">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-semibold text-brand-blue flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Détails du produit
                      </h4>
                      <button type="button" onClick={() => setIsCreatingNewProduct(false)} className="text-xs bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg font-medium hover:bg-slate-50 flex items-center gap-1.5 transition-all shadow-sm">
                        <ArrowLeft className="w-3.5 h-3.5" /> Produit existant
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Nom du produit</label>
                      <input name="new_product_name" required type="text" placeholder="Ex: Boîte d'allumettes" className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Catégorie</label>
                      <div className="relative">
                        <select name="new_product_category" required className="w-full appearance-none px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none cursor-pointer">
                          <option value="">Sélectionnez...</option>
                          <option value="Alimentation">Alimentation</option>
                          <option value="Hygiène">Hygiène</option>
                          <option value="Boisson">Boisson</option>
                          <option value="Autre">Autre</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Prix unitaire (FCFA)</label>
                        <input name="new_product_price" required type="number" min="0" placeholder="Ex: 500" className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-slate-700">Produit concerné</label>
                      <button type="button" onClick={() => setIsCreatingNewProduct(true)} className="text-xs bg-brand-blue text-white px-2.5 py-1.5 rounded-lg font-medium hover:bg-brand-blue/90 flex items-center gap-1.5 transition-all shadow-sm">
                        <Plus className="w-3.5 h-3.5" /> Nouveau produit
                      </button>
                    </div>
                    <div className="relative">
                      <select name="product_id" required className="w-full appearance-none px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-slate-50 hover:bg-slate-100 transition-colors text-slate-900 outline-none cursor-pointer">
                        <option value="">Sélectionnez un produit...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.stock} en stock)</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Quantité</label>
                    <input name="quantity" required type="number" min="1" placeholder="Ex: 5" className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-brand-blue/70" />
                      </div>
                      <input 
                        type="date" 
                        name="date" 
                        defaultValue={new Date().toISOString().split('T')[0]} 
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 outline-none transition-colors cursor-pointer font-medium" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Motif / Commentaire</label>
                  <input name="motif" type="text" placeholder={isCreatingNewProduct ? "Ex: Stock initial" : movementType === "in" ? "Ex: Livraison fournisseur" : "Ex: Vente au comptoir"} className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none" />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
                  Annuler
                </button>
                <button type="submit" className={`flex-1 px-4 py-3 text-white rounded-xl font-medium transition-colors ${
                  isCreatingNewProduct ? "bg-brand-blue hover:bg-brand-blue/90" : movementType === "in" ? "bg-brand-green hover:bg-brand-green/90" : "bg-brand-red hover:bg-brand-red/90"
                }`}>
                  {isCreatingNewProduct ? "Créer et ajouter au stock" : "Valider le mouvement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gérer Produit */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setEditingProduct(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-blue" />
                Modifier le produit
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditProduct} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto hide-scrollbar">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nom du produit</label>
                  <input name="name" defaultValue={editingProduct.name} required type="text" className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Catégorie</label>
                    <div className="relative">
                      <select name="category" defaultValue={editingProduct.category} required className="w-full appearance-none px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none cursor-pointer">
                        <option value="Alimentation">Alimentation</option>
                        <option value="Hygiène">Hygiène</option>
                        <option value="Boisson">Boisson</option>
                        <option value="Autre">Autre</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Prix unitaire (FCFA)</label>
                    <input name="price" defaultValue={editingProduct.price} required type="number" min="0" className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
                  Annuler
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-brand-blue text-white rounded-xl font-medium hover:bg-brand-blue/90 transition-colors shadow-sm">
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Chargement...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
