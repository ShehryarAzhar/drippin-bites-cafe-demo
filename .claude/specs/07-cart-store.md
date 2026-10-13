# Spec 07: Cart Store

**Status:** Implemented
**Depends on:** 03

## Summary

Give the app its cart: a Zustand store that survives a reload, a line model that can hold a plain item, the Cairo Combo or a deal with the customer's choices, a rule for when two selections are the same line, and plain functions that price a line and the whole cart from `menu.json`. Nothing visible changes yet, but every ordering spec after this one (08–14, 17, 18) adds to, reads from or prices this cart, so the model and the money rules (first Cairo dip free, Loaded upgrade, deal bundles) are settled once here.

## Goals

- Install Zustand (the one new dependency) and create a single cart store with `persist` to `localStorage`.
- The app keeps working with an in-memory cart when storage is unavailable, blocked or full. No error reaches the customer.
- One cart line model with three kinds, **item**, **combo** and **deal**, that stores ids and choices only. Names, images and prices are always read from `menu.json` at render time, never copied into the cart.
- One line-identity rule: identical selections merge and raise the quantity; any difference in variant, add-ons or choices makes a separate line.
- Plain, pure pricing functions, usable outside React: add-on price, unit price, line total, subtotal, item count.
- One "line summary" function that turns a stored line into everything a UI or the WhatsApp message needs (name, variant label, image, detail lines, unit price, line total), so specs 08, 17 and 18 do not each re-derive it.
- Persisted data is treated as untrusted: anything that no longer matches the menu is dropped when the cart loads.
- No hydration mismatch: the server and the first client render both see an empty cart; the saved cart arrives right after.
- `npm run lint` and `npm run build` pass.

## Out of scope

- Every visible cart surface: the `Sheet` drawer, quantity controls, remove button, subtotal row, empty state, header cart button and sticky mobile cart button (spec 08).
- The customiser and its pickers: quantity stepper and Add to cart (spec 09), size choice (10), version toggle (11), dips pickers (12), combo builder (13), deal picker (14). This spec defines what a finished selection looks like and what it costs; those specs build the selection.
- Showing rules to the customer (`maxSelect` reached, "choose a size", "pick 2 pizzas"). The store only refuses a line that breaks them; the wording and the disabled states are the pickers' job.
- Checkout data: order type, name, phone, address, notes (spec 17) are not in this store and are not persisted here.
- The WhatsApp message text and `NEXT_PUBLIC_WHATSAPP_NUMBER` (spec 18). This spec supplies the line summaries and totals it will print, and the `clear` action it calls after the customer confirms sending.
- Delivery fee, tax, discounts, promo codes, minimum order. The subtotal is the only total. The "Delivery charges confirmed on WhatsApp" note is UI copy for specs 08 and 17.
- Syncing the cart between open tabs, cart expiry, and saved or shared carts.
- Editing a line's selection in place (change the size of a pizza already in the cart). Lines are added, re-quantified or removed.
- Linking the standalone `dips` category items (`chipotle-sauce`) to the `dips` add-on options (`chipotle`). They stay unrelated, as in spec 03.
- Editing `data/menu.json`, `types/menu.ts` or `lib/format.ts`. `lib/menu.ts` is only read, unless a missing lookup is found while planning.
- zod schemas. Section 13 scopes zod to forms; the cart has no form.
- Future phases from CLAUDE.md section 3: backend, database, auth, payments, WhatsApp Cloud API, admin dashboard, videos. The cart lives only in the browser; there is no server cart and no order id.
- Tests of any kind.

## User flow

No customer-facing change in this spec: no page shows a cart yet. What it makes true for the specs that follow, from the customer's side on a phone:

1. They add a Cairo Beef Hawawshi with Toum. Later they add the same thing again: the cart shows one line with quantity 2, not two lines.
2. They add a Lahori Tikka Hawawshi, or the same Hawawshi with a second dip: that is a different line.
3. They add a Zinger Burger with two paid dips, a Loaded Cairo Combo and Deal 3 with their two pizza flavours and a drink. Each line knows its own price; the subtotal is the sum.
4. They close the tab, come back from Instagram an hour later and the cart is still there.
5. Their browser blocks site storage (private mode, in-app browser): everything still works for that visit; the cart just does not survive a reload.
6. After they confirm they sent the order on WhatsApp (spec 18), the cart is emptied. Never before.

