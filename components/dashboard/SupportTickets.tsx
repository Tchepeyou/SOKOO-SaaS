"use client";

import { useState, useEffect, useTransition } from "react";
import { MessageCircle, Plus, ChevronRight, X, Clock, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createTicket, replyToTicket } from "@/lib/actions/support";
import { useLocation } from "@/lib/contexts/LocationContext";
import { toast } from "sonner";

export default function SupportTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const { activeLocationId } = useLocation();

  const fetchTickets = async () => {
    if (!activeLocationId) return;
    setIsLoading(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", session.user.id).single();
      if (profile?.organization_id) {
        const { data } = await supabase
          .from("support_tickets")
          .select("*")
          .eq("organization_id", profile.organization_id)
          .eq("location_id", activeLocationId)
          .order("updated_at", { ascending: false });
        if (data) setTickets(data);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const openTicket = async (ticket: any) => {
    setSelectedTicket(ticket);
    const supabase = createClient();
    const { data } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
  };

  const handleCreateTicket = (formData: FormData) => {
    startTransition(async () => {
      const res = await createTicket(formData);
      if (res?.success) {
        setIsCreating(false);
        fetchTickets();
      } else {
        toast.error(res?.error || "Erreur de création");
      }
    });
  };

  const handleReply = (formData: FormData) => {
    startTransition(async () => {
      formData.append("ticketId", selectedTicket.id);
      formData.append("isAdmin", "false");
      const res = await replyToTicket(formData);
      if (res?.success) {
        const input = document.getElementById("message-input") as HTMLInputElement;
        if (input) input.value = "";
        openTicket(selectedTicket);
        fetchTickets();
      } else {
        toast.error(res?.error || "Erreur");
      }
    });
  };

  if (isLoading) {
    return <div className="text-sm text-slate-500 animate-pulse">Chargement de vos tickets...</div>;
  }

  if (isCreating) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative">
        <button onClick={() => setIsCreating(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h4 className="font-semibold text-slate-900 mb-4">Nouveau Ticket de Support</h4>
        <form action={handleCreateTicket} className="space-y-4">
          {activeLocationId && <input type="hidden" name="location_id" value={activeLocationId} />}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sujet de votre demande</label>
            <input type="text" name="subject" required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue" placeholder="Ex: Problème d'impression..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Message détaillé</label>
            <textarea name="message" required rows={4} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue resize-none" placeholder="Expliquez-nous comment nous pouvons vous aider..."></textarea>
          </div>
          <button type="submit" disabled={isPending} className="w-full bg-brand-blue text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-70">
            {isPending ? "Création en cours..." : "Soumettre le ticket"}
          </button>
        </form>
      </div>
    );
  }

  if (selectedTicket) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 flex flex-col h-[500px] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
          <button onClick={() => setSelectedTicket(null)} className="p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h4 className="font-medium text-slate-900">{selectedTicket.subject}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{selectedTicket.status}</span>
              <span>•</span>
              <span>Réf: TK-{selectedTicket.ticket_number}</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30">
          {messages.map((msg: any) => {
            const isAdmin = msg.is_admin;
            return (
              <div key={msg.id} className={`flex flex-col max-w-[85%] ${isAdmin ? "items-start" : "items-end ml-auto"}`}>
                <div className={`p-3 rounded-2xl text-sm ${isAdmin ? "bg-white border border-slate-200 text-slate-800 rounded-tl-none" : "bg-brand-blue text-white rounded-tr-none"}`}>
                  {msg.message}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {new Date(msg.created_at).toLocaleString('fr-FR', { hour: '2-digit', minute:'2-digit', day:'2-digit', month:'short' })}
                  {isAdmin ? " • Support" : " • Vous"}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="p-3 bg-white border-t border-slate-100">
          <form action={handleReply} className="flex gap-2">
            <input type="text" id="message-input" name="message" required placeholder="Écrivez votre réponse..." className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue" />
            <button type="submit" disabled={isPending || selectedTicket.status === "Fermé"} className="p-2.5 bg-brand-blue text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </form>
          {selectedTicket.status === "Fermé" && <p className="text-xs text-center text-red-500 mt-2">Ce ticket est fermé. Vous ne pouvez plus y répondre.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="font-semibold text-slate-900">Mes Tickets de Support</h4>
          <p className="text-sm text-slate-500">Suivez vos demandes d'assistance.</p>
        </div>
        <button onClick={() => setIsCreating(true)} className="flex items-center gap-1.5 bg-brand-blue text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Créer
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-8 border border-slate-200 border-dashed rounded-2xl bg-slate-50">
          <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">Vous n'avez aucun ticket en cours.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} onClick={() => openTicket(ticket)} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-blue hover:shadow-sm transition-all cursor-pointer group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="mt-0.5">
                  {ticket.status === "Nouveau" && <div className="w-2.5 h-2.5 rounded-full bg-brand-blue ring-4 ring-blue-50" />}
                  {ticket.status === "En cours" && <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-50" />}
                  {ticket.status === "Résolu" && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />}
                  {ticket.status === "Fermé" && <div className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-slate-50" />}
                </div>
                <div>
                  <h5 className="text-sm font-medium text-slate-900 group-hover:text-brand-blue transition-colors">{ticket.subject}</h5>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(ticket.updated_at).toLocaleDateString('fr-FR')}</span>
                    <span>•</span>
                    <span>TK-{ticket.ticket_number}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-blue transition-colors group-hover:translate-x-1" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
