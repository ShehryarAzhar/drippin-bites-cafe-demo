import { DELIVERY_NOTE } from "@/lib/cart/copy"
import { formatPrice } from "@/lib/format"
import { menu } from "@/lib/menu"
import { ORDER_TYPE_LABELS } from "@/lib/order-types"
import type { CheckoutDetails } from "@/lib/validations/checkout"
import type { LineDetail, LineSummary } from "@/types/cart"

const DETAIL_INDENT = "   "

/** "923001234567" → "+92 300 1234567". */
export function formatPhoneForDisplay(phone: string): string {
  const match = /^92(\d{3})(\d{7})$/.exec(phone)
  return match ? `+92 ${match[1]} ${match[2]}` : `+${phone}`
}

function formatDetail(detail: LineDetail): string {
  let text = `${DETAIL_INDENT}- `
  if (detail.quantity !== undefined) text += `${detail.quantity} × `
  text += detail.label
  if (detail.choices?.length) text += `: ${detail.choices.join(", ")}`
  if (detail.price === 0) text += ": Free"
  else if (detail.price !== undefined) text += `: + ${formatPrice(detail.price)}`
  return text
}

function formatLine(summary: LineSummary): string[] {
  const variant =
    summary.hasMultipleVariants && summary.variantLabel
      ? ` (${summary.variantLabel})`
      : ""
  return [
    `${summary.quantity} × ${summary.title}${variant}: ${formatPrice(summary.lineTotal)}`,
    ...summary.details.map(formatDetail),
  ]
}

// The customer's own line breaks stay, each continuation under the label.
function labelled(label: string, value: string): string {
  const pad = " ".repeat(label.length + 2)
  return `${label}: ${value.split(/\r?\n/).join(`\n${pad}`)}`
}

type OrderMessageInput = {
  summaries: LineSummary[]
  subtotal: number
  details: CheckoutDetails
}

/**
 * The plain-text order the customer sends on WhatsApp: header, order type,
 * lines with their details, subtotal, delivery note, then who it is for.
 */
export function buildOrderMessage({
  summaries,
  subtotal,
  details,
}: OrderMessageInput): string {
  const customer = [
    labelled("Name", details.name),
    labelled("Phone", formatPhoneForDisplay(details.phone)),
  ]
  if (details.address) customer.push(labelled("Address", details.address))
  if (details.notes) customer.push(labelled("Notes", details.notes))

  const blocks = [
    [`*New order: ${menu.restaurant.name}*`],
    [`Order type: ${ORDER_TYPE_LABELS[details.orderType]}`],
    summaries.flatMap(formatLine),
    [`Subtotal: ${formatPrice(subtotal)}`, DELIVERY_NOTE],
    customer,
  ]
  return blocks.map((lines) => lines.join("\n")).join("\n\n")
}
