"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Project } from "@/types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";
import ProjectForm from "@/components/projects/ProjectForm";
import StatusBadge from "@/components/projects/StatusBadge";
import ReactMarkdown from "react-markdown";
import {
  Pencil,
  Trash2,
  ExternalLink,
  Github,
  BookOpen,
  Calendar,
  Loader2,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";

interface ProjectDetailProps {
  project: Project;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ============================================
  // DELETE MUTATION
  // ============================================
  const deleteMutation = useMutation({
    mutationFn: () => axios.delete(`/api/projects/${project.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Project deleted");
      router.push("/projects");
    },
    onError: () => {
      toast.error("Failed to delete project");
    },
  });

  function handleDelete() {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate();
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pb-8 border-b border-border/40">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-none bg-[#a78bfa] shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#a78bfa] font-mono">
              {project.status.toUpperCase()}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground italic" style={{ fontFamily: "Georgia, serif" }}>
            {project.name}
          </h1>
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
            <span className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              CREATED / {formatDate(project.createdAt)}
            </span>
            <span className="flex items-center gap-2">
              <BookOpen className="h-3 w-3" />
              {project.entries?.length ?? 0} LOGS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-5 py-2 text-[11px] font-bold tracking-widest uppercase bg-foreground text-background hover:opacity-90 transition-all font-mono"
          >
            EDIT
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-5 py-2 text-[11px] font-bold tracking-widest uppercase bg-accent/10 border border-border/40 text-foreground hover:bg-red-500 hover:border-red-500 hover:text-white transition-all font-mono"
          >
            {deleteMutation.isPending ? "DELETING..." : "DELETE"}
          </button>
        </div>
      </div>

      {/* External links */}
      {(project.liveUrl || project.repoUrl) && (
        <div className="flex gap-8 pb-6">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors font-mono underline underline-offset-4 decoration-border"
            >
              LIVE_DEMO
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors font-mono underline underline-offset-4 decoration-border"
            >
              SOURCE_CODE
            </a>
          )}
        </div>
      )}

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Main content — left 2 columns */}
        <div className="lg:col-span-2 space-y-12">
          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] font-mono">
                Development / Stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span 
                    key={tag.id} 
                    className="text-[9px] uppercase tracking-[0.1em] font-bold text-muted-foreground bg-accent/10 px-3 py-1.5 border border-border/20 font-mono"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] font-mono">
              Description / documentation
            </h2>
            <div className="prose dark:prose-invert prose-sm max-w-none leading-relaxed font-mono text-[13px] text-muted-foreground/90">
              <ReactMarkdown>{project.description}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Sidebar — right 1 column */}
        <div className="space-y-12">
          {/* Linked entries */}
          {project.entries && project.entries.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] font-mono">
                Journal Logs
              </h2>
              <div className="flex flex-col gap-3">
                {project.entries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => router.push(`/log/${entry.id}`)}
                    className="flex flex-col gap-2 p-5 border border-border/40 bg-accent/[0.03] hover:border-border/80 hover:bg-accent/[0.06] transition-all text-left group"
                  >
                    <p className="text-sm font-bold text-foreground group-hover:text-[#a78bfa] transition-colors">{entry.title}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                      {formatDate(entry.date)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Linked resources */}
          {project.resources && project.resources.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] font-mono">
                Project Resources
              </h2>
              <div className="flex flex-col gap-3">
                {project.resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 border border-border/40 bg-accent/[0.03] hover:border-border/80 hover:bg-accent/[0.06] transition-all group"
                  >
                    <div className="flex flex-col gap-1 min-w-0 flex-1 mr-4">
                      <p className="text-sm font-bold text-foreground group-hover:text-[#fb923c] transition-colors truncate">{resource.title}</p>
                      <p className="text-[10px] tracking-widest text-muted-foreground font-mono truncate uppercase">
                        {resource.category}
                      </p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project"
        description="Update your project details"
      >
        <ProjectForm
          project={project}
          onSuccess={() => {
            setIsEditModalOpen(false);
            queryClient.invalidateQueries({
              queryKey: ["project", project.id],
            });
          }}
        />
      </Modal>
    </div>
  );
}