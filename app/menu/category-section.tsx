import { BrandHeading } from "@/components/brand/brand-heading"
import { GoldRule } from "@/components/brand/gold-rule"
import { PillLabel } from "@/components/brand/pill-label"
import { ItemCard } from "@/components/menu/item-card"
import { groupItems } from "@/lib/menu"
import { cn } from "@/lib/utils"
import type { Category, Item, ItemGroup } from "@/types/menu"

const groupLabels: Record<ItemGroup, string> = {
  sides: "Sides",
  drinks: "Drinks",
}
const groupOrder: ItemGroup[] = ["sides", "drinks"]

// Three-up at most, inside the 72rem page width.
const stackedSizes =
  "(min-width: 72rem) 368px, (min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw"

/** Splits a name for the two-colour heading: the last word is the gold line. */
function splitName(name: string) {
  const lastSpace = name.lastIndexOf(" ")
  if (lastSpace === -1) return { lead: name }
  return { lead: name.slice(0, lastSpace), accent: name.slice(lastSpace + 1) }
}

function RowGrid({
  items,
  category,
  as,
  className,
}: {
  items: Item[]
  category: Category
  as: "h3" | "h4"
  className?: string
}) {
  return (
    <ul className={cn("grid gap-3 md:gap-4", className)}>
      {items.map((item) => (
        <li key={item.id}>
          <ItemCard item={item} category={category} layout="row" as={as} />
        </li>
      ))}
    </ul>
  )
}

type CategorySectionProps = {
  category: Category
  /** The poster treatment: label, tagline, glow and large cards. */
  featured?: boolean
}

/** One category of the menu: its heading and its item cards. */
function CategorySection({ category, featured = false }: CategorySectionProps) {
  const headingId = `${category.id}-heading`
  const { ungrouped, ...groups } = groupItems(category)
  const subGroups = groupOrder.filter((group) => groups[group].length > 0)

  return (
    <section
      id={category.id}
      aria-labelledby={headingId}
      data-slot="category-section"
      className={cn(
        "scroll-mt-[calc(var(--category-bar-height)+1rem)]",
        featured && "relative isolate py-10 md:py-16"
      )}
    >
      {featured ? (
        <>
          {/* A band of warm light behind the section, not a boxed panel. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_75%_24rem_at_50%_9rem,color-mix(in_oklab,var(--gold)_13%,transparent)_0%,transparent_100%)]"
          />
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 -z-10 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent"
          />
        </>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="reveal-on-scroll flex flex-col items-center gap-5 text-center">
          {featured ? (
            category.subtitle ? (
              <PillLabel variant="ticket">{category.subtitle}</PillLabel>
            ) : null
          ) : (
            <GoldRule />
          )}
          <BrandHeading as="h2" id={headingId} {...splitName(category.name)} />
          {featured && category.tagline ? (
            <p className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
              {category.tagline}
            </p>
          ) : null}
          {featured ? <GoldRule /> : null}
        </div>

        {ungrouped.length > 0 ? (
          featured ? (
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 md:mt-10 lg:grid-cols-3 lg:gap-6">
              {ungrouped.map((item, index) => (
                <li key={item.id}>
                  <ItemCard
                    item={item}
                    category={category}
                    sizes={stackedSizes}
                    loading={index < 2 ? "eager" : undefined}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <RowGrid
              items={ungrouped}
              category={category}
              as="h3"
              className="mt-8 md:mt-10 md:grid-cols-2 xl:grid-cols-3"
            />
          )
        ) : null}

        {subGroups.length > 0 ? (
          <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-6">
            {subGroups.map((group) => (
              <div key={group}>
                <h3 className="flex items-center justify-center gap-3 text-xs font-medium tracking-[0.18em] text-primary uppercase">
                  <span
                    aria-hidden="true"
                    className="h-px w-10 bg-linear-to-r from-transparent to-primary/80"
                  />
                  {groupLabels[group]}
                  <span
                    aria-hidden="true"
                    className="h-px w-10 bg-linear-to-l from-transparent to-primary/80"
                  />
                </h3>
                <RowGrid
                  items={groups[group]}
                  category={category}
                  as="h4"
                  className="mt-4 md:grid-cols-2 lg:grid-cols-1"
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export { CategorySection }
