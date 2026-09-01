"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Users, BarChart2 } from "lucide-react";

export default function AdminMobileNav() {
  const pathname = usePathname();

  const items = [
    { href: "/admin", icon: LayoutDashboard },
    { href: "/admin/clients", icon: Users },
    { href: "/admin/subscriptions", icon: ShoppingCart, badge: true },
    { href: "/admin/analytics", icon: BarChart2 },
  ];

  return (
    <div className="print:hidden md:hidden fixed bottom-0 left-0 right-0 h-[70px] bg-white border-t border-slate-100 flex items-center justify-around px-2 z-50 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={`flex flex-col items-center justify-center w-16 h-12 transition-colors relative ${
              isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {isActive ? (
              <div className="bg-blue-50 p-2 rounded-xl">
                <Icon className="w-6 h-6" />
              </div>
            ) : (
              <Icon className="w-6 h-6" />
            )}
            {item.badge && !isActive && (
              <span className="absolute top-0 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
