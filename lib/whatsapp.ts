// The literal reference is what Next inlines into the bundle, at build time:
// a new value needs a dev restart or a rebuild (a redeploy on Vercel).
const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

// International format, digits only: country code first, never a leading 0.
const NUMBER_PATTERN = /^[1-9]\d{9,14}$/

/**
 * The number checkout sends orders to, as digits, or undefined when the env
 * var is missing or not a usable international number.
 */
export function getWhatsAppNumber(): string | undefined {
  const digits = rawNumber?.trim().replace(/[\s-]/g, "").replace(/^\+/, "")
  return digits && NUMBER_PATTERN.test(digits) ? digits : undefined
}

/** A wa.me link that opens a chat with the text ready to send. */
export function buildWhatsAppUrl(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
