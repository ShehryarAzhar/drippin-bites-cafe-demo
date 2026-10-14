import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { versionColors } from "@/lib/version-colors"
import type { CartLine, LineDetail, LineSummary } from "@/types/cart"

function DetailPrice({ price }: { price: LineDetail["price"] }) {
  if (price === undefined) return null
  if (price === 0) {
    return <span className="shrink-0 font-medium text-primary">Free</span>
  }
  return (
    <span className="shrink-0 whitespace-nowrap tabular-nums">
      + {formatPrice(price)}
    </span>
  )
}

/**
 * A line's add-ons, combo parts or deal contents, with the customer's picks
 * under a deal's choose lines. Used by the cart drawer and checkout.
 */
function LineDetails({ details }: { details: LineDetail[] }) {
  if (details.length === 0) return null
  return (
    <ul className="flex flex-col gap-0.5 text-[0.8125rem] text-muted-foreground">
      {details.map((detail, index) => (
        <li key={index}>
          <div className="flex justify-between gap-3">
            <span className="min-w-0">
              {detail.quantity !== undefined ? `${detail.quantity} × ` : null}
              {detail.label}
            </span>
            <DetailPrice price={detail.price} />
          </div>
          {detail.choices?.length ? (
            <p className="pl-3 text-foreground">{detail.choices.join(", ")}</p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

/**
 * The variant tag of an item line ("Authentic", "Large"), shown only when the
 * item comes in more than one variant.
 */
function LineVariantTag({
  line,
  summary,
}: {
  line: CartLine
  summary: LineSummary
}) {
  if (line.kind !== "item" || !summary.hasMultipleVariants) return null
  if (!summary.variantLabel) return null
  return (
    <span
      className={cn(
        "rounded-sm px-1.5 py-0.5 text-[0.6875rem] leading-tight font-semibold tracking-wide uppercase",
        // Any other variant (a pizza size) gets the neutral tag.
        versionColors[line.variantId] ?? "bg-secondary text-secondary-foreground"
      )}
    >
      {summary.variantLabel}
    </span>
  )
}

export { LineDetails, LineVariantTag }
