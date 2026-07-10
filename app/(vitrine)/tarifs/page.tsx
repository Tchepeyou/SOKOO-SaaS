"use client";

import { Check, MessageCircle, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER || "237000000000";
  const enterpriseMessage = encodeURIComponent("Bonjour, je souhaite avoir un devis pour le plan Enterprise Sokoo.");
  const enterpriseUrl = `https://wa.me/${whatsappNumber}?text=${enterpriseMessage}`;

  return (
    <div className="py-12 sm:py-24 relative">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-blue transition-colors bg-slate-50 hover:bg-blue-50 px-4 py-2 rounded-full border border-slate-100">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-12 sm:mt-0">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-brand-blue">Tarification simple et transparente</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Choisissez le plan adapté à votre activité
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-slate-600">
          Sans engagement. Commencez gratuitement pendant 14 jours et passez à la vitesse supérieure quand vous êtes prêt.
        </p>
        
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
          {/* Plan Starter */}
          <div className="rounded-3xl p-8 ring-1 ring-slate-200 xl:p-10 flex flex-col hover:shadow-xl transition-shadow duration-300 bg-white">
            <h3 className="text-lg font-semibold leading-8 text-slate-900">Starter</h3>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Idéal pour les petits commerçants gérant une seule boutique physique.
            </p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-slate-900">5 000</span>
              <span className="text-sm font-semibold leading-6 text-slate-600">FCFA / mois</span>
            </p>
            <Link
              href="/login?mode=signup"
              className="mt-6 block rounded-xl bg-brand-blue/10 px-3 py-3 text-center text-sm font-semibold leading-6 text-brand-blue hover:bg-brand-blue hover:text-white transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            >
              Essai gratuit 14 jours <ArrowRight className="inline-block ml-1 w-4 h-4" />
            </Link>
            <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600 flex-1">
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-brand-blue" aria-hidden="true" />
                1 Boutique individuelle
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-brand-blue" aria-hidden="true" />
                Produits illimités
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-brand-blue" aria-hidden="true" />
                Alertes de stock faible
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-brand-blue" aria-hidden="true" />
                1 Compte utilisateur
              </li>
            </ul>
          </div>

          {/* Plan Business */}
          <div className="rounded-3xl p-8 ring-2 ring-brand-blue xl:p-10 flex flex-col shadow-xl bg-white relative">
            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
              <span className="bg-brand-blue text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Le plus populaire
              </span>
            </div>
            <h3 className="text-lg font-semibold leading-8 text-brand-blue">Business</h3>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Pour les réseaux de boutiques et les entreprises en pleine croissance.
            </p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-slate-900">15 000+</span>
              <span className="text-sm font-semibold leading-6 text-slate-600">FCFA / mois</span>
            </p>
            <Link
              href="/login?mode=signup"
              className="mt-6 block rounded-xl bg-brand-blue px-3 py-3 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-600 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            >
              Essai gratuit 14 jours <ArrowRight className="inline-block ml-1 w-4 h-4" />
            </Link>
            <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600 flex-1">
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-brand-blue" aria-hidden="true" />
                Multi-points de vente
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-brand-blue" aria-hidden="true" />
                Comptes multi-utilisateurs
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-brand-blue" aria-hidden="true" />
                Supervision à distance
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-brand-blue" aria-hidden="true" />
                Rapports avancés et statistiques
              </li>
            </ul>
          </div>

          {/* Plan Enterprise */}
          <div className="rounded-3xl p-8 ring-1 ring-slate-200 xl:p-10 flex flex-col hover:shadow-xl transition-shadow duration-300 bg-white">
            <h3 className="text-lg font-semibold leading-8 text-slate-900">Enterprise</h3>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Des solutions sur-mesure pour les grandes entreprises et grossistes.
            </p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-slate-900">Sur devis</span>
            </p>
            <a
              href={enterpriseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-3 text-center text-sm font-semibold leading-6 text-white hover:bg-slate-800 transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4" /> Nous contacter
            </a>
            <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600 flex-1">
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-brand-blue" aria-hidden="true" />
                Besoins sur-mesure
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-brand-blue" aria-hidden="true" />
                Accompagnement dédié
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-brand-blue" aria-hidden="true" />
                Intégration API personnalisée
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
