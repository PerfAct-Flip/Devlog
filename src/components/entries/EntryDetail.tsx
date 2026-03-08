"use client";

import { Entry } from "@/types";
import { formatDateFull } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import {
    Calendar,
    Pencil,
    Trash2,
    FolderKanban,
    Loader2,
    ChevronRight,
    ExternalLink,
} from "lucide-react";

interface EntryDetailProps {
    entry: Entry;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
}

export default function EntryDetail({
    entry,
    onEdit,
    onDelete,
    isDeleting,
}: EntryDetailProps) {
    const router = useRouter();

    return (
        <div className="space-y-12">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pb-8 border-b border-border/40">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-mono">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDateFull(entry.date)}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-foreground italic" style={{ fontFamily: "Georgia, serif" }}>
                        {entry.title}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onEdit}
                        className="px-5 py-2 text-[11px] font-bold tracking-widest uppercase bg-foreground text-background hover:opacity-90 transition-all font-mono"
                    >
                        EDIT
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="px-5 py-2 text-[11px] font-bold tracking-widest uppercase bg-accent/10 border border-border/40 text-foreground hover:bg-red-500 hover:border-red-500 hover:text-white transition-all font-mono"
                    >
                        {isDeleting ? "DELETING..." : "DELETE"}
                    </button>
                </div>
            </div>

            {/* Tags */}
            {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                        <span 
                            key={tag.id} 
                            className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground bg-accent/10 px-3 py-1.5 border border-border/20 font-mono"
                        >
                            {tag.name}
                        </span>
                    ))}
                </div>
            )}

            {/* Body */}
            <div className="prose dark:prose-invert prose-sm max-w-none leading-relaxed font-mono text-[13px] text-muted-foreground/90">
                <ReactMarkdown>{entry.body}</ReactMarkdown>
            </div>

            {/* Relations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-border/40">
                {/* Linked projects */}
                {entry.projects && entry.projects.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] font-mono">
                            Part of Project
                        </h2>
                        <div className="flex flex-col gap-3">
                            {entry.projects.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => router.push(`/projects/${project.id}`)}
                                    className="flex items-center justify-between p-5 border border-border/40 bg-accent/[0.03] hover:border-border/80 hover:bg-accent/[0.06] transition-all group text-left"
                                >
                                    <div className="flex flex-col items-start gap-1">
                                        <p className="text-sm font-bold text-foreground group-hover:text-[#a78bfa] transition-colors">{project.name}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{project.status}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Linked resources */}
                {entry.resources && entry.resources.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] font-mono">
                            Attached Resources
                        </h2>
                        <div className="flex flex-col gap-3">
                            {entry.resources.map((resource) => (
                                <a
                                    key={resource.id}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-5 border border-border/40 bg-accent/[0.03] hover:border-border/80 hover:bg-accent/[0.06] transition-all group"
                                >
                                    <div className="flex flex-col gap-1 min-w-0 flex-1 mr-4">
                                        <p className="text-sm font-bold text-foreground group-hover:text-[#fb923c] transition-colors truncate">{resource.title}</p>
                                        <p className="text-[10px] tracking-widest text-muted-foreground font-mono truncate uppercase">
                                            {resource.category}
                                        </p>
                                    </div>
                                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
