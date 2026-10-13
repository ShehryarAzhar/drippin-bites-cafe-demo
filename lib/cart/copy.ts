/** Shown wherever a total is: the delivery fee is not known to the site. */
export const DELIVERY_NOTE = "Delivery charges confirmed on WhatsApp"

/** "1 item", "5 items". */
export function formatItemCount(count: number): string {
  return `${count} ${count === 1 ? "item" : "items"}`
}
