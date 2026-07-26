import Link from "next/link";
import { Package, Globe } from "lucide-react";

export default function VitrineHeader() {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <img src="/sokoo_logo_s_only_perfect.png" alt="Sokoo Logo" className="h-10 w-auto object-contain drop-shadow-sm py-0.5" />
            <span className="text-2xl font-bold text-slate-900 tracking-tight">Sokoo</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-bold text-slate-900 hover:text-brand-blue transition-colors">
              Accueil
            </Link>
            <Link href="/#fonctionnalites" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Fonctionnalités
            </Link>
            <Link href="/#ressources" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Ressources
            </Link>
          </nav>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors">
              Se connecter
            </Link>
            <Link 
              href="/login?mode=signup" 
              className="hidden sm:block text-sm font-bold bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-md hover:shadow-lg text-center"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
