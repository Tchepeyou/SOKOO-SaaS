import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "blue" | "green" | "orange" | "red" | "purple";
  description?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  variant = "blue",
  description,
}: StatCardProps) {
  // Mapping the old variants to the new 4-color model requested by the user
  const variantStyles = {
    blue: { // mapped to Gray from the image (Hub)
      iconBg: "bg-slate-200/80",
      iconColor: "text-slate-700",
    },
    green: { // mapped to Green from the image (WhatsApp)
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    orange: { // mapped to Yellow from the image (Suggestions)
      iconBg: "bg-yellow-100/80",
      iconColor: "text-yellow-600",
    },
    red: { // mapped to Pink from the image (Youtube)
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
    },
    purple: { // Fallback
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  };

  const style = variantStyles[variant] || variantStyles.blue;

  return (
    <div className="bg-[#f8f9fa] rounded-2xl p-3.5 sm:p-4 flex flex-col items-start gap-2 transition-all hover:bg-[#f1f3f5] relative overflow-hidden group print:bg-white print:border print:border-slate-200 print:shadow-none print:break-inside-avoid">
      <div className="flex items-center gap-2 w-full">
        <div className={cn("p-1.5 rounded-full flex-shrink-0 flex items-center justify-center relative z-10", style.iconBg)}>
          <Icon className={cn("h-4 w-4", style.iconColor)} strokeWidth={2} />
        </div>
      </div>
      <div className="relative z-10 w-full mt-1">
        <p className="text-2xl sm:text-[26px] leading-none font-bold tracking-tight text-slate-900">{value}</p>
      </div>
      <div className="relative z-10 w-full flex items-center justify-between mt-2 border-t border-slate-200/60 pt-2">
        <p className="text-[10px] sm:text-xs font-medium text-slate-500">{title}</p>
        <span className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full border border-slate-300 text-slate-400 text-[9px] font-medium" title={description}>i</span>
      </div>
    </div>
  );
}
