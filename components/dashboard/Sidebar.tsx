"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/sign-out";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Caisse", href: "/dashboard/pos", icon: ShoppingCart },
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
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-brand-dark text-slate-300 shadow-2xl transition-transform duration-300 ease-in-out md:static md:w-64 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="bg-brand-blue p-1.5 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Sokoo</span>
          </div>
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
            {navigation.map((item) => {
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
        
        <div className="p-4 border-t border-white/10 mt-auto">
          <button 
            onClick={() => signOut()}
            className="flex w-full items-center px-3 py-3 md:py-2.5 text-sm font-medium text-slate-400 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
            Déconnexion
          </button>
        </div>
      </div>
    </>
  );
}
