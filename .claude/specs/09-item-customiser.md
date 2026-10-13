# Spec 09: Item Customiser

**Status:** Implemented
**Depends on:** 05, 06, 07, 08

## Summary

Make the menu orderable: an Add control on item cards that opens one shared customiser (a bottom sheet on phones) with the dish large on its gold-lit stage, a quantity stepper, a live total and "Add to cart". This spec builds the surface and takes single-variant items (33 of the 54) all the way into the cart; sizes, the Cairo version toggle and dips (specs 10–12) are added inside it later, and the combo and deal pickers (13, 14) reuse its shell. For the pitch this is the first moment the owners can tap a dish and watch an order build with the right price.

## Goals

- An Add control in the footer slot spec 05 left on `ItemCard`, shown only for items the customiser can finish today (single-variant items).
- One customiser, mounted once in the root layout and opened from any card on any route, built on the existing `components/ui/sheet.tsx`.
- Inside it: image, tags, name, full description, unit price, quantity stepper (reusing `QuantityStepper`), a total that follows the quantity, and "Add to cart".
- Adding calls the store's `addLine` with an `ItemSelection`; the header badge pops and the mobile cart bar appears, as spec 08 prepared.
- A reusable shell (stage, scrolling body, fixed footer with stepper and Add button) that specs 10–14 put their pickers into without rebuilding the frame.
- The cards and `/menu` stay server-rendered; the client code is the Add button and the customiser.
- Every state designed: before the saved cart has loaded, refused add, line already at its maximum, missing image.
- `npm run lint` and `npm run build` pass.

## Out of scope

- Size choice (spec 10) and the Authentic / Lahori Twist toggle (spec 11). Decided: the 17 pizzas and the four Cairo version items get **no** Add control in this spec; no disabled button and no "coming soon" wording. Specs 10 and 11 are built next, so the gap is short.
- Dips pickers (spec 12). Decided: burgers, sandwiches and wraps are orderable here with no add-ons until spec 12; the `dips` group is not shown or hinted at.
- The Cairo Combo builder (13) and deal cards and pickers (14). `menu.combos` and `menu.deals` are not read.
- One-tap quick add that skips the customiser, and a stepper on the card itself.
- Editing a line already in the cart (reopening the customiser from the drawer). Lines are still only re-quantified or removed.
- Opening the cart drawer automatically, toasts, and an undo. No toast component is added.
- Order notes per item, "special instructions", upsells ("add a drink"), favourites.
- The home page. Cards placed there by specs 15 and 16 get the same control with no extra work.
- Adding shadcn components or packages. `Sheet`, `Button`, `QuantityStepper`, `ProductImage` and `ItemTags` cover it.
- Editing `data/menu.json`, `types/menu.ts`, `types/cart.ts`, `lib/cart/pricing.ts`, `lib/cart/summary.ts` or `store/cart.ts`.
- Future phases from CLAUDE.md section 3: backend, auth, payments, WhatsApp Cloud API, admin dashboard, videos. No stock levels, ratings or "popular" labels.
- Tests of any kind.

## User flow

On a phone, on `/menu`:

1. Cards for burgers, sandwiches, wraps, pasta, dips and the six single-price Cairo Crunch items now carry a gold Add control at the end of the price row. Pizzas and the four version items look as they did.
2. They tap the Zinger Burger card (anywhere on it). A sheet slides up from the bottom and the page dims.
3. The sheet shows the burger large on its dark stage, the name in poster type, the full description, "Rs. 449", and at the bottom a stepper at 1 beside a gold button reading "Add to cart · Rs. 449".
4. They tap +. The stepper reads 2 and the button reads "Add to cart · Rs. 898".
5. They tap the button. It reads "Added" with a tick for a moment, then the sheet closes.
6. Back on the menu at the same scroll position: the header badge pops to "2" and the gold "View cart" bar slides up with "2 items · Rs. 898".
7. They add another Zinger Burger later: the cart still has one Zinger line, now at 3.
8. Or they change their mind in step 3 and close the sheet (the X, the dimmed area, Escape). Nothing is added and the next open starts again at 1.

