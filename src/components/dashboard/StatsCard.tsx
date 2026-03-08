import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-accent/[0.03] border border-border/40 rounded-none p-6 flex flex-col gap-6",
        className
      )}
    >
      {/* Icon and title */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-muted-foreground font-mono">{title}</p>
        <div className="h-8 w-8 rounded-none bg-accent/10 border border-border/20 flex items-center justify-center">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
      </div>

      {/* Value */}
      <div>
        <p className="text-4xl font-black text-foreground leading-none">{value}</p>
        {description && (
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/40 mt-3 font-mono">{description}</p>
        )}
      </div>
    </div>
  );
}