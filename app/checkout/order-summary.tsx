"use client"

import { Pencil, Truck } from "lucide-react"

import { LineDetails, LineVariantTag } from "@/components/cart/line-details"
import { Button } from "@/components/ui/button"
import { DELIVERY_NOTE, formatItemCount } from "@/lib/cart/copy"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useCartDrawerStore } from "@/store/cart-drawer"
import type { CartLine, LineSummary } from "@/types/cart"

export type SummaryRow = { line: CartLine; summary: LineSummary }

const hairline =
  "pointer-events-none absolute inset-x-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"

/** The card around the summary, shared with its loading stand-in. */
export const summaryPanel =
  "relative isolate flex flex-col overflow-hidden rounded-2xl bg-secondary/60 ring-1 ring-gold/20 shadow-xl shadow-black/40"

/** The heading label used by the summary and the form's sections. */
export const sectionLabel =
  "text-xs font-medium tracking-[0.18em] text-primary uppercase"

type OrderSummaryProps = {
  rows: SummaryRow[]
  count: number
  subtotal: number
  className?: string
}

/** The order, read-only: lines, subtotal, delivery note and "Edit order". */
function OrderSummary({ rows, count, subtotal, className }: OrderSummaryProps) {
  const openCart = useCartDrawerStore((state) => state.setOpen)

  return (
    <section
      aria-labelledby="order-summary-heading"
      className={cn(
        summaryPanel,
        // Sticky beside the form from lg: fits the viewport, rows scroll.
        "lg:max-h-[calc(100dvh-var(--header-height)-3rem)]",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 -z-10 size-64 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--gold)_14%,transparent),transparent)]"
      />
      <div className="flex shrink-0 items-baseline justify-between gap-3 px-5 pt-5 pb-1 sm:px-6">
        <h2 id="order-summary-heading" className={sectionLabel}>
          Your order
        </h2>
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatItemCount(count)}
        </span>
      </div>

      <ul className="min-h-0 px-5 sm:px-6 lg:overflow-y-auto lg:overscroll-contain">
        {rows.map(({ line, summary }) => (
          <li
            key={line.key}
            className="relative flex flex-col gap-1.5 py-3.5 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-linear-to-r after:from-transparent after:via-primary/30 after:to-transparent last:after:hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col items-start gap-1.5">
                <h3 className="leading-snug font-semibold wrap-break-word">
                  <span className="text-primary tabular-nums">
                    {summary.quantity} ×
                  </span>{" "}
                  {summary.title}
                </h3>
                <LineVariantTag line={line} summary={summary} />
              </div>
              <div className="shrink-0 text-end">
                <p className="font-bold whitespace-nowrap tabular-nums">
                  {formatPrice(summary.lineTotal)}
                </p>
                {summary.quantity > 1 ? (
                  <p className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                    {formatPrice(summary.unitPrice)} each
                  </p>
                ) : null}
              </div>
            </div>
            <LineDetails details={summary.details} />
          </li>
        ))}
      </ul>

      <div className="relative shrink-0 bg-background/40 px-5 pt-4 pb-3 sm:px-6">
        <span aria-hidden="true" className={cn(hairline, "top-0")} />
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Subtotal
          </span>
          <span className="heading-card whitespace-nowrap text-primary tabular-nums">
            {formatPrice(subtotal)}
          </span>
        </div>
        <p className="mt-1.5 flex items-center gap-2 text-[0.8125rem] text-muted-foreground">
          <Truck aria-hidden="true" className="size-4 shrink-0" />
          {DELIVERY_NOTE}
        </p>
        <Button
          variant="ghost"
          onClick={() => openCart(true)}
          className="mt-2 -ml-3 text-primary"
        >
          <Pencil aria-hidden="true" />
          Edit order
        </Button>
      </div>
    </section>
  )
}

export { OrderSummary }
