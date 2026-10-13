# Spec 10: Pizza Size Selection

**Status:** Implemented
**Depends on:** 09 (and through it 05, 06, 07, 08)

## Summary

Make the 17 pizzas orderable: their cards get the Add control, and the customiser gains a required size choice that lists only the sizes that pizza is sold in, each with its own price. Pizzas are a third of the menu and the bulk of the deals, so until this lands the demo cannot build a believable order; it is also the first picker placed in the options area spec 09 left empty, and sets the pattern specs 11 and 12 follow.

## Goals

- The Add control on every pizza card, through the one `canCustomize` predicate (33 cards become 50; the four Cairo version items stay without one until spec 11).
- A size picker in the customiser's options area: one tile per entry in `item.variants`, in file order, labelled from `menu.sizes`, showing that variant's price.
- The choice is required. Decided: nothing is preselected; until a size is chosen the footer button reads "Choose a size" and cannot add.
- Choosing a size sets the selection's `variantId`, the live total in the Add button, and the room left for that exact line.
- A pizza added in two sizes makes two cart lines; the same size twice merges. The drawer already tags the size (spec 08).
- One reusable, data-free picker component, so spec 14 can reuse the tile look if it wants it.
- `npm run lint` and `npm run build` pass.

## Out of scope

- The Authentic / Lahori Twist toggle (spec 11) and dips pickers (spec 12). Pizzas have no `addOnGroups`, so nothing else appears in the options area here.
- Choosing a pizza flavour or size inside a deal (spec 14). `getDealPizzaOptions` and `menu.deals` are not read.
- Crust, toppings, half-and-half, "make it a meal" or any option `menu.json` does not have.
- Size diameters, slice counts or "serves 2" hints. The file has only `id` and `label` per size; none are invented.
- A size choice on the card itself, or remembering the last size chosen between opens.
- Changing the size of a line already in the cart (specs 07 and 08 keep lines add / re-quantify / remove only).
- Changes to the cart drawer, `CartLine`, the cart store, pricing or summary functions, or `types/`. The size tag and the per-size line are already handled.
- Editing `data/menu.json`.
- Future phases from CLAUDE.md section 3: backend, auth, payments, WhatsApp Cloud API, admin dashboard, videos.
- Tests of any kind.

## User flow

On a phone, on `/menu`:

1. Every pizza card now carries the gold Add disc beside its "From Rs. 499" tag. The sizes line under the description ("Small · Medium · Large · Extra Large") is unchanged.
2. They tap the Tikka card. The sheet slides up: the pizza on its stage, "Tikka" in poster type, the description, then under a thin gold rule a "Size" heading marked "Required" and four tiles in a two-by-two grid: Small Rs. 499, Medium Rs. 999, Large Rs. 1,599, Extra Large Rs. 2,299.
3. No tile is selected. The footer shows the stepper at 1 and a gold button reading "Choose a size".
4. They tap "Large". The tile fills gold; the button now reads "Add to cart · Rs. 1,599".
5. They tap + once: "Add to cart · Rs. 3,198". They change to "Medium": the tile moves and the button reads "Rs. 1,998"; the quantity stays at 2.
6. They tap the button: "Added", the sheet closes, the badge pops to "2" and the mobile cart bar shows "2 items · Rs. 1,998".
7. The drawer lists "Tikka" with a small "Medium" tag. Adding Tikka again in Large makes a second line; adding Medium again raises the first.
8. If in step 3 they tap "Choose a size" without choosing, the sheet scrolls the size tiles into view and puts focus on the first one. Nothing is added.
9. Lasagna shows only two tiles (Large, Extra Large); Crown Crust shows three.

## UI & design

Reference: the navy price tags and size columns on the pizza pages in `docs/menu-reference/`; `docs/brand/poster-*.jpeg` for the gold hairline and tracked small caps. Reference only. Load the `frontend-design` skill when implementing.

### Card

- No new design. Pizzas are row cards, so they get spec 09's 44px gold disc (`AddButton` with `layout="row"`), the whole-card tap area, the hover lift and the dark focus ring.
- The widest pizza tag, "From Rs. 1,349" (Kabab Stuffing), must stay on one line beside the disc at 375px. Spec 09 chose the icon-only disc for this case.
- Accessible name stays "Add Tikka to cart", `aria-haspopup="dialog"`.

### Size picker (in the customiser's options area)

