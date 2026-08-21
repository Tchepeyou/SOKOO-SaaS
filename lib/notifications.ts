/**
 * Module de notification centralisé.
 * Il permet d'envoyer des emails, SMS ou WhatsApp aux utilisateurs.
 * Actuellement configuré avec une fonction "bouchon" (mock) pour les tests.
 */

export async function sendOnboardingReminder(phone: string, userName: string) {
  // TODO: Remplacer par l'intégration réelle (Twilio, Resend, WhatsApp API, etc.)
  
  const message = `Bonjour ${userName || 'Cher client'}, cela fait 3 jours que vous êtes inscrit sur Sokoo ! N'oubliez pas d'ajouter votre premier produit pour commencer à profiter de votre essai de 30 jours.`;
  
  console.log("=========================================");
  console.log("🔔 [NOTIFICATION ENVOYÉE]");
  console.log(`📱 Destinataire : ${phone}`);
  console.log(`✉️ Message : ${message}`);
  console.log("=========================================");

  // Simuler un appel réseau
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
}
