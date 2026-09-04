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
import MobileNavBar from "@/components/dashboard/MobileNavBar";

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

    // Listen for visibility change to trigger sync when user comes back to the app
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Application de retour au premier plan, tentative de synchronisation...");
        syncWithSupabase();
      }
    };

    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    async function checkAccess() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          if (!navigator.onLine) {
            console.log("Offline mode: session refresh failed, but allowing local access.");
            setIsAuthorized(true);
            return;
          }
          setIsAuthorized(false);
          router.push("/login");
          return;
        }

        const userId = data.session?.user?.id;
        
        let isTrialExpired = false;
        let role = null;

        if (userId) {
          const member = await db.teamMembers.get(userId);
          if (member) {
            role = member.role;
          }
        }
        
        try {
          if (userId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select(`
                role,
                organizations (
                  created_at,
                  subscriptions (
                    status
                  )
                )
              `)
              .eq('id', userId)
              .single();

            console.log("PROFILE DATA:", JSON.stringify(profile));
            if (profile) {
              if (!role) role = profile.role;
              const org: any = profile.organizations;
              if (org) {
                const hasActiveSub = org.subscriptions && Array.isArray(org.subscriptions) && org.subscriptions.some((s: any) => s.status === 'active');
                console.log("hasActiveSub:", hasActiveSub);
                if (!hasActiveSub) {
                  let trialEndsAt = org.trial_ends_at ? new Date(org.trial_ends_at) : new Date(new Date(org.created_at).getTime() + 30 * 24 * 60 * 60 * 1000);
                  console.log("trialEndsAt:", trialEndsAt, "now:", new Date());
                  if (trialEndsAt.getTime() < new Date().getTime()) {
                    isTrialExpired = true;
                    console.log("IS TRIAL EXPIRED SET TO TRUE!");
                  }
                }
              }
            }
          }
        } catch (fetchError) {
          console.warn("Could not fetch subscription status from Supabase (offline?)", fetchError);
        }

        if (!role) {
          console.log("No role, fallback to true");
          setIsAuthorized(true); // Fallback
          return;
        }

        console.log("Calling handleRoleRedirect with role:", role, "isTrialExpired:", isTrialExpired);
        handleRoleRedirect(role, isTrialExpired);
      } catch (e) {
        console.error("RoleGuard error:", e);
        setIsAuthorized(true); // Fallback
      }
    }

    function handleRoleRedirect(role: string, isTrialExpired: boolean = false) {
      console.log("Inside handleRoleRedirect. role:", role, "isTrialExpired:", isTrialExpired, "pathname:", pathname);
      if (isTrialExpired) {
        if (role === 'admin' || role === 'owner' || role === 'Propriétaire' || role === 'Administrateur') {
           if (pathname !== '/dashboard/settings') {
             console.log("Redirecting owner to settings");
             router.push("/dashboard/settings?tab=Abonnement&expired=true");
             return;
           }
        } else {
           if (pathname !== '/dashboard/expired') {
             console.log("Redirecting employee to expired");
             router.push("/dashboard/expired");
             return;
           }
        }
      } else {
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
      <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible print:block bg-slate-50 dark:bg-slate-950">
        <div className="print:hidden">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden print:overflow-visible print:block w-full relative z-0">
          <div className="print:hidden">
            <Header setSidebarOpen={setIsSidebarOpen} />
          </div>
          <main className="flex-1 overflow-y-auto print:overflow-visible bg-white md:rounded-tl-3xl md:border-t md:border-l md:border-slate-200 shadow-sm p-4 md:p-6 lg:p-8 pb-28 md:pb-6 lg:pb-8 print:p-0 print:border-none print:shadow-none">
            {children}
          </main>
        </div>
        <div className="print:hidden">
          <MobileNavBar />
        </div>
        <div className="print:hidden">
          <WhatsAppButton />
        </div>
      </div>
    </LocationProvider>
  );
}