- **Place:** after the description, under the fading gold hairline spec 09 reserved for the first option section (`h-px`, `from-transparent via-primary/60 to-transparent`, the same one the footer uses).
- **Heading row:** "Size" in the pill-label type style already used for `item.subtitle` in the sheet (`text-xs`, medium, `tracking-[0.18em]`, uppercase, `text-primary`), rendered as an `h3`; at the end of the row "Required" in the same size, `text-muted-foreground`. Once a size is chosen "Required" is replaced by nothing (no tick, no colour change); the filled tile says it.
- **Tiles:** a two-column grid, 10px gap, at every width (the desktop column is about 400px wide, too narrow for four across with "Extra Large"). With an odd number of sizes the last tile spans both columns, so there is no hole. Each tile is at least 60px tall with `rounded-xl`, the size label on the first line (body font, semibold, about 15px) and the price on the second (`tabular-nums`, `whitespace-nowrap`, through `formatPrice`).
  - **Unselected:** `bg-secondary` at partial opacity, `ring-1 ring-gold/20`, cream label, `text-muted-foreground` price. No grey border.
  - **Hover (pointer only):** ring strengthens to about `ring-gold/50`, 150ms.
  - **Selected:** `bg-primary text-primary-foreground` for both lines (price at about 80% opacity), a soft `shadow-md shadow-black/30`. The same gold-pill language as the Add button, so the two read as one decision. No separate radio dot.
  - **Press:** `active:scale-[0.98]`, 150ms.
  - **Focus:** the gold ring with the dark offset the stock `Button` uses, so it shows around a gold-filled tile too.
- **Component:** decided: shadcn `radio-group` (Base UI `RadioGroup` / `Radio`), not the `toggle-group` spec 11 will use, added with `npx shadcn add radio-group` and restyled as above; the stock dot indicator is not rendered. A radio group is the right semantic for one required choice and brings arrow-key movement. No new npm package: `@base-ui/react` is already installed.
- **No standalone price line for sized items (decided).** Spec 09 prints the unit price under the description; for a pizza the tiles are the price list and the button carries the total, so that line is left out rather than showing "From Rs. 499" a third time. Single-variant items keep it.

### Footer

- **No size chosen:** the gold button reads "Choose a size", centred, no total. It is not inert: tapping it scrolls the picker into view inside the sheet's scrolling body and focuses the first tile. The stepper works (1 to `MAX_LINE_QUANTITY`).
- **Size chosen:** spec 09's button, "Add to cart · Rs. 1,599", total = that variant's unit price × quantity.
- Everything else in the footer (the "Added" swap, the notice line, safe-area padding) is unchanged.

### States

- **Chosen size already at the maximum in the cart:** spec 09's muted line, "You already have 20 of these in your cart.", with the stepper and button inert. The tiles stay live, so another size can be chosen and added.
- **Chosen size with less room than the current quantity** (18 Large in the cart, quantity 5, then Large chosen): the quantity drops to the room left (2). No message.
- **Saved cart not loaded yet:** as spec 09; the button is inert with no total. Tiles can already be chosen.
- **Refused add:** spec 09's error line. Not reachable with a valid size; a guard.
- **Missing image:** `ProductImage`'s fallback. Every pizza uses its category image (`getImage` falls through to `category.image`), so the stage does not change when the size does.
- **Empty / loading / error:** none. No network.

### Motion

- Tile fill and ring: 150ms colour transition. The button's label change ("Choose a size" → "Add to cart · …") is instant, like the total.
- The scroll to the picker is smooth, and instant under `prefers-reduced-motion`. Everything else falls under the global reduced-motion rule.

### Accessibility

- The tiles are a `radiogroup` labelled by the "Size" heading and marked required (`aria-required`). Each radio's name is label and price: "Large, Rs. 1,599".
- Arrow keys move and select within the group; Tab enters on the selected tile, or the first when none is.
- The button's accessible name follows its text: "Choose a size", then "Add to cart, Rs. 1,599". No extra live region; the radio announces its own state.
- The post-add announcement names the size, in the order message's format from CLAUDE.md section 6: "2 × Tikka (Medium) added to cart. Subtotal Rs. 1,998."
- Tiles are at least 60px tall and half the body width, well over 44px.
- Heading order: the dialog title is `h2`, "Size" is `h3` (spec 09).

### Responsive

- **375px first:** at 375 × 812, Chicken Supreme (the longest pizza description, 150 characters) shows the stage, title, description and all four tiles above the footer without scrolling. On shorter screens the body scrolls and the footer stays; "Choose a size" brings the tiles into view.
- "Add to cart · Rs. 49,980" (20 × Kabab Stuffing XL, the largest pizza total) fits the button on one line at 375px, by the same rule as spec 09.
- **`md` and up:** the tiles sit in the right-hand column under the description, still two across.

