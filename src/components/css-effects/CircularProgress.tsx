"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CircularProgressProps {
  /** 0 – 100 */
  value?: number
  /** Diameter in px */
  size?: number
  /** Track / ring width in px */
  strokeWidth?: number
  className?: string
  /** When true, spins indefinitely instead of showing a fixed value */
  indeterminate?: boolean
}

function CircularProgress({
  value = 0,
  size = 48,
  strokeWidth = 4,
  className,
  indeterminate = false,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference

  return (
    <div
      className={cn("inline-flex items-center justify-center", className)}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        className={cn(indeterminate && "circular-progress-spin")}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Foreground arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={indeterminate ? circumference * 0.75 : offset}
          className="transition-[stroke-dashoffset] duration-500 ease-in-out"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
      </svg>
    </div>
  )
}

export { CircularProgress }
