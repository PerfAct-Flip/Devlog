"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { CreateEntrySchema, CreateEntryInput } from "@/lib/validations";
import { Entry, Project, Resource } from "@/types";
import TagInput from "@/components/ui/TagInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import dynamic from "next/dynamic";

const ProjectForm = dynamic(() => import("@/components/projects/ProjectForm"), {
  loading: () => <Loader2 className="h-4 w-4 animate-spin mx-auto" />,
});
const ResourceForm = dynamic(() => import("@/components/resources/ResourceForm"), {
  loading: () => <Loader2 className="h-4 w-4 animate-spin mx-auto" />,
});
import { Badge } from "@/components/ui/badge";

interface EntryFormProps {
  entry?: Entry;
  onSuccess: (data?: Entry) => void;
}

export default function EntryForm({ entry, onSuccess }: EntryFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!entry;

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEntryInput>({
    resolver: zodResolver(CreateEntrySchema),
    defaultValues: {
      title: entry?.title ?? "",
      date: entry?.date
        ? new Date(entry.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      body: entry?.body ?? "",
      tags: entry?.tags.map((t) => t.name) ?? [],
      projectIds: entry?.projects?.map((p) => p.id) ?? [],
      resourceIds: entry?.resources?.map((r) => r.id) ?? [],
    },
  });

  const tags = watch("tags");
  const selectedProjectIds = watch("projectIds") || [];
  const selectedResourceIds = watch("resourceIds") || [];

  // Fetch projects and resources
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => axios.get("/api/projects").then((res) => res.data.data),
  });

  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ["resources"],
    queryFn: () => axios.get("/api/resources").then((res) => res.data.data),
  });

  // CREATE mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateEntryInput) =>
      axios.post("/api/entries", data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Entry created successfully");
      onSuccess(res.data.data);
    },
    onError: () => {
      toast.error("Failed to create entry");
    },
  });

  // UPDATE mutation
  const updateMutation = useMutation({
    mutationFn: (data: CreateEntryInput) =>
      axios.put(`/api/entries/${entry?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["entry", entry?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Entry updated successfully");
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to update entry");
    },
  });

  function onSubmit(data: CreateEntryInput) {
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

        {/* Title */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
              Entry Title
          </label>
          <Input
            id="title"
            placeholder="What did you learn today?"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-[10px] text-red-500 font-mono mt-1">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Date */}
          <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
                  Log Date
              </label>
              <Input
              id="date"
              type="date"
              className="appearance-none"
              {...register("date")}
              />
              {errors.date && (
              <p className="text-[10px] text-red-500 font-mono mt-1">{errors.date.message}</p>
              )}
          </div>

          {/* Tags */}
          <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
                  Taxonomy / Tags
              </label>
              <TagInput
              value={tags}
              onChange={(newTags) => setValue("tags", newTags)}
              placeholder="Add tags... (ENTER)"
              />
              {errors.tags && (
              <p className="text-[10px] text-red-500 font-mono mt-1">{errors.tags.message}</p>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Projects */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
                  Linked Projects
              </label>
              <button 
                type="button"
                onClick={() => setIsProjectModalOpen(true)}
                className="text-[10px] font-bold uppercase tracking-widest text-[#a78bfa] hover:opacity-70 transition-all font-mono flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> New Project
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-[48px] w-full border border-border/40 bg-accent/[0.03] px-4 py-2">
              {selectedProjectIds.map((id) => {
                const project = projects.find((p) => p.id === id);
                return (
                  <Badge key={id} variant="outline" className="rounded-none border-border/40 bg-accent/10 px-2 py-1 flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider">{project?.name || "Loading..."}</span>
                    <button 
                      type="button" 
                      onClick={() => setValue("projectIds", selectedProjectIds.filter(pId => pId !== id))}
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
                  if (val && !selectedProjectIds.includes(val)) {
                    setValue("projectIds", [...selectedProjectIds, val]);
                  }
                  e.target.value = "";
                }}
                value=""
              >
                <option value="" disabled className="bg-background text-foreground">+ Attach Project</option>
                {projects.filter(p => !selectedProjectIds.includes(p.id)).map(p => (
                  <option key={p.id} value={p.id} className="bg-background text-foreground">{p.name}</option>
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

        {/* Body */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
              Notes / Content
          </label>
          <Textarea
            id="body"
            placeholder="Markdown supported..."
            {...register("body")}
          />
          {errors.body && (
            <p className="text-[10px] text-red-500 font-mono mt-1">{errors.body.message}</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button 
              type="submit" 
              disabled={isPending}
              className="px-10 py-4 bg-foreground text-background font-black text-[12px] tracking-[0.2em] uppercase hover:opacity-90 transition-all font-mono rounded-none disabled:opacity-50"
          >
            {isPending ? "PROCESSING..." : (isEditing ? "SAVE CHANGES" : "CREATE ENTRY")}
          </button>
        </div>

      </form>

      {/* Modals for creation on the fly - MOVED OUTSIDE FORM */}
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
              setValue("projectIds", [...selectedProjectIds, project.id]);
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