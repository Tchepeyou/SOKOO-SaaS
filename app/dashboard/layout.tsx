"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import WhatsAppButton from "@/components/dashboard/WhatsAppButton";
import { initMockData } from "@/lib/db";
import { syncWithSupabase } from "@/lib/sync";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    initMockData().catch(console.error);

    // Initial sync
    syncWithSupabase();

    // Listen for online event to trigger sync
    const handleOnline = () => {
      console.log("Connexion internet rétablie, tentative de synchronisation...");
      syncWithSupabase();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-light dark:bg-slate-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden w-full relative z-0">
        <Header setSidebarOpen={setIsSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <WhatsAppButton />
    </div>
  );
}
