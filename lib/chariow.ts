/**
 * Module d'intégration de l'API de Paiement Chariow pour SOKOO SaaS.
 * Documentation : https://chariow.dev / https://api.chariow.com/v1
 */

const CHARIOW_BASE_URL = process.env.CHARIOW_API_URL || "https://api.chariow.com/v1";

export interface ChariowCheckoutRequest {
  product_id?: string;
  plan_id?: string;
  name?: string;
  description?: string;
  amount: number;
  currency?: string; // par défaut XOF / XAF / EUR
  customer: {
    email: string;
    name?: string;
    phone?: string;
    country_code?: string; // Ex: 'BJ', 'CM', 'CI', 'FR'
  };
  success_url: string;
  cancel_url: string;
  metadata?: Record<string, any>;
}

export class ChariowClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.CHARIOW_API_KEY || "";
    this.baseUrl = baseUrl || CHARIOW_BASE_URL;
  }

  /**
   * Crée une session de paiement / checkout sur Chariow.
   */
  async createCheckout(params: ChariowCheckoutRequest): Promise<{ url?: string; id?: string; error?: string }> {
    // Si pas de clé API ou clé de test/sandbox non configurée, simulation en mode dev
    if (!this.apiKey || this.apiKey === "mock" || this.apiKey.startsWith("mock_")) {
      console.warn("[Chariow SDK] Clé API non configurée ou mode mock. Utilisation d'une simulation de checkout Chariow.");
      const separator = params.success_url.includes('?') ? '&' : '?';
      return {
        url: `${params.success_url}${separator}checkout=chariow_success&plan=${params.plan_id || 'custom'}&sub_id=${params.metadata?.subscription_id || 'mock_sub'}`,
        id: "mock_chariow_" + Date.now(),
      };
    }

    try {
      // Découpage du nom en first_name et last_name (requis par Chariow)
      const fullName = (params.customer.name || "Client Sokoo").trim();
      const nameParts = fullName.split(" ");
      const firstName = nameParts[0] || "Client";
      const lastName = nameParts.slice(1).join(" ") || "Sokoo";

      // Nettoyage et préparation du téléphone
      let phoneObj: any = {
        number: "97000000",
        country_code: "BJ"
      };
      
      if (params.customer.phone) {
        let phoneNum = params.customer.phone.replace(/[^0-9]/g, ""); // Ne garder que les chiffres
        let determinedCountryCode = params.customer.country_code || "BJ";
        
        if (phoneNum.startsWith("229") && phoneNum.length > 8) {
          phoneNum = phoneNum.substring(3);
          determinedCountryCode = "BJ";
        } else if (phoneNum.startsWith("237") && phoneNum.length > 9) {
          phoneNum = phoneNum.substring(3);
          determinedCountryCode = "CM";
        } else if (phoneNum.length === 9 && phoneNum.startsWith("6")) {
          determinedCountryCode = "CM";
        }

        phoneObj = {
          number: phoneNum,
          country_code: determinedCountryCode
        };
      }

      // Détermination du produit Chariow (via env ou par défaut sur un produit actif)
      let productId = params.product_id;
      if (!productId) {
        if (params.plan_id === "business") productId = process.env.CHARIOW_PRODUCT_BUSINESS || process.env.CHARIOW_PRODUCT_ID || "prd_81ozq5oi";
        else if (params.plan_id === "enterprise") productId = process.env.CHARIOW_PRODUCT_ENTERPRISE || process.env.CHARIOW_PRODUCT_ID || "prd_81ozq5oi";
        else productId = process.env.CHARIOW_PRODUCT_STARTER || process.env.CHARIOW_PRODUCT_ID || "prd_81ozq5oi";
      }

      const payload: any = {
        product_id: productId,
        email: params.customer.email,
        first_name: firstName,
        last_name: lastName,
        redirect_url: params.success_url, // Chariow utilise redirect_url au lieu de success_url/cancel_url
        payment_currency: params.currency || "XAF",
        custom_metadata: {
          ...params.metadata,
          plan_id: params.plan_id,
          expected_amount: params.amount,
          cancel_url: params.cancel_url
        }
      };

      if (phoneObj) {
        payload.phone = phoneObj;
      }

      console.log("[Chariow SDK] Envoi requête checkout Chariow:", JSON.stringify(payload));

      let response = await fetch(`${this.baseUrl}/checkout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data = await response.json();

      // Si le numéro de téléphone du client est rejeté par la validation stricte de Chariow (ex: faux numéro de test)
      // On réessaie automatiquement avec un numéro de secours valide pour ne pas bloquer l'accès à la page de paiement.
      const errorMsg = data.message || (data.errors ? JSON.stringify(data.errors) : null) || data.error;
      if (!response.ok && errorMsg && typeof errorMsg === 'string' && errorMsg.includes("Invalid phone number")) {
        console.warn("[Chariow SDK] Numéro invalide détecté, nouvel essai avec le numéro de secours...");
        payload.phone = { number: "0197000000", country_code: "BJ" };
        
        response = await fetch(`${this.baseUrl}/checkout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(payload),
        });
        
        data = await response.json();
      }

      if (!response.ok) {
        console.error("[Chariow API Error]", response.status, data);
        const finalErrorMsg = data.message || (data.errors ? JSON.stringify(data.errors) : null) || data.error || "Erreur lors de la communication avec Chariow";
        return { error: finalErrorMsg };
      }

      // Extraction propre de l'URL de paiement selon le format réel Chariow : data.data.payment.checkout_url
      const url = data.data?.payment?.checkout_url || data.payment?.checkout_url || data.data?.checkout_url || data.data?.url || data.url || data.checkout_url;
      if (!url) {
        console.error("[Chariow SDK] URL introuvable dans la réponse:", data);
        return { error: "URL de paiement non retournée par Chariow" };
      }

      const purchaseId = data.data?.purchase?.id || data.purchase?.id || data.data?.id || data.id;

      return {
        url,
        id: purchaseId,
      };
    } catch (error: any) {
      console.error("[Chariow SDK Error]", error);
      return { error: error.message || "Erreur de connexion à l'API Chariow" };
    }
  }

  /**
   * Vérifie la signature HMAC d'un webhook Chariow pour garantir la sécurité et l'intégrité des notifications.
   */
  verifyWebhookSignature(payload: string, signature: string, secret?: string): boolean {
    const webhookSecret = secret || process.env.CHARIOW_WEBHOOK_SECRET;
    if (!webhookSecret || webhookSecret === "chariow_wh_secret_placeholder") {
      console.warn("[Chariow Webhook] CHARIOW_WEBHOOK_SECRET non défini ou placeholder, vérification ignorée en mode dev/test.");
      return true;
    }

    try {
      const crypto = require("crypto");
      const hmac = crypto.createHmac("sha256", webhookSecret);
      const computedSignature = hmac.update(payload).digest("hex");
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature));
    } catch (e) {
      console.error("[Chariow Webhook] Erreur lors de la vérification de signature", e);
      return false;
    }
  }
}

export const chariow = new ChariowClient();
