import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation | Sokoo",
  description: "Conditions générales d'utilisation (CGU) du service Sokoo.",
};

export default function CGUPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Conditions Générales d'Utilisation (CGU)</h1>
      
      <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
        <section>
          <p>
            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de l'application SaaS Sokoo. En créant un compte, vous acceptez ces conditions dans leur intégralité.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Nature de l'abonnement et Essai Gratuit</h2>
          <p>
            Sokoo est un service logiciel facturé sous forme d'abonnement mensuel <strong>sans engagement de durée</strong>.
          </p>
          <p className="mt-2">
            Lors de la création de votre compte, vous bénéficiez d'une période d'<strong>essai gratuit comprise entre 14 et 30 jours</strong> (selon l'offre promotionnelle en cours). Durant cette période, vous avez accès à l'intégralité des fonctionnalités du plan choisi, sans aucune obligation d'achat. À l'issue de cette période, la souscription à un abonnement payant est nécessaire pour continuer à utiliser le service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Modalités de paiement</h2>
          <p>
            Les paiements des abonnements se font exclusivement via <strong>Mobile Money</strong> (Orange Money, MTN Mobile Money, etc.) ou tout autre moyen de paiement local pris en charge par notre plateforme.
          </p>
          <p className="mt-2">
            Les abonnements sont prépayés au début de chaque cycle de facturation (mensuel). Le service ne fait pas de prélèvement automatique non autorisé ; il appartient à l'utilisateur de renouveler son abonnement à la date d'échéance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">3. Résiliation</h2>
          <p>
            Notre service étant sans engagement, vous êtes libre de résilier ou de ne pas renouveler votre abonnement à tout moment. L'interruption de paiement entraîne la suspension de l'accès à l'ajout de nouveaux mouvements de stock. Toutefois, vous disposez d'un délai de grâce (défini par l'éditeur) pour exporter vos données ou renouveler votre abonnement avant la suppression éventuelle de votre compte inactif.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Disponibilité du service</h2>
          <p>
            L'équipe Sokoo s'efforce de maintenir l'application accessible 7 jours sur 7 et 24 heures sur 24. Cependant, nous ne pouvons garantir une <strong>disponibilité continue à 100%</strong>. Le service peut occasionnellement être suspendu pour des opérations de maintenance, de mise à jour ou en raison de cas de force majeure ou de pannes liées aux prestataires d'hébergement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Limitation de responsabilité</h2>
          <p>
            L'utilisateur est le seul responsable des données qu'il saisit dans l'application (quantités, prix, descriptions de produits).
          </p>
          <p className="mt-2">
            Bien que nous mettions en œuvre les meilleures pratiques de l'industrie pour sécuriser et sauvegarder les données, <strong>Sokoo décline toute responsabilité en cas de perte de données</strong>, de bug ou de dysfonctionnement technique ayant entraîné un préjudice commercial direct ou indirect (perte de chiffre d'affaires, erreurs d'inventaire, etc.). Le service est fourni "en l'état".
          </p>
        </section>
      </div>
    </div>
  );
}
