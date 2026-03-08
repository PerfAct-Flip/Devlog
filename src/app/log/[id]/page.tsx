"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Entry } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/ui/Modal";
import EntryForm from "@/components/entries/EntryForm";
import EntryDetail from "@/components/entries/EntryDetail";
import Breadcrumb from "@/components/ui/breadcrumb";
import { toast } from "sonner";

export default function EntryDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // ============================================
    // FETCH SINGLE ENTRY
    // ============================================
    const { data: entry, isLoading } = useQuery({
        queryKey: ["entry", id],
        queryFn: async () => {
            const res = await axios.get<{ data: Entry }>(`/api/entries/${id}`);
            return res.data.data;
        },
    });

    // ============================================
    // DELETE MUTATION
    // ============================================
    const deleteMutation = useMutation({
        mutationFn: () => axios.delete(`/api/entries/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["entries"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            toast.success("Entry deleted");
            router.push("/log");
        },
        onError: () => {
            toast.error("Failed to delete entry");
        },
    });

    function handleDelete() {
        if (confirm("Are you sure you want to delete this entry?")) {
            deleteMutation.mutate();
        }
    }

    // ============================================
    // LOADING STATE
    // ============================================
    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-5 w-40" />
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        );
    }

    if (!entry) {
        return (
            <div className="max-w-3xl mx-auto text-center py-20">
                <p className="text-muted-foreground">Entry not found</p>
                <Button
                    variant="ghost"
                    className="mt-4"
                    onClick={() => router.push("/log")}
                >
                    Back to Log
                </Button>
            </div>
        );
    }

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="max-w-3xl mx-auto">
            <Breadcrumb
                items={[
                    { label: "Learning Log", href: "/log" },
                    { label: entry.title },
                ]}
            />
            <EntryDetail
                entry={entry}
                onEdit={() => setIsEditModalOpen(true)}
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending}
            />

            {/* Edit modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Entry"
                description="Update your log entry"
            >
                <EntryForm
                    entry={entry}
                    onSuccess={() => {
                        setIsEditModalOpen(false);
                        queryClient.invalidateQueries({ queryKey: ["entry", id] });
                    }}
                />
            </Modal>
        </div>
    );
}