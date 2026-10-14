import { BrandHeading } from "@/components/brand/brand-heading"
import { GoldRule } from "@/components/brand/gold-rule"
import { PillLabel } from "@/components/brand/pill-label"
import { DealCard } from "@/components/menu/deal-card"
import type { Deal } from "@/types/menu"

/** The Deals heading and a card for every deal that can be ordered. */
function DealsSection({ deals }: { deals: Deal[] }) {
  return (
    <section
      id="deals"
      aria-labelledby="deals-heading"
      data-slot="deals-section"
      className="scroll-mt-[calc(var(--category-bar-height)+1rem)]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="reveal-on-scroll flex flex-col items-center gap-5 text-center">
          <GoldRule />
          <PillLabel>{deals.length} Deals</PillLabel>
          <BrandHeading as="h2" id="deals-heading" lead="Deals" />
        </div>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 md:mt-10 lg:grid-cols-3 lg:gap-6">
          {deals.map((deal) => (
            <li key={deal.id}>
              <DealCard deal={deal} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export { DealsSection }
