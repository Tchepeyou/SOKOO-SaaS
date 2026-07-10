export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Colonne Gauche - Branding (Masquée sur mobile) */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-brand-dark overflow-hidden">
          {/* Cercles décoratifs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-blue/20 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 w-full h-[120%] bg-gradient-to-tr from-brand-purple/20 via-transparent to-brand-green/20 blur-3xl"></div>
        </div>
        <div className="relative flex h-full flex-col justify-between p-12 z-10">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Sokoo</h1>
            <p className="mt-4 text-xl text-slate-300 max-w-md leading-relaxed">
              La solution simple et puissante pour gérer l'inventaire de votre boutique en Afrique.
            </p>
          </div>
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl max-w-sm">
              <p className="text-white font-medium text-lg">"Depuis que j'utilise Sokoo, je n'ai plus jamais eu de mauvaise surprise lors de mes inventaires."</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold">
                  AM
                </div>
                <div>
                  <p className="text-white font-semibold">Alain M.</p>
                  <p className="text-slate-300 text-sm">Gérant d'Alimentation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne Droite - Formulaire */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo visible uniquement sur mobile */}
          <div className="lg:hidden text-center mb-10">
            <h2 className="text-4xl font-bold text-brand-dark tracking-tight">Sokoo</h2>
            <p className="mt-2 text-sm text-slate-500">
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
