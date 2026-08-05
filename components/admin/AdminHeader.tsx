"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Bell, Mail } from "lucide-react";

export default function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Recherche en cours pour: ${searchQuery}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="h-20 bg-[#F8F9FA] flex items-center justify-between px-6 md:px-8 flex-shrink-0 z-30 relative border-b border-slate-100">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="md:hidden flex items-center">
          <img src="/sokoo_logo_s_only_perfect.png" alt="Sokoo Admin" className="h-8 w-auto object-contain drop-shadow-sm py-0.5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900 hidden md:block">Administration</h1>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative group hidden lg:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-10 pr-12 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 hover:bg-slate-200 p-1 rounded">
            <kbd className="text-[10px] font-sans font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 cursor-pointer">↵</kbd>
          </button>
        </form>

        <div className="flex items-center gap-2 md:gap-3 text-slate-500 relative">
          {/* Mail */}
          <button 
            type="button"
            onClick={() => { setShowMessages(!showMessages); setShowNotifications(false); }}
            className="w-10 h-10 hidden md:flex items-center justify-center hover:bg-slate-200/50 rounded-full transition-colors relative"
          >
            <Mail className="w-5 h-5" />
          </button>
          
          {/* Notifications */}
          <button 
            type="button"
            onClick={() => { setShowNotifications(!showNotifications); setShowMessages(false); }}
            className="w-10 h-10 flex items-center justify-center hover:bg-slate-200/50 rounded-full transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F8F9FA]"></span>
          </button>

          {/* Messages Dropdown */}
          {showMessages && (
            <div className="absolute top-12 right-12 w-80 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-900">Messages</h3>
                <span className="text-xs text-blue-600 font-medium cursor-pointer" onClick={() => setShowMessages(false)}>Tout marquer comme lu</span>
              </div>
              <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                <Mail className="w-10 h-10 text-slate-200 mb-3" />
                <p className="text-sm">Aucun nouveau message</p>
              </div>
            </div>
          )}

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-900">Notifications</h3>
                <span className="text-xs text-blue-600 font-medium cursor-pointer" onClick={() => setShowNotifications(false)}>Tout marquer comme lu</span>
              </div>
              <div className="divide-y divide-slate-50">
                <div className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 leading-tight">Sokoo v1.0 activé</p>
                    <p className="text-xs text-slate-500 mt-1">L'espace Super Admin est désormais pleinement opérationnel.</p>
                    <p className="text-[10px] text-slate-400 mt-2">À l'instant</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => alert("Menu Profil à venir")}>
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
            <span className="font-bold">A</span>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-900 leading-tight">Admin Sokoo</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
