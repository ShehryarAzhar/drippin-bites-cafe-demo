# Spec 12: Dips Pickers

**Status:** Implemented
**Depends on:** 09 (and through it 05, 06, 07, 08); builds on 10's and 11's customiser changes

## Summary

Add the dips to the customiser: one picker, driven by the add-on group's own data, that serves both the Cairo dips on the four version items (first free, then Rs. 70 each) and the paid Extra Dips on burgers, sandwiches and wraps. The cart already validates, prices and lists add-ons (spec 07) and the drawer already prints them (spec 08); this spec is the missing surface where the customer chooses them. For the pitch it is the first upsell the owners see working, and "first dip free" is the detail from the printed Cairo Crunch page that makes the order feel like theirs.

## Goals

- One reusable, data-free picker component, used once per add-on group attached to the open item. Spec 13 reuses it for the combo's `cairo-dips`.
- Groups come from `getItemAddOnGroups(item, category)`, so both attachment levels are covered: item level (`hawawshi`, `ful`, `tamaya`, `faroge` → `cairo-dips`) and category level (`burgers`, `sandwiches`, `wraps` → `dips`). 20 of the 54 items gain a picker; the other 34 are unchanged.
- The rule shown and the money charged both come from the group: `freeCount`, `extraPrice`, per-option `price`, `maxSelect`. Nothing about either group is special-cased by id.
- Dips are optional. Decided: nothing is preselected, including the free Cairo dip, and an item can be added with none.
- Each option can be chosen once per unit (spec 07's rule); the picker is a multi-select, not a counter.
- The chosen dips go into `ItemSelection.addOns`, so the footer total, the room left for that exact line and the cart line all follow them.
- `maxSelect` is respected: at the limit the unchosen options are inert and a short line says why.
- `npm run lint` and `npm run build` pass.

## Out of scope

- The Cairo Combo builder (spec 13). This spec only makes the picker reusable for it; `menu.combos` is not read.
- Deals (spec 14). Deals have no add-on groups.
- More than one of the same dip on one unit (two Toum on one Hawawshi). Spec 07 decided a selection is a set of option ids.
- Any hint of dips on the menu card ("1 dip free"). The cards do not change.
- Linking the standalone `dips` category items (`chipotle-sauce`) to the `dips` add-on options (`chipotle`), or offering a dip picker on those eight items. They stay unrelated (specs 03, 07).
- Cairo dips on the Sando and Croissant sandwiches. Owners' open question 5; the picker follows `addOnGroups`, so it appears there the day the data says so.
- A prompt or warning when a Cairo item is added without its free dip.
- Changing the dips of a line already in the cart, or remembering the last choice between opens.
- Dip photos or per-dip descriptions. `menu.json` has none; the `cairo-dips` group `image` is not used here (the stage already shows the dish).
- Changes to `types/`, `store/`, `lib/cart/line.ts`, `lib/cart/summary.ts` or the cart drawer. Add-on lines are already valid, priced, merged and printed with "Free" / "+ Rs. 70".
- Editing `data/menu.json`.
- Future phases from CLAUDE.md section 3: backend, auth, payments, WhatsApp Cloud API, admin dashboard, videos.
- Tests of any kind.

## User flow

On a phone, on `/menu`:

1. They tap the Hawawshi card. The sheet opens as before: the toggle on Authentic, the title, the description, "Add to cart · Rs. 499".
2. Under a thin gold rule there is now a "Cairo Dips" section: "1 free" in gold at the end of the heading row, the line "1 free, then Rs. 70 each" and four tiles in two columns: Garlic Tahini (Toum), Shatta, Cairo Special, Mint-Yogurt. None is chosen.
3. They tap Shatta. The tile fills gold with a tick, the heading row shows "Free", and the button still reads "Rs. 499".
4. They tap Garlic Tahini (Toum). Two tiles are filled, the heading row reads "+ Rs. 70" and the button reads "Add to cart · Rs. 569".
5. They tap Shatta again to take it off: back to "Free" and "Rs. 499".
6. They flip the toggle to Lahori Twist. The dish swaps (spec 11); the chosen dip stays chosen and the button reads "Rs. 649".
7. They add a second dip, set the quantity to 2 ("Rs. 1,438") and tap the button: "Added", the sheet closes, the badge pops.
8. The drawer lists "Lahori Tikka Hawawshi" with the red tag, and under it the two dips, the first marked "Free" and the second "+ Rs. 70", at "Rs. 719 each".
9. Adding the same Hawawshi with the same two dips later raises that line. With a different dip, or none, it is a separate line.
10. On the Zinger Burger the section is "Extra Dips", marked "Optional", with eight tiles each carrying its own price ("+ Rs. 80", "+ Rs. 60" …). Chipotle and Mint take the button from "Rs. 449" to "Rs. 589". The "Rs. 449" under the description does not change.
11. A pizza, a pasta, a drink or the Sando Sandwich opens exactly as it did after spec 11, with no dips section.

## UI & design

Reference: `docs/menu-reference/05-cairo-crunch.jpeg` for the dips strip and its "1 free" wording; `docs/brand/poster-*.jpeg` for the small gold caps headings. Reference only. Load the `frontend-design` skill when implementing.

### Place in the sheet

- In the options area of `ItemCustomizer`, at the comment spec 11 left ("Dips pickers go here"): after the title, description and (for single-variant items) the unit price, under the fading gold hairline the size section already uses.
- The hairline is drawn once for the whole options area: when the item has a size picker, an add-on group, or both. One group follows another with the body's normal gap and no second rule.
- Order when an item has several sections: size first (required), then add-on groups in the order `getItemAddOnGroups` returns them. No item has both today.
- Decided: every section is always open. The eight Extra Dips are not collapsed behind an "Add dips" row or any other disclosure.
- For version items the toggle stays first in the body and the dips section is outside the keyed block that fades on a version change, so the tiles do not flash or lose focus when the dish swaps.

### Section heading

- Same pattern as `SizePicker`: one row in the pill-label type (`text-xs`, medium, `tracking-[0.18em]`, uppercase).
  - Start: `group.name` ("Cairo Dips", "Extra Dips") as an `h3` in `text-primary`.
  - End, once something is chosen: the running cost of this group for one unit. "Free" in `text-primary` when the chosen dips cost nothing, otherwise "+ Rs. 140" in cream, `tabular-nums`, `whitespace-nowrap`.
  - End, with nothing chosen (decided):
    - `freeCount > 0`: the free allowance in `text-primary`, built from `freeCount`: "1 free" for `cairo-dips`, "2 free" if the number were 2. It is the only nudge towards the free dip; nothing is preselected and nothing prompts.
    - `freeCount: 0`: "Optional" in `text-muted-foreground`, where the size picker shows "Required".
- Under the row, one muted line (`text-[0.8125rem] text-muted-foreground`) stating the group's rule, built from its numbers with `formatPrice`:
  - `freeCount > 0` with an `extraPrice`: "1 free, then Rs. 70 each".
  - `freeCount > 0` and nothing beyond it costs anything: "Included".
  - `freeCount: 0`: no line; the tiles carry their prices.
- Decided: the rule line is composed, not `group.description`. The file's text ("1 free, each additional Rs.70", "Optional paid dips") is written for the data, has "Rs.70" without the formatter's space, and would repeat what the tiles and "Optional" already say.

### Option tiles

- A two-column grid with a 10px gap, the size tiles' family: `rounded-xl`, `bg-secondary/60`, `ring-1 ring-gold/20`, at least 48px tall, `px-4 py-2.5`. An odd one out at the end spans the row.
- **Content:** the option's `name` (body font, semibold, about 15px, left-aligned, allowed to wrap to two lines: "Garlic Tahini (Toum)" and "Thousand Island Sauce" do at 375px). Tiles in one row stretch to the same height.
- **Price line, only where the option has its own `price`:** "+ Rs. 80" on a second line, `text-sm`, `tabular-nums`, `whitespace-nowrap`, `text-muted-foreground`.
- **Decided: no per-tile price in a group priced by `extraPrice`.** Spec 07 gives the free slot to the earliest chosen option in menu order, so a "Free" label on a tile would jump from Shatta to Toum when Toum is added. The rule line and the running cost in the heading say it without anything moving.
- **Unchosen:** as above, cream name. Hover (pointer only): `ring-gold/50`, 150ms.
- **Chosen:** `bg-primary text-primary-foreground`, `shadow-md shadow-black/30`, `ring-primary`, the price line at about 80% opacity, and a lucide `Check` (16px, `aria-hidden`) at the tile's end. The tick's space is reserved on unchosen tiles, so a name does not re-wrap when the tile is chosen.
- **Press:** `active:scale-[0.98]`, 150ms. **Focus:** the gold ring with the dark offset from `components/ui/toggle.tsx`.
- No grey borders, no stock checkbox squares, no `bg-muted` pressed state.

### Component

- Decided: the restyled `ToggleGroup` / `ToggleGroupItem` already in `components/ui/` (Base UI), in its multiple-selection mode, not shadcn `checkbox`. Nothing is added from the registry and no package is installed. Each tile is a toggle button with `aria-pressed`.
- `components/customizer/add-on-picker.tsx` is controlled and data-free, like `SizePicker` and `VersionToggle`: it receives the title, the rule line, the cost text, the options (id, name, optional formatted price), the chosen ids, the maximum and a change callback. It imports neither `lib/menu.ts` nor a store.

### States

- **Nothing chosen:** the default. The heading row ends with "1 free" in `text-primary` on a group with `freeCount > 0` (Cairo Dips) and with "Optional" in `text-muted-foreground` on a group with `freeCount: 0` (Extra Dips). The footer total is the dish alone. Taking the last dip off returns to this state.
- **At `maxSelect`:** the unchosen tiles are inert at 50% opacity and a muted line under the grid reads "That's the most you can add." Chosen tiles stay live, so one can be taken off. With the current file both groups allow every option (`cairo-dips` 4 of 4, `dips` 8 of 8), so this state is never reached; it is built for the data, not for today's menu.
- **"Added":** the picker is inert for the 600ms pause, like the stepper, the size tiles and the toggle.
- **Line at its maximum for this exact choice:** spec 09's "You already have 20 of these in your cart." with the stepper and button inert. The picker stays live: a different set of dips is a different line with its own room.
- **Room smaller than the quantity after a change of dips:** the quantity drops to the room left, by the same rule a size or version change uses. No message.
- **Sized item with nothing chosen yet** (no such item has dips today): the picker is live; the button still reads "Choose a size".
- **Saved cart not loaded yet:** the tiles work; the button is inert with no total, as spec 09.
- **Refused add:** spec 09's error line. Not reachable through the picker; a guard.
- **Group with no options, or `maxSelect` below 1:** the section is not rendered.
- **Empty / loading / error:** none. No network.

### Motion

- Tile fill and ring: 150ms colour transition; press scale as above. The tick appears with the fill, no separate animation.
- The total in the button and the cost in the heading change instantly.
- All of it falls under the global `prefers-reduced-motion` rule.

### Accessibility

- Each section is a group named by its `h3` (`aria-labelledby`) and described by its rule line (`aria-describedby`) when there is one.
- Each tile is a button with `aria-pressed`, named with the dip and, where it has one, its price: "Chipotle Sauce, plus Rs. 80"; "Shatta".
- Arrow keys move between tiles (Base UI's roving focus), Space or Enter toggles. Tab leaves the group to the next section or the footer.
- At the limit the inert tiles are `disabled`; the line under the grid is in the group's description so it is read with it.
- No new live region: the button's name carries the new total ("Add to cart, Rs. 569"), as spec 09 decided for quantity.
- The announcement after an add names the dips, in menu order: "2 × Lahori Tikka Hawawshi (Lahori Twist) with Garlic Tahini (Toum), Shatta added to cart. Subtotal Rs. 1,438."
- Chosen is not colour alone: fill, tick and `aria-pressed`.
- Heading order: the dialog title is the `h2`; each section heading is an `h3`, as "Size" is.
- Every tile is at least 48px tall and half the body wide.

### Responsive

- **375px first:** tiles are about 162px wide. The four Cairo tiles make two rows; the eight Extra Dips make four. The body scrolls and the footer stays; at 375 × 812 the heading of the dips section is visible without scrolling on Hawawshi and on Zinger Burger, so the customer can see there is more.
- "+ Rs. 80" and the heading's "+ Rs. 630" (all eight dips) each stay on one line.
- "Add to cart · Rs. 30,580" (20 × Mushroom Burger with all eight dips, the largest total) fits the button on one line at 375px.
- **`md` and up:** the section is in the right-hand column under the description, still two columns; the column scrolls inside the 85dvh panel and the footer stays.

## Data

- **`menu.json`,** through `lib/menu.ts` only:
  - `getItemAddOnGroups(item, category)` → the groups to render, item level then category level, de-duplicated.
  - From each `AddOnGroup`: `id`, `name`, `freeCount`, `extraPrice?`, `maxSelect`, `options[]` as `{ id, name, price? }`.
  - `cairo-dips`: `freeCount: 1`, `extraPrice: 70`, `maxSelect: 4`; options `toum`, `shatta`, `cairo-special`, `mint-yogurt`, none with a `price`. Attached to items `hawawshi`, `ful`, `tamaya`, `faroge`.
  - `dips`: `freeCount: 0`, no `extraPrice`, `maxSelect: 8`; options `chipotle` 80, `thousand-island` 80, `mint` 60, `sriracha` 80, `signature` 90, `special-white` 90, `garlic-mayo` 70, `buffalo` 80 (630 together). Attached to categories `burgers` (10 items), `sandwiches` (3), `wraps` (3).
  - Not used: `group.description`, `group.image`, `combos`, `deals`, `softDrinks`.
- **Selection:** `ItemSelection.addOns` as `AddOnSelection[]` (`{ groupId, optionIds[] }`), a group with nothing chosen left out. `normalizeSelection` already sorts and checks it.
- **Pricing,** all from `lib/cart/pricing.ts`:
  - the footer total from `getUnitPrice(selection)` × quantity;
  - the group's running cost from `priceAddOnGroup(group, optionIds)`, summed;
  - a tile's own price from `option.price`, formatted for display.
  - The rule line needs `freeCount` and `extraPrice` turned into words. That is a plain function, not component logic; whether it sits in `lib/cart/copy.ts` or beside the pricing is decided in Plan Mode.
- **Worked figures,** for the acceptance criteria:

  | Selection | Unit price |
  |---|---|
  | `hawawshi` / `authentic`, no dips | 499 |
  | + `shatta` | 499 |
  | + `toum`, `shatta` | 569 |
  | + all four Cairo dips | 709 |
  | `hawawshi` / `lahori` + `toum`, `shatta` | 719 |
  | `zinger-burger`, no dips | 449 |
  | + `chipotle`, `mint` | 589 |
  | + all eight Extra Dips | 1,079 |
  | `mushroom-burger` + all eight | 1,529 |

- **Cart:** `addLine`, `lines`, `hydrated`, `MAX_LINE_QUANTITY`, `getQuantityInCart(lines, selection)` with the add-ons in the selection. Unchanged.
- **Customiser state:** the chosen option ids per group are local state in `ItemCustomizer`, beside the quantity and the variant, and reset on every open through the existing `key={openId}` remount. Nothing is added to `store/customizer.ts`.
- **Authored copy,** the only words not from data: "Optional", "Free", "Included", the "… free" template for the heading row (the number from `freeCount`), the "… free, then … each" template, "That's the most you can add.", "with" in the announcement, and the "plus" in a tile's accessible name.
- **Env vars:** none. **Zod schemas:** none (not a form). **New types:** component props only.

## Implementation outline

Files to create:

- `components/customizer/add-on-picker.tsx`: client; one add-on section (heading row, rule line, tile grid, limit line). Controlled and data-free.

Files to modify:

- `components/customizer/item-customizer.tsx`: resolve the item's groups, hold the chosen ids per group, put them in the selection, render one picker per group under the hairline, clamp the quantity on a change of dips, name the dips in the announcement, keep the pickers inert while "Added" shows, and keep the standalone unit price as the dish's own price.
- `lib/cart/copy.ts` or `lib/cart/pricing.ts`: only the small plain function for the rule line, if Plan Mode puts it there.
- `components/ui/toggle-group.tsx` / `toggle.tsx`: only if multiple selection or the inert tiles need a class the restyled versions lack.
- `CLAUDE.md`: after verification, set spec 12 to `Implemented` and update the "Current state" paragraph ("no dips can be chosen until spec 12", the new file).

Files that stay as they are: `data/menu.json`, `types/`, `lib/menu.ts`, `lib/format.ts`, `lib/customizer.ts`, `lib/cart/line.ts`, `lib/cart/summary.ts`, `store/`, `components/cart/`, `components/menu/`, `components/customizer/add-button.tsx`, `customizer-shell.tsx`, `customizer-root.tsx`, `size-picker.tsx`, `version-toggle.tsx`, `app/`, `package.json`, `package-lock.json`.

Order of work:

- Read the Base UI toggle group docs for multiple selection and disabled items; load the `frontend-design` skill.
- Build `AddOnPicker` with fixed sample props at 375px: both tile shapes (with and without a price line), chosen, inert.
- Wire `ItemCustomizer`: groups, state, selection, total, quantity clamp, announcement.
- The states: at the line maximum, version change with dips chosen, "Added", not hydrated, keyboard.
- `npm run lint`, `npm run build`, browser checks at 375px and desktop, then the CLAUDE.md update.

## Edge cases

- **Standalone unit price.** `ItemCustomizer` prints `getUnitPrice(selection)` under the description for single-variant items. Once the selection carries add-ons that figure would climb with every dip and duplicate the button. It must stay the dish's price ("Rs. 449").
- **Free slot follows menu order, not tap order** (`priceAddOnGroup`). Shatta alone is free; with Toum added, the drawer lists Toum as "Free" and Shatta as "+ Rs. 70". The total is the same either way; this is why the Cairo tiles carry no price.
- **`dips` is a category id and an add-on group id.** The picker works from `AddOnGroup` objects, never from a category lookup.
- **Do not assume two groups or their ids.** Sections come from `getItemAddOnGroups`; an item with both groups, or a third group, renders them all.
- **Mixed group** (some options with a `price`, some without; none today): priced tiles show their price, the others none, and the rule line still describes `freeCount` and `extraPrice`.
- **`freeCount` at or above `maxSelect`** (none today): everything is free; the rule line is "Included", the empty heading row still shows the allowance from `freeCount`, and the cost never leaves "Free".
- **Base UI's value is an array** and, in multiple mode, an empty array is a valid value here (unlike the version toggle, which ignores it).
- **Selection order.** State may hold ids in tap order; identity and pricing go through `normalizeSelection`, so Toum + Shatta and Shatta + Toum are one line. Nothing in the component should compare selections itself.
- **Empty group in the selection.** Taking the last dip off must leave the group out of `addOns` (or rely on `normalizeAddOns` dropping it), so "no dips" matches the lines added before this spec.
- **Room is per exact choice.** 20 Hawawshi with Toum in the cart must not block one with Shatta. The clamp runs in the change handler, not in an effect (the `react-hooks` lint rule), and one handler should serve size, version and dips.
- **Version change keeps the dips.** The group is on the item, not the variant; the chosen ids survive the toggle and the picker must not remount with the keyed content block.
- **Change during "Added":** inert, or the announcement could name dips that were not added.
- **Carts saved before this spec:** lines with `addOns: []` stay valid and now sit beside lines with dips for the same dish.
- **Stale saved cart:** a stored dip id the group no longer has drops the whole line (`sanitizeStoredLines`).
- **Long names in a narrow tile:** two lines at most at 375px with the current names; no truncation, no ellipsis.
- **`maxSelect` cannot be exercised** with the current file. It is checked by reading the code, not in the browser, and `menu.json` is not edited to force it.
- **Client boundary:** `add-on-picker.tsx` takes plain props; `/` and `/menu` stay static.
- **`AGENTS.md`:** `next dev` rewrites it; commit it with the work if it changes.

## Acceptance criteria

- [x] Opening `hawawshi`, `ful`, `tamaya` or `faroge` shows a "Cairo Dips" section with four tiles in file order (Garlic Tahini (Toum), Shatta, Cairo Special, Mint-Yogurt), the line "1 free, then Rs. 70 each", none chosen, and "1 free" in `text-primary` at the end of the heading row (not "Optional").
- [x] Opening any of the 16 burgers, sandwiches and wraps shows an "Extra Dips" section with eight tiles in file order, each with its price ("+ Rs. 80", "+ Rs. 80", "+ Rs. 60", "+ Rs. 80", "+ Rs. 90", "+ Rs. 90", "+ Rs. 70", "+ Rs. 80"), no rule line, and "Optional" in `text-muted-foreground` at the end of the heading row.
- [x] The empty heading text follows `freeCount`: the number in "1 free" is read from the group, and the choice between it and "Optional" is `freeCount > 0`, not a group id. Taking the last chosen dip off brings it back.
- [x] Nothing is preselected on any item and no prompt, warning or notice appears when a Cairo item is added with no dip.
- [x] Both sections are always open; there is no collapse or "Add dips" row.
- [x] No dips section on any pizza, pasta, `dips` item, `sando-sandwich`, `croissant-sandwich`, `cairo-fries`, `tamaya-bites`, `limonana` or `karkade`; those sheets are unchanged from spec 11.
- [x] On `hawawshi` Authentic: one dip → heading "Free", button "Rs. 499"; two → "+ Rs. 70", "Rs. 569"; four → "+ Rs. 210", "Rs. 709". Taking one off reverses it.
- [x] Cairo dip tiles show no price of their own, and no tile's text changes when another is chosen.
- [x] On `zinger-burger`: Chipotle and Mint → heading "+ Rs. 140", button "Rs. 589"; all eight → "+ Rs. 630", "Rs. 1,079". The "Rs. 449" under the description does not change.
- [x] With dips chosen on `hawawshi`, switching to Lahori Twist keeps the same tiles chosen and the button reads 649 plus the dips; the picker does not flash or lose keyboard focus.
- [x] Adding 2 × `hawawshi` / `lahori` with Toum and Shatta shows "Added", closes the sheet, and the drawer lists one line "Lahori Tikka Hawawshi" with "Garlic Tahini (Toum)" marked "Free" and "Shatta" "+ Rs. 70", "Rs. 719 each", total Rs. 1,438. The stored line has `addOns: [{ groupId: "cairo-dips", optionIds: ["shatta", "toum"] }]`.
- [x] Adding the same dish with the same dips chosen in the other order raises that line; with one dip, a different dip or none it makes a separate line.
- [x] A dish added with no dips is stored with `addOns: []` and merges with a line added before this spec.
- [x] The announcement after an add names the dips: "2 × Lahori Tikka Hawawshi (Lahori Twist) with Garlic Tahini (Toum), Shatta added to cart. Subtotal Rs. 1,438." With no dips it reads as it did after spec 11.
- [x] With 20 of Zinger Burger + Chipotle in the cart, choosing Chipotle shows the "already have 20" line with the stepper and button inert, and choosing a second dip or taking Chipotle off restores them. With 18, quantity 5 then choosing Chipotle drops the quantity to 2.
- [x] Reopening any item starts with no dips chosen and quantity 1.
- [x] The picker stops at `maxSelect`: in the code, unchosen options are disabled once the chosen count reaches it and the limit line is shown; chosen ones stay live.
- [x] Each section is a group named by its heading; each tile is a button with `aria-pressed`, named with the dip and its price where it has one; arrow keys move between tiles; every tile is at least 44px and shows the gold focus ring on both the plain and the gold fill.
- [x] Group names, option names and every price come from `menu.addOnGroups` through `lib/menu.ts` and `lib/cart/pricing.ts`; no dip name, group name, group id or price is a literal in the new or changed files.
- [x] One picker component serves both groups; `add-on-picker.tsx` does not import `lib/menu.ts` or a store, and has no branch on a group id.
- [x] No hex values or `zinc` / `gray` / `neutral` classes in the new or changed files; no stock toggle or checkbox look.
- [x] With `prefers-reduced-motion: reduce`, choosing a tile happens without animation.
- [x] `data/menu.json`, `types/`, `lib/menu.ts`, `lib/cart/line.ts`, `lib/cart/summary.ts`, `store/`, `components/cart/`, `package.json` and `package-lock.json` are unchanged; no shadcn component was added.
- [x] No hydration warning on `/` or `/menu`, with a saved cart holding add-on lines and without.
- [x] `npm run lint` exits with no errors or warnings.
- [x] `npm run build` completes, with `/` and `/menu` still prerendered as static.

## Verification

No automated tests (per CLAUDE.md).

- `npm run lint` passes.
- `npm run build` passes, and its route list still shows `/` and `/menu` as static.
- `git status` shows only: `components/customizer/add-on-picker.tsx` added; `components/customizer/item-customizer.tsx` modified (plus `lib/cart/copy.ts` or `lib/cart/pricing.ts`, and `components/ui/toggle-group.tsx` / `toggle.tsx`, only where the outline allows); this spec; `CLAUDE.md` once the status is updated (and `AGENTS.md` only if `next dev` rewrote it).
- Manual checks in the browser with `npm run dev`, starting from an empty cart (delete `drippin-bites-cart` in DevTools → Application → Local Storage):
  - **375px, Cairo:** open each of `hawawshi`, `ful`, `tamaya`, `faroge`; four tiles, the rule line, no tile price, "1 free" in gold at the end of the heading row; it returns after the last dip is taken off. On `zinger-burger` the same place reads "Optional". Choose one, two, three, four and compare the heading cost and the button with the worked table. Take them off in a different order.
  - **375px, Extra Dips:** open `zinger-burger`, `grilled-chicken-cheese` and `sweet-and-chilli-wrap`; compare the eight names and prices with `data/menu.json`; choose all eight (Rs. 630). The body scrolls, the footer stays, the unit price line stays at the dish's price.
  - **No section:** open `tikka`, `alfredo-pasta`, `chipotle-sauce`, `sando-sandwich`, `karkade`.
  - **Version + dips:** on Ful choose two dips, flip the toggle both ways; the tiles stay chosen and still, the total follows the version.
  - **Add and merge:** 2 × Hawawshi Lahori with Toum + Shatta; then the same with Shatta tapped first (merges, quantity 4); then with Toum only (new line, Rs. 649); then with none (new line). Add Zinger Burger with Chipotle + Mint (Rs. 589). Compare each line's dips, "Free" / "+ Rs." marks, "each" price and the subtotal in the drawer.
  - **Maximum:** raise Zinger Burger + Chipotle to 18 in the drawer; reopen Zinger, set quantity 5, choose Chipotle (drops to 2), add; reopen and choose Chipotle (inert, message), then add Mint as well (live again).
  - **Wrapping:** Mushroom Burger with all eight dips at quantity 20 reads "Rs. 30,580" on one line in the button at 375px; long dip names wrap inside their tiles without widening the grid.
  - **Desktop:** two-column panel, the section in the right column, hover ring on unchosen tiles, the column scrolling under a fixed footer on a burger.
  - **Keyboard only:** Tab into the section, arrows between tiles, Space to choose and unchoose, Tab to the button, Enter adds; focus returns to the card's button.
  - **Screen reader or accessibility tree:** a group per section named by its heading with the rule as its description; pressed states; one announcement per add including the dips.
  - **Reload:** lines with dips survive with their detail rows; a line saved before this change (no dips) still loads.
  - **Reduced motion emulated:** no fill or press animation.
  - **Console and dev-server terminal:** no errors, no hydration warnings, no controlled / uncontrolled warning from the toggle group.
- By reading the code: the `maxSelect` limit and its line, which today's data cannot reach.
- Repeat the 375px add and reload checks once against `npm run build` + `npm run start`.

## Open questions

None. The five questions from the first draft were answered on 2026-10-13 and are folded into the sections above: the picker uses the installed `ToggleGroup` in multiple mode, not shadcn `checkbox`; the rule line is composed from the group's numbers, not `group.description`; Cairo dip tiles carry no price of their own; nothing is preselected and nothing prompts for the free dip, but an empty group with `freeCount > 0` shows its allowance ("1 free") in `text-primary` where a `freeCount: 0` group shows "Optional"; and the Extra Dips section is always open.

Still with the owners (CLAUDE.md question 5): whether Cairo dips also apply to the Sando and Croissant sandwiches. The picker follows `addOnGroups`, so the answer is a data change, not a code change.
