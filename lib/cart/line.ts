import {
  findItem,
  getCombo,
  getComboAddOnGroups,
  getDeal,
  getDealPizzaOptions,
  getItemAddOnGroups,
  getSoftDrinkOptions,
  resolveItemRef,
} from "@/lib/menu"
import type {
  AddOnSelection,
  CartLine,
  CartSelection,
  ComboSelection,
  ComboSlotSelection,
  DealChoice,
  DealSelection,
  ItemSelection,
} from "@/types/cart"
import type { AddOnGroup, ComboOptionsSlot } from "@/types/menu"

/** The most of one line a customer can order. */
export const MAX_LINE_QUANTITY = 20

/** Add-on groups a selection may choose from. Deals have none. */
export function getSelectionAddOnGroups(selection: CartSelection): AddOnGroup[] {
  if (selection.kind === "item") {
    const found = findItem(selection.itemId)
    return found ? getItemAddOnGroups(found.item, found.category) : []
  }
  if (selection.kind === "combo") {
    const combo = getCombo(selection.comboId)
    return combo ? getComboAddOnGroups(combo) : []
  }
  return []
}

function hasDuplicates(values: string[]): boolean {
  return new Set(values).size !== values.length
}

// Each option at most once, and only from groups attached to the item or combo.
function normalizeAddOns(
  addOns: AddOnSelection[],
  groups: AddOnGroup[],
): AddOnSelection[] | undefined {
  if (hasDuplicates(addOns.map((a) => a.groupId))) return undefined
  const normalized: AddOnSelection[] = []
  for (const { groupId, optionIds } of addOns) {
    const group = groups.find((g) => g.id === groupId)
    if (!group) return undefined
    if (hasDuplicates(optionIds) || optionIds.length > group.maxSelect) {
      return undefined
    }
    if (!optionIds.every((id) => group.options.some((o) => o.id === id))) {
      return undefined
    }
    if (optionIds.length > 0) {
      normalized.push({ groupId, optionIds: [...optionIds].sort() })
    }
  }
  return normalized.sort((a, b) => (a.groupId < b.groupId ? -1 : 1))
}

function normalizeItem(selection: ItemSelection): ItemSelection | undefined {
  const resolved = resolveItemRef(selection)
  if (!resolved) return undefined
  const addOns = normalizeAddOns(
    selection.addOns,
    getItemAddOnGroups(resolved.item, resolved.category),
  )
  if (!addOns) return undefined
  return {
    kind: "item",
    itemId: selection.itemId,
    variantId: selection.variantId,
    addOns,
  }
}

function normalizeCombo(selection: ComboSelection): ComboSelection | undefined {
  const combo = getCombo(selection.comboId)
  if (!combo) return undefined

  const optionSlots = combo.slots.filter(
    (slot): slot is ComboOptionsSlot => slot.options !== undefined,
  )
  if (selection.slots.length !== optionSlots.length) return undefined
  const slots: ComboSlotSelection[] = []
  for (const slot of optionSlots) {
    const chosen = selection.slots.find((s) => s.slotId === slot.id)
    const allowed =
      chosen &&
      slot.options.some(
        (o) => o.itemId === chosen.itemId && o.variantId === chosen.variantId,
      )
    if (!chosen || !allowed) return undefined
    slots.push({
      slotId: slot.id,
      itemId: chosen.itemId,
      variantId: chosen.variantId,
    })
  }

  const { upgradeIds } = selection
  if (hasDuplicates(upgradeIds)) return undefined
  if (!upgradeIds.every((id) => combo.upgrades.some((u) => u.id === id))) {
    return undefined
  }

  const addOns = normalizeAddOns(selection.addOns, getComboAddOnGroups(combo))
  if (!addOns) return undefined
  return {
    kind: "combo",
    comboId: selection.comboId,
    slots,
    upgradeIds: [...upgradeIds].sort(),
    addOns,
  }
}

function normalizeDeal(selection: DealSelection): DealSelection | undefined {
  const deal = getDeal(selection.dealId)
  if (!deal) return undefined

  const choices: DealChoice[] = []
  for (const [index, line] of deal.contents.entries()) {
    if (!line.choose) continue
    const chosen = selection.choices.find((c) => c.index === index)
    if (!chosen || chosen.selections.length !== line.qty) return undefined
    const allowed =
      line.choose === "pizza"
        ? getDealPizzaOptions(line).map((option) => option.item.id)
        : getSoftDrinkOptions()
    if (!chosen.selections.every((s) => allowed.includes(s))) return undefined
    // Sorted, so two pizzas picked in either order are the same line.
    choices.push({ index, selections: [...chosen.selections].sort() })
  }
  // Anything left over points at a label-only line or repeats an index.
  if (selection.choices.length !== choices.length) return undefined
  return { kind: "deal", dealId: selection.dealId, choices }
}

/**
 * Checks a selection against the menu and returns it in one canonical order,
 * or undefined when it is incomplete or names something the menu does not have.
 */
