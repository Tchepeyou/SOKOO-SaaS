"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const newPhone = formData.get("phone") as string;
  const orgName = formData.get("orgName") as string;
  const locationName = formData.get("locationName") as string;
  const locationAddress = formData.get("locationAddress") as string;
  
  if (!newPhone) {
    return { error: "Numéro de téléphone requis." };
  }

  const formattedPhone = newPhone.startsWith("+") ? newPhone.replace(/\s+/g, '') : `+237${newPhone.replace(/\s+/g, '')}`;
  const generatedEmail = `${formattedPhone.replace('+', '')}@sokoo.app`;

  const supabase = createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return { error: "Vous devez être connecté pour modifier votre profil." };
  }

  const userId = session.user.id;
  const adminClient = createAdminClient();

  try {
    // 0. Récupérer le profil actuel pour avoir les IDs
    const { data: currentProfile } = await adminClient
      .from("profiles")
      .select("phone, organization_id, location_id")
      .eq("id", userId)
      .single();

    // 1. Update auth.users SEULEMENT si le numéro de téléphone a changé
    if (currentProfile?.phone !== formattedPhone) {
      const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(userId, {
        email: generatedEmail,
        user_metadata: { phone: formattedPhone }
      });

      if (authUpdateError) {
        if (authUpdateError.message.includes("already registered") || authUpdateError.message.includes("already exists")) {
          return { error: "Ce numéro de téléphone est déjà associé à un autre compte." };
        }
        throw authUpdateError;
      }
    }

    // 2. Update public.profiles
    const { error: profileUpdateError } = await adminClient
      .from("profiles")
      .update({ 
        phone: formattedPhone,
        full_name: fullName
      })
      .eq("id", userId);

    if (profileUpdateError) {
      throw profileUpdateError;
    }

    // 3. Update organizations
    if (currentProfile?.organization_id && orgName) {
      const { error: orgError } = await adminClient
        .from("organizations")
        .update({ name: orgName })
        .eq("id", currentProfile.organization_id);
      if (orgError) throw orgError;
    }

    // 4. Update locations
    let targetLocationId = formData.get("activeLocationId") as string;
    
    if (!targetLocationId) {
      targetLocationId = currentProfile?.location_id;
    }
    
    // Si l'utilisateur n'a pas de location_id explicite, on prend la première boutique de son organisation
    if (!targetLocationId && currentProfile?.organization_id) {
       const { data: firstLoc } = await adminClient
         .from("locations")
         .select("id")
         .eq("organization_id", currentProfile.organization_id)
         .order("created_at", { ascending: true })
         .limit(1)
         .single();
         
       if (firstLoc) {
         targetLocationId = firstLoc.id;
       }
    }
    
    if (targetLocationId && (locationName || locationAddress)) {
      const updateData: any = {};
      if (locationName) updateData.name = locationName;
      if (locationAddress) updateData.address = locationAddress;
      
      const { error: locError } = await adminClient
        .from("locations")
        .update(updateData)
        .eq("id", targetLocationId);
      if (locError) throw locError;
    }

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return { error: "Une erreur inattendue s'est produite lors de la mise à jour de votre profil." };
  }
}
