import FirebasePasswordReset from "@/components/auth/FirebaseOtp";
import { Suspense } from "react";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 animate-pulse">Chargement...</div>}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-sm mx-auto">
        <FirebasePasswordReset />
      </div>
    </Suspense>
  );
}
