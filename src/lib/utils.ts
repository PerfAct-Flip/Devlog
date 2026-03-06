import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// TAILWIND CLASS MERGER

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// DATE FORMATTERS

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateFull(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateInput(date: Date | string): string {
  return new Date(date).toISOString().split("T")[0];
}

export function getWeekLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function isToday(date: Date | string): boolean {
  const today = new Date();
  const d = new Date(date);
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

// STREAK CALCULATOR

export function calculateStreak(dates: Date[] | string[]): number {
  if (dates.length === 0) return 0;

  // deduplicate by day and sort newest first
  const uniqueDays = [
    ...new Set(
      dates.map((d) => new Date(d).toDateString())
    ),
  ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  let expected = new Date();
  expected.setHours(0, 0, 0, 0);

  for (const dayStr of uniqueDays) {
    const day = new Date(dayStr);
    day.setHours(0, 0, 0, 0);

    const diffDays =
      (expected.getTime() - day.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays <= 1) {
      streak++;
      expected = day;
    } else {
      break;
    }
  }

  return streak;
}

// WEEKLY ACTIVITY BUILDER

export function buildWeeklyActivity(
  dates: Date[] | string[]
): { week: string; count: number }[] {
  const weeks: { week: string; count: number }[] = [];
  const now = new Date();

  // build last 8 weeks as buckets
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const count = dates.filter((d) => {
      const date = new Date(d);
      return date >= weekStart && date <= weekEnd;
    }).length;

    weeks.push({
      week: getWeekLabel(weekStart),
      count,
    });
  }

  return weeks;
}

// TAG HELPERS

export function getTopTags(
  tags: { name: string }[],
  limit = 5
): { name: string; count: number }[] {
  const counts: Record<string, number> = {};

  for (const tag of tags) {
    counts[tag.name] = (counts[tag.name] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// STRING HELPERS

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + "...";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}