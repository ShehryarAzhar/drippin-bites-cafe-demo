import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type QuantityStepperProps = {
  value: number
  min?: number
  max: number
  onDecrease: () => void
  onIncrease: () => void
  /** Accessible names; they should say what is being counted. */
  decreaseLabel: string
  increaseLabel: string
  className?: string
}

// A button at its limit stays focusable, so focus is not dropped mid-tapping.
const stepButton = "aria-disabled:pointer-events-none aria-disabled:opacity-40"

/** Minus, number, plus. Holds no state: the parent owns the value. */
function QuantityStepper({
  value,
  min = 1,
  max,
  onDecrease,
  onIncrease,
  decreaseLabel,
  increaseLabel,
  className,
}: QuantityStepperProps) {
  return (
    <div
      data-slot="quantity-stepper"
      className={cn(
        "inline-flex items-center rounded-full border border-border",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={decreaseLabel}
        disabled={value <= min}
        focusableWhenDisabled
        onClick={onDecrease}
        className={stepButton}
      >
        <Minus aria-hidden="true" />
      </Button>
      <span
        aria-live="polite"
        className="min-w-[2ch] text-center text-sm font-semibold tabular-nums"
      >
        <span className="sr-only">Quantity </span>
        {value}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={increaseLabel}
        disabled={value >= max}
        focusableWhenDisabled
        onClick={onIncrease}
        className={stepButton}
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  )
}

export { QuantityStepper }
