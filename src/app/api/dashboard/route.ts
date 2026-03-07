import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateStreak, buildWeeklyActivity, getTopTags } from "@/lib/utils";

export async function GET() {
  try {
    // COUNTS
    const [totalEntries, totalProjects, totalResources] = await Promise.all([
      db.entry.count(),
      db.project.count(),
      db.resource.count(),
    ]);

    // STREAK — fetch all entry dates
    const entryDates = await db.entry.findMany({
      select: { date: true },
      orderBy: { date: "desc" },
    });

    const currentStreak = calculateStreak(
      entryDates.map((e) => e.date)
    );

    // WEEKLY ACTIVITY — last 8 weeks
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const recentEntries = await db.entry.findMany({
      where: { date: { gte: eightWeeksAgo } },
      select: { date: true },
    });

    const weeklyActivity = buildWeeklyActivity(
      recentEntries.map((e) => e.date)
    );

    // TOP TAGS — across all entries
    const allEntryTags = await db.entryTag.findMany({
      include: { tag: true },
    });

    const topTags = getTopTags(
      allEntryTags.map((et) => ({ name: et.tag.name }))
    );

    // RESPONSE
    return NextResponse.json({
      data: {
        totalEntries,
        totalProjects,
        totalResources,
        currentStreak,
        weeklyActivity,
        topTags,
      },
    }, { status: 200 });

  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}