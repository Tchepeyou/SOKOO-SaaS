"use client";

import { useFormStatus } from "react-dom";
import { requestOtp } from "@/lib/actions/auth";
import { Phone, ArrowRight } from "lucide-react";
import { useState, Suspense, useEffect } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex w-full justify-center items-center gap-2 rounded-2xl bg-brand-dark px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-dark/20 hover:bg-slate-800 hover:shadow-brand-dark/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
    >
      {pending ? "Envoi en cours..." : "Continuer"}
      {!pending && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
    </button>
  );
}

function LoginContent() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Safety measure: Wipe local database if the user is on the login page
    // This prevents data leaks from previous sessions or mock data
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
      setError("Vous êtes hors ligne. Une connexion internet est requise pour vous connecter.");
      return;
    }
    setError(null);
    const result = await requestOtp(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-900">
          Bienvenue sur Sokoo 👋
        </h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Saisissez votre numéro de téléphone pour vous connecter ou créer votre espace gratuitement.
        </p>
      </div>

      <form action={clientAction} className="space-y-6">
        <input type="hidden" name="mode" value="auto" />
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
          <SubmitButton />
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
