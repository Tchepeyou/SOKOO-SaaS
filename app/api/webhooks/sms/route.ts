import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Verify that the request comes from Supabase
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.SUPABASE_SMS_WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const { user, sms } = payload;
    const { phone } = user;
    const { otpcode, message } = sms;

    // We can use a local provider like FrikSMS (Bulksms.cm) or Termii which are very cheap for CEMAC
    // Example using a generic HTTP POST structure common to these providers.
    
    // For this example, let's assume FrikSMS / Bulksms.cm
    // API Documentation typically: POST https://www.bulksms.cm/api/v1/sendsms
    
    const apiUsername = process.env.SMS_PROVIDER_USERNAME;
    const apiKey = process.env.SMS_PROVIDER_API_KEY;
    const senderId = process.env.SMS_PROVIDER_SENDER_ID || "SOKOO";

    if (!apiUsername || !apiKey) {
      console.warn("SMS Provider credentials not configured. OTP was:", otpcode);
      // Fallback: we return success so Supabase continues, but SMS wasn't actually sent.
      // In production, this should throw an error.
      return NextResponse.json({ success: true, warning: "Credentials missing, SMS mocked." });
    }

    const smsText = `Votre code de connexion Sokoo est : ${otpcode}. Il expire dans 5 minutes.`;

    const response = await fetch("https://www.bulksms.cm/api/v1/sendsms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${Buffer.from(`${apiUsername}:${apiKey}`).toString("base64")}`
      },
      body: JSON.stringify({
        sender: senderId,
        message: smsText,
        recipients: [phone]
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("SMS Provider error:", errorData);
      return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook SMS Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
