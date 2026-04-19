"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

interface AnimatedSearchBarProps {
  className?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function AnimatedSearchBar({
  className,
  placeholder = "بحث…",
  value,
  onChange,
}: AnimatedSearchBarProps) {
  const [expanded, setExpanded] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleToggle = () => {
    setExpanded((prev) => {
      if (!prev) {
        // expand → focus
        setTimeout(() => inputRef.current?.focus(), 150)
      }
      return !prev
    })
  }

  return (
    <div
      className={cn(
        "animated-search-bar inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 transition-all duration-300",
        expanded ? "w-64" : "w-10 cursor-pointer justify-center",
        className
      )}
    >
      <button
        type="button"
        onClick={handleToggle}
        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
        aria-label={expanded ? "Close search" : "Open search"}
      >
        <Search className="size-4" />
      </button>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground transition-[width,opacity] duration-300",
          expanded ? "w-full opacity-100" : "w-0 opacity-0"
        )}
        tabIndex={expanded ? 0 : -1}
        onBlur={() => {
          if (!value) setExpanded(false)
        }}
      />
    </div>
  )
}

export { AnimatedSearchBar }
