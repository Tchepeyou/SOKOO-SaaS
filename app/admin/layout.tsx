import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import AdminHeader from "@/components/admin/AdminHeader";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: "Sokoo Super Admin",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const adminClient = createAdminClient();
  const { data: adminData } = await adminClient
    .from("platform_admins")
    .select("id")
    .eq("id", session.user.id)
    .single();

  if (!adminData) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-70px)] md:h-screen overflow-hidden relative">
        <AdminHeader />

        {/* Dashboard Content scrollable area */}
        <div className="flex-1 overflow-auto bg-white md:rounded-tl-3xl md:border-t md:border-l md:border-slate-200 shadow-sm p-4 md:p-8 pt-6">
          <div className="max-w-[1600px] mx-auto pb-6">
            {children}
          </div>
        </div>
      </main>

      <AdminMobileNav />
    </div>
  );
}
