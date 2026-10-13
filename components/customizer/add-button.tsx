"use client"

import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCustomizerStore } from "@/store/customizer"

type AddButtonProps = {
  /** Names the button: "Add Zinger Burger to cart", "Build Cairo Combo". */
  name: string
  /** `row` is the icon-only disc for the compact card. */
  layout?: "stacked" | "row"
  /** What the card sits on; it decides which focus ring can be seen. */
  surface?: "card" | "dark"
} & (
  | { itemId: string; comboId?: never; dealId?: never }
  /** A combo is built step by step, so its button says so. */
  | { comboId: string; itemId?: never; dealId?: never }
  | { dealId: string; itemId?: never; comboId?: never }
)

/**
 * A card's Add control. Its `after` layer stretches over the whole card (the
 * nearest positioned ancestor), so a tap anywhere on the card opens the
 * customiser while the card still holds a single button.
 */
function AddButton({
  itemId,
  comboId,
  dealId,
  name,
  layout = "stacked",
  surface = "card",
}: AddButtonProps) {
  const openItem = useCustomizerStore((state) => state.openItem)
  const openCombo = useCustomizerStore((state) => state.openCombo)
  const openDeal = useCustomizerStore((state) => state.openDeal)
  const isRow = layout === "row"
  const isCombo = comboId !== undefined

  const open = () => {
    if (comboId !== undefined) openCombo(comboId)
    else if (dealId !== undefined) openDeal(dealId)
    else if (itemId !== undefined) openItem(itemId)
  }

  return (
    <Button
      // No stock variant: their hover uses a filter, and a filter or transform
      // here would shrink the stretched layer back onto the button itself.
      variant={null}
      size={isRow ? "icon-sm" : "sm"}
      aria-label={isCombo ? `Build ${name}` : `Add ${name} to cart`}
      aria-haspopup="dialog"
      onClick={open}
      className={cn(
        "cursor-pointer bg-primary text-primary-foreground shadow-md shadow-black/25 after:absolute after:inset-0 after:z-20 hover:bg-[color-mix(in_oklab,var(--primary),white_14%)] active:bg-[color-mix(in_oklab,var(--primary),black_10%)]",
        // Dark ring: the gold one is too faint on the cream card.
        surface === "card" &&
          "focus-visible:ring-card-foreground focus-visible:ring-offset-card"
      )}
    >
      <Plus aria-hidden="true" />
      {isRow ? null : isCombo ? "Build" : "Add"}
    </Button>
  )
}

export { AddButton }
