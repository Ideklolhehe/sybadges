"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SlidingUnderlineProps extends React.ComponentProps<"span"> {
  /** Underline color – defaults to the current text color */
  underlineColor?: string
}

function SlidingUnderline({
  className,
  underlineColor,
  children,
  style,
  ...props
}: SlidingUnderlineProps) {
  return (
    <span
      className={cn(
        "sliding-underline relative inline-block cursor-pointer font-semibold",
        className
      )}
      style={
        {
          ...style,
          "--underline-color": underlineColor ?? "currentColor",
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </span>
  )
}

export { SlidingUnderline }