export function normalizeSelection(
  selection: CartSelection,
): CartSelection | undefined {
  switch (selection.kind) {
    case "item":
      return normalizeItem(selection)
    case "combo":
      return normalizeCombo(selection)
    case "deal":
      return normalizeDeal(selection)
  }
}

// The normalisers build their objects in a fixed property order.
function getLineKey(normalized: CartSelection): string {
  return JSON.stringify(normalized)
}

/**
 * Adds a selection: the same choices raise that line's quantity, anything else
 * becomes a new line at the end. Returns undefined when the selection is refused.
 */
export function addToLines(
  lines: CartLine[],
  selection: CartSelection,
  quantity = 1,
): CartLine[] | undefined {
  if (!Number.isInteger(quantity) || quantity < 1) return undefined
  const normalized = normalizeSelection(selection)
  if (!normalized) return undefined

  const key = getLineKey(normalized)
  if (lines.some((line) => line.key === key)) {
    return lines.map((line) =>
      line.key === key
        ? {
            ...line,
            quantity: Math.min(MAX_LINE_QUANTITY, line.quantity + quantity),
          }
        : line,
    )
  }
  return [
    ...lines,
    { ...normalized, key, quantity: Math.min(MAX_LINE_QUANTITY, quantity) },
  ]
}

/** How many of exactly this selection the cart already holds. */
export function getQuantityInCart(
  lines: CartLine[],
  selection: CartSelection,
): number {
  const normalized = normalizeSelection(selection)
  if (!normalized) return 0
  const key = getLineKey(normalized)
  return lines.find((line) => line.key === key)?.quantity ?? 0
}

/** Below 1 removes the line; above the maximum holds it there. */
export function setLineQuantity(
  lines: CartLine[],
  key: string,
  quantity: number,
): CartLine[] {
  if (!Number.isFinite(quantity)) return lines
  if (quantity < 1) return removeLine(lines, key)
  const next = Math.min(MAX_LINE_QUANTITY, Math.floor(quantity))
  return lines.map((line) =>
    line.key === key ? { ...line, quantity: next } : line,
  )
}

export function removeLine(lines: CartLine[], key: string): CartLine[] {
  return lines.filter((line) => line.key !== key)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string")
}

function readAddOns(value: unknown): AddOnSelection[] | undefined {
  if (!Array.isArray(value)) return undefined
  const addOns: AddOnSelection[] = []
  for (const entry of value) {
    if (!isRecord(entry)) return undefined
    const { groupId, optionIds } = entry
    if (typeof groupId !== "string" || !isStringArray(optionIds)) {
      return undefined
    }
    addOns.push({ groupId, optionIds })
  }
  return addOns
}

// Shape only; normalizeSelection decides whether the menu still has it.
function readSelection(value: unknown): CartSelection | undefined {
  if (!isRecord(value)) return undefined

  if (value.kind === "item") {
    const { itemId, variantId } = value
    const addOns = readAddOns(value.addOns)
    if (typeof itemId !== "string" || typeof variantId !== "string" || !addOns) {
      return undefined
    }
    return { kind: "item", itemId, variantId, addOns }
  }

  if (value.kind === "combo") {
    const { comboId, upgradeIds } = value
    const addOns = readAddOns(value.addOns)
    if (
      typeof comboId !== "string" ||
      !isStringArray(upgradeIds) ||
      !addOns ||
      !Array.isArray(value.slots)
    ) {
      return undefined
    }
    const slots: ComboSlotSelection[] = []
    for (const entry of value.slots) {
      if (!isRecord(entry)) return undefined
      const { slotId, itemId, variantId } = entry
      if (
        typeof slotId !== "string" ||
        typeof itemId !== "string" ||
        typeof variantId !== "string"
      ) {
        return undefined
      }
      slots.push({ slotId, itemId, variantId })
    }
    return { kind: "combo", comboId, slots, upgradeIds, addOns }
  }

  if (value.kind === "deal") {
    const { dealId } = value
    if (typeof dealId !== "string" || !Array.isArray(value.choices)) {
      return undefined
    }
    const choices: DealChoice[] = []
    for (const entry of value.choices) {
      if (!isRecord(entry)) return undefined
      const { index, selections } = entry
      if (typeof index !== "number" || !isStringArray(selections)) {
        return undefined
      }
      choices.push({ index, selections })
    }
    return { kind: "deal", dealId, choices }
  }

  return undefined
}

/**
 * Turns whatever was in storage into valid lines. A line that no longer
 * matches the menu is dropped whole; stored keys are not trusted.
 */
export function sanitizeStoredLines(stored: unknown): CartLine[] {
  try {
    if (!isRecord(stored) || !Array.isArray(stored.lines)) return []
    let lines: CartLine[] = []
    for (const entry of stored.lines) {
      const selection = readSelection(entry)
      if (!selection || !isRecord(entry)) continue
      const { quantity } = entry
      if (
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > MAX_LINE_QUANTITY
      ) {
        continue
      }
      lines = addToLines(lines, selection, quantity) ?? lines
    }
    return lines
  } catch {
    return []
  }
}
