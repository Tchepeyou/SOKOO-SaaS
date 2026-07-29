"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginWithPassword(formData: FormData) {
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  
  if (!phone || !password) {
    return { error: "Numéro de téléphone et mot de passe requis" };
  }

  const formattedPhone = phone.startsWith("+") ? phone.replace(/\s+/g, '') : `+237${phone.replace(/\s+/g, '')}`;
  const pseudoEmail = `${formattedPhone.replace('+', '')}@sokoo.app`;
  const supabase = createClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: pseudoEmail,
    password: password,
  });

  if (error || !authData.user) {
    console.error("Erreur de connexion:", error);
    return { error: "Numéro de téléphone ou mot de passe incorrect." };
  }

  await ensureProfileAndOrganization(supabase, authData.user.id, formattedPhone);

  const { data: adminData } = await supabase
    .from("platform_admins")
    .select("id")
    .eq("id", authData.user.id)
    .single();
      
  if (adminData) {
    revalidatePath("/admin", "layout");
    redirect("/admin");
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function registerWithPassword(formData: FormData) {
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  
  if (!phone || !password) {
    return { error: "Numéro de téléphone et mot de passe requis" };
  }
  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères" };
  }

  const formattedPhone = phone.startsWith("+") ? phone.replace(/\s+/g, '') : `+237${phone.replace(/\s+/g, '')}`;
  const pseudoEmail = `${formattedPhone.replace('+', '')}@sokoo.app`;
  
  const adminSupabase = createAdminClient();
  const supabase = createClient();

  // On force la création de l'utilisateur avec l'email pseudo via admin API pour contourner les confirmations
  const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
    email: pseudoEmail,
    password: password,
    email_confirm: true,
    user_metadata: { phone: formattedPhone }
  });

  if (createError) {
    console.error("Erreur d'inscription admin:", createError);
    if (createError.message.includes("already registered")) {
      return { error: "Ce numéro de téléphone est déjà enregistré." };
    }
    return { error: "Impossible de créer le compte. Vérifiez le numéro." };
  }

  // Connexion automatique avec le pseudo email
  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email: pseudoEmail,
    password: password,
  });

  if (signInError || !authData.user) {
    return { error: "Compte créé, mais la connexion a échoué. Rechargez la page et connectez-vous manuellement." };
  }

  await ensureProfileAndOrganization(supabase, authData.user.id, formattedPhone);

  revalidatePath("/onboarding", "layout");
  redirect("/onboarding");
}

export async function updateOnboarding(formData: FormData) {
  const storeName = formData.get("storeName") as string;
  const locationName = formData.get("location") as string;

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect("/login");
  }

  // Get user profile to find organization_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, location_id")
    .eq("id", session.user.id)
    .single();

  const adminClient = createAdminClient();

  if (profile?.organization_id) {
    // Update organization
    await adminClient
      .from("organizations")
      .update({ name: storeName })
      .eq("id", profile.organization_id);

    // Update location
    await adminClient
      .from("locations")
      .update({ 
        name: storeName, 
        address: locationName 
      })
      .eq("organization_id", profile.organization_id);
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

async function ensureProfileAndOrganization(supabase: any, userId: string, phone: string) {
  
  const adminClient = createAdminClient();
  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("id, organization_id")
    .eq("id", userId)
    .single();

  if (existingProfile && existingProfile.organization_id) {
    return; // Already fully setup
  }

  const { data: org, error: orgError } = await adminClient
    .from("organizations")
    .insert({
      name: `Boutique de ${phone}`,
    })
    .select()
    .single();

  if (orgError || !org) {
    console.error("Erreur création organisation:", orgError);
    return;
  }

  const { data: location, error: locError } = await adminClient
    .from("locations")
    .insert({
      organization_id: org.id,
      name: `Boutique de ${phone}`,
    })
    .select()
    .single();

  if (locError || !location) {
    console.error("Erreur création location:", locError);
  }

  if (existingProfile) {
    // Update existing profile created by trigger
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        organization_id: org.id,
        location_id: location?.id,
      })
      .eq("id", userId);
      
    if (profileError) {
      console.error("Erreur update profil:", profileError);
    }
  } else {
    // Fallback if trigger didn't run
    const { error: profileError } = await adminClient
      .from("profiles")
      .insert({
        id: userId,
        organization_id: org.id,
        phone: phone,
        role: "owner",
        location_id: location?.id,
      });

    if (profileError) {
      console.error("Erreur création profil:", profileError);
    }
  }
}

