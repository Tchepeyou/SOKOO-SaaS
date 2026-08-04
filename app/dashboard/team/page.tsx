"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, TeamMember } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";
import { createInvite } from "@/lib/actions/team";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { 
  UserPlus, 
  MoreHorizontal, 
  ShieldCheck, 
  X, 
  Edit, 
  Trash2, 
  ChevronDown,
  Store,
  Users
} from "lucide-react";

export default function TeamPage() {
  const teamMembers = useLiveQuery(() => db.teamMembers.reverse().toArray()) || [];
  const localLocations = useLiveQuery(() => db.locations.toArray()) || [];
  const [invites, setInvites] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null);
  
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  
  // For dropdown menu
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchInvites = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
    if (profile?.organization_id) {
      const { data } = await supabase
        .from('invites')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .is('accepted_at', null);
      
      if (data) setInvites(data);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    fetchInvites();
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [fetchInvites]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const role = formData.get("role") as string;

    try {
      if (editingMember?.id) {
        // Only update locally for now (or via server action)
        await db.teamMembers.update(editingMember.id, { name, phone, role });
        setIsModalOpen(false);
        setEditingMember(null);
      } else {
        const result = await createInvite(formData);
        if (result.error) {
          toast.error(result.error);
        } else if (result.inviteUrl) {
          setCreatedInviteUrl(result.inviteUrl);
          fetchInvites();
          toast.success("Invitation créée !");
        }
      }
    } catch (error) {
      console.error("Erreur d'enregistrement:", error);
      toast.error("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (member: TeamMember) => {
    try {
      await db.teamMembers.update(member.id!, {
        status: member.status === "Actif" ? "Suspendu" : "Actif"
      });
      setActiveDropdown(null);
    } catch (error) {
      console.error("Erreur de statut:", error);
    }
  };

  const handleDelete = (id: string) => {
    setMemberToDelete(id);
    setActiveDropdown(null);
  };

  const confirmDelete = async () => {
    if (memberToDelete) {
      await db.teamMembers.delete(memberToDelete);
      setMemberToDelete(null);
      toast.success("Membre retiré de l'équipe");
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'Admin': return <ShieldCheck className="w-4 h-4 text-brand-blue" />;
      case 'Superviseur': return <Store className="w-4 h-4 text-brand-purple" />;
      default: return <Users className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500 relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Équipe & Accès</h2>
          <p className="text-slate-500">Gérez les membres de votre boutique et leurs permissions.</p>
        </div>
        <button 
          onClick={() => { setEditingMember(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-slate-800 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Ajouter un membre
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <ul className="divide-y divide-slate-100">
          {teamMembers.map((member) => (
            <li key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  member.status === 'Suspendu' ? 'bg-slate-100 text-slate-400' : 'bg-brand-blue/10 text-brand-blue'
                }`}>
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${member.status === 'Suspendu' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{member.name}</p>
                    {member.status === 'Suspendu' && (
                      <span className="bg-red-50 text-red-600 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">Suspendu</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{member.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-8 relative">
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  {getRoleIcon(member.role)}
                  {member.role}
                </div>
                
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === (member.id ?? null) ? null : (member.id ?? null))}
                  className="p-2 text-slate-400 hover:text-brand-blue rounded-lg hover:bg-brand-blue/10 transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {activeDropdown === member.id && (
                  <div ref={dropdownRef} className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button 
                      onClick={() => handleEdit(member)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-blue transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" /> Modifier
                    </button>
                    <button 
                      onClick={() => toggleStatus(member)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" /> 
                      {member.status === 'Actif' ? 'Suspendre l\'accès' : 'Réactiver l\'accès'}
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
          {invites.map((invite) => (
            <li key={invite.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors gap-4 opacity-75">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-orange-100 text-orange-500">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{invite.phone}</p>
                    <span className="bg-orange-50 text-orange-600 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border border-orange-100">En attente (Invitation)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-8">
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  {getRoleIcon(invite.role)}
                  {invite.role}
                </div>
              </div>
            </li>
          ))}
          {teamMembers.length === 0 && invites.length === 0 && (
            <li className="p-8 text-center text-slate-500">
              Aucun membre dans l'équipe pour le moment.
            </li>
          )}
        </ul>
      </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-blue" />
                {editingMember ? "Modifier le membre" : "Ajouter un membre"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {createdInviteUrl ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Invitation créée !</h4>
                <p className="text-sm text-slate-500">
                  Envoyez ce lien à la personne pour qu'elle rejoigne votre équipe.
                </p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm font-mono break-all text-slate-700 select-all">
                  {createdInviteUrl}
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(createdInviteUrl);
                    setIsModalOpen(false);
                    setCreatedInviteUrl(null);
                  }} 
                  className="w-full px-4 py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Copier et fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nom complet (Optionnel)</label>
                  <input name="name" defaultValue={editingMember?.name} type="text" placeholder="Ex: Jeanne D." className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Numéro de téléphone</label>
                  <input name="phone" defaultValue={editingMember?.phone} required type="tel" placeholder="Ex: 6XX XX XX XX" className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Rôle & Permissions</label>
                  <div className="relative">
                    <select name="role" defaultValue={editingMember?.role || "employee"} required className="w-full appearance-none px-4 py-3 pr-12 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none cursor-pointer">
                      <option value="owner">Administrateur (Accès Total)</option>
                      <option value="manager">Superviseur (Gestion des stocks & Rapports)</option>
                      <option value="employee">Vendeur (Caisse & Mouvements)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>

                {localLocations.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Boutique Assignée</label>
                    <div className="relative">
                      <select name="location_id" defaultValue={editingMember?.location || ""} className="w-full appearance-none px-4 py-3 pr-12 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none cursor-pointer">
                        <option value="">Toutes les boutiques (Global)</option>
                        {localLocations.map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors disabled:opacity-50">
                    Annuler
                  </button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50">
                    {isSubmitting ? "Création..." : (editingMember ? "Enregistrer" : "Inviter")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!memberToDelete}
        title="Retirer le membre"
        description="Voulez-vous vraiment retirer ce membre de l'équipe ?"
        confirmText="Retirer"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setMemberToDelete(null)}
      />
    </>
  );
}
