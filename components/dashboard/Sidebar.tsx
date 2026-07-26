"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Package, 
  ArrowRightLeft, 
  Users, 
  Store, 
  Settings, 
  LogOut,
  BellRing,
  ShoppingCart,
  X,
  ReceiptText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/sign-out";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";
import { syncWithSupabase } from "@/lib/sync";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Caisse", href: "/dashboard/pos", icon: ShoppingCart },
  { name: "Ventes", href: "/dashboard/sales", icon: ReceiptText },
  { name: "Produits", href: "/dashboard/products", icon: Package },
  { name: "Mouvements", href: "/dashboard/movements", icon: ArrowRightLeft },
  { name: "Alertes", href: "/dashboard/alerts", icon: BellRing },
  { name: "Points de vente", href: "/dashboard/locations", icon: Store },
  { name: "Équipe", href: "/dashboard/team", icon: Users },
  { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRole() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          const userId = data.session.user.id;
          const member = await db.teamMembers.get(userId);
          if (member) {
            setRole(member.role);
          } else {
            // Fallback: fetch from supabase directly if local db is not synced yet
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
            if (profile) {
              setRole(profile.role);
            }
          }
        }
      } catch (e) {
        console.error("Error fetching role:", e);
      }
    }
    fetchRole();
  }, []);

  const filteredNavigation = navigation.filter(item => {
    if (!role) return item.href === "/dashboard/pos"; // Default while loading
    
    if (role === 'owner' || role === 'Admin') return true;
    
    if (role === 'manager' || role === 'Superviseur') {
      return !['/dashboard/team', '/dashboard/settings'].includes(item.href);
    }
    
    if (role === 'employee' || role === 'Vendeur') {
      return item.href === '/dashboard/pos';
    }
    
    return false;
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-brand-dark text-slate-300 shadow-2xl transition-transform duration-300 ease-in-out md:static md:w-64 md:translate-x-0 print:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6 bg-slate-900/50">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img src="/sokoo_logo_s_only_perfect.png" alt="Sokoo" className="h-10 w-auto object-contain drop-shadow-sm py-0.5" />
            <span className="text-xl font-bold text-white tracking-tight">Sokoo</span>
          </Link>
          <button 
            type="button" 
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <span className="sr-only">Fermer la barre latérale</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="flex flex-col flex-grow overflow-y-auto pt-6 pb-4">
          <nav className="flex-1 space-y-1.5 px-4">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(`${item.href}`));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group flex items-center px-3 py-3 md:py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-brand-blue/10 text-brand-blue"
                      : "hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200",
                      isActive ? "text-brand-blue" : "text-slate-400 group-hover:text-white"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto px-4 pb-4">
          <PWAInstallPrompt />
          <button 
            onClick={async () => {
              try {
                // Ensure local data is pushed to Supabase before logging out
                await syncWithSupabase();
                
                // Then clear local DB
                await Promise.all([
                  db.products.clear(),
                  db.sales.clear(),
                  db.movements.clear(),
                  db.locations.clear(),
                  db.teamMembers.clear()
                ]);
              } catch (e) {
                console.error("Erreur lors de la synchronisation ou de la suppression locale", e);
              }
              signOut();
            }}
            className="flex w-full items-center px-3 py-3 md:py-2.5 text-sm font-medium text-slate-400 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 mt-2"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
            Déconnexion
          </button>
        </div>
      </div>
    </>
  );
}
