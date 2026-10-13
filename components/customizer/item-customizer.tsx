"use client"

import { useEffect, useRef, useState } from "react"

import { BrandHeading } from "@/components/brand/brand-heading"
import { CustomizerPanel } from "@/components/customizer/customizer-shell"
import { SizePicker } from "@/components/customizer/size-picker"
import { VersionToggle } from "@/components/customizer/version-toggle"
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
  getVariant,
  getVariantLabel,
  getVariantType,
} from "@/lib/menu"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/store/cart"
import { useCustomizerStore } from "@/store/customizer"
import type { ItemSelection } from "@/types/cart"
import type { Category, Item, Variant } from "@/types/menu"

/** How long "Added" stays on the button before the sheet closes. */
const ADDED_PAUSE_MS = 600

type ItemCustomizerProps = {
  item: Item
  category: Category
  /** Called as the sheet closes after an add, with the line to announce. */
  onAdded: (message: string) => void
}

function toSelection(item: Item, variant: Variant): ItemSelection {
  return { kind: "item", itemId: item.id, variantId: variant.id, addOns: [] }
}

/**
 * One item in the customiser: its size or version where it has them, quantity,
 * live total and Add to cart. Mounted afresh on every open, so it always
 * starts at 1, with no size chosen or on the first version.
 */
function ItemCustomizer({ item, category, onAdded }: ItemCustomizerProps) {
  const lines = useCartStore((state) => state.lines)
  const hydrated = useCartStore((state) => state.hydrated)
  const addLine = useCartStore((state) => state.addLine)
  const close = useCustomizerStore((state) => state.close)

  const variantType = getVariantType(item, category)
  const sized = variantType === "size"
  const versioned = variantType === "version"

  const [quantity, setQuantity] = useState(1)
  // A size has to be chosen; anything else starts on its first variant.
  const [variantId, setVariantId] = useState<string | null>(() =>
    sized ? null : getDefaultVariant(item).id
  )
  const [status, setStatus] = useState<"idle" | "added" | "refused">("idle")
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const sizeRef = useRef<HTMLDivElement>(null)

  // A sheet opened on another item must not be closed by this one's timer.
  useEffect(() => () => clearTimeout(closeTimer.current), [])

  // A sized item has no variant, and so no price, until a size is chosen.
  const variant = variantId ? getVariant(item, variantId) : undefined
  const name = getDisplayName(item, variant)
  const description = getDisplayDescription(item, variant)
  const selection = variant ? toSelection(item, variant) : undefined
  const unitPrice = selection ? getUnitPrice(selection) : undefined
  // A line stops at the maximum, so only the room left can be added.
  const remaining = selection
    ? MAX_LINE_QUANTITY - getQuantityInCart(lines, selection)
    : MAX_LINE_QUANTITY
  const added = status === "added"
  const full = !added && remaining < 1

  const chooseVariant = (id: string) => {
    const next = getVariant(item, id)
    if (!next) return
    // Each size or version is its own cart line, with its own room left.
    const room =
      MAX_LINE_QUANTITY - getQuantityInCart(lines, toSelection(item, next))
    setVariantId(id)
    setQuantity((q) => Math.max(1, Math.min(q, room)))
    setStatus("idle")
  }

  const showSizes = () => {
    sizeRef.current?.scrollIntoView({ block: "nearest" })
    sizeRef.current
      ?.querySelector<HTMLElement>('[role="radio"]')
      ?.focus({ preventScroll: true })
  }

  const add = () => {
    if (!selection || !variant || added || full || !hydrated) return
    if (!addLine(selection, quantity)) {
      setStatus("refused")
      return
    }
    setStatus("added")
    const subtotal = getSubtotal(useCartStore.getState().lines)
    const label = variantType
      ? `${name} (${getVariantLabel(item, category, variant)})`
      : name
    const message = `${quantity} × ${label} added to cart. Subtotal ${formatPrice(subtotal)}.`
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
      total={
        hydrated && unitPrice !== undefined
          ? formatPrice(unitPrice * quantity)
          : undefined
      }
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
      pending={
        selection
          ? undefined
          : { label: "Choose a size", onAction: showSizes }
      }
      onAdd={add}
    >
      {versioned && variant ? (
        // First in the body, so it stays put while what is under it swaps.
        // Held still while "Added" shows, and below the close button from `md`.
        <div inert={added} className="md:mt-9">
          <VersionToggle
            options={item.variants.map((v) => ({
              id: v.id,
              label: getVariantLabel(item, category, v),
              price: formatPrice(v.price),
            }))}
            value={variant.id}
            onChange={chooseVariant}
          />
        </div>
      ) : null}
      {/* Keyed by version, so a change of version fades its content in. */}
      <div
        key={versioned ? variant?.id : undefined}
        className={cn(
          "flex flex-col gap-3",
          versioned && "animate-in duration-200 fade-in"
        )}
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
      </div>
      {sized ? (
        <>
          <span
            aria-hidden="true"
            className="my-1 h-px shrink-0 bg-linear-to-r from-transparent via-primary/60 to-transparent"
          />
          {/* The tiles are the price list, so no unit price is printed. Held
              still while "Added" shows, so the size announced is the one
              added. */}
          <div ref={sizeRef} inert={added}>
            <SizePicker
              options={item.variants.map((v) => ({
                id: v.id,
                label: getVariantLabel(item, category, v),
                price: formatPrice(v.price),
              }))}
              value={variant?.id ?? null}
              onChange={chooseVariant}
            />
          </div>
        </>
      ) : !versioned && unitPrice !== undefined ? (
        <p className="text-lg font-bold tabular-nums">
          {formatPrice(unitPrice)}
        </p>
      ) : null}
      {/* Dips pickers go here, under a fading gold rule. */}
    </CustomizerPanel>
  )
}

export { ItemCustomizer }
