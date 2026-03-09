import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CreateProjectSchema } from "@/lib/validations";

// GET all projects
export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        tags: { include: { tag: true } },
        entries: { include: { entry: true } },
        resources: true,
      },
    });

    const formatted = projects.map((project) => ({
      ...project,
      tags: project.tags.map((t) => t.tag),
      entries: project.entries.map((p) => p.entry),
    }));

    return NextResponse.json({ data: formatted }, { status: 200 });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateProjectSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, description, status, liveUrl, repoUrl, tags, entryIds, resourceIds } =
      validated.data;

    // upsert tags — create if they don't exist
    const tagRecords = await Promise.all(
      tags.map((tagName) =>
        db.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        })
      )
    );

    const project = await db.project.create({
      data: {
        name,
        description,
        status,
        liveUrl: liveUrl ?? null,
        repoUrl: repoUrl ?? null,
        tags: {
          create: tagRecords.map((tag) => ({
            tag: { connect: { id: tag.id } },
          })),
        },
        // Link entries
        ...(entryIds && entryIds.length > 0 && {
          entries: {
            create: entryIds.map((entryId) => ({
              entry: { connect: { id: entryId } },
            })),
          },
        }),
        // Link resources
        ...(resourceIds && resourceIds.length > 0 && {
          resources: {
            connect: resourceIds.map((id) => ({ id })),
          },
        }),
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

    return NextResponse.json({ data: formatted }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}