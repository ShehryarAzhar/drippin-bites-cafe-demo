import { priceAddOnGroup } from "@/lib/cart/pricing"
import { formatPrice } from "@/lib/format"
import type { AddOnGroup } from "@/types/menu"

/** Shown wherever a total is: the delivery fee is not known to the site. */
export const DELIVERY_NOTE = "Delivery charges confirmed on WhatsApp"

/** "1 item", "5 items". */
export function formatItemCount(count: number): string {
  return `${count} ${count === 1 ? "item" : "items"}`
}

/** "1 free", "2 free": how many of a group's options cost nothing. */
export function formatFreeAllowance(freeCount: number): string {
  return `${freeCount} free`
}

/**
 * One line stating how an add-on group charges, e.g. "1 free, then Rs. 70
 * each". Undefined when the options' own prices already say it.
 */
export function getAddOnRule(group: AddOnGroup): string | undefined {
  if (group.freeCount < 1) return undefined
  // Nothing past the free ones can be chosen, so nothing can cost.
  const mostChosen = Math.min(group.maxSelect, group.options.length)
  if (group.freeCount >= mostChosen) return "Included"
  if (group.extraPrice) {
    return `${formatFreeAllowance(group.freeCount)}, then ${formatPrice(group.extraPrice)} each`
  }
  return group.options.every((o) => !o.price) ? "Included" : undefined
}

/** `accent` for something free, `muted` for a hint, `plain` for a cost. */
export type AddOnStatus = { text: string; tone: "accent" | "muted" | "plain" }

/** The end of a group's heading row: its hint, or what the chosen ones cost. */
export function getAddOnStatus(
  group: AddOnGroup,
  optionIds: string[],
): AddOnStatus {
  if (optionIds.length === 0) {
    return group.freeCount > 0
      ? { text: formatFreeAllowance(group.freeCount), tone: "accent" }
      : { text: "Optional", tone: "muted" }
  }
  const cost = priceAddOnGroup(group, optionIds).reduce(
    (sum, addOn) => sum + addOn.price,
    0,
  )
  return cost === 0
    ? { text: "Free", tone: "accent" }
    : { text: `+ ${formatPrice(cost)}`, tone: "plain" }
}