## UI & design

This spec adds no visible UI, so there is no layout, component styling or responsive behaviour to describe. The one component it adds renders nothing. It does fix several things that later UI depends on:

- **Before the saved cart has loaded** the cart reads as empty and a `hydrated` flag is false. Spec 08 uses the flag so the cart button does not flash "0" and then jump to a count, and so the empty-cart state is not shown for a split second to someone who has items.
- **Prices** leave this spec as PKR integers. Every surface formats them with `formatPrice`; nothing here returns formatted text except through that helper.
- **A free dip** has a price of `0` in the line summary. Whether that prints as "Free" or is left blank is decided in specs 08 and 12.
- **Variant labels:** the summary gives the label ("Large", "Lahori Twist", "Regular") and says whether the item has more than one variant, so specs 08 and 18 can leave "(Regular)" out.
- **Detail lines** under a cart line come in one fixed order: for items, add-ons in menu order; for the combo, main, side, drink, upgrade, dips; for a deal, its `contents` in file order with the chosen flavours and drinks filled in.
- **States:** empty cart (no lines, subtotal 0, count 0); storage unavailable (same behaviour, nothing persisted, no message); a saved line that no longer matches the menu (silently dropped, the rest of the cart kept).
- No shadcn components, no brand tokens, no motion, no accessibility surface.

## Data

### From `menu.json` (read only, through `lib/menu.ts`)

- **Items:** `categories[].items[].id`, `variants[].id` / `price`, resolved with `resolveItemRef`. Display values through `getDisplayName`, `getVariantLabel`, `getImage`.
- **Add-on groups:** `getItemAddOnGroups(item, category)` and `getComboAddOnGroups(combo)`; from each group `id`, `freeCount`, `extraPrice`, `maxSelect`, `options[].id` / `name` / `price`.
- **Combo:** `getCombo`; `price`, `upgrades[].id` / `label` / `price`, `slots[].id` / `label` / `options` / `fixed`, `addOnGroups`.
- **Deals:** `getDeal`; `price`, `name`, `number`, `image`, `contents[]` (`qty`, `label`, `choose`, `from`, `size`), with `getDealPizzaOptions(line)` and `getSoftDrinkOptions()` to check choices.
- Not used: `restaurant`, `openQuestions`, `printedName`, item `tags` and `group`.

### Cart line model (`types/cart.ts`)

A line is one of three shapes, told apart by a `kind` field. All three carry a `quantity` and the line's identity key.

- **Item line:** `itemId`, `variantId`, and add-on selections as a list of `{ groupId, optionIds[] }`. A group with nothing selected is left out.
- **Combo line:** `comboId`; one `{ itemId, variantId }` per **options** slot, keyed by slot `id` (`main`, `drink`); `upgradeIds[]` (`loaded` or empty); add-on selections as above. **Fixed** slots (`side` → Cairo Fries) are not stored; they are read from the combo when the line is summarised.
- **Deal line:** `dealId`, and one entry per `contents` line that has `choose`, keyed by that line's index in `contents` (the lines have no ids). Each entry holds exactly `qty` selections: pizza item ids for `choose: "pizza"` (the size is the line's `size`, not stored), flavour strings for `choose: "soft-drink"`. Lines without `choose` are not stored.
- **What is never stored:** prices, names, labels, descriptions, images. A price change in `menu.json` shows up in an existing cart on the next load.
- An "add" input is the same shape without `quantity` and key.

### Line identity

- The key is built from the kind and the **normalised** selection, so the same choices always give the same key:
  - add-on groups sorted by group id, option ids sorted within a group
  - combo slots in the combo's own slot order, upgrade ids sorted
  - deal entries in `contents` order; the selections **within** one `qty > 1` line sorted, so Tikka + Fajita equals Fajita + Tikka
- Adding a selection whose key already exists increases that line's quantity; otherwise a new line is appended. Lines stay in the order they were first added.
- Quantity is not part of the key. The key is also the React list key and the handle used to change or remove a line.

### Validity of a line

