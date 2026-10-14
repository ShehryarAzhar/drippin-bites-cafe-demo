"use client"

import Link from "next/link"
import { useMemo } from "react"

import { CartEmpty } from "@/components/cart/cart-empty"
import { buttonVariants } from "@/components/ui/button"
import { getItemCount, getSubtotal } from "@/lib/cart/pricing"
import { getLineSummary } from "@/lib/cart/summary"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/store/cart"

import { CheckoutForm } from "./checkout-form"
import { OrderSummary, summaryPanel } from "./order-summary"

// Below lg one centred column; from lg the form left, the summary right.
const grid =
  "mx-auto grid w-full max-w-xl gap-8 lg:max-w-6xl lg:grid-cols-12 lg:gap-12"
const summaryColumn =
  "lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:self-start"
const formColumn = "lg:col-span-7 lg:col-start-1 lg:row-start-1"

/** Stand-in for the page until the saved cart has loaded. */
function CheckoutLoading() {
  return (
    <div aria-busy="true" className={grid}>
      <div aria-hidden="true" className={cn(summaryPanel, "gap-4 p-5 sm:p-6", summaryColumn)}>
        <div className="h-3 w-24 rounded-sm bg-muted" />
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex justify-between gap-6">
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-2/3 rounded-sm bg-muted" />
              <div className="h-3 w-1/3 rounded-sm bg-muted" />
            </div>
            <div className="h-4 w-16 rounded-sm bg-muted" />
          </div>
        ))}
        <div className="mt-2 h-6 w-full rounded-sm bg-muted" />
      </div>
      <div aria-hidden="true" className={cn("flex flex-col gap-5", formColumn)}>
        <div className="h-3 w-36 rounded-sm bg-muted" />
        <div className="grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((tile) => (
            <div key={tile} className="h-18 rounded-xl bg-muted" />
          ))}
        </div>
        {[0, 1].map((field) => (
          <div key={field} className="flex flex-col gap-2">
            <div className="h-3 w-16 rounded-sm bg-muted" />
            <div className="h-12 rounded-xl bg-muted" />
          </div>
        ))}
        <div className="h-24 rounded-xl bg-muted" />
        <div className="h-14 rounded-full bg-muted" />
      </div>
    </div>
  )
}

/** Picks what checkout shows: loading, the empty cart, or the order and form. */
function CheckoutView() {
  const lines = useCartStore((state) => state.lines)
  const hydrated = useCartStore((state) => state.hydrated)

  // Summaries are derived here, never inside a store selector.
  const rows = useMemo(
    () =>
      lines.flatMap((line) => {
        const summary = getLineSummary(line)
        return summary ? [{ line, summary }] : []
      }),
    [lines]
  )

  if (!hydrated) return <CheckoutLoading />

  if (rows.length === 0) {
    return (
      <CartEmpty
        headingAs="h2"
        className="py-6"
        action={
          <Link href="/menu" className={buttonVariants()}>
            Browse the Menu
          </Link>
        }
      />
    )
  }

  return (
    <div className={grid}>
      <OrderSummary
        rows={rows}
        count={getItemCount(lines)}
        subtotal={getSubtotal(lines)}
        className={summaryColumn}
      />
      <CheckoutForm className={formColumn} />
    </div>
  )
}

export { CheckoutView }
