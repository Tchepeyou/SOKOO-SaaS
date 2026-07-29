import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { idToken, newPassword } = await req.json();

    if (!idToken || !newPassword) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // 1. Vérifier le token avec Firebase Admin
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const phone_number = decodedToken.phone_number;

    if (!phone_number) {
      return NextResponse.json({ error: "Numéro de téléphone introuvable dans le token" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // 2. Chercher si l'utilisateur existe déjà dans Supabase
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("phone", phone_number)
      .single();

    if (!profile?.id) {
      return NextResponse.json({ error: "Aucun compte associé à ce numéro." }, { status: 404 });
    }

    // 3. L'utilisateur existe, on met à jour son mot de passe
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(profile.id, {
      password: newPassword,
      phone_confirm: true,
    });

    if (updateError) {
      console.error("Erreur mise à jour mdp:", updateError);
      return NextResponse.json({ error: "Erreur lors de la mise à jour du mot de passe." }, { status: 500 });
    }

    // 4. Connecter l'utilisateur pour générer la session et les cookies
    const supabaseClient = createClient();
    const pseudoEmail = `${phone_number.replace('+', '')}@sokoo.app`;
    const { data: sessionData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: pseudoEmail,
      password: newPassword,
    });

    if (signInError) {
      console.error("Erreur SignIn Supabase post-reset:", signInError);
      return NextResponse.json({ error: "Mot de passe modifié, mais connexion automatique échouée." }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: sessionData.user });
  } catch (error: any) {
    console.error("Erreur Firebase Reset:", error);
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status: 500 });
  }
}
