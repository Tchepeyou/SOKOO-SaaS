import { createAdminClient } from "@/lib/supabase/admin";
import ClientTable from "./ClientTable";

export const metadata = {
  title: "Clients | Sokoo Admin",
};

export default async function AdminClientsPage() {
  const supabase = createAdminClient();

  // Fetch all profiles and their associated organizations
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      phone,
      role,
      created_at,
      organization_id,
      organizations (
        name,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="animate-in fade-in duration-500">
      <ClientTable initialProfiles={profiles || []} />
    </div>
  );
}
