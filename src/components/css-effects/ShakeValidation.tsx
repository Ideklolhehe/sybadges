"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ShakeValidationProps extends React.ComponentProps<"input"> {
  /** When true the input shakes and shows an error style */
  hasError?: boolean
  /** Optional error message displayed below the input */
  errorMessage?: string
}

function ShakeValidation({
  className,
  hasError = false,
  errorMessage,
  type = "text",
  ...props
}: ShakeValidationProps) {
  return (
    <div className="flex flex-col gap-1">
      <input
        type={type}
        className={cn(
          "w-full rounded-md border bg-transparent px-3 py-2 text-base outline-none transition-colors md:text-sm",
          hasError
            ? "shake-animation border-destructive text-destructive placeholder:text-destructive/60"
            : "border-input focus:border-ring focus:ring-ring/50 focus:ring-[3px]",
          className
        )}
        aria-invalid={hasError || undefined}
        {...props}
      />
      {hasError && errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  )
}

export { ShakeValidation }
