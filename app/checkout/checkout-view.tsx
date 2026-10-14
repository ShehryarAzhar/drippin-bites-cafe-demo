"use client"

import Link from "next/link"
import { useMemo, useRef, useState } from "react"

import { CartEmpty } from "@/components/cart/cart-empty"
import { buttonVariants } from "@/components/ui/button"
import { getItemCount, getSubtotal } from "@/lib/cart/pricing"
import { getLineSummary } from "@/lib/cart/summary"
import { buildOrderMessage } from "@/lib/order-message"
import { cn } from "@/lib/utils"
import type { CheckoutDetails } from "@/lib/validations/checkout"
import { buildWhatsAppUrl, getWhatsAppNumber } from "@/lib/whatsapp"
import { useCartStore } from "@/store/cart"
import type { CartLine } from "@/types/cart"

import { CheckoutForm } from "./checkout-form"
import { OrderSent } from "./order-sent"
import { OrderSummary, summaryPanel } from "./order-summary"
import { SendConfirmation } from "./send-confirmation"

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

const whatsappNumber = getWhatsAppNumber()

/** The order that was opened in WhatsApp, and the cart it was built from. */
type SentOrder = { url: string; lines: CartLine[] }

/**
 * Picks what checkout shows: loading, the empty cart, the order and form, the
 * "Did you send it?" step after WhatsApp opens, or the order sent.
 */
function CheckoutView() {
  const lines = useCartStore((state) => state.lines)
  const hydrated = useCartStore((state) => state.hydrated)
  const clearCart = useCartStore((state) => state.clear)
  const [step, setStep] = useState<"form" | "confirm" | "sent">("form")
  const [sent, setSent] = useState<SentOrder | null>(null)
  const submitRef = useRef<HTMLButtonElement>(null)

  // Summaries are derived here, never inside a store selector.
  const rows = useMemo(
    () =>
      lines.flatMap((line) => {
        const summary = getLineSummary(line)
        return summary ? [{ line, summary }] : []
      }),
    [lines]
  )

  // Any change to the cart makes a new `lines` array, so a message that no
  // longer matches it drops checkout back to the form (or the empty state).
  const confirming = step === "confirm" && sent !== null && sent.lines === lines

  // Plain handlers, not memoised: the form calls onSend at submit time only.
  const sendOrder = (details: CheckoutDetails) => {
    if (!whatsappNumber) return
    const text = buildOrderMessage({
      summaries: rows.map((row) => row.summary),
      subtotal: getSubtotal(lines),
      details,
    })
    const url = buildWhatsAppUrl(whatsappNumber, text)
    // A new tab keeps checkout alive for the step below; if the browser
    // blocks it, that step's link opens the same chat.
    window.open(url, "_blank", "noopener,noreferrer")
    setSent({ url, lines })
    setStep("confirm")
  }

  const confirmSent = () => {
    clearCart()
    setStep("sent")
  }

  const editDetails = () => {
    setStep("form")
    // The form is shown again on the next render; focus its button then.
    requestAnimationFrame(() => submitRef.current?.focus())
  }

  if (!hydrated) return <CheckoutLoading />

  // Before the empty check: the cart is empty here because it was sent.
  if (step === "sent") return <OrderSent />

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
      {/* Hidden, not unmounted, while confirming: "Not yet" keeps every value. */}
      <div hidden={confirming} className={formColumn}>
        <CheckoutForm
          onSend={whatsappNumber ? sendOrder : undefined}
          submitRef={submitRef}
        />
      </div>
      {confirming && sent ? (
        <SendConfirmation
          url={sent.url}
          onConfirm={confirmSent}
          onEdit={editDetails}
          className={cn(formColumn, "lg:self-start")}
        />
      ) : null}
    </div>
  )
}

export { CheckoutView }
