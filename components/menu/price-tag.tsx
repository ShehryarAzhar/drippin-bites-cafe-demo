import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

type PriceTagProps = {
  /** PKR integer. */
  amount: number
  /** Prefix with "From", for items with several prices. */
  from?: boolean
  className?: string
}

/** Navy price label from the printed menu. Place it on cream surfaces only. */
function PriceTag({ amount, from = false, className }: PriceTagProps) {
  return (
    <span
      data-slot="price-tag"
      className={cn(
        "inline-flex items-baseline gap-1.5 rounded-sm bg-navy px-3 py-1.5 font-sans text-base leading-tight font-bold whitespace-nowrap text-white tabular-nums",
        className
      )}
    >
      {from ? (
        <span className="text-[0.6875rem] font-semibold tracking-[0.12em] text-white/80 uppercase">
          From
        </span>
      ) : null}
      {formatPrice(amount)}
    </span>
  )
}

export { PriceTag }
