"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type SkeletonVariant = "line" | "circle" | "rect"

interface SkeletonLoaderProps {
  /** Shape of the skeleton placeholder */
  variant?: SkeletonVariant
  /** Width (CSS value). Defaults depend on variant. */
  width?: string
  /** Height (CSS value). Defaults depend on variant. */
  height?: string
  /** Border-radius override (CSS value) */
  borderRadius?: string
  /** Animation duration in seconds */
  duration?: number
  className?: string
}

/**
 * Pure-CSS skeleton loader with a shimmer / shine effect.
 *
 * Inspired by https://github.com/kevin-mehta/css-skeleton-loader-implementation
 * and https://uxdesign.cc/using-css-design-a-simple-skeleton-loader-57d884cd3547
 */
function SkeletonLoader({
  variant = "line",
  width,
  height,
  borderRadius,
  duration = 1,
  className,
}: SkeletonLoaderProps) {
  const defaults: Record<SkeletonVariant, { width: string; height: string; borderRadius: string }> = {
    line:   { width: "100%", height: "15px",  borderRadius: "4px" },
    circle: { width: "48px", height: "48px",  borderRadius: "50%" },
    rect:   { width: "100%", height: "120px", borderRadius: "8px" },
  }

  const d = defaults[variant]

  return (
    <span
      className={cn("skeleton-loader-shine", className)}
      role="status"
      aria-label="Loading"
      style={
        {
          width: width ?? d.width,
          height: height ?? d.height,
          borderRadius: borderRadius ?? d.borderRadius,
          "--skeleton-duration": `${duration}s`,
        } as React.CSSProperties
      }
    >
      <span className="sr-only">Loading…</span>
    </span>
  )
}

interface SkeletonCardLoaderProps {
  /** Animation duration in seconds */
  duration?: number
  className?: string
}

/**
 * A card-shaped skeleton placeholder that mirrors a typical
 * product / profile tile with an image + two text lines.
 */
function SkeletonCardLoader({ duration = 1, className }: SkeletonCardLoaderProps) {
  return (
    <div
      className={cn(
        "skeleton-card-wrapper flex gap-4 rounded-lg border border-border p-4",
        className,
      )}
    >
      {/* Image placeholder */}
      <SkeletonLoader variant="rect" width="20%" height="100px" duration={duration} />

      {/* Text lines */}
      <div className="flex flex-1 flex-col justify-center gap-3">
        <SkeletonLoader variant="line" width="85%" height="18px" duration={duration} />
        <SkeletonLoader variant="line" width="60%" height="14px" duration={duration} />
      </div>
    </div>
  )
}

export { SkeletonLoader, SkeletonCardLoader }
