"use client"

import { ShoppingBag } from "lucide-react"
import { usePathname } from "next/navigation"

import { formatItemCount } from "@/lib/cart/copy"
import { getItemCount, getSubtotal } from "@/lib/cart/pricing"
import { formatPrice } from "@/lib/format"
import { useCartStore } from "@/store/cart"
import { useCartDrawerStore } from "@/store/cart-drawer"

/** Phone-only "View cart" bar, fixed to the bottom while the cart has items. */
function MobileCartBar() {
  const lines = useCartStore((state) => state.lines)
  const hydrated = useCartStore((state) => state.hydrated)
  const drawerOpen = useCartDrawerStore((state) => state.open)
  const setOpen = useCartDrawerStore((state) => state.setOpen)
  const pathname = usePathname()

  const count = getItemCount(lines)
  const subtotal = formatPrice(getSubtotal(lines))
  // Checkout shows the order itself.
  const onCheckout =
    pathname === "/checkout" || pathname.startsWith("/checkout/")
  const active = hydrated && count > 0 && !onCheckout

  return (
    <>
      {/* Room for the bar, so it never covers the end of the page. */}
      {active ? (
        <div
          aria-hidden="true"
          className="h-[calc(5rem+env(safe-area-inset-bottom))] shrink-0 md:hidden"
        />
      ) : null}
      <div
        data-slot="mobile-cart-bar"
        inert={!active}
        data-active={active}
        // With the drawer open the bar only fades: it stays in the page so
        // focus can come back to it when the drawer closes.
        data-shown={active && !drawerOpen}
        className="pointer-events-none invisible fixed inset-x-0 bottom-0 z-30 translate-y-4 bg-linear-to-t from-background via-background/80 to-transparent px-4 pt-8 pb-[calc(0.75rem+env(safe-area-inset-bottom))] opacity-0 transition-[opacity,translate,visibility] duration-250 data-[active=true]:visible data-[shown=true]:translate-y-0 data-[shown=true]:opacity-100 md:hidden"
      >
        <button
          type="button"
          aria-label={`View cart, ${formatItemCount(count)}, ${subtotal}`}
          onClick={() => setOpen(true)}
          className="pointer-events-auto flex h-14 w-full items-center gap-3 rounded-full bg-primary pr-5 pl-4 text-primary-foreground shadow-xl shadow-black/60 outline-none transition-[filter,translate] duration-200 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px"
        >
          <ShoppingBag aria-hidden="true" className="size-5 shrink-0" />
          <span
            aria-hidden="true"
            className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary-foreground px-1.5 text-xs leading-none font-bold text-primary tabular-nums"
          >
            {count > 99 ? "99+" : count}
          </span>
          <span className="flex-1 text-start font-semibold">View cart</span>
          <span className="font-bold whitespace-nowrap tabular-nums">
            {subtotal}
          </span>
        </button>
      </div>
    </>
  )
}

export { MobileCartBar }
