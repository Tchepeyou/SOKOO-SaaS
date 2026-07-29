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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-all hover:-translate-y-1 hover:shadow-md relative overflow-hidden group">
      <div className={cn("p-3 rounded-full flex-shrink-0 flex items-center justify-center relative z-10", style.iconBg)}>
        <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", style.iconColor)} strokeWidth={2} />
      </div>
      <div className="relative z-10 flex-1">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">{title}</h3>
        <p className="text-[10px] sm:text-xs text-slate-500 mt-1 mb-1 hidden sm:block">{description}</p>
      </div>
      <div className="relative z-10 text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
        <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      </div>
    </div>
  );
}
