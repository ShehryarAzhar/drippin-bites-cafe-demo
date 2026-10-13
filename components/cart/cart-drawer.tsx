"use client"

import { ArrowRight, Truck, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { BrandHeading } from "@/components/brand/brand-heading"
import { GoldRule } from "@/components/brand/gold-rule"
import { CartLine } from "@/components/cart/cart-line"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { DELIVERY_NOTE, formatItemCount } from "@/lib/cart/copy"
import { getItemCount, getSubtotal } from "@/lib/cart/pricing"
import { getLineSummary } from "@/lib/cart/summary"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/store/cart"
import { useCartDrawerStore } from "@/store/cart-drawer"

const hairline =
  "pointer-events-none absolute inset-x-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"

/** Stand-in rows for the moment before the saved cart has loaded. */
function LoadingRows() {
  return (
    <div aria-hidden="true">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex gap-3 py-4">
          <div className="size-20 shrink-0 rounded-lg bg-muted" />
          <div className="flex flex-1 flex-col gap-2 pt-1">
            <div className="h-4 w-2/3 rounded-sm bg-muted" />
            <div className="h-3 w-1/3 rounded-sm bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** The cart: lines, quantity controls, subtotal and the way to checkout. */
function CartDrawer() {
  const lines = useCartStore((state) => state.lines)
  const hydrated = useCartStore((state) => state.hydrated)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const removeLine = useCartStore((state) => state.removeLine)
  const open = useCartDrawerStore((state) => state.open)
  const setOpen = useCartDrawerStore((state) => state.setOpen)
  const pathname = usePathname()

  const listRef = useRef<HTMLDivElement>(null)
  // Row position of the line just removed; focus goes to whatever takes it.
  const removedAt = useRef<number | null>(null)
  const [announcement, setAnnouncement] = useState("")

  // Summaries are derived here, never inside a store selector.
  const rows = useMemo(
    () =>
      lines.flatMap((line) => {
        const summary = getLineSummary(line)
        return summary ? [{ line, summary }] : []
      }),
    [lines]
  )
  const count = getItemCount(lines)
  const hasLines = rows.length > 0

  // Any route change, Back and Forward included, leaves the drawer closed.
  useEffect(() => {
    setOpen(false)
  }, [pathname, setOpen])

  // After a remove, focus the next line's remove button (or the previous
  // line's, or the empty state's button) so it never falls back to <body>.
  useEffect(() => {
    const index = removedAt.current
    if (index === null) return
    removedAt.current = null
    const list = listRef.current
    if (!list) return
    const buttons = list.querySelectorAll<HTMLElement>("[data-cart-remove]")
    const target =
      buttons[Math.min(index, buttons.length - 1)] ??
      list.querySelector<HTMLElement>("[data-cart-empty-action]")
    target?.focus()
  }, [lines])

  const close = () => setOpen(false)

  // Reads the quantity at tap time, so rapid taps never use a stale one.
  const changeQuantity = (key: string, delta: number) => {
    const current = useCartStore.getState().lines.find((l) => l.key === key)
    if (current) setQuantity(key, Math.max(1, current.quantity + delta))
  }

  const remove = (key: string, title: string, index: number) => {
    removedAt.current = index
    removeLine(key)
    const subtotal = getSubtotal(useCartStore.getState().lines)
    setAnnouncement(`${title} removed. Subtotal ${formatPrice(subtotal)}.`)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" showCloseButton={false}>
        <div className="relative shrink-0 overflow-hidden px-4 pt-5 pb-4 sm:px-6">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-16 size-64 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--gold)_16%,transparent),transparent)]"
          />
          <SheetTitle
            render={
              <BrandHeading
                as="h2"
                size="card"
                align="start"
                lead="Your"
                accent="Order"
              />
            }
            className="relative"
          />
          <SheetDescription className={hasLines ? "relative mt-1.5" : "sr-only"}>
            {formatItemCount(count)}
          </SheetDescription>
          <SheetClose
            aria-label="Close cart"
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-3 right-2 sm:right-4"
              />
            }
          >
            <X aria-hidden="true" />
          </SheetClose>
          <span aria-hidden="true" className={cn(hairline, "bottom-0")} />
        </div>

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6"
        >
          {!hydrated ? (
            <LoadingRows />
          ) : hasLines ? (
            <ul>
              {rows.map(({ line, summary }, index) => (
                <CartLine
                  key={line.key}
                  line={line}
                  summary={summary}
                  onDecrease={() => changeQuantity(line.key, -1)}
                  onIncrease={() => changeQuantity(line.key, 1)}
                  onRemove={() => remove(line.key, summary.title, index)}
                />
              ))}
            </ul>
          ) : (
            <div className="flex min-h-full flex-col items-center justify-center gap-5 py-10 text-center">
              <div className="relative grid size-36 place-items-center">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--gold)_22%,transparent),transparent)]"
                />
                <Image
                  src="/logo-mark.svg"
                  alt=""
                  width={72}
                  height={72}
                  className="relative size-18 opacity-45"
                />
              </div>
              <BrandHeading
                as="h3"
                size="card"
                lead="Nothing here"
                accent="yet"
              />
              <p className="max-w-[26ch] text-sm text-muted-foreground">
                Add something from the menu and it shows up here.
              </p>
              <GoldRule className="max-w-40 sm:max-w-40" />
              {pathname === "/menu" ? (
                <Button data-cart-empty-action="" onClick={close}>
                  Browse the Menu
                </Button>
              ) : (
                <Link
                  href="/menu"
                  data-cart-empty-action=""
                  onClick={close}
                  className={buttonVariants()}
                >
                  Browse the Menu
                </Link>
              )}
            </div>
          )}
        </div>

        {hydrated && hasLines ? (
          <div className="relative shrink-0 bg-secondary/60 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-16px_24px_-16px] shadow-black/70 sm:px-6">
            <span aria-hidden="true" className={cn(hairline, "top-0")} />
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Subtotal
              </span>
              <span className="heading-card whitespace-nowrap text-primary tabular-nums">
                {formatPrice(getSubtotal(lines))}
              </span>
            </div>
            <p className="mt-1.5 flex items-center gap-2 text-[0.8125rem] text-muted-foreground">
              <Truck aria-hidden="true" className="size-4 shrink-0" />
              {DELIVERY_NOTE}
            </p>
            <Link
              href="/checkout"
              // The route arrives with spec 17; prefetching it until then
              // logs a 404 in the console.
              prefetch={false}
              onClick={close}
              className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full")}
            >
              Checkout
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        ) : null}

        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </SheetContent>
    </Sheet>
  )
}

export { CartDrawer }
