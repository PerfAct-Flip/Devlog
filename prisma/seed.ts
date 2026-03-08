import "dotenv/config";
import pkg from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const { PrismaClient } = pkg;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // CLEANUP EXISTING DATA
  await prisma.resourceTag.deleteMany();
  await prisma.projectTag.deleteMany();
  await prisma.entryTag.deleteMany();
  await prisma.projectEntry.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.entry.deleteMany();
  await prisma.project.deleteMany();
  await prisma.tag.deleteMany();

  console.log("Cleaned existing data");

  // TAGS
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "React" } }),
    prisma.tag.create({ data: { name: "TypeScript" } }),
    prisma.tag.create({ data: { name: "Next.js" } }),
    prisma.tag.create({ data: { name: "Prisma" } }),
    prisma.tag.create({ data: { name: "CSS" } }),
    prisma.tag.create({ data: { name: "Node.js" } }),
    prisma.tag.create({ data: { name: "DSA" } }),
    prisma.tag.create({ data: { name: "System Design" } }),
    prisma.tag.create({ data: { name: "Tailwind" } }),
    prisma.tag.create({ data: { name: "SQLite" } }),
  ]);

  const [
    react,
    typescript,
    nextjs,
    prismaTag,
    css,
    nodejs,
    dsa,
    systemDesign,
    tailwind,
    sqlite,
  ] = tags;

  console.log("Created tags");

  // PROJECTS
  const devlogProject = await prisma.project.create({
    data: {
      name: "DevLog",
      description:
        "A developer learning journal and project tracker. Built with Next.js 15, Prisma, and Tailwind CSS.",
      status: "Building",
      repoUrl: "https://github.com/example/devlog",
      liveUrl: "https://devlog.vercel.app",
      tags: {
        create: [
          { tag: { connect: { id: react.id } } },
          { tag: { connect: { id: nextjs.id } } },
          { tag: { connect: { id: prismaTag.id } } },
          { tag: { connect: { id: tailwind.id } } },
          { tag: { connect: { id: typescript.id } } },
        ],
      },
    },
  });

  const portfolioProject = await prisma.project.create({
    data: {
      name: "Portfolio Website",
      description:
        "Personal portfolio showcasing projects and skills. Fully responsive with dark mode support.",
      status: "Shipped",
      repoUrl: "https://github.com/example/portfolio",
      liveUrl: "https://portfolio.vercel.app",
      tags: {
        create: [
          { tag: { connect: { id: react.id } } },
          { tag: { connect: { id: css.id } } },
          { tag: { connect: { id: tailwind.id } } },
        ],
      },
    },
  });

  const apiProject = await prisma.project.create({
    data: {
      name: "REST API Boilerplate",
      description:
        "A reusable Node.js REST API boilerplate with authentication, validation, and database setup.",
      status: "Paused",
      repoUrl: "https://github.com/example/api-boilerplate",
      tags: {
        create: [
          { tag: { connect: { id: nodejs.id } } },
          { tag: { connect: { id: typescript.id } } },
          { tag: { connect: { id: sqlite.id } } },
        ],
      },
    },
  });

  const dsaProject = await prisma.project.create({
    data: {
      name: "DSA Practice Tracker",
      description:
        "Tracking my progress through data structures and algorithms problems. LeetCode grind.",
      status: "Idea",
      tags: {
        create: [
          { tag: { connect: { id: dsa.id } } },
          { tag: { connect: { id: typescript.id } } },
        ],
      },
    },
  });

  console.log("Created projects");

  // ENTRIES
  const entry1 = await prisma.entry.create({
    data: {
      title: "Learned about Prisma relations",
      date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000), // today
      body: `## Prisma Relations\n\nToday I learned how Prisma handles many-to-many relations using explicit junction tables.\n\n### Key Takeaways\n- You can use implicit or explicit many-to-many\n- Explicit gives you more control over the junction table\n- \`onDelete: Cascade\` automatically cleans up related records\n\n### Example\n\`\`\`typescript\nconst entry = await prisma.entry.findUnique({\n  where: { id },\n  include: { tags: { include: { tag: true } } }\n})\n\`\`\``,
      tags: {
        create: [
          { tag: { connect: { id: prismaTag.id } } },
          { tag: { connect: { id: typescript.id } } },
        ],
      },
      projects: {
        create: [{ project: { connect: { id: devlogProject.id } } }],
      },
    },
  });

  const entry2 = await prisma.entry.create({
    data: {
      title: "Next.js 15 App Router deep dive",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
      body: `## App Router in Next.js 15\n\nSpent today understanding the difference between Server and Client components.\n\n### Server Components\n- Run only on the server\n- Can directly access database\n- Cannot use hooks or browser APIs\n\n### Client Components\n- Run in the browser\n- Can use useState, useEffect\n- Need "use client" directive at top\n\n### When to use which\nDefault to Server Components. Only add "use client" when you need interactivity.`,
      tags: {
        create: [
          { tag: { connect: { id: nextjs.id } } },
          { tag: { connect: { id: react.id } } },
        ],
      },
      projects: {
        create: [{ project: { connect: { id: devlogProject.id } } }],
      },
    },
  });

  const entry3 = await prisma.entry.create({
    data: {
      title: "TypeScript strict mode gotchas",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      body: `## TypeScript Strict Mode\n\nEnabled strict mode today and had to fix a bunch of type errors.\n\n### Common Issues\n- \`noUncheckedIndexedAccess\` means array[0] can be undefined\n- Cannot use implicit any\n- Must handle null and undefined explicitly\n\n### Tip\nDefine all your interfaces upfront in a types/index.ts file before writing any logic.`,
      tags: {
        create: [
          { tag: { connect: { id: typescript.id } } },
          { tag: { connect: { id: nextjs.id } } },
        ],
      },
    },
  });

  const entry4 = await prisma.entry.create({
    data: {
      title: "Tailwind CSS responsive design patterns",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      body: `## Responsive Design with Tailwind\n\nPracticed mobile-first responsive design patterns today.\n\n### Breakpoints\n- sm: 640px\n- md: 768px\n- lg: 1024px\n- xl: 1280px\n\n### Key Pattern\nAlways start with mobile layout, then add breakpoint prefixes for larger screens.\n\n\`\`\`html\n<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">\n\`\`\``,
      tags: {
        create: [
          { tag: { connect: { id: tailwind.id } } },
          { tag: { connect: { id: css.id } } },
        ],
      },
      projects: {
        create: [{ project: { connect: { id: portfolioProject.id } } }],
      },
    },
  });

  const entry5 = await prisma.entry.create({
    data: {
      title: "Binary search tree implementation",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      body: `## Binary Search Tree\n\nImplemented a BST from scratch in TypeScript today.\n\n### Operations\n- Insert: O(log n) average\n- Search: O(log n) average\n- Delete: O(log n) average\n\n### Key Insight\nThe left child is always smaller, right child always larger. This property makes search efficient.`,
      tags: {
        create: [
          { tag: { connect: { id: dsa.id } } },
          { tag: { connect: { id: typescript.id } } },
        ],
      },
      projects: {
        create: [{ project: { connect: { id: dsaProject.id } } }],
      },
    },
  });

  const entry6 = await prisma.entry.create({
    data: {
      title: "Zod validation patterns",
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      body: `## Zod Runtime Validation\n\nLearned how to use Zod for both API validation and form validation with react-hook-form.\n\n### Key Patterns\n- Use z.infer to generate TypeScript types from schemas\n- .partial() makes all fields optional for PATCH requests\n- .extend() adds fields to existing schemas\n- Pair with @hookform/resolvers/zod for forms`,
      tags: {
        create: [
          { tag: { connect: { id: typescript.id } } },
          { tag: { connect: { id: react.id } } },
        ],
      },
    },
  });

  const entry7 = await prisma.entry.create({
    data: {
      title: "System design — designing a URL shortener",
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      body: `## URL Shortener System Design\n\nPracticed system design by designing a URL shortener like bit.ly.\n\n### Components\n- API Gateway\n- URL shortening service\n- Redirect service\n- Database (NoSQL for scale)\n- Cache layer (Redis)\n\n### Key Decision\nUse base62 encoding for short codes. 6 characters gives 56 billion combinations.`,
      tags: {
        create: [
          { tag: { connect: { id: systemDesign.id } } },
          { tag: { connect: { id: nodejs.id } } },
        ],
      },
    },
  });

  const entry8 = await prisma.entry.create({
    data: {
      title: "React Query for server state management",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      body: `## React Query Deep Dive\n\nReplaced all useEffect data fetching with React Query today.\n\n### Why React Query\n- Automatic caching and refetching\n- Loading and error states out of the box\n- No manual useEffect cleanup\n- Optimistic updates for mutations\n\n### Basic Pattern\n\`\`\`typescript\nconst { data, isLoading } = useQuery({\n  queryKey: ['entries'],\n  queryFn: () => axios.get('/api/entries')\n})\n\`\`\``,
      tags: {
        create: [
          { tag: { connect: { id: react.id } } },
          { tag: { connect: { id: typescript.id } } },
        ],
      },
      projects: {
        create: [{ project: { connect: { id: devlogProject.id } } }],
      },
    },
  });

  console.log("Created entries");

  // RESOURCES
  await prisma.resource.create({
    data: {
      url: "https://www.prisma.io/docs/concepts/components/prisma-schema/relations",
      title: "Prisma Relations Documentation",
      category: "Docs",
      notes: "Official docs on how to model relations in Prisma schema",
      isRead: true,
      isFavourite: true,
      entryId: entry1.id,
      tags: {
        create: [
          { tag: { connect: { id: prismaTag.id } } },
          { tag: { connect: { id: typescript.id } } },
        ],
      },
    },
  });

  await prisma.resource.create({
    data: {
      url: "https://nextjs.org/docs/app/building-your-application/rendering/server-components",
      title: "Next.js Server Components Guide",
      category: "Docs",
      notes: "Essential reading for understanding the App Router mental model",
      isRead: true,
      isFavourite: true,
      entryId: entry2.id,
      tags: {
        create: [
          { tag: { connect: { id: nextjs.id } } },
          { tag: { connect: { id: react.id } } },
        ],
      },
    },
  });

  await prisma.resource.create({
    data: {
      url: "https://ui.shadcn.com/docs",
      title: "shadcn/ui Component Library",
      category: "Docs",
      notes: "Reference for all shadcn components used in this project",
      isRead: false,
      isFavourite: true,
      projectId: devlogProject.id,
      tags: {
        create: [
          { tag: { connect: { id: react.id } } },
          { tag: { connect: { id: tailwind.id } } },
        ],
      },
    },
  });

  await prisma.resource.create({
    data: {
      url: "https://www.youtube.com/watch?v=dsa-crash-course",
      title: "DSA Crash Course — Full Playlist",
      category: "Video",
      notes: "Going through this playlist for DSA prep",
      isRead: false,
      isFavourite: false,
      projectId: dsaProject.id,
      tags: {
        create: [{ tag: { connect: { id: dsa.id } } }],
      },
    },
  });

  await prisma.resource.create({
    data: {
      url: "https://tanstack.com/query/latest/docs/framework/react/overview",
      title: "TanStack Query Documentation",
      category: "Docs",
      notes: "React Query v5 docs — API changed significantly from v4",
      isRead: true,
      isFavourite: false,
      entryId: entry8.id,
      tags: {
        create: [
          { tag: { connect: { id: react.id } } },
          { tag: { connect: { id: typescript.id } } },
        ],
      },
    },
  });

  await prisma.resource.create({
    data: {
      url: "https://frontendmasters.com/courses/system-design",
      title: "System Design Course — Frontend Masters",
      category: "Course",
      notes: "Paid course, very detailed on distributed systems",
      isRead: false,
      isFavourite: true,
      tags: {
        create: [{ tag: { connect: { id: systemDesign.id } } }],
      },
    },
  });

  await prisma.resource.create({
    data: {
      url: "https://zod.dev",
      title: "Zod Official Documentation",
      category: "Docs",
      notes: "All Zod validators and patterns in one place",
      isRead: true,
      isFavourite: false,
      tags: {
        create: [{ tag: { connect: { id: typescript.id } } }],
      },
    },
  });

  console.log("Created resources");
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });