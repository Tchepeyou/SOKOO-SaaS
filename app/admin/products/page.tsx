import { createAdminClient } from "@/lib/supabase/admin";
import { Package, Search, Filter, MoreVertical } from "lucide-react";

export const metadata = {
  title: "Produits Globaux | Sokoo Admin",
};

export default async function AdminProductsPage() {
  const supabase = createAdminClient();

  // Fetch all products across all organizations
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      category,
      unit_price,
      is_active,
      created_at,
      organizations (
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Catalogue Global</h2>
          <p className="text-sm text-slate-500 mt-1">Supervisez les produits créés par toutes les boutiques.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Filtrer</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Produit</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Catégorie</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Boutique</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Prix Moyen</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products && products.length > 0 ? (
                products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-500">Ajouté le {new Date(product.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {product.category || "Général"}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700">
                        {product.organizations?.name || "Inconnue"}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {product.unit_price ? `${product.unit_price.toLocaleString()} FCFA` : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        product.is_active 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                        {product.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Aucun produit trouvé sur la plateforme.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