## UI & design

Reference: `docs/menu-reference/` for the cream card and navy tag the control sits on; `docs/brand/poster-*.jpeg` for the stacked heading and gold hairlines inside the sheet. Reference only; nothing is imported from `docs/`. Load the `frontend-design` skill when implementing.

### Add control on the card

- **Place:** the end of `ItemCard`'s footer row, opposite the `PriceTag`, in the slot spec 05 reserved.
- **Stacked layout:** a gold pill, 44px tall, lucide `Plus` and the word "Add" (`Button`, default variant, `sm` size).
- **Row layout:** a 44px gold disc with the `Plus` only (`size="icon-sm"`). The body is about 207px wide at 375px, so a labelled button would push a long price tag onto a second line once spec 10 turns pizzas on.
- Gold fill with dark text on cream; never gold text on cream.
- **Whole card is the tap target:** the button's hit area is stretched over the card (a pseudo-element on the button, the card as its positioning parent), so there is still exactly one control per card in the accessibility tree and no nested interactive elements.
- **Feedback, only on cards that have the control:** on hover (pointer devices only) the card lifts about 2px and its shadow deepens, 200ms; on press it settles back and the button darkens slightly. Cards without the control stay still with the default cursor, so nothing promises a tap that does nothing.
- **Focus:** a dark ring (`card-foreground`) with a cream offset on the button. The stock `Button` ring is gold on a dark offset, which is too faint on cream (spec 05).
- **Accessible name:** "Add Zinger Burger to cart", with `aria-haspopup="dialog"`. The `Plus` is `aria-hidden`.

### The customiser

One `Sheet` (`components/ui/sheet.tsx`, Base UI dialog), restyled through props and classes rather than a second modal component.

- **Phone (below `md`):** `side="bottom"`, full width, top corners rounded at about 1.25rem, height by content up to about 92dvh, so a strip of the dimmed menu stays visible above it. The gold hairline the Sheet already draws on its leading edge runs along the top. No drag handle: nothing here can be swiped, so nothing should look like it can.
- **Desktop (`md` and up):** the same popup becomes a centred panel about 52rem wide with fully rounded corners, in two columns: stage on the left filling the panel's height, content and footer on the right. It fades and rises about 12px rather than sliding from the screen edge.
- **Surface:** `bg-popover`, the same warm near-black as the cart drawer, with the drawer's soft upward shadow. No grey border anywhere.
- **Three zones.** The stage and body scroll together; the footer does not.
  1. **Stage:** `ProductImage` at about 16:10 on a phone (about 230px at 375px, so the name and price are visible without scrolling) and a full-height column on desktop. `sizes` matched to each, `loading="eager"`. Its dark gradient and gold glow carry the top of the sheet; the image is large, never a thumbnail. The close button sits over its top-right corner: 44px, lucide `X`, on a translucent dark disc so it reads on any photo, labelled "Close".
  2. **Body:** 20px padding (24px from `sm`). Top to bottom:
     - `ItemTags` for the chosen variant ("NEW", "Veg"), when there are any;
     - the name as the dialog title: `BrandHeading` at `card` size, two-colour, split with the same last-word rule the menu's section headings use ("Zinger" cream, "Burger" gold);
     - `item.subtitle` in the pill-label type style, when present;
     - the full description, not clamped, `text-muted-foreground`, omitted with no gap when there is none (the eight dips);
     - the unit price in cream, bold, `tabular-nums`. Not `PriceTag`: navy on the dark surface does not read as a shape (spec 02);
     - a thin gold hairline, fading at both ends;
     - **the options area:** empty in this spec. Specs 10–12 add their sections here, each under a small pill-label-style heading. With nothing in it, the hairline above is not rendered either.
  3. **Footer:** the cart drawer's footer band (`bg-secondary` at partial opacity, gold fading hairline on top, soft upward shadow, `env(safe-area-inset-bottom)` padding). One row: `QuantityStepper` at the start, then the Add button filling the rest.
