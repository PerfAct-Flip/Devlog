"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Entry } from "@/types";
import EntryCard from "@/components/entries/EntryCard";
import EntryForm from "@/components/entries/EntryForm";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import { isToday } from "@/lib/utils";

export default function LogPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  // ============================================
  // FETCH ENTRIES
  // ============================================
  const { data, isLoading } = useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      const res = await axios.get<{ data: Entry[] }>("/api/entries");
      return res.data.data;
    },
  });

  // ============================================
  // DELETE MUTATION
  // ============================================
  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/entries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Entry deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete entry");
    },
  });

  // ============================================
  // HANDLERS
  // ============================================
  function handleEdit(entry: Entry) {
    setEditingEntry(entry);
    setIsModalOpen(true);
  }

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteMutation.mutate(id);
    }
  }

  function handleModalClose() {
    setIsModalOpen(false);
    setEditingEntry(null);
  }

  function handleCreateNew() {
    setEditingEntry(null);
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
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-border/40">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2 font-mono">
            Journal / Section 01
          </p>
          <h1 className="text-4xl md:text-5xl font-black italic text-foreground" style={{ fontFamily: "Georgia, serif" }}>
            Learning Log
          </h1>
        </div>
        <Button 
          onClick={handleCreateNew} 
          className="flex items-center gap-2 bg-foreground text-background hover:opacity-90 font-bold tracking-tight px-6 py-5 h-auto rounded-none"
        >
          <Plus className="h-4 w-4" />
          NEW ENTRY
        </Button>
      </div>

      {/* Quick stats */}
      {data && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 border border-border/40 bg-accent/[0.03]">
          <div className="p-6 text-center border-b sm:border-b-0 sm:border-r border-border/40">
            <p className="text-3xl font-black text-foreground">{data.length}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1 font-mono">Total Entries</p>
          </div>
          <div className="p-6 text-center border-b sm:border-b-0 sm:border-r border-border/40">
            <p className="text-3xl font-black text-foreground">
              {new Set(data.flatMap((e) => e.tags.map((t) => t.name))).size}
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1 font-mono">Tags Used</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-3xl font-black text-foreground">
              {data.filter((e) => isToday(e.date)).length > 0 ? "DONE" : "PENDING"}
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1 font-mono">Logged Today</p>
          </div>
        </div>
      )}

      {/* Entry feed */}
      {data && data.length > 0 && (
        <div className="grid gap-4">
          {data.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingEntry ? "Edit Entry" : "New Log Entry"}
        description={
          editingEntry
            ? "Update your log entry"
            : "Document what you learned today"
        }
      >
        <EntryForm
          entry={editingEntry ?? undefined}
          onSuccess={handleModalClose}
        />
      </Modal>

    </div>
  );
}