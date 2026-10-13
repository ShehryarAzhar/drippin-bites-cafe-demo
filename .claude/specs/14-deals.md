# Spec 14: Deals

**Status:** Implemented
**Depends on:** 06, 07, 09 (and 13 for `ChoicePicker`, `StepHeading` and the customiser's second target kind)

## Summary

Fill the Deals section of `/menu` with a card for each of the 16 deals and make every one orderable: tapping a card opens the shared customiser sheet, which lists what is in the bundle and asks only for what the customer must pick (a pizza flavour per pizza, a soft drink per drink). The cart already validates, prices, merges and prints deal lines (specs 07, 08); this spec is the missing surface that builds one. Deals are the highest-ticket orders on the printed menu and the last part of the menu that cannot yet be ordered.

## Goals

- A deal card in the Deals section of `/menu` for every entry in `menu.deals` that can be built (16 today), in file order.
- A deal builder in the shared customiser sheet (`CustomizerSheet` / `CustomizerPanel`), opened from the card.
- The builder shows the whole bundle from `deal.contents`, then one numbered required step per selection the customer owes: a `choose: "pizza"` line asks for a flavour from `getDealPizzaOptions(line)`, a `choose: "soft-drink"` line for a flavour from `getSoftDrinkOptions()`, and a line with `qty` 2 asks twice.
- The steps reuse `ChoicePicker` from spec 13 unchanged.
- A choice with exactly one option (deal 7's small premium pizza) is made for the customer and shown, not asked.
- Deals with nothing to choose (5, 13, 15, 16) open ready to add.
- Nothing else is preselected. The footer button names what is still missing until every step is done.
- Quantity, live total, "Added", the per-line maximum and the announcement behave as in `ComboCustomizer`.
- The result is a `DealSelection` handed to `addLine`; the drawer shows it with no drawer changes.
- `npm run lint` and `npm run build` pass.

## Out of scope

- Deals anywhere but `/menu`: the home page's deals preview is spec 16.
- A page or route per deal, deal filters, sorting or search.
- A "you save Rs. …" line. Most fixed lines are deal-only and have no price to compare with.
- Linking a label-only line to a menu item ("Zinger Burger", "Small Afghani Malai Boti Pizza" in deal 12). They are labels, as spec 07 stores them.
- Selling deal-only items (nuggets, shakes, wings) on their own (open question 4 in CLAUDE.md).
- Dips, upgrades or any add-on on a deal. Deals have no `addOnGroups`.
- Swapping a fixed line, changing a pizza's size, or choosing a flavour outside the line's `from` and `size`.
- A price that depends on the flavour. `deal.price` is the price whatever is chosen.
- Photos or descriptions on the flavour tiles; swapping the stage photo to a chosen pizza. The stage is always `deal.image`.
- Showing `printedName`. Deal 12 is shown as `deal.name` ("The Big Drip II"), as the drawer does.
- Editing a deal line already in the cart, or remembering the last build between opens.
- Changes to `types/`, `lib/cart/line.ts`, `lib/cart/pricing.ts`, `lib/cart/summary.ts`, `store/cart.ts` or `components/cart/`. Deal lines are already valid, priced, merged and printed.
- Editing `data/menu.json`. New shadcn components or packages.
- Future phases from CLAUDE.md section 3: backend, auth, payments, WhatsApp Cloud API, admin dashboard, videos.
- Tests of any kind.

## User flow

On a phone, on `/menu`:

1. They tap the "Deals" chip. The page scrolls to the Deals heading ("16 Deals") and, under it, the deal cards in one column.
2. Each card is dark with a gold ring: the deal photo in its gold glow, a "Deal 3" pill, "PIZZA / PAIR" in cream and gold, the contents ("2 × Medium Pizza", "1.5 Litre Drink"), the navy "Rs. 1,599" tag and a gold "Add" button. They tap anywhere on the card.
3. The sheet rises: the deal photo, the pill, the title, "Rs. 1,599", then "What's inside" with the two contents lines. The footer button reads "Choose your pizza".
4. Step 1, "Medium Pizza (1 of 2)", marked "Required": nine classic flavour tiles in two columns. They tap Tikka. The tile fills gold with a tick and the step's number becomes a tick.
5. Step 2, "Medium Pizza (2 of 2)": the same nine tiles. They tap Fajita (Tikka again would also be allowed). The button now reads "Choose your drink".
6. Step 3, "1.5 Litre Drink": six tiles. They tap Pepsi; the button becomes "Add to cart · Rs. 1,599".
7. They tap it: "Added", the sheet closes, the cart badge pops.
8. The drawer lists "Pizza Pair" with the deal photo and, under it, "2 × Medium Pizza" with "Fajita, Tikka" indented and "1 × 1.5 Litre Drink" with "Pepsi"; Rs. 1,599.
9. Building the same deal with the same picks again raises that line (the two pizzas in either order). A different flavour or drink is a separate line.
10. They open "Lil' Drippers" (deal 5): "What's inside" lists its four lines, there are no steps, and the button already reads "Add to cart · Rs. 749".

## UI & design

Reference: `docs/menu-reference/11-deals-01-08.jpeg` and `10-deals-09-16.jpeg` (deal number, name, contents list, navy price tag) and `docs/brand/poster-*.jpeg` for the stacked heading. Reference only. Load the `frontend-design` skill when implementing.

### Deals section (`/menu`)

- The header from spec 06 stays: `GoldRule`, `PillLabel` with the count, `BrandHeading` `h2` "Deals". The count is the number of cards shown.
- The "Bundles from Rs. 749" line is removed, as spec 06 planned; the cards replace it.
- Under the header, `mt-8 md:mt-10`, a grid in the section's `max-w-6xl` column: one column at 375px, two from `sm`, three from `lg`, `gap-5 lg:gap-6`. With 16 cards the last row at `lg` holds one card at the start of the row; accepted.

### Deal card

- **Treatment (decided): the combo card's dark poster family, not cream.** A deal is an offer, like the combo: `bg-secondary/60`, `ring-1 ring-gold/40`, `rounded-xl`, `shadow-xl shadow-black/40`, a faint warm gold wash behind the body and the dot-grid ornament in one corner (`aria-hidden`). Cream stays the mark of a single dish.
- **Layout:** stacked at every width (the grid gives the columns). `ProductImage` on top at `aspect-4/3` with its own stage and glow, `deal.image`, empty `alt`. Body `p-5`, `gap-3`:
  - `PillLabel` "Deal 3" (the word plus `deal.number`), small.
  - `BrandHeading` `h3`, `card` size, start-aligned, `splitName(deal.name)`: "Pizza" cream, "Pair" gold; "The Big Drip" / "II"; "Lil'" / "Drippers".
  - The contents as a list, one `li` per `contents` line in file order, `text-sm text-muted-foreground`: the `label`, prefixed "2 × " in cream `tabular-nums` only where `qty` is above 1. Shown in full, never clamped: this list is what the customer is buying (deal 16 has 12 lines).
  - A footer row pinned to the bottom of the card (`mt-auto`): `PriceTag` (`deal.price`) with the thin cream ring the combo card gives it, and the gold button at the end.
- Cards in one row share a height (`h-full`), so the price rows line up whatever the length of the lists.
- **Button:** `AddButton` with the word "Add", `surface="dark"`, its `after` layer stretched over the card so the whole card is one tap target. Every deal opens the sheet, with or without choices.
- **Hover / press:** as the combo card (`hover:-translate-y-0.5`, deeper shadow, 200ms), with `reveal-on-scroll` on a wrapper, not on the card itself.

### Builder: frame

- The existing `CustomizerSheet` and `CustomizerPanel`, unchanged. Stage: `deal.image` for the whole session.
- **One scrolling sheet with numbered steps**, as the combo builder, not a wizard. Decided: a line with `qty` 2 is two single-choice steps, not a counter per flavour.
- **Body order:** pill "Deal 3" (`PillLabel`, small, as the combo's) → title (`SheetTitle` rendering `BrandHeading` `h2`, `card` size, `splitName(deal.name)`) → `formatPrice(deal.price)` as `text-lg font-bold tabular-nums` → the fading gold hairline → "What's inside" → the steps, in one wrapper with `gap-5`. A deal has no description, so the sheet needs a visually hidden `SheetDescription` built from the data (e.g. "Deal 3, Rs. 1,599") or none, whichever the Base UI dialog accepts without a warning.

### What's inside

- A heading row in the `AddOnPicker` heading style (`text-xs`, medium, `tracking-[0.18em]`, uppercase, `text-primary`) reading "What's inside", an `h3`.
- Under it one flat panel in the included-row style of the combo builder (`bg-secondary/30`, dashed `border-gold/30`, `rounded-xl`, `px-4 py-3`): a list with every `contents` line, "1 × " / "2 × " in `tabular-nums` then the `label`, cream, `text-[0.9375rem]`. Not interactive.
- A line whose choice was made automatically (one option only) carries the flavour on an indented row under it in `text-sm text-muted-foreground` ("Afghani Malai Boti"), so the customer sees which pizza they get.
- Lines the customer chooses are listed here too, without their picks; the steps below carry those.

### Steps

- One `ChoicePicker` per owed selection, in `contents` order, then by position within a `qty` above 1. Numbered 1…n across the whole deal ("Step 1 of 3").
- **Title:** the line's `label`; where the line's `qty` is above 1, followed by "(1 of 2)", "(2 of 2)".
- **Pizza tiles:** the flavour name (`item.name`) only. No tag (no pizza in any deal's options carries one today; `veg` from `getTags` is passed through if a flavour ever does), no description (they run to three lines and are on the pizza's own card), no price (the flavour does not change the deal's price).
- **Soft-drink tiles:** the flavour string.
- Tile styling, chosen state, press, focus and the two-column grid are `ChoicePicker`'s own; nine flavours leave the last tile spanning the row.
- The same flavour may be chosen in both steps of a `qty` 2 line. Each step is its own radio group.

### Footer

- Stepper and button from `CustomizerPanel`.
- **Incomplete:** the `pending` prop. The label comes from the kind of the first step still missing: "Choose your pizza" or "Choose your drink" (one small map keyed by the `choose` value, so a new kind fails the type check). On tap it scrolls that step into view and focuses its first tile, as the combo builder does.
- **Complete:** "Add to cart · Rs. 1,599", total = `getUnitPrice(selection)` × quantity.

### States

- **No choices in the deal (5, 13, 15, 16), or only an automatic one (7):** no steps; the button shows the total from the start.
- **Nothing chosen / partly chosen:** unchosen steps read "Required"; the button names the first missing kind.
- **Complete, "Added" (600ms, pickers inert, then the sheet closes), line at its maximum ("You already have 20 of these in your cart."), room smaller than the quantity (drops silently), cart not loaded yet (button inert), refused add ("That couldn't be added. Please try again."):** exactly as `ComboCustomizer`.
- **Missing image:** `ProductImage`'s fallback, on the card and the stage.
- **A `choose` line with no options** (a `from` category the menu lacks, no pizza in that `size`, or an empty `softDrinks.options`): the deal cannot be built. It gets no card and is not counted in the pill; its id in the store does not open the sheet.
- **No deals to show:** the section and its chip are skipped (spec 06's rule, now on the buildable list).
- **Unknown deal id in the store:** the sheet does not open.
- **Empty / loading / error:** none. No network.

### Motion

- Tile fill, ring and step disc: `ChoicePicker`'s 150ms transitions. Card: `reveal-on-scroll`, hover lift 200ms. No auto-scroll after a choice. All under the global `prefers-reduced-motion` rule.

### Accessibility

- The card is an `article` labelled by its `h3`; its button is named "Add Pizza Pair to cart" with `aria-haspopup="dialog"`; focus returns to it when the sheet closes.
- Each step is `ChoicePicker`'s `radiogroup`, named "Step 1 of 3: Medium Pizza (1 of 2)", `aria-required`; each tile is a radio named by the flavour.
- "What's inside" is a group named by its heading; its list is plain text.
- Announcement after an add, through `CustomizerRoot`'s region: "1 × Pizza Pair (Tikka, Fajita, Pepsi) added to cart. Subtotal Rs. 1,599." The bracket lists the picks in step order, automatic ones included; a deal with none has no bracket ("1 × Lil' Drippers added to cart. …").
- Heading order: section `h2`, card `h3`; in the dialog, title `h2`, "What's inside" and each step `h3`.
- Every tile at least 48px tall; the card button at least 44px; the gold focus ring on the dark card.

### Responsive

- **375px first:** one card per row; the heading, the list and the price row never overflow; the price tag never wraps. In the sheet, at 375 × 812 the "What's inside" panel of a three-line deal and the first step's heading are reachable with one short scroll; the body scrolls and the footer stays.
- "Add to cart · Rs. 87,980" (20 × deal 16, the largest total) fits the button on one line.
- **`sm` / `lg`:** two and three card columns. **`md` and up in the sheet:** the builder in the right-hand column of the 85dvh panel, two tile columns, the stage filling the left.

## Data

- **`menu.json`,** through `lib/menu.ts` only:
  - `menu.deals[]`: `id`, `number`, `name`, `price`, `image`, `contents[]`. `printedName` is not shown.
  - `contents[]` lines (`DealLine` in `types/menu.ts`): `{ qty, label }` fixed; `{ qty, label, choose: "pizza", from, size }`; `{ qty, label, choose: "soft-drink" }`.
  - `getDeal(id)`, `getDealPizzaOptions(line)` (pizzas in `from` that have a `size` variant), `getSoftDrinkOptions()` (`softDrinks.options`: Pepsi, 7Up, Mirinda, Coca-Cola, Sprite, Fanta; a placeholder list).
  - New in `lib/menu.ts`: a lookup that turns a deal into its steps (one per owed selection, with the line's index in `contents`, its position within `qty`, and its options), plus the automatic picks, and is undefined when a `choose` line has no options; and the list of buildable deals built on it. The card, the section count and `CustomizerRoot` all use these, as `getComboSteps` / `getCategoryCombos` do for combos.
  - Not used: `combos`, `addOnGroups`, `sizes` (the size is already in the line's `label`), pizza `description`, variant `price`.
- **What each deal asks for today:**

  | Deal | Steps | Options per step |
  |---|---|---|
  | 1 The Big Drip | large classic, large premium, drink | 9, 5, 6 |
  | 2 XL Hunger Slayer | XL classic, drink | 9, 6 |
  | 3 Pizza Pair, 9 Double Trouble | medium classic × 2, drink | 9, 9, 6 |
  | 4 Mini Munch | small classic × 2, drink | 9, 9, 6 |
  | 6 Mini Feast | small classic | 9 |
  | 7 Lil' Food Boss | none: small premium is `afghani-malai-boti` only, chosen automatically | — |
  | 8 Crave Combo, 10 Full Send | small classic, drink | 9, 6 |
  | 11 Burger Buddies | drink × 2 | 6, 6 |
  | 12 The Big Drip II, 14 Crunch Mode | drink | 6 |
  | 5, 13, 15, 16 | none | — |

- **Selection:** `DealSelection` from `types/cart.ts`: `dealId` and `choices` as `DealChoice[]`, one per `choose` line: `index` (the line's position in `contents`) and `selections` (exactly `qty` entries: pizza item ids, or soft-drink flavour strings). Fixed lines are not stored. `normalizeSelection` returns undefined while any selection is missing, which is the builder's "complete" test, and sorts the selections within a line.
- **Pricing:** `getUnitPrice(selection)` (`deal.price`, whatever is chosen), `getSubtotal` for the announcement.
- **Cart:** `addLine`, `lines`, `hydrated` from `useCartStore`; `MAX_LINE_QUANTITY`, `getQuantityInCart(lines, selection)`.
- **Customiser state:** `store/customizer.ts` gains a third target kind, `{ kind: "deal"; dealId }`, and its open action. The picks per step and the quantity are local state in the builder.
- **Authored copy,** the only words not from data: "Deal" (before the number), "Add", "What's inside", "(1 of 2)", "Choose your pizza", "Choose your drink", and `ChoicePicker`'s own "Required" and "Step … of …:". Names, labels, flavours and prices come from the file.
- **Env vars:** none. **Zod schemas:** none (not a form). **New types:** the store's deal target, the step type in `lib/menu.ts`, component props.

## Implementation outline

Files to create:

- `app/menu/deal-card.tsx`: server; the dark card for one deal with its Add button. Next to the route because only `/menu` uses it; it moves to `components/menu/` when spec 16 needs it.
- `components/customizer/deal-customizer.tsx`: client; the builder for one deal inside `CustomizerPanel` (picks, quantity, total, pending step, add, announcement).

Files to modify:

- `lib/menu.ts`: the deal steps lookup and the buildable-deals list.
- `store/customizer.ts`: the deal target kind and its open action.
- `components/customizer/customizer-root.tsx`: resolve a deal target and mount the deal builder, keyed by `openId`.
- `components/customizer/add-button.tsx`: able to open a deal target (word "Add", name "Add … to cart").
- `app/menu/deals-section.tsx`: drop the summary line, render the card grid, count the cards shown.
- `app/menu/page.tsx`: pass the buildable deals, and show the section and chip only when there are some.
- `CLAUDE.md`: after verification, set spec 14 to `Implemented` and update the "Current state" paragraph.

Files that stay as they are: `data/menu.json`, `types/`, `lib/cart/`, `lib/customizer.ts`, `lib/format.ts`, `store/cart.ts`, `store/cart-drawer.ts`, `components/cart/`, `components/menu/`, `components/brand/`, `components/ui/`, `components/customizer/choice-picker.tsx`, `add-on-picker.tsx`, `combo-customizer.tsx`, `item-customizer.tsx`, `customizer-shell.tsx`, `size-picker.tsx`, `version-toggle.tsx`, `app/menu/category-bar.tsx`, `category-section.tsx`, `combo-card.tsx`, `app/layout.tsx`, `package.json`, `package-lock.json`.

Order of work:

- Load the `frontend-design` skill; re-read `ComboCustomizer`, `ChoicePicker` and `combo-card.tsx`.
- The steps lookup in `lib/menu.ts`, checked against the table above.
- Store target, `AddButton` and the `CustomizerRoot` branch, with a bare builder that adds deal 5, to prove the path into the cart and drawer.
- The builder: "What's inside", steps, automatic picks, completeness, pending label and scroll, room and quantity clamp, "Added", announcement.
- The deal card and the grid in the Deals section, at 375px first.
- `npm run lint`, `npm run build`, browser checks, then the CLAUDE.md update.

## Edge cases

- **Choices are keyed by `contents` index,** not by an id or by the order of the `choose` lines. Deal 2's pizza is index 0 and its drink index 3.
- **`qty` above 1 needs `qty` selections,** and they may be equal: two Tikka is valid and stores the id twice.
- **Order within a line does not matter to the cart:** Tikka + Fajita and Fajita + Tikka are one line (spec 07 sorts them), and the drawer prints them sorted ("Fajita, Tikka"). The announcement uses the order picked.
- **Deal 1 has two pizza lines with different lists** (classic and premium). Options come from each line, never from a shared list.
- **Deal 7's automatic pick must be in the selection** from the first render, or the deal can never be completed. It follows from "one option", not from the deal's id.
- **A one-option soft-drink list** would be automatic by the same rule.
- **Deal 12's "Small Afghani Malai Boti Pizza" is a label,** not a choice; nothing is stored for it.
- **Pending label with two pizza steps:** both read "Choose your pizza"; the button scrolls to the first one missing.
- **Soft-drink ids are the flavour strings.** Two equal strings in `softDrinks.options` would collide as tile values; the file has none.
- **Room is per exact build,** and an unfinished build has the full 20. The clamp runs in the change handler, not in an effect, as in `ComboCustomizer`.
- **`ChoicePicker` is controlled with `null`** until a pick is made; a step must never pass `undefined`.
- **Pizza names are short** ("Chicken Pepperoni", "Afghani Malai Boti" wrap to two lines at most in a 162px tile).
- **Long cards:** deal 16's twelve lines beside deal 15's six in one row; the footer rows still line up.
- **Category bar:** the Deals section becomes the tallest on the page. Its chip must be active throughout it and at the very bottom; the bar's observers work from section ids and should need no change.
- **Images:** 16 more `next/image` requests, all lazy; none is above the fold.
- **`AddButton`'s stretched layer** needs the card to be `relative isolate` with no transform or filter on the button, and the reveal on a wrapper.
- **Static routes:** the card is a server component with one client button; `/` and `/menu` stay prerendered.
- **Stale saved cart:** a stored deal line whose flavour the menu no longer offers is dropped on load (`sanitizeStoredLines`); nothing new here.
- **`AGENTS.md`:** `next dev` rewrites it; commit it with the work if it changes.

## Acceptance criteria

- [x] The Deals section of `/menu` shows 16 deal cards in file order under its heading, the pill reads "16 Deals", and the "Bundles from" line is gone.
- [x] Each card shows the deal image, "Deal N", the two-colour name, every `contents` line with "2 × " / "3 × " only where `qty` is above 1, a navy price tag with `deal.price`, and a gold "Add" button. Deal 12 reads "The Big Drip II".
- [x] Cards are dark with a gold ring, the whole card is one tap target, and the button is named "Add <deal name> to cart".
- [x] The grid is one column at 375px, two from `sm`, three from `lg`; in every row the price rows line up.
- [x] Tapping a card opens the customiser sheet with the deal image on the stage, the pill, the title, the price and "What's inside" listing every `contents` line with its quantity.
- [x] Deal 3 shows three steps, "Medium Pizza (1 of 2)", "Medium Pizza (2 of 2)" and "1.5 Litre Drink", with 9, 9 and 6 tiles; deal 1 shows 9 classic, 5 premium and 6 drink tiles; deal 11 shows two drink steps. Every deal matches the table in Data.
- [x] Only pizzas sold in the line's size are offered: no classic step lists a special or premium pizza, and deal 1's premium step lists the five premium pizzas.
- [x] Deals 5, 13, 15 and 16 show no steps and the button reads "Add to cart · Rs. …" at once. Deal 7 shows no steps, "Afghani Malai Boti" under "Premium Small Pizza" in "What's inside", and is ready to add.
- [x] Nothing else is preselected. With a pizza missing the button reads "Choose your pizza"; with only a drink missing, "Choose your drink"; tapping it scrolls to that step, focuses its first tile and adds nothing.
- [x] With every step chosen the button reads "Add to cart · " and `deal.price` × quantity; changing a flavour never changes the total.
- [x] Adding deal 3 with Tikka, Fajita and Pepsi shows "Added", closes the sheet, and the drawer lists one "Pizza Pair" line with "2 × Medium Pizza" over "Fajita, Tikka" and "1 × 1.5 Litre Drink" over "Pepsi", Rs. 1,599.
- [x] The stored line is `kind: "deal"`, `dealId: "deal-03"`, `choices: [{ index: 0, selections: ["fajita", "tikka"] }, { index: 1, selections: ["Pepsi"] }]`, with no price or name. Deal 5's line has `choices: []`; deal 7's has `afghani-malai-boti` at index 1.
- [x] The same build again raises that line, also with the two pizzas picked in the other order; a different flavour or drink makes a separate line. Tikka twice is accepted.
- [x] The announcement reads "1 × Pizza Pair (Tikka, Fajita, Pepsi) added to cart. Subtotal Rs. 1,599."; for deal 5 it has no bracket.
- [x] With 20 of one build in the cart, reaching that build shows the "already have 20" line with stepper and button inert; changing a pick restores them. Reopening a deal starts empty at quantity 1. While "Added" shows, every picker is inert.
- [x] Item sheets and the combo builder behave exactly as after spec 13.
- [x] Deal names, numbers, labels, flavours and prices come from `menu.deals`, the pizza categories and `softDrinks` through `lib/menu.ts`; no deal, item or flavour id, name or price is a literal in the new or changed files.
- [x] `choice-picker.tsx`, `types/`, `lib/cart/`, `store/cart.ts`, `components/cart/`, `data/menu.json`, `package.json` and `package-lock.json` are unchanged; no shadcn component was added.
- [x] No hex values or `zinc` / `gray` / `neutral` classes in the new or changed files.
- [x] At 375px nothing overflows: card lists wrap inside the card, no price tag wraps, tile names wrap inside their tiles, and "Rs. 87,980" fits the button on one line.
- [x] The Deals chip is active while scrolling through the section and at the bottom of the page; `/menu#deals` lands on the heading.
- [x] With `prefers-reduced-motion: reduce`, the card reveal and tile changes happen without animation.
- [x] No hydration warning on `/` or `/menu`, with a saved cart holding a deal line and without.
- [x] `npm run lint` exits with no errors or warnings.
- [x] `npm run build` completes, with `/` and `/menu` still prerendered as static.

## Verification

No automated tests (per CLAUDE.md).

- `npm run lint` passes.
- `npm run build` passes, and its route list still shows `/` and `/menu` as static.
- `git status` shows only the two new files, the modified files the outline allows, this spec, and `CLAUDE.md` once the status is updated (`AGENTS.md` only if `next dev` rewrote it).
- Manual checks in the browser with `npm run dev`, starting from an empty cart (delete `drippin-bites-cart` in DevTools → Application → Local Storage):
  - **375px, cards:** tap the Deals chip; read all 16 cards against `menu.deals` (number, name, every line and quantity, price); tap the image, the text and the button of one card, each opens the sheet.
  - **375px, builder:** open deals 1, 3, 7, 11, 12 and 16 and compare steps and tiles with the table in Data; tap the pending button at each stage; choose and change flavours; pick the same flavour twice in deal 3.
  - **Add and merge:** deal 3 with Tikka, Fajita, Pepsi; again with Fajita, Tikka, Pepsi (quantity 2); then with Sprite (new line); then deal 5 and deal 7. Compare each line's rows and the subtotal in the drawer.
  - **Maximum:** raise one build to 18 in the drawer; rebuild it at quantity 5 (drops to 2 when the last pick completes it); add; rebuild again (inert, message); change the drink (live).
  - **Wrapping:** deal 16 at quantity 20 reads "Rs. 87,980" on one line; deal 16's card beside its neighbours at `sm` and `lg`.
  - **Other sheets:** open `tikka`, `hawawshi`, `zinger-burger` and the Cairo Combo; unchanged.
  - **Desktop:** three card columns, hover lift; the builder in the right column scrolling under a fixed footer.
  - **Keyboard only:** Tab to a card's button, Enter; Tab into step 1, arrows between tiles; on through the steps to the button; Enter adds; focus returns to the card's button.
  - **Screen reader or accessibility tree:** "Step 1 of 3: Medium Pizza (1 of 2)"; radio groups with `aria-required`; one announcement per add.
  - **Reload:** deal lines survive with their detail rows.
  - **Category bar:** the Deals chip stays active through the whole section.
  - **Reduced motion emulated:** no reveal, fill or press animation.
  - **Console and dev-server terminal:** no errors, no hydration warnings, no controlled / uncontrolled warning from the radio groups, no missing-description warning from the dialog.
- Repeat the 375px add and reload checks once against `npm run build` + `npm run start`.
