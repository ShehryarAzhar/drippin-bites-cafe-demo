import { Trash2 } from "lucide-react"

import { LineDetails, LineVariantTag } from "@/components/cart/line-details"
import { QuantityStepper } from "@/components/cart/quantity-stepper"
import { ProductImage } from "@/components/menu/product-image"
import { Button } from "@/components/ui/button"
import { MAX_LINE_QUANTITY } from "@/lib/cart/line"
import { formatPrice } from "@/lib/format"
import type { CartLine as CartLineData, LineSummary } from "@/types/cart"

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
            <LineVariantTag line={line} summary={summary} />
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

        <LineDetails details={details} />

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
