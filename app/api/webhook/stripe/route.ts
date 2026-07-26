import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2024-04-10",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_mock";

// We use the service role key to bypass RLS in the webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig) throw new Error("No signature");
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    // Fallback for local testing if the signature fails (mock mode)
    if (process.env.NODE_ENV === "development") {
      event = JSON.parse(body);
    } else {
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.client_reference_id;
        
        if (orgId) {
          // Update the organization to active status
          await supabaseAdmin
            .from("organizations")
            .update({
              subscription_status: "active",
              plan: session.metadata?.plan || "business"
            })
            .eq("id", orgId);
            
          // Record the subscription
          await supabaseAdmin
            .from("subscriptions")
            .insert({
              organization_id: orgId,
              plan: session.metadata?.plan || "business",
              status: "active",
              mobile_money_reference: session.id, // using session id as ref
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // roughly 1 month
            });
        }
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        // In a real app we'd query by customer ID, but we mapped orgId in metadata or customer map
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
