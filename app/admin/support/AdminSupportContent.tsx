"use client";

import { useState, useEffect, useTransition } from "react";
import { MessageSquare, Mail, Search, Clock, CheckCircle2, ChevronRight, Send, User, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { replyToTicket, updateTicketStatus, fetchAdminTickets, fetchAdminMessages } from "@/lib/actions/support";

export default function AdminSupportContent() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const fetchTickets = async () => {
    setIsLoading(true);
    const res = await fetchAdminTickets();
    
    if (res?.success && res.tickets) {
      setTickets(res.tickets);
      setFilteredTickets(res.tickets);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTickets(tickets);
    } else {
      setFilteredTickets(tickets.filter(t => 
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.organizations?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.locations?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `TK-${t.ticket_number}`.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    }
  }, [searchQuery, tickets]);

  const openTicket = async (ticket: any) => {
    setSelectedTicket(ticket);
    const res = await fetchAdminMessages(ticket.id);
    if (res?.success && res.messages) {
      setMessages(res.messages);
    }
  };

  const handleReply = (formData: FormData) => {
    startTransition(async () => {
      formData.append("ticketId", selectedTicket.id);
      formData.append("isAdmin", "true");
      const res = await replyToTicket(formData);
      if (res?.success) {
        const input = document.getElementById("admin-message-input") as HTMLInputElement;
        if (input) input.value = "";
        openTicket(selectedTicket);
        fetchTickets(); // Refresh list to update status if needed
      } else {
        toast.error(res?.error || "Erreur d'envoi");
      }
    });
  };

  const changeStatus = (newStatus: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("ticketId", selectedTicket.id);
      formData.append("status", newStatus);
      const res = await updateTicketStatus(formData);
      if (res?.success) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
        fetchTickets();
      } else {
        toast.error("Erreur de modification du statut");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Support & Assistance</h2>
          <p className="text-sm text-slate-500 mt-1">Gérez les demandes d'aide et les tickets des utilisateurs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
            {selectedTicket ? (
              <div className="flex flex-col h-full bg-white">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedTicket(null)} className="p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <div>
                      <h4 className="font-semibold text-slate-900">{selectedTicket.subject}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700">{selectedTicket.organizations?.name}{selectedTicket.locations?.name ? ` - ${selectedTicket.locations.name}` : ''}</span>
                        <span>•</span>
                        <span>Réf: TK-{selectedTicket.ticket_number}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <select 
                      value={selectedTicket.status}
                      onChange={(e) => changeStatus(e.target.value)}
                      disabled={isPending}
                      className="text-xs font-medium rounded-lg border border-slate-200 px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Nouveau">Nouveau</option>
                      <option value="En cours">En cours</option>
                      <option value="Résolu">Résolu</option>
                      <option value="Fermé">Fermé</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                  {messages.map((msg: any) => {
                    const isAdmin = msg.is_admin;
                    return (
                      <div key={msg.id} className={`flex flex-col max-w-[85%] ${isAdmin ? "items-end ml-auto" : "items-start"}`}>
                        <div className={`p-4 rounded-2xl text-sm shadow-sm ${isAdmin ? "bg-slate-800 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"}`}>
                          {msg.message}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                          {isAdmin ? <ShieldIcon className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {new Date(msg.created_at).toLocaleString('fr-FR', { hour: '2-digit', minute:'2-digit', day:'2-digit', month:'short' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="p-4 bg-white border-t border-slate-100">
                  <form action={handleReply} className="flex gap-2">
                    <input type="text" id="admin-message-input" name="message" required placeholder="Votre réponse..." className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="submit" disabled={isPending || selectedTicket.status === "Fermé"} className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-semibold text-slate-900">Tickets Récents</h3>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Rechercher..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-48 transition-all"
                    />
                  </div>
                </div>
                {isLoading ? (
                  <div className="p-8 text-center text-slate-500 animate-pulse">Chargement des tickets...</div>
                ) : filteredTickets.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">Aucun ticket trouvé.</div>
                ) : (
                  <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
                    {filteredTickets.map((ticket) => (
                      <div key={ticket.id} onClick={() => openTicket(ticket)} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group">
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {ticket.status === "Nouveau" && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50" />}
                            {ticket.status === "En cours" && <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-50" />}
                            {ticket.status === "Résolu" && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />}
                            {ticket.status === "Fermé" && <div className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-slate-50" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{ticket.subject}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              <span className="font-medium text-slate-700">{ticket.organizations?.name}{ticket.locations?.name ? ` - ${ticket.locations.name}` : ''}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(ticket.updated_at).toLocaleDateString('fr-FR')}</span>
                              <span>•</span>
                              <span className="font-mono">TK-{ticket.ticket_number}</span>
                            </div>
                          </div>
                        </div>
                        <button className="hidden sm:block px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-white transition-colors shadow-sm group-hover:border-blue-200 group-hover:text-blue-600">
                          Ouvrir
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm bg-gradient-to-b from-blue-50 to-white">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Nouveaux Tickets</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {tickets.filter(t => t.status === "Nouveau").length}
            </p>
            <p className="text-sm text-slate-500 mt-1">En attente de réponse</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Statut global
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Tickets ouverts</span>
                <span className="font-medium text-amber-600">{tickets.filter(t => t.status !== "Résolu" && t.status !== "Fermé").length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Tickets résolus</span>
                <span className="font-medium text-emerald-600">{tickets.filter(t => t.status === "Résolu").length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Tickets fermés</span>
                <span className="font-medium text-slate-600">{tickets.filter(t => t.status === "Fermé").length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShieldIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}
