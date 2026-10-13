import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { BrandHeading } from "@/components/brand/brand-heading"
import { GoldRule } from "@/components/brand/gold-rule"
import { ComboCard } from "@/components/menu/combo-card"
import { ItemCard } from "@/components/menu/item-card"
import { buttonVariants } from "@/components/ui/button"
import {
  getCategoryCombos,
  getFeaturedCategory,
  getVariantLabel,
  getVersionItems,
} from "@/lib/menu"
import { cn } from "@/lib/utils"
import { versionColors } from "@/lib/version-colors"

const headingId = "home-cairo-feature-heading"

/**
 * The featured line on the home page: the dishes sold in two versions, the
 * combo built from them, and the way to the rest of the menu.
 */
function HomeCairoFeature() {
  const category = getFeaturedCategory()
  if (!category) return null
  const items = getVersionItems(category)
  if (items.length === 0) return null
  const combos = getCategoryCombos(category)

  return (
    <section
      id={category.id}
      aria-labelledby={headingId}
      data-slot="home-cairo-feature"
      className="py-14 md:py-22"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="reveal-on-scroll flex flex-col items-center gap-5 text-center">
          <GoldRule />
          <BrandHeading as="h2" id={headingId} lead="The" accent="Line-up" />
          <p className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 text-muted-foreground">
            {/* On a phone the sentence takes its own line, the tags the next. */}
            <span className="w-full sm:w-auto">Every dish, two ways.</span>
            {items[0].variants.map((variant) => (
              <span
                key={variant.id}
                className={cn(
                  // A cream edge: navy alone fades into the dark page.
                  "rounded-sm px-2 py-1 text-xs leading-tight font-bold tracking-wide uppercase ring-1 ring-cream/30",
                  versionColors[variant.id] ??
                    "bg-secondary text-secondary-foreground"
                )}
              >
                {getVariantLabel(items[0], category, variant)}
              </span>
            ))}
          </p>
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 md:mt-10 lg:grid-cols-4 lg:gap-6">
          {items.map((item) => (
            <li key={item.id}>
              <ItemCard item={item} category={category} />
            </li>
          ))}
        </ul>

        {combos.length > 0 ? (
          <ul className="mt-5 grid gap-5 lg:mt-6 lg:gap-6">
            {combos.map((combo) => (
              <li key={combo.id}>
                <ComboCard combo={combo} />
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-8 flex justify-center">
          <Link
            href="/menu"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            See the full menu
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

export { HomeCairoFeature }
