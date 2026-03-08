"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Project } from "@/types";
import ProjectDetail from "@/components/projects/ProjectDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/ui/breadcrumb";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await axios.get<{ data: Project }>(`/api/projects/${id}`);
      return res.data.data;
    },
  });

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-32 w-full" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-muted-foreground">Project not found</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push("/projects")}
        >
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumb
        items={[
          { label: "Projects", href: "/projects" },
          { label: project.name },
        ]}
      />
      <ProjectDetail project={project} />
    </div>
  );
}