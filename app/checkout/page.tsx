import type { Metadata } from "next"

import { BrandHeading } from "@/components/brand/brand-heading"
import { GoldRule } from "@/components/brand/gold-rule"

import { CheckoutView } from "./checkout-view"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your order and send it to us on WhatsApp.",
}

export default function CheckoutPage() {
  return (
    <div className="px-4 pt-10 pb-16 sm:px-6 md:pt-16 md:pb-24">
      <div className="reveal-on-scroll mx-auto mb-10 flex max-w-xl flex-col items-center gap-4 text-center md:mb-14">
        <GoldRule />
        <BrandHeading as="h1" lead="Place Your" accent="Order" />
        <p className="max-w-[34ch] text-muted-foreground">
          Fill in your details and we&apos;ll take it from here on WhatsApp.
        </p>
      </div>
      <CheckoutView />
    </div>
  )
}
