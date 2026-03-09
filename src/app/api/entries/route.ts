import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CreateEntrySchema } from "@/lib/validations";
import z from "zod";
// GET all entries
export async function GET() {
  try {
    const entries = await db.entry.findMany({
      orderBy: { date: "desc" },
      include: {
        tags: {
          include: { tag: true },
        },
        projects: {
          include: { project: true },
        },
        resources: true,
      },
    });

    // flatten tags from junction table
    const formatted = entries.map((entry) => ({
      ...entry,
      tags: entry.tags.map((t) => t.tag),
      projects: entry.projects.map((p) => p.project),
    }));

    return NextResponse.json({ data: formatted }, { status: 200 });
  } catch (error) {
    console.error("GET /api/entries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}

// POST create new entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateEntrySchema.safeParse(body);

    if (!validated.success) {
      const flattened = z.flattenError(validated.error);

  return NextResponse.json(
    { error: flattened.fieldErrors }, 
    { status: 400 }
  );
    }

    const { title, date, body: entryBody, tags, projectIds, resourceIds } = validated.data;

    // upsert tags — create if they don't exist
    const tagRecords = await Promise.all(
      tags.map((name) =>
        db.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        })
      )
    );

    const entry = await db.entry.create({
      data: {
        title,
        date: new Date(date),
        body: entryBody,
        tags: {
          create: tagRecords.map((tag) => ({
            tag: { connect: { id: tag.id } },
          })),
        },
        projects: {
          create: projectIds.map((projectId) => ({
            project: { connect: { id: projectId } },
          })),
        },
        // update resources to point to this entry
        ...(resourceIds && resourceIds.length > 0 && {
          resources: {
            connect: resourceIds.map((id) => ({ id })),
          },
        }),
      },
      include: {
        tags: { include: { tag: true } },
        projects: { include: { project: true } },
        resources: true,
      },
    });

    const formatted = {
      ...entry,
      tags: entry.tags.map((t) => t.tag),
      projects: entry.projects.map((p) => p.project),
    };

    return NextResponse.json({ data: formatted }, { status: 201 });
  } catch (error) {
    console.error("POST /api/entries error:", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 }
    );
  }
}