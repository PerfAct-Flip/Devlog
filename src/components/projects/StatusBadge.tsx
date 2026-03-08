"use client";

import { useEffect, useState } from "react";
import { ProjectStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

const statusConfig: Record<
  ProjectStatus,
  { label: string; markerColor: string }
> = {
  Idea: {
    label: "IDEA",
    markerColor: "bg-amber-500",
  },
  Building: {
    label: "BUILDING",
    markerColor: "bg-[#a78bfa]",
  },
  Shipped: {
    label: "SHIPPED",
    markerColor: "bg-emerald-500",
  },
  Paused: {
    label: "PAUSED",
    markerColor: "bg-slate-500",
  },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const config = statusConfig[status] || {
    label: status.toUpperCase(),
    markerColor: "bg-gray-500",
  };

  if (!mounted) {
    return <div className={cn("inline-flex items-center gap-2 px-3 py-1 border border-border/20 bg-accent/5 opacity-50", className)} />;
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 border border-border/40 bg-accent/[0.03] transition-all",
        className
      )}
      suppressHydrationWarning
    >
      <div className={cn("w-1 h-1 rounded-none", config.markerColor)} />
      <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 font-mono">
        {config.label}
      </span>
    </div>
  );
}