- **Add button:** primary gold pill, size `lg`. "Add to cart" at the start and the total at the end, `tabular-nums` and `whitespace-nowrap`, with a small dot between. The total is unit price × quantity through `formatPrice` and changes on every tap of the stepper with no animation.
- **Stepper:** 1 to the line maximum, labelled "Decrease quantity of Zinger Burger" / "Increase quantity of …". Starts at 1 on every open.

### States

- **Added:** on a successful add the button swaps to a lucide `Check` and "Added" for about 600ms, with the stepper and button inert, then the sheet closes. Decided: the cart drawer does not open; the header badge pop and, below `md`, the mobile cart bar are the cue.
- **Saved cart not loaded yet** (`hydrated` false): the Add button is inert and shows no total until the cart has loaded. In practice this is a few milliseconds after first paint.
- **Refused add** (`addLine` returns false): the sheet stays open and one short line appears above the footer row in `text-destructive`: "That couldn't be added. Please try again." No current single-variant selection can be refused; this is a guard.
- **Cart already holds this exact selection:** the stepper's maximum is the line maximum minus what the cart holds. When nothing is left, the stepper and button are inert and a muted line reads "You already have 20 of these in your cart."
- **Missing image:** `ProductImage`'s fallback, at stage size.
- **Unknown item** (a stale id reaching the customiser): it does not open.
- **Long names and descriptions:** "Crunchy Cheesy Croissant Sandwich" wraps to two or three lines in the title; a 145-character description shows in full and the body scrolls if it must. The footer never leaves the screen.
- **Loading / error:** none beyond the above. No network is involved.

### Motion

- Sheet: slide up 300ms eased on a phone, fade and rise on desktop; the overlay fades. Card hover and press: 150–200ms. The "Added" swap is a cross-fade under 200ms.
- The header badge pop and the mobile bar's slide-in are spec 08's and fire by themselves when the count changes.
- All of it falls under the global `prefers-reduced-motion` rule. The "Added" pause stays, since it is confirmation rather than movement.

### Accessibility

- A modal dialog named by the item's name (`SheetTitle`), described by its description when it has one. Focus moves in on open, is trapped, and returns to the card's Add button on close, including after a successful add. Escape closes.
- One polite live region outside the sheet, so it survives the close: "2 × Zinger Burger added to cart. Subtotal Rs. 898."
- The total inside the button is part of its name ("Add to cart, Rs. 898"); it is not a second live region, because the stepper already announces the quantity.
- Every control is at least 44px. Gold ring on the dark sheet, dark ring on the cream card.
- The stage image has an empty `alt`; the title beside it names the dish.
- Heading order inside the dialog: the title is its top heading; option sections added by later specs sit one level below.

### Responsive

- **375px first:** stage, name, price and the whole footer are visible without scrolling for every single-variant item with a description of two lines or fewer. The footer row fits the stepper (about 132px) and a button reading "Add to cart · Rs. 17,980" (20 × Rs. 899, the largest current total) without wrapping; if it cannot, "Add to cart" shortens to "Add" before the price is allowed to wrap.
- **`md` and up:** two columns as above; the panel is never taller than about 85dvh.
- No horizontal scroll at any width, and the page behind does not jump sideways when the sheet opens.

## Data

- **`menu.json`,** through `lib/menu.ts` only:
  - `findItem(itemId)` → the `Item` and its `Category`.
  - `getDefaultVariant(item)`: the only variant for every item this spec handles (`regular`).
  - `getDisplayName`, `getDisplayDescription`, `getImage`, `getTags(item, variant)`; `item.subtitle`; the variant's `price`.
  - Not used here: `getItemAddOnGroups` (spec 12), `getVariantLabel` (10, 11), `combos`, `deals`, `sizes`. The single variant's label ("Regular", "6 pcs") is not printed, as on the card.
