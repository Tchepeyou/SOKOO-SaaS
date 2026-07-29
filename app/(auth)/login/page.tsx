"use client";

import { useFormStatus } from "react-dom";
import { loginWithPassword, registerWithPassword } from "@/lib/actions/auth";
import { Phone, Lock, ArrowRight, Loader2, UserPlus, LogIn, Eye, EyeOff } from "lucide-react";
import { useState, Suspense, useEffect } from "react";
import Link from "next/link";

function SubmitButton({ isLogin }: { isLogin: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex w-full justify-center items-center gap-2 rounded-2xl bg-brand-dark px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-dark/20 hover:bg-slate-800 hover:shadow-brand-dark/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : isLogin ? "Se connecter" : "Créer mon compte"}
      {!pending && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
    </button>
  );
}

import { useSearchParams } from "next/navigation";

function LoginContent() {
  const searchParams = useSearchParams();
  const defaultIsLogin = searchParams.get("mode") !== "signup";
  
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    import("@/lib/db").then(({ db }) => {
      Promise.all([
        db.products.clear(),
        db.sales.clear(),
        db.movements.clear(),
        db.locations.clear(),
        db.teamMembers.clear()
      ]).catch(console.error);
    });
  }, []);

  async function clientAction(formData: FormData) {
    if (!navigator.onLine) {
      setError("Vous êtes hors ligne. Une connexion internet est requise.");
      return;
    }
    setError(null);
    const action = isLogin ? loginWithPassword : registerWithPassword;
    const result = await action(formData);
    
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-sm mx-auto">
      <div className="mb-8 text-center sm:text-left">
        <h3 className="text-2xl font-bold text-slate-900">
          {isLogin ? "Bienvenue sur Sokoo 👋" : "Créez votre boutique 🚀"}
        </h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          {isLogin 
            ? "Saisissez vos identifiants pour accéder à votre tableau de bord." 
            : "Renseignez votre numéro et un mot de passe pour démarrer gratuitement."}
        </p>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
        <button
          type="button"
          onClick={() => { setIsLogin(true); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            isLogin ? "bg-white text-brand-dark shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <LogIn className="h-4 w-4" />
          Connexion
        </button>
        <button
          type="button"
          onClick={() => { setIsLogin(false); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            !isLogin ? "bg-white text-brand-dark shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <UserPlus className="h-4 w-4" />
          Inscription
        </button>
      </div>

      <form action={clientAction} className="space-y-5">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium leading-6 text-slate-700">
            Numéro de téléphone
          </label>
          <div className="relative mt-2 rounded-2xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Phone className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="tel"
              name="phone"
              id="phone"
              required
              className="block w-full rounded-2xl border-0 py-3.5 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6 transition-all hover:ring-slate-300"
              placeholder="Ex: 655 00 00 00"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-700">
              Mot de passe
            </label>
            {isLogin && (
              <Link href="/forgot-password" className="text-sm font-medium text-brand-blue hover:text-blue-500 transition-colors">
                Oublié ?
              </Link>
            )}
          </div>
          <div className="relative mt-2 rounded-2xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              required
              minLength={6}
              className="block w-full rounded-2xl border-0 py-3.5 pl-12 pr-12 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6 transition-all hover:ring-slate-300"
              placeholder={isLogin ? "Votre mot de passe" : "Minimum 6 caractères"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="animate-in fade-in text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
        )}

        <div className="pt-4">
          <SubmitButton isLogin={isLogin} />
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 animate-pulse">Chargement...</div>}>
      <LoginContent />
    </Suspense>
  );
}
