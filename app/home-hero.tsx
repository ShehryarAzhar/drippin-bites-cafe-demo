import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { BrandHeading } from "@/components/brand/brand-heading"
import { DotGrid, PalmShadow, WaveLines } from "@/components/brand/corner-ornaments"
import { PillLabel } from "@/components/brand/pill-label"
import { ProductImage } from "@/components/menu/product-image"
import { buttonVariants } from "@/components/ui/button"
import { splitName } from "@/lib/format"
import { getFeaturedCategory, menu } from "@/lib/menu"

const headingId = "home-hero-heading"

/**
 * The home page's poster: the featured line's name, its photo on a gold glow
 * and the way into the menu. Without a featured category it carries the
 * cafe's own name instead.
 */
function HomeHero() {
  const category = getFeaturedCategory()
  const { name, shortName, tagline } = menu.restaurant

  const heading = category
    ? { lead: category.name, accent: "Has Landed" }
    : splitName(name)
  const supportingLine = category ? category.tagline : tagline

  return (
    <section
      aria-labelledby={headingId}
      data-slot="home-hero"
      // Clipped sideways only: the glow is wider than a phone, and may spill
      // past the band's top and bottom.
      className="relative isolate overflow-x-clip"
    >
      {/* A warmer brown low in the band, see-through so the page's vignette
          and grain still show. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-transparent via-secondary/70 via-70% to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <DotGrid className="absolute top-2 left-1.5 size-10 opacity-80 sm:top-5 sm:left-6 sm:h-12 sm:w-16 xl:top-10 xl:left-10" />
        {/* A phone has no free corner for it: it would sit behind the label. */}
        <PalmShadow className="absolute -top-8 -right-8 hidden w-72 sm:block xl:w-104" />
        <WaveLines className="absolute bottom-0 left-0 w-28 sm:w-52 xl:w-64" />
        <DotGrid className="absolute right-10 bottom-10 hidden h-12 w-16 opacity-80 md:block" />
      </div>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
      />

      <div className="mx-auto grid max-w-6xl justify-items-center px-4 pt-6 pb-12 sm:px-6 sm:pt-10 xl:min-h-140 xl:grid-cols-[auto_1fr] xl:items-center xl:gap-6 xl:py-10">
        <div className="flex flex-col items-center gap-4 text-center xl:items-start xl:gap-5 xl:text-start">
          {category?.subtitle ? (
            <PillLabel variant="ticket" className="hero-rise">
              {category.subtitle}
            </PillLabel>
          ) : null}
          <BrandHeading
            as="h1"
            id={headingId}
            size="hero"
            className="hero-rise whitespace-nowrap [animation-delay:70ms] xl:text-start"
            {...heading}
          />
          {supportingLine ? (
            <p className="hero-rise text-lg text-foreground/80 [animation-delay:140ms]">
              {supportingLine}
            </p>
          ) : null}
          {/* The entrance and the button's press both move `translate`, so
              they sit on separate elements. */}
          <div className="hero-rise mt-1 [animation-delay:210ms]">
            <Link href="/menu" className={buttonVariants({ size: "lg" })}>
              Order Now
              <ArrowRight
                aria-hidden="true"
                data-icon="inline-end"
                className="transition-transform duration-200 group-hover/button:translate-x-1"
              />
            </Link>
          </div>
        </div>

        {/* The photo's clear margin overlaps the button above it, so the box
            takes no taps. */}
        <div className="pointer-events-none relative -mt-14 flex sm:-mt-20 w-[80vw] max-w-105 flex-col items-center xl:mt-0 xl:w-130 xl:max-w-none xl:justify-self-end">
          <span
            aria-hidden="true"
            className="absolute -inset-[28%] -z-10 bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--gold)_48%,transparent)_0%,color-mix(in_oklab,var(--gold)_26%,transparent)_42%,color-mix(in_oklab,var(--gold)_8%,transparent)_72%,transparent_100%)]"
          />
          <div className="hero-settle aspect-square w-full">
            <ProductImage
              stage={false}
              src={category?.image}
              alt=""
              sizes="(min-width: 80rem) 520px, (min-width: 40rem) 420px, 80vw"
              loading="eager"
              fetchPriority="high"
              className="size-full"
            />
          </div>
          <PillLabel sparkles className="-mt-10 sm:-mt-14 xl:-mt-22">
            Now at {shortName}
          </PillLabel>
        </div>
      </div>
    </section>
  )
}

export { HomeHero }
