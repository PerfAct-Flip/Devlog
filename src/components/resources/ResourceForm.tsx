"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { CreateResourceSchema, CreateResourceInput } from "@/lib/validations";
import { Resource, Project, Entry } from "@/types";
import TagInput from "@/components/ui/TagInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";

const ProjectForm = dynamic(() => import("@/components/projects/ProjectForm"), {
  loading: () => <Loader2 className="h-4 w-4 animate-spin mx-auto" />,
});
const EntryForm = dynamic(() => import("@/components/entries/EntryForm"), {
  loading: () => <Loader2 className="h-4 w-4 animate-spin mx-auto" />,
});

interface ResourceFormProps {
  resource?: Resource;
  onSuccess: (data?: Resource) => void;
}

const CATEGORY_OPTIONS = [
  "Article",
  "Video",
  "Docs",
  "Course",
  "Other",
] as const;

export default function ResourceForm({
  resource,
  onSuccess,
}: ResourceFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!resource;

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateResourceInput>({
    resolver: zodResolver(CreateResourceSchema),
    defaultValues: {
      url: resource?.url ?? "",
      title: resource?.title ?? "",
      category: resource?.category ?? "Article",
      notes: resource?.notes ?? "",
      tags: resource?.tags.map((t) => t.name) ?? [],
      entryId: resource?.entryId ?? "",
      projectId: resource?.projectId ?? "",
    },
  });

  const tags = watch("tags");
  const selectedProjectId = watch("projectId");
  const selectedEntryId = watch("entryId");

  // Fetch projects and entries
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => axios.get("/api/projects").then((res) => res.data.data),
  });

  const { data: entries = [] } = useQuery<Entry[]>({
    queryKey: ["entries"],
    queryFn: () => axios.get("/api/entries").then((res) => res.data.data),
  });

  // CREATE mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateResourceInput) =>
      axios.post("/api/resources", data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Resource saved successfully");
      onSuccess(res.data.data);
    },
    onError: () => {
      toast.error("Failed to save resource");
    },
  });

  // UPDATE mutation
  const updateMutation = useMutation({
    mutationFn: (data: CreateResourceInput) =>
      axios.put(`/api/resources/${resource?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Resource updated successfully");
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to update resource");
    },
  });

  function onSubmit(data: CreateResourceInput) {
    // convert empty strings to undefined for optional fields
    const cleaned = {
      ...data,
      notes: data.notes || undefined,
      entryId: data.entryId || undefined,
      projectId: data.projectId || undefined,
    };

    if (isEditing) {
      updateMutation.mutate(cleaned);
    } else {
      createMutation.mutate(cleaned);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* URL */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
            Resource / URL
        </label>
        <Input
          id="url"
          placeholder="https://..."
          {...register("url")}
        />
        {errors.url && (
          <p className="text-[10px] text-red-500 font-mono mt-1">{errors.url.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Title */}
        <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
                Descriptive Title
            </label>
            <Input
            id="title"
            placeholder="Label"
            {...register("title")}
            />
            {errors.title && (
            <p className="text-[10px] text-red-500 font-mono mt-1">{errors.title.message}</p>
            )}
        </div>

        {/* Category */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
              Classification
          </label>
          <select
            id="category"
            {...register("category")}
            className="flex h-12 w-full rounded-none border border-border/40 bg-accent/[0.03] px-4 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-border/80 appearance-none"
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat} className="bg-background text-foreground">
                {cat.toUpperCase()}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-[10px] text-red-500 font-mono mt-1">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Project Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
                Related Project
            </label>
            <button 
              type="button"
              onClick={() => setIsProjectModalOpen(true)}
              className="text-[10px] font-bold uppercase tracking-widest text-[#a78bfa] hover:opacity-70 transition-all font-mono flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> New Project
            </button>
          </div>
          <select 
            className="flex h-12 w-full rounded-none border border-border/40 bg-accent/[0.03] px-4 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-border/80 appearance-none"
            {...register("projectId")}
          >
            <option value="" className="bg-background text-foreground">No Project</option>
            {projects.map(p => (
              <option key={p.id} value={p.id} className="bg-background text-foreground">{p.name.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Entry Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
                Related Log Entry
            </label>
            <button 
              type="button"
              onClick={() => setIsEntryModalOpen(true)}
              className="text-[10px] font-bold uppercase tracking-widest text-[#a78bfa] hover:opacity-70 transition-all font-mono flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> New Entry
            </button>
          </div>
          <select 
            className="flex h-12 w-full rounded-none border border-border/40 bg-accent/[0.03] px-4 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-border/80 appearance-none"
            {...register("entryId")}
          >
            <option value="" className="bg-background text-foreground">No Entry</option>
            {entries.map(e => (
              <option key={e.id} value={e.id} className="bg-background text-foreground">{e.title.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
            Contextual / Notes
        </label>
        <Textarea
          id="notes"
          placeholder="What makes this valuable?"
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-[10px] text-red-500 font-mono mt-1">{errors.notes.message}</p>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
            Metadata / Tags
        </label>
        <TagInput
          value={tags}
          onChange={(newTags) => setValue("tags", newTags)}
          placeholder="Add tags..."
        />
        {errors.tags && (
          <p className="text-[10px] text-red-500 font-mono mt-1">{errors.tags.message}</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <button 
            type="submit" 
            disabled={isPending}
            className="px-10 py-4 bg-foreground text-background font-black text-[12px] tracking-[0.2em] uppercase hover:opacity-90 transition-all font-mono rounded-none disabled:opacity-50"
        >
          {isPending ? "PROCESSING..." : (isEditing ? "SAVE CHANGES" : "SAVE RESOURCE")}
        </button>
      </div>

      </form>

      {/* Modals for creation on the fly */}
      <Modal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)}
        title="Create New Project"
        description="Add a new project to track your goals"
      >
        <ProjectForm 
          onSuccess={(project) => {
            setIsProjectModalOpen(false);
            if (project) {
              setValue("projectId", project.id);
            }
          }} 
        />
      </Modal>

      <Modal 
        isOpen={isEntryModalOpen} 
        onClose={() => setIsEntryModalOpen(false)}
        title="New Log Entry"
        description="Write about what you're doing"
      >
        <EntryForm 
          onSuccess={(entry) => {
            setIsEntryModalOpen(false);
            if (entry) {
              setValue("entryId", entry.id);
            }
          }} 
        />
      </Modal>
    </>
  );
}