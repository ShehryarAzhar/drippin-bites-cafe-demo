# Spec 11: Cairo Version Toggle

**Status:** Implemented
**Depends on:** 09 (and through it 05, 06, 07, 08); builds on 10's customiser changes

## Summary

Make the four headline Cairo Crunch dishes (Hawawshi, Ful, Tamaya, Chicken Faroge) orderable: their cards get the Add control, and the customiser gains an Authentic / Lahori Twist toggle that swaps the dish's name, description, price, tags and, for Ful and Tamaya, its photo. These are the items the whole pitch is built around and the last four cards on `/menu` that cannot be added, so this is where the "Cairo original or Lahori remix" idea from the printed menu becomes something the owners can tap.

## Goals

- The Add control on the four version cards, through the one `canCustomize` predicate (50 cards become all 54).
- A two-segment toggle in the customiser built on shadcn `ToggleGroup`, one segment per entry in `item.variants`, labelled from `variant.label` with that variant's price.
- Decided: Authentic (the first variant in the file) is selected on open, so the sheet is ready to add at once. One version is always selected; it cannot be switched off.
- Switching swaps, together: the title (`variant.name`), the description, the tags (the Veg mark on Authentic Ful and Tamaya), the stage image where the variant has its own, the total in the Add button and the room left for that exact line.
- Decided: the printed menu's colours on the selected segment, Authentic in navy and Lahori Twist in red, from one colour map shared with the cart drawer's tag.
- Each version is its own cart line; the drawer already titles and tags it (spec 08).
- One reusable, data-free toggle component, so spec 13's combo main picker can reuse the look if it wants it.
- `npm run lint` and `npm run build` pass.

## Out of scope

- The Cairo dips picker (spec 12). Decided, as spec 09 did for burgers: the four items are orderable here with no dips; the `cairo-dips` group on them is not shown or hinted at. `addOns` stays `[]`.
- The Cairo Combo builder (spec 13) and its main-slot choice between the same eight versions.
- A version toggle on the card itself. The card keeps its "Authentic · Lahori Twist" options line and opens the customiser.
- Opening the customiser on a chosen version (for cards in variant mode, specs 13 and 15). `store/customizer.ts` keeps its item-only target; every open starts on Authentic.
- Remembering the last version between opens, or changing the version of a line already in the cart.
- Side-by-side comparison, a "what's the difference" explainer, spice levels or any wording `menu.json` does not have.
- Changes to the cart store, pricing, summary or `types/`. Version lines are already valid, priced and summarised (spec 07).
- Editing `data/menu.json`.
- Future phases from CLAUDE.md section 3: backend, auth, payments, WhatsApp Cloud API, admin dashboard, videos.
- Tests of any kind.

## User flow

On a phone, on `/menu`:

1. The four large Cairo Crunch cards at the top (Hawawshi, Ful, Tamaya, Chicken Faroge) now carry the gold "Add" pill beside their price tag, like the Sando and Croissant cards next to them.
2. They tap the Ful card. The sheet slides up with the Authentic Ful on its stage. Directly under the photo sit two segments side by side: "Authentic · Rs. 649", filled navy, and "Lahori Twist · Rs. 749", unfilled.
3. Below: the "Veg" mark, "Ful Medames Sandwich" in poster type, "Fava Bean Classic", the Authentic description. The footer reads "Add to cart · Rs. 649".
4. They tap "Lahori Twist". That segment fills red and the navy one empties. The photo changes to the paratha roll, the Veg mark goes, the title becomes "Ful Masala Roll" with its own description, and the button reads "Add to cart · Rs. 749". The toggle itself has not moved.
5. They tap + once ("Rs. 1,498"), then the button: "Added", the sheet closes, the badge pops to "2".
6. The drawer lists "Ful Masala Roll" with the red "Lahori Twist" tag. Adding the Authentic Ful afterwards makes a second line with the navy tag; adding the Lahori one again raises the first.
7. On Hawawshi or Faroge the same toggle swaps name, description and price, and the photo stays (one image for both versions). On Tamaya both versions are Rs. 499, so only the dish changes.
8. Reopening any of the four starts on Authentic at quantity 1.

## UI & design

