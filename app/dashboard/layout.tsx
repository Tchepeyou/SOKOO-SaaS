"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import WhatsAppButton from "@/components/dashboard/WhatsAppButton";
import { initMockData, db } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { syncWithSupabase } from "@/lib/sync";

import { LocationProvider } from "@/lib/contexts/LocationContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

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

  useEffect(() => {
    async function checkAccess() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          setIsAuthorized(false);
          router.push("/login");
          return;
        }

        const userId = data.session.user.id;
        
        // Attendre que Dexie soit potentiellement initialisé
        const member = await db.teamMembers.get(userId);
        
        if (!member) {
          // Si on ne trouve pas le membre localement (ex: premier chargement),
          // on fetch depuis supabase pour être sûr
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
          
          if (profile) {
            handleRoleRedirect(profile.role);
          } else {
            setIsAuthorized(true); // Fallback
          }
          return;
        }

        handleRoleRedirect(member.role);
      } catch (e) {
        console.error("RoleGuard error:", e);
        setIsAuthorized(true); // Fallback
      }
    }

    function handleRoleRedirect(role: string) {
      if (role === 'employee' || role === 'Vendeur') {
        if (pathname !== '/dashboard/pos' && pathname !== '/dashboard/sales') {
          router.push("/dashboard/pos");
          return;
        }
      } else if (role === 'manager' || role === 'Superviseur') {
        if (pathname.startsWith('/dashboard/team') || pathname.startsWith('/dashboard/settings')) {
          router.push("/dashboard");
          return;
        }
      }
      setIsAuthorized(true);
    }

    checkAccess();
  }, [pathname, router]);

  if (isAuthorized === false || isAuthorized === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-light dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark"></div>
      </div>
    );
  }

  return (
    <LocationProvider>
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
    </LocationProvider>
  );
}
