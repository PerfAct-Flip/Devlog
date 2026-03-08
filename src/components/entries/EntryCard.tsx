"use client";

import ReactMarkdown from "react-markdown";
import { Entry } from "@/types";
import { formatDate, truncate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Calendar, Pencil, Trash2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface EntryCardProps {
    entry: Entry;
    onEdit: (entry: Entry) => void;
    onDelete: (id: string) => void;
}

export default function EntryCard({
    entry,
    onEdit,
    onDelete,
}: EntryCardProps) {
    const router = useRouter();

    function handleCardClick() {
        router.push(`/log/${entry.id}`);
    }

    function handleEdit(e: React.MouseEvent) {
        e.stopPropagation(); // prevent card click
        onEdit(entry);
    }

    function handleDelete(e: React.MouseEvent) {
        e.stopPropagation(); // prevent card click
        onDelete(entry.id);
    }

    return (
        <div
            onClick={handleCardClick}
            className={cn(
                "group relative bg-accent/[0.03] border border-border/40 rounded-none p-6 cursor-pointer overflow-hidden",
                "hover:border-border/80 hover:bg-accent/[0.06] transition-all duration-300"
            )}
        >
            {/* Action buttons — visible on hover */}
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={handleEdit}
                    className="p-1.5 rounded-none bg-accent/10 hover:bg-foreground hover:text-background transition-all"
                    aria-label="Edit entry"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={handleDelete}
                    className="p-1.5 rounded-none bg-accent/10 hover:bg-red-500 hover:text-white transition-all"
                    aria-label="Delete entry"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4 font-mono">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(entry.date)}</span>
            </div>

            {/* Title */}
            <h3 className="font-bold text-xl mb-3 sm:pr-16 leading-tight text-foreground group-hover:text-[#a78bfa] transition-colors break-words">
                {entry.title}
            </h3>

            {/* Body preview */}
            <div className="text-xs text-muted-foreground/80 mb-6 leading-relaxed line-clamp-2 font-mono pointer-events-none break-words">
                <ReactMarkdown>{entry.body}</ReactMarkdown>
            </div>

            {/* Footer with tags */}
            <div className="flex items-center justify-between pt-4 border-t border-border/40">
                {entry.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                            <span
                                key={tag.id}
                                className="text-[9px] uppercase tracking-[0.1em] font-bold text-muted-foreground bg-accent/10 px-2 py-1 rounded-none border border-border/20"
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                ) : <div />}
                <div className="text-muted-foreground/40 group-hover:text-foreground transition-colors">
                    <ArrowRight className="h-4 w-4" />
                </div>
            </div>
        </div>
    );
}