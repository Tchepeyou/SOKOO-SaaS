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
  const variants = {
    blue: "bg-brand-blue text-white shadow-brand-blue/20 border-brand-blue/10",
    green: "bg-brand-green text-white shadow-brand-green/20 border-brand-green/10",
    orange: "bg-brand-orange text-white shadow-brand-orange/20 border-brand-orange/10",
    red: "bg-brand-red text-white shadow-brand-red/20 border-brand-red/10",
    purple: "bg-brand-purple text-white shadow-brand-purple/20 border-brand-purple/10",
  };

  return (
    <div className={cn("rounded-2xl shadow-sm border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-all hover:-translate-y-1 hover:shadow-md relative overflow-hidden group", variants[variant])}>
      {/* Decorative background circle */}
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
      
      <div className="p-2.5 sm:p-3 rounded-xl bg-white/20 flex-shrink-0 backdrop-blur-sm relative z-10">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2} />
      </div>
      <div className="relative z-10">
        <h3 className="text-xs sm:text-sm font-medium text-white/90 line-clamp-1">{title}</h3>
        <p className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1 sm:mt-0.5">{value}</p>
        {description && (
          <p className="text-[10px] sm:text-xs text-white/75 mt-1 sm:mt-1 opacity-90 hidden sm:block">{description}</p>
        )}
      </div>
    </div>
  );
}
