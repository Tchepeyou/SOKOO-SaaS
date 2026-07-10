"use client";

import { Store, MapPin, Package, ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call / save configuration
    setTimeout(() => {
      // In a real app, we would save this to the DB here or via Server Action
      // We will redirect to dashboard
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-brand-blue/10 text-brand-blue rounded-2xl mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Configurez votre boutique</h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Pour commencer à utiliser Sokoo, veuillez renseigner les informations de votre premier point de vente.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Nom de la boutique</label>
          <div className="relative rounded-2xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Store className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="storeName"
              required
              className="block w-full rounded-2xl border-0 py-3.5 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm transition-all hover:ring-slate-300 bg-slate-50 focus:bg-white outline-none"
              placeholder="Ex: Quincaillerie du Centre"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Catégorie d'activité</label>
          <div className="relative rounded-2xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Package className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <select
              name="category"
              required
              className="block w-full appearance-none rounded-2xl border-0 py-3.5 pl-12 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm transition-all hover:ring-slate-300 bg-slate-50 focus:bg-white outline-none cursor-pointer"
            >
              <option value="">Sélectionnez un secteur...</option>
              <option value="alimentation">Alimentation & Supermarché</option>
              <option value="mode">Boutique de Mode & Vêtements</option>
              <option value="quincaillerie">Quincaillerie & Matériaux</option>
              <option value="electronique">Électronique & Électroménager</option>
              <option value="pharmacie">Pharmacie & Santé</option>
              <option value="autre">Autre (Services, divers...)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <ChevronDown className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Ville / Quartier</label>
          <div className="relative rounded-2xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <MapPin className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="location"
              required
              className="block w-full rounded-2xl border-0 py-3.5 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm transition-all hover:ring-slate-300 bg-slate-50 focus:bg-white outline-none"
              placeholder="Ex: Douala, Akwa"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex w-full justify-center items-center gap-2 rounded-2xl bg-brand-blue px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90 hover:shadow-brand-blue/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? "Création en cours..." : "Créer ma boutique"}
            {!isSubmitting && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>
      </form>
    </div>
  );
}
