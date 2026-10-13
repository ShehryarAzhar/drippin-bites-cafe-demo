import { useId } from "react"

import { BrandHeading } from "@/components/brand/brand-heading"
import { PillLabel } from "@/components/brand/pill-label"
import { AddButton } from "@/components/customizer/add-button"
import { PriceTag } from "@/components/menu/price-tag"
import { ProductImage } from "@/components/menu/product-image"
import { splitName } from "@/lib/format"
import type { Deal } from "@/types/menu"

/**
 * A deal on the menu: a dark poster card like the combo's, listing everything
 * in the bundle. Its Add button's tap area covers the whole card.
 */
function DealCard({ deal }: { deal: Deal }) {
  const headingId = useId()

  return (
    // The reveal and the hover lift both move `translate`, so they sit on
    // separate elements.
    <div className="reveal-on-scroll h-full">
      <article
        data-slot="deal-card"
        aria-labelledby={headingId}
        // Positioned and isolated: the Add button stretches its tap area to
        // this box, above everything else in the card.
        className="relative isolate flex h-full flex-col overflow-hidden rounded-xl bg-secondary/60 shadow-xl ring-1 shadow-black/40 ring-gold/40 transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/60 active:translate-y-0"
      >
        <ProductImage
          src={deal.image}
          alt=""
          sizes="(min-width: 72rem) 368px, (min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw"
          className="aspect-4/3 w-full"
        />
        <div className="relative flex flex-1 flex-col items-start gap-3 p-5">
          {/* Warm light from the photo above, and a dot grid in the corner. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_70%_at_50%_0%,color-mix(in_oklab,var(--gold)_14%,transparent)_0%,transparent_100%)]"
          />
          <span
            aria-hidden="true"
            className="absolute top-4 right-4 -z-10 size-20 bg-[radial-gradient(circle,color-mix(in_oklab,var(--gold)_55%,transparent)_1px,transparent_1.5px)] bg-size-[10px_10px] mask-[linear-gradient(to_bottom_left,black,transparent_75%)]"
          />
          <PillLabel className="h-7 px-3.5 sm:text-xs sm:tracking-[0.18em]">
            Deal {deal.number}
          </PillLabel>
          <BrandHeading
            as="h3"
            id={headingId}
            size="card"
            align="start"
            className="wrap-break-word"
            {...splitName(deal.name)}
          />
          {/* Everything in the bundle, never cut short: it is what they buy. */}
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            {deal.contents.map((line, index) => (
              <li key={index}>
                {line.qty > 1 ? (
                  <span className="font-semibold text-foreground tabular-nums">
                    {line.qty} ×{" "}
                  </span>
                ) : null}
                {line.label}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex w-full items-center justify-between gap-3 pt-1">
            {/* A cream edge: navy alone fades into the dark card. */}
            <PriceTag amount={deal.price} className="ring-1 ring-cream/30" />
            <AddButton dealId={deal.id} name={deal.name} surface="dark" />
          </div>
        </div>
      </article>
    </div>
  )
}

export { DealCard }
