"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbTrailProps {
  items: BreadcrumbItem[]
  className?: string
}

function BreadcrumbTrail({ items, className }: BreadcrumbTrailProps) {
  return (
    <nav aria-label="breadcrumb" className={cn("breadcrumb-trail", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className="breadcrumb-trail-item inline-flex items-center gap-1.5">
              {index > 0 && (
                <ChevronLeft className="size-3.5 text-muted-foreground" aria-hidden />
              )}
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href ?? "#"}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export { BreadcrumbTrail }
export type { BreadcrumbItem }
