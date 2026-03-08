import { TopTag } from "@/types";
import { cn } from "@/lib/utils";

interface TagCloudProps {
  tags: TopTag[];
}

const sizeClasses = [
  "text-2xl font-bold",
  "text-xl font-semibold",
  "text-lg font-semibold",
  "text-base font-medium",
  "text-sm font-medium",
];

export default function TagCloud({ tags }: TagCloudProps) {
  if (tags.length === 0) {
    return (
      <div className="bg-card border rounded-xl p-6">
        <h3 className="font-semibold mb-1">Top Tags</h3>
        <p className="text-sm text-muted-foreground">
          No tags yet. Start logging entries with tags.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-accent/[0.03] border border-border/40 rounded-none p-6 space-y-8">
      <div>
        <h3 className="text-sm font-bold tracking-tight uppercase" style={{ fontFamily: "monospace" }}>Top Tags</h3>
        <p className="text-[10px] tracking-widest text-muted-foreground mt-1 font-mono uppercase">
          Most frequent / Taxonomy
        </p>
      </div>

      {/* Cloud */}
      <div className="flex flex-wrap gap-4 items-center justify-center py-4">
        {tags.map((tag, index) => (
          <span
            key={tag.name}
            className={cn(
                "text-foreground cursor-default transition-all hover:text-[#a78bfa] font-mono",
                sizeClasses[index] ?? sizeClasses[4]
            )}
          >
            {tag.name}
            <span className="text-[10px] text-muted-foreground/40 ml-1 font-normal">
              {tag.count}
            </span>
          </span>
        ))}
      </div>

      {/* Bar chart alternative */}
      <div className="space-y-4 border-t border-border/40 pt-6">
        {tags.map((tag) => {
          const maxCount = tags[0]?.count ?? 1;
          const percentage = Math.round((tag.count / maxCount) * 100);
          return (
            <div key={tag.name} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest">
                <span className="text-foreground truncate">
                  {tag.name}
                </span>
                <span className="text-muted-foreground/40">
                  {tag.count}
                </span>
              </div>
              <div className="w-full bg-accent/20 h-1 rounded-none overflow-hidden">
                <div
                  className="bg-foreground h-full transition-all duration-700"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}