"use client";

import { Project } from "@/types";
import { truncate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, ExternalLink, Github, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const router = useRouter();

  function handleCardClick() {
    router.push(`/projects/${project.id}`);
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    onEdit(project);
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    onDelete(project.id);
  }

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative bg-accent/[0.03] border border-border/40 rounded-none p-6 cursor-pointer flex flex-col gap-6 h-full overflow-hidden",
        "hover:border-border/80 hover:bg-accent/[0.06] transition-all duration-300"
      )}
    >
      {/* Header — name and status */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-none bg-[#a78bfa]" />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#a78bfa] font-mono">
              {project.status.toUpperCase()}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={handleEdit}
              className="p-1.5 rounded-none bg-accent/10 hover:bg-foreground hover:text-background transition-all"
              aria-label="Edit project"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-none bg-accent/10 hover:bg-red-500 hover:text-white transition-all"
              aria-label="Delete project"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        <h3 className="font-bold text-xl sm:pr-12 group-hover:text-[#a78bfa] transition-colors leading-tight text-foreground break-words">
          {project.name}
        </h3>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground/60 leading-relaxed font-mono line-clamp-2 break-words">
        {project.description}
      </p>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-[9px] uppercase tracking-[0.1em] font-bold text-muted-foreground bg-accent/10 px-2 py-1 border border-border/20 rounded-none"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer — links and entry count */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
        {/* External links */}
        <div className="flex items-center gap-4">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              Live
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              Repo
            </a>
          )}
        </div>

        {/* Entry count badge */}
        <div className="text-[10px] font-bold text-foreground font-mono">
          {project.entries?.length ?? 0} LOGS
        </div>
      </div>
    </div>
  );
}