- **Which cards get the control:** one plain predicate, "the customiser can finish this item", true when `item.variants.length === 1`. With the current file: 33 items (Cairo Crunch 6, burgers 10, sandwiches 3, wraps 3, pasta 3, dips 8) and false for 21 (the four version items, 17 pizzas). Specs 10 and 11 widen this one function; no component repeats the rule.
- **Selection:** an `ItemSelection` from `types/cart.ts`: `{ kind: "item", itemId, variantId, addOns: [] }`. An item whose category lists the `dips` group is valid with no add-ons (spec 07).
- **Pricing:** the unit price and the total come from `getUnitPrice` in `lib/cart/pricing.ts`, the same function the cart uses, so the customiser and the drawer cannot disagree once add-ons arrive. Formatted with `formatPrice`.
- **Cart store** (`useCartStore`): read `hydrated` and `lines`; call `addLine(selection, quantity)`. `MAX_LINE_QUANTITY` from `lib/cart/line.ts`; the number 20 is not repeated.
- **Quantity already in the cart:** needs the line whose normalised selection matches. `lib/cart/line.ts` keeps its key builder private, so either one small exported lookup is added there or the match is made through `normalizeSelection`; decided in Plan Mode. Nothing else under `lib/cart/` changes.
- **Customiser state:** which item is open, and whether it is open, shared between every Add button and the one customiser. Client UI state like `store/cart-drawer.ts`: not persisted, a separate small store. The target is a tagged shape (`kind: "item"` with the item id) so specs 13 and 14 can add combo and deal targets without reshaping it. Quantity is local to the open customiser, not in the store.
- **Heading split:** `splitName` currently lives in `app/menu/category-section.tsx`. A second caller means it moves to a shared module and both import it.
- **Authored copy,** the only words not from data: "Add", "Add to cart", "Added", "Close", the two state lines above, the accessible labels and the announcement.
- **Env vars:** none. **Zod schemas:** none (no form). **New types:** the customiser target, beside its store.

## Implementation outline

Files to create:

- `store/customizer.ts`: the open target and open flag; non-persisted.
- `components/customizer/add-button.tsx`: client; the card's Add control. Takes the item id and name as props and does not import `lib/menu.ts`.
- `components/customizer/customizer-shell.tsx`: the frame on `Sheet`: stage, scrolling body, footer with stepper and Add button, the "Added" and inert states. No menu knowledge; specs 13 and 14 reuse it.
- `components/customizer/item-customizer.tsx`: client; resolves the item, holds the quantity, builds the selection, prices it and adds it. Hosts the options area for specs 10–12.
- `components/customizer/customizer-root.tsx`: client; mounted once in the layout. Reads the store, renders the customiser for the current target, owns the live region, closes on route change.
- One small plain module for the "can finish this item" predicate (under `lib/`, next to the cart helpers or the menu lookups).

Files to modify:

- `components/menu/item-card.tsx`: render the Add button in the footer row when the predicate allows; hover and press feedback and the positioning needed for the stretched hit area; update the "display-only" comments. It stays a server component.
- `app/layout.tsx`: mount the customiser root beside `CartDrawer`. Nothing else.
- `app/menu/category-section.tsx`: import the moved `splitName`.
- `components/ui/sheet.tsx`: where the centred desktop form needs it (its side styles are keyed on `data-[side=…]`, which outranks a plain `md:` class). Decided: editing this file is allowed; shadcn `dialog` is not added. The cart drawer's `side="right"` behaviour must not change.
- `lib/cart/line.ts`: only the one exported lookup, if Plan Mode chooses that route.
- `app/globals.css`: only if a keyframe is needed for the desktop entrance.
- `CLAUDE.md`: after verification, set spec 09 to `Implemented`, update the "Current state" paragraph (the display-only `ItemCard`, "Nothing adds to the cart until spec 09").