A line (new or loaded from storage) is accepted only if it resolves against the current menu:

- **Item:** item and variant exist; every `groupId` is attached to that item (item level or category level); every option id exists in its group; no option repeated; option count ≤ `maxSelect`. Decided: an option can be chosen at most once per unit, so a selection is a set of option ids, not counts.
- **Combo:** combo exists; every options slot has a selection that is one of its `options`; every upgrade id exists; add-ons as for items, against the combo's groups.
- **Deal:** deal exists; every `choose` line has exactly `qty` selections; each pizza is in `getDealPizzaOptions(line)`; each drink is in `getSoftDrinkOptions()`. A deal with no `choose` lines (5, 13, 15, 16) is valid with no entries.
- Quantity is a whole number from 1 to 20, the per-line maximum. The number is one named constant beside the validity check, not repeated in the store or in later UI.
- An invalid "add" is ignored and reported to the caller as not added. An invalid stored line is dropped on load.

### Pricing (plain functions)

- **Add-on group:** selections are taken in the group's `options` order; the first `freeCount` are free; each one after that costs its own `price`, or the group's `extraPrice` when the option has no `price`, or 0 when neither exists.
  - `cairo-dips` (`freeCount: 1`, `extraPrice: 70`): 1 dip → 0, 2 → 70, 3 → 140, 4 → 210.
  - `dips` (`freeCount: 0`, per-option `price`): the sum of the chosen options' prices.