Reference: `docs/menu-reference/05-cairo-crunch.jpeg` for the navy "Authentic" and red "Lahori Twist" labels over each pair of dishes; `docs/brand/poster-hawashi-crispy-pockets.jpeg` and `poster-faroge-grilled-wrap.jpeg` for the type. Reference only. Load the `frontend-design` skill when implementing.

### Card

- No new design. The four items are stacked cards in the featured grid, so they get spec 09's labelled gold pill (`AddButton`, `layout="stacked"`), the whole-card tap area, hover lift and dark focus ring.
- The card content is unchanged: `item.name`, subtitle, the Authentic description and image, the "Authentic · Lahori Twist" options line, "From Rs. 499" (plain "Rs. 499" on Tamaya, whose versions cost the same), and no Veg mark (spec 05).
- Accessible name "Add Hawawshi to cart" (the item's name, not a version's), `aria-haspopup="dialog"`.

### Version toggle

- **Place (decided):** the first thing in the sheet's body, directly under the stage and above the tags and title. It is not in the options area under the hairline where the size tiles sit. A version changes the whole dish, so it reads as a switch for the panel below it; and because everything that changes length (tags row, title, description) is underneath, the toggle never moves under the customer's thumb when they flip it.
- **Shape:** one full-width track, `rounded-xl`, `bg-secondary` at partial opacity with `ring-1 ring-gold/20`, about 4px of inner padding, holding two equal segments with a 4px gap. Each segment is at least 56px tall, `rounded-lg`, with the version label on the first line (body font, semibold, about 15px) and the price on the second (`tabular-nums`, `whitespace-nowrap`, through `formatPrice`). The same two-line layout as the size tiles, so the customiser's pickers read as one family.
- **Unselected segment:** transparent on the track, cream label, `text-muted-foreground` price. Hover (pointer only): a faint cream wash, 150ms.
- **Selected segment:** filled in its version's colour with white text for both lines (price at about 80% opacity) and a soft `shadow-md shadow-black/30`: `bg-navy` for `authentic`, `bg-brand-red` for `lahori`. Navy on the near-black sheet is weak as a shape (spec 02), so the selected segment also carries a thin inset cream ring (about `ring-cream/30`); the red one gets the same ring so the two match. A variant id with no colour of its own falls back to the gold fill of the size tiles.
- **One colour map:** `components/cart/cart-line.tsx` already maps `authentic` → navy and `lahori` → red for the drawer tag. The toggle is its second user, so the map moves to one shared place and both import it; the tag in the drawer and the segment in the sheet cannot drift apart.
- **Press:** `active:scale-[0.98]`, 150ms. **Focus:** the gold ring with the dark offset the stock `Button` uses; it shows around a navy or red segment.
- **No heading row.** There is no "Version" title and no "Required": one segment is always filled, and the two labels explain themselves. The group has an accessible name instead (below).
- **Component:** shadcn `toggle-group` (CLAUDE.md section 5), added with `npx shadcn add toggle-group`; the registry also brings `toggle`, which it depends on. Both wrap `@base-ui/react` (`ToggleGroup`, `Toggle`), already installed, so no npm package is added. Restyled as above: no stock `bg-muted` pressed state, outline variant or grey border.
- **No standalone price line (decided),** as for pizzas in spec 10: the segments are the price list and the button carries the total.

### What swaps with the version

- **Stage image:** `getImage(category, item, variant)`. Ful and Tamaya change photo; Hawawshi and Faroge keep theirs and must not flicker or reload.
- **Tags:** `getTags(item, variant)`. "Veg" shows on Authentic Ful and Authentic Tamaya only.
- **Title:** `variant.name` through `BrandHeading` and `splitName`, as today ("Cairo Beef" cream / "Hawawshi" gold → "Lahori Tikka" / "Hawawshi").
- **Subtitle:** `item.subtitle`, unchanged by the version ("Crispy Pockets").
- **Description:** `variant.description`.
- **Footer:** the total, the stepper's maximum and its labels ("Decrease quantity of Ful Masala Roll").

### States

