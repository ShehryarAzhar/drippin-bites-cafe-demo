// Shapes of data/menu.json. Ids are plain strings unless the file uses a closed set.

export type OrderType = "delivery" | "takeaway" | "dine-in"
export type SizeId = "small" | "medium" | "large" | "xl"
export type VariantType = "size" | "version"
export type Tag = "new" | "veg"
export type ItemGroup = "sides" | "drinks"

export type Restaurant = {
  name: string
  shortName: string
  tagline: string
  area: string
  /** May be the string "TBD"; read through getContactDetails. */
  address: string
  whatsapp: string
  phone: string
  hours: string
  currency: string
  orderTypes: OrderType[]
}

export type Size = {
  id: SizeId
  label: string
}

export type AddOnOption = {
  id: string
  name: string
  /** Set on paid options; absent where the group prices by extraPrice. */
  price?: number
}

export type AddOnGroup = {
  id: string
  name: string
  description: string
  image?: string
  freeCount: number
  /** Price of each selection beyond freeCount. */
  extraPrice?: number
  maxSelect: number
  options: AddOnOption[]
}

export type Variant = {
  id: string
  price: number
  label?: string
  name?: string
  description?: string
  image?: string
  tags?: Tag[]
}

export type Item = {
  id: string
  name: string
  variants: Variant[]
  subtitle?: string
  description?: string
  image?: string
  tags?: Tag[]
  group?: ItemGroup
  variantType?: VariantType
  addOnGroups?: string[]
}

export type Category = {
  id: string
  name: string
  image: string
  items: Item[]
  subtitle?: string
  tagline?: string
  featured?: boolean
  variantType?: VariantType
  addOnGroups?: string[]
}

export type ItemRef = {
  itemId: string
  variantId: string
}

export type ComboUpgrade = {
  id: string
  label: string
  price: number
}

export type ComboOptionsSlot = {
  id: string
  label: string
  options: ItemRef[]
  fixed?: undefined
}

export type ComboFixedSlot = {
  id: string
  label: string
  fixed: ItemRef
  options?: undefined
}

export type ComboSlot = ComboOptionsSlot | ComboFixedSlot

export type Combo = {
  id: string
  name: string
  description: string
  image: string
  price: number
  upgrades: ComboUpgrade[]
  slots: ComboSlot[]
  addOnGroups?: string[]
  _notes?: string
}

export type DealPizzaLine = {
  qty: number
  label: string
  choose: "pizza"
  /** Category ids the flavour is picked from. */
  from: string[]
  size: SizeId
}

export type DealSoftDrinkLine = {
  qty: number
  label: string
  choose: "soft-drink"
}

/** Label-only line with no item reference. */
export type DealFixedLine = {
  qty: number
  label: string
  choose?: undefined
}

export type DealLine = DealPizzaLine | DealSoftDrinkLine | DealFixedLine

export type Deal = {
  id: string
  number: number
  name: string
  price: number
  image: string
  contents: DealLine[]
  printedName?: string
}

export type SoftDrinks = {
  options: string[]
  _notes?: string
}

export type Menu = {
  restaurant: Restaurant
  sizes: Size[]
  addOnGroups: AddOnGroup[]
  categories: Category[]
  combos: Combo[]
  deals: Deal[]
  softDrinks: SoftDrinks
  openQuestions: string[]
  _notes?: string[]
}
