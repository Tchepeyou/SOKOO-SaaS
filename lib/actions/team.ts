"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkPlanLimits } from "@/lib/limits";

export async function createInvite(formData: FormData) {
  const phone = formData.get("phone") as string;
  const role = formData.get("role") as string;
  const name = formData.get("name") as string; // Optional but good for UI
  const location_id = formData.get("location_id") as string; // Optionnel (pour assigner une boutique)

  if (!phone || !role || !name) {
    return { error: "Tous les champs sont requis." };
  }

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: "Non autorisé" };
  }

  // Get user profile to find organization_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", session.user.id)
    .single();

  if (!profile?.organization_id || !["owner", "manager", "Admin"].includes(profile.role)) {
    return { error: "Vous n'avez pas les permissions nécessaires." };
  }

  // Vérifier la limite du plan
  const limits = await checkPlanLimits(profile.organization_id, 'users');
  if (!limits.allowed) {
    return { error: limits.message };
  }

  // Generate a random token
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const formattedPhone = phone.startsWith("+") ? phone.replace(/\s+/g, '') : `+237${phone.replace(/\s+/g, '')}`;

  const { data: invite, error } = await supabase
    .from("invites")
    .insert({
      organization_id: profile.organization_id,
      phone: formattedPhone,
      role: role,
      token: token,
      location_id: location_id || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Erreur création invitation:", error);
    return { error: "Une erreur est survenue lors de la création de l'invitation." };
  }

  revalidatePath("/dashboard/team");
  
  return { 
    success: true, 
    token: token,
    inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${token}`
  };
}

export async function acceptInvite(token: string) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: "Vous devez être connecté pour accepter cette invitation." };
  }

  const { data: invite, error: inviteError } = await supabase
    .from("invites")
    .select("*, organizations(name)")
    .eq("token", token)
    .is("accepted_at", null)
    .single();

  if (inviteError || !invite) {
    return { error: "Invitation introuvable ou déjà acceptée." };
  }

  // Update user profile to join the organization
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      organization_id: invite.organization_id,
      role: invite.role,
      location_id: invite.location_id,
    })
    .eq("id", session.user.id);

  if (profileError) {
    return { error: "Erreur lors de la mise à jour du profil." };
  }

  // Mark invite as accepted
  await supabase
    .from("invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  revalidatePath("/dashboard");
  return { success: true, orgName: invite.organizations?.name };
}
