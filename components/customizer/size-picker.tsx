"use client"

import { useId } from "react"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type SizeOption = {
  id: string
  label: string
  /** Already formatted: "Rs. 1,599". */
  price: string
}

type SizePickerProps = {
  options: SizeOption[]
  /** The chosen option's id; null until the customer picks one. */
  value: string | null
  onChange: (id: string) => void
}

/**
 * The required size choice: one tile per size with its price. Knows nothing
 * about the menu; the caller passes the labels and prices.
 */
function SizePicker({ options, value, onChange }: SizePickerProps) {
  const headingId = useId()

  return (
    <div data-slot="size-picker" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3 text-xs font-medium tracking-[0.18em] uppercase">
        <h3 id={headingId} className="text-primary">
          Size
        </h3>
        {value === null ? (
          <span className="text-muted-foreground">Required</span>
        ) : null}
      </div>
      <RadioGroup
        aria-labelledby={headingId}
        aria-required="true"
        // Null, not undefined: controlled from the first render.
        value={value}
        onValueChange={(next) => {
          if (typeof next === "string") onChange(next)
        }}
        className="grid-cols-2 gap-2.5"
      >
        {options.map((option) => (
          <RadioGroupItem
            key={option.id}
            value={option.id}
            aria-label={`${option.label}, ${option.price}`}
            // An odd one out at the end spans the row, so the grid has no hole.
            // The chosen tile keeps a ring in its own gold rather than none,
            // so the focus ring's width still applies to it.
            className="group/size flex min-h-15 cursor-pointer flex-col justify-center gap-0.5 rounded-xl bg-secondary/60 px-4 py-2.5 ring-1 ring-gold/20 transition-[background-color,box-shadow,scale] duration-150 last:odd:col-span-2 hover:ring-gold/50 active:scale-[0.98] data-checked:bg-primary data-checked:text-primary-foreground data-checked:shadow-md data-checked:shadow-black/30 data-checked:ring-primary"
          >
            <span className="text-[0.9375rem] leading-tight font-semibold">
              {option.label}
            </span>
            <span className="text-sm leading-tight whitespace-nowrap text-muted-foreground tabular-nums group-data-checked/size:text-primary-foreground/80">
              {option.price}
            </span>
          </RadioGroupItem>
        ))}
      </RadioGroup>
    </div>
  )
}

export { SizePicker }
export type { SizeOption }
