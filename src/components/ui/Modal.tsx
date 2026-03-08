"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  // lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className={cn(
          "relative bg-background border border-border/40 rounded-none shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-8 border-b border-border/20">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-none bg-[#a78bfa] shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#a78bfa] font-mono">
                    System / Prompt
                </span>
            </div>
            <h2
              id="modal-title"
              className="text-2xl font-black text-foreground italic" style={{ fontFamily: "Georgia, serif" }}
            >
              {title}
            </h2>
            {description && (
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 bg-accent/10 border border-border/20 text-foreground hover:bg-foreground hover:text-background transition-all shrink-0"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}