## Data

- **`menu.json`,** through `lib/menu.ts` only:
  - `category.variantType === "size"` on `classic-pizza` (9 items), `special-pizza` (3) and `premium-pizza` (5). Read with `getVariantType(item, category)`, which also covers an item-level value.
  - `item.variants[]`: `{ id, price }` only for pizzas. Order in the file is small → xl and is kept.
  - `sizes[]` `{ id, label }` through `getVariantLabel(item, category, variant)` ("Small", "Medium", "Large", "Extra Large"). No size label is a literal.
  - Sizes on offer today: all four on 11 pizzas (the nine classics, `hot-dragon`, `afghani-malai-boti`); medium / large / xl on five (`crown-crust`, `drippin-special-pizza`, `sauce-stuffing`, `cheese-stuffing`, `kabab-stuffing`); large / xl on `lasagna`.
  - `getDisplayName`, `getDisplayDescription`, `getImage`, `getTags(item)` as in spec 09. Pizza variants carry no `name`, `description`, `image` or `tags`, so only the price and the room left change with the size. `hot-dragon` has the item-level `new` tag.
- **Predicate:** `canCustomize` in `lib/customizer.ts` becomes "single variant, or `variantType` is `size`". It needs the category as well as the item, since the pizza `variantType` is on the category; both callers (`ItemCard`, `CustomizerRoot`) already hold it. Version items (`variantType: "version"`) stay false until spec 11.
- **Selection:** `ItemSelection` `{ kind: "item", itemId, variantId: <size id>, addOns: [] }`. Built only once a size is chosen; before that there is no selection, no unit price and no `getQuantityInCart` lookup.
- **Pricing:** `getUnitPrice(selection)` for the total, as in spec 09. The tile prices are `variant.price` read for display.
- **Cart:** `addLine`, `lines`, `hydrated`, `MAX_LINE_QUANTITY`, `getQuantityInCart`; unchanged. Line identity already includes `variantId`. `getLineSummary` already returns `variantLabel` and `hasMultipleVariants`, and `CartLine` already renders the neutral size tag.
- **Customiser state:** the chosen size is local state in `ItemCustomizer`, beside the quantity, and resets on every open through the existing `key={openId}` remount. Nothing is added to `store/customizer.ts`.
- **Authored copy:** "Size", "Required", "Choose a size". Everything else comes from data or spec 09.
- **Env vars:** none. **Zod schemas:** none (a required radio choice gated by the button, not a form; section 13 applies to checkout). **New types:** none beyond component props.

## Implementation outline

Files to create:

- `components/ui/radio-group.tsx`: generated by `npx shadcn add radio-group`; the Base UI radio primitives.
- `components/customizer/size-picker.tsx`: client; the heading row and the tiles. Controlled (options with id, label and price; the chosen id; a change callback); no menu or store imports.

Files to modify:

- `lib/customizer.ts`: widen `canCustomize` to size-variant items; update its comment.
- `components/menu/item-card.tsx`: pass the category to the predicate. Stays a server component.
- `components/customizer/customizer-root.tsx`: the same call change, and its "still waiting for its picker" comment.
- `components/customizer/item-customizer.tsx`: hold the chosen size for sized items, render the rule and `SizePicker` in the options area, build the selection and total from the chosen variant, clamp the quantity when the room changes, drop the unit-price line for sized items, name the size in the announcement, and handle "Choose a size".
- `components/customizer/customizer-shell.tsx`: let `CustomizerPanel` show a different label and action on the footer button while a choice is still needed (today it hard-codes "Add to cart"). Specs 11–14 reuse this.
- `CLAUDE.md`: after verification, set spec 10 to `Implemented` and update the "Current state" paragraph (which items can be added; the new files).

Files that stay as they are: `data/menu.json`, `types/`, `lib/menu.ts`, `lib/format.ts`, `lib/cart/`, `store/`, `components/cart/`, `components/customizer/add-button.tsx`, `components/menu/price-tag.tsx`, `app/`, `package.json`, `package-lock.json` (the radio group comes from `@base-ui/react`, already a dependency; if `shadcn add` wants to install anything, stop and say so).

Order of work:

