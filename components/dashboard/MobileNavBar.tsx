"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  ShoppingBag, 
  BarChart2, 
  MoreHorizontal,
  Package,
  ArrowRightLeft,
  Users,
  Store,
  Settings,
  LogOut,
  X,
  MessageCircle
} from "lucide-react";
import { signOut } from "@/lib/actions/sign-out";
import { db } from "@/lib/db";
import { syncWithSupabase } from "@/lib/sync";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const WhatsAppIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

export default function MobileNavBar() {
  const pathname = usePathname();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Lock body scroll when more menu is open
  useEffect(() => {
    if (isMoreMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMoreMenuOpen]);

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Accueil" },
    { href: "/dashboard/pos", icon: ShoppingBag, label: "Caisse" },
    { href: "/dashboard/products", icon: Package, label: "Produits" },
    { href: "/dashboard/sales", icon: BarChart2, label: "Stats" },
  ];

  const moreItems = [
    { href: "/dashboard/movements", icon: ArrowRightLeft, label: "Mouvements" },
    { href: "/dashboard/clients", icon: Users, label: "Clients" },
    { href: "/dashboard/team", icon: Users, label: "Équipe" },
    { href: "/dashboard/locations", icon: Store, label: "Boutiques" },
    { href: "/dashboard/settings", icon: Settings, label: "Paramètres" },
    { href: "#", icon: WhatsAppIcon, label: "WhatsApp", isExternal: true },
  ];

  const handleLogoutClick = async () => {
    setIsMoreMenuOpen(false);
    try {
      setIsSyncing(true);
      const syncSuccess = await syncWithSupabase();
      
      if (!syncSuccess) {
        setShowLogoutConfirm(true);
        setIsSyncing(false);
        return;
      }
      
      await executeLogout();
    } catch (e) {
      console.error("Erreur lors de la synchronisation", e);
      signOut();
    }
  };

  const executeLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await Promise.all([
        db.products.clear(),
        db.sales.clear(),
        db.movements.clear(),
        db.locations.clear(),
        db.teamMembers.clear()
      ]);
    } catch (e) {
      console.error("Erreur lors de la suppression locale", e);
    }
    signOut();
  };

  return (
    <>
      {/* Floating Bottom Bar (visible on mobile only) */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-40 flex items-center justify-center">
        {/* Main Pill Navigation */}
        <div className="w-full max-w-sm bg-white/90 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/50 rounded-full flex items-center justify-between px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-12 rounded-full transition-all ${
                  isActive 
                    ? "bg-slate-900 text-white shadow-md" 
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "mb-0.5" : "mb-1"}`} />
                <span className={`text-[10px] font-semibold ${isActive ? "opacity-100" : "opacity-80"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* More Button */}
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-12 rounded-full text-slate-500 hover:bg-slate-100 transition-all"
          >
            <MoreHorizontal className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-semibold opacity-80">Plus</span>
          </button>
        </div>
      </div>

      {/* More Menu Drawer */}
      {isMoreMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsMoreMenuOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="relative bg-white w-full rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom-full duration-300 shadow-2xl">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Menu Principal</h2>
              <button 
                onClick={() => setIsMoreMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-y-6 gap-x-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                if (item.isExternal) {
                  const whatsappNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER || "237000000000";
                  const message = encodeURIComponent("Bonjour, j'ai besoin d'aide avec Sokoo");
                  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
                  return (
                    <a 
                      key={item.label}
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors bg-green-50 text-green-600">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">
                        {item.label}
                      </span>
                    </a>
                  );
                }

                return (
                  <Link 
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreMenuOpen(false)}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                      isActive ? "bg-brand-blue/10 text-brand-blue" : "bg-slate-50 text-slate-600"
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button 
                onClick={handleLogoutClick}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-4 rounded-2xl font-bold active:scale-95 transition-transform"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Déconnexion (Données non synchronisées)"
        description="La synchronisation a échoué. Si vous vous déconnectez, vos données non sauvegardées seront définitivement perdues. Voulez-vous vraiment vous déconnecter ?"
        confirmText="Se déconnecter"
        isDestructive={true}
        onConfirm={executeLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
