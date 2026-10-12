import { Sparkle } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type PillLabelProps = {
  children: ReactNode
  className?: string
} & (
  | {
      /** Fully rounded label. */
      variant?: "pill"
      /** Small sparkle either side of the text. */
      sparkles?: boolean
    }
  | {
      /** Label with pointed, ticket-style ends. */
      variant: "ticket"
      sparkles?: never
    }
)

const labelText =
  "font-sans text-xs font-medium tracking-[0.18em] whitespace-nowrap text-primary uppercase sm:text-sm sm:tracking-[0.22em]"

/* One pointed end of the ticket label. Drawn at a fixed size so the point
   keeps its shape whatever the text length; the stroke sits on the half
   pixel to line up with the 1px borders of the middle piece. */
function TicketCap({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 14 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
      className={cn("h-9 w-3.5 shrink-0 overflow-visible", className)}
    >
      <path
        vectorEffect="non-scaling-stroke"
        d="M14 .5H9.5Q7.6 .5 6.8 2.2L.9 18l5.9 15.8q.8 1.7 2.7 1.7H14"
      />
    </svg>
  )
}

/** Gold-outlined text label. Not interactive. */
function PillLabel({
  variant = "pill",
  sparkles = false,
  className,
  children,
}: PillLabelProps) {
  if (variant === "ticket") {
    return (
      <span
        data-slot="pill-label"
        data-variant="ticket"
        className={cn("inline-flex h-9 max-w-full text-primary", className)}
      >
        <TicketCap />
        <span
          className={cn(
            labelText,
            "flex items-center border-y border-primary px-2.5"
          )}
        >
          {children}
        </span>
        <TicketCap className="-scale-x-100" />
      </span>
    )
  }

  return (
    <span
      data-slot="pill-label"
      data-variant="pill"
      className={cn(
        labelText,
        "inline-flex h-9 max-w-full items-center gap-2.5 rounded-full border border-primary bg-background/40 px-5",
        className
      )}
    >
      {sparkles ? (
        <Sparkle aria-hidden="true" className="size-3 shrink-0 fill-current" />
      ) : null}
      {children}
      {sparkles ? (
        <Sparkle aria-hidden="true" className="size-3 shrink-0 fill-current" />
      ) : null}
    </span>
  )
}

export { PillLabel }
