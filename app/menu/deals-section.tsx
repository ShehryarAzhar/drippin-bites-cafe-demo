import { BrandHeading } from "@/components/brand/brand-heading"
import { GoldRule } from "@/components/brand/gold-rule"
import { PillLabel } from "@/components/brand/pill-label"
import { formatPrice } from "@/lib/format"
import type { Deal } from "@/types/menu"

/** The Deals heading and summary. Spec 14 replaces the summary with deal cards. */
function DealsSection({ deals }: { deals: Deal[] }) {
  const lowestPrice = Math.min(...deals.map((deal) => deal.price))

  return (
    <section
      id="deals"
      aria-labelledby="deals-heading"
      data-slot="deals-section"
      className="scroll-mt-[calc(var(--category-bar-height)+1rem)]"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 text-center sm:px-6">
        <div className="reveal-on-scroll flex flex-col items-center gap-5">
          <GoldRule />
          <PillLabel>{deals.length} Deals</PillLabel>
          <BrandHeading as="h2" id="deals-heading" lead="Deals" />
        </div>
        <p className="text-muted-foreground">
          Bundles from {formatPrice(lowestPrice)}
        </p>
      </div>
    </section>
  )
}

export { DealsSection }
