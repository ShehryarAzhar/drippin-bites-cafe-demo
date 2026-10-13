// Shapes of the cart. A line holds ids and choices only; names, images and
// prices are always read from the menu.

export type AddOnSelection = {
  groupId: string
  optionIds: string[]
}

export type ItemSelection = {
  kind: "item"
  itemId: string
  variantId: string
  addOns: AddOnSelection[]
}

/** The choice for one of a combo's `options` slots. Fixed slots are not stored. */
export type ComboSlotSelection = {
  slotId: string
  itemId: string
  variantId: string
}

export type ComboSelection = {
  kind: "combo"
  comboId: string
  slots: ComboSlotSelection[]
  upgradeIds: string[]
  addOns: AddOnSelection[]
}

export type DealChoice = {
  /** Position of the `choose` line in the deal's `contents`. */
  index: number
  /** One per `qty`: pizza item ids, or soft drink flavours. */
  selections: string[]
}

export type DealSelection = {
  kind: "deal"
  dealId: string
  choices: DealChoice[]
}

/** What a picker hands to the cart. */
export type CartSelection = ItemSelection | ComboSelection | DealSelection

export type CartLine = CartSelection & {
  /** Identity of the normalised selection; equal selections share a key. */
  key: string
  quantity: number
}

export type LineDetail = {
  label: string
  quantity?: number
  /** PKR; 0 for a free add-on. Absent where the line has no price of its own. */
  price?: number
  /** Chosen pizzas or drinks under a deal's `choose` line. */
  choices?: string[]
}

export type LineSummary = {
  key: string
  kind: CartSelection["kind"]
  title: string
  /** Items only. */
  variantLabel?: string
  /** Items only; false means the label ("Regular") can be left out. */
  hasMultipleVariants?: boolean
  image: string
  details: LineDetail[]
  unitPrice: number
  lineTotal: number
  quantity: number
}
