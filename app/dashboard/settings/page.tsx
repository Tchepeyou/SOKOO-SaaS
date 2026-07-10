"use client";

import { useState, useEffect, Suspense } from "react";
import { Store, CreditCard, BellRing, Shield, Check, Smartphone, Mail, Key, Plus, MapPin, Package, Edit, Trash2, MessageCircle, ArrowRight, X, ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";

function SettingsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("Abonnement");
  
  const tabs = ["Abonnement", "Notifications", "Sécurité", "Légal & Support"];

  useEffect(() => {
    if (searchParams.get("tab") === "boutiques") {
      setActiveTab("Mes Boutiques");
    }
  }, [searchParams]);

  const handleAction = (message: string) => {
    alert(message);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Paramètres</h2>
        <p className="text-slate-500">Gérez les informations de votre boutique et vos préférences.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
        <div className="flex border-b border-slate-100 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === tab 
                  ? "text-brand-blue" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-blue rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-8">
          
          {/* TAB: ABONNEMENT */}
          {activeTab === "Abonnement" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6">
                  <CreditCard className="w-5 h-5 text-brand-green" />
                  Forfait & Facturation
                </h3>
                
                <div className="bg-gradient-to-r from-brand-dark to-slate-800 rounded-2xl p-6 text-white mb-8 shadow-lg shadow-brand-dark/10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-brand-blue font-semibold uppercase tracking-wider text-xs mb-1">Plan Actuel</p>
                      <h4 className="text-2xl font-bold">Essentiel (Essai Gratuit)</h4>
                      <p className="text-slate-300 mt-1 text-sm">Il vous reste 14 jours d'essai gratuit.</p>
                    </div>
                    <button onClick={() => handleAction("Redirection vers la page de paiement...")} className="bg-brand-green text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap shadow-sm">
                      Passer en Premium
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Plan Starter */}
                  <div className="border border-slate-200 rounded-2xl p-6 relative flex flex-col bg-white">
                    <h4 className="text-lg font-bold text-slate-900">Starter</h4>
                    <p className="text-sm text-slate-500 mt-1">Boutique individuelle.</p>
                    <div className="mt-4 mb-6">
                      <span className="text-2xl font-bold text-slate-900">5 000</span>
                      <span className="text-sm text-slate-500"> FCFA/mois</span>
                    </div>
                    <ul className="space-y-3 mb-6 flex-1">
                      {["Produits illimités", "Alertes de stock", "1 Utilisateur"].map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-tight">
                          <Check className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => handleAction("Vous êtes déjà sur ce plan.")} className="w-full text-center py-2 border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors">
                      Plan Actuel
                    </button>
                  </div>

                  {/* Plan Business */}
                  <div className="border-2 border-brand-blue rounded-2xl p-6 relative bg-brand-blue/5 flex flex-col shadow-sm">
                    <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-brand-blue text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
                      Populaire
                    </div>
                    <h4 className="text-lg font-bold text-brand-blue">Business</h4>
                    <p className="text-sm text-slate-500 mt-1">Pour la croissance.</p>
                    <div className="mt-4 mb-6">
                      <span className="text-2xl font-bold text-slate-900">15 000+</span>
                      <span className="text-sm text-slate-500"> FCFA/mois</span>
                    </div>
                    <ul className="space-y-3 mb-6 flex-1">
                      {["Multi-points de vente", "Multi-utilisateurs", "Supervision à distance", "Rapports avancés"].map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-tight">
                          <Check className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => handleAction("Redirection vers la mise à niveau...")} className="w-full text-center py-2 bg-brand-blue text-white rounded-xl font-medium text-sm hover:bg-blue-600 transition-colors">
                      Mettre à niveau
                    </button>
                  </div>

                  {/* Plan Enterprise */}
                  <div className="border border-slate-200 rounded-2xl p-6 relative flex flex-col bg-white">
                    <h4 className="text-lg font-bold text-slate-900">Enterprise</h4>
                    <p className="text-sm text-slate-500 mt-1">Besoins sur-mesure.</p>
                    <div className="mt-4 mb-6">
                      <span className="text-2xl font-bold text-slate-900">Sur devis</span>
                    </div>
                    <ul className="space-y-3 mb-6 flex-1">
                      {["Besoins sur-mesure", "Accompagnement", "Intégration API"].map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-tight">
                          <Check className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <a 
                      href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER || "237000000000"}?text=${encodeURIComponent("Bonjour, je souhaite un devis pour le plan Enterprise.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block text-center py-2 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors"
                    >
                      Nous contacter
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === "Notifications" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6">
                  <BellRing className="w-5 h-5 text-brand-orange" />
                  Préférences de notification
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/50">
                    <div className="flex items-start gap-3">
                      <Smartphone className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-900">Alertes SMS pour rupture de stock</p>
                        <p className="text-sm text-slate-500">Recevez un SMS quand un produit atteint le seuil critique.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/50">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-900">Rapport hebdomadaire</p>
                        <p className="text-sm text-slate-500">Recevez un résumé de vos ventes par email chaque lundi.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={emailReports} onChange={(e) => setEmailReports(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SÉCURITÉ */}
          {activeTab === "Sécurité" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-slate-700" />
                  Sécurité du Compte
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/50">
                    <div className="flex items-start gap-3">
                      <Key className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-900">Double Authentification (2FA)</p>
                        <p className="text-sm text-slate-500">Sécurisez votre compte avec un code SMS à chaque connexion.</p>
                      </div>
                    </div>
                    <button onClick={() => handleAction("Configuration 2FA à venir...")} className="text-brand-blue font-medium text-sm hover:underline">
                      Configurer
                    </button>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <button onClick={() => handleAction("Tous les autres appareils ont été déconnectés.")} className="text-brand-red font-medium text-sm hover:bg-brand-red/10 px-4 py-2 rounded-lg transition-colors">
                      Déconnecter tous les autres appareils
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LÉGAL & SUPPORT */}
          {activeTab === "Légal & Support" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Support Section */}
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 border border-green-100">
                  <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2 mb-3">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    Besoin d'aide ?
                  </h3>
                  <p className="text-sm text-green-800 mb-6 leading-relaxed">
                    Notre équipe de support client est disponible sur WhatsApp pour répondre à toutes vos questions et vous accompagner.
                  </p>
                  <a 
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER || "237000000000"}?text=${encodeURIComponent("Bonjour, j'ai besoin d'aide avec Sokoo")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl transition-all shadow-sm shadow-green-500/20"
                  >
                    Contacter le support
                  </a>
                </div>

                {/* Legal Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-slate-500" />
                    Documents Légaux
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Consultez nos engagements concernant vos données et l'utilisation du service.
                  </p>
                  <div className="space-y-3">
                    <a href="/mentions-legales" target="_blank" className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-brand-blue hover:bg-blue-50/50 group transition-all">
                      <span className="font-medium text-slate-700 group-hover:text-brand-blue">Mentions Légales</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-blue group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a href="/confidentialite" target="_blank" className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-brand-blue hover:bg-blue-50/50 group transition-all">
                      <span className="font-medium text-slate-700 group-hover:text-brand-blue">Politique de Confidentialité</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-blue group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a href="/cgu" target="_blank" className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-brand-blue hover:bg-blue-50/50 group transition-all">
                      <span className="font-medium text-slate-700 group-hover:text-brand-blue">Conditions Générales (CGU)</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-blue group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 animate-pulse">Chargement des paramètres...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
