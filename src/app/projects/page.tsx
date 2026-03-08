"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Project } from "@/types";
import { cn } from "@/lib/utils";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectForm from "@/components/projects/ProjectForm";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderKanban, Plus } from "lucide-react";
import { toast } from "sonner";

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // ============================================
  // FETCH PROJECTS
  // ============================================
  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await axios.get<{ data: Project[] }>("/api/projects");
      return res.data.data;
    },
  });

  // ============================================
  // DELETE MUTATION
  // ============================================
  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Project deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete project");
    },
  });

  // ============================================
  // HANDLERS
  // ============================================
  function handleEdit(project: Project) {
    setEditingProject(project);
    setIsModalOpen(true);
  }

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(id);
    }
  }

  function handleModalClose() {
    setIsModalOpen(false);
    setEditingProject(null);
  }

  function handleCreateNew() {
    setEditingProject(null);
    setIsModalOpen(true);
  }

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-border/40">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2 font-mono">
            Development / Section 02
          </p>
          <h1 className="text-4xl md:text-5xl font-black italic text-foreground" style={{ fontFamily: "Georgia, serif" }}>
            Projects
          </h1>
        </div>
        <Button 
          onClick={handleCreateNew} 
          className="flex items-center gap-2 bg-foreground text-background hover:opacity-90 font-bold tracking-tight px-6 py-5 h-auto rounded-none"
        >
          <Plus className="h-4 w-4" />
          NEW PROJECT
        </Button>
      </div>

      {/* Status filter pills */}
      {data && data.length > 0 && (
        <StatusFilter
          projects={data}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Empty state handled separately if needed */}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingProject ? "Edit Project" : "New Project"}
        description={
          editingProject
            ? "Update your project details"
            : "Add a new project to track"
        }
      >
        <ProjectForm
          project={editingProject ?? undefined}
          onSuccess={handleModalClose}
        />
      </Modal>

    </div>
  );
}

// ============================================
// STATUS FILTER COMPONENT
// ============================================
function StatusFilter({
  projects,
  onEdit,
  onDelete,
}: {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}) {
  const [activeStatus, setActiveStatus] = useState<string>("All");

  const statuses = ["All", "Idea", "Building", "Shipped", "Paused"];

  const filtered =
    activeStatus === "All"
      ? projects
      : projects.filter((p) => p.status === activeStatus);

  return (
    <div className="space-y-6">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-x-6 gap-y-4">
        {statuses.map((status) => {
          const count =
            status === "All"
              ? projects.length
              : projects.filter((p) => p.status === status).length;

          if (count === 0 && status !== "All") return null;

          return (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={cn(
                "group flex items-center gap-3 transition-all",
                "font-mono uppercase tracking-[0.2em] text-[10px] font-bold",
                activeStatus === status ? "text-foreground" : "text-muted-foreground/40 hover:text-foreground"
              )}
            >
              <div 
                className={cn(
                  "w-2 h-2 rounded-none transition-transform group-hover:scale-125",
                  activeStatus === status ? "bg-[#a78bfa]" : "bg-muted-foreground/20"
                )} 
              />
              {status}
              <span className="text-[8px] opacity-40">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Filtered grid */}
      <ProjectGrid
        projects={filtered}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}


// ============================================
// PROJECT GRID COMPONENT
// ============================================
function ProjectGrid({
  projects,
  onEdit,
  onDelete,
}: {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}