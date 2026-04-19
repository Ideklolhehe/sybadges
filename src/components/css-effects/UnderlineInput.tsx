"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function UnderlineInput({
  className,
  type = "text",
  ...props
}: React.ComponentProps<"input">) {
  return (
    <div className="underline-input-wrapper relative">
      <input
        type={type}
        className={cn(
          "underline-input w-full border-0 border-b-2 border-muted bg-transparent px-1 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary md:text-sm",
          className
        )}
        {...props}
      />
      <span className="underline-input-bar" />
    </div>
  )
}

export { UnderlineInput }
