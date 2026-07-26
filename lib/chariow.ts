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
      const response = await fetch(`${this.baseUrl}/checkout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          amount: params.amount,
          currency: params.currency || "XOF",
          product_id: params.product_id,
          plan: params.plan_id,
          name: params.name,
          description: params.description,
          customer: params.customer,
          success_url: params.success_url,
          cancel_url: params.cancel_url,
          metadata: params.metadata || {},
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("[Chariow API Error]", data);
        return { error: data.message || data.error || "Erreur lors de la communication avec Chariow" };
      }

      const url = data.url || data.checkout_url || data.data?.url || data.data?.checkout_url;
      if (!url) {
        return { error: "URL de paiement non retournée par Chariow" };
      }

      return {
        url,
        id: data.id || data.checkout_id || data.data?.id,
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
    if (!webhookSecret) {
      console.warn("[Chariow Webhook] CHARIOW_WEBHOOK_SECRET non défini, vérification ignorée en mode dev/test.");
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
