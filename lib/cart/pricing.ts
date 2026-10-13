import { getSelectionAddOnGroups } from "@/lib/cart/line"
import { getCombo, getDeal, resolveItemRef } from "@/lib/menu"
import type { CartLine, CartSelection } from "@/types/cart"
import type { AddOnGroup, AddOnOption } from "@/types/menu"

export type PricedAddOn = { option: AddOnOption; price: number }

/**
 * Prices one group's chosen options, in the group's own order. The first
 * `freeCount` are free; the rest cost their own price, else `extraPrice`.
 */
export function priceAddOnGroup(
  group: AddOnGroup,
  optionIds: string[],
): PricedAddOn[] {
  return group.options
    .filter((option) => optionIds.includes(option.id))
    .map((option, index) => ({
      option,
      price:
        index < group.freeCount ? 0 : (option.price ?? group.extraPrice ?? 0),
    }))
}

/** Every chosen add-on of a selection with its price, in menu order. */
export function priceAddOns(selection: CartSelection): PricedAddOn[] {
  if (selection.kind === "deal") return []
  return getSelectionAddOnGroups(selection).flatMap((group) => {
    const chosen = selection.addOns.find((a) => a.groupId === group.id)
    return chosen ? priceAddOnGroup(group, chosen.optionIds) : []
  })
}

function getBasePrice(selection: CartSelection): number {
  switch (selection.kind) {
    case "item":
      return resolveItemRef(selection)?.variant.price ?? 0
    case "combo": {
      const combo = getCombo(selection.comboId)
      if (!combo) return 0
      // The chosen main does not change the price; only upgrades do.
      const upgrades = combo.upgrades
        .filter((upgrade) => selection.upgradeIds.includes(upgrade.id))
        .reduce((sum, upgrade) => sum + upgrade.price, 0)
      return combo.price + upgrades
    }
    case "deal":
      return getDeal(selection.dealId)?.price ?? 0
  }
}

/** Price of one unit, add-ons included, in PKR. */
export function getUnitPrice(selection: CartSelection): number {
  const addOns = priceAddOns(selection).reduce((sum, a) => sum + a.price, 0)
  return getBasePrice(selection) + addOns
}

/** Add-ons are per unit, so they multiply with the quantity too. */
export function getLineTotal(line: CartLine): number {
  return getUnitPrice(line) * line.quantity
}

export function getSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + getLineTotal(line), 0)
}

export function getItemCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}
