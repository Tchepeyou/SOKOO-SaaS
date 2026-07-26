"use client";

import { WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-light p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
        <div className="mx-auto w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
          <WifiOff className="w-10 h-10 text-brand-blue" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Vous êtes hors ligne
        </h1>
        <p className="text-slate-500 mb-8">
          Vérifiez votre connexion internet. Sokoo reste partiellement accessible pour consulter vos stocks.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full py-2.5 px-4 bg-brand-blue hover:bg-brand-blue-600 text-white font-medium rounded-xl transition-colors"
          >
            Aller au tableau de bord
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-xl transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );
}