- Read `components/ui/radio-group.tsx` once generated and the Base UI radio docs for its real props (CLAUDE.md: not Radix). Load the `frontend-design` skill.
- Widen the predicate and check the 50 cards on `/menu` at 375px, the Kabab Stuffing row in particular.
- Build `SizePicker` and the shell's pending-choice button state.
- Wire `ItemCustomizer`: size state, selection, total, quantity clamp, announcement.
- The states: maximum per size, switching sizes, not hydrated, two- and three-size pizzas, keyboard.
- `npm run lint`, `npm run build`, browser checks, then the CLAUDE.md update.

## Edge cases

- **First variant is not the smallest:** `lasagna` starts at `large`. Nothing may assume `small` exists or preselect `getDefaultVariant`.
- **No selection yet:** `getUnitPrice` and `getQuantityInCart` need a valid selection; they must not be called with a made-up `variantId`, and the `hydrated`-gated total must not flash a price for a size nobody chose.
- **Room is per size:** 20 Large in the cart must not block Medium. The stepper maximum and the "already have 20" line follow the chosen size only.
- **Quantity clamp on size change** must be done in the change handler or derived at render, not in an effect; the installed `react-hooks` lint rules flag a synchronous `setState` in an effect (spec 09).
- **Clamp to zero:** when the chosen size has no room, the stepper shows its inert state (spec 09) and the quantity must come back to at least 1 when a size with room is chosen.
- **Size change during "Added":** the tiles must be inert for the 600ms pause, like the stepper and button, or the announcement could name a different size from the one added.
- **"Choose a size" must not look disabled.** It is a live gold button that guides; only the hydration and maximum cases make the button inert.
- **Scroll target:** below `md` the scrolling element is the stage-and-body wrapper; from `md` it is the body column. The scroll-into-view must work in both and must not scroll the page behind the sheet.
- **Radio group with no value:** Base UI must be given a controlled empty value rather than switching from uncontrolled to controlled on the first choice.
- **Stretched card tap area:** unchanged; pizza cards still hold exactly one control.
- **`ItemCard` with a `variant` prop** (specs 13 and 15): pizzas are never shown that way today; the predicate stays item-level and the customiser still asks for the size.
- **Single-variant items are untouched:** no "Size" section, the unit-price line and "Add to cart" button exactly as spec 09 left them. An item whose category has `variantType: "size"` but only one variant (none today) would show one tile and still require the tap; accepted.
- **Stale saved cart:** a stored line with a size the pizza no longer has is already dropped by `sanitizeStoredLines`.
- **Client boundary:** `size-picker.tsx` takes plain props; `item-card.tsx` gains no `"use client"`; `/` and `/menu` stay static.
- **`AGENTS.md`:** `next dev` rewrites it; commit it with the work if it changes.

## Acceptance criteria

- [x] On `/menu`, 50 cards carry an Add control and 4 do not: per section in page order 6, 9, 3, 5, 10, 3, 3, 3, 8. Only `hawawshi`, `ful`, `tamaya` and `faroge` have none.
- [x] Every pizza card shows the 44px gold disc on the same line as its price tag at 375px, including "From Rs. 1,349" on Kabab Stuffing.
- [x] Opening `tikka` shows a "Size" section with four tiles in file order: Small Rs. 499, Medium Rs. 999, Large Rs. 1,599, Extra Large Rs. 2,299. No tile is selected and the footer button reads "Choose a size" with no price.
- [x] `lasagna` shows exactly Large Rs. 1,649 and Extra Large Rs. 2,399; `crown-crust` shows Medium, Large and Extra Large with the last tile spanning the row.
- [x] Tapping "Choose a size" with nothing chosen adds nothing, brings the tiles into view and focuses the first tile.
- [x] Choosing Large on `tikka` fills that tile gold and the button reads "Add to cart" with "Rs. 1,599"; quantity 2 gives "Rs. 3,198"; switching to Medium gives "Rs. 1,998" and keeps the quantity.
- [x] Adding 2 × Tikka Medium shows "Added", closes the sheet and sets the badge to "2". The drawer lists "Tikka" with a neutral "Medium" tag at Rs. 1,998; the stored line is `kind: "item"`, `itemId: "tikka"`, `variantId: "medium"`, `addOns: []`.
- [x] Adding Tikka Large afterwards makes a second line; adding Tikka Medium again raises the first to 3.
- [x] The announcement after an add names the size: "2 × Tikka (Medium) added to cart. Subtotal Rs. 1,998."
- [x] With 20 of Tikka Large in the cart, choosing Large shows the "already have 20" line with the stepper and button inert, and choosing Medium restores them. With 18, choosing Large at quantity 5 drops the quantity to 2.
- [x] Reopening any pizza starts with no size chosen and quantity 1.
- [x] `hot-dragon` shows its "NEW" badge in the sheet. No pizza shows a standalone unit-price line; `zinger-burger` still shows "Rs. 449" and no "Size" section.
- [x] The tiles are a radio group named "Size" and marked required; each radio is named with its label and price; arrow keys move the choice; every tile is at least 44px and shows the gold focus ring.
- [x] Size labels come from `menu.sizes` through `getVariantLabel` and prices from `variants[].price`; no size name, price or item name is a literal in the changed files. The total comes from `getUnitPrice`.
- [x] `canCustomize` is still the one rule, used by `ItemCard` and `CustomizerRoot`; `components/menu/item-card.tsx` has no `"use client"`; `size-picker.tsx` does not import `lib/menu.ts` or a store.
- [x] No hex values or `zinc` / `gray` / `neutral` classes in the new or changed files; no stock radio dot, grey border or navy fill on the dark sheet.
- [x] With `prefers-reduced-motion: reduce`, the tile change and the scroll to the picker happen without animated movement.
- [x] `data/menu.json`, `types/`, `lib/menu.ts`, `lib/cart/`, `store/`, `components/cart/`, `package.json` and `package-lock.json` are unchanged; `radio-group` is the only shadcn component added.
- [x] No hydration warning on `/` or `/menu`, with a saved cart holding sized lines and without.
- [x] `npm run lint` exits with no errors or warnings.
- [x] `npm run build` completes, with `/` and `/menu` still prerendered as static.

