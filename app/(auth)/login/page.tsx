"use client";

import { useFormStatus } from "react-dom";
import { signIn } from "@/lib/actions/auth";
import { Phone, ArrowRight } from "lucide-react";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function SubmitButton({ mode }: { mode: "login" | "signup" }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex w-full justify-center items-center gap-2 rounded-2xl bg-brand-dark px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-dark/20 hover:bg-slate-800 hover:shadow-brand-dark/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
    >
      {pending ? "Envoi en cours..." : (mode === "login" ? "Se connecter" : "S'inscrire")}
      {!pending && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
    </button>
  );
}

function LoginContent() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    const queryMode = searchParams.get("mode");
    if (queryMode === "signup" || queryMode === "login") {
      setMode(queryMode);
    }
  }, [searchParams]);

  async function clientAction(formData: FormData) {
    setError(null);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900">
          {mode === "login" ? "Connexion 👋" : "Inscription 👋"}
        </h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          {mode === "login" 
            ? "Saisissez votre numéro de téléphone pour accéder à votre espace." 
            : "Saisissez votre numéro de téléphone. Un code vous sera envoyé par SMS pour créer votre boutique."}
        </p>
      </div>

      <div className="flex bg-slate-100/80 p-1 rounded-2xl mb-8 relative">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 z-10 ${
            mode === "login" ? "text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Connexion
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 z-10 ${
            mode === "signup" ? "text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Inscription
        </button>
        <div 
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-in-out ${
            mode === "login" ? "left-1" : "left-[calc(50%+2px)]"
          }`}
        />
      </div>

      <form action={clientAction} className="space-y-6">
        <input type="hidden" name="mode" value={mode} />
        <div>
          <label htmlFor="phone" className="block text-sm font-medium leading-6 text-slate-700">
            Votre numéro
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

        {error && (
          <div className="animate-in fade-in text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
        )}

        <div className="pt-2">
          <SubmitButton mode={mode} />
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
