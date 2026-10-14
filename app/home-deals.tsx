import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { BrandHeading } from "@/components/brand/brand-heading"
import { GoldRule } from "@/components/brand/gold-rule"
import { PillLabel } from "@/components/brand/pill-label"
import { DealCard } from "@/components/menu/deal-card"
import { buttonVariants } from "@/components/ui/button"
import { getBuildableDeals } from "@/lib/menu"
import { cn } from "@/lib/utils"

const headingId = "home-deals-heading"
const previewCount = 3

/** The first few deals, orderable here, and the way to the rest. */
function HomeDeals() {
  const deals = getBuildableDeals()
  if (deals.length === 0) return null
  const preview = deals.slice(0, previewCount)

  return (
    <section
      id="deals"
      aria-labelledby={headingId}
      data-slot="home-deals"
      className="pb-14 md:pb-22"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="reveal-on-scroll flex flex-col items-center gap-5 text-center">
          <GoldRule />
          <PillLabel>{deals.length} Deals</PillLabel>
          <BrandHeading as="h2" id={headingId} lead="Bundle" accent="Deals" />
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 md:mt-10 lg:grid-cols-3 lg:gap-6">
          {preview.map((deal, index) => (
            // Two columns leave the third card alone on its row: it waits for
            // three columns, hidden from everyone until then.
            <li key={deal.id} className={cn(index === 2 && "sm:max-lg:hidden")}>
              <DealCard deal={deal} />
            </li>
          ))}
        </ul>

        <div className="mt-8 flex justify-center">
          <Link
            href="/menu#deals"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            See all {deals.length} deals
            <ArrowRight
              aria-hidden="true"
              data-icon="inline-end"
              className="transition-transform duration-200 group-hover/button:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}

export { HomeDeals }
