"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DualRingSpinnerProps {
  className?: string
  size?: number
  color?: string
}

function DualRingSpinner({
  className,
  size = 48,
  color,
}: DualRingSpinnerProps) {
  return (
    <div
      className={cn("inline-block", className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <div
        className="dual-ring-spinner"
        style={
          {
            "--spinner-size": `${size}px`,
            "--spinner-color": color ?? "hsl(var(--primary))",
          } as React.CSSProperties
        }
      />
      <span className="sr-only">Loading…</span>
    </div>
  )
}

export { DualRingSpinner }
