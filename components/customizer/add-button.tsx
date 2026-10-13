"use client"

import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCustomizerStore } from "@/store/customizer"

type AddButtonProps = {
  itemId: string
  /** Names the button: "Add Zinger Burger to cart". */
  name: string
  /** `row` is the icon-only disc for the compact card. */
  layout?: "stacked" | "row"
}

/**
 * A card's Add control. Its `after` layer stretches over the whole card (the
 * nearest positioned ancestor), so a tap anywhere on the card opens the
 * customiser while the card still holds a single button.
 */
function AddButton({ itemId, name, layout = "stacked" }: AddButtonProps) {
  const openItem = useCustomizerStore((state) => state.openItem)
  const isRow = layout === "row"

  return (
    <Button
      // No stock variant: their hover uses a filter, and a filter or transform
      // here would shrink the stretched layer back onto the button itself.
      variant={null}
      size={isRow ? "icon-sm" : "sm"}
      aria-label={`Add ${name} to cart`}
      aria-haspopup="dialog"
      onClick={() => openItem(itemId)}
      // Dark ring: the gold one is too faint on the cream card.
      className="cursor-pointer bg-primary text-primary-foreground shadow-md shadow-black/25 after:absolute after:inset-0 after:z-20 hover:bg-[color-mix(in_oklab,var(--primary),white_14%)] focus-visible:ring-card-foreground focus-visible:ring-offset-card active:bg-[color-mix(in_oklab,var(--primary),black_10%)]"
    >
      <Plus aria-hidden="true" />
      {isRow ? null : "Add"}
    </Button>
  )
}

export { AddButton }
