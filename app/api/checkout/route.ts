import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2024-04-10",
});

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

    // Mapping plan to prices (mock prices for now)
    const priceId = plan === "business" 
      ? process.env.STRIPE_PRICE_BUSINESS || "price_mock_business"
      : process.env.STRIPE_PRICE_STARTER || "price_mock_starter";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: profile.organization_id,
      customer_email: session.user.email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/tarifs`,
      metadata: {
        organization_id: profile.organization_id,
        plan: plan,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Erreur Checkout Stripe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
