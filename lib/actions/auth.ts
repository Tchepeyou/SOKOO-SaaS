"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function requestOtp(formData: FormData) {
  const phone = formData.get("phone") as string;
  const mode = formData.get("mode") as string || "login";
  
  if (!phone) {
    return { error: "Numéro de téléphone requis" };
  }

  const formattedPhone = phone.startsWith("+") ? phone.replace(/\s+/g, '') : `+237${phone.replace(/\s+/g, '')}`;
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
  });

  if (error) {
    console.error("Erreur envoi OTP:", error);
    return { error: "Impossible d'envoyer le code SMS. Vérifiez le numéro." };
  }
  
  redirect(`/verify-otp?phone=${encodeURIComponent(formattedPhone)}&mode=${mode}`);
}

export async function verify(formData: FormData) {
  const phone = formData.get("phone") as string;
  const mode = formData.get("mode") as string || "login";
  const token = formData.get("token") as string;
  
  if (!token || token.length !== 6) {
    return { error: "Code invalide. Veuillez entrer un code à 6 chiffres." };
  }

  const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token: token,
    type: "sms",
  });

  if (verifyError) {
    console.error("Erreur vérification OTP:", verifyError);
    return { error: "Code invalide ou expiré." };
  }

  // Si c'est une connexion ou création automatique réussie
  if (verifyData?.user) {
    await ensureProfileAndOrganization(supabase, verifyData.user.id, formattedPhone);
    
    // Check if admin
    const { data: adminData } = await supabase
      .from("platform_admins")
      .select("id")
      .eq("id", verifyData.user.id)
      .single();
      
    if (adminData) {
      revalidatePath("/admin", "layout");
      redirect("/admin");
    }

    revalidatePath("/dashboard", "layout");
    redirect("/dashboard");
  }
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

