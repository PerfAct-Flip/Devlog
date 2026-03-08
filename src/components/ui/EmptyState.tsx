import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-24 px-6 text-center border border-border/40 bg-accent/[0.03] rounded-none",
        className
      )}
    >
      {/* Icon frame */}
      <div className="h-16 w-16 bg-accent/10 border border-border/20 flex items-center justify-center mb-10 transform rotate-45">
        <Icon className="h-6 w-6 text-foreground transform -rotate-45" />
      </div>

      {/* Text */}
      <div className="space-y-4 max-w-md">
        <h3 className="text-2xl font-black text-foreground px-2 italic" style={{ fontFamily: "Georgia, serif" }}>{title}</h3>
        <p className="text-[11px] uppercase tracking-[0.2em] font-mono text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {/* Optional action button */}
      {actionLabel && onAction && (
        <button 
            onClick={onAction} 
            className="mt-12 px-8 py-4 bg-foreground text-background font-black text-[11px] tracking-[0.2em] uppercase hover:opacity-90 transition-all font-mono rounded-none"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}