- **Chosen version already at the maximum in the cart:** spec 09's muted line, "You already have 20 of these in your cart.", with the stepper and button inert. The toggle stays live, so the other version can be chosen and added.
- **Chosen version with less room than the current quantity:** the quantity drops to the room left, as spec 10 does on a size change. No message.
- **Saved cart not loaded yet:** as spec 09; the button is inert with no total. The toggle already works and the segments show their prices.
- **"Added":** the toggle is inert for the 600ms pause, like the stepper and the size tiles.
- **Refused add:** spec 09's error line. Not reachable with a valid version; a guard.
- **Missing image:** `ProductImage`'s fallback at stage size. A failed photo on one version must not leave the fallback showing after switching to a version whose photo loads.
- **Second photo still loading** (first switch on Ful or Tamaya): the stage keeps its dark gradient and gold glow and the new cutout fades in; no layout movement and no spinner.
- **Empty / loading / error:** none. No network beyond the image.

### Motion

- Segment fill: 150ms colour transition.
- The swapped content (photo, title, description) fades in over about 200ms, with no slide; the total in the button changes instantly, as it does for quantity.
- All of it falls under the global `prefers-reduced-motion` rule: the swap is then instant.

### Accessibility

- A group named "Version" (`aria-label`; no visible heading) holding two toggle buttons with `aria-pressed`. Each button's name is label and price: "Lahori Twist, Rs. 749".
- Arrow keys move between the segments (Base UI's roving focus); Space or Enter selects. Pressing the already-selected segment does nothing.
- The dialog's name follows the title, so it changes with the version. No extra live region for the swap: the pressed state is announced by the button itself.
- The post-add announcement uses the order message's `qty × name (variant)` format, as spec 10 does for sizes: "2 × Ful Masala Roll (Lahori Twist) added to cart. Subtotal Rs. 1,498."
- The selected state is not carried by colour alone: fill against no fill, plus `aria-pressed`.
- Segments are at least 56px tall and half the body wide, well over 44px.
- Heading order is unchanged: the dialog title stays the `h2`; the toggle adds no heading.

### Responsive

- **375px first:** at 375 × 812, Hawawshi (the longest version description, 69 characters) shows the stage, toggle, title, subtitle, description and the footer without scrolling. On shorter screens the body scrolls and the footer stays.
- "Lahori Twist" and "Rs. 749" each stay on one line in a segment about 160px wide.
- "Add to cart · Rs. 14,980" (20 × Ful Lahori, the largest version total) fits the button on one line at 375px, by spec 09's rule.
- **`md` and up:** the toggle is the first thing in the right-hand column. The close button sits over that column's top-right corner, so the toggle must stay clear of it (today the title does this with `md:pr-12`).

## Data

- **`menu.json`,** through `lib/menu.ts` only:
  - `item.variantType === "version"` on four Cairo Crunch items: `hawawshi`, `ful`, `tamaya`, `faroge`. Read with `getVariantType(item, category)`.
  - `item.variants[]`, two each, in file order `authentic` then `lahori`: `{ id, label, name, description, price }`, plus `tags: ["veg"]` on the `authentic` variant of `ful` and `tamaya`, and `image` on both variants of `ful` and `tamaya`.
  - Prices today: `hawawshi` 499 / 649, `ful` 649 / 749, `tamaya` 499 / 499, `faroge` 549 / 599.
  - Labels through `getVariantLabel(item, category, variant)` ("Authentic", "Lahori Twist"); no version label is a literal.
  - `getDefaultVariant(item)` for the starting version; `getVariant(item, id)` on change.
  - `getDisplayName`, `getDisplayDescription`, `getImage`, `getTags(item, variant)`, `item.subtitle`: all already called with the variant in `ItemCustomizer`, so they follow the version with no new lookup.
  - Not used here: `item.addOnGroups` (`cairo-dips`, spec 12), `combos`, `deals`, `sizes`.
- **Predicate:** `canCustomize` in `lib/customizer.ts` becomes "single variant, or `variantType` is `size` or `version`". With the current file that is every item; it stays the one rule, and an item with several variants and no `variantType` (none today) stays without a control.
- **Selection:** `ItemSelection` `{ kind: "item", itemId, variantId: "authentic" | "lahori", addOns: [] }`. Valid without dips (spec 07 prices `hawawshi` / `authentic` with no dips at 499).
- **Pricing:** `getUnitPrice(selection)` for the total. The segment prices are `variant.price` read for display.
- **Cart:** `addLine`, `lines`, `hydrated`, `MAX_LINE_QUANTITY`, `getQuantityInCart`; unchanged. Line identity already includes `variantId`; `getLineSummary` already returns the version's name as the title and its label, and `CartLine` already draws the navy / red tag.
- **Customiser state:** the chosen version is local state in `ItemCustomizer`, beside the quantity and the size, and resets on every open through the existing `key={openId}` remount. Nothing is added to `store/customizer.ts`.
- **Authored copy:** the group's accessible name, "Version". Everything else comes from data or specs 09 and 10.
- **Env vars:** none. **Zod schemas:** none (not a form). **New types:** none beyond component props.

## Implementation outline

Files to create:

- `components/ui/toggle-group.tsx` and `components/ui/toggle.tsx`: generated by `npx shadcn add toggle-group`; the Base UI toggle primitives, restyled.
- `components/customizer/version-toggle.tsx`: client; the track and its segments. Controlled and data-free like `SizePicker` (options with id, label and formatted price; the chosen id; a change callback); no menu or store imports.
- One small shared home for the variant-id → colour map now in `cart-line.tsx` (place decided in Plan Mode).

Files to modify:

- `lib/customizer.ts`: widen `canCustomize` to version items; update its comment.
- `components/customizer/item-customizer.tsx`: hold the chosen version for version items (starting on the default variant), render `VersionToggle` at the top of the body, switch with the same room-and-quantity clamp the size change uses, drop the unit-price line for version items, name the version in the announcement, keep the toggle inert while "Added" shows.
- `components/customizer/customizer-shell.tsx`: only what the image swap needs (a fresh `ProductImage` per image path, with the fade), and clearance for the close button if the toggle needs it from `md`.
- `components/customizer/customizer-root.tsx`: its "still waiting for its picker" comment.
- `components/cart/cart-line.tsx`: import the moved colour map. No visual change.
- `app/globals.css`: only if the content fade needs a keyframe.
- `CLAUDE.md`: after verification, set spec 11 to `Implemented` and update the "Current state" paragraph (all items can be added; the new files).

Files that stay as they are: `data/menu.json`, `types/`, `lib/menu.ts`, `lib/format.ts`, `lib/cart/`, `store/`, `components/menu/` (`item-card.tsx` already calls the predicate with the category), `components/customizer/add-button.tsx`, `size-picker.tsx`, `components/ui/radio-group.tsx`, `app/menu/`, `package.json`, `package-lock.json` (if `shadcn add` wants to install anything, stop and say so).

Order of work:

- Add `toggle-group`; read the generated files and the Base UI toggle group docs for the real props (CLAUDE.md: not Radix). Load the `frontend-design` skill.
- Widen the predicate and check the four cards on `/menu` at 375px and in the two- and three-column grids.
- Build `VersionToggle` and move the colour map.
- Wire `ItemCustomizer`: version state, selection, total, quantity clamp, announcement; then the image swap in the shell.
- The states: maximum per version, switching with a quantity set, not hydrated, missing image, keyboard.
- `npm run lint`, `npm run build`, browser checks, then the CLAUDE.md update.

## Edge cases

- **Base UI's value is an array.** `ToggleGroup` takes `value: string[]` and reports `string[]`; with `multiple` off, pressing the pressed segment reports an empty array. That must be ignored, or the sheet is left with no version, no price and no selection.
- **Generated styles assume Radix.** The registry's `toggle-group` styles the pressed item with `data-[state=on]`; Base UI's `Toggle` sets `data-pressed`. Check the generated files rather than trusting the class names.
- **Do not assume `authentic` and `lahori`.** Segments come from `item.variants` in file order and the start is `getDefaultVariant`. Only the colour map knows the two ids, and it has a fallback.
- **Same image on both versions** (`hawawshi`, `faroge`): the stage must not remount, fade or refetch when the path has not changed.
- **Stale image-failed flag:** `ProductImage` keeps `failed` in state; if the same instance is reused across a path change, a broken Authentic photo would hide a good Lahori one. A fresh instance per path avoids it.
- **Room is per version:** 20 Authentic Hawawshi in the cart must not block the Lahori one. The stepper maximum and the "already have 20" line follow the chosen version only.
- **Quantity clamp on version change** in the change handler or derived at render, not in an effect (the installed `react-hooks` lint rules flag a synchronous `setState` in an effect), and back to at least 1 when a version with room is chosen. `chooseSize` already does this; one handler should serve both.
- **Version change during "Added":** inert for the 600ms pause, or the announcement could name a different version from the one added.
- **Tags row comes and goes** on Ful and Tamaya (Veg on Authentic only), moving the title down or up by one row. Accepted; the toggle is above it and does not move.
- **Tamaya's equal prices:** both segments read "Rs. 499" and the total does not change on switching. Correct, not a bug.
- **Dialog name changes while open:** the title is the `SheetTitle`. Focus must stay on the pressed segment after a switch and not jump to the title or the close button.
- **Dips after spec 12:** a version item with a dip will be a different line from one without. The room-left lookup here is for the no-dips selection and must keep going through `getQuantityInCart` with the full selection, so spec 12 only has to add the add-ons to it.
- **Sized and version at once:** no item is both. `variantType` is one value, so the customiser shows the size tiles or the toggle, never both.
- **`ItemCard` in variant mode** (specs 13 and 15): the card shows one version, but its Add button opens the customiser on Authentic. Accepted for now; an initial version on the store's target is for the spec that first renders such a card.
- **Card name:** in default mode `AddButton` gets `item.name` ("Chicken Faroge"), not a version name.
- **Stale saved cart:** a stored line with a version the item no longer has is already dropped by `sanitizeStoredLines`.
- **Client boundary:** `version-toggle.tsx` takes plain props; `item-card.tsx` gains no `"use client"`; `/` and `/menu` stay static.
- **`AGENTS.md`:** `next dev` rewrites it; commit it with the work if it changes.

## Acceptance criteria

- [x] On `/menu`, all 54 cards carry an Add control: per section in page order 10, 9, 3, 5, 10, 3, 3, 3, 8.
- [x] The four version cards show the labelled gold pill on the same line as their price tag at 375px and in the two- and three-column grids; their title, description, image, options line and tags are unchanged, and each exposes one button named "Add … to cart" with the item's name.
- [x] Opening `ful` shows two segments in file order, "Authentic" with "Rs. 649" and "Lahori Twist" with "Rs. 749", above the title. Authentic is selected, filled navy; the sheet shows the Veg mark, "Ful Medames Sandwich", its description, `ful-authentic.webp` and "Add to cart" with "Rs. 649".
- [x] Choosing Lahori Twist fills that segment red and empties the other; the sheet shows "Ful Masala Roll", its description, `ful-lahori.webp`, no Veg mark and "Rs. 749". The toggle is at the same position on screen before and after.
- [x] `tamaya` swaps name, description, image and the Veg mark with both segments at "Rs. 499"; `hawawshi` (499 / 649) and `faroge` (549 / 599) swap name, description and price while the image stays without flicker.
- [x] Pressing the selected segment again leaves it selected; there is never a state with no version.
- [x] No version item shows a standalone unit-price line or a "Size" section; `tikka` still shows its size tiles and `zinger-burger` its "Rs. 449".
- [x] Quantity 2 on Ful Lahori reads "Rs. 1,498"; switching to Authentic reads "Rs. 1,298" and keeps the quantity.
- [x] Adding 2 × Ful Lahori shows "Added", closes the sheet and sets the badge to "2". The drawer lists "Ful Masala Roll" with a red "Lahori Twist" tag at Rs. 1,498; the stored line is `kind: "item"`, `itemId: "ful"`, `variantId: "lahori"`, `addOns: []`.
- [x] Adding Ful Authentic afterwards makes a second line with a navy "Authentic" tag; adding Ful Lahori again raises the first to 3.
- [x] The announcement after an add names the version: "2 × Ful Masala Roll (Lahori Twist) added to cart. Subtotal Rs. 1,498."
- [x] With 20 of Hawawshi Authentic in the cart, opening Hawawshi shows the "already have 20" line with the stepper and button inert, and choosing Lahori Twist restores them. With 18, quantity 5 on Lahori then switching to Authentic drops the quantity to 2.
- [x] Reopening any version item starts on Authentic at quantity 1.
- [x] The toggle is a group named "Version" of two buttons with `aria-pressed`, each named with its label and price; arrow keys move between them; each is at least 44px and shows the gold focus ring on both the navy and the red fill.
- [x] Version labels come from `variants[].label` through `getVariantLabel`, prices from `variants[].price`, and the total from `getUnitPrice`; no version name, price, item name or description is a literal in the changed files.
- [x] The navy / red choice is defined once and used by both the toggle and the drawer's tag.
- [x] `canCustomize` is still the one rule, used by `ItemCard` and `CustomizerRoot`; `components/menu/item-card.tsx` has no `"use client"`; `version-toggle.tsx` does not import `lib/menu.ts` or a store.
- [x] No hex values or `zinc` / `gray` / `neutral` classes in the new or changed files; no stock toggle look (`bg-muted` pressed state, grey outline).
- [x] With `prefers-reduced-motion: reduce`, the segment change and the content swap happen without animation.
- [x] `data/menu.json`, `types/`, `lib/menu.ts`, `lib/cart/`, `store/`, `package.json` and `package-lock.json` are unchanged; `toggle-group` and `toggle` are the only shadcn components added.
- [x] No hydration warning on `/` or `/menu`, with a saved cart holding version lines and without.
- [x] `npm run lint` exits with no errors or warnings.
- [x] `npm run build` completes, with `/` and `/menu` still prerendered as static.

## Verification

No automated tests (per CLAUDE.md).

- `npm run lint` passes.
- `npm run build` passes, and its route list still shows `/` and `/menu` as static.
- `git status` shows only: `components/ui/toggle-group.tsx`, `components/ui/toggle.tsx`, `components/customizer/version-toggle.tsx` and the shared colour map added; `lib/customizer.ts`, `components/customizer/item-customizer.tsx`, `customizer-shell.tsx`, `customizer-root.tsx` and `components/cart/cart-line.tsx` modified (`app/globals.css` only if a keyframe was needed); this spec; `CLAUDE.md` once the status is updated (and `AGENTS.md` only if `next dev` rewrote it).
- Manual checks in the browser with `npm run dev`, starting from an empty cart (delete `drippin-bites-cart` in DevTools → Application → Local Storage):
  - **375px, cards:** all ten Cairo Crunch cards carry an Add control; the four version cards look as before apart from the pill. Repeat at 640px (two columns) and 1024px (three).
  - **375px, sheet:** open each of `hawawshi`, `ful`, `tamaya`, `faroge` and flip the toggle both ways. Compare every name, description and price with `data/menu.json`; confirm the photo changes on Ful and Tamaya only and the Veg mark shows on their Authentic versions only. At 375 × 812 nothing needs scrolling; at 375 × 667 the body scrolls and the footer stays.
  - **Stillness:** flip the toggle repeatedly on Ful; the track does not move and the page behind does not shift.
  - **No empty state:** tap the selected segment; it stays selected.
  - **Totals:** Ful Lahori × 2 = Rs. 1,498; switch to Authentic = Rs. 1,298; Ful Lahori × 20 = Rs. 14,980 on one line in the button.
  - **Add and merge:** 2 × Ful Lahori, then 1 × Ful Authentic, then 1 × Ful Lahori: two lines (3 Lahori, 1 Authentic), subtotal 3 × 749 + 649 = Rs. 2,896, with the red and navy tags in the drawer.
  - **Maximum:** raise Hawawshi Authentic to 18 in the drawer; reopen Hawawshi, choose Lahori, set quantity 5, switch to Authentic (drops to 2), add; reopen (inert on Authentic, message), then Lahori (live again).
  - **Other items:** open `tikka`, `zinger-burger` and `chipotle-sauce`; unchanged from spec 10.
  - **Desktop:** two-column panel with the toggle at the top of the right column, clear of the close button; hover wash on the unselected segment.
  - **Keyboard only:** Enter on a version card's button opens the sheet; Tab reaches the toggle; arrows move, Space selects; Tab to the button; Enter adds; focus returns to the card's button.
  - **Screen reader or accessibility tree:** a group named "Version", two buttons with pressed state named with label and price; one announcement per add including the version.
  - **Missing image:** block `ful-authentic.webp` in DevTools; the fallback shows on Authentic and the real photo on Lahori.
  - **Reload:** version lines survive with their tags; a hard reload followed straight away by an add lands on top of the saved lines.
  - **Reduced motion emulated:** no fade or fill animation.
  - **Console and dev-server terminal:** no errors, no hydration warnings, no controlled / uncontrolled warning from the toggle group, no `next/image` warning.
- Repeat the 375px add and reload checks once against `npm run build` + `npm run start`.
