import { getVariantType } from "@/lib/menu"
import type { Category, Item } from "@/types/menu"

/**
 * Whether the customiser can take this item all the way into the cart:
 * single-price items, and anything whose variants it has a picker for (sizes
 * and the Cairo versions).
 */
export function canCustomize(item: Item, category: Category): boolean {
  return (
    item.variants.length === 1 || getVariantType(item, category) !== undefined
  )
}
