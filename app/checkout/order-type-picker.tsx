"use client"

import type { LucideIcon } from "lucide-react"
import { useImperativeHandle, useRef, type Ref } from "react"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export type OrderTypeOption = {
  value: string
  label: string
  icon: LucideIcon
}

type OrderTypePickerProps = {
  options: OrderTypeOption[]
  /** The chosen value; null until the customer picks one. */
  value: string | null
  onChange: (value: string) => void
  onBlur?: () => void
  /** Lets the form move focus to the group when it has an error. */
  focusRef?: Ref<{ focus: () => void }>
  invalid?: boolean
  labelledBy: string
  describedBy?: string
}

/**
 * How the order is taken: one tile per order type, none chosen at first.
 * Knows nothing about the menu; the caller passes the options.
 */
function OrderTypePicker({
  options,
  value,
  onChange,
  onBlur,
  focusRef,
  invalid,
  labelledBy,
  describedBy,
}: OrderTypePickerProps) {
  const groupRef = useRef<HTMLDivElement>(null)

  // Focus lands on the chosen tile, or the first one when none is chosen.
  useImperativeHandle(focusRef, () => ({
    focus: () => {
      const group = groupRef.current
      const target =
        group?.querySelector<HTMLElement>('[role="radio"][data-checked]') ??
        group?.querySelector<HTMLElement>('[role="radio"]')
      target?.focus()
    },
  }))

  return (
    <RadioGroup
      ref={groupRef}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-required="true"
      aria-invalid={invalid || undefined}
      // Null, not undefined: controlled from the first render.
      value={value}
      onValueChange={(next) => {
        if (typeof next === "string") onChange(next)
      }}
      className="grid-cols-3 gap-2.5"
    >
      {options.map(({ value: option, label, icon: Icon }) => (
        <RadioGroupItem
          key={option}
          value={option}
          onBlur={onBlur}
          data-invalid={invalid || undefined}
          className="group/type flex min-h-18 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl bg-secondary/60 px-2 py-3 text-center ring-1 ring-gold/20 transition-[background-color,box-shadow,scale] duration-150 hover:ring-gold/50 active:scale-[0.98] data-checked:bg-primary data-checked:text-primary-foreground data-checked:shadow-md data-checked:shadow-black/30 data-checked:ring-primary data-invalid:ring-destructive/70"
        >
          <Icon
            aria-hidden="true"
            className="size-5 text-primary transition-colors duration-150 group-data-checked/type:text-primary-foreground"
          />
          <span className="text-[0.9375rem] leading-tight font-semibold">
            {label}
          </span>
        </RadioGroupItem>
      ))}
    </RadioGroup>
  )
}

export { OrderTypePicker }
