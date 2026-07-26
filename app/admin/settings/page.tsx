import { Settings, Shield, Bell, Key, Save } from "lucide-react";

export const metadata = {
  title: "Paramètres | Sokoo Admin",
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Paramètres Administrateur</h2>
        <p className="text-sm text-slate-500 mt-1">Gérez la sécurité et les préférences de la plateforme.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Sécurité de la plateforme</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Authentification à deux facteurs (2FA)</p>
              <p className="text-sm text-slate-500 mt-1">Exiger le 2FA pour tous les super-administrateurs.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Mot de passe Administrateur</p>
              <p className="text-sm text-slate-500 mt-1">Modifié pour la dernière fois il y a 3 mois.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Key className="w-4 h-4 text-slate-400" />
              Modifier
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Notifications Systèmes</h3>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500" defaultChecked />
            <div>
              <p className="font-medium text-slate-900">Nouvelles inscriptions</p>
              <p className="text-sm text-slate-500">Être notifié lorsqu'une nouvelle boutique s'inscrit.</p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500" defaultChecked />
            <div>
              <p className="font-medium text-slate-900">Alertes de paiement</p>
              <p className="text-sm text-slate-500">Recevoir un email en cas d'échec de renouvellement d'abonnement.</p>
            </div>
          </label>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">
            <Save className="w-4 h-4" />
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
}
