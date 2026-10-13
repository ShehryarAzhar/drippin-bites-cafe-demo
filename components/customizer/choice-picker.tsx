"use client"

import { Check } from "lucide-react"
import { useId } from "react"

import { ItemTags } from "@/components/menu/item-tags"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

type StepHeadingProps = {
  id: string
  /** The step's place in the sequence, from 1. */
  step: number
  /** How many steps there are. */
  of: number
  title: string
  /** Nothing is left to do here: the disc shows a tick. */
  done: boolean
  /** The end of the row: "Required", "Included". */
  status?: { text: string; tone: "accent" | "muted" }
}

/** A numbered section heading: the disc, the title and a short status. */
function StepHeading({ id, step, of, title, done, status }: StepHeadingProps) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs font-medium tracking-[0.18em] uppercase">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full text-[0.6875rem] leading-none tracking-normal tabular-nums ring-1 ring-primary transition-colors duration-150",
            done ? "bg-primary text-primary-foreground" : "text-primary"
          )}
        >
          {done ? <Check className="size-3" strokeWidth={3} /> : step}
        </span>
        <h3 id={id} className="min-w-0 text-primary">
          <span className="sr-only">
            Step {step} of {of}:{" "}
          </span>
          {title}
        </h3>
      </div>
      {status ? (
        <span
          className={cn(
            "shrink-0",
            status.tone === "accent" ? "text-primary" : "text-muted-foreground"
          )}
        >
          {status.text}
        </span>
      ) : null}
    </div>
  )
}

type ChoiceOption = {
  id: string
  name: string
  /** A small filled label over the name, e.g. the version. */
  tag?: { label: string; className: string }
  veg?: boolean
  /** A quieter second line under the name. */
  subline?: string
  /** The option's full spoken name. */
  ariaLabel: string
}

type ChoicePickerProps = {
  step: number
  of: number
  title: string
  options: ChoiceOption[]
  /** The chosen option's id; null until the customer picks one. */
  value: string | null
  onChange: (id: string) => void
}

/**
 * One required choice in a numbered sequence: a tile per option, exactly one
 * of them chosen. Knows nothing about the menu; the caller passes the names,
 * tags and wording.
 */
function ChoicePicker({
  step,
  of,
  title,
  options,
  value,
  onChange,
}: ChoicePickerProps) {
  const headingId = useId()

  return (
    <div data-slot="choice-picker" className="flex flex-col gap-3">
      <StepHeading
        id={headingId}
        step={step}
        of={of}
        title={title}
        done={value !== null}
        status={
          value === null ? { text: "Required", tone: "muted" } : undefined
        }
      />
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
            aria-label={option.ariaLabel}
            // An odd one out at the end spans the row, so the grid has no hole.
            // The chosen tile keeps a ring in its own gold rather than none,
            // so the focus ring's width still applies to it.
            className="group/choice flex min-h-15 cursor-pointer items-center gap-2 rounded-xl bg-secondary/60 px-4 py-2.5 text-start ring-1 ring-gold/20 transition-[background-color,box-shadow,scale] duration-150 last:odd:col-span-2 hover:ring-gold/50 active:scale-[0.98] data-checked:bg-primary data-checked:text-primary-foreground data-checked:shadow-md data-checked:shadow-black/30 data-checked:ring-primary"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              {option.tag || option.veg ? (
                // Wraps: the two labels together are wider than a tile.
                <span className="flex flex-wrap items-center gap-1.5">
                  {option.tag ? (
                    <span
                      className={cn(
                        "rounded-sm px-1.5 py-0.5 text-[0.6875rem] leading-tight font-semibold tracking-wide whitespace-nowrap uppercase inset-ring-1 inset-ring-white/30",
                        option.tag.className
                      )}
                    >
                      {option.tag.label}
                    </span>
                  ) : null}
                  {option.veg ? <ItemTags tags={["veg"]} /> : null}
                </span>
              ) : null}
              <span className="text-[0.9375rem] leading-tight font-semibold wrap-break-word">
                {option.name}
              </span>
              {option.subline ? (
                <span className="text-sm leading-tight text-muted-foreground group-data-checked/choice:text-primary-foreground/80">
                  {option.subline}
                </span>
              ) : null}
            </span>
            {/* Always in the layout, so a name does not re-wrap when chosen. */}
            <Check
              aria-hidden="true"
              className="size-4 shrink-0 opacity-0 group-data-checked/choice:opacity-100"
            />
          </RadioGroupItem>
        ))}
      </RadioGroup>
    </div>
  )
}

export { ChoicePicker, StepHeading }
export type { ChoiceOption }
