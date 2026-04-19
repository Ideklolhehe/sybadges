"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FloatingLabelInputProps extends Omit<React.ComponentProps<"input">, "placeholder"> {
  label: string
}

function FloatingLabelInput({
  className,
  label,
  id,
  type = "text",
  ...props
}: FloatingLabelInputProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId

  return (
    <div className="floating-label-wrapper group relative">
      <input
        id={inputId}
        type={type}
        placeholder=" "
        className={cn(
          "peer w-full rounded-md border border-input bg-transparent px-3 pb-2 pt-5 text-base outline-none transition-colors focus:border-ring focus:ring-ring/50 focus:ring-[3px] md:text-sm",
          className
        )}
        {...props}
      />
      <label
        htmlFor={inputId}
        className="pointer-events-none absolute start-3 top-1/2 origin-[right_center] -translate-y-1/2 text-sm text-muted-foreground transition-all duration-200 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:scale-75 peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:scale-75 peer-focus:text-primary"
      >
        {label}
      </label>
    </div>
  )
}

export { FloatingLabelInput }
