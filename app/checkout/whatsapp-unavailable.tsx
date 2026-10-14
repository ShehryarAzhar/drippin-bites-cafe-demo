import { MessageCircleOff, Phone } from "lucide-react"

import { getContactDetails } from "@/lib/menu"

/**
 * Takes the submit button's place when no WhatsApp number is configured, so
 * checkout never builds a broken link. Only the phone is offered, when known.
 */
function WhatsAppUnavailable() {
  const { phone } = getContactDetails()

  return (
    <div className="flex gap-4 rounded-2xl bg-secondary/60 p-5 ring-1 ring-destructive/40">
      <MessageCircleOff aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-destructive" />
      <div className="flex flex-col gap-1.5">
        <h3 className="font-semibold">Online ordering isn&apos;t connected yet</h3>
        <p className="text-sm text-muted-foreground">
          Please contact the restaurant directly to place your order.
        </p>
        {phone ? (
          <a
            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
            className="mt-1 inline-flex min-h-11 items-center gap-2 self-start rounded-sm font-semibold text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Phone aria-hidden="true" className="size-4" />
            {phone}
          </a>
        ) : null}
      </div>
    </div>
  )
}

export { WhatsAppUnavailable }
