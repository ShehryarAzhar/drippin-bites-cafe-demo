"use client"

import { Check } from "lucide-react"
import { useId } from "react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type AddOnOption = {
  id: string
  name: string
  /** Already formatted: "Rs. 80". Left out where the option has no price of its own. */
  price?: string
}

type AddOnStatus = {
  text: string
  /** `accent` for something free, `muted` for a hint, `plain` for a cost. */
  tone: "accent" | "muted" | "plain"
}

type AddOnPickerProps = {
  title: string
  /** How the group charges: "1 free, then Rs. 70 each". */
  rule?: string
  /** The end of the heading row: the hint, or what the chosen ones cost. */
  status: AddOnStatus
  options: AddOnOption[]
  /** The chosen options' ids; any number of them, none included. */
  value: string[]
  /** The most that can be chosen. */
  max: number
  onChange: (ids: string[]) => void
}

const statusTones: Record<AddOnStatus["tone"], string> = {
  accent: "text-primary",
  muted: "text-muted-foreground",
  plain: "whitespace-nowrap tabular-nums",
}

/**
 * One group of optional add-ons: a tile per option, any number of them chosen
 * up to the maximum. Knows nothing about the menu; the caller passes the
 * names, prices and wording.
 */
function AddOnPicker({
  title,
  rule,
  status,
  options,
  value,
  max,
  onChange,
}: AddOnPickerProps) {
  const headingId = useId()
  const ruleId = useId()
  const limitId = useId()
  // Only a limit while something is left to choose: with every option chosen
  // there is nothing to switch off and nothing to explain.
  const atLimit = value.length >= max && value.length < options.length
  const describedBy =
    [rule ? ruleId : null, atLimit ? limitId : null]
      .filter(Boolean)
      .join(" ") || undefined

  return (
    <div data-slot="add-on-picker" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3 text-xs font-medium tracking-[0.18em] uppercase">
          <h3 id={headingId} className="text-primary">
            {title}
          </h3>
          <span className={statusTones[status.tone]}>{status.text}</span>
        </div>
        {rule ? (
          <p id={ruleId} className="text-[0.8125rem] text-muted-foreground">
            {rule}
          </p>
        ) : null}
      </div>
      <ToggleGroup
        multiple
        aria-labelledby={headingId}
        aria-describedby={describedBy}
        value={value}
        onValueChange={onChange}
        className="grid grid-cols-2 gap-2.5"
      >
        {options.map((option) => {
          const chosen = value.includes(option.id)
          return (
            <ToggleGroupItem
              key={option.id}
              value={option.id}
              // At the limit a chosen one can still be taken off.
              disabled={atLimit && !chosen}
              aria-label={
                option.price ? `${option.name}, plus ${option.price}` : option.name
              }
              // An odd one out at the end spans the row, so the grid has no
              // hole. The chosen tile keeps a ring in its own gold rather than
              // none, so the focus ring's width still applies to it.
              className="group/add-on flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-secondary/60 px-4 py-2.5 text-start ring-1 ring-gold/20 transition-[background-color,box-shadow,scale] duration-150 last:odd:col-span-2 hover:ring-gold/50 active:scale-[0.98] data-pressed:bg-primary data-pressed:text-primary-foreground data-pressed:shadow-md data-pressed:shadow-black/30 data-pressed:ring-primary"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[0.9375rem] leading-tight font-semibold wrap-break-word">
                  {option.name}
                </span>
                {option.price ? (
                  <span className="text-sm leading-tight whitespace-nowrap text-muted-foreground tabular-nums group-data-pressed/add-on:text-primary-foreground/80">
                    + {option.price}
                  </span>
                ) : null}
              </span>
              {/* Always in the layout, so a name does not re-wrap when chosen. */}
              <Check
                aria-hidden="true"
                className="size-4 shrink-0 opacity-0 group-data-pressed/add-on:opacity-100"
              />
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
      {atLimit ? (
        <p id={limitId} className="text-[0.8125rem] text-muted-foreground">
          That&apos;s the most you can add.
        </p>
      ) : null}
    </div>
  )
}

export { AddOnPicker }
export type { AddOnOption, AddOnStatus }
