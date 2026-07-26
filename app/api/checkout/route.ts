import { NextResponse } from "next/server";
import { chariow } from "@/lib/chariow";
import { createClient } from "@/lib/supabase/server";

const PLANS = {
  starter: { price: 5000, name: "Starter", currency: "XOF" },
  business: { price: 15000, name: "Business", currency: "XOF" },
  enterprise: { price: 50000, name: "Enterprise", currency: "XOF" },
};

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, full_name, phone")
      .eq("id", session.user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: "Organisation introuvable" }, { status: 400 });
    }

    const { plan } = await req.json();
    const selectedPlan = (PLANS as any)[plan] || PLANS.starter;

    // Création de l'enregistrement de l'abonnement en attente dans Supabase
    const { data: sub } = await supabase
      .from("subscriptions")
      .insert({
        organization_id: profile.organization_id,
        plan_id: plan || "starter",
        status: "pending",
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select("id")
      .single();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const checkoutResult = await chariow.createCheckout({
      plan_id: plan || "starter",
      name: `Abonnement Sokoo - Plan ${selectedPlan.name}`,
      description: `Licence mensuelle SOKOO SaaS (${selectedPlan.name}) pour votre organisation.`,
      amount: selectedPlan.price,
      currency: selectedPlan.currency,
      customer: {
        email: session.user.email || `user_${session.user.id}@sokoo.app`,
        name: profile.full_name || "Client Sokoo",
        phone: profile.phone || undefined,
      },
      success_url: `${appUrl}/dashboard?checkout=chariow_success&sub_id=${sub?.id || ''}`,
      cancel_url: `${appUrl}/tarifs`,
      metadata: {
        organization_id: profile.organization_id,
        user_id: session.user.id,
        subscription_id: sub?.id || "",
        plan: plan || "starter",
      },
    });

    if (checkoutResult.error) {
      return NextResponse.json({ error: checkoutResult.error }, { status: 400 });
    }

    return NextResponse.json({ url: checkoutResult.url });
  } catch (error: any) {
    console.error("Erreur Checkout Chariow:", error);
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status: 500 });
  }
}
