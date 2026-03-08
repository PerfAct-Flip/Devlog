"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Resource } from "@/types";
import ResourceCard from "@/components/resources/ResourceCard";
import ResourceForm from "@/components/resources/ResourceForm";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Article", "Video", "Docs", "Course", "Other"];
const FILTERS = ["All", "Unread", "Favourites"];

export default function ResourcesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeFilter, setActiveFilter] = useState("All");

  // ============================================
  // FETCH RESOURCES
  // ============================================
  const { data, isLoading } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const res = await axios.get<{ data: Resource[] }>("/api/resources");
      return res.data.data;
    },
  });

  // ============================================
  // DELETE MUTATION
  // ============================================
  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/resources/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Resource deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete resource");
    },
  });

  // ============================================
  // FILTERING LOGIC
  // ============================================
  const filtered = (data ?? []).filter((resource) => {
    const categoryMatch =
      activeCategory === "All" || resource.category === activeCategory;

    const filterMatch =
      activeFilter === "All" ||
      (activeFilter === "Unread" && !resource.isRead) ||
      (activeFilter === "Favourites" && resource.isFavourite);

    return categoryMatch && filterMatch;
  });

  // ============================================
  // HANDLERS
  // ============================================
  function handleEdit(resource: Resource) {
    setEditingResource(resource);
    setIsModalOpen(true);
  }

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this resource?")) {
      deleteMutation.mutate(id);
    }
  }

  function handleModalClose() {
    setIsModalOpen(false);
    setEditingResource(null);
  }

  function handleCreateNew() {
    setEditingResource(null);
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
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
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
            Archive / Section 03
          </p>
          <h1 className="text-4xl md:text-5xl font-black italic text-foreground" style={{ fontFamily: "Georgia, serif" }}>
            Resources
          </h1>
        </div>
        <Button 
          onClick={handleCreateNew} 
          className="flex items-center gap-2 bg-foreground text-background hover:opacity-90 font-bold tracking-tight px-6 py-5 h-auto rounded-none"
        >
          <Plus className="h-4 w-4" />
          ADD RESOURCE
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-x-6 gap-y-4">
        {CATEGORIES.map((cat) => {
          const count =
            cat === "All"
              ? (data?.length ?? 0)
              : (data?.filter((r) => r.category === cat).length ?? 0);

          if (count === 0 && cat !== "All") return null;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "group flex items-center gap-3 transition-all",
                "font-mono uppercase tracking-[0.2em] text-[10px] font-bold",
                activeCategory === cat ? "text-foreground" : "text-muted-foreground/40 hover:text-foreground"
              )}
            >
              <div 
                className={cn(
                  "w-1.5 h-1.5 rounded-none transition-all",
                  activeCategory === cat ? "bg-[#fb923c] scale-125" : "bg-muted-foreground/20"
                )} 
              />
              {cat}
              <span className="text-[8px] opacity-40">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Read/Favourite filter */}
      <div className="flex gap-8 border-t border-border/20 pt-6">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "font-mono uppercase tracking-[0.2em] text-[10px] font-bold transition-all",
              activeFilter === filter ? "text-foreground underline underline-offset-8 decoration-border" : "text-muted-foreground/40 hover:text-foreground"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {data?.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="No resources yet"
          description="Save articles, videos, docs and courses you want to reference later."
          actionLabel="Add First Resource"
          onAction={handleCreateNew}
        />
      )}

      {/* Filtered empty state */}
      {data && data.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">
            No resources match the current filters.
          </p>
          <button
            onClick={() => {
              setActiveCategory("All");
              setActiveFilter("All");
            }}
            className="text-sm text-primary hover:underline mt-2"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Resources grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
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
        title={editingResource ? "Edit Resource" : "Add Resource"}
        description={
          editingResource
            ? "Update this resource"
            : "Save a new link to your bookmarker"
        }
      >
        <ResourceForm
          resource={editingResource ?? undefined}
          onSuccess={handleModalClose}
        />
      </Modal>

    </div>
  );
}