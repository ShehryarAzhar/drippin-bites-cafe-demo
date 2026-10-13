"use client"

import { useEffect, useRef, useState } from "react"

import { AddOnPicker } from "@/components/customizer/add-on-picker"
import { BrandHeading } from "@/components/brand/brand-heading"
import { CustomizerPanel } from "@/components/customizer/customizer-shell"
import { SizePicker } from "@/components/customizer/size-picker"
import { VersionToggle } from "@/components/customizer/version-toggle"
import { ItemTags } from "@/components/menu/item-tags"
import { SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { getAddOnRule, getAddOnStatus } from "@/lib/cart/copy"
import { getQuantityInCart, MAX_LINE_QUANTITY } from "@/lib/cart/line"
import { getSubtotal, getUnitPrice, priceAddOns } from "@/lib/cart/pricing"
import { formatPrice, splitName } from "@/lib/format"
import {
  getDefaultVariant,
  getDisplayDescription,
  getDisplayName,
  getImage,
  getItemAddOnGroups,
  getTags,
  getVariant,
  getVariantLabel,
  getVariantType,
} from "@/lib/menu"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/store/cart"
import { useCustomizerStore } from "@/store/customizer"
import type { AddOnSelection, ItemSelection } from "@/types/cart"
import type { AddOnGroup, Category, Item, Variant } from "@/types/menu"

/** How long "Added" stays on the button before the sheet closes. */
const ADDED_PAUSE_MS = 600

type ItemCustomizerProps = {
  item: Item
  category: Category
  /** Called as the sheet closes after an add, with the line to announce. */
  onAdded: (message: string) => void
}

/** Chosen option ids by add-on group id. */
type ChosenAddOns = Record<string, string[]>

function toSelection(
  item: Item,
  variant: Variant,
  groups: AddOnGroup[],
  chosen: ChosenAddOns
): ItemSelection {
  // A group with nothing chosen is left out, as in a line with no add-ons.
  const addOns: AddOnSelection[] = groups.flatMap((group) => {
    const optionIds = chosen[group.id] ?? []
    return optionIds.length > 0 ? [{ groupId: group.id, optionIds }] : []
  })
  return { kind: "item", itemId: item.id, variantId: variant.id, addOns }
}

/**
 * One item in the customiser: its size or version where it has them, its dips,
 * quantity, live total and Add to cart. Mounted afresh on every open, so it
 * always starts at 1, with no size or dips chosen, or on the first version.
 */
function ItemCustomizer({ item, category, onAdded }: ItemCustomizerProps) {
  const lines = useCartStore((state) => state.lines)
  const hydrated = useCartStore((state) => state.hydrated)
  const addLine = useCartStore((state) => state.addLine)
  const close = useCustomizerStore((state) => state.close)

  const variantType = getVariantType(item, category)
  const sized = variantType === "size"
  const versioned = variantType === "version"
  // A group with nothing to choose from gets no section.
  const groups = getItemAddOnGroups(item, category).filter(
    (group) => group.options.length > 0 && group.maxSelect >= 1
  )

  const [quantity, setQuantity] = useState(1)
  // A size has to be chosen; anything else starts on its first variant.
  const [variantId, setVariantId] = useState<string | null>(() =>
    sized ? null : getDefaultVariant(item).id
  )
  const [chosenAddOns, setChosenAddOns] = useState<ChosenAddOns>({})
  const [status, setStatus] = useState<"idle" | "added" | "refused">("idle")
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const sizeRef = useRef<HTMLDivElement>(null)

  // A sheet opened on another item must not be closed by this one's timer.
  useEffect(() => () => clearTimeout(closeTimer.current), [])

  // A sized item has no variant, and so no price, until a size is chosen.
  const variant = variantId ? getVariant(item, variantId) : undefined
  const name = getDisplayName(item, variant)
  const description = getDisplayDescription(item, variant)
  const selection = variant
    ? toSelection(item, variant, groups, chosenAddOns)
    : undefined
  const unitPrice = selection ? getUnitPrice(selection) : undefined
  // A line stops at the maximum, so only the room left can be added.
  const remaining = selection
    ? MAX_LINE_QUANTITY - getQuantityInCart(lines, selection)
    : MAX_LINE_QUANTITY
  const added = status === "added"
  const full = !added && remaining < 1

  // Each size, version or set of dips is its own cart line, with its own room
  // left, so every change of choice goes through here.
  const applyChoice = (
    nextVariant: Variant | undefined,
    nextAddOns: ChosenAddOns
  ) => {
    setVariantId(nextVariant?.id ?? null)
    setChosenAddOns(nextAddOns)
    setStatus("idle")
    if (!nextVariant) return
    const room =
      MAX_LINE_QUANTITY -
      getQuantityInCart(
        lines,
        toSelection(item, nextVariant, groups, nextAddOns)
      )
    setQuantity((q) => Math.max(1, Math.min(q, room)))
  }

  const chooseVariant = (id: string) => {
    const next = getVariant(item, id)
    if (next) applyChoice(next, chosenAddOns)
  }

  const chooseAddOns = (groupId: string, optionIds: string[]) => {
    applyChoice(variant, { ...chosenAddOns, [groupId]: optionIds })
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
    const addOnNames = priceAddOns(selection).map((a) => a.option.name)
    const label = [
      variantType
        ? `${name} (${getVariantLabel(item, category, variant)})`
        : name,
      ...(addOnNames.length > 0 ? [`with ${addOnNames.join(", ")}`] : []),
    ].join(" ")
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
      {/* The dish's own price; the button carries the total with dips. */}
      {!sized && !versioned && variant ? (
        <p className="text-lg font-bold tabular-nums">
          {formatPrice(variant.price)}
        </p>
      ) : null}
      {sized || groups.length > 0 ? (
        <span
          aria-hidden="true"
          className="my-1 h-px shrink-0 bg-linear-to-r from-transparent via-primary/60 to-transparent"
        />
      ) : null}
      {sized ? (
        // The tiles are the price list, so no unit price is printed. Held
        // still while "Added" shows, so the size announced is the one added.
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
      ) : null}
      {groups.length > 0 ? (
        // Outside the keyed block above, so a change of version leaves the
        // tiles where they are. Held still while "Added" shows.
        <div inert={added} className="flex flex-col gap-5">
          {groups.map((group) => {
            const optionIds = chosenAddOns[group.id] ?? []
            return (
              <AddOnPicker
                key={group.id}
                title={group.name}
                rule={getAddOnRule(group)}
                status={getAddOnStatus(group, optionIds)}
                options={group.options.map((option) => ({
                  id: option.id,
                  name: option.name,
                  price:
                    option.price !== undefined
                      ? formatPrice(option.price)
                      : undefined,
                }))}
                value={optionIds}
                max={group.maxSelect}
                onChange={(ids) => chooseAddOns(group.id, ids)}
              />
            )
          })}
        </div>
      ) : null}
    </CustomizerPanel>
  )
}

export { ItemCustomizer }
