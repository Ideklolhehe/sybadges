"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

type ToastVariant = "default" | "success" | "error" | "warning"

interface ToastNotificationProps {
  /** Title text */
  title: string
  /** Optional description */
  description?: string
  variant?: ToastVariant
  /** Whether the toast is visible */
  open?: boolean
  /** Called when the user closes the toast */
  onClose?: () => void
  className?: string
}

const variantStyles: Record<ToastVariant, string> = {
  default: "border-border bg-background text-foreground",
  success: "border-green-500/40 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100",
  error: "border-destructive/40 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100",
  warning: "border-yellow-500/40 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100",
}

function ToastNotification({
  title,
  description,
  variant = "default",
  open = true,
  onClose,
  className,
}: ToastNotificationProps) {
  if (!open) return null

  return (
    <div
      className={cn(
        "toast-slide-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg",
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <p className="mt-1 text-sm opacity-80">{description}</p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}

export { ToastNotification }
