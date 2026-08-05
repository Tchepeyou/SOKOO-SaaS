"use client";

import { useState, useEffect, Suspense, useTransition } from "react";
import { toast } from "sonner";
import { Store, CreditCard, BellRing, Shield, Check, Smartphone, Mail, Key, Plus, MapPin, Package, Edit, Trash2, MessageCircle, ArrowRight, X, ChevronDown, User } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { updateUserProfile } from "@/lib/actions/profile";
import { createSubscriptionPayment } from "@/lib/actions/billing";
import { createClient } from "@/lib/supabase/client";
import SupportTickets from "@/components/dashboard/SupportTickets";
import { useLocation } from "@/lib/contexts/LocationContext";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

function SettingsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("Abonnement");
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailReports, setEmailReports] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const tabs = ["Abonnement", "Profil", "Mes Boutiques", "Notifications", "Sécurité", "Légal & Support"];

  const { activeLocationId } = useLocation();
  const activeStore = useLiveQuery(() => 
    activeLocationId ? db.locations.get(activeLocationId) : undefined
  , [activeLocationId]);

  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("checkout") === "chariow_success") {
      setUpdateMessage({ type: "success", text: "Félicitations ! Votre paiement a été traité et votre abonnement est actif." });
      // Nettoyer l'URL
      const newUrl = window.location.pathname + "?tab=Abonnement";
      window.history.replaceState({}, "", newUrl);
    } else if (searchParams.get("tab") === "boutiques") {
      setActiveTab("Mes Boutiques");
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Charger les préférences depuis user_metadata
          const metadata = session.user.user_metadata || {};
          if (metadata.smsAlerts !== undefined) setSmsAlerts(metadata.smsAlerts);
          if (metadata.emailReports !== undefined) setEmailReports(metadata.emailReports);

          const { data: profile } = await supabase
            .from("profiles")
            .select(`
              *,
              organizations(name, created_at, subscriptions(plan, status, current_period_end)),
              locations(name, address)
            `)
            .eq("id", session.user.id)
            .single();
          if (profile) setProfileData(profile);
        }
      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    fetchProfile();
  }, []);

  const handleAction = (message: string) => {
    toast.info(message);
  };

  const updatePreference = async (key: 'smsAlerts' | 'emailReports', value: boolean) => {
    if (key === 'smsAlerts') setSmsAlerts(value);
    if (key === 'emailReports') setEmailReports(value);
    
    try {
      const supabase = createClient();
      await supabase.auth.updateUser({
        data: { [key]: value }
      });
    } catch (error) {
      console.error("Erreur de sauvegarde des préférences", error);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const actualPlanId = planId === 'premium' ? 'business' : planId;
      const result = await createSubscriptionPayment(actualPlanId);
      if (result?.error) {
        toast.error(result.error);
        setLoadingPlan(null);
      } else if (result?.url) {
        window.location.href = result.url;
      } else {
        setLoadingPlan(null);
      }
    } catch (error) {
      console.error(error);
      setLoadingPlan(null);
    }
  };

  const handleProfileUpdate = (formData: FormData) => {
    setUpdateMessage(null);
    startTransition(async () => {
      const result = await updateUserProfile(formData);
      if (result?.error) {
        setUpdateMessage({ type: "error", text: result.error });
      } else if (result?.success) {
        setUpdateMessage({ type: "success", text: "Profil mis à jour avec succès." });
      }
    });
  };

  let currentPlanName = "Essentiel (Essai Gratuit)";
  let daysRemainingText = "Calcul des jours restants...";
  let showPremiumButton = true;

  if (profileData?.organizations) {
    const org = profileData.organizations;
    const activeSub = org.subscriptions?.find((s: any) => s.status === 'active');

    if (activeSub) {
      currentPlanName = activeSub.plan === 'starter' ? 'Starter' : activeSub.plan === 'business' ? 'Business' : 'Enterprise';
      const endDate = new Date(activeSub.current_period_end);
      const diffTime = endDate.getTime() - new Date().getTime();
      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      daysRemainingText = diffDays > 0 ? `Il vous reste ${diffDays} jours d'abonnement.` : "Votre abonnement a expiré.";
      showPremiumButton = activeSub.plan === 'starter';
    } else {
      const trialEndsAt = new Date(new Date(org.created_at).getTime() + 14 * 24 * 60 * 60 * 1000);
      const diffTime = trialEndsAt.getTime() - new Date().getTime();
      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      daysRemainingText = diffDays > 0 ? `Il vous reste ${diffDays} jours d'essai gratuit.` : "Votre période d'essai a expiré.";
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full">
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
          
          {/* TAB: PROFIL */}
          {activeTab === "Profil" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              {isLoadingProfile ? (
                <div className="p-8 text-center text-slate-500 animate-pulse">Chargement du profil...</div>
              ) : (
                <form action={handleProfileUpdate} className="space-y-8">
                  {/* Informations Personnelles */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6">
                      <User className="w-5 h-5 text-brand-blue" />
                      Informations Personnelles
                    </h3>
                    
                    {activeLocationId && (
                      <input type="hidden" name="activeLocationId" value={activeLocationId} />
                    )}

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 grid sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
                          Nom complet
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <User className="h-5 w-5 text-slate-400" aria-hidden="true" />
                          </div>
                          <input
                            type="text"
                            name="fullName"
                            id="fullName"
                            defaultValue={profileData?.full_name || ""}
                            className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6 transition-all"
                            placeholder="Votre nom complet"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                          Numéro de téléphone (Connexion)
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Smartphone className="h-5 w-5 text-slate-400" aria-hidden="true" />
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            required
                            defaultValue={profileData?.phone || ""}
                            className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6 transition-all"
                            placeholder="Ex: 655 00 00 00"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Rôle sur la plateforme
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Shield className="h-5 w-5 text-slate-400" aria-hidden="true" />
                          </div>
                          <input
                            type="text"
                            disabled
                            value={profileData?.role === 'owner' ? 'Propriétaire' : profileData?.role === 'manager' ? 'Manager' : 'Employé'}
                            className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-4 text-slate-500 bg-slate-100 ring-1 ring-inset ring-slate-200 sm:text-sm sm:leading-6 cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Le rôle détermine vos droits d'accès. Seul le propriétaire peut le modifier.</p>
                      </div>
                    </div>
                  </div>

                  {/* Informations de la Boutique */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6">
                      <Store className="w-5 h-5 text-brand-orange" />
                      Informations de l'Entreprise
                    </h3>
                    
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 grid sm:grid-cols-2 gap-6">
                      <div className="sm:col-span-2">
                        <label htmlFor="orgName" className="block text-sm font-medium text-slate-700 mb-1">
                          Nom de l'entreprise / boutique principale
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Store className="h-5 w-5 text-slate-400" aria-hidden="true" />
                          </div>
                          <input
                            type="text"
                            name="orgName"
                            id="orgName"
                            defaultValue={profileData?.organizations?.name || ""}
                            className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6 transition-all"
                            placeholder="Ex: Ma Super Boutique"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="locationName" className="block text-sm font-medium text-slate-700 mb-1">
                          Nom du point de vente actuel
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Store className="h-5 w-5 text-slate-400" aria-hidden="true" />
                          </div>
                          <input
                            type="text"
                            name="locationName"
                            id="locationName"
                            defaultValue={activeStore?.name || profileData?.locations?.name || ""}
                            className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6 transition-all"
                            placeholder="Ex: Succursale Centre-ville"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="locationAddress" className="block text-sm font-medium text-slate-700 mb-1">
                          Adresse
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MapPin className="h-5 w-5 text-slate-400" aria-hidden="true" />
                          </div>
                          <input
                            type="text"
                            name="locationAddress"
                            id="locationAddress"
                            defaultValue={activeStore?.address || profileData?.locations?.address || ""}
                            className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6 transition-all"
                            placeholder="Ex: Rue des Marchands, Douala"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {updateMessage && (
                    <div className={`p-4 rounded-xl text-sm ${updateMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                      {updateMessage.text}
                    </div>
                  )}
                  
                  <div className="flex justify-end pt-4">
                    <button 
                      type="submit"
                      disabled={isPending}
                      className="inline-flex items-center justify-center bg-brand-blue text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-brand-blue/90 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {isPending ? "Enregistrement..." : "Enregistrer les modifications"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

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
                      <h4 className="text-2xl font-bold">{currentPlanName}</h4>
                      <p className="text-slate-300 mt-1 text-sm">{daysRemainingText}</p>
                    </div>
                    {showPremiumButton && (
                      <button disabled={loadingPlan === 'premium'} onClick={() => handleSubscribe('premium')} className="bg-brand-green text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap shadow-sm disabled:opacity-70">
                        {loadingPlan === 'premium' ? "Redirection..." : "Passer en Premium"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Plan Starter */}
                  <div className="border border-slate-200 rounded-2xl p-6 relative flex flex-col bg-white hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all duration-300">
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
                    <button disabled={loadingPlan === 'starter'} onClick={() => handleSubscribe('starter')} className="w-full text-center py-2 border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-70">
                      {loadingPlan === 'starter' ? "Patientez..." : "S'abonner"}
                    </button>
                  </div>

                  {/* Plan Business */}
                  <div className="border-2 border-brand-blue rounded-2xl p-6 relative bg-gradient-to-b from-brand-blue/5 to-white flex flex-col shadow-md shadow-brand-blue/10 hover:shadow-lg hover:shadow-brand-blue/20 hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-brand-blue text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                      Populaire
                    </div>
                    <h4 className="text-lg font-bold text-brand-blue">Business</h4>
                    <p className="text-sm text-slate-500 mt-1">Pour la croissance.</p>
                    <div className="mt-4 mb-6">
                      <span className="text-2xl font-bold text-slate-900">15 000</span>
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
                    <button disabled={loadingPlan === 'business'} onClick={() => handleSubscribe('business')} className="w-full text-center py-2 bg-brand-blue text-white rounded-xl font-medium text-sm hover:bg-blue-600 hover:shadow-md transition-all disabled:opacity-70">
                      {loadingPlan === 'business' ? "Patientez..." : "Mettre à niveau"}
                    </button>
                  </div>

                  {/* Plan Enterprise */}
                  <div className="border border-slate-200 rounded-2xl p-6 relative flex flex-col bg-white hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all duration-300">
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
                      className="w-full block text-center py-2 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 hover:shadow-md transition-all"
                    >
                      Nous contacter
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MES BOUTIQUES */}
          {activeTab === "Mes Boutiques" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6">
                  <Store className="w-5 h-5 text-brand-blue" />
                  Gestion de mes points de vente
                </h3>
                
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center mb-8">
                  <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-slate-900 font-medium mb-2">Ajouter un nouveau point de vente</h4>
                  <p className="text-slate-500 text-sm mb-4">Développez votre activité en gérant plusieurs points de vente depuis un seul compte.</p>
                  <button 
                    onClick={() => handleAction("L'ajout de boutiques multiples nécessite le plan Business. Redirection vers la page de mise à niveau...")} 
                    className="inline-flex items-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-blue/90 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Créer une succursale
                  </button>
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
                      <input type="checkbox" className="sr-only peer" checked={smsAlerts} onChange={(e) => updatePreference('smsAlerts', e.target.checked)} />
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
                      <input type="checkbox" className="sr-only peer" checked={emailReports} onChange={(e) => updatePreference('emailReports', e.target.checked)} />
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
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <SupportTickets />
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
