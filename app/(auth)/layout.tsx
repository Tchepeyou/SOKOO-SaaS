export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Colonne Gauche - Branding (Masquée sur mobile) */}
      <div className="relative hidden w-0 flex-1 lg:block bg-[#090f1e] overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-brand-blue/20 rounded-full blur-[120px] opacity-70 animate-pulse mix-blend-screen" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-brand-purple/20 rounded-full blur-[100px] opacity-60 mix-blend-screen" style={{ animationDuration: '10s' }}></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </div>

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16 z-10">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
                <img src="/sokoo_logo_s_only_perfect.png" alt="Sokoo Logo" className="h-10 w-auto object-contain drop-shadow-md" />
              </div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Sokoo</h1>
            </div>
            
            <h2 className="mt-6 text-4xl xl:text-5xl font-semibold text-white max-w-lg leading-[1.15] tracking-tight">
              Prenez le <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-cyan-400">contrôle absolu</span> de votre inventaire.
            </h2>
            <p className="mt-5 text-lg text-slate-400 max-w-md leading-relaxed font-light">
              Rejoignez des centaines de gérants en Afrique qui ont transformé la gestion de leur boutique grâce à une solution simple, rapide et puissante.
            </p>
          </div>

          <div className="space-y-10">
            {/* Minimalist Feature List instead of Testimonial */}
            <div className="flex flex-col gap-5 max-w-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-blue to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-blue/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">Temps réel</h3>
                  <p className="text-slate-400 text-sm">Suivi instantané des ventes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-purple to-pink-400 flex items-center justify-center shadow-lg shadow-brand-purple/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">Gestion Multi-caisses</h3>
                  <p className="text-slate-400 text-sm">Synchronisation parfaite</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-400/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">Statistiques Détaillées</h3>
                  <p className="text-slate-400 text-sm">Visualisez votre croissance</p>
                </div>
              </div>
            </div>
            
            {/* Quick trust indicator */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#090f1e] flex items-center justify-center text-xs font-bold text-white ${i===0 ? 'bg-brand-blue' : i===1 ? 'bg-brand-purple' : 'bg-emerald-500 z-10'}`}>
                    {i===0 ? 'JD' : i===1 ? 'ML' : '+'}
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-slate-400">
                Déjà adopté par <span className="text-white">+500 boutiques</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne Droite - Formulaire */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo visible uniquement sur mobile */}
          <div className="lg:hidden flex flex-col items-center text-center mb-10">
            <div className="flex items-center gap-3 mb-4">
              <img src="/sokoo_logo_s_only_perfect.png" alt="Sokoo Logo" className="h-12 w-auto object-contain drop-shadow-sm py-0.5" />
              <h2 className="text-4xl font-bold text-brand-dark tracking-tight">Sokoo</h2>
            </div>
            <p className="text-sm text-slate-500">
              Gérez votre stock en toute simplicité
            </p>
          </div>

          <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl shadow-brand-blue/5 rounded-3xl border border-slate-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
