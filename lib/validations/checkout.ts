import { z } from "zod"

import { menu } from "@/lib/menu"
import { ORDER_TYPE_LABELS } from "@/lib/order-types"

/** Longest values the form accepts; the inputs' `maxLength` uses the same. */
export const CHECKOUT_LIMITS = {
  name: 60,
  address: 200,
  notes: 300,
} as const

const ADDRESS_MIN = 10

const { orderTypes } = menu.restaurant

/** "a, b or c" */
function joinOr(words: string[]): string {
  if (words.length < 2) return words.join("")
  return `${words.slice(0, -1).join(", ")} or ${words[words.length - 1]}`
}

const orderTypeMessage = `Choose ${joinOr(
  orderTypes.map((type) => ORDER_TYPE_LABELS[type].toLowerCase())
)}.`

// Pakistani mobiles only: 03xxxxxxxxx, or the same number as +92 / 92.
const MOBILE_PATTERN = /^(?:0|\+?92)3\d{9}$/

const phone = z
  .string()
  .trim()
  .min(1, "Enter your phone number.")
  .transform((value) => value.replace(/[\s-]/g, ""))
  .pipe(
    z
      .string()
      .regex(MOBILE_PATTERN, "Enter a mobile number like 03001234567.")
  )
  // The 10 digits after the leading 0 or 92, always as 923xxxxxxxxx.
  .transform((value) => `92${value.slice(-10)}`)

export const checkoutSchema = z
  .object({
    orderType: z.literal(orderTypes, { error: orderTypeMessage }),
    name: z
      .string()
      .trim()
      .min(2, "Enter your name.")
      .max(CHECKOUT_LIMITS.name, "Name is too long."),
    phone,
    address: z.string().trim().max(CHECKOUT_LIMITS.address),
    notes: z
      .string()
      .trim()
      .max(
        CHECKOUT_LIMITS.notes,
        `Keep notes under ${CHECKOUT_LIMITS.notes} characters.`
      ),
  })
  .superRefine(
    (values, ctx) => {
      if (values.orderType !== "delivery") return
      if (values.address.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["address"],
          message: "Enter your delivery address.",
        })
      } else if (values.address.length < ADDRESS_MIN) {
        ctx.addIssue({
          code: "custom",
          path: ["address"],
          message: "Add a bit more detail so the rider can find you.",
        })
      }
    },
    {
      // Runs even when the name or phone is wrong, so every error shows on
      // the same submit; skipped only when the two fields it reads failed.
      when: (payload) =>
        !payload.issues.some(
          (issue) =>
            issue.path?.[0] === "orderType" || issue.path?.[0] === "address"
        ),
    }
  )
  // Address only for delivery; notes only when there are some.
  .transform(({ address, notes, ...details }) => ({
    ...details,
    ...(details.orderType === "delivery" ? { address } : {}),
    ...(notes ? { notes } : {}),
  }))

/** What the form holds while the customer types. */
export type CheckoutFormValues = z.input<typeof checkoutSchema>

/** The parsed, normalised order details a valid submit hands on. */
export type CheckoutDetails = z.infer<typeof checkoutSchema>
