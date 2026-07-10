import Link from "next/link";
import { Package, MessageCircle } from "lucide-react";

export default function VitrineFooter() {
  const whatsappNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER || "237000000000";
  const message = encodeURIComponent("Bonjour, je souhaite en savoir plus sur Sokoo");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Sokoo</span>
            </Link>
            <p className="text-sm text-slate-500 max-w-sm mb-6">
              La solution complète et intuitive pour gérer vos stocks, vos points de vente et booster votre activité commerciale.
            </p>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Contactez-nous sur WhatsApp
            </a>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Liens Rapides</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <Link href="/tarifs" className="hover:text-brand-blue transition-colors">Tarifs</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand-blue transition-colors">Connexion</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Légal</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <Link href="/mentions-legales" className="hover:text-brand-blue transition-colors">Mentions légales</Link>
              </li>
              <li>
                <Link href="/confidentialite" className="hover:text-brand-blue transition-colors">Politique de confidentialité</Link>
              </li>
              <li>
                <Link href="/cgu" className="hover:text-brand-blue transition-colors">Conditions Générales (CGU)</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Sokoo. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
