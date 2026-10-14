"use client"

import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef } from "react"

import { BrandHeading } from "@/components/brand/brand-heading"
import { GoldRule } from "@/components/brand/gold-rule"
import { buttonVariants } from "@/components/ui/button"

/** Shown once the customer says the order went out; the cart is already clear. */
function OrderSent() {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section
      aria-labelledby="order-sent-heading"
      className="flex flex-col items-center justify-center gap-5 py-6 text-center"
    >
      <div className="relative grid size-36 place-items-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--gold)_28%,transparent),transparent)]"
        />
        <span
          aria-hidden="true"
          className="relative grid size-20 place-items-center rounded-full bg-background/60 text-primary ring-1 ring-gold/60"
        >
          <CheckCircle2 className="size-10" />
        </span>
      </div>
      <GoldRule className="max-w-40 sm:max-w-40" />
      <BrandHeading
        id="order-sent-heading"
        ref={headingRef}
        tabIndex={-1}
        size="card"
        lead="Order"
        accent="Sent"
        className="outline-none"
      />
      <p className="max-w-[34ch] text-muted-foreground">
        We&apos;ll confirm your order and delivery charges on WhatsApp.
      </p>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href="/" className={buttonVariants()}>
          Back to Home
        </Link>
        <Link href="/menu" className={buttonVariants({ variant: "outline" })}>
          Browse the Menu
        </Link>
      </div>
    </section>
  )
}

export { OrderSent }
