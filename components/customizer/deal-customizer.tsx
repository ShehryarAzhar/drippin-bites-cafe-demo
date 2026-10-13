"use client"

import { useEffect, useId, useRef, useState } from "react"

import { BrandHeading } from "@/components/brand/brand-heading"
import { PillLabel } from "@/components/brand/pill-label"
import { ChoicePicker } from "@/components/customizer/choice-picker"
import { CustomizerPanel } from "@/components/customizer/customizer-shell"
import { SheetTitle } from "@/components/ui/sheet"
import {
  getQuantityInCart,
  MAX_LINE_QUANTITY,
  normalizeSelection,
} from "@/lib/cart/line"
import { getSubtotal, getUnitPrice } from "@/lib/cart/pricing"
import { formatPrice, splitName } from "@/lib/format"
import type { DealPlan, DealStep } from "@/lib/menu"
import { useCartStore } from "@/store/cart"
import { useCustomizerStore } from "@/store/customizer"
import type { DealSelection } from "@/types/cart"
import type { Deal } from "@/types/menu"

/** How long "Added" stays on the button before the sheet closes. */
const ADDED_PAUSE_MS = 600

/** What the button asks for while a step of that kind is still open. */
const pendingLabels: Record<DealStep["line"]["choose"], string> = {
  pizza: "Choose your pizza",
  "soft-drink": "Choose your drink",
}

type DealCustomizerProps = {
  deal: Deal
  /** The deal's steps and the choices already made for the customer. */
  plan: DealPlan
  /** Called as the sheet closes after an add, with the line to announce. */
  onAdded: (message: string) => void
}

/** The chosen option id by step. */
type Picks = Record<string, string>

function getStepKey(step: DealStep): string {
  return `${step.index}:${step.position}`
}

function toSelection(deal: Deal, plan: DealPlan, picks: Picks): DealSelection {
  return {
    kind: "deal",
    dealId: deal.id,
    // One entry per `choose` line; label-only lines are not stored.
    choices: deal.contents.flatMap((line, index) => {
      if (!line.choose) return []
      const auto = plan.auto[index]
      const selections = auto
        ? Array.from({ length: line.qty }, () => auto.id)
        : plan.steps.flatMap((step) => {
            const pick = step.index === index ? picks[getStepKey(step)] : null
            return pick ? [pick] : []
          })
      return [{ index, selections }]
    }),
  }
}

/**
 * One deal in the customiser: what is in the bundle, a numbered step per
 * flavour or drink to pick, quantity, live total and Add to cart. Mounted
 * afresh on every open, so it always starts at 1 with nothing chosen.
 */
