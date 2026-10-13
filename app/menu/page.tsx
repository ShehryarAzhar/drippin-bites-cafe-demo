import type { Metadata } from "next"

import { BrandHeading } from "@/components/brand/brand-heading"
import { PillLabel } from "@/components/brand/pill-label"
import { getBuildableDeals, getFeaturedCategory, menu } from "@/lib/menu"
import { cn } from "@/lib/utils"

import { CategoryBar, type CategoryBarEntry } from "./category-bar"
import { CategorySection } from "./category-section"
import { DealsSection } from "./deals-section"

const featured = getFeaturedCategory()

export const metadata: Metadata = {
  title: "Menu",
  description: `The full ${menu.restaurant.name} menu${
    featured ? `, starting with ${featured.name}` : ""
  }.`,
}

export default function MenuPage() {
  const categories = menu.categories.filter(
    (category) => category.items.length > 0
  )
  const deals = getBuildableDeals()
  const hasDeals = deals.length > 0

  const entries: CategoryBarEntry[] = categories.map((category) => ({
    id: category.id,
    label: category.name,
    kind: category.id === featured?.id ? "featured" : "category",
  }))
  if (hasDeals) entries.push({ id: "deals", label: "Deals", kind: "deals" })

  return (
    <>
      <div className="flex flex-col items-center gap-4 px-4 pt-6 pb-5 text-center sm:px-6">
        <PillLabel sparkles>{menu.restaurant.area}</PillLabel>
        <BrandHeading as="h1" lead="The" accent="Menu" />
      </div>

      <CategoryBar entries={entries} />

      {/* The featured band brings its own top padding; a plain first section needs some. */}
      <div
        className={cn(
          "flex flex-col gap-14 pb-16 md:gap-22 md:pb-24",
          categories[0]?.id !== featured?.id && "pt-14 md:pt-22"
        )}
      >
        {categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            featured={category.id === featured?.id}
          />
        ))}
        {hasDeals ? <DealsSection deals={deals} /> : null}
      </div>
    </>
  )
}
