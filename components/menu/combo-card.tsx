import { useId } from "react"

import { BrandHeading } from "@/components/brand/brand-heading"
import { DotGrid } from "@/components/brand/corner-ornaments"
import { PillLabel } from "@/components/brand/pill-label"
import { AddButton } from "@/components/customizer/add-button"
import { PriceTag } from "@/components/menu/price-tag"
import { ProductImage } from "@/components/menu/product-image"
import { formatPrice, splitName } from "@/lib/format"
import type { Combo } from "@/types/menu"

/**
 * A combo on the menu: a dark poster card, set apart from the cream dish
 * cards. Its Build button's tap area covers the whole card.
 */
function ComboCard({ combo }: { combo: Combo }) {
  const headingId = useId()

  return (
    // The reveal and the hover lift both move `translate`, so they sit on
    // separate elements.
    <div className="reveal-on-scroll">
      <article
        data-slot="combo-card"
        aria-labelledby={headingId}
        // Positioned and isolated: the Build button stretches its tap area to
        // this box, above everything else in the card.
        className="relative isolate flex flex-col overflow-hidden rounded-xl bg-secondary/60 shadow-xl ring-1 shadow-black/40 ring-gold/40 transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/60 active:translate-y-0 md:grid md:grid-cols-[2fr_3fr]"
      >
        <ProductImage
          src={combo.image}
          alt=""
          sizes="(min-width: 72rem) 440px, (min-width: 48rem) 40vw, 100vw"
          className="aspect-16/10 w-full md:aspect-auto md:h-full md:min-h-64"
        />
        <div className="relative flex flex-col items-start gap-3 p-5 md:justify-center md:gap-4 md:p-8 lg:p-10">
          {/* Warm light from the photo's side, and a dot grid in the corner. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_90%_at_0%_50%,color-mix(in_oklab,var(--gold)_14%,transparent)_0%,transparent_100%)]"
          />
          <DotGrid className="absolute top-4 right-4 -z-10 size-20 mask-[linear-gradient(to_bottom_left,black,transparent_75%)]" />
          <PillLabel>Combo</PillLabel>
          <BrandHeading
            as="h3"
            id={headingId}
            size="card"
            align="start"
            className="md:heading-section"
            {...splitName(combo.name)}
          />
          {combo.description ? (
            <p className="text-muted-foreground">{combo.description}</p>
          ) : null}
          {combo.upgrades.length > 0 ? (
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
              {combo.upgrades.map((upgrade) => (
                <li key={upgrade.id} className="flex items-center gap-2 text-sm">
                  <span className="rounded-sm bg-brand-red px-1.5 py-0.5 text-[0.6875rem] leading-tight font-bold tracking-[0.12em] text-white uppercase">
                    {upgrade.label}
                  </span>
                  <span className="font-semibold whitespace-nowrap tabular-nums">
                    + {formatPrice(upgrade.price)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-1 flex w-full items-center justify-between gap-3 md:w-auto md:justify-start md:gap-5">
            {/* A cream edge: navy alone fades into the dark card. */}
            <PriceTag amount={combo.price} className="ring-1 ring-cream/30" />
            <AddButton comboId={combo.id} name={combo.name} surface="dark" />
          </div>
        </div>
      </article>
    </div>
  )
}

export { ComboCard }