Files that stay as they are: `data/menu.json`, `types/`, `lib/menu.ts`, `lib/format.ts` (unless `splitName` lands there), `lib/cart/pricing.ts`, `lib/cart/summary.ts`, `lib/cart/copy.ts`, `store/cart.ts`, `store/cart-drawer.ts`, `components/cart/`, `components/brand/`, `components/layout/`, `app/menu/page.tsx`, `app/menu/category-bar.tsx`, `app/menu/deals-section.tsx`, `next.config.ts`, `package.json`, `package-lock.json`.

Order of work:

- Read first: `components/ui/sheet.tsx` and the Base UI dialog docs (focus return with a controlled `open` and no trigger; `side="bottom"`), and how `cart-drawer.tsx` closes on navigation. Load the `frontend-design` skill.
- The predicate and the store; then the Add button on `ItemCard`, checked on `/menu` in both layouts.
- The shell at 375px, then its desktop form.
- `ItemCustomizer` and the root: quantity, live total, add, the "Added" state, the announcement.
- The remaining states: not hydrated, at maximum, refused, missing image; focus return.
- `npm run lint`, `npm run build`, browser checks at 375px and desktop, then the CLAUDE.md update.

## Edge cases

- **Add before the saved cart loads:** `loadCart` rehydrates after first paint and its `merge` replaces `lines` with the stored ones, so an add made before it would be lost. Hence the inert button until `hydrated`.
- **Content during the close animation:** clearing the target at the moment of closing empties the sheet while it is still sliding away. The target must outlast the exit; only the open flag flips.
- **Quantity must reset per open,** also when the same item is opened twice in a row. Remounting on open does it without an effect; the installed `react-hooks` lint rules flag a synchronous `setState` in an effect (specs 05–08 hit this).
- **The "Added" timer:** closing by hand, Escape or a route change during the 600ms must not leave a timer that closes a later sheet or sets state on an unmounted component.
- **Double tap on Add to cart:** one add. The button is inert from the first tap.
- **Merge at the maximum:** `addToLines` silently holds a merged line at 20. Capping the stepper by what the cart already holds keeps the announcement ("2 × … added") true.
- **Same item, same line:** two adds of a single-variant item with no add-ons always merge. Once spec 12 lands, a burger with a dip is a different line from one without; nothing here should assume one line per item.
- **Stretched hit area:** it covers the card's text, so the text cannot be selected by dragging; accepted. It must not cover a second control if a later spec adds one, and must not extend past the card's rounded corners.
- **Cards without the control** (21 of 54 until specs 10 and 11) must show no hover lift, pointer cursor or focus stop.
- **`ItemCard` in variant mode** (a `variant` passed, for specs 13 and 15): the control follows the same predicate on the item, not on the variant, so those cards stay display-only until spec 11.
- **Two modals:** the customiser and the cart drawer are both `z-50` dialogs. Only one is ever open: the customiser cannot be opened from inside the drawer, and the drawer does not open after an add.
- **Sticky layers:** the sheet and overlay cover the header (`z-40`), the category bar (`z-30`) and the mobile cart bar (`z-30`). After the first add the bar slides in as the sheet leaves; the two must not overlap visibly.
- **Scroll lock and position:** `/menu` must be at the same scroll position after closing, the category bar's active chip unchanged, and the sticky bars must not shift sideways on desktop when the lock applies.
- **Route change with the sheet open** (browser Back): the sheet is closed on the page that loads.
- **Focus return:** there is no `SheetTrigger`; the sheet is opened from a store. Confirm focus goes back to the card's Add button and not to `<body>`, as the cart drawer does for its buttons.
- **Phone browser toolbar:** the height limit uses `dvh` and the footer pads by the safe-area inset, so the Add button is never behind the toolbar.
- **Client boundary:** `add-button.tsx` receives plain strings and must not import `lib/menu.ts`; `item-card.tsx` must not gain `"use client"`. The customiser imports the menu, which spec 07 already put in the client bundle through the layout.
- **Cache Components:** the new client components take no server data and read no request state, so `/` and `/menu` stay static. If the root reads `usePathname`, the same note as `NavLink` and `MobileCartBar` applies.
- **Dips have no description:** the body closes up and the price follows the title directly.
- **`tamaya-bites`:** its one variant is labelled "6 pcs"; the label is not printed (the description says it) and its "Veg" mark shows in the sheet.
- **`AGENTS.md`:** `next dev` rewrites it; commit it with the work if it changes.

