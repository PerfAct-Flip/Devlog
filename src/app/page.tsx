"use client";

import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { DashboardStats } from "@/types";
import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await axios.get<{ data: DashboardStats }>("/api/dashboard");
      return res.data.data;
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Riven animated dot grid
  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    let animId: number;

    const isDark = resolvedTheme === "dark";
    const dotColor = "139, 92, 246"; // Always Riven purple
    const dotOpacity = isDark ? 0.22 : 0.06;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const spacing = 28;
      const cols = Math.ceil(canvas.width / spacing);
      const rows = Math.ceil(canvas.height / spacing);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;
          const dist = Math.sqrt(
            Math.pow(x - canvas.width / 2, 2) +
            Math.pow(y - canvas.height / 2, 2)
          );
          const wave = Math.sin(dist / 60 - frame / 40) * 0.5 + 0.5;
          ctx.beginPath();
          ctx.arc(x, y, 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${dotColor}, ${wave * dotOpacity})`;
          ctx.fill();
        }
      }
      frame++;
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [resolvedTheme, mounted]);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  const steps = [
    {
      num: "01",
      title: "Log Entries",
      desc: "Write daily notes on anything you learned. Tag them, date them, link them to projects.",
    },
    {
      num: "02",
      title: "Track Projects",
      desc: "Move ideas from concept to shipped. Every status change tells your story.",
    },
    {
      num: "03",
      title: "Save Resources",
      desc: "Bookmark articles, videos, docs and courses. Mark read. Star the ones that matter.",
    },
    {
      num: "04",
      title: "See Progress",
      desc: "Dashboard shows your streak, activity chart, and most-used tags at a glance.",
    },
  ];

  const sections = [
    {
      href: "/log",
      level: "SECTION 01",
      title: "Learning Log",
      desc: "Chronological entries. Markdown support. Tag everything.",
      stat: data?.totalEntries ?? 0,
      statLabel: "entries logged",
      accent: "#a78bfa",
    },
    {
      href: "/projects",
      level: "SECTION 02",
      title: "Projects",
      desc: "Idea → Building → Shipped → Paused. Link log entries per project.",
      stat: data?.totalProjects ?? 0,
      statLabel: "projects tracked",
      accent: "#34d399",
    },
    {
      href: "/resources",
      level: "SECTION 03",
      title: "Resources",
      desc: "Your personal bookmark manager. Filter by category, read status, favourites.",
      stat: data?.totalResources ?? 0,
      statLabel: "resources saved",
      accent: "#fb923c",
    },
  ];

  return (
    <div
      className="-mx-4 -mt-8 relative overflow-hidden bg-background transition-colors duration-500 min-h-screen"
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      {/* Riven animated dot grid */}
      <canvas
        ref={canvasRef}
        className={cn("absolute inset-0 w-full h-full pointer-events-none transition-opacity", isDark ? "opacity-50" : "opacity-40")}
        style={{ zIndex: 0 }}
      />

      {/* Riven glow orbs */}
      <div
        className="absolute pointer-events-none transition-all duration-700"
        style={{
          top: "-8%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "420px",
          background: isDark 
            ? "radial-gradient(ellipse, rgba(124,58,237,0.22) 0%, transparent 70%)"
            : "radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)",
          filter: "blur(48px)",
          zIndex: 0,
        }}
      />

      <div
        className="absolute pointer-events-none transition-all duration-700"
        style={{
          bottom: "10%",
          right: "-5%",
          width: "400px",
          height: "300px",
          background: isDark
            ? "radial-gradient(ellipse, rgba(52,211,153,0.08) 0%, transparent 70%)"
            : "radial-gradient(ellipse, rgba(52,211,153,0.03) 0%, transparent 70%)",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />

      {/* All content above canvas */}
      <div className="relative" style={{ zIndex: 1 }}>

        {/* ── HERO ── */}
        <section className="max-w-6xl mx-auto px-8 pt-24 pb-16">
          <p className="text-xs tracking-[0.3em] uppercase mb-8 text-muted-foreground/60 font-mono">
            Developer Learning Journal
          </p>

          <h1 className="text-6xl sm:text-7xl font-black leading-none mb-2 text-foreground">
            Your learning.
          </h1>
          <h1 className="text-6xl sm:text-7xl font-black leading-none mb-12 text-[#a78bfa] italic">
            Finally documented.
          </h1>

          <p className="max-w-lg mb-10 leading-relaxed text-muted-foreground font-mono text-[13px]">
            DevLog is your personal space to document what you learn,
            track projects end-to-end, and bookmark resources that matter.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/log"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-wide transition-all duration-200 hover:opacity-90 hover:scale-[1.02] bg-foreground text-background font-mono"
            >
              START LOGGING
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-wide transition-all duration-200 hover:opacity-80 border border-border text-muted-foreground font-mono hover:text-foreground hover:bg-accent/50"
            >
              VIEW DASHBOARD
            </Link>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="max-w-6xl mx-auto px-8 py-16">
          <p className="text-xs tracking-[0.3em] uppercase mb-10 text-muted-foreground/60 font-mono">
            How It Works
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-border/40 bg-accent/[0.03] backdrop-blur-sm">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={cn(
                  "p-8 flex flex-col gap-6",
                  i < steps.length - 1 && "lg:border-r border-border/40",
                  i % 2 === 0 && "sm:border-r lg:border-r"
                )}
              >
                <span className="text-5xl font-black text-muted-foreground/10">
                  {step.num}
                </span>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground font-mono">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTIONS ── */}
        <section className="max-w-6xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-border/40">
            {sections.map((section, i) => (
              <Link
                key={section.href}
                href={section.href}
                className={cn(
                  "group p-8 flex flex-col gap-4 transition-all duration-300 border-b border-border/40 hover:bg-accent/5",
                  i < sections.length - 1 && "sm:border-r border-border/40"
                )}
              >
                {/* Level label */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-0.5 h-4 rounded-full"
                    style={{ background: section.accent }}
                  />
                  <span
                    className="text-xs tracking-[0.2em] font-bold font-mono"
                    style={{ color: section.accent }}
                  >
                    {section.level}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-black leading-tight text-foreground">
                  {section.title}
                </h3>

                {/* Desc */}
                <p className="text-xs leading-relaxed flex-1 text-muted-foreground font-mono">
                  {section.desc}
                </p>

                {/* Stat */}
                <div
                  className="pt-4 flex items-end justify-between"
                  style={{ borderTop: `1px solid ${section.accent}20` }}
                >
                  <span
                    className="text-3xl font-black"
                    style={{ color: section.accent }}
                  >
                    {section.stat}
                  </span>
                  <span className="text-xs mb-1 text-muted-foreground/30 font-mono">
                    {section.statLabel}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── STREAK CALLOUT ── */}
        {data && data.currentStreak > 0 && (
          <section className="max-w-6xl mx-auto px-8 py-8">
            <div className="p-8 flex items-center justify-between border border-orange-500/20 bg-orange-500/5 backdrop-blur-sm">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase mb-2 text-orange-500 font-mono">
                  Active Streak
                </p>
                <p className="text-4xl font-black text-foreground">
                  🔥 {data.currentStreak} day{data.currentStreak !== 1 ? "s" : ""} in a row
                </p>
              </div>
              <Link
                href="/log"
                className="px-5 py-2.5 text-sm font-bold tracking-wide transition-all duration-200 border border-orange-500 text-orange-500 font-mono hover:bg-orange-500 hover:text-white"
              >
                LOG TODAY →
              </Link>
            </div>
          </section>
        )}

        {/* ── FOOTER ── */}
        <footer className="max-w-6xl mx-auto px-8 py-8 flex items-center justify-between border-t border-border/40">
          <p className="text-xs text-muted-foreground/30 font-mono">
            © DEVLOG
          </p>
          <p className="text-xs tracking-widest text-muted-foreground/30 font-mono">
            LOG. BUILD. SHIP.
          </p>
          <div className="flex items-center gap-1.5">
            <Terminal className="h-3 w-3 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground/30 font-mono">
              BUILT FOR DEVELOPERS
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}