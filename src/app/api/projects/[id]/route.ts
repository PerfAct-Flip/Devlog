import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UpdateProjectSchema } from "@/lib/validations";

// GET single project
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await db.project.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        entries: {
          include: {
            entry: {
              include: {
                tags: { include: { tag: true } },
              },
            },
          },
        },
        resources: {
          include: { tags: { include: { tag: true } } },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const formatted = {
      ...project,
      tags: project.tags.map((t) => t.tag),
      entries: project.entries.map((p) => ({
        ...p.entry,
        tags: p.entry.tags.map((t) => t.tag),
      })),
      resources: project.resources.map((r) => ({
        ...r,
        tags: r.tags.map((t) => t.tag),
      })),
    };

    return NextResponse.json({ data: formatted }, { status: 200 });
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PUT update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = UpdateProjectSchema.safeParse({ ...body, id });

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, description, status, liveUrl, repoUrl, tags } =
      validated.data;

    // delete existing tag junctions first
    await db.projectTag.deleteMany({ where: { projectId: id } });

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

    const project = await db.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(status && { status }),
        ...(liveUrl !== undefined && { liveUrl: liveUrl || null }),
        ...(repoUrl !== undefined && { repoUrl: repoUrl || null }),
        tags: {
          create: tagRecords.map((tag) => ({
            tag: { connect: { id: tag.id } },
          })),
        },
      },
      include: {
        tags: { include: { tag: true } },
        entries: { include: { entry: true } },
        resources: true,
      },
    });

    const formatted = {
      ...project,
      tags: project.tags.map((t) => t.tag),
      entries: project.entries.map((p) => p.entry),
    };

    return NextResponse.json({ data: formatted }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE project
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.project.delete({ where: { id } });

    return NextResponse.json(
      { message: "Project deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}