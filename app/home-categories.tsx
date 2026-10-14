import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

import { BrandHeading } from "@/components/brand/brand-heading"
import { GoldRule } from "@/components/brand/gold-rule"
import { ProductImage } from "@/components/menu/product-image"
import { formatPrice } from "@/lib/format"
import { getCategoryLowestPrice, getShortcutCategories } from "@/lib/menu"
import type { Category } from "@/types/menu"

const headingId = "home-categories-heading"

// Two-up on phones, three from `sm`, four from `lg`, inside the 72rem page.
const tileSizes =
  "(min-width: 72rem) 270px, (min-width: 64rem) 25vw, (min-width: 40rem) 33vw, 50vw"

/** One category as a single link into its section of the menu. */
function CategoryTile({ category }: { category: Category }) {
  return (
    <Link
      href={`/menu#${category.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-secondary/60 shadow-lg ring-1 shadow-black/40 ring-gold/25 outline-none transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/60 hover:ring-gold/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0"
    >
      <ProductImage
        src={category.image}
        alt=""
        sizes={tileSizes}
        className="aspect-square w-full"
      />
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg leading-tight tracking-[0.015em] text-balance uppercase sm:text-xl">
            {category.name}
          </h3>
          <ArrowUpRight
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-primary transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:size-5"
          />
        </div>
        <p className="mt-auto text-sm text-muted-foreground">
          From{" "}
          <span className="whitespace-nowrap">
            {formatPrice(getCategoryLowestPrice(category))}
          </span>
        </p>
      </div>
    </Link>
  )
}

/** Every category below the featured line, one tap from its menu section. */
function HomeCategories() {
  const categories = getShortcutCategories()
  if (categories.length === 0) return null

  return (
    <section
      id="categories"
      aria-labelledby={headingId}
      data-slot="home-categories"
      className="pb-14 md:pb-22"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="reveal-on-scroll flex flex-col items-center gap-5 text-center">
          <GoldRule />
          <BrandHeading as="h2" id={headingId} lead="Pick Your" accent="Craving" />
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:mt-10 md:gap-5 lg:grid-cols-4 lg:gap-6">
          {categories.map((category) => (
            <li key={category.id}>
              <CategoryTile category={category} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export { HomeCategories }
