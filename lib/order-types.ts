import type { OrderType } from "@/types/menu"

/** How each order type reads to a customer. */
export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  delivery: "Delivery",
  takeaway: "Takeaway",
  "dine-in": "Dine-in",
}
