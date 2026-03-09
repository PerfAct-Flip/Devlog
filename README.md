# 🌌 DevLog — The Premium Developer Learning Journal

**DevLog** is a high-fidelity personal learning journal and project tracker designed for the modern developer. It follows the **"Riven" aesthetic** — a sharp, industrial design system featuring deep midnight purples, glassmorphism, and interactive canvas-based background systems.

![DevLog Dashboard Preview](https://github.com/user-attachments/assets/ca66b26d-2d5d-402a-9f5b-6f8d3d959542)

---

## 🛠️ Tech Stack & Implementation Choices

This project leverages a cutting-edge frontend stack with a robust, type-safe backend architecture.

### Core Architecture
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) with React 19. Chosen for its superior server-side rendering, streaming capabilities, and modern routing patterns.
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with OKLCH color spaces. The entire UI uses a customized design system with zero border-radius for a sharp, "engineering-first" look.
- **Components**: [Radix UI](https://www.radix-ui.com/) and [shadcn/ui](https://ui.shadcn.com/), heavily modified to support the non-rounded glassmorphic aesthetic.
- **Animations**: [Lucide React](https://lucide.dev/), [tw-animate-css](https://www.npmjs.com/package/tw-animate-css), and custom Canvas API for the background dot-grid and particle systems.

### Data & Persistence (The "Why")
- **ORM: Prisma 7**: We chose the latest version of **Prisma** for its industry-leading type safety and modern database handling.
- **Database: PostgreSQL (Neon)**: We migrated from SQLite to **PostgreSQL on Neon.tech**.
    - **Why?** Serverless PostgreSQL provides horizontal scaling and reliable persistence that SQLite lacks in serverless environments like Vercel or Railway.
    - **Architecture**: The app uses the `@prisma/adapter-pg` to handle pooled connections efficiently across API routes, specifically managing complex many-to-many relationships between Entries and Projects.

---

## 🤖 AI Assistance (Antigravity)

This project was developed in collaboration with **Antigravity**.

AI was specifically tasked with:
- Architecture planning — folder structure, API design, component breakdown before writing any code
- Prisma schema design — modeling many-to-many relations between entries, projects, resources and tags
- API route structure — understanding Next.js 15 route handler patterns and Zod validation
- Debugging — Prisma 6 generated client path changes, Zod v4 deprecations, TypeScript strict mode errors
- Deployment — troubleshooting the SQLite to Postgres migration when moving to Vercel + Neon


---

## 💻 Local Setup & Running

Follow these steps to get your own instance of DevLog running locally.

### 1. Prerequisites
- **Node.js 20+**
- A **PostgreSQL** instance (Recommended: A free [Neon.tech](https://neon.tech/) project)

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"
```

### 3. Installation
```bash
npm install
```

### 4. Database Setup
Initialize the database:
```bash
# Generate the Prisma Client
npx prisma generate

# Build the initial schema and migrations
npx prisma migrate dev --name init

# Seed the database with sample projects and entries
npm run db:seed
```

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the journal.

---

## ⚠️ Known Bugs & Limitations

While the core functionality is robust, the following limitations are known:

- **No Authentication**: This is a single-user app by design. The deployed version uses one shared database. All visitors see and can modify the same data. Adding auth (NextAuth or Clerk) would scope data per user but was outside the assignment scope.
- **No Pagination**: All entries, projects, and resources are fetched in a single API request. For large datasets, this would need cursor-based pagination on the API and infinite scroll on the frontend.
- **No Real-time Updates**: If two browser tabs are open and you create an entry in one, the other tab won't update until manually refreshed. React Query's `refetchOnWindowFocus` is intentionally disabled to reduce noise.
- **Markdown only in body**: Entry body supports markdown but there is no rich text editor. Users write raw markdown syntax which renders on the detail page.
- **Neon Cold Starts**: Since the project uses serverless PostgreSQL, the first request after a period of inactivity may experience a 3-5 second delay as the database instance "wakes up."
- **Circular Dependency Mitigation**: Due to the deep interoperability between forms (e.g., `EntryForm` can open `ProjectForm` which can in turn open `EntryForm`), these components are loaded via `next/dynamic` to avoid build-time circularity.

---

## 📜 License
Built with ❤️ for the developer community. Licensed under **MIT**.
