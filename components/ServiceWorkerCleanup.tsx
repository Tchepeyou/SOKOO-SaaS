"use client";

import { useEffect } from "react";

export default function ServiceWorkerCleanup() {
  useEffect(() => {
    // En mode développement, on s'assure que le Service Worker de next-pwa
    // est désenregistré. Sinon, les anciens assets mis en cache interceptent
    // la navigation et causent un écran blanc au rechargement.
    if (
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
          console.log("Service Worker désenregistré en mode développement pour éviter les conflits de cache.");
        }
      });
    }
  }, []);

  return null;
}
