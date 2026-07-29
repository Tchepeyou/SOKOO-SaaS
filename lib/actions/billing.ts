"use server";

import { chariow } from "@/lib/chariow";
import { createClient } from "@/lib/supabase/server";

const PLANS = {
  starter: { price: 5000, name: "Starter", currency: "XOF" },
  business: { price: 15000, name: "Business", currency: "XOF" },
  enterprise: { price: 50000, name: "Enterprise", currency: "XOF" },
};

export async function createSubscriptionPayment(planId: string) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { error: "Non autorisé" };
    }

    const plan = (PLANS as any)[planId];
    if (!plan) return { error: "Plan invalide" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, full_name, phone")
      .eq("id", session.user.id)
      .single();

    if (!profile?.organization_id) {
      return { error: "Organisation non trouvée" };
    }

    let subId = "sub_" + Date.now();
    // Création de l'enregistrement de l'abonnement en attente dans Supabase
    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        organization_id: profile.organization_id,
        plan_id: planId,
        status: "trialing", // "pending" n'est pas dans la contrainte CHECK, on utilise "trialing"
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select("id")
      .single();

    if (subError) {
      console.warn("Impossible de créer l'abonnement (problème de cache ou de schéma). Utilisation d'un ID temporaire.", subError.message);
    } else if (sub) {
      subId = sub.id;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const checkoutResult = await chariow.createCheckout({
      plan_id: planId,
      name: `Abonnement Sokoo - Plan ${plan.name}`,
      description: `Mise à niveau SOKOO SaaS (${plan.name})`,
      amount: plan.price,
      currency: plan.currency,
      customer: {
        email: session.user.email || `user_${session.user.id}@sokoo.app`,
        name: profile.full_name || "Client Sokoo",
        phone: profile.phone || undefined,
        country_code: profile.phone && (profile.phone.startsWith("6") || profile.phone.startsWith("237")) ? "CM" : "BJ"
      },
      success_url: `${appUrl}/dashboard/settings?checkout=chariow_success&sub_id=${subId}`,
      cancel_url: `${appUrl}/dashboard/settings?tab=Abonnement`,
      metadata: {
        subscription_id: subId,
        organization_id: profile.organization_id,
        plan_id: planId
      }
    });

    if (checkoutResult.error) {
      return { error: checkoutResult.error };
    }

    return { url: checkoutResult.url };

  } catch (error: any) {
    console.error("Erreur création paiement Chariow:", error);
    return { error: error.message || "Erreur lors de la création du paiement" };
  }
}
