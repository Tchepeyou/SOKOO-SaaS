import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function ExpiredPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-6">
        <ShieldAlert className="w-16 h-16 text-red-500 dark:text-red-400" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Abonnement Expiré</h1>
      <p className="text-lg text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-2">
        La période d'essai de votre organisation est terminée ou l'abonnement a expiré.
      </p>
      <p className="text-md text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
        Veuillez contacter le propriétaire ou l'administrateur de la boutique pour renouveler l'abonnement afin de rétablir l'accès.
      </p>
      
      <div className="flex gap-4">
        <Link 
          href="/login" 
          className="px-6 py-2 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-dark/90 transition-colors"
        >
          Se connecter à un autre compte
        </Link>
      </div>
    </div>
  );
}
