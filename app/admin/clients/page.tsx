import { createAdminClient } from "@/lib/supabase/admin";
import { Users, Search, MoreVertical, ShieldBan, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Clients | Sokoo Admin",
};

export default async function AdminClientsPage() {
  const supabase = createAdminClient();

  // Fetch all profiles and their associated organizations
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      phone,
      role,
      created_at,
      organization_id,
      organizations (
        name,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Clients & Boutiques</h2>
          <p className="text-sm text-slate-500 mt-1">Gérez l'ensemble des utilisateurs de la plateforme.</p>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Rechercher un client..." 
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Client</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Contact</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Boutique</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Statut</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles && profiles.length > 0 ? (
                profiles.map((profile: any) => (
                  <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          {profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : profile.phone?.substring(0, 2) || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{profile.full_name || "Utilisateur"}</p>
                          <p className="text-xs text-slate-500">Inscrit le {new Date(profile.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600">{profile.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <p className="font-medium text-slate-700">
                          {profile.organizations?.name || "Non configurée"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Actif
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Aucun client trouvé.
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
