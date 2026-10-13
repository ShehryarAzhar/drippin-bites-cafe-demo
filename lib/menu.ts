import menuJson from "@/data/menu.json"
import { tbdSafe } from "@/lib/format"
import type {
  AddOnGroup,
  Category,
  Combo,
  ComboSlot,
  Deal,
  DealPizzaLine,
  Item,
  ItemRef,
  Menu,
  Tag,
  Variant,
  VariantType,
} from "@/types/menu"

// The only import of menu.json. The file is trusted, not validated at runtime.
export const menu = menuJson as Menu

export type ItemWithCategory = { item: Item; category: Category }
export type ResolvedItem = ItemWithCategory & { variant: Variant }

// Separate indexes: "dips" is both a category id and an add-on group id.
const categoriesById = new Map(menu.categories.map((c) => [c.id, c]))
const addOnGroupsById = new Map(menu.addOnGroups.map((g) => [g.id, g]))
const itemsById = new Map<string, ItemWithCategory>(
  menu.categories.flatMap((category) =>
    category.items.map((item) => [item.id, { item, category }] as const),
  ),
)

export function getCategory(id: string): Category | undefined {
  return categoriesById.get(id)
}

export function getFeaturedCategory(): Category | undefined {
  return menu.categories.find((c) => c.featured)
}

/** Item ids are unique across the menu, so no category id is needed. */
export function findItem(itemId: string): ItemWithCategory | undefined {
  return itemsById.get(itemId)
}

/** Splits a category's items by `group`, keeping file order. */
export function groupItems(category: Category) {
  return {
    ungrouped: category.items.filter((i) => !i.group),
    sides: category.items.filter((i) => i.group === "sides"),
    drinks: category.items.filter((i) => i.group === "drinks"),
  }
}

export function getVariantType(
  item: Item,
  category: Category,
): VariantType | undefined {
  return item.variantType ?? category.variantType
}

export function getVariant(item: Item, variantId: string): Variant | undefined {
  return item.variants.find((v) => v.id === variantId)
}

/** The first variant; not always `small` for pizzas. */
export function getDefaultVariant(item: Item): Variant {
  return item.variants[0]
}

export function getSizeLabel(sizeId: string): string | undefined {
  return menu.sizes.find((s) => s.id === sizeId)?.label
}

export function getVariantLabel(
  item: Item,
  category: Category,
  variant: Variant,
): string {
  const sizeLabel =
    getVariantType(item, category) === "size"
      ? getSizeLabel(variant.id)
      : undefined
  return sizeLabel ?? variant.label ?? variant.id
}

export function getDisplayName(item: Item, variant?: Variant): string {
  return variant?.name ?? item.name
}

export function getDisplayDescription(
  item: Item,
  variant?: Variant,
): string | undefined {
  return (variant?.description ?? item.description) || undefined
}

/** Variant image, then item image, then category image. */
export function getImage(
  category: Category,
  item: Item,
  variant?: Variant,
): string {
  return variant?.image ?? item.image ?? category.image
}

/** Item tags plus the variant's tags. Without a variant, item tags only. */
export function getTags(item: Item, variant?: Variant): Tag[] {
  return [...new Set([...(item.tags ?? []), ...(variant?.tags ?? [])])]
}

export function getLowestPrice(item: Item) {
  const prices = item.variants.map((v) => v.price)
  return {
    price: Math.min(...prices),
    hasMultiplePrices: new Set(prices).size > 1,
  }
}

export function getAddOnGroup(id: string): AddOnGroup | undefined {
  return addOnGroupsById.get(id)
}

// Unknown ids are skipped, so a typo in the data cannot crash a page.
function resolveAddOnGroups(ids: string[]): AddOnGroup[] {
  return [...new Set(ids)]
    .map((id) => addOnGroupsById.get(id))
    .filter((group) => group !== undefined)
}

/** Add-on groups attached to the item and to its category. */
export function getItemAddOnGroups(
  item: Item,
  category: Category,
): AddOnGroup[] {
  return resolveAddOnGroups([
    ...(item.addOnGroups ?? []),
    ...(category.addOnGroups ?? []),
  ])
}

export function getComboAddOnGroups(combo: Combo): AddOnGroup[] {
  return resolveAddOnGroups(combo.addOnGroups ?? [])
}

export function resolveItemRef(ref: ItemRef): ResolvedItem | undefined {
  const found = findItem(ref.itemId)
  if (!found) return undefined
  const variant = getVariant(found.item, ref.variantId)
  if (!variant) return undefined
  return { ...found, variant }
}

export function getCombo(id: string): Combo | undefined {
  return menu.combos.find((c) => c.id === id)
}

/** One slot of a combo with its item refs resolved against the menu. */
export type ComboStep =
  | { kind: "options"; slot: ComboSlot; options: ResolvedItem[] }
  | { kind: "fixed"; slot: ComboSlot; resolved: ResolvedItem }

/**
 * A combo's slots in file order. A ref the menu no longer has is skipped;
 * undefined when that leaves nothing to build or a choice with no options.
 */
export function getComboSteps(combo: Combo): ComboStep[] | undefined {
  const steps: ComboStep[] = []
  for (const slot of combo.slots) {
    if (slot.fixed) {
      const resolved = resolveItemRef(slot.fixed)
      if (resolved) steps.push({ kind: "fixed", slot, resolved })
      continue
    }
    const options = slot.options
      .map((ref) => resolveItemRef(ref))
      .filter((option) => option !== undefined)
    if (options.length === 0) return undefined
    steps.push({ kind: "options", slot, options })
  }
  return steps.length > 0 ? steps : undefined
}

/** Combos built only from this category's items, so its section shows them. */
export function getCategoryCombos(category: Category): Combo[] {
  return menu.combos.filter((combo) =>
    getComboSteps(combo)?.every((step) =>
      (step.kind === "fixed" ? [step.resolved] : step.options).every(
        (resolved) => resolved.category.id === category.id,
      ),
    ),
  )
}

export function getDeal(id: string): Deal | undefined {
  return menu.deals.find((d) => d.id === id)
}

/** Pizzas in the line's `from` categories that are sold in the line's `size`. */
export function getDealPizzaOptions(line: DealPizzaLine): ResolvedItem[] {
  return line.from.flatMap((categoryId) => {
    const category = getCategory(categoryId)
    if (!category) return []
    return category.items.flatMap((item) => {
      const variant = getVariant(item, line.size)
      return variant ? [{ item, category, variant }] : []
    })
  })
}

export function getSoftDrinkOptions(): string[] {
  return menu.softDrinks.options
}

/** Contact values with the "TBD" placeholder removed. */
export function getContactDetails() {
  const { address, whatsapp, phone, hours } = menu.restaurant
  return {
    address: tbdSafe(address),
    whatsapp: tbdSafe(whatsapp),
    phone: tbdSafe(phone),
    hours: tbdSafe(hours),
  }
}
