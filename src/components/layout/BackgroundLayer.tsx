"use client";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export default function BackgroundLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    let animId: number;

    const isDark = resolvedTheme === "dark";
    const dotColor = "139, 92, 246"; // Always Riven purple
    const dotOpacity = isDark ? 0.22 : 0.06; // Much more subtle in light mode to keep background white

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

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* Base background */}
      <div className="absolute inset-0 bg-background transition-colors duration-500" />
      
      {/* Dot grid */}
      <canvas
        ref={canvasRef}
        className={cn("absolute inset-0 w-full h-full", isDark ? "opacity-50" : "opacity-40")}
      />

      {/* Riven glow orbs */}
      <div
        className="absolute transition-all duration-500"
        style={{
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80vw",
          height: "50vh",
          background: isDark 
            ? "radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)"
            : "radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div
        className="absolute transition-all duration-500"
        style={{
          bottom: "10%",
          right: "-5%",
          width: "40vw",
          height: "40vh",
          background: isDark
            ? "radial-gradient(ellipse, rgba(52,211,153,0.05) 0%, transparent 70%)"
            : "radial-gradient(ellipse, rgba(52,211,153,0.03) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
    </div>
  );
}
