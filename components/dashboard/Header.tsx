"use client";

import { Bell, Search, Menu, User, Command, X, Check, Package, LogOut, Settings, Trash2, Store, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/actions/sign-out";

interface HeaderProps {
  setSidebarOpen: (value: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const router = useRouter();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [activeShop, setActiveShop] = useState({ id: 1, name: "Boutique Centrale", role: "Propriétaire", initials: "BC" });
  const [shops] = useState([
    { id: 1, name: "Boutique Centrale", role: "Propriétaire", initials: "BC" },
    { id: 2, name: "Succursale Akwa", role: "Gérant", initials: "SA" }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: "Rupture de stock : Lait Nido", message: "Il ne reste plus que 2 unités en stock.", time: "Il y a 2 heures" },
    { id: 2, title: "Nouvelle connexion", message: "Nouvelle connexion détectée sur un nouvel appareil.", time: "Hier" },
  ]);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Handle keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const removeNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
      
      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="absolute inset-0 z-50 bg-white px-4 flex items-center sm:hidden animate-in fade-in duration-200" ref={searchContainerRef}>
          <form className="relative w-full flex items-center" onSubmit={handleSearchSubmit}>
            <Search className="absolute left-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-slate-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="Rechercher..."
            />
            <button 
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Mobile Search Dropdown */}
            {searchQuery.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 py-2">
                <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Résultats</div>
                <button 
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 text-left"
                >
                  <Search className="w-5 h-5 text-brand-blue" />
                  <span>Rechercher "<span className="font-semibold">{searchQuery}</span>" dans les produits</span>
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      <div className="flex items-center flex-1">
        <button 
          type="button" 
          className="-m-2.5 p-2.5 text-slate-700 md:hidden mr-4"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Ouvrir le menu</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Search Bar Desktop */}
        <div className="hidden sm:flex flex-1 max-w-md" ref={searchContainerRef}>
          <form className="relative w-full group" onSubmit={handleSearchSubmit}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              className="block w-full rounded-full border-0 py-2 pl-10 pr-10 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue bg-slate-50 hover:bg-slate-100 focus:bg-white transition-all outline-none"
              placeholder="Rechercher..."
            />
            {!isSearchOpen && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <div className="hidden lg:flex items-center gap-1 text-xs text-slate-400 font-medium bg-white border border-slate-200 px-1.5 py-0.5 rounded-md">
                  <Command className="w-3 h-3" />
                  <span>K</span>
                </div>
              </div>
            )}
            {isSearchOpen && searchQuery.length > 0 && (
              <button 
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Desktop Search Dropdown */}
            {isSearchOpen && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {searchQuery.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-500 text-center">
                    Commencez à taper pour rechercher un produit ou appuyez sur Entrée...
                  </div>
                ) : (
                  <div className="px-2">
                    <div className="text-xs font-semibold text-slate-400 mb-2 px-2 uppercase tracking-wider">Résultats rapides</div>
                    <button 
                      type="button"
                      onClick={() => handleSearchSubmit()}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg text-left"
                    >
                      <Search className="w-4 h-4 text-brand-blue" />
                      <span>Rechercher "<span className="font-semibold">{searchQuery}</span>" dans les produits</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="flex items-center gap-x-3 sm:gap-x-5">
        {/* Mobile Search Icon */}
        <button 
          className="sm:hidden p-2 text-slate-400 hover:text-slate-500 rounded-full hover:bg-slate-50 transition-colors"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search className="h-5 w-5" />
        </button>
        
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            type="button" 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-400 hover:text-slate-500 rounded-full hover:bg-slate-50 transition-colors"
          >
            <span className="sr-only">Voir les notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 block h-1.5 w-1.5 rounded-full bg-brand-orange ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-[-60px] sm:right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
              <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                {notifications.length > 0 && (
                  <span className="text-xs text-brand-blue font-medium bg-brand-blue/10 px-2 py-0.5 rounded-full">
                    {notifications.length} {notifications.length > 1 ? "Nouvelles" : "Nouvelle"}
                  </span>
                )}
              </div>
              
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-500 text-sm">
                    Aucune notification pour le moment.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="relative px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer group border-b border-slate-50">
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="Effacer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <p className="text-sm font-medium text-slate-900 pr-6">{notif.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                      <p className="text-[10px] text-slate-400 mt-2">{notif.time}</p>
                    </div>
                  ))
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-slate-100 text-center">
                  <button 
                    onClick={clearAllNotifications}
                    className="text-sm text-brand-blue font-medium hover:underline"
                  >
                    Tout marquer comme lu (effacer)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hidden sm:block h-6 w-px bg-slate-200" aria-hidden="true" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            type="button" 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 pl-2 pr-3 hover:bg-slate-50 rounded-full border border-transparent hover:border-slate-200 transition-all"
          >
            <div className="h-7 w-7 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-xs">
              {activeShop.initials}
            </div>
            <div className="hidden lg:flex flex-col items-start text-left">
              <span className="text-sm font-medium text-slate-700 leading-tight">
                {activeShop.name}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Boutique</span>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vos Boutiques</p>
                <div className="space-y-1">
                  {shops.map((shop) => (
                    <button
                      key={shop.id}
                      onClick={() => {
                        setActiveShop(shop);
                        setIsProfileOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${
                        activeShop.id === shop.id ? "bg-brand-blue/5 border border-brand-blue/10" : "hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          activeShop.id === shop.id ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          {shop.initials}
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-medium ${activeShop.id === shop.id ? "text-brand-blue" : "text-slate-700"}`}>
                            {shop.name}
                          </p>
                          <p className="text-xs text-slate-500">{shop.role}</p>
                        </div>
                      </div>
                      {activeShop.id === shop.id && <Check className="w-4 h-4 text-brand-blue" />}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="px-3 py-2">
                <Link
                  href="/settings?tab=boutiques"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-sm font-medium text-brand-blue bg-blue-50/50 hover:bg-blue-50 transition-colors border border-blue-100/50"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une boutique
                </Link>
              </div>

              <div className="border-t border-slate-100 my-2"></div>
              <Link 
                href="/settings" 
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Paramètres
              </Link>
              <Link 
                href="/tarifs" 
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Store className="w-4 h-4 text-slate-400" />
                Site Web & Tarifs
              </Link>
              <a 
                href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER || "237000000000"}?text=${encodeURIComponent("Bonjour, j'ai besoin d'aide avec Sokoo")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-700 transition-colors"
              >
                <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
                Besoin d'aide ?
              </a>
              <div className="border-t border-slate-100 my-1"></div>
              <button 
                onClick={() => {
                  setIsProfileOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
