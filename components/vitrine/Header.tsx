import Link from "next/link";
import { Package } from "lucide-react";

export default function VitrineHeader() {
  return (
    <header className="w-full bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Sokoo</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/tarifs" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Tarifs
            </Link>
            <Link 
              href="/login" 
              className="text-sm font-medium bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
