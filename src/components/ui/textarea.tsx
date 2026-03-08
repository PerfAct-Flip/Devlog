import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-32 w-full rounded-none border border-border/40 bg-accent/[0.03] px-4 py-3 text-sm text-foreground font-mono transition-all",
        "placeholder:text-muted-foreground/40 placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]",
        "focus:outline-none focus:border-border/80 focus:bg-accent/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
