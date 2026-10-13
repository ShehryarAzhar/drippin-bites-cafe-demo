# Spec 13: Cairo Combo Builder

**Status:** Implemented
**Depends on:** 11, 12 (and through them 05, 06, 07, 08, 09)

## Summary

Put the Cairo Combo on the menu and make it orderable: a poster-style combo card in the Cairo Crunch section, and a builder in the existing customiser sheet that walks the customer through pocket or wrap → Cairo Fries (included) → drink, with the Loaded upgrade and the combo's Cairo dips. The cart already validates, prices, merges and prints combo lines (specs 07, 08); this spec is the missing surface that builds one. For the pitch it is the highest-value Cairo Crunch order on the printed menu's Cairo page, and the first "build your meal" moment the owners see.

## Goals

- A combo card on `/menu`, inside the Cairo Crunch section, for every entry in `menu.combos` (one today: `cairo-combo`).
- A combo builder in the shared customiser sheet (`CustomizerSheet` / `CustomizerPanel`), opened from that card.
- Steps come from `combo.slots` in file order: an `options` slot is a required single choice, a `fixed` slot is shown as included. Nothing about `main`, `side` or `drink` is special-cased by id.
- The Loaded upgrade from `combo.upgrades`, optional, off by default.
- The combo's dips through the existing `AddOnPicker`, from `getComboAddOnGroups(combo)` (`cairo-dips`: first free, then Rs. 70).
- Nothing preselected: no main, no drink, no upgrade, no dip. The footer button names the step still missing until both choices are made.
- Quantity, live total, "Added", the per-line maximum and the announcement behave as in `ItemCustomizer`.
- The result is a `ComboSelection` handed to `addLine`; the drawer shows it with no drawer changes.
- One reusable, data-free single-choice picker for the slot steps, which spec 14 can reuse for a deal's pizza and soft-drink choices.
- `npm run lint` and `npm run build` pass.

## Out of scope

