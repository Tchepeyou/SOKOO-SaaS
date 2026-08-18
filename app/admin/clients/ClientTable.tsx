"use client";

import { useState } from "react";
import { Search, MoreVertical, ShieldBan, CheckCircle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteClient, toggleClientStatus } from "@/lib/actions/adminClients";
import { useRouter } from "next/navigation";

export default function ClientTable({ initialProfiles }: { initialProfiles: any[] }) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [search, setSearch] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();

  const filteredProfiles = profiles.filter((p: any) => {
    const term = search.toLowerCase();
    return (
      (p.full_name && p.full_name.toLowerCase().includes(term)) ||
      (p.phone && p.phone.toLowerCase().includes(term)) ||
      (p.organizations?.name && p.organizations.name.toLowerCase().includes(term))
    );
  });

  const handleDelete = async (userId: string, orgId?: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement ce client et toutes ses données ? Cette action est irréversible.")) return;
    
    setLoadingAction(`delete-${userId}`);
    const res = await deleteClient(userId, orgId);
    if (res.success) {
      toast.success("Client supprimé avec succès.");
      setProfiles(profiles.filter(p => p.id !== userId));
      router.refresh();
    } else {
      toast.error("Erreur lors de la suppression.");
    }
    setLoadingAction(null);
    setOpenDropdown(null);
  };

  const handleToggleStatus = async (userId: string, currentRole: string) => {
    setLoadingAction(`status-${userId}`);
    const res = await toggleClientStatus(userId, currentRole);
    if (res.success) {
      toast.success(currentRole === "blocked" ? "Client débloqué." : "Client bloqué.");
      setProfiles(profiles.map(p => p.id === userId ? { ...p, role: currentRole === "blocked" ? "owner" : "blocked" } : p));
      router.refresh();
    } else {
      toast.error("Erreur lors du changement de statut.");
    }
    setLoadingAction(null);
    setOpenDropdown(null);
  };

  return (
    <div className="space-y-6">
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible">
        <div className="overflow-x-auto min-h-[300px]">
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
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((profile: any) => (
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
                      {profile.role === "blocked" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                          <ShieldBan className="w-3.5 h-3.5" />
                          Bloqué
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setOpenDropdown(openDropdown === profile.id ? null : profile.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {openDropdown === profile.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)}></div>
                          <div className="absolute right-8 top-12 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden text-left py-1">
                            <button 
                              onClick={() => handleToggleStatus(profile.id, profile.role)}
                              disabled={loadingAction !== null}
                              className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              {loadingAction === `status-${profile.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldBan className="w-4 h-4" />}
                              {profile.role === "blocked" ? "Débloquer le compte" : "Bloquer le compte"}
                            </button>
                            <button 
                              onClick={() => handleDelete(profile.id, profile.organization_id)}
                              disabled={loadingAction !== null}
                              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              {loadingAction === `delete-${profile.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              Supprimer le compte
                            </button>
                          </div>
                        </>
                      )}
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
