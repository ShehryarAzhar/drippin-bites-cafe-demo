"use client"

import { Check, ExternalLink, MessageCircle, Pencil } from "lucide-react"
import { useEffect, useRef } from "react"

import { BrandHeading } from "@/components/brand/brand-heading"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { summaryPanel } from "./order-summary"

type SendConfirmationProps = {
  /** The wa.me link that was opened, offered again in case it was blocked. */
  url: string
  onConfirm: () => void
  onEdit: () => void
  className?: string
}

/** After WhatsApp opens: did the customer press Send? Only "yes" clears the cart. */
function SendConfirmation({ url, onConfirm, onEdit, className }: SendConfirmationProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  // The form just disappeared; focus lands here instead of on <body>.
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section
      aria-labelledby="send-confirmation-heading"
      className={cn(
        summaryPanel,
        "items-center gap-5 p-6 text-center sm:p-8",
        // Rises in once, from its first frame; no motion when reduced.
        "translate-y-0 opacity-100 transition-[opacity,translate] duration-200 ease-out starting:translate-y-3 starting:opacity-0 motion-reduce:transition-none",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 -z-10 size-64 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--gold)_14%,transparent),transparent)]"
      />
      <span
        aria-hidden="true"
        className="grid size-16 place-items-center rounded-full bg-background/50 text-primary ring-1 ring-gold/50"
      >
        <MessageCircle className="size-7" />
      </span>
      <BrandHeading
        id="send-confirmation-heading"
        ref={headingRef}
        tabIndex={-1}
        size="card"
        lead="Did You"
        accent="Send It?"
        className="outline-none"
      />
      <p className="max-w-[40ch] text-muted-foreground">
        Your order reaches us only after you press Send in WhatsApp.
      </p>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
        <Button onClick={onConfirm}>
          <Check aria-hidden="true" />
          Yes, I sent it
        </Button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline" })}
        >
          <ExternalLink aria-hidden="true" />
          Open WhatsApp again
          <span className="sr-only">(opens WhatsApp)</span>
        </a>
        <Button variant="ghost" onClick={onEdit}>
          <Pencil aria-hidden="true" />
          Not yet, edit details
        </Button>
      </div>
    </section>
  )
}

export { SendConfirmation }