## Verification

No automated tests (per CLAUDE.md).

- `npm run lint` passes.
- `npm run build` passes, and its route list still shows `/` and `/menu` as static.
- `git status` shows only: `components/ui/radio-group.tsx` and `components/customizer/size-picker.tsx` added; `lib/customizer.ts`, `components/menu/item-card.tsx`, `components/customizer/customizer-root.tsx`, `item-customizer.tsx` and `customizer-shell.tsx` modified; this spec; `CLAUDE.md` once the status is updated (and `AGENTS.md` only if `next dev` rewrote it).
- Manual checks in the browser with `npm run dev`, starting from an empty cart (delete `drippin-bites-cart` in DevTools → Application → Local Storage):
  - **375px, cards:** count the Add controls per section against the criteria; in the three pizza sections every tag and disc share a line (check Kabab Stuffing and Afghani Malai Boti).
  - **375px, sheet:** open `tikka` (four sizes), `crown-crust` (three), `lasagna` (two), `chicken-supreme` (longest description), `hot-dragon` ("NEW"). At 375 × 812 the tiles are visible without scrolling; at 375 × 667 scroll the body and confirm the footer stays.
  - **Prices:** compare every tile on those five with `data/menu.json`.
  - **Choose a size:** tap the button before choosing, at 375 × 667 with the tiles off-screen; the tiles come into view and nothing is added.
  - **Totals:** Tikka Large × 2 = Rs. 3,198; switch to Medium = Rs. 1,998; Kabab Stuffing Extra Large × 20 = Rs. 49,980 on one line in the button.
  - **Add and merge:** 2 × Tikka Medium, then 1 × Tikka Large, then 1 × Tikka Medium: two lines (3 Medium, 1 Large), subtotal 3 × 999 + 1,599 = Rs. 4,596, each with its size tag in the drawer.
  - **Maximum:** raise Tikka Large to 18 in the drawer; reopen Tikka, set quantity 5, choose Large (drops to 2), add; reopen and choose Large (inert, message), then Medium (live again).
  - **Single-variant items:** open `zinger-burger` and `chipotle-sauce`; unchanged from spec 09.
  - **Desktop:** two-column panel with the tiles under the description; hover ring on tiles; the page behind does not move.
  - **Keyboard only:** Enter on a pizza card's button opens the sheet; Tab reaches the size group; arrows change the size; Tab to the button; Enter adds; focus returns to the card's button.
  - **Screen reader or accessibility tree:** a required radio group named "Size", radios named with label and price, one announcement per add including the size.
  - **Reload:** sized lines survive with their tags; a hard reload followed straight away by an add lands on top of the saved lines.
  - **Reduced motion emulated:** no smooth scroll or tile animation.
  - **Console and dev-server terminal:** no errors, no hydration warnings, no controlled / uncontrolled warning from the radio group.
- Repeat the 375px add and reload checks once against `npm run build` + `npm run start`.