function DealCustomizer({ deal, plan, onAdded }: DealCustomizerProps) {
  const lines = useCartStore((state) => state.lines)
  const hydrated = useCartStore((state) => state.hydrated)
  const addLine = useCartStore((state) => state.addLine)
  const close = useCustomizerStore((state) => state.close)
  const insideId = useId()

  const [quantity, setQuantity] = useState(1)
  const [picks, setPicks] = useState<Picks>({})
  const [status, setStatus] = useState<"idle" | "added" | "refused">("idle")
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const stepRefs = useRef(new Map<string, HTMLDivElement>())

  // A sheet opened on something else must not be closed by this one's timer.
  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const { steps } = plan
  const selection = toSelection(deal, plan, picks)
  // Every choice made: the cart's own check is the test.
  const complete = normalizeSelection(selection) !== undefined
  // The first choice still to make, which the button asks for.
  const missing = steps.find((step) => !picks[getStepKey(step)])
  // A line stops at the maximum, so only the room left can be added. An
  // unfinished build is in no cart, so it has all of it.
  const remaining = MAX_LINE_QUANTITY - getQuantityInCart(lines, selection)
  const added = status === "added"
  const full = !added && remaining < 1

  // Each build is its own cart line, with its own room left.
  const applyPicks = (next: Picks) => {
    setPicks(next)
    setStatus("idle")
    const room =
      MAX_LINE_QUANTITY -
      getQuantityInCart(lines, toSelection(deal, plan, next))
    setQuantity((q) => Math.max(1, Math.min(q, room)))
  }

  const showStep = (key: string) => {
    const section = stepRefs.current.get(key)
    section?.scrollIntoView({ block: "nearest" })
    section
      ?.querySelector<HTMLElement>('[role="radio"]')
      ?.focus({ preventScroll: true })
  }

  const add = () => {
    if (!complete || added || full || !hydrated) return
    if (!addLine(selection, quantity)) {
      setStatus("refused")
      return
    }
    setStatus("added")
    const subtotal = getSubtotal(useCartStore.getState().lines)
    // The picks as made, with the ones made for the customer in their place.
    const names = deal.contents.flatMap((line, index) => {
      const auto = plan.auto[index]
      if (auto) return Array.from({ length: line.qty }, () => auto.name)
      return steps.flatMap((step) => {
        if (step.index !== index) return []
        const pick = step.options.find((o) => o.id === picks[getStepKey(step)])
        return pick ? [pick.name] : []
      })
    })
    const label =
      names.length > 0 ? `${deal.name} (${names.join(", ")})` : deal.name
    const message = `${quantity} × ${label} added to cart. Subtotal ${formatPrice(subtotal)}.`
    closeTimer.current = setTimeout(() => {
      close()
      // Announced once the sheet lets go of the page behind it.
      onAdded(message)
    }, ADDED_PAUSE_MS)
  }

  return (
    <CustomizerPanel
      image={deal.image}
      name={deal.name}
      quantity={quantity}
      maxQuantity={remaining}
      onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
      onIncrease={() => setQuantity((q) => Math.min(remaining, q + 1))}
      total={
        hydrated && complete
          ? formatPrice(getUnitPrice(selection) * quantity)
          : undefined
      }
      disabled={!hydrated || full}
      added={added}
      notice={
        status === "refused"
          ? { text: "That couldn't be added. Please try again.", tone: "error" }
          : full
            ? {
                text: `You already have ${MAX_LINE_QUANTITY} of these in your cart.`,
                tone: "muted",
              }
            : undefined
      }
      pending={
        missing
          ? {
              label: pendingLabels[missing.line.choose],
              onAction: () => showStep(getStepKey(missing)),
            }
          : undefined
      }
      onAdd={add}
    >
      {/* Below the close button, which sits over this column from `md`. */}
      <PillLabel className="h-7 self-start px-3.5 sm:text-xs sm:tracking-[0.18em] md:mt-9">
        Deal {deal.number}
      </PillLabel>
      <SheetTitle
        render={
          <BrandHeading
            as="h2"
            size="card"
            align="start"
            {...splitName(deal.name)}
          />
        }
        className="wrap-break-word"
      />
      <p className="text-lg font-bold tabular-nums">{formatPrice(deal.price)}</p>
      <span
        aria-hidden="true"
        className="my-1 h-px shrink-0 bg-linear-to-r from-transparent via-primary/60 to-transparent"
      />
      {/* Held still while "Added" shows, so what is announced is what was added. */}
      <div inert={added} className="flex flex-col gap-5">
        <div
          role="group"
          aria-labelledby={insideId}
          className="flex flex-col gap-3"
        >
          <h3
            id={insideId}
            className="text-xs font-medium tracking-[0.18em] text-primary uppercase"
          >
            What&apos;s inside
          </h3>
          {/* Flat, with a dashed edge: there is nothing to press. */}
          <ul className="flex flex-col gap-1.5 rounded-xl border border-dashed border-gold/30 bg-secondary/30 px-4 py-3 text-[0.9375rem] leading-snug">
            {deal.contents.map((line, index) => {
              const auto = plan.auto[index]
              return (
                <li key={index} className="flex gap-2">
                  <span className="shrink-0 font-semibold whitespace-nowrap tabular-nums">
                    {line.qty} ×
                  </span>
                  <span className="flex min-w-0 flex-col">
                    {line.label}
                    {auto ? (
                      <span className="text-sm text-muted-foreground">
                        {auto.name}
                      </span>
                    ) : null}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
        {steps.map((step, stepIndex) => {
          const key = getStepKey(step)
          const { label, qty } = step.line
          return (
            <div
              key={key}
              ref={(node) => {
                if (node) stepRefs.current.set(key, node)
                else stepRefs.current.delete(key)
              }}
            >
              <ChoicePicker
                step={stepIndex + 1}
                of={steps.length}
                title={qty > 1 ? `${label} (${step.position} of ${qty})` : label}
                options={step.options.map((option) => ({
                  id: option.id,
                  name: option.name,
                  veg: option.veg,
                  ariaLabel: option.veg
                    ? `${option.name}, vegetarian`
                    : option.name,
                }))}
                value={picks[key] ?? null}
                onChange={(id) => applyPicks({ ...picks, [key]: id })}
              />
            </div>
          )
        })}
      </div>
    </CustomizerPanel>
  )
}

export { DealCustomizer }
