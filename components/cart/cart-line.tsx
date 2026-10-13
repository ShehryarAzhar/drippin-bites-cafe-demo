import { Trash2 } from "lucide-react"

import { QuantityStepper } from "@/components/cart/quantity-stepper"
import { ProductImage } from "@/components/menu/product-image"
import { Button } from "@/components/ui/button"
import { MAX_LINE_QUANTITY } from "@/lib/cart/line"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { CartLine as CartLineData, LineDetail, LineSummary } from "@/types/cart"

// The printed menu's colours for the two Cairo versions, by variant id.
// Every other variant (a pizza size) gets the neutral tag.
const versionTag: Record<string, string> = {
  authentic: "bg-navy text-white",
  lahori: "bg-brand-red text-white",
}

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

type CartLineProps = {
  line: CartLineData
  summary: LineSummary
  onDecrease: () => void
  onIncrease: () => void
  onRemove: () => void
}

/** One row of the cart drawer. */
function CartLine({
  line,
  summary,
  onDecrease,
  onIncrease,
  onRemove,
}: CartLineProps) {
  const { title, details, quantity } = summary
  const variantLabel =
    line.kind === "item" && summary.hasMultipleVariants
      ? summary.variantLabel
      : undefined

  return (
    <li
      data-slot="cart-line"
      className="relative flex gap-3 py-4 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-linear-to-r after:from-transparent after:via-primary/30 after:to-transparent last:after:hidden"
    >
      <ProductImage
        src={summary.image}
        alt=""
        sizes="80px"
        className="size-20 shrink-0 rounded-lg"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col items-start gap-1.5">
            <h3 className="leading-snug font-semibold wrap-break-word">
              {title}
            </h3>
            {variantLabel && line.kind === "item" ? (
              <span
                className={cn(
                  "rounded-sm px-1.5 py-0.5 text-[0.6875rem] leading-tight font-semibold tracking-wide uppercase",
                  versionTag[line.variantId] ??
                    "bg-secondary text-secondary-foreground"
                )}
              >
                {variantLabel}
              </span>
            ) : null}
          </div>
          <div className="shrink-0 text-end">
            <p className="font-bold whitespace-nowrap tabular-nums">
              {formatPrice(summary.lineTotal)}
            </p>
            {quantity > 1 ? (
              <p className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                {formatPrice(summary.unitPrice)} each
              </p>
            ) : null}
          </div>
        </div>

        {details.length > 0 ? (
          <ul className="flex flex-col gap-0.5 text-[0.8125rem] text-muted-foreground">
            {details.map((detail, index) => (
              <li key={index}>
                <div className="flex justify-between gap-3">
                  <span className="min-w-0">
                    {detail.quantity !== undefined
                      ? `${detail.quantity} × `
                      : null}
                    {detail.label}
                  </span>
                  <DetailPrice price={detail.price} />
                </div>
                {detail.choices?.length ? (
                  <p className="pl-3 text-foreground">
                    {detail.choices.join(", ")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex items-center justify-between">
          <QuantityStepper
            value={quantity}
            max={MAX_LINE_QUANTITY}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            decreaseLabel={`Decrease quantity of ${title}`}
            increaseLabel={`Increase quantity of ${title}`}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${title} from cart`}
            onClick={onRemove}
            // The drawer finds these to move focus after a remove.
            data-cart-remove=""
            className="text-muted-foreground hover:text-destructive focus-visible:text-destructive"
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </div>
    </li>
  )
}

export { CartLine }