## Acceptance criteria

- [x] On `/menu`, 33 cards carry an Add control and 21 do not: per section 6, 0, 0, 0, 10, 3, 3, 3, 8 in page order. The four Cairo version items and every pizza have none, and no disabled or placeholder control is rendered for them.
- [x] The control is a labelled gold pill in the stacked layout and a 44px gold disc in the row layout; in neither does a price tag wrap at 375px.
- [x] Tapping anywhere on a card that has the control opens the customiser; each such card exposes exactly one button, named "Add … to cart" with the item's name.
- [x] Cards with the control lift on hover and show a dark focus ring on keyboard focus; cards without it have no hover effect, pointer cursor or focus stop.
- [x] `components/menu/item-card.tsx` has no `"use client"`; `add-button.tsx` does not import `lib/menu.ts`.
- [x] Below `md` the customiser is a bottom sheet with rounded top corners that leaves part of the dimmed page visible; from `md` it is a centred two-column panel. It covers the header, the category bar and the mobile cart bar.
- [x] For `zinger-burger` it shows the image through `ProductImage`, the name as a two-colour heading, the full description, "Rs. 449", a stepper at 1 and a button reading "Add to cart" with "Rs. 449".
- [x] Raising the stepper to 2 changes the button's figure to "Rs. 898"; − is inert at 1.
- [x] Adding 2 × `zinger-burger` shows "Added" briefly, closes the sheet, sets the header badge to "2" and, below `md`, shows the mobile bar with "Rs. 898". The cart drawer stays closed.
- [x] The drawer then lists one "Zinger Burger" line at quantity 2 with no variant tag and no detail rows; the stored line under `drippin-bites-cart` is `kind: "item"`, `itemId: "zinger-burger"`, `variantId: "regular"`, `addOns: []`.
- [x] Adding `zinger-burger` again merges into that line; adding `karkade` (Rs. 179) and 3 × `chipotle-sauce` (Rs. 240) makes separate lines, and the subtotal matches the sum.
- [x] `croissant-sandwich` shows its "NEW" badge in the sheet and `tamaya-bites` its "Veg" mark; `chipotle-sauce` shows no description and no gap for one.
- [x] Reopening any item after closing or adding starts at quantity 1.
- [x] With the cart already holding 18 of an item, the stepper stops at 2; with 20, the stepper and button are inert and the "already have 20" line shows.
- [x] Closing by the X, the dimmed area or Escape adds nothing. After any close, including a successful add, keyboard focus is on the card's Add button and `/menu` is at the same scroll position.
- [x] A polite announcement gives the quantity, name and new subtotal after each add.
- [x] Before `hydrated` the Add to cart button is inert; an add is never lost to the saved cart loading.
- [x] Every control in the sheet is at least 44px, has an accessible name and shows the gold focus ring; the dialog is named by the item.
- [x] The total in the customiser comes from `getUnitPrice`; no price, item name or description is a literal in the new files; nothing imports `data/menu.json` directly or references `docs/`.
- [x] The "can finish this item" rule is one function, used by the card and the customiser.
- [x] No hex values or `zinc` / `gray` / `neutral` classes in the new files; no gold text on a cream surface; `PriceTag` is not used on the dark sheet.
- [x] With `prefers-reduced-motion: reduce` the sheet and card feedback appear without animated movement.
- [x] `data/menu.json`, `types/`, `lib/menu.ts`, `lib/cart/pricing.ts`, `lib/cart/summary.ts`, `store/cart.ts`, `components/cart/`, `package.json` and `package-lock.json` are unchanged; no shadcn component was added.
- [x] No hydration warning on `/` or `/menu`, with a saved cart and without.
- [x] `npm run lint` exits with no errors or warnings.
- [x] `npm run build` completes successfully, with `/` and `/menu` still prerendered as static.

