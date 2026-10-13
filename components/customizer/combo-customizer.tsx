"use client"

import { Check } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

import { BrandHeading } from "@/components/brand/brand-heading"
import { PillLabel } from "@/components/brand/pill-label"
import { AddOnPicker } from "@/components/customizer/add-on-picker"
import {
  ChoicePicker,
  StepHeading,
} from "@/components/customizer/choice-picker"
import { CustomizerPanel } from "@/components/customizer/customizer-shell"
import { SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { getAddOnRule, getAddOnStatus } from "@/lib/cart/copy"
import {
  getQuantityInCart,
  MAX_LINE_QUANTITY,
  normalizeSelection,
} from "@/lib/cart/line"
import { getSubtotal, getUnitPrice, priceAddOns } from "@/lib/cart/pricing"
import { formatPrice, splitName } from "@/lib/format"
import {
  getComboAddOnGroups,
  getDisplayDescription,
  getDisplayName,
  getTags,
  getVariantLabel,
} from "@/lib/menu"
import type { ComboStep, ResolvedItem } from "@/lib/menu"
import { versionColors } from "@/lib/version-colors"
import { useCartStore } from "@/store/cart"
import { useCustomizerStore } from "@/store/customizer"
import type { AddOnSelection, ComboSelection } from "@/types/cart"
import type { AddOnGroup, Combo } from "@/types/menu"

/** How long "Added" stays on the button before the sheet closes. */
const ADDED_PAUSE_MS = 600

type ComboCustomizerProps = {
  combo: Combo
  /** The combo's slots, resolved against the menu. */
  steps: ComboStep[]
  /** Called as the sheet closes after an add, with the line to announce. */
  onAdded: (message: string) => void
}

/** What the customer has picked so far. */
type Build = {
  /** The chosen option by slot id. */
  slots: Record<string, ResolvedItem>
  upgradeIds: string[]
  /** Chosen option ids by add-on group id. */
  addOns: Record<string, string[]>
}

const emptyBuild: Build = { slots: {}, upgradeIds: [], addOns: {} }

/** One id for an item and variant together, as a tile's value. */
function getOptionId({ item, variant }: ResolvedItem): string {
  return `${item.id}:${variant.id}`
}

function toSelection(
  combo: Combo,
  steps: ComboStep[],
  groups: AddOnGroup[],
  build: Build
): ComboSelection {
  // A group with nothing chosen is left out, as in a line with no add-ons.
  const addOns: AddOnSelection[] = groups.flatMap((group) => {
    const optionIds = build.addOns[group.id] ?? []
    return optionIds.length > 0 ? [{ groupId: group.id, optionIds }] : []
  })
  return {
    kind: "combo",
    comboId: combo.id,
    // Fixed slots are read from the combo, not stored.
    slots: steps.flatMap((step) => {
      const chosen = step.kind === "options" ? build.slots[step.slot.id] : null
      return chosen
        ? [
            {
              slotId: step.slot.id,
              itemId: chosen.item.id,
              variantId: chosen.variant.id,
            },
          ]
        : []
    }),
    upgradeIds: build.upgradeIds,
    addOns,
  }
}

function IncludedStep({
  step,
  of,
  title,
  resolved,
}: {
  step: number
  of: number
  title: string
  resolved: ResolvedItem
}) {
  const headingId = useId()
  const description = getDisplayDescription(resolved.item, resolved.variant)

  return (
    <div
      role="group"
      aria-labelledby={headingId}
      className="flex flex-col gap-3"
    >
      <StepHeading
        id={headingId}
        step={step}
        of={of}
        title={title}
        done
        status={{ text: "Included", tone: "accent" }}
      />
      {/* Flatter than a tile, with a dashed edge: there is nothing to press. */}
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-gold/30 bg-secondary/30 px-4 py-3">
        <Check aria-hidden="true" className="size-4 shrink-0 text-primary" />
        <p className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[0.9375rem] leading-tight font-semibold">
            {getDisplayName(resolved.item, resolved.variant)}
          </span>
          {description ? (
            <span className="text-sm leading-tight text-muted-foreground">
              {description}
            </span>
          ) : null}
        </p>
      </div>
    </div>
  )
}

/**
 * One combo in the customiser: a numbered step per slot, the upgrades, the
 * dips, quantity, live total and Add to cart. Mounted afresh on every open,
 * so it always starts at 1 with nothing chosen.
 */
function ComboCustomizer({ combo, steps, onAdded }: ComboCustomizerProps) {
  const lines = useCartStore((state) => state.lines)
  const hydrated = useCartStore((state) => state.hydrated)
  const addLine = useCartStore((state) => state.addLine)
  const close = useCustomizerStore((state) => state.close)

  // A group with nothing to choose from gets no section.
  const groups = getComboAddOnGroups(combo).filter(
    (group) => group.options.length > 0 && group.maxSelect >= 1
  )

  const [quantity, setQuantity] = useState(1)
  const [build, setBuild] = useState<Build>(emptyBuild)
  const [status, setStatus] = useState<"idle" | "added" | "refused">("idle")
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const stepRefs = useRef(new Map<string, HTMLDivElement>())

  // A sheet opened on something else must not be closed by this one's timer.
  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const selection = toSelection(combo, steps, groups, build)
  // Every choice made: the cart's own check is the test.
  const complete = normalizeSelection(selection) !== undefined
  // The first choice still to make, which the button asks for.
  const missing = steps.find(
    (step) => step.kind === "options" && !build.slots[step.slot.id]
  )
  // A line stops at the maximum, so only the room left can be added. An
  // unfinished build is in no cart, so it has all of it.
  const remaining = MAX_LINE_QUANTITY - getQuantityInCart(lines, selection)
  const added = status === "added"
  const full = !added && remaining < 1

  // Each build is its own cart line, with its own room left, so every change
  // of choice goes through here.
  const applyBuild = (next: Build) => {
    setBuild(next)
    setStatus("idle")
    const room =
      MAX_LINE_QUANTITY -
      getQuantityInCart(lines, toSelection(combo, steps, groups, next))
    setQuantity((q) => Math.max(1, Math.min(q, room)))
  }

  const showStep = (slotId: string) => {
    const section = stepRefs.current.get(slotId)
    section?.scrollIntoView({ block: "nearest" })
    section
      ?.querySelector<HTMLElement>('[role="radio"]')
      ?.focus({ preventScroll: true })
  }

  const upgradeCost = combo.upgrades
    .filter((upgrade) => build.upgradeIds.includes(upgrade.id))
    .reduce((sum, upgrade) => sum + upgrade.price, 0)

  const add = () => {
    if (!complete || added || full || !hydrated) return
    if (!addLine(selection, quantity)) {
      setStatus("refused")
      return
    }
    setStatus("added")
    const subtotal = getSubtotal(useCartStore.getState().lines)
    // The slots in order, then the upgrades.
    const parts = [
      ...steps.flatMap((step) => {
        const resolved =
          step.kind === "fixed" ? step.resolved : build.slots[step.slot.id]
        return resolved ? [getDisplayName(resolved.item, resolved.variant)] : []
      }),
      ...combo.upgrades
        .filter((upgrade) => build.upgradeIds.includes(upgrade.id))
        .map((upgrade) => upgrade.label),
    ]
    const addOnNames = priceAddOns(selection).map((a) => a.option.name)
    const label = [
      `${combo.name} (${parts.join(", ")})`,
      ...(addOnNames.length > 0 ? [`with ${addOnNames.join(", ")}`] : []),
    ].join(" ")
    const message = `${quantity} × ${label} added to cart. Subtotal ${formatPrice(subtotal)}.`
    closeTimer.current = setTimeout(() => {
      close()
      // Announced once the sheet lets go of the page behind it.
      onAdded(message)
    }, ADDED_PAUSE_MS)
  }

  return (
    <CustomizerPanel
      image={combo.image}
      name={combo.name}
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
              label: missing.slot.label,
              onAction: () => showStep(missing.slot.id),
            }
          : undefined
      }
      onAdd={add}
    >
      {/* Below the close button, which sits over this column from `md`. */}
      <PillLabel className="h-7 self-start px-3.5 sm:text-xs sm:tracking-[0.18em] md:mt-9">
        Combo
      </PillLabel>
      <SheetTitle
        render={
          <BrandHeading
            as="h2"
            size="card"
            align="start"
            {...splitName(combo.name)}
          />
        }
        className="wrap-break-word"
      />
      {combo.description ? (
        <SheetDescription>{combo.description}</SheetDescription>
      ) : null}
      {/* The combo's own price; the button carries the total with extras. */}
      <p className="text-lg font-bold tabular-nums">
        {formatPrice(combo.price)}
      </p>
      <span
        aria-hidden="true"
        className="my-1 h-px shrink-0 bg-linear-to-r from-transparent via-primary/60 to-transparent"
      />
      {/* Held still while "Added" shows, so what is announced is what was added. */}
      <div inert={added} className="flex flex-col gap-5">
        {steps.map((step, index) => {
          const position = { step: index + 1, of: steps.length }
          if (step.kind === "fixed") {
            return (
              <IncludedStep
                key={step.slot.id}
                {...position}
                title={step.slot.label}
                resolved={step.resolved}
              />
            )
          }
          const chosen = build.slots[step.slot.id]
          return (
            <div
              key={step.slot.id}
              ref={(node) => {
                if (node) stepRefs.current.set(step.slot.id, node)
                else stepRefs.current.delete(step.slot.id)
              }}
            >
              <ChoicePicker
                {...position}
                title={step.slot.label}
                options={step.options.map((option) => {
                  const { item, category, variant } = option
                  const name = getDisplayName(item, variant)
                  const veg = getTags(item, variant).includes("veg")
                  // A lone variant ("Regular") says nothing worth a tag; its
                  // description does more for the choice.
                  const label =
                    item.variants.length > 1
                      ? getVariantLabel(item, category, variant)
                      : undefined
                  const subline = label
                    ? undefined
                    : getDisplayDescription(item, variant)
                  return {
                    id: getOptionId(option),
                    name,
                    tag: label
                      ? {
                          label,
                          className:
                            versionColors[variant.id] ??
                            "bg-secondary text-secondary-foreground",
                        }
                      : undefined,
                    veg,
                    subline,
                    ariaLabel: [
                      name,
                      label ?? subline,
                      veg ? "vegetarian" : undefined,
                    ]
                      .filter(Boolean)
                      .join(", "),
                  }
                })}
                value={chosen ? getOptionId(chosen) : null}
                onChange={(id) => {
                  const next = step.options.find((o) => getOptionId(o) === id)
                  if (!next) return
                  applyBuild({
                    ...build,
                    slots: { ...build.slots, [step.slot.id]: next },
                  })
                }}
              />
            </div>
          )
        })}
        {combo.upgrades.length > 0 ? (
          <AddOnPicker
            title="Upgrade"
            status={
              build.upgradeIds.length === 0
                ? { text: "Optional", tone: "muted" }
                : { text: `+ ${formatPrice(upgradeCost)}`, tone: "plain" }
            }
            options={combo.upgrades.map((upgrade) => ({
              id: upgrade.id,
              name: upgrade.label,
              price: formatPrice(upgrade.price),
            }))}
            value={build.upgradeIds}
            max={combo.upgrades.length}
            onChange={(ids) => applyBuild({ ...build, upgradeIds: ids })}
          />
        ) : null}
        {groups.map((group) => {
          const optionIds = build.addOns[group.id] ?? []
          return (
            <AddOnPicker
              key={group.id}
              title={group.name}
              rule={getAddOnRule(group)}
              status={getAddOnStatus(group, optionIds)}
              options={group.options.map((option) => ({
                id: option.id,
                name: option.name,
                price:
                  option.price !== undefined
                    ? formatPrice(option.price)
                    : undefined,
              }))}
              value={optionIds}
              max={group.maxSelect}
              onChange={(ids) =>
                applyBuild({
                  ...build,
                  addOns: { ...build.addOns, [group.id]: ids },
                })
              }
            />
          )
        })}
      </div>
    </CustomizerPanel>
  )
}

export { ComboCustomizer }
