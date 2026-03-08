"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { WeeklyActivity } from "@/types";

interface ActivityChartProps {
  data: WeeklyActivity[];
}

export default function ActivityChart({ data }: ActivityChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-accent/[0.03] border border-border/40 rounded-none p-6 h-[348px]" />
    );
  }

  const isDark = resolvedTheme === "dark";
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const textColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)";
  const barColor = isDark ? "#ffffff" : "#000000";
  const tooltipBg = isDark ? "#0a0a0a" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <div className="bg-accent/[0.03] border border-border/40 rounded-none p-6 space-y-8">
      <div>
        <h3 className="text-sm font-bold tracking-tight uppercase" style={{ fontFamily: "monospace" }}>Activity</h3>
        <p className="text-[10px] tracking-widest text-muted-foreground mt-1 font-mono uppercase">
          Log entries / 8 week span
        </p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridColor}
            vertical={false}
          />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 9, fill: textColor, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: textColor, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: "0px",
              fontSize: "10px",
              fontFamily: "monospace",
              color: isDark ? "#fff" : "#000"
            }}
            itemStyle={{ color: "#a78bfa" }}
            labelStyle={{ fontWeight: 800, color: isDark ? "#fff" : "#000", marginBottom: "4px" }}
            cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
          />
          <Bar
            dataKey="count"
            name="Entries"
            fill={barColor}
            radius={[0, 0, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}