## Verification

No automated tests (per CLAUDE.md).

- `npm run lint` passes.
- `npm run build` passes, and its route list still shows `/` and `/menu` as static.
- `git status` shows only: `store/customizer.ts`, the files under `components/customizer/` and the predicate module added; `components/menu/item-card.tsx`, `app/layout.tsx` and `app/menu/category-section.tsx` modified (plus the shared home of `splitName`, and `components/ui/sheet.tsx`, `lib/cart/line.ts` or `app/globals.css` only where the outline allows); this spec; `CLAUDE.md` once the status is updated (and `AGENTS.md` only if `next dev` rewrote it).
- Manual checks in the browser with `npm run dev`, starting from an empty cart (delete `drippin-bites-cart` in DevTools → Application → Local Storage):
  - **375px, cards:** count the controls per section against the criteria; row cards keep price tag and disc on one line for "Mighty Zinger Burger" and "Thousand Island Sauce"; stacked cards show the labelled pill on the Sando and Croissant sandwiches only.
  - **375px, sheet:** open `zinger-burger`: stage, name, price and footer visible without scrolling; part of the menu visible above the sheet. Open `croissant-sandwich` (long name, "NEW"), `tamaya-bites` ("Veg"), `chipotle-sauce` (no description), `grilled-chicken-cheese` (longest single-variant description).
  - **Totals:** step each to a few quantities and compare with `data/menu.json`: 449 → 898, 179, 80 → 240, 599, 349.
  - **Add:** add 2 × Zinger Burger; watch "Added", the close, the badge pop and the bar. Open the drawer and compare the line and subtotal. Add it again and confirm the merge; add Karkade and 3 × Chipotle Sauce and confirm three lines and the subtotal (3 × 449 + 179 + 240 = Rs. 1,766).
  - **Maximum:** raise a line to 18 in the drawer, reopen that item (stepper stops at 2), add 2, reopen (inert, with the message).
  - **Wrapping:** `mushroom-burger` at quantity 20 reads "Rs. 17,980" in the button without wrapping at 375px.
  - **Close paths:** X, dimmed area, Escape, browser Back; nothing added, scroll position and active chip unchanged.
  - **Desktop:** two-column centred panel; the page behind does not jump sideways; hover lift only on cards with the control.
  - **Keyboard only:** Tab reaches each Add button with a visible dark ring and skips cards without one; Enter opens; Tab stays inside; Enter on Add to cart adds; focus is back on the card's button.
  - **Screen reader or accessibility tree:** the dialog is named by the item; the stepper buttons name it; the add is announced once.
  - **Reload:** the cart is intact; open a sheet straight after a hard reload and confirm an add lands on top of the saved lines.
  - **Storage blocked** for `localhost`: adding works for the visit and nothing errors.
  - **Reduced motion emulated:** no slide or lift; "Added" still shows.
  - **Missing image:** temporarily point one item's lookup at a wrong path in DevTools (block the image request) and confirm the fallback at stage size.
  - **Console and dev-server terminal:** no errors, no hydration warnings, no `next/image` `sizes` warning.
- Repeat the 375px add and reload checks once against `npm run build` + `npm run start`.

## Open questions

None. The five questions from the first draft were answered on 2026-10-13, each confirming the draft, and are folded into the sections above: pizzas and the four Cairo version items get no Add control until specs 10 and 11, which are built next; after an add the button shows "Added", the sheet closes and the cart drawer stays closed; burgers, sandwiches and wraps are orderable without dips until spec 12; the customiser is a centred two-column panel from `md`, with `components/ui/sheet.tsx` edited if needed and no shadcn `dialog`; and code files and identifiers use the American spelling (`customizer`) while this file keeps the roadmap slug.
