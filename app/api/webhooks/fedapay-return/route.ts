import { NextResponse } from "next/server";
import { FedaPay, Transaction } from "fedapay";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id"); // FedaPay transaction ID
  const status = searchParams.get("status");
  const sub_id = searchParams.get("sub_id");

  if (!id || !sub_id) {
    return NextResponse.redirect(new URL("/dashboard/settings?tab=Abonnement&error=invalid_return", request.url));
  }

  try {
    FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY || "sk_sandbox_XXXX");
    FedaPay.setEnvironment(process.env.FEDAPAY_ENV === "live" ? "live" : "sandbox");

    const transaction = await Transaction.retrieve(id);
    
    if (transaction.status === "approved") {
      const supabase = createAdminClient();
      
      // Update subscription to active for 30 days
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          mobile_money_reference: transaction.id.toString(),
          current_period_end: endDate.toISOString()
        })
        .eq("id", sub_id);

      return NextResponse.redirect(new URL("/dashboard/settings?tab=Abonnement&success=payment_approved", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard/settings?tab=Abonnement&error=payment_failed", request.url));
    }

  } catch (error) {
    console.error("Erreur de vérification FedaPay:", error);
    return NextResponse.redirect(new URL("/dashboard/settings?tab=Abonnement&error=verification_failed", request.url));
  }
}
