"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, ShoppingCart, Package, Users, BarChart2, 
  Settings, HelpCircle, LogOut 
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems: { href: string, icon: any, label: string, badge?: string }[] = [
    { href: "/admin", icon: LayoutDashboard, label: "Vue d'ensemble" },
    { href: "/admin/subscriptions", icon: ShoppingCart, label: "Abonnements" },
    { href: "/admin/products", icon: Package, label: "Produits" },
    { href: "/admin/clients", icon: Users, label: "Clients" },
    { href: "/admin/analytics", icon: BarChart2, label: "Statistiques" },
  ];

  const platformItems: { href: string, icon: any, label: string }[] = [
    { href: "/admin/settings", icon: Settings, label: "Paramètres" },
    { href: "/admin/support", icon: HelpCircle, label: "Support Technique" },
  ];

  return (
    <aside className="w-[260px] bg-white border-r border-slate-100 flex-col justify-between overflow-y-auto hidden md:flex flex-shrink-0 relative z-20">
      <div>
        {/* Logo */}
        <Link href="/admin" className="h-20 flex items-center px-6 gap-3 hover:opacity-80 transition-opacity">
          <img src="/sokoo_logo_s_only_perfect.png" alt="Sokoo Admin" className="h-8 w-auto object-contain drop-shadow-sm py-0.5" />
          <span className="font-bold text-xl text-slate-900 tracking-tight">Sokoo Admin</span>
        </Link>

        <div className="px-4 py-4">
          <p className="text-xs font-semibold text-slate-400 mb-4 px-2 uppercase tracking-wider">Menu</p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
                    isActive 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <p className="text-xs font-semibold text-slate-400 mt-8 mb-4 px-2 uppercase tracking-wider">Plateforme</p>
          <nav className="space-y-1">
            {platformItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                    isActive 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-4 mb-4">
        <nav className="space-y-1">
          <Link href="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium mt-2">
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
