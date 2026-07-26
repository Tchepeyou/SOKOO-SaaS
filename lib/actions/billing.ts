"use server";

import { FedaPay, Transaction } from "fedapay";
import { createClient } from "@/lib/supabase/server";

FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY || "sk_sandbox_XXXX");
FedaPay.setEnvironment(process.env.FEDAPAY_ENV === "live" ? "live" : "sandbox");

const PLANS = {
  starter: { price: 5000, name: "Starter" },
  business: { price: 15000, name: "Business" },
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
      .select("organization_id, phone")
      .eq("id", session.user.id)
      .single();

    if (!profile?.organization_id) {
      return { error: "Organisation non trouvée" };
    }

    // Create a pending subscription record to track it
    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        organization_id: profile.organization_id,
        plan: planId,
        status: "pending",
        current_period_end: new Date().toISOString()
      })
      .select("id")
      .single();

    if (subError) throw subError;

    // Create FedaPay transaction
    const transaction = await Transaction.create({
      description: `Abonnement Sokoo - Plan ${plan.name}`,
      amount: plan.price,
      currency: { iso: "XAF" },
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/webhooks/fedapay-return?sub_id=${sub.id}`,
      customer: {
        email: session.user.email || `user_${session.user.id}@sokoo.app`,
        phone_number: {
          number: profile.phone?.replace('+', ''),
          country: "CM"
        }
      },
      custom_metadata: {
        subscription_id: sub.id,
        organization_id: profile.organization_id,
        plan_id: planId
      }
    });

    const token = await transaction.generateToken();
    return { url: token.url };

  } catch (error: any) {
    console.error("Erreur création paiement FedaPay:", error);
    return { error: "Erreur lors de la création du paiement" };
  }
}
