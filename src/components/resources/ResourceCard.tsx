"use client";

import { Resource } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Trash2,
  ExternalLink,
  Star,
  CheckCircle,
  Circle,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface ResourceCardProps {
  resource: Resource;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  Article: "bg-blue-100 text-blue-800 border-blue-200",
  Video: "bg-red-100 text-red-800 border-red-200",
  Docs: "bg-purple-100 text-purple-800 border-purple-200",
  Course: "bg-orange-100 text-orange-800 border-orange-200",
  Other: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function ResourceCard({
  resource,
  onEdit,
  onDelete,
}: ResourceCardProps) {
  const queryClient = useQueryClient();

  // ============================================
  // TOGGLE MUTATION
  // ============================================
  const toggleMutation = useMutation({
    mutationFn: (data: { isRead?: boolean; isFavourite?: boolean }) =>
      axios.patch(`/api/resources/${resource.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: () => {
      toast.error("Failed to update resource");
    },
  });

  function handleToggleRead(e: React.MouseEvent) {
    e.stopPropagation();
    toggleMutation.mutate({ isRead: !resource.isRead });
  }

  function handleToggleFavourite(e: React.MouseEvent) {
    e.stopPropagation();
    toggleMutation.mutate({ isFavourite: !resource.isFavourite });
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    onEdit(resource);
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    onDelete(resource.id);
  }

  return (
    <div
      className={cn(
        "group relative bg-accent/[0.03] border border-border/40 rounded-none p-6 flex flex-col gap-6 h-full transition-all duration-300 overflow-hidden",
        "hover:border-border/80 hover:bg-accent/[0.06]",
        resource.isRead && "opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
      )}
    >
      {/* Category marker and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-none bg-[#fb923c] shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#fb923c] font-mono">
            {resource.category.toUpperCase()}
          </span>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={handleToggleFavourite}
            className={cn(
              "p-1.5 rounded-none transition-all",
              resource.isFavourite ? "bg-[#fb923c] text-black" : "bg-accent/10 hover:bg-foreground hover:text-background"
            )}
            aria-label="Toggle favourite"
          >
            <Star className={cn("h-3 w-3", resource.isFavourite && "fill-current")} />
          </button>
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-none bg-accent/10 hover:bg-foreground hover:text-background transition-all"
            aria-label="Edit resource"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-none bg-accent/10 hover:bg-red-500 hover:text-white transition-all"
            aria-label="Delete resource"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-4">
        <h3 className="font-bold text-xl group-hover:text-[#fb923c] transition-colors leading-tight text-foreground line-clamp-2 break-words">
          {resource.title}
        </h3>
        
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all font-mono break-words"
        >
          <ExternalLink className="h-3 w-3" />
          Visit Source
        </a>
      </div>

      {/* Notes */}
      {resource.notes && (
        <p className="text-xs text-muted-foreground/60 leading-relaxed font-mono line-clamp-3 break-words">
          {resource.notes}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
        <button
          onClick={handleToggleRead}
          className={cn(
            "text-[9px] uppercase font-bold tracking-[0.2em] font-mono transition-colors",
            resource.isRead ? "text-emerald-500" : "text-muted-foreground/40 hover:text-foreground"
          )}
        >
          {resource.isRead ? "READ COMPLETE" : "MARK AS READ"}
        </button>

        <div className="flex gap-1.5">
          {resource.tags.slice(0, 2).map((tag) => (
            <span key={tag.id} className="text-[8px] uppercase tracking-wider text-muted-foreground/30 font-mono">
              #{tag.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}