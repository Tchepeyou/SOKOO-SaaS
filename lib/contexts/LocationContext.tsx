"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";

interface LocationContextType {
  activeLocationId: string | null;
  setActiveLocationId: (id: string) => void;
  isLoading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  
  // Récupérer la boutique assignée ou principale
  const defaultLocation = useLiveQuery(async () => {
    const allLocs = await db.locations.toArray();
    
    // Essayer de trouver la boutique assignée à l'utilisateur
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const userId = data.session.user.id;
        const member = await db.teamMembers.get(userId);
        if (member && member.location) {
          const assignedLoc = allLocs.find(l => l.id === member.location);
          if (assignedLoc) return assignedLoc;
        } else {
          // Fallback via Supabase profile si pas dans Dexie
          const { data: profile } = await supabase.from('profiles').select('location_id').eq('id', userId).single();
          if (profile && profile.location_id) {
            const assignedLoc = allLocs.find(l => l.id === profile.location_id);
            if (assignedLoc) return assignedLoc;
          }
        }
      }
    } catch (e) {
      console.error("Error fetching user location for context:", e);
    }

    const mainLoc = allLocs.find(l => l.isMain === true || (l.isMain as any) === 1);
    if (mainLoc) return mainLoc;
    
    // Fallback à la première boutique si aucune n'est principale
    return allLocs.length > 0 ? allLocs[0] : null;
  });

  const isLoading = defaultLocation === undefined;

  useEffect(() => {
    // Si on n'a pas encore de boutique active mais qu'on a trouvé une boutique par défaut, on l'utilise
    if (!activeLocationId && defaultLocation) {
      // Vérifier le localStorage pour se souvenir du dernier choix
      const savedLoc = localStorage.getItem("sokoo_active_location");
      if (savedLoc) {
        // Optionnel : on pourrait vérifier si savedLoc existe toujours dans la DB
        setActiveLocationId(savedLoc);
      } else {
        setActiveLocationId(defaultLocation.id);
        localStorage.setItem("sokoo_active_location", defaultLocation.id);
      }
    }
  }, [defaultLocation, activeLocationId]);

  const handleSetActiveLocation = (id: string) => {
    setActiveLocationId(id);
    localStorage.setItem("sokoo_active_location", id);
  };

  return (
    <LocationContext.Provider value={{ activeLocationId, setActiveLocationId: handleSetActiveLocation, isLoading }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
