"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const whatsappNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER || "237000000000";
  const message = encodeURIComponent("Bonjour, j'ai besoin d'aide avec Sokoo");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/50"
      aria-label="Support WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
