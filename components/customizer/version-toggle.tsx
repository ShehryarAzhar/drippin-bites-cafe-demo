"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { versionColors } from "@/lib/version-colors"

type VersionOption = {
  id: string
  label: string
  /** Already formatted: "Rs. 649". */
  price: string
}

type VersionToggleProps = {
  options: VersionOption[]
  /** The chosen option's id. One is always chosen. */
  value: string
  onChange: (id: string) => void
  className?: string
}

/**
 * The switch between an item's versions: one segment per version with its
 * price. Knows nothing about the menu; the caller passes the labels and prices.
 */
function VersionToggle({
  options,
  value,
  onChange,
  className,
}: VersionToggleProps) {
  return (
    <ToggleGroup
      data-slot="version-toggle"
      aria-label="Version"
      value={[value]}
      // Pressing the chosen segment reports an empty list; a version cannot
      // be switched off, so that is ignored.
      onValueChange={(next) => {
        if (next[0]) onChange(next[0])
      }}
      className={cn(
        "gap-1 rounded-xl bg-secondary/60 p-1 ring-1 ring-gold/20",
        className
      )}
    >
      {options.map((option) => {
        const chosen = option.id === value
        return (
          <ToggleGroupItem
            key={option.id}
            value={option.id}
            aria-label={`${option.label}, ${option.price}`}
            className={cn(
              "flex min-h-14 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-2 transition-[background-color,box-shadow,scale] duration-150 active:scale-[0.98]",
              // The cream edge is an inset ring, so the focus ring keeps its own.
              chosen
                ? [
                    "shadow-md inset-ring-1 shadow-black/30 inset-ring-cream/30",
                    versionColors[option.id] ??
                      "bg-primary text-primary-foreground",
                  ]
                : "hover:bg-cream/5"
            )}
          >
            <span className="text-[0.9375rem] leading-tight font-semibold whitespace-nowrap">
              {option.label}
            </span>
            <span
              className={cn(
                "text-sm leading-tight whitespace-nowrap tabular-nums",
                chosen ? "opacity-80" : "text-muted-foreground"
              )}
            >
              {option.price}
            </span>
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}

export { VersionToggle }
export type { VersionOption }
