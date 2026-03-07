import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CreateResourceSchema } from "@/lib/validations";

// GET all  resources
export async function GET() {
  try {
    const resources = await db.resource.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        tags: { include: { tag: true } },
      },
    })

    const formatted = resources.map((resource) => ({
      ...resource,
      tags: resource.tags.map((t) => t.tag),
    }));

    return NextResponse.json({ data: formatted }, { status: 200 });
  } catch (error) {
    console.error("GET /api/resources error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

// POST create new resource
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateResourceSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { url, title, category, notes, tags, entryId, projectId } =
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

    const resource = await db.resource.create({
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
  },    
    });

    const formatted = {
      ...resource,
      tags: resource.tags.map((t) => t.tag),
    };

    return NextResponse.json({ data: formatted }, { status: 201 });
  } catch (error) {
    console.error("POST /api/resources error:", error);
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
}