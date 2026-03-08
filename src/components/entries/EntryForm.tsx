"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { CreateEntrySchema, CreateEntryInput } from "@/lib/validations";
import { Entry } from "@/types";
import TagInput from "@/components/ui/TagInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface EntryFormProps {
  entry?: Entry;
  onSuccess: () => void;
}

export default function EntryForm({ entry, onSuccess }: EntryFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!entry;

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
      projectIds: [],
    },
  });

  const tags = watch("tags");

  // CREATE mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateEntryInput) =>
      axios.post("/api/entries", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Entry created successfully");
      onSuccess();
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
  );
}