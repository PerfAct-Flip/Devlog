import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UpdateResourceSchema , ToggleResourceSchema} from "@/lib/validations";

// GET single resource
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const resource = await db.resource.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        entry: { include: { tags: { include: { tag: true } } } },
        project: { include: { tags: { include: { tag: true } } } },
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    const formatted = {
      ...resource,
      tags: resource.tags.map((t) => t.tag),
      entry: resource.entry
        ? {
            ...resource.entry,
            tags: resource.entry.tags.map((t) => t.tag),
          }
        : null,
      project: resource.project
        ? {
            ...resource.project,
            tags: resource.project.tags.map((t) => t.tag),
          }
        : null,
    };

    return NextResponse.json({ data: formatted }, { status: 200 });
  } catch (error) {
    console.error("GET /api/resources/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resource" },
      { status: 500 }
    );
  }
}

// PUT update resource
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = UpdateResourceSchema.safeParse({ ...body, id });

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { url, title, category, notes, tags, entryId, projectId } =
      validated.data;

    // delete existing tag junctions first
    await db.resourceTag.deleteMany({ where: { resourceId: id } });

    // upsert new tags
    const tagRecords = tags
      ? await Promise.all(
          tags.map((tagName) =>
            db.tag.upsert({
              where: { name: tagName },
              update: {},
              create: { name: tagName },
            })
          )
        )
      : [];

    const resource = await db.resource.update({
      where: { id },
      data: {
        url,
        title,
        category,
        notes: notes ?? null,
        entryId: entryId ?? null,
        projectId: projectId ?? null,
        tags: {
          create: tagRecords.map((tag) => ({
            tag: { connect: { id: tag.id } },
          })),
        },
      },
      include: {
        tags: { include: { tag: true } },
        entry: { include: { tags: { include: { tag: true } } } },
        project: { include: { tags: { include: { tag: true } } } },
      },
    });

    const formatted = {
      ...resource,
      tags: resource.tags.map((t) => t.tag),
      entry: resource.entry
        ? {
            ...resource.entry,
            tags: resource.entry.tags.map((t) => t.tag),
          }
        : null,
      project: resource.project
        ? {
            ...resource.project,
            tags: resource.project.tags.map((t) => t.tag),
          }
        : null,
    };

    return NextResponse.json({ data: formatted }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/resources/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 }
    );
  }
}

// DELETE resource
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.resource.delete({ where: { id } });

    return NextResponse.json(
      { message: "Resource deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/resources/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    );
  }
}

// PATCH toggle isRead or isFavourite
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = ToggleResourceSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const resource = await db.resource.update({
      where: { id },
      data: {
        ...(validated.data.isRead !== undefined && {
          isRead: validated.data.isRead,
        }),
        ...(validated.data.isFavourite !== undefined && {
          isFavourite: validated.data.isFavourite,
        }),
      },
      include: {
        tags: { include: { tag: true } },
      },
    });

    const formatted = {
      ...resource,
      tags: resource.tags.map((t) => t.tag),
    };

    return NextResponse.json({ data: formatted }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/resources/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 }
    );
  }
}