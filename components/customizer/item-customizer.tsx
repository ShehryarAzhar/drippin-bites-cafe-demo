"use client"

import { useEffect, useRef, useState } from "react"

import { BrandHeading } from "@/components/brand/brand-heading"
import { CustomizerPanel } from "@/components/customizer/customizer-shell"
import { ItemTags } from "@/components/menu/item-tags"
import { SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { getQuantityInCart, MAX_LINE_QUANTITY } from "@/lib/cart/line"
import { getSubtotal, getUnitPrice } from "@/lib/cart/pricing"
import { formatPrice, splitName } from "@/lib/format"
import {
  getDefaultVariant,
  getDisplayDescription,
  getDisplayName,
  getImage,
  getTags,
} from "@/lib/menu"
import { useCartStore } from "@/store/cart"
import { useCustomizerStore } from "@/store/customizer"
import type { ItemSelection } from "@/types/cart"
import type { Category, Item } from "@/types/menu"

/** How long "Added" stays on the button before the sheet closes. */
const ADDED_PAUSE_MS = 600

type ItemCustomizerProps = {
  item: Item
  category: Category
  /** Called as the sheet closes after an add, with the line to announce. */
  onAdded: (message: string) => void
}

/**
 * One item in the customiser: quantity, live total and Add to cart. Mounted
 * afresh on every open, so it always starts at 1.
 */
function ItemCustomizer({ item, category, onAdded }: ItemCustomizerProps) {
  const lines = useCartStore((state) => state.lines)
  const hydrated = useCartStore((state) => state.hydrated)
  const addLine = useCartStore((state) => state.addLine)
  const close = useCustomizerStore((state) => state.close)

  const [quantity, setQuantity] = useState(1)
  const [status, setStatus] = useState<"idle" | "added" | "refused">("idle")
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // A sheet opened on another item must not be closed by this one's timer.
  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const variant = getDefaultVariant(item)
  const name = getDisplayName(item, variant)
  const description = getDisplayDescription(item, variant)
  const selection: ItemSelection = {
    kind: "item",
    itemId: item.id,
    variantId: variant.id,
    addOns: [],
  }
  const unitPrice = getUnitPrice(selection)
  // A line stops at the maximum, so only the room left can be added.
  const remaining = MAX_LINE_QUANTITY - getQuantityInCart(lines, selection)
  const added = status === "added"
  const full = !added && remaining < 1

  const add = () => {
    if (added || full || !hydrated) return
    if (!addLine(selection, quantity)) {
      setStatus("refused")
      return
    }
    setStatus("added")
    const subtotal = getSubtotal(useCartStore.getState().lines)
    const message = `${quantity} × ${name} added to cart. Subtotal ${formatPrice(subtotal)}.`
    closeTimer.current = setTimeout(() => {
      close()
      // Announced once the sheet lets go of the page behind it.
      onAdded(message)
    }, ADDED_PAUSE_MS)
  }

  return (
    <CustomizerPanel
      image={getImage(category, item, variant)}
      name={name}
      quantity={quantity}
      maxQuantity={remaining}
      onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
      onIncrease={() => setQuantity((q) => Math.min(remaining, q + 1))}
      total={hydrated ? formatPrice(unitPrice * quantity) : undefined}
      disabled={!hydrated || full}
      added={added}
      notice={
        status === "refused"
          ? { text: "That couldn't be added. Please try again.", tone: "error" }
          : full
            ? {
                text: `You already have ${MAX_LINE_QUANTITY} of these in your cart.`,
                tone: "muted",
              }
            : undefined
      }
      onAdd={add}
    >
      <ItemTags tags={getTags(item, variant)} />
      <SheetTitle
        render={
          <BrandHeading
            as="h2"
            size="card"
            align="start"
            {...splitName(name)}
          />
        }
        // Clear of the close button, which sits over this column from `md`.
        className="wrap-break-word md:pr-12"
      />
      {item.subtitle ? (
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
          {item.subtitle}
        </p>
      ) : null}
      {description ? <SheetDescription>{description}</SheetDescription> : null}
      <p className="text-lg font-bold tabular-nums">{formatPrice(unitPrice)}</p>
      {/* Size, version and dips pickers go here, under a fading gold rule. */}
    </CustomizerPanel>
  )
}

export { ItemCustomizer }
