"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteClient(userId: string, orgId?: string) {
  const supabase = createAdminClient();
  
  if (orgId) {
    await supabase.from("organizations").delete().eq("id", orgId);
  }
  
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
