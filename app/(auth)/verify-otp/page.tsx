"use client";

import { useFormStatus } from "react-dom";
import { verify } from "@/lib/actions/auth";
import { KeyRound, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex w-full justify-center items-center gap-2 rounded-2xl bg-brand-dark px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-dark/20 hover:bg-slate-800 hover:shadow-brand-dark/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
    >
      {pending ? "Vérification..." : "Accéder à mon espace"}
      {!pending && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
    </button>
  );
}

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const phone = searchParams.get("phone");
  const mode = searchParams.get("mode") || "login";

  useEffect(() => {
    if (!phone) {
      router.replace("/login");
    }
  }, [phone, router]);

  if (!phone) return null;

  async function clientAction(formData: FormData) {
    setError(null);
    const result = await verify(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 px-3 py-1.5 rounded-full transition-all border border-slate-100">
          <ArrowLeft className="h-4 w-4" />
          Modifier le numéro
        </Link>
      </div>
      <div className="mb-8 mt-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-50 text-brand-blue rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Vérification Sécurisée</h3>
        </div>
        <p className="mt-4 text-sm text-slate-500 leading-relaxed">
          Nous avons envoyé un code à 6 chiffres par SMS au numéro : <br/>
          <span className="font-semibold text-brand-blue bg-blue-50/50 px-2.5 py-1 rounded-md inline-block mt-2 border border-blue-100/50">{phone}</span>
        </p>
      </div>

      <form action={clientAction} className="space-y-6">
        <input type="hidden" name="phone" value={phone} />
        <input type="hidden" name="mode" value={mode} />
        
        <div>
          <label htmlFor="token" className="block text-sm font-medium leading-6 text-slate-700">
            Code secret
          </label>
          <div className="relative mt-2 rounded-2xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <KeyRound className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="token"
              id="token"
              required
              maxLength={6}
              className="block w-full h-[52px] rounded-2xl border-0 py-3.5 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-xl tracking-[0.5em] font-mono sm:leading-6 text-center transition-all hover:ring-slate-300 uppercase bg-slate-50 focus:bg-white"
              placeholder="000000"
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

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 animate-pulse">Chargement...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
