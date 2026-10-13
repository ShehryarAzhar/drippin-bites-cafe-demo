import type { Item } from "@/types/menu"

/**
 * Whether the customiser can take this item all the way into the cart. Only
 * single-price items so far; anything with a size or version to choose waits
 * for its picker.
 */
export function canCustomize(item: Item): boolean {
  return item.variants.length === 1
}
