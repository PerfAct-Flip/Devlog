import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UpdateEntrySchema } from "@/lib/validations";

// GET single entry
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const entry = await db.entry.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        projects: { include: { project: true } },
        resources: {
          include: { tags: { include: { tag: true } } },
        },
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 }
      );
    }

    const formatted = {
      ...entry,
      tags: entry.tags.map((t) => t.tag),
      projects: entry.projects.map((p) => p.project),
      resources: entry.resources.map((r) => ({
        ...r,
        tags: r.tags.map((t) => t.tag),
      })),
    };

    return NextResponse.json({ data: formatted }, { status: 200 });
  } catch (error) {
    console.error("GET /api/entries/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch entry" },
      { status: 500 }
    );
  }
}

// PUT update entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = UpdateEntrySchema.safeParse({ ...body, id });

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, date, body: entryBody, tags, projectIds } = validated.data;

    // delete existing junction records first
    await db.entryTag.deleteMany({ where: { entryId: id } });
    await db.projectEntry.deleteMany({ where: { entryId: id } });

    // upsert new tags
    const tagRecords = tags
      ? await Promise.all(
          tags.map((name) =>
            db.tag.upsert({
              where: { name },
              update: {},
              create: { name },
            })
          )
        )
      : [];

    const entry = await db.entry.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(date && { date: new Date(date) }),
        ...(entryBody && { body: entryBody }),
        tags: {
          create: tagRecords.map((tag) => ({
            tag: { connect: { id: tag.id } },
          })),
        },
        projects: {
          create: (projectIds ?? []).map((projectId) => ({
            project: { connect: { id: projectId } },
          })),
        },
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

    return NextResponse.json({ data: formatted }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/entries/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

// DELETE entry
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.entry.delete({ where: { id } });

    return NextResponse.json(
      { message: "Entry deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/entries/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}