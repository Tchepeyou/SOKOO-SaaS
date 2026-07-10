import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | Sokoo",
  description: "Comment nous protégeons et utilisons vos données sur Sokoo.",
};

export default function ConfidentialitePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Politique de Confidentialité</h1>
      
      <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
        <section>
          <p>
            Chez <strong>Sokoo</strong>, nous accordons une importance capitale à la confidentialité et à la sécurité de vos données. Cette politique explique quelles informations nous collectons et comment nous les protégeons.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Données collectées</h2>
          <p>Dans le cadre de l'utilisation de l'application Sokoo, nous collectons les données suivantes :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Données d'authentification :</strong> votre numéro de téléphone (utilisé pour la connexion par SMS OTP).</li>
            <li><strong>Données de gestion :</strong> vos données de stock, la liste de vos produits, l'historique de vos mouvements et les informations relatives à vos boutiques.</li>
            <li><strong>Données de facturation :</strong> les informations liées aux transactions d'abonnement via Mobile Money.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Finalité du traitement</h2>
          <p>Ces données sont collectées <strong>exclusivement</strong> pour les finalités suivantes :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Assurer le fonctionnement normal du service de gestion de stock et de synchronisation multi-boutiques.</li>
            <li>Vous envoyer des alertes importantes (comme les alertes de stock faible ou rupture) via WhatsApp ou SMS.</li>
            <li>Gérer la facturation et le suivi de votre abonnement.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">3. Conservation et sécurité des données</h2>
          <p>
            La sécurité de vos données commerciales est notre priorité absolue :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Toutes les communications entre votre application et nos serveurs sont chiffrées (HTTPS/TLS).</li>
            <li>Notre base de données (hébergée par Supabase) utilise des politiques de sécurité strictes au niveau des lignes (<strong>Row Level Security - RLS</strong>). Cela garantit qu'il est mathématiquement et techniquement impossible qu'un autre utilisateur accède aux données de votre boutique.</li>
            <li>Les données sont sauvegardées régulièrement pour prévenir toute perte accidentelle.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Pas de revente de données</h2>
          <p className="font-medium text-slate-900">
            Nous nous engageons fermement à ne jamais revendre, louer, ou céder vos données personnelles ou commerciales à des tiers.
          </p>
          <p className="mt-2">
            Vos données de stock, vos produits et votre activité vous appartiennent. Elles ne seront jamais exploitées à des fins publicitaires ou commerciales par d'autres entreprises.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Vos droits</h2>
          <p>
            Conformément à la réglementation en vigueur, vous disposez des droits suivants concernant vos données :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Droit d'accès et de portabilité :</strong> vous pouvez à tout moment consulter vos données et demander un export.</li>
            <li><strong>Droit de suppression :</strong> vous pouvez exiger la suppression définitive de votre compte et de l'intégralité de vos données de nos serveurs. Pour exercer ce droit, il suffit de nous contacter via le bouton de support WhatsApp dans l'application.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
