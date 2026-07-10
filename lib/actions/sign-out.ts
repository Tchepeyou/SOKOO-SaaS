"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOut() {
  // DEV BYPASS
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("abcdefghijklmnopqrst.supabase.co")) {
    cookies().delete("dev_bypass");
    redirect("/login");
  }

  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
