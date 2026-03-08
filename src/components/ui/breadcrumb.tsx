"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-4 mb-10" />; // Empty placeholder during SSR
  }

  return (
    <nav className="flex flex-wrap items-center gap-y-2 gap-x-2 text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground/60 mb-10" suppressHydrationWarning>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <span className="opacity-30">/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-bold">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
