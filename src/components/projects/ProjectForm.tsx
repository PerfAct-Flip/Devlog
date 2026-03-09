"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { CreateProjectSchema, CreateProjectInput } from "@/lib/validations";
import { Project, Entry, Resource } from "@/types";
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

const EntryForm = dynamic(() => import("@/components/entries/EntryForm"), {
  loading: () => <Loader2 className="h-4 w-4 animate-spin mx-auto" />,
});
const ResourceForm = dynamic(() => import("@/components/resources/ResourceForm"), {
  loading: () => <Loader2 className="h-4 w-4 animate-spin mx-auto" />,
});

interface ProjectFormProps {
  project?: Project;
  onSuccess: (data?: Project) => void;
}

const STATUS_OPTIONS = ["Idea", "Building", "Shipped", "Paused"] as const;

export default function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!project;

  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);

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
      entryIds: project?.entries?.map((e) => e.id) ?? [],
      resourceIds: project?.resources?.map((r) => r.id) ?? [],
    },
  });

  const tags = watch("tags");
  const selectedEntryIds = watch("entryIds") || [];
  const selectedResourceIds = watch("resourceIds") || [];

  // Fetch entries and resources
  const { data: entries = [] } = useQuery<Entry[]>({
    queryKey: ["entries"],
    queryFn: () => axios.get("/api/entries").then((res) => res.data.data),
  });

  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ["resources"],
    queryFn: () => axios.get("/api/resources").then((res) => res.data.data),
  });

  // CREATE mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateProjectInput) =>
      axios.post("/api/projects", data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Project created successfully");
      onSuccess(res.data.data);
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
    <>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Entries */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
                Linked Log Entries
            </label>
            <button 
              type="button"
              onClick={() => setIsEntryModalOpen(true)}
              className="text-[10px] font-bold uppercase tracking-widest text-[#a78bfa] hover:opacity-70 transition-all font-mono flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> New Entry
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 min-h-[48px] w-full border border-border/40 bg-accent/[0.03] px-4 py-2">
            {selectedEntryIds.map((id) => {
              const entry = entries.find((e) => e.id === id);
              return (
                <Badge key={id} variant="outline" className="rounded-none border-border/40 bg-accent/10 px-2 py-1 flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider">{entry?.title || "Loading..."}</span>
                  <button 
                    type="button" 
                    onClick={() => setValue("entryIds", selectedEntryIds.filter(eId => eId !== id))}
                    className="hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
            <select 
              className="bg-transparent text-[10px] font-mono uppercase tracking-widest outline-none text-muted-foreground/60 max-w-[150px]"
              onChange={(e) => {
                const val = e.target.value;
                if (val && !selectedEntryIds.includes(val)) {
                  setValue("entryIds", [...selectedEntryIds, val]);
                }
                e.target.value = "";
              }}
              value=""
            >
              <option value="" disabled className="bg-background text-foreground">+ Attach Entry</option>
              {entries.filter(e => !selectedEntryIds.includes(e.id)).map(e => (
                <option key={e.id} value={e.id} className="bg-background text-foreground">{e.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resources */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
                Linked Resources
            </label>
            <button 
              type="button"
              onClick={() => setIsResourceModalOpen(true)}
              className="text-[10px] font-bold uppercase tracking-widest text-[#a78bfa] hover:opacity-70 transition-all font-mono flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> New Resource
            </button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[48px] w-full border border-border/40 bg-accent/[0.03] px-4 py-2">
            {selectedResourceIds.map((id) => {
              const resource = resources.find((r) => r.id === id);
              return (
                <Badge key={id} variant="outline" className="rounded-none border-border/40 bg-accent/10 px-2 py-1 flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider">{resource?.title || "Loading..."}</span>
                  <button 
                    type="button" 
                    onClick={() => setValue("resourceIds", selectedResourceIds.filter(rId => rId !== id))}
                    className="hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
            <select 
              className="bg-transparent text-[10px] font-mono uppercase tracking-widest outline-none text-muted-foreground/60 max-w-[150px]"
              onChange={(e) => {
                const val = e.target.value;
                if (val && !selectedResourceIds.includes(val)) {
                  setValue("resourceIds", [...selectedResourceIds, val]);
                }
                e.target.value = "";
              }}
              value=""
            >
              <option value="" disabled className="bg-background text-foreground">+ Attach Resource</option>
              {resources.filter(r => !selectedResourceIds.includes(r.id)).map(r => (
                <option key={r.id} value={r.id} className="bg-background text-foreground">{r.title}</option>
              ))}
            </select>
          </div>
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

      {/* Modals for creation on the fly */}
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
              setValue("entryIds", [...selectedEntryIds, entry.id]);
            }
          }} 
        />
      </Modal>

      <Modal 
        isOpen={isResourceModalOpen} 
        onClose={() => setIsResourceModalOpen(false)}
        title="Create New Resource"
        description="Save a link or reference for later"
      >
        <ResourceForm 
          onSuccess={(resource) => {
            setIsResourceModalOpen(false);
            if (resource) {
              setValue("resourceIds", [...selectedResourceIds, resource.id]);
            }
          }} 
        />
      </Modal>
    </>
  );
}