- **Item unit price:** the variant's `price` + its add-on groups.
- **Combo unit price:** `combo.price` + chosen `upgrades[].price` + its add-on groups. The slot choices do not change the price (all eight mains are Rs. 749, per the combo's `_notes`).
- **Deal unit price:** `deal.price`.
- **Line total:** unit price × quantity. Decided: add-ons are **per unit**: two Hawawshi with Toum and Shatta means two of each dip, one free per Hawawshi, so 2 × (499 + 70).
- **Subtotal:** the sum of line totals. **Item count:** the sum of quantities (what the cart badge shows in spec 08).

Worked figures from the current file, used in the acceptance criteria:

| Selection | Unit price |
|---|---|
| `hawawshi` / `authentic`, no dips | 499 |
| `hawawshi` / `authentic` + `toum` | 499 |
| `hawawshi` / `authentic` + `toum`, `shatta` | 569 |
| `hawawshi` / `authentic` + all four Cairo dips | 709 |
| `hawawshi` / `lahori`, no dips | 649 |
| `tikka` / `large` | 1,599 |
| `zinger-burger` + `chipotle`, `mint` | 589 |
| `cairo-combo`, any main and drink | 749 |
| `cairo-combo` + `loaded` | 899 |
| `cairo-combo` + `loaded` + two Cairo dips | 969 |
| `deal-03` (two medium classics + drink) | 1,599 |

### Line summary

One function per stored line returns, for display: the kind, title, variant label and the "more than one variant" flag (items), image path, detail lines (`{ label, quantity?, price?, choices? }`), unit price, line total and quantity. `choices` is a list of names, used only by a deal's `choose` lines to carry the chosen pizzas or drinks under that line.

- **Item:** title from `getDisplayName(item, variant)` ("Lahori Tikka Hawawshi"), image from `getImage`; one detail line per chosen add-on with its price (0 for the free one).
- **Combo:** title `combo.name`, image `combo.image`; details: the chosen main (variant name), the fixed side, the chosen drink, each upgrade with its price, then the dips.
- **Deal:** title `deal.name`, image `deal.image`; details: every `contents` line with its `qty` and `label`, and under a `choose` line the chosen pizza names or drink flavours.

### Store

- **State:** the list of lines, and the `hydrated` flag.
- **Actions:** add a selection (with a quantity, default 1), set a line's quantity, remove a line, clear the cart. Setting a quantity below 1 removes the line; above the maximum it is held at the maximum, also when a merge would pass it.
- **Derived values** (subtotal, item count, summaries) are not stored; they are computed from the lines with the plain functions.
- **Persistence:** `persist` with the `localStorage` key `drippin-bites-cart`, schema `version: 1`, saving the lines only (not `hydrated`, not actions).
- **Safe storage:** every read, write and remove is guarded. If `localStorage` is missing, throws on access (blocked site data), throws on write (quota, some private modes) or holds text that is not valid JSON, the store carries on in memory and nothing is thrown or logged to the customer.
- **Loading:** the store does not read storage while the module loads. A small client component mounted once in the root layout triggers the load after hydration, runs every stored line through the validity check, and then sets `hydrated`. If storage is unavailable, `hydrated` still becomes true.
- **Version change:** a stored cart with a different `version` is discarded, not migrated.

### Env vars, zod

- **Env vars:** none.
- **Zod schemas:** none. Decided: the stored cart has no schema; a stored line is kept only if it passes the validity check against the menu, inside a guard so malformed data cannot throw.

## Implementation outline

Files to create:

- `types/cart.ts`: the three line shapes, add-on and deal-choice selections, and the line summary type.
- `lib/cart/line.ts`: normalising a selection, building the identity key, the validity check against the menu.
- `lib/cart/pricing.ts`: add-on group price, unit price, line total, subtotal, item count.
- `lib/cart/summary.ts`: the line summary for display and for the WhatsApp message.
- `store/cart.ts`: the Zustand store, the guarded storage and the `persist` setup. `store/` is a new top-level folder; it holds client state, which fits neither `lib/` (pure functions) nor `components/`.
- `components/cart/cart-hydration.tsx`: client component that renders nothing and loads the saved cart once after hydration. Spec 08 adds the rest of `components/cart/`.

Files to modify:

- `package.json`, `package-lock.json`: add `zustand` (current 5.x), needed for the cart state CLAUDE.md section 2 names. No other package.
- `app/layout.tsx`: mount the hydration component inside `<body>`. Nothing else. Decided: it is mounted in this spec, so persistence is complete here and spec 08 only adds UI.
- `app/page.tsx`: only for the temporary check in Verification; `git diff app/page.tsx` must print nothing when the work is finished. The page is a server component, so the panel itself is a temporary client file beside it (`app/cart-check.tsx`), deleted with the import.
- `CLAUDE.md`: after verification, set spec 07 to `Implemented`, update the "Current state" bullet in section 1 and the "Zustand is not installed yet" line in section 2.

Files that stay as they are: `data/menu.json`, `types/menu.ts`, `lib/menu.ts`, `lib/format.ts`, `lib/utils.ts`, `app/globals.css`, `app/menu/`, everything else under `components/`, `next.config.ts`, everything under `public/` and `docs/`.

Order of work:

- Install Zustand and read its `persist` documentation for the installed version (storage wrapper, skipping the automatic load, `version`, saving part of the state); read `01-app/01-getting-started/08-caching.md` in the bundled Next docs to confirm a client component in the layout keeps every route static.
- Types, then the plain functions: normalise and key, validity, pricing, summary. Check each against the worked figures above before any store exists.
- The store with guarded storage and the deferred load; then the hydration component in the layout.
- Temporary panel on `app/page.tsx` for the checks in Verification, then removed completely.
- `npm run lint`, `npm run build`, then the CLAUDE.md update.

## Edge cases

- **`dips` is a category id and an add-on group id.** Add-on selections refer to the group; a `groupId` is checked against the groups attached to that item, never against categories.
- **Same price, different line:** Hawawshi with no dip and Hawawshi with Toum both cost Rs. 499 but are different lines, because the kitchen needs to know.
- **Selection order:** Toum then Shatta and Shatta then Toum are one line. So are a deal's two pizzas in either order.
- **Deal 3 with the same flavour twice:** two Tikka is valid; the entry holds the id twice.
- **Deal 11:** its soft-drink line has `qty: 2`, so it needs two flavours, which may be the same.
- **Deal 7:** `premium-pizza` at `small` has one option (`afghani-malai-boti`). The line still stores that choice explicitly; spec 14 selects it automatically.
- **Deal 12 and other label-only lines:** "Small Afghani Malai Boti Pizza" has no `choose`, so nothing is stored or matched against items for it.
- **Deal choices keyed by `contents` index:** reordering a deal's `contents` in `menu.json` would misalign a saved cart. The validity check on load catches it (the stored pizza is no longer an option for that index) and drops the line.
- **Stale saved cart:** an item removed from the menu, a size dropped from a pizza, a soft drink renamed, a dip removed. The affected line is dropped whole; it is not partly repaired.
- **Hand-edited or corrupt storage:** not JSON, not an object, lines that are not arrays, negative or fractional quantities, a huge quantity. Result: the bad parts are dropped or the cart starts empty; nothing throws.
- **Duplicate keys in storage:** two stored lines that normalise to the same key are merged.
- **Storage that fails only on write** (quota exceeded): the in-memory cart keeps the change; the next write is still attempted.
- **Server render:** the store module must be safe to import where `window` does not exist; `localStorage` is touched only inside the guarded functions, never at module scope.
- **Hydration:** the first client render must match the server's empty cart. Loading in an effect after mount guarantees it; reading storage during the first render would not.
- **Setting state in an effect:** the installed `react-hooks` lint rules flag a synchronous `setState` in an effect (specs 05 and 06 hit this). Calling the store's own load from the effect is not component state, but check the lint output.
- **Zustand 5 selectors:** a selector that builds a new array or object on every call re-renders forever. Consumers select the lines (a stable reference) and compute summaries and totals outside the selector, or use the library's shallow-compare helper. Worth one line in the store file, since specs 08–18 will all write selectors.
- **Cache Components:** the hydration component reads nothing on the server and takes no props, so the layout and every route stay prerendered. Confirm `/` and `/menu` are still listed as static after the build.
- **Add-on group with mixed priced and unpriced options:** not in the file today; the per-option rule above still gives a defined answer, with free slots going to the earliest options in menu order.
- **Combo main price differences:** a standalone Lahori Tikka Hawawshi is Rs. 649 and Authentic is Rs. 499, but the combo is Rs. 749 either way. The combo price never reads the main's variant price.
- **Client bundle:** the store's helpers import `lib/menu.ts`, so the menu JSON (about 25 KB) enters the client bundle on every page through the layout. Spec 03 accepted this for client components; it now applies site-wide.
- **`AGENTS.md`:** `next dev` rewrites it; commit it with the work if it changes.

## Acceptance criteria

- [x] `zustand` is in `dependencies` and is the only package added; `package-lock.json` is updated by npm.
- [x] `types/cart.ts`, `lib/cart/line.ts`, `lib/cart/pricing.ts`, `lib/cart/summary.ts`, `store/cart.ts` and `components/cart/cart-hydration.tsx` exist, with no `any`.
- [x] The files under `lib/cart/` contain no React import, no JSX, no `"use client"` and no reference to `window` or `localStorage`.
- [x] A cart line stores ids, choices and a quantity only: the `localStorage` value contains no price, name, description or image path.
- [x] No price, item name or description from the menu is written as a literal in the new files, and nothing imports `data/menu.json` directly.
- [x] Adding `hawawshi` / `authentic` + `toum` twice gives one line with quantity 2.
- [x] `hawawshi` / `authentic` + `toum`, `hawawshi` / `lahori` + `toum`, and `hawawshi` / `authentic` with no dip are three separate lines.
- [x] `toum` + `shatta` and `shatta` + `toum` on the same item and variant are one line.
- [x] Unit prices match the worked table: 499, 499, 569, 709, 649, 1,599, 589, 749, 899, 969 and 1,599.
- [x] `hawawshi` / `authentic` + `toum`, `shatta` at quantity 2 has a line total of 1,138.
- [x] A cart of that line (×2), `zinger-burger` + `chipotle`, `mint` (×1), `cairo-combo` + `loaded` (×1) and `deal-03` (×1) has a subtotal of 4,225 and an item count of 5.
- [x] `deal-03` with Tikka + Fajita + one drink and with Fajita + Tikka + the same drink merge into one line; a different drink makes a second line.
- [x] Two `cairo-combo` selections that differ only in the main, only in the drink, or only in `loaded` are separate lines.
- [x] Refused and not added: an unknown item or variant; `tikka` with a `dips` selection; five Cairo dips or a repeated dip; a combo with no drink; `deal-03` with one pizza; `deal-01` with a premium flavour (`kabab-stuffing`) in its classic line; `deal-07` with `drippin-special-pizza`, which has no `small`; a soft drink not in `softDrinks.options`.
- [x] Setting a line's quantity to 0 removes it; setting it above 20 holds it at 20, as does a merge that would pass 20; remove deletes only that line; clear empties the cart.
- [x] The line summary for `hawawshi` / `lahori` + `toum`, `shatta` gives the title "Lahori Tikka Hawawshi", the label "Lahori Twist", `/images/cairo/hawawshi.webp`, and two dip lines priced 0 and 70.
- [x] The line summary for a Loaded `cairo-combo` lists the chosen main, Cairo Fries, the chosen drink and the Loaded upgrade at 150, in that order.
- [x] The line summary for `deal-02` lists all four `contents` lines with their quantities, with the chosen pizza and drink under their lines and "Zinger Burger" ×2 and "Regular Fries" as label-only lines.
- [x] After a reload the cart has the same lines, order and quantities; the `localStorage` key is `drippin-bites-cart`.
- [x] `hydrated` is false on the server and on the first client render, and true after the load, including when storage is unavailable.
- [x] With storage blocked or throwing, adding, changing, removing and clearing all work for the visit and nothing is thrown to the page.
- [x] A stored line that no longer resolves (edited by hand to an unknown item id) is dropped on load and the other lines are kept; invalid JSON under the key gives an empty cart with no error.
- [x] The cart is never cleared automatically: no code path calls clear except the action itself.
- [x] No hydration warning on any route with a non-empty saved cart.
- [x] `data/menu.json`, `types/menu.ts`, `lib/menu.ts` and `lib/format.ts` are unchanged; `app/layout.tsx` gains only the hydration component; `git diff app/page.tsx` prints nothing.
- [x] `npm run lint` exits with no errors or warnings.
- [x] `npm run build` completes successfully, with `/` and `/menu` still prerendered as static.

## Verification

No automated tests (per CLAUDE.md).

- `npm run lint` passes.
- `npm run build` passes, and its route list still shows `/` and `/menu` as static.
- `git status` shows only: the six new files; `package.json`, `package-lock.json` and `app/layout.tsx` modified; this spec; `CLAUDE.md` once the status is updated (and `AGENTS.md` only if `next dev` rewrote it).
- Temporary check, then removed: a small client panel on `app/page.tsx` with buttons that add fixed sample selections (the ones in the acceptance criteria), change quantities, remove and clear, and that prints each line's summary, the subtotal, the item count and `hydrated`. With `npm run dev`:
  - Add each sample and compare every unit price, line total, the subtotal (4,225) and the count (5) with the worked table and with `data/menu.json`.
  - Repeat the merge cases: same selection twice, dips in the other order, deal pizzas in the other order.
  - Press the buttons for the refused selections and confirm the cart does not change.
  - DevTools → Application → Local Storage: the `drippin-bites-cart` entry holds ids and quantities only.
  - Reload: same cart. Navigate to `/menu` and back: same cart.
  - Edit the stored value by hand: an unknown `itemId` on one line, then reload (that line gone, others kept); then replace the whole value with `not json`, reload (empty cart, no error).
  - Storage unavailable: block site data for `localhost` in the browser settings (or open in a mode that blocks storage), reload, and use every button; then reload and confirm the cart is empty and nothing errored.
  - At 375px width and at desktop width, with a saved cart: no hydration warning in the console and no errors in the dev-server terminal on `/` and `/menu`.
- Repeat the reload and storage-blocked checks once against `npm run build` + `npm run start`.
- After removing the temporary panel: `git diff app/page.tsx` prints nothing, and `/` and `/menu` at 375px and desktop look exactly as they did after spec 06.

## Open questions

None. The five questions from the first draft were answered on 2026-10-13, each confirming the draft, and are folded into the sections above: a dip can be chosen at most once per unit; the per-line maximum quantity is 20; the stored cart has no zod schema and is checked against the menu instead; the hydration component is mounted in `app/layout.tsx` in this spec; and add-ons are charged per unit. Three corrections found while planning were folded in the same day: the refused-deal criterion uses cases that exist in the menu (no classic pizza lacks a size); a detail line gains an optional `choices` list for deal selections; and the temporary check uses a temporary client file beside `app/page.tsx`.
