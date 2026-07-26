"use client";

import { useState, useEffect } from "react";
import { Download, MonitorSmartphone } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('PWA a été installée avec succès');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <div className="px-4 py-2 mt-auto hidden md:block">
      <button
        onClick={handleInstallClick}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-brand-blue/10 to-brand-blue/5 text-brand-blue hover:from-brand-blue/20 hover:to-brand-blue/10 transition-colors border border-brand-blue/20 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-blue/10 rounded-lg">
            <MonitorSmartphone className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold">Installer l'App</span>
            <span className="text-xs text-brand-blue/80 font-medium">Plus rapide, hors-ligne</span>
          </div>
        </div>
        <Download className="w-4 h-4 opacity-70" />
      </button>
    </div>
  );
}
