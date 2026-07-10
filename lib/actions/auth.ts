"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const phone = formData.get("phone") as string;
  const mode = formData.get("mode") as string || "login";
  
  if (!phone) {
    return { error: "Numéro de téléphone requis" };
  }

  // Format the phone number (assuming Cameroonian format or general E.164)
  // For production, we should use a library like libphonenumber-js to properly format
  const formattedPhone = phone.startsWith("+") ? phone : `+237${phone}`;

  // DEV MODE BYPASS
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("abcdefghijklmnopqrst.supabase.co")) {
    redirect(`/verify-otp?phone=${encodeURIComponent(formattedPhone)}&mode=${mode}`);
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
  });

  if (error) {
    console.error("Erreur signIn:", error);
    return { error: error.message };
  }

  // Rediriger vers la page de vérification avec le numéro et le mode dans l'URL
  redirect(`/verify-otp?phone=${encodeURIComponent(formattedPhone)}&mode=${mode}`);
}

export async function verify(formData: FormData) {
  const phone = formData.get("phone") as string;
  const token = formData.get("token") as string;
  const mode = formData.get("mode") as string || "login";

  if (!phone || !token || token.length !== 6) {
    return { error: "Données invalides" };
  }

  // DEV MODE BYPASS
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("abcdefghijklmnopqrst.supabase.co")) {
    const { cookies } = await import("next/headers");
    cookies().set("dev_bypass", "true", { path: "/" });
    if (mode === "signup") {
      redirect("/onboarding");
    } else {
      redirect("/dashboard");
    }
  }

  const supabase = createClient();

  const { data: authData, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });

  if (error) {
    console.error("Erreur verify:", error);
    return { error: error.message };
  }

  if (authData.user) {
    await ensureProfileAndOrganization(authData.user.id, authData.user.phone!);
  }

  revalidatePath("/dashboard", "layout");
  if (mode === "signup") {
    redirect("/onboarding");
  } else {
    redirect("/dashboard");
  }
}

async function ensureProfileAndOrganization(userId: string, phone: string) {
  const supabase = createClient();
  
  // 1. Check if profile already exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (existingProfile) {
    return; // Already setup
  }

  // 2. We bypass RLS for this initial setup using service role key if needed, 
  // but since we are authenticated as the user, we can insert into organizations 
  // if we set RLS policy to allow inserts (not done in our init.sql), 
  // OR we use the service role key to bootstrap the org.
  // We don't have a service_role client yet. Let's create one or just use the current client.
  // Actually, our RLS on organizations doesn't allow insert by default.
  // In a real app we'd use a postgres function (Trigger) on auth.users insert,
  // or a server-side action using a service role client.
  // For the MVP, let's create a service_role client here to bypass RLS for creation.

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Création de l'organisation
  const { data: org, error: orgError } = await supabaseAdmin
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

  // Création du point de vente par défaut
  const { data: location, error: locError } = await supabaseAdmin
    .from("locations")
    .insert({
      organization_id: org.id,
      name: "Boutique Principale",
    })
    .select()
    .single();

  if (locError || !location) {
    console.error("Erreur création location:", locError);
  }

  // Création du profil (owner)
  const { error: profileError } = await supabaseAdmin
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
