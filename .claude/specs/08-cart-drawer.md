# Spec 08: Cart Drawer

**Status:** Implemented
**Depends on:** 04, 07

## Summary

Give the cart a face: a cart button in the header with a count, a `Sheet` drawer that lists every line with its choices, quantity controls, remove, a running subtotal and the delivery note, and a sticky "View cart" bar on phones. Spec 07 built the cart but nothing shows it; this is the surface every ordering spec (09–14) adds into and the step before checkout (17). For the pitch it is the moment the owners see an order take shape with the right prices, including the free first dip and deal choices, without anyone typing it into WhatsApp.

## Goals

- A cart button in the header's actions group, after the Menu link, with a count badge read from the store.
- A cart drawer built on shadcn `Sheet`, opened from the header button and from the sticky mobile bar, listing every line through `getLineSummary`.
- Per line: image, title, variant label where it matters, detail lines (add-ons, combo parts, deal contents and choices), quantity stepper, remove, line total.
- A footer in the drawer with the subtotal, the note "Delivery charges confirmed on WhatsApp" and a link to `/checkout`.
- A designed empty state with a way back to the menu.
- A sticky bottom bar on phones, shown only when the cart has items, with the count and subtotal.
- No flash of "0" or of the empty state before the saved cart has loaded (`hydrated`).
- The header stays a server component; all cart UI is in small client components under `components/cart/`.
- A quantity stepper that spec 09 can reuse in the customiser.
- `npm run lint` and `npm run build` pass.

## Out of scope

- Adding to the cart. No Add button on cards, no customiser (spec 09) and no pickers (10–14). Until spec 09 the cart can only be filled from a saved cart; see Verification.
- Opening the drawer automatically after an add, and any "added" confirmation. Spec 09 decides that; this spec only makes the drawer openable from anywhere.
- Editing a line's selection in place (change size, swap a dip). Lines are re-quantified or removed, as in spec 07.
- `/checkout` itself (spec 17). The drawer links to it; until spec 17 the link lands on the branded 404, the same way the Menu link did between specs 04 and 06.
- The WhatsApp message and `NEXT_PUBLIC_WHATSAPP_NUMBER` (spec 18).
- A "Clear cart" control. `clear` is called only after the customer confirms sending (spec 18).
- Undo after remove, toasts, and a remove confirmation dialog. No toast component is added.
- Delivery fee, tax, discounts, promo codes, minimum order, order notes. The subtotal is the only figure.
- Suggested items, upsells ("add a drink"), saved carts.
- Changing anything under `lib/cart/`, `store/cart.ts`, `types/cart.ts`, `lib/menu.ts` or `data/menu.json`, other than the one shared copy constant listed in the outline.
- Installing packages. `npx shadcn add sheet` should add only `components/ui/sheet.tsx`, on `@base-ui/react`, which is installed. If the CLI asks to install anything, stop and say so.
- Future phases from CLAUDE.md section 3: backend, auth, payments, WhatsApp Cloud API, admin dashboard, videos. No "Login to save your cart", no order tracking, no payment icons.
- Tests of any kind.

## User flow

On a phone, with a cart that already holds items:

1. Any page: the header shows a round cart button to the right of the Menu pill, with a small gold badge reading the number of items (the sum of quantities, e.g. "5").
2. At the bottom of the screen a gold bar floats above the page: "View cart", "5 items" and the subtotal "Rs. 4,225".
3. They tap either one. The drawer slides in from the right and covers the screen; the page behind dims.
4. The drawer is headed "Your Order" in the two-colour poster type, with the item count under it. Below is the list of lines, in the order they were added.
5. A Hawawshi line shows the dish on its dark stage, "Cairo Beef Hawawshi", and under it "Toum · Free" and "Shatta · + Rs. 70". A deal line shows "Pizza Pair" with "2 × Medium Pizza" and, indented, "Fajita, Tikka", then "1 × 1.5 Litre Drink" and "Pepsi".
6. They tap + on a line. The quantity, the line total, the subtotal, the header badge and the bar all change together.
7. They tap − down to 1; the − button is then disabled. They tap the bin icon: the line leaves and the rest close up.
8. At the bottom, always visible: "Subtotal Rs. …", the line "Delivery charges confirmed on WhatsApp", and a gold "Checkout" button.
9. They tap "Checkout": the drawer closes and `/checkout` opens.
10. Or they close the drawer (the X, the dimmed area, Escape, or the browser's swipe-back where the Sheet supports it) and carry on browsing with the cart unchanged.
11. With an empty cart: the header button has no badge, there is no bottom bar, and the drawer shows the empty state with a "Browse the Menu" button.

## UI & design

Reference: `docs/brand/poster-*.jpeg` for the stacked heading and gold hairlines; `docs/menu-reference/` for the navy price style, which is **not** used here because the drawer is a dark surface. Reference only; nothing is imported from `docs/`. Load the `frontend-design` skill when implementing.

### Header cart button (`components/cart/cart-button.tsx`)

- **Place:** the last child of the header's `<nav aria-label="Main">` actions group, after the Menu pill, with the existing 8px gap. Spec 04 budgeted 44px for it at 375px; the logo must not shrink.
- **Look:** `Button` with `variant="outline"` and `size="icon-sm"` (44px round, gold hairline, cream icon), so it reads as a pair with the Menu pill. Icon: lucide `ShoppingBag`.
- **Badge:** a small gold disc (`bg-primary text-primary-foreground`), bold, `tabular-nums`, at least 20px, overlapping the button's top-right edge with a 2px ring in `background` so it separates from the hairline. Shows the item count; "99+" above 99. Not rendered when the count is 0 or before `hydrated`.
- **Feedback:** when the count changes the badge pops once (scale up and settle, about 250ms, CSS keyframe re-triggered by keying the badge on the count). This is the cue spec 09 relies on after an add.
- **Open state:** while the drawer is open the button takes the outline variant's `aria-expanded` style (solid gold border, gold-tint fill).
- **Accessible name:** "Open cart, 5 items" / "Open cart, empty"; the badge number itself is `aria-hidden`.

### Drawer (`components/cart/cart-drawer.tsx` on `components/ui/sheet.tsx`)

- **Sheet:** side `right`, full height. Full width at 375px; from `sm` a fixed width of about 28rem. It sits above the header and the category bar (the header is `z-40`).
- **Surface, not the stock Sheet:** `bg-popover` (the warm near-black a step above the page), a faint gold radial glow in the top corner behind the heading, and the grain feel kept by a low-opacity warm gradient. The leading edge is a 1px gold hairline fading out at top and bottom (the header's edge treatment turned vertical); no grey border. Overlay: near-black at about 70% with a slight blur. Remove the generated component's default border, grey surface and small close button.
- **Open / close motion:** slide from the right with a fade on the overlay, 250–300ms, eased; the global reduced-motion rule shortens it.
- **Three fixed zones** in a flex column, so only the list scrolls:
  1. **Header zone:** `SheetTitle` rendered as a `BrandHeading` at `card` size, lead "Your" (cream), accent "Order" (gold), on one line or two as it fits; under it the count in `text-muted-foreground` ("5 items", "1 item"). The close button is a 44px ghost icon button (lucide `X`, "Close cart") at the top right. A hairline below, fading at both ends.
  2. **List zone:** `flex-1`, `overflow-y-auto`, `overscroll-contain`, 16px side padding (24px from `sm`).
  3. **Footer zone:** described below; it never scrolls away.

### Cart line (`components/cart/cart-line.tsx`)

Lines are rows on the dark surface, separated by gold hairlines that fade at both ends. They are not cream cards: a column of cream boxes in a narrow drawer would read as a template and leave no room for the detail lines.

- **Image:** `ProductImage` in a fixed 80px square with a rounded corner (`rounded-lg`), `sizes="80px"`, empty `alt` (the title is beside it). It brings its own dark stage and gold glow, so even at this size the food is not a thumbnail in a plain box. Deals and the combo use their own images (`summary.image`).
- **Text column:**
  - **Title:** `summary.title` in the body font, semibold, cream, up to two lines. Not Anton: a list of condensed uppercase names at this size is hard to scan.
  - **Variant label:** shown only for item lines where `hasMultipleVariants` is true, as a small tag after or under the title. For the Cairo versions, follow the printed menu: "Authentic" as a `bg-navy` tag and "Lahori Twist" as a `bg-brand-red` tag, both white text. For pizza sizes ("Large") a neutral tag (`bg-secondary`, cream text). "Regular" is never shown.
  - **Details:** `summary.details` in `summary` order, 0.8125rem, `text-muted-foreground`, each on its own row with the label on the left and its price on the right:
    - a detail with `price === 0` reads "Free" in gold;
    - a detail with `price > 0` reads "+ " and `formatPrice(price)`;
    - a detail with no `price` shows no figure;
    - a detail with `quantity` (deal contents) is prefixed "2 × ";
    - a detail with `choices` shows them on an indented row beneath, joined with ", ", in cream so the customer's own picks stand out from the printed deal text.
  - Combo and deal lines get no extra "Combo" / "Deal" label above the title; the title and image already say it.
- **Controls row** under the text, aligned with the text column:
  - **Quantity stepper** (`components/cart/quantity-stepper.tsx`): a pill with a hairline `border-border`, containing − , the number and +. Each button is a 44px tap target (lucide `Minus` / `Plus`), the number is `tabular-nums`, at least 2ch wide, centred. Hover and press: gold-tint fill, 150ms.
    - − is disabled at quantity 1. Removing is the bin's job, so a mistap cannot delete a carefully built deal.
    - + is disabled at `MAX_LINE_QUANTITY` (20).
    - Labels: "Decrease quantity of Cairo Beef Hawawshi", "Increase quantity of …". The number has `aria-live="polite"` and reads as "Quantity 2".
  - **Remove:** a 44px ghost icon button (lucide `Trash2`, `text-muted-foreground`, turning `text-destructive` on hover and focus), labelled "Remove Cairo Beef Hawawshi from cart". Immediate, no confirmation.
  - **Line total:** right-aligned on the same row, `formatPrice(summary.lineTotal)`, bold cream, `tabular-nums`, `whitespace-nowrap`. When the quantity is above 1, a small muted "Rs. 569 each" sits under it.
- **375px check:** 16px + 80px image + 12px gap + text column (about 235px) + 16px. The controls row must hold the stepper (about 132px), the bin (44px) and a total up to "Rs. 59,980" without wrapping; if it cannot, the total moves to the title row's right edge instead. Decide this once, at 375px, with deal 1 at quantity 20.

### Drawer footer

- A raised band at the bottom of the drawer: slightly lighter than the list (`bg-secondary` at partial opacity) with the gold fading hairline on top and a soft upward shadow, plus `env(safe-area-inset-bottom)` padding.
- **Subtotal row:** "Subtotal" in the pill-label type style (uppercase, tracked, muted) on the left; the amount on the right in Anton at `heading-card` size, gold, `tabular-nums`. This is the one large figure in the drawer.
- **Delivery note:** one line under it, 0.8125rem, `text-muted-foreground`, with a small lucide `Truck` icon: "Delivery charges confirmed on WhatsApp". No fee figure, no "Free delivery".
- **Checkout button:** full-width primary gold pill, size `lg`, "Checkout" with a lucide `ArrowRight`; it is a `Link` to `/checkout` styled with `buttonVariants`, and closes the drawer on click.
- The footer is not rendered in the empty state.

### Sticky mobile cart bar (`components/cart/mobile-cart-bar.tsx`)

- **When:** below `md` only; only when `hydrated` and the count is above 0; hidden while the drawer is open; hidden on `/checkout` and anything under it (spec 17 shows the order there).
- **Where:** `fixed`, bottom, 16px side margins, 12px above the bottom edge plus `env(safe-area-inset-bottom)`. Below the header and Sheet in stacking order, above page content.
- **Look:** one full-width gold pill button (`bg-primary text-primary-foreground`), 56px tall, with a deep soft shadow and a faint dark gradient behind it fading up into the page so cards scrolling underneath do not clash with it. Left: `ShoppingBag` icon and a dark count disc. Centre: "View cart". Right: the subtotal, bold, `tabular-nums`.
- **Enter / leave:** slides up and fades in when the first item arrives, and out when the cart empties, about 250ms.
- **Room for it:** while the bar is shown, the page gets extra bottom space equal to the bar's height plus its margins, so the footer's copyright line and the last menu card are never covered. The bar's component adds this (a spacer after the footer, or a padding variable on `body`), not the footer.
- **Accessible name:** "View cart, 5 items, Rs. 4,225".

### States

- **Before hydration** (`hydrated` false): header button with no badge; no bottom bar; if the drawer is somehow opened this early, its list zone shows three quiet skeleton rows (muted blocks, no shimmer loop longer than the 300ms budget) instead of the empty state.
- **Empty cart:** centred in the list zone: `public/logo-mark.svg` at about 72px and low opacity inside a soft gold glow, `BrandHeading` at `card` size (lead "Nothing here", accent "yet"), one muted line ("Add something from the menu and it shows up here."), a `GoldRule`, and a primary button "Browse the Menu" linking to `/menu` that also closes the drawer. On `/menu` it simply closes the drawer.
- **One line / many lines:** one line must not look stranded: the list starts at the top and the footer stays at the bottom. Ten or more lines scroll inside the list zone with the header and footer fixed.
- **Missing image:** `ProductImage`'s existing fallback.
- **A line that no longer resolves** (`getLineSummary` returns `undefined`): the row is skipped. It cannot be priced, and spec 07's load check already drops such lines; this is only a guard.
- **Storage unavailable:** nothing different on screen; the cart lasts for the visit.
- **Loading / error:** none beyond the above. No network is involved.

### Motion

- Drawer and overlay: as above. Badge pop: about 250ms. Bar enter/leave: about 250ms. Button hover and press: 150–200ms.
- A removed line collapses and fades (about 200ms) if it can be done in CSS without holding removed lines in state; otherwise it disappears at once. No animation library.
- All of it is covered by the global `prefers-reduced-motion` rule.

### Accessibility

- The Sheet is a modal dialog: focus moves in on open, is trapped, returns to the button that opened it on close; Escape closes. It has a title ("Your Order") and a description (the item count), using the Sheet's title and description parts so the generated `aria-` wiring applies.
- The list is a `<ul>`; each line is an `<li>` whose controls name the line (labels above).
- After a remove, focus moves to the next line's remove button, or the previous line's when the last was removed, or the "Browse the Menu" button when the cart is now empty. Focus must never fall back to `<body>`.
- One polite live region in the drawer announces changes: "Cairo Beef Hawawshi removed. Subtotal Rs. 3,087."
- Every control is at least 44px; every one shows the gold focus ring.
- Text pairings: cream, gold and `muted-foreground` on the dark surfaces; `primary-foreground` on gold; white on the navy and red tags. No gold text on cream, and `PriceTag` is not used (it is for cream surfaces).
- The header button and the bottom bar are both real `<button>`s; decorative icons are `aria-hidden`.

## Data

- **Cart store** (`store/cart.ts`, `useCartStore`):
  - read `lines` and `hydrated`;
  - call `setQuantity(key, quantity)` and `removeLine(key)`;
  - `addLine` and `clear` are not called in this spec.
  - Select `lines` itself (a stable reference) and derive everything else outside the selector, as the comment on the store says; a selector that returns a new array or object re-renders forever in Zustand 5.
- **Plain functions** (`lib/cart/`):
  - `getLineSummary(line)` → `LineSummary`: `key`, `kind`, `title`, `variantLabel`, `hasMultipleVariants`, `image`, `details[]` (`label`, `quantity?`, `price?`, `choices?`), `unitPrice`, `lineTotal`, `quantity`.
  - `getSubtotal(lines)`, `getItemCount(lines)`.
  - `MAX_LINE_QUANTITY` from `lib/cart/line.ts` for the stepper's upper limit; the number 20 is not repeated.
- **`menu.json`:** not read directly. Names, labels, images and prices arrive through the summaries; the components import nothing from `lib/menu.ts`.
- **Variant tag colour:** `LineSummary` carries the label but not the variant id. The navy / red choice for Cairo versions needs the id, which is on the stored line (`line.variantId` for `kind: "item"`), so the row receives the line as well as its summary. No new field on `LineSummary`.
- **Formatting:** every amount through `formatPrice`.
- **Drawer open state:** shared by the header button, the bottom bar and the drawer, and later by spec 09. It is client UI state, not cart data: not persisted and not part of `PersistedCart`. Where it lives (a second small store in `store/`, or a non-persisted field) is decided in Plan Mode.
- **Authored copy,** the only words not from data: "Your Order", "item" / "items", "Free", "each", "Subtotal", "Checkout", "View cart", "Nothing here yet" and its line, "Browse the Menu", the accessible labels, and the delivery note. The delivery note is used again by specs 17 and 18, so it is one exported constant under `lib/cart/`, not a literal in the component.
- **Env vars:** none. **Zod schemas:** none (no form). **New types:** none in `types/`; prop types stay in their files.

## Implementation outline

Files to create:

- `components/ui/sheet.tsx`: generated by `npx shadcn add sheet`, then restyled with brand tokens (surface, edge hairline, overlay, 44px close button). It wraps `@base-ui/react`'s dialog, so check its props (`render`, not `asChild`) before use.
- `components/cart/cart-button.tsx`: client; the header button with the count badge.
- `components/cart/cart-drawer.tsx`: client; the Sheet with its three zones, the empty and pre-hydration states, the live region. Mounted once in the layout.
- `components/cart/cart-line.tsx`: one row: image, title, tag, details, stepper, remove, totals.
- `components/cart/quantity-stepper.tsx`: controlled − / number / + with min, max and labels as props; no store access, so spec 09 can reuse it.
- `components/cart/mobile-cart-bar.tsx`: client; the sticky bottom bar and the page space it reserves.
- One small file under `lib/cart/` exporting the delivery-note text.
- The drawer's open state, in `store/` (file or field per Plan Mode).

Files to modify:

- `components/layout/site-header.tsx`: render the cart button after the Menu link and drop the "spec 08" comment. It stays a server component.
- `app/layout.tsx`: mount the drawer and the mobile bar once, beside `CartHydration`. Nothing else. *(`CartHydration` was removed on 2026-10-14; the store loads itself. See spec 07's Loading note.)*
- `app/globals.css`: only if needed for the badge-pop keyframe or a bar-height variable; no new colour tokens.
- `CLAUDE.md`: after verification, set spec 08 to `Implemented`, update the "Current state" bullet in section 1 ("no UI reads the cart yet") and the cart-button sentence in section 7.

Files that stay as they are: `data/menu.json`, `types/`, `lib/menu.ts`, `lib/format.ts`, `lib/cart/line.ts`, `lib/cart/pricing.ts`, `lib/cart/summary.ts`, `components/menu/`, `components/brand/`, `components/layout/site-footer.tsx`, `app/menu/`, `app/page.tsx`, `next.config.ts`, `package.json`, `package-lock.json`.

Order of work:

- Read first: the generated `sheet.tsx` and the Base UI dialog docs for its parts; `use-pathname.md` and `link.md` in the bundled Next docs; spec 07's store notes. Load the `frontend-design` skill.
- Add and restyle the Sheet; set up the shared open state.
- Header button with badge; then the drawer shell with header, empty state and footer.
- The stepper and the line row, checked against a saved cart holding an item, a combo and a deal.
- The mobile bar and its reserved space; focus handling and the live region.
- `npm run lint`, `npm run build`, browser checks at 375px and desktop, then the CLAUDE.md update.

## Edge cases

- **Nothing can add yet:** until spec 09 the only way to see a filled drawer is a saved cart (Verification gives one). The empty state is therefore what a visitor sees today, so it has to look finished.
- **`/checkout` does not exist yet:** the Checkout link lands on `app/not-found.tsx` until spec 17. The drawer must be closed when the 404 renders, and `<Link>` prefetching of the missing route must not log errors.
- **Route change with the drawer open:** any navigation (Checkout, Browse the Menu, browser Back) leaves the drawer closed on the new page.
- **Server render and hydration:** the server and the first client render both see an empty, un-hydrated cart, so the badge and bar must render nothing in both. Anything derived from `lines` appears only after `hydrated`.
- **Cache Components:** the new client components take no server data, so `/` and `/menu` stay static. The mobile bar reads `usePathname`; per `use-pathname.md` that is fine while every route is static, and needs a `Suspense` boundary if a dynamic route is ever added (the same note as `NavLink`).
- **Server header, client button:** `site-header.tsx` must not gain `"use client"`. The button is a client child.
- **Scroll lock:** the Sheet locks page scroll. Check that it does not shift the sticky header or category bar sideways on desktop (scrollbar gutter), does not fight `scroll-behavior: smooth` on `html`, and that `/menu` returns to the same scroll position on close.
- **Two sticky bars and the Sheet:** header `z-40`, category bar `z-30`. The overlay and Sheet must cover both; the mobile cart bar must sit under the header and under the overlay.
- **Mobile bar over content:** on `/menu` the bar floats over cards while scrolling; at the very bottom the reserved space must show the whole footer. On a short page (`/`, the 404) the footer still sits at the bottom of the viewport with the bar below it or over empty space, not over text.
- **iOS safe area and the browser toolbar:** the bar uses `env(safe-area-inset-bottom)`; the drawer's height should follow the dynamic viewport (`dvh`) so its footer is not hidden behind the browser's bottom toolbar.
- **Quantity limits:** `setQuantity` already clamps at 1–20 and removes below 1. The stepper never sends 0; the bin is the only remove path.
- **Rapid taps on + / −:** each tap reads the current quantity from the store, not from a stale prop.
- **Free dip wording:** only a detail with `price === 0` says "Free". A detail with no `price` (combo main, fixed fries, deal contents) says nothing, even though it also costs nothing extra.
- **`dips` add-ons on burgers** each have their own price (60–90), so their rows read "+ Rs. 70", "+ Rs. 90"; Cairo dips read "Free" then "+ Rs. 70".
- **Add-ons are per unit** (spec 07): a line at quantity 2 with a Rs. 70 dip shows "+ Rs. 70" on the detail, "Rs. 569 each" and a line total of Rs. 1,138. The detail price is never multiplied by the quantity.
- **Long content:** "Crunchy Cheesy Croissant Sandwich"; a combo with main, fries, drink, Loaded and four dips (eight detail rows); deal 2 with four contents rows and two choice rows. Rows grow in height; nothing is truncated that the kitchen needs, and totals never wrap.
- **Deal choices are sorted** in the stored line (spec 07), so "Tikka" then "Fajita" shows as "Fajita, Tikka". Accepted.
- **Deal 12's name** is stored as "The Big Drip II"; the drawer shows `deal.name` as given, not `printedName`.
- **Large totals:** 20 × deal 1 is Rs. 55,980; a full cart can pass Rs. 100,000. The subtotal and the bar must fit six-digit amounts at 375px.
- **Count above 99:** the badge shows "99+"; the drawer and the accessible names give the real number.
- **Singular / plural:** "1 item", "2 items".
- **Focus after remove,** and after the last remove swaps the list for the empty state.
- **State in effects:** the installed `react-hooks` lint rules flag a synchronous `setState` in an effect (specs 05–07 hit this). Close-on-navigation and the badge pop should be done without one where possible (event handlers, keys).
- **Generated Sheet defaults:** the shadcn file ships with `bg-background`, a border, a `sm:max-w-sm` width and a small close button. All four change; none of the stock look should survive.
- **`AGENTS.md`:** `next dev` rewrites it; commit it with the work if it changes.

## Acceptance criteria

- [x] `components/ui/sheet.tsx` exists, added through the shadcn CLI, and `package.json` / `package-lock.json` are unchanged.
- [x] The header shows a 44px cart button after the Menu link on every route; `components/layout/site-header.tsx` has no `"use client"`.
- [x] With an empty cart the button has no badge; with the sample cart from Verification it shows "5"; before hydration it shows no badge and "0" never appears.
- [x] Tapping the button opens a Sheet from the right that covers the header and category bar; it is full width at 375px and about 28rem wide from `sm`.
- [x] The drawer has a title ("Your Order"), an item count, a 44px close button, a scrolling list and a fixed footer; only the list scrolls when there are many lines.
- [x] Each line shows its image through `ProductImage`, `summary.title`, its details in `summary` order, a quantity stepper, a remove button and its line total.
- [x] The variant label shows for multi-variant items ("Authentic", "Lahori Twist", "Large") and never for "Regular"; combo and deal lines show none.
- [x] Hawawshi (Authentic) with Toum and Shatta shows "Free" for Toum and "+ Rs. 70" for Shatta; at quantity 2 it shows "Rs. 569 each" and a line total of "Rs. 1,138".
- [x] The Loaded Cairo Combo line lists its main, Cairo Fries, its drink and "Loaded" with "+ Rs. 150", in that order, and totals "Rs. 899".
- [x] The `deal-03` line lists "2 × Medium Pizza" with the two chosen flavours beneath it and "1 × 1.5 Litre Drink" with the chosen drink beneath it, and totals "Rs. 1,599".
- [x] With the sample cart the subtotal reads "Rs. 4,225" in the drawer and on the mobile bar.
- [x] + raises the quantity and − lowers it; the line total, subtotal, header badge and mobile bar all update at once. − is disabled at 1 and + is disabled at 20.
- [x] The remove button deletes only its line, with no confirmation; removing the last line shows the empty state.
- [x] After a remove, keyboard focus is on a control inside the drawer, never on `<body>`.
- [x] The footer shows "Subtotal", the amount, the exact text "Delivery charges confirmed on WhatsApp" and a "Checkout" link to `/checkout`; no delivery fee, tax or total-with-delivery figure appears anywhere.
- [x] The delivery-note text is defined once under `lib/cart/` and imported, not typed into the drawer.
- [x] Following "Checkout" or "Browse the Menu" closes the drawer; it is closed on the page that loads.
- [x] The empty state shows the logo mark, a two-colour heading, one line of copy and a "Browse the Menu" button, and no footer zone.
- [x] Below `md`, with items in the cart, a fixed gold bar at the bottom shows the count, "View cart" and the subtotal, and opens the same drawer. It is absent at `md` and up, with an empty cart, before hydration, while the drawer is open, and on `/checkout`.
- [x] With the bar showing, the whole footer can be scrolled into view above it on `/` and `/menu` at 375px.
- [x] The cart survives a reload: the same lines, quantities, badge and subtotal are back after it.
- [x] Every button in the header, drawer and bar is at least 44px, has an accessible name (icon buttons included, naming their line) and shows the gold focus ring.
- [x] Opening the drawer moves focus into it, Tab stays inside, Escape closes it and focus returns to the control that opened it.
- [x] No price, item name or description is a literal in the new files; they import nothing from `data/menu.json` or `lib/menu.ts`; nothing calls `clear` or `addLine`.
- [x] No hex values or `zinc` / `gray` / `neutral` classes in the new or generated components; no gold text on a cream surface; nothing references `docs/`.
- [x] No hydration warning on `/` or `/menu` with a saved cart, and none with an empty one.
- [x] `data/menu.json`, `types/`, `lib/menu.ts`, `lib/format.ts`, `lib/cart/line.ts`, `lib/cart/pricing.ts`, `lib/cart/summary.ts` and `components/menu/` are unchanged.
- [x] `npm run lint` exits with no errors or warnings.
- [x] `npm run build` completes successfully, with `/` and `/menu` still prerendered as static.

## Verification

No automated tests (per CLAUDE.md).

- `npm run lint` passes.
- `npm run build` passes, and its route list still shows `/` and `/menu` as static.
- `git status` shows only: `components/ui/sheet.tsx`, five files under `components/cart/`, the copy constant under `lib/cart/` and the open-state file under `store/` (if it is a file) added; `components/layout/site-header.tsx` and `app/layout.tsx` modified (and `app/globals.css` only if a keyframe or variable was needed); this spec; `CLAUDE.md` once the status is updated (and `AGENTS.md` only if `next dev` rewrote it).
- **Sample cart.** Nothing adds to the cart until spec 09, so seed it by hand, with no temporary code: DevTools → Application → Local Storage → set the key `drippin-bites-cart` to the value below, then reload. Expected: 4 lines, 5 items, subtotal Rs. 4,225 (1,138 + 589 + 899 + 1,599).

  ```json
  {"state":{"lines":[{"kind":"item","itemId":"hawawshi","variantId":"authentic","addOns":[{"groupId":"cairo-dips","optionIds":["toum","shatta"]}],"quantity":2},{"kind":"item","itemId":"zinger-burger","variantId":"regular","addOns":[{"groupId":"dips","optionIds":["chipotle","mint"]}],"quantity":1},{"kind":"combo","comboId":"cairo-combo","slots":[{"slotId":"main","itemId":"hawawshi","variantId":"authentic"},{"slotId":"drink","itemId":"limonana","variantId":"regular"}],"upgradeIds":["loaded"],"addOns":[],"quantity":1},{"kind":"deal","dealId":"deal-03","choices":[{"index":0,"selections":["tikka","fajita"]},{"index":1,"selections":["Pepsi"]}],"quantity":1}]},"version":1}
  ```

- Manual checks in the browser with `npm run dev`:
  - **Empty cart, 375px:** no badge, no bottom bar; open the drawer: the empty state is centred and finished-looking; "Browse the Menu" goes to `/menu` and the drawer is closed there.
  - **Sample cart, 375px:** badge "5"; bottom bar shows 5 items and Rs. 4,225; open from the bar and from the header button; compare every title, detail row, "Free" / "+ Rs." figure, line total and the subtotal with the acceptance criteria and with `data/menu.json`.
  - **Quantity:** + and − on each kind of line; watch the line total, subtotal, badge and bar; − disabled at 1; raise one line to 20 and confirm + disables.
  - **Remove:** remove a middle line, then the rest one by one; focus stays in the drawer each time; the empty state appears after the last; the bar and badge are gone.
  - **Long list:** raise the sample to ten or more lines by editing the stored value (repeat lines with different dips or drinks); the list scrolls, the header and footer zones stay put.
  - **Wrapping:** set `deal-01` at quantity 20 in the stored value; no price wraps in the row, the footer or the bar at 375px.
  - **Checkout link:** lands on the branded 404 (until spec 17) with the drawer closed and no console error.
  - **Bottom bar and footer:** scroll to the bottom of `/` and `/menu` at 375px; the copyright line is fully visible above the bar. Resize to `md`: the bar goes and the extra space with it.
  - **Desktop:** drawer about 28rem wide at the right; the page behind is dimmed and does not jump sideways when it opens; `/menu` is at the same scroll position after closing.
  - **Reload and navigation:** reload with the sample cart (no flash of "0" or of the empty state); move between `/` and `/menu` with the cart intact.
  - **Keyboard only:** Tab to the cart button, Enter opens, focus is inside; Tab cycles within the drawer; every control shows the gold ring; Escape closes and focus is back on the cart button.
  - **Screen reader or accessibility tree:** the dialog is named "Your Order"; each stepper and remove button names its line; a quantity change and a remove are announced.
  - **Reduced motion emulated:** the drawer, badge and bar appear without animated movement.
  - **Storage blocked** for `localhost`: the drawer opens with the empty state and nothing errors.
  - **Console and dev-server terminal:** no errors, no hydration warnings, no `next/image` `sizes` warning.
- Repeat the sample-cart checks at 375px once against `npm run build` + `npm run start`.
