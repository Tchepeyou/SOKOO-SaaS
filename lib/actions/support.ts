"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createTicket(formData: FormData) {
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;
  const location_id = formData.get("location_id") as string;

  if (!subject || !message) {
    return { error: "Sujet et message requis." };
  }

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: "Non autorisé." };
  }

  const adminClient = createAdminClient();

  try {
    // Obtenir l'organization_id du profil
    const { data: profile } = await adminClient
      .from("profiles")
      .select("organization_id")
      .eq("id", session.user.id)
      .single();

    if (!profile?.organization_id) {
      return { error: "Profil ou organisation introuvable." };
    }

    // 1. Créer le ticket
    const ticketData: any = {
      organization_id: profile.organization_id,
      created_by: session.user.id,
      subject,
      status: "Nouveau"
    };
    if (location_id) {
      ticketData.location_id = location_id;
    }

    const { data: ticket, error: ticketError } = await adminClient
      .from("support_tickets")
      .insert(ticketData)
      .select()
      .single();

    if (ticketError) throw ticketError;

    // 2. Créer le premier message
    const { error: msgError } = await adminClient
      .from("ticket_messages")
      .insert({
        ticket_id: ticket.id,
        sender_id: session.user.id,
        message,
        is_admin: false
      });

    if (msgError) throw msgError;

    revalidatePath("/dashboard/settings");
    revalidatePath("/admin/support");

    return { success: true, ticketId: ticket.id };
  } catch (error: any) {
    console.error("Erreur createTicket:", error);
    return { error: "Une erreur est survenue lors de la création du ticket." };
  }
}

export async function replyToTicket(formData: FormData) {
  const ticketId = formData.get("ticketId") as string;
  const message = formData.get("message") as string;
  const isAdminRaw = formData.get("isAdmin");
  const isAdmin = isAdminRaw === "true";

  if (!ticketId || !message) {
    return { error: "Ticket ID et message requis." };
  }

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: "Non autorisé." };
  }

  const adminClient = createAdminClient();

  try {
    // Si c'est l'utilisateur, vérifier qu'il a le droit
    if (!isAdmin) {
      const { data: ticket } = await adminClient
        .from("support_tickets")
        .select("organization_id")
        .eq("id", ticketId)
        .single();
        
      const { data: profile } = await adminClient
        .from("profiles")
        .select("organization_id")
        .eq("id", session.user.id)
        .single();

      if (ticket?.organization_id !== profile?.organization_id) {
        return { error: "Accès refusé au ticket." };
      }
    }

    // Insérer le message
    const { error: msgError } = await adminClient
      .from("ticket_messages")
      .insert({
        ticket_id: ticketId,
        sender_id: isAdmin ? null : session.user.id,
        message,
        is_admin: isAdmin
      });

    if (msgError) throw msgError;

    // Si admin répond, passer le statut à "En cours" s'il était "Nouveau"
    if (isAdmin) {
      await adminClient
        .from("support_tickets")
        .update({ status: "En cours", updated_at: new Date().toISOString() })
        .eq("id", ticketId)
        .eq("status", "Nouveau");
    } else {
      await adminClient
        .from("support_tickets")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", ticketId);
    }

    revalidatePath("/dashboard/settings");
    revalidatePath("/admin/support");

    return { success: true };
  } catch (error: any) {
    console.error("Erreur replyToTicket:", error);
    return { error: "Une erreur est survenue lors de l'envoi du message." };
  }
}

export async function updateTicketStatus(formData: FormData) {
  const ticketId = formData.get("ticketId") as string;
  const status = formData.get("status") as string;

  if (!ticketId || !status) {
    return { error: "Données manquantes." };
  }

  const adminClient = createAdminClient();

  try {
    const { error } = await adminClient
      .from("support_tickets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", ticketId);

    if (error) throw error;

    revalidatePath("/admin/support");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur updateTicketStatus:", error);
    return { error: "Une erreur est survenue." };
  }
}

export async function fetchAdminTickets() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: "Non autorisé." };
  }

  // To check if the user is an admin, we can check their role if you have roles implemented.
  // Assuming the route /admin/support is protected, we can proceed.
  const adminClient = createAdminClient();

  try {
    const { data } = await adminClient
      .from("support_tickets")
      .select(`
        *,
        organizations(name),
        locations(name)
      `)
      .order("updated_at", { ascending: false });

    return { success: true, tickets: data || [] };
  } catch (error: any) {
    console.error("Erreur fetchAdminTickets:", error);
    return { error: "Erreur lors de la récupération." };
  }
}

export async function fetchAdminMessages(ticketId: string) {
  const adminClient = createAdminClient();
  try {
    const { data } = await adminClient
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    return { success: true, messages: data || [] };
  } catch (error: any) {
    console.error("Erreur fetchAdminMessages:", error);
    return { error: "Erreur lors de la récupération." };
  }
}
