import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales | Sokoo",
  description: "Mentions légales de l'application Sokoo.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Mentions Légales</h1>
      
      <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Identification de l'éditeur</h2>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
            <ul className="text-sm text-slate-700 list-disc list-inside space-y-1">
              <li><strong>Nom de l'entreprise :</strong> Sokoo SAS</li>
              <li><strong>Capital social :</strong> 1 000 000 FCFA</li>
              <li><strong>Siège social :</strong> Douala, Cameroun</li>
              <li><strong>Immatriculation :</strong> En cours d'immatriculation (RCCM)</li>
              <li><strong>Email de contact :</strong> contact@sokoo.app</li>
              <li><strong>Directeur de la publication :</strong> L'équipe fondatrice Sokoo</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Hébergement</h2>
          <p>
            Ce site et l'application Sokoo sont hébergés par :<br />
            <strong>Vercel Inc.</strong><br />
            340 S Lemon Ave #4133<br />
            Walnut, CA 91789<br />
            États-Unis<br />
            Contact : <a href="https://vercel.com/contact" className="text-brand-blue hover:underline">vercel.com/contact</a>
          </p>
          <p className="mt-2">
            La base de données et les services d'authentification sont fournis par <strong>Supabase</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">3. Propriété intellectuelle</h2>
          <p>
            La marque <strong>Sokoo</strong>, ainsi que l'ensemble du contenu du site et de l'application (textes, images, illustrations, logos, architecture technique, code source) sont protégés par le droit de la propriété intellectuelle. Toute reproduction, représentation, modification, publication, transmission ou dénaturation, totale ou partielle, du site ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce soit est interdite sans autorisation préalable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Contact</h2>
          <p>
            Pour toute question concernant le site, l'application ou les présentes mentions légales, vous pouvez nous contacter :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>Via notre support WhatsApp disponible sur l'application</li>
            <li>Par email : <a href="mailto:contact@sokoo.app" className="text-brand-blue hover:underline">contact@sokoo.app</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
