"use client"

import { ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatItemCount } from "@/lib/cart/copy"
import { getItemCount } from "@/lib/cart/pricing"
import { useCartStore } from "@/store/cart"
import { useCartDrawerStore } from "@/store/cart-drawer"

/** Header button that opens the cart drawer, with the number of items on it. */
function CartButton() {
  const lines = useCartStore((state) => state.lines)
  const hydrated = useCartStore((state) => state.hydrated)
  const open = useCartDrawerStore((state) => state.open)
  const setOpen = useCartDrawerStore((state) => state.setOpen)

  // Nothing is counted until the saved cart has loaded, so "0" never shows.
  const count = hydrated ? getItemCount(lines) : 0

  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label={`Open cart, ${count > 0 ? formatItemCount(count) : "empty"}`}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => setOpen(true)}
      className="relative"
    >
      <ShoppingBag aria-hidden="true" />
      {count > 0 ? (
        <span
          // Keyed on the count so the pop replays on every change.
          key={count}
          aria-hidden="true"
          className="badge-pop absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.6875rem] leading-none font-bold text-primary-foreground tabular-nums ring-2 ring-background"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Button>
  )
}

export { CartButton }
