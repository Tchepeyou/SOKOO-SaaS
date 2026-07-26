import { NextResponse } from "next/server";
import { chariow } from "@/lib/chariow";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-chariow-signature") || request.headers.get("chariow-signature") || "";

    // Vérification de la signature HMAC du webhook
    const isValid = chariow.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.error("[Webhook Chariow] Signature invalide");
      return NextResponse.json({ error: "Signature webhook invalide" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log("[Webhook Chariow] Événement reçu :", event.type || event.event || "custom");

    const eventType = event.type || event.event || "payment.succeeded";
    const data = event.data || event.payload || event;
    const metadata = data.metadata || event.metadata || {};
    const subId = metadata.subscription_id;
    const orgId = metadata.organization_id;
    const planId = metadata.plan_id || metadata.plan || "business";

    // Les types d'événements de succès habituels
    const successEvents = [
      "payment.succeeded",
      "checkout.completed",
      "order.paid",
      "subscription.created",
      "subscription.renewed",
      "licence.activated"
    ];

    if (successEvents.includes(eventType) || event.status === "succeeded" || event.status === "paid") {
      const supabase = createAdminClient();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // Abonnement 30 jours par défaut

      if (subId) {
        // Mise à jour de l'abonnement existant dans Supabase
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status: "active",
            current_period_end: endDate.toISOString(),
            plan_id: planId
          })
          .eq("id", subId);

        if (updateError) {
          console.error("[Webhook Chariow] Erreur update subscription par ID:", updateError);
        } else {
          console.log(`[Webhook Chariow] Abonnement ${subId} activé avec succès.`);
        }
      } else if (orgId) {
        // Si pas de subId explicite, on cherche un abonnement en attente pour cette organisation
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("organization_id", orgId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (existingSub) {
          await supabase
            .from("subscriptions")
            .update({
              status: "active",
              current_period_end: endDate.toISOString(),
              plan_id: planId
            })
            .eq("id", existingSub.id);
        } else {
          // Création d'un nouvel abonnement actif pour cette organisation
          await supabase
            .from("subscriptions")
            .insert({
              organization_id: orgId,
              plan_id: planId,
              status: "active",
              current_period_end: endDate.toISOString()
            });
        }
        console.log(`[Webhook Chariow] Abonnement activé pour l'organisation ${orgId}.`);
      }
    }

    return NextResponse.json({ received: true, success: true });
  } catch (error: any) {
    console.error("[Webhook Chariow] Erreur de traitement :", error);
    return NextResponse.json({ error: error.message || "Erreur interne webhook" }, { status: 500 });
  }
}
