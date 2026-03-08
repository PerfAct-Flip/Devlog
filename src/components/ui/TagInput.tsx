"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
}

export default function TagInput({
  value,
  onChange,
  placeholder = "Add a tag...",
  className,
  maxTags = 10,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase();

    if (!tag) return;
    if (value.includes(tag)) return;
    if (value.length >= maxTags) return;

    onChange([...value, tag]);
    setInputValue("");
  }

  function removeTag(tagToRemove: string) {
    onChange(value.filter((t) => t !== tagToRemove));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // add tag on Enter or comma
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }

    // remove last tag on Backspace if input is empty
    if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function handleBlur() {
    // add tag when user clicks away if there's text
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 min-h-[48px] w-full rounded-none border border-border/40 bg-accent/[0.03] px-4 py-2 text-sm font-mono focus-within:border-border/80 transition-all",
        className
      )}
    >
      {/* Existing tags as chips */}
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1.5 px-2 py-1 border border-border/40 bg-accent/10 text-muted-foreground text-[10px] font-bold uppercase tracking-wider font-mono"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-foreground transition-colors"
            aria-label={`Remove ${tag} tag`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      {/* Text input */}
      {value.length < maxTags && (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40 placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]"
        />
      )}

      {/* Max tags reached message */}
      {value.length >= maxTags && (
        <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground/30 self-center">
          MAX_REACHED
        </span>
      )}
    </div>
  );
}