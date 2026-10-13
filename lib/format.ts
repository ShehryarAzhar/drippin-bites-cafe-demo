// Fixed locale, so the server and every browser group digits the same way.
const priceFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
})

/** PKR integer to display text, e.g. 1599 -> "Rs. 1,599". */
export function formatPrice(amount: number): string {
  return `Rs. ${priceFormatter.format(amount)}`
}

/** Splits a name for the two-colour heading: the last word is the gold line. */
export function splitName(name: string): { lead: string; accent?: string } {
  const lastSpace = name.lastIndexOf(" ")
  if (lastSpace === -1) return { lead: name }
  return { lead: name.slice(0, lastSpace), accent: name.slice(lastSpace + 1) }
}

/** Returns the trimmed value, or undefined when it is empty or the "TBD" placeholder. */
export function tbdSafe(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed || trimmed.toLowerCase() === "tbd") return undefined
  return trimmed
}
