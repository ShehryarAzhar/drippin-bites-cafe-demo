import { getUnitPrice, priceAddOns } from "@/lib/cart/pricing"
import {
  findItem,
  getCombo,
  getDeal,
  getDisplayName,
  getImage,
  getVariantLabel,
  resolveItemRef,
} from "@/lib/menu"
import type {
  CartLine,
  ComboSelection,
  DealSelection,
  LineDetail,
  LineSummary,
} from "@/types/cart"
import type { Combo, Deal } from "@/types/menu"

function getAddOnDetails(line: CartLine): LineDetail[] {
  return priceAddOns(line).map(({ option, price }) => ({
    label: option.name,
    price,
  }))
}

// Slots in the combo's order (main, side, drink), then upgrades, then dips.
function getComboDetails(combo: Combo, line: CartLine & ComboSelection) {
  const details: LineDetail[] = []
  for (const slot of combo.slots) {
    const ref = slot.fixed ?? line.slots.find((s) => s.slotId === slot.id)
    const resolved = ref && resolveItemRef(ref)
    if (resolved) {
      details.push({ label: getDisplayName(resolved.item, resolved.variant) })
    }
  }
  for (const upgrade of combo.upgrades) {
    if (line.upgradeIds.includes(upgrade.id)) {
      details.push({ label: upgrade.label, price: upgrade.price })
    }
  }
  return [...details, ...getAddOnDetails(line)]
}

// Every contents line as printed, with the customer's picks under `choose` lines.
function getDealDetails(deal: Deal, line: CartLine & DealSelection) {
  return deal.contents.map((content, index): LineDetail => {
    const detail = { label: content.label, quantity: content.qty }
    if (!content.choose) return detail
    const selections =
      line.choices.find((c) => c.index === index)?.selections ?? []
    const choices =
      content.choose === "pizza"
        ? selections.map((id) => findItem(id)?.item.name ?? id)
        : selections
    return { ...detail, choices }
  })
}

/**
 * Everything a cart row or the order message shows for a line. Prices are PKR
 * integers; undefined when the line no longer matches the menu.
 */
export function getLineSummary(line: CartLine): LineSummary | undefined {
  const unitPrice = getUnitPrice(line)
  const totals = {
    key: line.key,
    kind: line.kind,
    unitPrice,
    lineTotal: unitPrice * line.quantity,
    quantity: line.quantity,
  }

  switch (line.kind) {
    case "item": {
      const resolved = resolveItemRef(line)
      if (!resolved) return undefined
      const { item, category, variant } = resolved
      return {
        ...totals,
        title: getDisplayName(item, variant),
        variantLabel: getVariantLabel(item, category, variant),
        hasMultipleVariants: item.variants.length > 1,
        image: getImage(category, item, variant),
        details: getAddOnDetails(line),
      }
    }
    case "combo": {
      const combo = getCombo(line.comboId)
      if (!combo) return undefined
      return {
        ...totals,
        title: combo.name,
        image: combo.image,
        details: getComboDetails(combo, line),
      }
    }
    case "deal": {
      const deal = getDeal(line.dealId)
      if (!deal) return undefined
      return {
        ...totals,
        title: deal.name,
        image: deal.image,
        details: getDealDetails(deal, line),
      }
    }
  }
}
