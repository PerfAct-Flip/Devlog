"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { BookOpen, FolderKanban, Bookmark, LayoutDashboard, Menu, X, Code2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/log",
    label: "Learning Log",
    icon: BookOpen,
  },
  {
    href: "/projects",
    label: "Projects",
    icon: FolderKanban,
  },
  {
    href: "/resources",
    label: "Resources",
    icon: Bookmark,
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <nav className="border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-50 h-16">
        <div className="container mx-auto px-6 max-w-6xl h-full flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-lg tracking-tighter opacity-50">
             <Code2 className="h-5 w-5 text-[#a78bfa]" />
             <span className="text-foreground">DEVLOG</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-50" suppressHydrationWarning>
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-black text-lg tracking-tighter hover:opacity-80 transition-opacity"
            style={{ fontFamily: "monospace" }}
          >
            <Code2 className="h-5 w-5 text-[#a78bfa]" />
            <span className="text-foreground">DEVLOG</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-[0.15em] transition-all",
                      "font-mono border border-transparent",
                      isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
            
            <div className="h-4 w-[1px] bg-border/40" />
            <ThemeToggle />
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button
              className="p-2 border border-border/40 hover:bg-accent/50 text-muted-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/40 py-3 flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-none text-[12px] font-bold uppercase tracking-[0.15em] transition-colors",
                    "font-mono",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}