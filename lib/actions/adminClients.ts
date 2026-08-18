"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteClient(userId: string, orgId?: string) {
  const supabase = createAdminClient();
  
  if (orgId) {
    // 1. Delete stock_movements (depends on products and organizations)
    await supabase.from("stock_movements").delete().eq("organization_id", orgId);
    
    // 2. Delete sales (depends on organizations)
    await supabase.from("sales").delete().eq("organization_id", orgId);
    
    // 3. Delete products (depends on organizations)
    await supabase.from("products").delete().eq("organization_id", orgId);
    
    // 4. Delete subscriptions (depends on organizations)
    await supabase.from("subscriptions").delete().eq("organization_id", orgId);
    
    // 5. Fetch all users belonging to this organization
    const { data: orgProfiles } = await supabase.from("profiles").select("id").eq("organization_id", orgId);
    
    // Delete them from profiles to release the FK to organizations
    await supabase.from("profiles").delete().eq("organization_id", orgId);
    
    // 6. Finally delete the organization
    const { error: orgError } = await supabase.from("organizations").delete().eq("id", orgId);
    if (orgError) {
      console.error("Error deleting organization:", orgError);
      return { success: false, error: orgError.message };
    }
    
    // 7. Delete all users from auth
    if (orgProfiles) {
      for (const p of orgProfiles) {
        await supabase.auth.admin.deleteUser(p.id);
      }
    }
    return { success: true };
  }
  
  // If no orgId, just delete the single user
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

export async function toggleClientStatus(userId: string, currentStatus: string) {
  const supabase = createAdminClient();
  
  // As a workaround if there's no status column, we can update the role to 'blocked'
  // Or just update the profile if a status column exists. Let's try updating a 'role' to 'blocked'.
  const newRole = currentStatus === "blocked" ? "owner" : "blocked";
  
  const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
  
  if (error) {
    console.error("Error toggling user status:", error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}
