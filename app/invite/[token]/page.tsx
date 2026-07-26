import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Store, ArrowRight } from "lucide-react";
import Link from "next/link";
import { acceptInvite } from "@/lib/actions/team";

export default async function InvitePage({ params }: { params: { token: string } }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const { data: invite, error } = await supabase
    .from("invites")
    .select("*, organizations(name)")
    .eq("token", params.token)
    .is("accepted_at", null)
    .single();

  if (error || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Invitation Invalide</h2>
          <p className="text-slate-500 mb-6">Cette invitation n'existe plus ou a déjà été acceptée.</p>
          <Link href="/" className="inline-flex items-center justify-center w-full px-4 py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  // If user is not logged in, tell them to log in with the correct phone number
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Invitation reçue !</h2>
          <p className="text-slate-500 mb-6">
            Vous avez été invité à rejoindre la boutique <strong>{invite.organizations?.name}</strong>.
          </p>
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 p-3 rounded-lg mb-6">
            Veuillez vous inscrire ou vous connecter avec le numéro <strong>{invite.phone}</strong> pour accepter.
          </p>
          <Link href={`/login?mode=signup&next=/invite/${params.token}`} className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
            Créer mon compte <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // If user is logged in, but not with the right phone number (in a real app we might check this)
  const { data: profile } = await supabase.from("profiles").select("phone, organization_id").eq("id", session.user.id).single();
  
  if (profile?.phone && profile.phone !== invite.phone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Numéro incorrect</h2>
          <p className="text-slate-500 mb-6">
            Cette invitation est pour le numéro {invite.phone}. Vous êtes connecté avec {profile.phone}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-6">
          <Store className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Rejoindre l'équipe</h2>
        <p className="text-slate-500 mb-8 text-lg">
          Acceptez-vous de rejoindre <strong>{invite.organizations?.name}</strong> ?
        </p>
        
        <form action={async () => {
          "use server";
          await acceptInvite(params.token);
          redirect("/dashboard");
        }}>
          <button type="submit" className="inline-flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-brand-dark text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm text-lg">
            Accepter l'invitation <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
