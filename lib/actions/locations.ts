"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { checkPlanLimits } from "@/lib/limits";

export async function saveLocationToSupabase(id: string, name: string, address: string, isMain: boolean) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return { error: "Non autorisé" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", session.user.id)
    .single();

  if (!profile?.organization_id) return { error: "Organisation introuvable" };

  const adminClient = createAdminClient();

  // Vérifier s'il s'agit d'une mise à jour
  const { data: existingLoc } = await adminClient
    .from("locations")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  const isUpdate = !!existingLoc;

  // Vérifier la limite du plan
  const limits = await checkPlanLimits(profile.organization_id, 'locations', isUpdate ? 0 : 1);
  if (!limits.allowed) {
    return { error: limits.message };
  }

  const { error } = await adminClient
    .from("locations")
    .upsert({
      id,
      organization_id: profile.organization_id,
      name,
      address,
    }, { onConflict: 'id' });

  if (error) {
    console.error("Erreur upsert location:", error);
    return { error: error.message };
  }

  // Si c'est la boutique principale, on met aussi à jour le nom de l'organisation
  if (isMain) {
    await adminClient
      .from("organizations")
      .update({ name })
      .eq("id", profile.organization_id);
  }

  return { success: true };
}

export async function deleteLocationFromSupabase(id: string) {
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("locations")
    .delete()
    .eq("id", id);
    
  if (error) {
    console.error("Erreur delete location:", error);
    return { error: error.message };
  }
  return { success: true };
}

export async function bulkSaveLocationsToSupabase(locations: any[]) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: "Non autorisé" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", session.user.id)
    .single();

  if (!profile?.organization_id) return { error: "Organisation introuvable" };

  const adminClient = createAdminClient();

  // Vérifier combien de nouvelles boutiques on ajoute
  const { data: existingLocs } = await adminClient
    .from("locations")
    .select("id")
    .eq("organization_id", profile.organization_id);
    
  const existingIds = new Set(existingLocs?.map((l: any) => l.id) || []);
  const newLocationsCount = locations.filter(l => !existingIds.has(l.id)).length;

  // Vérifier la limite du plan
  const limits = await checkPlanLimits(profile.organization_id, 'locations', newLocationsCount);
  if (!limits.allowed) {
    return { error: limits.message };
  }

  const locationsToUpsert = locations.map(l => ({
    ...l,
    organization_id: profile.organization_id
  }));

  const { error } = await adminClient
    .from("locations")
    .upsert(locationsToUpsert, { onConflict: 'id' });

  if (error) {
    console.error("Erreur bulk upsert locations:", error);
    return { error: error.message };
  }

  return { success: true };
}
