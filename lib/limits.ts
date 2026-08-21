import { createAdminClient } from "./supabase/admin";

export async function checkPlanLimits(
  organizationId: string, 
  resource: 'locations' | 'users',
  newItemsCount: number = 1
): Promise<{ allowed: boolean; message?: string }> {
  const supabase = createAdminClient();
  
  // 1. Récupérer le plan actuel de l'organisation
  const { data: org } = await supabase
    .from("organizations")
    .select(`
      created_at,
      subscriptions (
        plan,
        status,
        current_period_end
      )
    `)
    .eq("id", organizationId)
    .single();

  if (!org) return { allowed: false, message: "Organisation introuvable." };

  // Déterminer le plan effectif (priorité à l'abonnement actif)
  const activeSub = org.subscriptions?.find((s: any) => s.status === "active");
  let effectivePlan = activeSub?.plan || "starter";

  // 2. Vérifier les limites selon le plan
  // Seul le plan starter est limité (le trial donne accès à toutes les fonctionnalités)
  if (effectivePlan === "starter") {
    
    // Le plan business outrepasse tout (ex: si trial mais plan_id = business)
    if (effectivePlan !== "business" && effectivePlan !== "enterprise") {
      if (resource === 'locations') {
        // Limite: 1 point de vente
        const { count } = await supabase
          .from("locations")
          .select("*", { count: 'exact', head: true })
          .eq("organization_id", organizationId);
        
        if (count !== null && (count + newItemsCount) > 1) {
          return { 
            allowed: false, 
            message: "Le plan Starter / Essai est limité à un seul point de vente. Veuillez passer au plan Business pour créer des succursales." 
          };
        }
      }

      if (resource === 'users') {
        // Limite: 1 utilisateur
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: 'exact', head: true })
          .eq("organization_id", organizationId);
          
        if (count !== null && (count + newItemsCount) > 1) {
          return { 
            allowed: false, 
            message: "Le plan Starter / Essai est limité à 1 utilisateur (le propriétaire). Veuillez passer au plan Business pour inviter des collaborateurs." 
          };
        }
      }
    }
  }

  // Business et Enterprise: illimité
  return { allowed: true };
}