- The combo anywhere but `/menu`: the home hero, featured section and deals preview (specs 15, 16).
- A category-bar chip for the combo. It lives inside the Cairo Crunch section.
- Deals and their pickers (spec 14).
- A "you save Rs. …" line or any comparison with the items bought separately. The data holds no saving and the sum differs per main.
- A description of what Loaded contains. Decided: the upgrade shows its `label` only, on the card and in the builder. `upgrades[]` has only `id`, `label`, `price`; nothing is invented (the owners' question is in Open questions).
- Photos on the option tiles, and swapping the stage photo to the chosen main. The stage is always `combo.image`.
- Choosing a different side, a second drink, or a main outside `slots[].options`.
- A different price per main. `combo.price` is the price for all eight (the combo's `_notes`; spec 07).
- Editing a combo line already in the cart, or remembering the last build between opens.
- A multi-screen wizard with Back / Next (see "Decided" under UI & design).
- Changes to `types/`, `lib/cart/line.ts`, `lib/cart/pricing.ts`, `lib/cart/summary.ts`, `store/cart.ts` or `components/cart/`. Combo lines are already valid, priced, merged and printed.
- Editing `data/menu.json`. New shadcn components or packages.
- Future phases from CLAUDE.md section 3: backend, auth, payments, WhatsApp Cloud API, admin dashboard, videos.
- Tests of any kind.

## User flow

On a phone, on `/menu`:

1. Under the six Cairo Crunch cards, before Sides and Drinks, there is a wide dark card: the combo photo in its gold glow, a "Combo" pill, "CAIRO / COMBO" in cream and gold, "Any pocket or wrap + Cairo Fries + drink.", the navy "Rs. 749" tag and a gold "Build" button. They tap anywhere on it.
2. The sheet rises: the combo photo, the title, the description, "Rs. 749". The footer button reads "Choose your pocket or wrap".
3. Step 1, "Choose your pocket or wrap", marked "Required": eight tiles in two columns, each with a small navy "Authentic" or red "Lahori Twist" tag over the dish name. They tap "Lahori Tikka Hawawshi". The tile fills gold with a tick, the step's number becomes a tick, "Required" goes.
4. Step 2, "Side": one row, "Cairo Fries", "Fries with dukkah and tahini.", marked "Included". Nothing to tap.
5. Step 3, "Choose your drink": two tiles, Limonana and Karkade. The button now reads "Choose your drink". Tapping it instead of a tile scrolls to this step. They tap Karkade; the button becomes "Add to cart · Rs. 749".
6. "Upgrade": one tile, "Loaded", "+ Rs. 150", marked "Optional". They tap it: "Rs. 899".
7. "Cairo Dips", "1 free", "1 free, then Rs. 70 each": they choose Shatta ("Free", still Rs. 899) and Toum ("+ Rs. 70", Rs. 969).
8. They set the quantity to 2 ("Rs. 1,938") and tap the button: "Added", the sheet closes, the cart badge pops.
9. The drawer lists "Cairo Combo" with the combo photo and, under it: Lahori Tikka Hawawshi, Cairo Fries, Karkade, Loaded "+ Rs. 150", Garlic Tahini (Toum) "Free", Shatta "+ Rs. 70"; "Rs. 969 each", Rs. 1,938.
10. Building the same combo again raises that line. A different main, drink, upgrade or set of dips is a separate line.

## UI & design

Reference: the "Combo" panel of `docs/menu-reference/05-cairo-crunch.jpeg` (navy price tag, red "+Rs.150" Loaded tag, "Any Pocket/Wrap + Cairo Fries + Drink") and `docs/brand/poster-*.jpeg` for the stacked heading. Reference only. Load the `frontend-design` skill when implementing.

### Combo card (`/menu`)

- **Place (decided):** in the Cairo Crunch section, after the grid of ungrouped cards and before the Sides / Drinks sub-groups, full width of the section's `max-w-6xl` column, `mt-5 lg:mt-6` so it reads as the closing row of the card grid.
- **Treatment (decided): a dark poster card, not a cream one.** It is a different thing from the dishes above it and should look like the offer on a poster: `bg-secondary/60` over a warm radial gold wash, `ring-1 ring-gold/40`, `rounded-xl`, `shadow-xl shadow-black/40`, a faint dot-grid ornament in one corner (`aria-hidden`).
- **Phone (375px):** stacked. `ProductImage` on top at `aspect-16/10` (its own stage and glow), then a body with `p-5`: `PillLabel` "Combo", `BrandHeading` at `card` size with `splitName(combo.name)` (cream "Cairo", gold "Combo"), `combo.description` in `text-muted-foreground`, then a row with `PriceTag` (navy, `combo.price`) at the start and the gold button at the end. Decided: `PriceTag` is written for cream surfaces, so here it takes a thin cream ring through its `className` to keep an edge on the dark card; `components/menu/price-tag.tsx` is not edited.
- **From `md`:** two columns, image on the left (about 2/5, full card height, at least 16rem tall), body on the right, vertically centred, heading at `section` size.
- **Upgrade hint:** under the description, one small line per `upgrades[]` entry in the printed menu's red: the `label` in a `bg-brand-red text-white` tag followed by "+ Rs. 150" in cream (`formatPrice`). It tells the customer Loaded exists before they open the sheet.
- **Button:** the existing `AddButton` look (gold, `Plus` icon) with the word "Build", its `after` layer stretched over the whole card as on item cards, so the card is one tap target. On this dark card the focus ring is the standard gold one, not the dark ring `AddButton` uses on cream.
- **Hover / press:** as item cards (`hover:-translate-y-0.5`, deeper shadow, 200ms); `reveal-on-scroll` on a wrapper around the card, because the reveal and the hover lift both move `translate` and must not share an element.
- **Heading level:** `h3`, under the section's `h2`, beside the item cards' `h3`s.

### Builder: frame

- The existing `CustomizerSheet` and `CustomizerPanel`, unchanged: bottom sheet on phones, two-column panel from `md`, stage, scrolling body, footer stepper and button.
- **Stage:** `combo.image` for the whole session.
- **Decided: one scrolling sheet with numbered steps, not a wizard.** Each step is always visible and can be changed in any order; "step by step" is carried by the numbers, the per-step "Required" mark and the footer button, which names the first step still missing and scrolls to it. A wizard would hide the fries and the price of Loaded behind Next taps and need a Back control the shell does not have.
- **Body order:** pill "Combo" (`PillLabel`, small) → title (`SheetTitle` rendering `BrandHeading` `h2`, `card` size, `splitName(combo.name)`) → `combo.description` (`SheetDescription`) → `formatPrice(combo.price)` as `text-lg font-bold tabular-nums` (the combo's own price; the button carries the total) → the fading gold hairline → the slot steps in `slots` order → Upgrade → one `AddOnPicker` per add-on group. The steps, Upgrade and dips sit in one wrapper with `gap-5` (the panel body's own gap is `gap-3`, and `ItemCustomizer` wraps its pickers the same way), with no further rules.

### Step heading

- The `SizePicker` / `AddOnPicker` heading row (`text-xs`, medium, `tracking-[0.18em]`, uppercase), with a step number in front:
  - a 20px gold-outlined disc (`ring-1 ring-primary`, `text-primary`, `tabular-nums`) holding the step's position among the slots (1, 2, 3);
  - once the step is satisfied the disc fills `bg-primary text-primary-foreground` and shows a 12px lucide `Check` instead of the number. A fixed slot is satisfied from the start.
  - the slot's `label` as the `h3`, in `text-primary`;
  - at the end: "Required" in `text-muted-foreground` while an options slot has no choice; "Included" in `text-primary` on a fixed slot; nothing once chosen.
- Upgrade and dips sections are not numbered: they are optional extras, and their headings follow `AddOnPicker` as they are.

### Options slot: the choice tiles

- **Decided: one tile per option, chosen in one tap.** The eight mains are eight tiles with navy / red version tags, not four dish tiles followed by the spec 11 `VersionToggle`; `version-toggle.tsx` is not used or changed.
- A new data-free component on the restyled `components/ui/radio-group.tsx` (no dot), the `SizePicker` tile family: two-column grid, 10px gap, `rounded-xl`, `bg-secondary/60`, `ring-1 ring-gold/20`, `min-h-15`, `px-4 py-2.5`, an odd last tile spanning the row.
- **Tile content:**
  - where the option's item has more than one variant (`variantType: "version"`): a small tag with the variant `label`, filled from `lib/version-colors.ts` (navy "Authentic", red "Lahori Twist"), the cart tag's size (`text-[0.6875rem]`, uppercase, `rounded-sm`);
  - the name from `getDisplayName(item, variant)`: body font, semibold, about 15px, left-aligned, wrapping to two lines at most ("Lahori Tikka Hawawshi", "Ful Medames Sandwich");
  - where the variant is tagged `veg` (`getTags`): the existing veg indicator from `ItemTags`, unchanged. Decided: the tag row wraps, so the veg pill sits on its own line under the version tag; the two together are wider than a tile at any width. The rows holding a veg main are one line taller;
  - for single-variant options (the drinks): the item `description` on a second line in `text-sm text-muted-foreground` ("Mint lemonade.", "Iced hibiscus."), and no tag.
  - No price on any tile: the slot choice does not change the price.
- With today's file order the eight mains fall into four rows, Authentic on the left and Lahori Twist on the right, like the printed menu's two columns. That comes from the order of `options`, not from layout code.
- **Unchosen:** cream name; hover `ring-gold/50`, 150ms. **Chosen:** `bg-primary text-primary-foreground`, `shadow-md shadow-black/30`, `ring-primary`, a 16px `Check` at the end whose space is reserved on unchosen tiles. The navy / red tag keeps its fill on the gold tile with a thin `inset-ring-white/30` so it stays legible.
- **Press:** `active:scale-[0.98]`. **Focus:** the gold ring with the dark offset from the radio group.

### Fixed slot: the included row

- Not a control. One row in the tile family but flatter (`bg-secondary/30`, dashed `ring-gold/20`): a 16px `Check` in `text-primary`, the item name (`getDisplayName`) in semibold, its `description` in `text-sm text-muted-foreground` under it. "Included" is in the heading row.

### Upgrade

- Decided: the tile shows the upgrade's `label` and price only ("Loaded", "+ Rs. 150"), with no line saying what it includes.
- `AddOnPicker` reused as it is: title "Upgrade", no rule line, options from `combo.upgrades` (`label` as the name, `formatPrice(price)`), `max` the number of upgrades, status "Optional" (muted) with nothing chosen and "+ Rs. 150" once chosen. The single Loaded tile spans the row.
- Not rendered when `upgrades` is empty.

### Dips

- `AddOnPicker` per group from `getComboAddOnGroups(combo)`, wired exactly as in `ItemCustomizer`: `getAddOnRule(group)`, the "1 free" / "Free" / "+ Rs. 70" status, option prices only where the option has one. Same filter: a group with no options or `maxSelect` below 1 gets no section.

### Footer

- Stepper and button from `CustomizerPanel`.
- **Incomplete:** the `pending` prop: the button reads the `label` of the first options slot without a choice ("Choose your pocket or wrap", then "Choose your drink") and, on tap, scrolls that step into view and focuses its first tile (the pizza pattern from spec 10). The label may wrap to two balanced lines at 375px, the button growing from its 56px minimum if it must; it is never truncated. Decided: this needs one small change to `CustomizerPanel` (its button is `whitespace-nowrap` with no hook), applied only while a choice is pending; "Choose a size" still sits on one line.
- **Complete:** "Add to cart · Rs. 969", total = `getUnitPrice(selection)` × quantity.
- Unlike a pizza, the price is known before the steps are done, but the button shows the pending label, not a total, until they are: one message at a time.

### States

- **Nothing chosen:** steps 1 and 3 "Required", fries "Included", Upgrade "Optional", dips "1 free"; button "Choose your pocket or wrap".
- **Partly chosen:** the button names the remaining step; upgrade and dips can be chosen in any order before or after.
- **Complete:** button with total; stepper live.
- **"Added":** 600ms, every picker inert, then the sheet closes (as spec 09).
- **Line at its maximum for this exact build:** "You already have 20 of these in your cart.", stepper and button inert, pickers live (another build has its own room).
- **Room smaller than the quantity after a change:** the quantity drops to the room left, silently, by the rule `ItemCustomizer` uses.
- **Saved cart not loaded yet (`hydrated` false):** the pickers work; the button is inert.
- **Refused add:** "That couldn't be added. Please try again." A guard; not reachable through the builder.
- **Missing image:** `ProductImage`'s existing fallback, on the card and the stage.
- **A slot option or fixed ref that does not resolve** (`resolveItemRef` undefined): that tile or row is left out. An options slot left with no tiles, or a combo with no slots, does not open and gets no card.
- **Unknown combo id in the store:** the sheet does not open (as an unknown item id today).
- **Empty / loading / error:** none. No network.

### Motion

- Tile fill, ring and the step disc's fill: 150ms colour transitions; press scale on tiles. The tick appears with the fill.
- The pending button's scroll uses the body's existing `scroll-smooth`.
- No auto-scroll after a choice: the customer stays where they tapped.
- Card: `reveal-on-scroll`, hover lift 200ms. All under the global `prefers-reduced-motion` rule.

### Accessibility

- The card button is named "Build Cairo Combo" (from `combo.name`) with `aria-haspopup="dialog"`; focus returns to it when the sheet closes.
- Each options slot is a `radiogroup` named by its `h3` with `aria-required="true"`; each tile is a radio named "Lahori Tikka Hawawshi, Lahori Twist" / "Karkade, Iced hibiscus." (and ", vegetarian" where tagged). Arrow keys move and choose, as in `SizePicker`.
- The step disc is `aria-hidden`; the heading carries a visually hidden "Step 1 of 3:" prefix so the order is spoken.
- The fixed slot is a group named by its heading with the row as plain text; "Included" is read with it.
- Upgrade and dips: `AddOnPicker`'s existing semantics (`aria-pressed` tiles).
- The pending button's name is its label; the complete button's is "Add to cart, Rs. 969". No new live region.
- Announcement after an add, through `CustomizerRoot`'s existing region: "2 × Cairo Combo (Lahori Tikka Hawawshi, Cairo Fries, Karkade, Loaded) with Garlic Tahini (Toum), Shatta added to cart. Subtotal Rs. 1,938." The bracket lists the slots in order then the upgrades; "with …" only when dips are chosen.
- Chosen is never colour alone: fill, tick and the radio / pressed state. All tiles at least 48px tall; the card button at least 44px.
- Heading order: dialog title `h2`, each section `h3`.

### Responsive

- **375px first:** tiles are about 162px wide; the longest names wrap to two lines under their tag without widening the grid, and tiles in a row share a height. At 375 × 812 the step 1 heading and the first row of tiles are visible without scrolling. The body scrolls; the footer stays.
- "Add to cart · Rs. 22,180" (20 × Loaded with all four dips, the largest total) fits the button on one line.
- **`md` and up:** the builder is in the right-hand column of the 85dvh panel, still two tile columns, scrolling under a fixed footer; the stage fills the left column.
- The combo card never lets the price tag wrap; the description wraps freely.

## Data

- **`menu.json`,** through `lib/menu.ts` only:
  - `menu.combos[]`: `id`, `name`, `description`, `image`, `price`, `upgrades[]` (`id`, `label`, `price`), `slots[]`, `addOnGroups`. `_notes` is not shown.
  - `slots[]`: `{ id, label, options: ItemRef[] }` or `{ id, label, fixed: ItemRef }` (`ComboOptionsSlot` / `ComboFixedSlot` in `types/menu.ts`). Today: `main` ("Choose your pocket or wrap", 8 options: `hawawshi`, `ful`, `tamaya`, `faroge` × `authentic`, `lahori`), `side` ("Side", fixed `cairo-fries` / `regular`), `drink` ("Choose your drink", `limonana` / `regular`, `karkade` / `regular`).
  - Each ref through `resolveItemRef` → `getDisplayName`, `getVariantLabel`, `getTags`, `getDisplayDescription`; `item.variants.length > 1` decides whether the version tag shows.
  - `getCombo(id)`, `getComboAddOnGroups(combo)` → `cairo-dips` (`freeCount: 1`, `extraPrice: 70`, `maxSelect: 4`; `toum`, `shatta`, `cairo-special`, `mint-yogurt`).
  - **Which section shows a combo:** the category that all of the combo's resolved slot refs sit in (`cairo-crunch` for `cairo-combo`), not "the featured category" and not a literal id. Two lookups in `lib/menu.ts`: `getComboSteps(combo)` (the slots with their refs resolved, unresolved ones dropped, undefined when the combo cannot be built) and `getCategoryCombos(category)` on top of it. A combo whose refs span categories, or that cannot be built, is shown nowhere; a single ref that does not resolve only loses its tile or row (States).
  - Not used: `deals`, `softDrinks`, `sizes`, `group.description`, `group.image`.
- **Selection:** `ComboSelection` from `types/cart.ts`: `comboId`, `slots` as `ComboSlotSelection[]` (`slotId`, `itemId`, `variantId`, one per options slot; fixed slots are not stored), `upgradeIds[]`, `addOns` as `AddOnSelection[]` with empty groups left out. `normalizeSelection` already checks and orders it and returns undefined while a slot is missing, which is the builder's "complete" test.
- **Pricing,** all from `lib/cart/pricing.ts`: `getUnitPrice(selection)` (works on an incomplete build too: `combo.price` + upgrades + dips), `priceAddOnGroup` for a group's running cost, `priceAddOns` for the dips named in the announcement, `getSubtotal` for its subtotal.
- **Worked figures,** for the acceptance criteria:

  | Build | Unit price |
  |---|---|
  | any main + any drink | 749 |
  | + `loaded` | 899 |
  | + one Cairo dip | 749 |
  | + `toum`, `shatta` | 819 |
  | + `loaded` + `toum`, `shatta` | 969 |
  | + `loaded` + all four dips | 1,109 |

- **Cart:** `addLine`, `lines`, `hydrated` from `useCartStore`; `MAX_LINE_QUANTITY` and `getQuantityInCart(lines, selection)` (0 for an incomplete build, so the room is the full 20 until then).
- **Customiser state:** `store/customizer.ts` gains a second target kind, `{ kind: "combo"; comboId }`, and an action to open it; `openId` keeps giving each open a fresh mount. The chosen refs per slot, upgrade ids, dip ids per group and quantity are local state in the builder.
- **Authored copy,** the only words not from data: "Combo" (pill), "Build", "Upgrade", "Required", "Included", "Optional", "Step … of …:", and the punctuation of the announcement. Slot headings, option names, the description and every price come from the file.
- **Env vars:** none. **Zod schemas:** none (not a form). **New types:** the store's combo target and component props only.

## Implementation outline

Files to create:

- `components/customizer/combo-customizer.tsx`: client; the builder for one combo inside `CustomizerPanel` (slot state, upgrade, dips, quantity, total, pending step, add, announcement).
- `components/customizer/choice-picker.tsx`: client; one required single-choice step (numbered heading row and radio tiles). Controlled and data-free: labels, tags and sublines are passed in. Spec 14 can reuse it.
- `app/menu/combo-card.tsx`: server; the dark poster card for one combo, with the Build button. Next to the route because only `/menu` uses it; it moves to `components/menu/` when spec 15 or 16 needs it.

Files to modify:

- `store/customizer.ts`: the combo target kind and its open action.
- `components/customizer/customizer-root.tsx`: resolve a combo target and mount the combo builder, keyed by `openId`.
- `components/customizer/add-button.tsx`: able to open a combo target, with its own word ("Build"), accessible name and a focus ring for a dark card.
- `components/customizer/item-customizer.tsx`: only to share the add-on status helper (`getAddOnStatus`) with the combo builder instead of copying it. No behaviour change.
- `lib/cart/copy.ts`: the new home of `getAddOnStatus`, beside `getAddOnRule`.
- `components/customizer/customizer-shell.tsx`: only to let the footer button's text wrap while a choice is pending.
- `lib/menu.ts`: `getComboSteps` and `getCategoryCombos`.
- `app/menu/category-section.tsx`: render the section's combo cards between the ungrouped grid and the sub-groups.
- `app/menu/page.tsx`: only if the combos are passed down rather than looked up in the section.
- `components/ui/radio-group.tsx`: only if the tiles need a class the restyled version lacks.
- `CLAUDE.md`: after verification, set spec 13 to `Implemented` and update the "Current state" paragraph (the combo card, the builder, the new files, the store's second target).

Files that stay as they are: `data/menu.json`, `types/`, `lib/cart/line.ts`, `lib/cart/pricing.ts`, `lib/cart/summary.ts`, `lib/customizer.ts`, `lib/format.ts`, `lib/version-colors.ts`, `store/cart.ts`, `store/cart-drawer.ts`, `components/cart/`, `components/menu/`, `components/brand/`, `components/customizer/add-on-picker.tsx`, `size-picker.tsx`, `version-toggle.tsx`, `app/menu/category-bar.tsx`, `app/menu/deals-section.tsx`, `app/layout.tsx`, `package.json`, `package-lock.json`.

Order of work:

- Load the `frontend-design` skill; re-read `SizePicker` and the Base UI radio group props.
- Store target and `CustomizerRoot` branch, with a bare builder that can add a fixed sample, to prove the path into the cart and drawer.
- `ChoicePicker` at 375px with the eight mains and the two drinks; then the included row, Upgrade and dips through `AddOnPicker`.
- Builder logic: completeness, pending step and its scroll, room and quantity clamp, total, "Added", announcement.
- The combo card and its place in the Cairo Crunch section; the `AddButton` change.
- `npm run lint`, `npm run build`, browser checks at 375px and desktop, then the CLAUDE.md update.

## Edge cases

- **Do not assume three slots or their ids.** Steps are whatever `slots` holds, numbered by position; "complete" is every options slot chosen (`normalizeSelection` defined).
- **Do not assume the options alternate Authentic / Lahori.** The two-column rows line up today only because of file order; nothing may pair tiles by index.
- **Version tag is by variant count, not by slot id.** A drink has one variant and gets no "Regular" tag (as the cart leaves it out).
- **Same name risk:** tiles show the variant `name`; Hawawshi and Faroge share one image across versions, which is why tiles carry no photo.
- **Veg:** only the Authentic Ful and Tamaya are tagged; `getTags(item, variant)` reads both levels. The combo itself is never marked veg (the fries and drinks carry no tag).
- **Price is flat.** Ful Masala Roll alone is Rs. 749, the combo's price; the builder never reads a main's variant price and never shows a tile price. This is the owners' assumption in `_notes`, not a bug to fix here.
- **Incomplete selection and the helpers:** `getQuantityInCart` returns 0 and `addLine` refuses an incomplete build; the builder must not call `addLine` until complete, so the refused notice is never seen in normal use.
- **Room is per exact build.** 20 of one build must not block another. The clamp runs in the change handler, not in an effect (the `react-hooks` lint rule), and one handler serves slots, upgrade and dips.
- **Upgrade through `AddOnPicker`:** it is a multi-select; with one upgrade that is an on / off tile. Its ids go to `upgradeIds`, never into `addOns`.
- **Dips are per combo unit:** quantity 2 with Toum and Shatta is two of each, one free per combo (spec 07).
- **Free slot follows menu order** (spec 12): the drawer may mark a different dip "Free" than the one tapped first. Same total.
- **`AddButton`'s stretched layer** needs the card to be `relative isolate` with no transform or filter on the button itself (the note in `add-button.tsx`).
- **Dark card, dark focus ring:** `AddButton`'s `focus-visible:ring-card-foreground` is for cream cards and would vanish here.
- **Long pending label** at 375px: "Choose your pocket or wrap" beside the stepper. It wraps to two lines; it must not push the stepper or overflow.
- **Category bar tracking:** the Cairo Crunch section grows by one card; the bar's observers work from section ids and need no change, but check the active chip while scrolling past the combo.
- **Static routes:** the card is a server component with one client button; `/` and `/menu` stay prerendered.
- **Stale saved cart:** a stored combo line whose main or drink the menu no longer offers is dropped whole on load (`sanitizeStoredLines`); nothing new here.
- **Route change with the sheet open:** `CustomizerRoot` already closes it.
- **`AGENTS.md`:** `next dev` rewrites it; commit it with the work if it changes.

## Acceptance criteria

- [x] `/menu` shows one combo card in the Cairo Crunch section, after the six ungrouped cards and before Sides and Drinks, with the combo image, "Combo" pill, two-colour "Cairo Combo" heading, the description, a navy "Rs. 749" tag, the red "Loaded" tag with "+ Rs. 150", and a gold "Build" button.
- [x] The card is dark with a gold ring (not cream), the whole card is one tap target, and its button is named "Build Cairo Combo".
- [x] No other section shows the card, and the category bar has no new chip.
- [x] Tapping the card opens the customiser sheet with the combo image on the stage, the title, description and "Rs. 749".
- [x] The sheet lists, in order: step 1 "Choose your pocket or wrap" with eight tiles in file order; step 2 "Side" with a non-interactive Cairo Fries row marked "Included"; step 3 "Choose your drink" with Limonana and Karkade; "Upgrade" with one Loaded tile at "+ Rs. 150"; "Cairo Dips" with four tiles and "1 free, then Rs. 70 each".
- [x] Each main tile shows the variant name and a navy "Authentic" or red "Lahori Twist" tag; Ful Medames Sandwich and Tamaya Sandwich show the veg indicator; drink tiles show their description and no tag; no tile shows a price.
- [x] Nothing is preselected. Steps 1 and 3 read "Required" until chosen; a chosen step's disc shows a tick.
- [x] With no main the button reads "Choose your pocket or wrap"; with a main and no drink, "Choose your drink"; tapping it scrolls to that step and focuses its first tile, and adds nothing.
- [x] With both chosen the button reads "Add to cart · Rs. 749"; with Loaded "Rs. 899"; with Loaded, Toum and Shatta "Rs. 969"; with Loaded and all four dips "Rs. 1,109". One dip alone leaves the total unchanged and its heading reads "Free".
- [x] Changing the main or the drink never changes the total.
- [x] Adding 2 × (Lahori Tikka Hawawshi, Karkade, Loaded, Toum + Shatta) shows "Added", closes the sheet, and the drawer lists one "Cairo Combo" line with Lahori Tikka Hawawshi, Cairo Fries, Karkade, Loaded "+ Rs. 150", Garlic Tahini (Toum) "Free", Shatta "+ Rs. 70", "Rs. 969 each", total Rs. 1,938.
- [x] The stored line is `kind: "combo"`, `comboId: "cairo-combo"`, `slots` for `main` and `drink` only, `upgradeIds: ["loaded"]`, `addOns: [{ groupId: "cairo-dips", optionIds: ["shatta", "toum"] }]`, with no price or name.
- [x] Building the same combo again raises that line; changing only the main, only the drink, only Loaded or only the dips makes a separate line.
- [x] The announcement after that add reads "2 × Cairo Combo (Lahori Tikka Hawawshi, Cairo Fries, Karkade, Loaded) with Garlic Tahini (Toum), Shatta added to cart. Subtotal Rs. 1,938." Without Loaded or dips those parts are absent.
- [x] With 20 of one build in the cart, reaching that build shows the "already have 20" line with the stepper and button inert; changing any choice restores them. With 18, quantity 5 then completing that build drops the quantity to 2.
- [x] Reopening the builder starts empty at quantity 1.
- [x] While "Added" shows, every picker is inert.
- [x] Item sheets (a pizza, Hawawshi, Zinger Burger, Karkade) behave exactly as after spec 12.
- [x] Slot headings, option names, descriptions, the upgrade and every price come from `menu.combos` and the items through `lib/menu.ts` and `lib/cart/pricing.ts`; no combo, slot, item, upgrade or group id, name or price is a literal in the new or changed files.
- [x] `choice-picker.tsx` imports neither `lib/menu.ts` nor a store; `AddOnPicker` is reused unchanged for Upgrade and dips.
- [x] Each options slot is a radio group named by its heading with arrow-key movement; every tile is at least 44px tall and shows the gold focus ring on both fills; chosen is shown by fill, tick and state.
- [x] No hex values or `zinc` / `gray` / `neutral` classes in the new or changed files; no stock radio dot.
- [x] At 375px nothing overflows: tile names wrap inside their tiles, "Rs. 22,180" fits the button on one line, the pending label wraps without moving the stepper, and the card's price tag does not wrap.
- [x] With `prefers-reduced-motion: reduce`, choosing a tile and the card's reveal happen without animation.
- [x] `data/menu.json`, `types/`, `lib/cart/line.ts`, `lib/cart/pricing.ts`, `lib/cart/summary.ts`, `store/cart.ts`, `components/cart/`, `package.json` and `package-lock.json` are unchanged; no shadcn component was added.
- [x] No hydration warning on `/` or `/menu`, with a saved cart holding a combo line and without.
- [x] `npm run lint` exits with no errors or warnings.
- [x] `npm run build` completes, with `/` and `/menu` still prerendered as static.

## Verification

No automated tests (per CLAUDE.md).

- `npm run lint` passes.
- `npm run build` passes, and its route list still shows `/` and `/menu` as static.
- `git status` shows only the three new files, the modified files the outline allows, this spec, and `CLAUDE.md` once the status is updated (`AGENTS.md` only if `next dev` rewrote it).
- Manual checks in the browser with `npm run dev`, starting from an empty cart (delete `drippin-bites-cart` in DevTools → Application → Local Storage):
  - **375px, card:** scroll the Cairo Crunch section; the combo card sits between the cards and Sides / Drinks, dark with the gold ring; compare name, description, price and the Loaded price with `data/menu.json`; tap the image, the text and the button, each opens the sheet.
  - **375px, builder:** read the five sections against `menu.combos[0]`; compare the eight names and their tags with the Cairo Crunch variants; tap the pending button at each stage and watch it scroll and focus; choose and change a main and a drink; toggle Loaded; choose one to four dips and compare every total with the worked table.
  - **Add and merge:** the build from the acceptance criteria at quantity 2; the same again (quantity 4); then with Limonana (new line), without Loaded (new line), with Toum only (new line). Compare each line's rows, marks, "each" price and the subtotal in the drawer.
  - **Maximum:** raise one build to 18 in the drawer; rebuild it at quantity 5 (drops to 2 when the last choice completes it), add; rebuild it again (inert, message), change the drink (live).
  - **Wrapping:** Loaded with four dips at quantity 20 reads "Rs. 22,180" on one line; "Lahori Tikka Hawawshi" and "Ful Medames Sandwich" wrap inside their tiles.
  - **Other sheets:** open `tikka`, `hawawshi`, `zinger-burger`, `karkade`; unchanged.
  - **Desktop:** the card in two columns; the builder in the right column scrolling under a fixed footer; hover ring on tiles; hover lift on the card.
  - **Keyboard only:** Tab to the card's button, Enter; Tab into step 1, arrows between tiles; on to the drink, Loaded (Space), dips, the button; Enter adds; focus returns to the card's button.
  - **Screen reader or accessibility tree:** "Step 1 of 3" in the heading names; radio groups with `aria-required`; the included group; one announcement per add.
  - **Reload:** combo lines survive with their detail rows.
  - **Category bar:** the Cairo Crunch chip stays active while the combo card is under the bar.
  - **Reduced motion emulated:** no fill, press or reveal animation.
  - **Console and dev-server terminal:** no errors, no hydration warnings, no controlled / uncontrolled warning from the radio or toggle groups.
- Repeat the 375px add and reload checks once against `npm run build` + `npm run start`.

## Open questions

None for you. Three conflicts with the code found while planning were settled on 2026-10-13 and folded in: the veg pill wraps under the version tag, the shell's footer button may wrap its text while a choice is pending, and `PriceTag` gets a cream ring on the dark card. The four questions from the first draft were answered on 2026-10-13, each confirming the draft, and are folded into the sections above: the builder is one scrolling sheet with numbered steps, not a wizard; the main is chosen from eight one-tap tiles with navy / red version tags, not four dishes and a toggle; the combo card sits between the six Cairo cards and Sides / Drinks; and it is a dark poster card with a gold ring. Decided the same day: Loaded is shown as its label only.

Still with the owners:

- What does the Loaded combo upgrade include? (CLAUDE.md question 10.) The file and the printed menu give only the word and "+Rs.150"; a one-line description needs their answer and a `menu.json` field.
- Already assumed in the combo's `_notes` and unchanged here: the combo takes all eight pockets and wraps at Rs. 749 (including the Rs. 749 Ful Masala Roll) and its drink is a Cairo drink. The combo gets the "1 free" Cairo dip through its `addOnGroups`.
