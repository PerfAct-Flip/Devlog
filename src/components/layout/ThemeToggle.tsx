"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 p-1.5 border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
        <div className="w-full h-full opacity-20" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-1.5 border border-border bg-accent/5 hover:bg-accent/10 hover:border-accent/30 transition-all group relative overflow-hidden"
      aria-label="Toggle theme"
    >
      <div className="relative z-10">
        {isDark ? (
          <Sun className="h-4 w-4 text-[#fbbf24] group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon className="h-4 w-4 text-[#4f46e5] group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </div>
      
      {/* Riven style glow */}
      {isDark && (
        <div className="absolute inset-0 bg-[#fbbf24]/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
      {!isDark && (
        <div className="absolute inset-0 bg-[#4f46e5]/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}
