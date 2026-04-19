"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarHoverCardProps {
  /** Image URL for the avatar */
  src?: string
  /** Alt text */
  alt?: string
  /** Name displayed on hover */
  name: string
  /** Short info displayed on hover */
  info?: string
  /** Avatar diameter in px */
  size?: number
  className?: string
}

function AvatarHoverCard({
  src,
  alt,
  name,
  info,
  size = 40,
  className,
}: AvatarHoverCardProps) {
  return (
    <div className={cn("avatar-hover-card group relative inline-block", className)}>
      {/* Avatar circle */}
      <div
        className="overflow-hidden rounded-full bg-muted transition-transform duration-200 group-hover:scale-110"
        style={{ width: size, height: size }}
      >
        {src ? (
          <img
            src={src}
            alt={alt ?? name}
            className="size-full object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-sm font-medium text-muted-foreground">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Hover card */}
      <div className="avatar-hover-card-popup pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max -translate-x-1/2 scale-95 rounded-lg border bg-popover p-3 text-sm opacity-0 shadow-md transition-all duration-200 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
        <p className="font-semibold text-popover-foreground">{name}</p>
        {info && <p className="mt-0.5 text-muted-foreground">{info}</p>}
        {/* Arrow */}
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-popover" />
      </div>
    </div>
  )
}

export { AvatarHoverCard }
