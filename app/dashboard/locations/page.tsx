"use client";

import { Store, MapPin, Plus, X, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Location } from "@/lib/db";

export default function LocationsPage() {
  const locations = useLiveQuery(() => db.locations.reverse().toArray()) || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const isMain = formData.get("isMain") === "on";

    try {
      if (isMain) {
        // If this one is set to main, un-main all others
        const mainLocs = await db.locations.where('isMain').equals(1).toArray(); // boolean true in JS, but let's just query all and update
        const allLocs = await db.locations.toArray();
        for (const loc of allLocs) {
          if (loc.isMain && loc.id !== editingLoc?.id) {
            await db.locations.update(loc.id!, { isMain: false });
          }
        }
      }

      if (editingLoc?.id) {
        await db.locations.update(editingLoc.id, { name, address, isMain });
      } else {
        // Ensure at least one main if it's the first
        const isFirst = (await db.locations.count()) === 0;
        await db.locations.add({
          name,
          address,
          isMain: isMain || isFirst,
          createdAt: Date.now()
        });
      }
      setIsModalOpen(false);
      setEditingLoc(null);
    } catch (error) {
      console.error("Erreur d'enregistrement:", error);
      alert("Une erreur est survenue.");
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Voulez-vous vraiment supprimer ce point de vente ?")) {
      try {
        await db.locations.delete(id);
        
        // If we deleted the main one, make the oldest remaining one main
        const remaining = await db.locations.toArray();
        const hasMain = remaining.some(loc => loc.isMain);
        if (remaining.length > 0 && !hasMain) {
          await db.locations.update(remaining[0].id!, { isMain: true });
        }
      } catch (error) {
        console.error("Erreur de suppression:", error);
      }
    }
  };

  const handleEdit = (loc: Location, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLoc(loc);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Points de Vente</h2>
          <p className="text-slate-500">Gérez vos différentes boutiques et entrepôts.</p>
        </div>
        <button 
          onClick={() => { setEditingLoc(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ajouter un point de vente
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4 group hover:border-brand-blue/30 transition-colors relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <div className="flex flex-col items-end gap-2">
                {loc.isMain && (
                  <span className="bg-brand-blue/10 text-brand-blue text-xs px-2.5 py-1 rounded-full font-medium">
                    Principal
                  </span>
                )}
                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleEdit(loc, e)} className="p-1.5 text-slate-400 hover:text-brand-blue bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => handleDelete(loc.id!, e)} className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{loc.name}</h3>
              <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4" />
                {loc.address}
              </p>
            </div>
          </div>
        ))}
        {locations.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 p-8 text-center text-slate-500">
            Aucun point de vente pour le moment.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-brand-blue" />
                {editingLoc ? "Modifier le point de vente" : "Ajouter un point de vente"}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nom du point de vente</label>
                <input name="name" defaultValue={editingLoc?.name} required type="text" placeholder="Ex: Dépôt Akwa" className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Adresse / Localisation</label>
                <input name="address" defaultValue={editingLoc?.address} required type="text" placeholder="Ex: Akwa, Douala" className="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue bg-white text-slate-900 outline-none" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="isMain" defaultChecked={editingLoc?.isMain} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                </label>
                <span className="text-sm font-medium text-slate-700">Définir comme point de vente principal</span>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
                  Annuler
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
