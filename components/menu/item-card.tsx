import { useId } from "react"

import { AddButton } from "@/components/customizer/add-button"
import { ItemTags } from "@/components/menu/item-tags"
import { PriceTag } from "@/components/menu/price-tag"
import { ProductImage } from "@/components/menu/product-image"
import {
  getDefaultVariant,
  getDisplayDescription,
  getDisplayName,
  getImage,
  getLowestPrice,
  getTags,
  getVariantLabel,
} from "@/lib/menu"
import { canCustomize } from "@/lib/customizer"
import { cn } from "@/lib/utils"
import type { Category, Item, Tag, Variant } from "@/types/menu"

/* Tags for a card that stands for the whole item: the item's own, plus any
   tag every variant carries. A tag on only some variants (veg on the
   Authentic Ful) would mislabel the others, so it is left out. */
function getSharedTags(item: Item): Tag[] {
  const onEveryVariant = (item.variants[0]?.tags ?? []).filter((tag) =>
    item.variants.every((variant) => variant.tags?.includes(tag))
  )
  return [...new Set([...getTags(item), ...onEveryVariant])]
}

const defaultSizes = {
  stacked: "(min-width: 64rem) 25vw, (min-width: 40rem) 50vw, 100vw",
  row: "128px",
}

const smallText = "text-xs text-card-muted-foreground"

type ItemCardProps = {
  item: Item
  category: Category
  /** Show this exact variant instead of the item as a whole. */
  variant?: Variant
  /** `row` is the compact form: image beside the text. */
  layout?: "stacked" | "row"
  /** Heading level, chosen for the document outline. */
  as?: "h2" | "h3" | "h4"
  sizes?: string
  loading?: "lazy" | "eager"
  className?: string
}

/**
 * Menu card. Items the customiser can finish carry an Add button whose tap
 * area covers the whole card; the rest are display-only.
 */
function ItemCard({
  item,
  category,
  variant,
  layout = "stacked",
  as: Heading = "h3",
  sizes,
  loading,
  className,
}: ItemCardProps) {
  const headingId = useId()
  const isRow = layout === "row"
  const canAdd = canCustomize(item, category)
  const shownVariant = variant ?? getDefaultVariant(item)

  const title = variant ? getDisplayName(item, variant) : item.name
  const description = getDisplayDescription(item, shownVariant)
  const tags = variant ? getTags(item, variant) : getSharedTags(item)
  const lowest = getLowestPrice(item)
  const options =
    !variant && item.variants.length > 1
      ? item.variants.map((v) => getVariantLabel(item, category, v)).join(" · ")
      : undefined

  return (
    <article
      data-slot="item-card"
      data-layout={layout}
      aria-labelledby={headingId}
      className={cn(
        // Positioned and isolated: the Add button stretches its tap area to
        // this box, above everything else in the card.
        "relative isolate flex h-full overflow-hidden rounded-xl bg-card text-card-foreground shadow-xl ring-1 shadow-black/40 ring-gold/15",
        !isRow && "flex-col",
        canAdd &&
          "transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/60 active:translate-y-0",
        className
      )}
    >
      <ProductImage
        src={getImage(category, item, shownVariant)}
        alt=""
        sizes={sizes ?? defaultSizes[layout]}
        loading={loading}
        className={
          isRow ? "w-28 shrink-0 self-stretch sm:w-32" : "aspect-4/3 w-full"
        }
      />
      {/* Stacked: the tags sit centred on the stage/body seam, out of the text
          flow so titles line up across cards with and without tags. */}
      {isRow ? null : (
        <div className="relative h-0">
          <ItemTags
            tags={tags}
            className="absolute top-0 left-4 z-10 -translate-y-1/2 sm:left-5"
          />
        </div>
      )}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          isRow ? "p-3 sm:p-4" : "p-4 pt-5 sm:p-5 sm:pt-6"
        )}
      >
        <div className="flex flex-1 flex-col gap-1.5 pb-3">
          {isRow ? <ItemTags tags={tags} className="mb-0.5" /> : null}
          <Heading
            id={headingId}
            className="heading-card line-clamp-3 wrap-break-word"
          >
            {title}
          </Heading>
          {item.subtitle ? (
            <p className={cn(smallText, "font-medium tracking-[0.14em] uppercase")}>
              {item.subtitle}
            </p>
          ) : null}
          {description ? (
            <p
              className={cn(
                "text-sm text-card-muted-foreground",
                isRow ? "line-clamp-2" : "line-clamp-3"
              )}
            >
              {description}
            </p>
          ) : null}
          {options ? (
            <p className={cn(smallText, "font-medium")}>{options}</p>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-card-foreground/10 pt-3">
          <PriceTag
            amount={variant ? variant.price : lowest.price}
            from={!variant && lowest.hasMultiplePrices}
          />
          {canAdd ? (
            <AddButton itemId={item.id} name={title} layout={layout} />
          ) : null}
        </div>
      </div>
    </article>
  )
}

export { ItemCard }
