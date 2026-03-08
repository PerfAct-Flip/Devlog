"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { CreateProjectSchema, CreateProjectInput } from "@/lib/validations";
import { Project } from "@/types";
import TagInput from "@/components/ui/TagInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ProjectFormProps {
  project?: Project;
  onSuccess: () => void;
}

const STATUS_OPTIONS = ["Idea", "Building", "Shipped", "Paused"] as const;

export default function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!project;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      status: project?.status ?? "Idea",
      liveUrl: project?.liveUrl ?? "",
      repoUrl: project?.repoUrl ?? "",
      tags: project?.tags.map((t) => t.name) ?? [],
    },
  });

  const tags = watch("tags");

  // CREATE mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateProjectInput) =>
      axios.post("/api/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Project created successfully");
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to create project");
    },
  });

  // UPDATE mutation
  const updateMutation = useMutation({
    mutationFn: (data: CreateProjectInput) =>
      axios.put(`/api/projects/${project?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", project?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Project updated successfully");
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to update project");
    },
  });

  function onSubmit(data: CreateProjectInput) {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* Name */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
            Project Name
        </label>
        <Input
          id="name"
          placeholder="System Identifier"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-[10px] text-red-500 font-mono mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Status */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
              Status / Phase
          </label>
          <select
            id="status"
            {...register("status")}
            className="flex h-12 w-full rounded-none border border-border/40 bg-accent/[0.03] px-4 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-border/80 appearance-none"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status} className="bg-background text-foreground">
                {status.toUpperCase()}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="text-[10px] text-red-500 font-mono mt-1">{errors.status.message}</p>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
                Tech Stack / Architecture
            </label>
            <TagInput
            value={tags}
            onChange={(newTags) => setValue("tags", newTags)}
            placeholder="Add tech stack..."
            />
            {errors.tags && (
            <p className="text-[10px] text-red-500 font-mono mt-1">{errors.tags.message}</p>
            )}
        </div>
      </div>

      {/* URLs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
                Deployment URL
            </label>
            <Input
            id="liveUrl"
            placeholder="https://..."
            {...register("liveUrl")}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
                Source Repository
            </label>
            <Input
            id="repoUrl"
            placeholder="git@github.com:..."
            {...register("repoUrl")}
            />
          </div>
      </div>

      {/* Description */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
            Analysis / Scope
        </label>
        <Textarea
          id="description"
          placeholder="Detailed description..."
          {...register("description")}
        />
        {errors.description && (
          <p className="text-[10px] text-red-500 font-mono mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <button 
            type="submit" 
            disabled={isPending}
            className="px-10 py-4 bg-foreground text-background font-black text-[12px] tracking-[0.2em] uppercase hover:opacity-90 transition-all font-mono rounded-none disabled:opacity-50"
        >
          {isPending ? "PROCESSING..." : (isEditing ? "SAVE CHANGES" : "CREATE PROJECT")}
        </button>
      </div>

    </form>
  );
}