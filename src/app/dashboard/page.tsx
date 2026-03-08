"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DashboardStats } from "@/types";
import StatsCard from "@/components/dashboard/StatsCard";
import ActivityChart from "@/components/dashboard/ActivityChart";
import TagCloud from "@/components/dashboard/TagCloud";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  FolderKanban,
  Bookmark,
  Flame,
} from "lucide-react";

export default function DashboardPage() {

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await axios.get<{ data: DashboardStats }>("/api/dashboard");
      return res.data.data;
    },
  });

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="pb-6 border-b border-border/40">
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2 font-mono">
          Overview / Section 00
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-foreground" style={{ fontFamily: "Georgia, serif" }}>
          Dashboard
        </h1>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Entries Logged"
          value={data.totalEntries}
          icon={BookOpen}
          description="Total log entries"
        />
        <StatsCard
          title="Projects"
          value={data.totalProjects}
          icon={FolderKanban}
          description="Projects tracked"
        />
        <StatsCard
          title="Resources"
          value={data.totalResources}
          icon={Bookmark}
          description="Links saved"
        />
        <StatsCard
          title="Day Streak"
          value={data.currentStreak}
          icon={Flame}
          description={
            data.currentStreak > 0
              ? "Keep it up!"
              : "Log an entry to start"
          }
        />
      </div>

      {/* Activity chart and tag cloud */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityChart data={data.weeklyActivity} />
        <TagCloud tags={data.topTags} />
      </div>

    </div>
  );
}