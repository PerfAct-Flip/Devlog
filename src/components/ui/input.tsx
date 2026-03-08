import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-none border border-border/40 bg-accent/[0.03] px-4 py-2 text-sm text-foreground font-mono transition-all",
        "placeholder:text-muted-foreground/40 placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]",
        "focus:outline-none focus:border-border/80 focus:bg-accent/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
