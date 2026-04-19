"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface StatCounterProps {
  /** Final value to count up to */
  value: number
  /** Label below the number */
  label?: string
  /** Prefix (e.g. "$") */
  prefix?: string
  /** Suffix (e.g. "%", "+") */
  suffix?: string
  /** Animation duration in ms */
  duration?: number
  className?: string
}

function StatCounter({
  value,
  label,
  prefix = "",
  suffix = "",
  duration = 2000,
  className,
}: StatCounterProps) {
  const [display, setDisplay] = React.useState(0)
  const ref = React.useRef<HTMLDivElement>(null)
  const hasAnimated = React.useRef(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const start = performance.now()

          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            // Ease-out quad
            const eased = 1 - (1 - progress) * (1 - progress)
            setDisplay(Math.round(eased * value))

            if (progress < 1) {
              requestAnimationFrame(step)
            }
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration])

  return (
    <div
      ref={ref}
      className={cn(
        "stat-counter flex flex-col items-center justify-center gap-1 text-center",
        className
      )}
    >
      <span className="text-4xl font-bold tabular-nums text-primary">
        {prefix}
        {display.toLocaleString()}
        {suffix}
      </span>
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  )
}

export { StatCounter }
