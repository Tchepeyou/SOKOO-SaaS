import Link from "next/link";
import { ArrowRight, Package, TrendingUp, BellRing, Store, ShieldCheck } from "lucide-react";

export default function VitrineHomePage() {
  return (
    <div className="flex flex-col items-center">
      
      {/* HERO SECTION */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 text-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-brand-blue/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-brand-blue text-sm font-semibold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
            </span>
            Sokoo 2.0 est maintenant disponible
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            La gestion de stock <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-600">
              simplifiée et intelligente
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
            Gardez le contrôle sur vos produits, vos points de vente et votre équipe avec un tableau de bord pensé pour la croissance de votre entreprise. Fini les ruptures surprises.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/login?mode=signup"
              className="w-full sm:w-auto px-8 py-4 bg-brand-dark text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
            >
              Commencer gratuitement
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/tarifs"
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-colors"
            >
              Voir les tarifs
            </Link>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-500"/> Sans carte bancaire</div>
            <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-500"/> Support 7j/7</div>
          </div>
        </div>
        
        {/* Real Dashboard Preview */}
        <div className="relative mt-20 w-full max-w-5xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
          <div className="rounded-2xl border border-slate-200/60 shadow-2xl overflow-hidden bg-slate-50 p-2 sm:p-4 ring-1 ring-black/5">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex">
              <img 
                src="/images/dashboard-preview.png" 
                alt="Aperçu du tableau de bord Sokoo" 
                className="w-full h-auto object-cover object-top rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="w-full bg-slate-50 py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Tout ce dont vous avez besoin pour grandir</h2>
            <p className="text-slate-600 text-lg">Sokoo intègre toutes les fonctionnalités nécessaires pour piloter sereinement votre activité commerciale.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center mb-6">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Suivi en temps réel</h3>
              <p className="text-slate-600 leading-relaxed">
                Suivez vos entrées et sorties de stock instantanément. L'historique complet est toujours disponible et exportable.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <BellRing className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Alertes Intelligentes</h3>
              <p className="text-slate-600 leading-relaxed">
                Ne soyez plus jamais en rupture. Recevez des notifications automatiques lorsque le stock d'un produit devient faible.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Store className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-boutiques</h3>
              <p className="text-slate-600 leading-relaxed">
                Gérez plusieurs points de vente et centralisez toute votre activité sur un seul et même tableau de bord puissant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="w-full bg-brand-dark py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Prêt à révolutionner votre gestion ?</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
            Rejoignez les centaines de gérants qui ont choisi Sokoo pour simplifier leur quotidien et augmenter leur rentabilité.
          </p>
          <Link 
            href="/login?mode=signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-blue text-white rounded-2xl font-bold text-lg hover:bg-blue-600 transition-colors shadow-xl shadow-brand-blue/20"
          >
            Créer mon compte
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}
