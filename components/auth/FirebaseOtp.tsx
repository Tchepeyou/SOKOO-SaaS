"use client";

import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/firebase/client";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { Phone, ArrowRight, ShieldCheck, Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FirebasePasswordReset() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "password">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Initialiser le recaptcha
    if (!window.recaptchaVerifier && recaptchaContainerRef.current) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        size: "invisible",
      });
    }
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  const formatPhoneNumber = (number: string) => {
    const cleaned = number.replace(/\s+/g, '');
    return cleaned.startsWith("+") ? cleaned : `+237${cleaned}`;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);
    setError(null);

    try {
      const formattedPhone = formatPhoneNumber(phone);
      if (!window.recaptchaVerifier) {
        throw new Error("Recaptcha non initialisé");
      }

      const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(result);
      setStep("otp");
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      const errorMessage = err?.message || "Erreur inconnue";
      setError(`Erreur lors de l'envoi du SMS : ${errorMessage}`);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current!, { size: "invisible" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Vérifier le code OTP avec Firebase
      const result = await confirmationResult.confirm(otp);
      
      // 2. Récupérer le token sécurisé
      const token = await result.user.getIdToken();
      setIdToken(token);
      
      // 3. Passer à l'étape du nouveau mot de passe
      setStep("password");
      
    } catch (err: any) {
      console.error(err);
      setError("Code incorrect ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6 || !idToken) {
      setError("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/firebase-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, newPassword })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la réinitialisation");
      }

      // Mot de passe changé et connecté avec succès !
      router.push("/dashboard");
      router.refresh();
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8 text-center sm:text-left">
        <h3 className="text-2xl font-bold text-slate-900">
          Récupération de compte
        </h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          {step === "phone" && "Entrez votre numéro pour recevoir un code de sécurité par SMS."}
          {step === "otp" && "Entrez le code de vérification reçu par SMS."}
          {step === "password" && "Votre numéro est vérifié. Choisissez un nouveau mot de passe."}
        </p>
      </div>

      <div ref={recaptchaContainerRef}></div>

      {step === "phone" && (
        <form onSubmit={handleSendCode} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium leading-6 text-slate-700">
              Votre numéro de téléphone
            </label>
            <div className="relative mt-2 rounded-2xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Phone className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="block w-full rounded-2xl border-0 py-3.5 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6 transition-all hover:ring-slate-300"
                placeholder="Ex: 655 00 00 00"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full justify-center items-center gap-2 rounded-2xl bg-brand-dark px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-dark/20 hover:bg-slate-800 disabled:opacity-70 transition-all duration-200"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Recevoir le code SMS"}
            {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
          </button>
          
          <div className="text-center">
            <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
              Retour à la connexion
            </Link>
          </div>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium leading-6 text-slate-700">
              Code de vérification
            </label>
            <div className="relative mt-2 rounded-2xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <ShieldCheck className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="otp"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="block w-full rounded-2xl border-0 py-3.5 pl-12 pr-4 text-center tracking-[0.5em] text-xl font-bold text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-blue transition-all"
                placeholder="000000"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">Un SMS a été envoyé au {formatPhoneNumber(phone)}</p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="flex w-full justify-center items-center gap-2 rounded-2xl bg-brand-blue px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-blue/20 hover:bg-blue-600 disabled:opacity-70 transition-all duration-200"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Vérifier le code"}
            </button>
            
            <button
              type="button"
              onClick={() => { setStep("phone"); setOtp(""); setError(null); }}
              className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors py-2"
            >
              Modifier le numéro
            </button>
          </div>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={handleResetPassword} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium leading-6 text-slate-700">
              Nouveau mot de passe
            </label>
            <div className="relative mt-2 rounded-2xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="block w-full rounded-2xl border-0 py-3.5 pl-12 pr-12 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6 transition-all hover:ring-slate-300"
                placeholder="Nouveau mot de passe"
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
            <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || newPassword.length < 6}
            className="group flex w-full justify-center items-center gap-2 rounded-2xl bg-green-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-600/20 hover:bg-green-700 disabled:opacity-70 transition-all duration-200"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enregistrer et se connecter"}
            {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      )}
    </div>
  );
}
