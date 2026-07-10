"use client";

import { useState, useRef, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, TeamMember } from "@/lib/db";
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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  // For dropdown menu
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const role = formData.get("role") as string;

    try {
      if (editingMember?.id) {
        await db.teamMembers.update(editingMember.id, { name, phone, role });
      } else {
        await db.teamMembers.add({
          id: crypto.randomUUID(),
          name,
          phone,
          role,
          status: "Actif",
          createdAt: Date.now()
        });
      }
      setIsModalOpen(false);
      setEditingMember(null);
    } catch (error) {
      console.error("Erreur d'enregistrement:", error);
      alert("Une erreur est survenue.");
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

  const handleDelete = async (id: string) => {
    if (confirm("Voulez-vous vraiment retirer ce membre de l'équipe ?")) {
      await db.teamMembers.delete(id);
      setActiveDropdown(null);
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
          {teamMembers.length === 0 && (
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
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nom complet</label>
                <input name="name" defaultValue={editingMember?.name} required type="text" placeholder="Ex: Jeanne D." className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Numéro de téléphone</label>
                <input name="phone" defaultValue={editingMember?.phone} required type="tel" placeholder="Ex: 6XX XX XX XX" className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Rôle & Permissions</label>
                <div className="relative">
                  <select name="role" defaultValue={editingMember?.role || "Vendeur"} required className="w-full appearance-none px-4 py-3 pr-12 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none cursor-pointer">
                    <option value="Admin">Administrateur (Accès Total)</option>
                    <option value="Superviseur">Superviseur (Gestion des stocks & Rapports)</option>
                    <option value="Vendeur">Vendeur (Caisse & Mouvements)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
                  Annuler
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm">
                  {editingMember ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
