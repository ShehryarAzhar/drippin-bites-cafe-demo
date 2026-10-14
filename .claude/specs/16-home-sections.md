# Spec 16: Home Sections

**Status:** Implemented
**Depends on:** 14, 15 (and 03 for `getContactDetails` / `tbdSafe`, 05 for `ProductImage` and `PriceTag`, 06 for the `/menu` section ids and `scroll-margin-top`, 08 for `DELIVERY_NOTE`)

## Summary

Finish the home page below "The Line-up" with three sections: category shortcuts that jump straight to each part of the menu, a short deals preview that shows the bundles are real and orderable, and a "Find Us" section with the area, the order types and the contact details, which works while every contact value is still `"TBD"`. With these the home page tells the whole pitch: Cairo Crunch first, then everything else the cafe sells, then the deals, then where to find it.

## Goals

- Below `HomeCairoFeature`, in this order: category shortcuts → deals preview → Find Us. The page order from CLAUDE.md section 7 is then complete.
- **Category shortcuts:** one tile for every non-featured category that has items, in file order (8 today: Classic Pizza, Special Pizza, Premium Pizza, Burgers, Sandwiches, Wraps, Pasta, Dips). Each tile shows the category image, its name and its lowest price, and links to `/menu#<category.id>`.
- **Deals preview:** the first three buildable deals as the same `DealCard` used on `/menu`, addable from the home page, and a link to all deals at `/menu#deals`.
- **Find Us:** `restaurant.area`, the three `restaurant.orderTypes`, the delivery note, and the address / phone / WhatsApp / hours rows that have real values. When all of them are `"TBD"` (as today), there is no contact column at all: the panel shows only the area, the order types, the delivery note and the "Start your order" link. Nothing looks like a real number or address unless it comes from `menu.json`.
- Everything shown comes from `menu.json` through `lib/menu.ts`, apart from the short authored copy listed under Data.
- `app/page.tsx` stays a small server component that arranges five sections.
- `npm run lint` and `npm run build` pass, with `/` still prerendered as static.

## Out of scope

- Any change to the hero or "The Line-up" (spec 15), apart from what is needed to keep the section rhythm.
- A map, a map embed, directions links or a Google Maps URL. There is no address yet, and an embed is a third-party request.
- A WhatsApp "chat with us" or "order on WhatsApp" link from the home page. The WhatsApp order flow is specs 17 and 18; the home page's only order route is through `/menu` and the cart.
- Delivery areas, delivery fees, delivery times or opening-hours copy beyond what `menu.json` holds (open question 8 in CLAUDE.md).
- Item-level shortcuts, search, filtering, a carousel or an auto-rotating deals slider.
- A Cairo Crunch tile in the shortcuts: the hero and "The Line-up" already cover it (decided 2026-10-14).
- Hand-picked or "best seller" deals in the preview: it uses file order until the owners say which deals sell best (CLAUDE.md open questions).
- A "coming soon" or placeholder line for missing contact details: absent values simply leave nothing behind.
- Changes to `DealCard`'s look or behaviour beyond the move to `components/menu/`; changes to the customiser, the cart or `/menu`.
- Reviews, ratings, "bestseller" or "popular" labels, social-media embeds, newsletter signup.
- The footer. It keeps its compact contact block; Find Us is a separate, larger section on `/` only (spec 04 drew this line).
- Open Graph image and `metadataBase` (spec 19). A page-level `metadata` export.
- Future phases from CLAUDE.md section 3: backend, auth, payments, WhatsApp Cloud API, admin dashboard, videos.
- Editing `data/menu.json` or `types/menu.ts`. Installing packages. Tests of any kind.

## User flow

On a phone, after scrolling past "The Line-up" on `/`:

1. A gold rule and the heading "PICK YOUR / CRAVING" ease in. Under it, a two-column grid of dark tiles: each a category photo on the gold-lit stage, its name, and "From Rs. 499" style price.
2. They tap "Burgers". `/menu` opens with the Burgers section under the sticky category bar and the Burgers chip active.
3. Back on `/`, they keep scrolling. A "16 Deals" pill and "BUNDLE / DEALS" heading, then three dark deal cards one under the other (Deal 1, 2, 3), each listing everything in the bundle with its price and Add button.
4. They tap Deal 3. The deal builder opens exactly as on `/menu`: pick two pizza flavours and a drink, add to cart.
5. Under the cards, "See all 16 deals" takes them to `/menu#deals`.
6. Last before the footer: "FIND / US". A pill with "Johar Town, Lahore", three chips "Delivery", "Takeaway", "Dine-in", and the delivery note, in a single centred column (no contact details yet). A gold "Start your order" button goes to `/menu`.
7. Once the owners fill in the address, phone and hours, those rows appear in that section with icons, and the phone becomes a tap-to-call link, with no code change.

## UI & design

Reference: `docs/brand/poster-*.jpeg` for the poster panel treatment (dark field, gold edge, corner dot grids and wave lines, pill labels) and `docs/menu-reference/*.jpeg` for how the printed menu lists categories. Reference only; nothing is imported from `docs/`. Load the `frontend-design` skill when implementing.

### Page structure and rhythm

- `app/page.tsx` renders, inside the layout's `<main>`: `HomeHero` → `HomeCairoFeature` → `HomeCategories` → `HomeDeals` → `HomeFindUs`. No `<main>` of its own.
- Each new section is a `<section>` with an id and `aria-labelledby` its `h2`, on the site width (`max-w-6xl`, 16px side padding at 375px, 24px from `sm`).
- The vertical rhythm matches `/menu`: about 56px between sections at 375px and 88px from `md`. `HomeCairoFeature` already brings its own `py-14 md:py-22`; the new sections continue on the same spacing, with the last one leaving about 64px / 96px before the footer's rule. No doubled gaps where two paddings meet.
- Every section header is centred, with `reveal-on-scroll`: `GoldRule` → optional `PillLabel` → `BrandHeading` as `h2`, `section` size, cream lead and gold accent. Cards and tiles do not animate in (spec 05's rule).

### Category shortcuts (`app/home-categories.tsx`)

- `<section id="categories">`, heading lead "Pick Your", accent "Craving".
- **Tiles:** a `<ul>` grid, 2 columns at 375px, 3 from `sm`, 4 from `lg` (8 tiles fill two rows of four), 12px gaps on phones and 20–24px from `md`. Each `<li>` holds one tile, a single `next/link` `Link` to `/menu#<id>` covering the whole tile, so the tap area is the tile:
  - `ProductImage` with the category's `image`, the dark gold-lit stage on, square box, `object-contain`, lazy-loaded, empty `alt` (the name is beside it), and a `sizes` value matching the grid.
  - Below the image, inside the tile: the category name in the display font (Anton, uppercase, about 1.125–1.25rem, no font weight set, cream) and "From" + `formatPrice(...)` in the body font, `text-muted-foreground`. The price is plain text, not the navy `PriceTag`: eight navy tags in a grid would be noise, and the tile is a link, not a product.
  - A small lucide `ArrowUpRight` (or `ArrowRight`) in gold at the tile's top-right or after the name, `aria-hidden`, that moves about 2px on hover.
  - Tile surface: the dark secondary surface (`bg-secondary/60`) with a thin `ring-gold/25`, `rounded-xl`, soft dark shadow, the same family as `ComboCard` / `DealCard` but quieter. On hover: lift about 2px, ring to `gold/50`, shadow deepens; on press it settles back. 200ms. Gold focus ring on the link.
  - Names never truncate: "Premium Pizza" and "Special Pizza" may wrap to two lines in a 2-column tile at 375px (about 165px wide); tiles in a row keep equal height (grid stretch, the price pinned to the bottom).
- No closing link: the tiles are the links.

### Deals preview (`app/home-deals.tsx`)

- `<section id="deals">`, header: `GoldRule` → `PillLabel` with the count of all buildable deals ("16 Deals") → heading lead "Bundle", accent "Deals".
- **Cards:** the first three of `getBuildableDeals()` (deals 1–3 today) as `DealCard`, moved to `components/menu/deal-card.tsx` and unchanged. Grid: 1 column at 375px, 2 from `sm` with the third card hidden until `lg`, 3 from `lg`, the same gaps as `/menu`'s Deals grid. Cards keep their own reveal, hover lift and stretched Add button.
- **Closing link,** centred, about 32px below: a `Link` to `/menu#deals` styled with `buttonVariants({ variant: "outline", size: "lg" })`, text "See all" + the count + "deals", with a lucide `ArrowRight` that slides on hover, as "See the full menu" does.
- No backdrop glow band: "The Line-up" and Find Us carry the page's light.

### Find Us (`app/home-find-us.tsx`)

- `<section id="find-us">`, heading lead "Find", accent "Us".
- **Panel:** one wide poster panel under the header, not a row of boxes: `rounded-2xl`, the dark secondary surface, `ring-1 ring-gold/40`, a warm radial gold light from one corner (about 10–14%, like `DealCard`'s), and the shared corner decorations from `components/brand/corner-ornaments.tsx` (`DotGrid` top-right, `WaveLines` bottom-left), faint and clipped to the panel. Padding about 24px at 375px, 40–48px from `md`.
- **Layout.** At 375px always one centred column. From `md` it depends on the data:
  - **With at least one contact row:** two columns, start-aligned. Left: items 1–3 (where and how). Right: item 4 (contact rows), then item 5 (the action).
  - **With no contact rows** (today): one centred column at every width, items 1–3 then item 5, capped at about 36rem so the lines stay short inside the wide panel. No empty right column, no divider, no reserved space.
- **Content:**
  1. `PillLabel` (pill variant, `sparkles` off) with a lucide `MapPin` and `restaurant.area`.
  2. The order types: `restaurant.orderTypes` in file order as three small chips (cream outline, cream text, body font, uppercase small caps tracking), with labels from a shared map (see Data). A short lead-in line above them: "Eat in, pick up or get it delivered."
  3. The delivery note `DELIVERY_NOTE` from `lib/cart/copy.ts`, small, `text-muted-foreground`, with a lucide `Bike` or `Truck` icon. Shown only when `orderTypes` includes `delivery`.
  4. **Contact rows** (right column from `md`), rendered only when at least one value is present: one row per present value from `getContactDetails()`, each with a gold lucide icon (`MapPin` address, `Phone` phone, `MessageCircle` WhatsApp, `Clock` hours) and a small gold uppercase label ("Address", "Call", "WhatsApp", "Hours") above the value. The phone row is a `tel:` link, at least 44px tall, gold on hover. Address and hours wrap freely (`wrap-break-word`). WhatsApp is plain text, as in the footer.
     A missing value leaves no trace: no row, icon, label, placeholder digits, "TBD" or "coming soon" text. When some values are present and others are not, only the present rows show.
  5. The action: a `Link` to `/menu` styled with `buttonVariants({ size: "lg" })` (the gold 56px pill), "Start your order", with the `ArrowRight`. Full width at 375px, auto width from `md`.
- The logo is not repeated here; the footer directly below has it.

### States

- **Category image missing:** `ProductImage`'s fallback (faint `logo-mark.svg`) in the tile's stage; the tile keeps its size.
- **Category with no items:** no tile. **No non-featured category with items:** the section is not rendered.
- **No featured category:** every category with items gets a tile (nothing is skipped as "already shown").
- **No buildable deals:** the deals section is not rendered. **Fewer than three:** those that exist, and the hidden-third rule only applies when there is a third. The closing link's count always matches `getBuildableDeals().length`.
- **All contact values `"TBD"` (today):** no contact column and no wording about it; the panel is the single centred column of area, order types, delivery note and "Start your order", at every width.
- **Some contact values present:** only those rows; from `md` the panel switches to two columns. **`orderTypes` empty:** the chips, the lead-in line and the delivery note are absent, with no gap.
- **Cart has items (phone):** the fixed "View cart" bar covers the bottom 80px; the layout's existing spacer keeps "Start your order" and the footer reachable.
- **Loading / error:** none beyond images. The page is static and prerendered.

### Motion

- Section headers: `reveal-on-scroll`. Deal cards: their existing reveal. Tiles and the Find Us panel: no entrance; tiles have the hover lift, arrows slide 2–4px, all 150–300ms.
- With `prefers-reduced-motion: reduce`, nothing moves (the global rule and `reveal-on-scroll`'s opt-in already handle this; any new transition uses the same pattern).

### Accessibility

- Heading outline on `/` after this spec: one `h1`, four `h2`s (Line-up, Craving, Deals, Find Us), `h3`s for the Line-up cards, the combo, each category tile and each deal card. No skipped level. The Find Us panel's column labels are not headings (small `p` labels, as in the footer).
- Each category tile is one link whose accessible name is the category name and its price ("Burgers, from Rs. 400"); the image and arrow are `aria-hidden` / empty `alt`.
- "See all 16 deals", "Start your order" and the phone link are links with the gold focus ring, at least 44px tall (the buttons 56px).
- Decorations and glows are `aria-hidden` and `pointer-events-none`.
- Text pairs: cream, gold and `muted-foreground` on the dark surfaces only. No cream cards in these sections, so no `card-muted-foreground` is needed.

## Data

- **`menu.json`,** read only through `lib/menu.ts`, in server components:
  - `menu.categories` filtered to `items.length > 0` and `id !== getFeaturedCategory()?.id`, in file order → each tile's `id` (link hash, matching the `/menu` section id), `name`, `image`.
  - The tile price: the lowest `variants[].price` across all of the category's `items` (today: Classic 499, Special 649, Premium 649, Burgers 400, Sandwiches 449, Wraps 449, Pasta 649, Dips 60). A new helper in `lib/menu.ts`, built on `getLowestPrice`, formatted with `formatPrice`.
  - `getBuildableDeals()` → the first three for the cards, and the full length for the pill and the closing link. `DealCard` does its own lookups as before.
  - `menu.restaurant.area`, `menu.restaurant.orderTypes` (`delivery`, `takeaway`, `dine-in`).
  - `getContactDetails()` → `address`, `phone`, `whatsapp`, `hours`, each `undefined` while `"TBD"`.
  - Not used: `sizes`, `addOnGroups`, `combos`, `softDrinks`, `restaurant.name` / `tagline` (the footer shows them).
- **Order type labels:** `OrderType` from `types/menu.ts` mapped to "Delivery", "Takeaway", "Dine-in" in one small shared map (e.g. `lib/order-types.ts`), so spec 17's order-type control reuses the same words.
- **Shared copy:** `DELIVERY_NOTE` from `lib/cart/copy.ts`.
- **Authored copy,** the only new words not from the data: "Pick Your", "Craving", "From", "Deals" (pill suffix), "Bundle", "See all … deals", "Find", "Us", "Eat in, pick up or get it delivered.", "Address", "Call", "WhatsApp", "Hours", "Start your order", and the three order-type labels.
- **Cart / customiser state:** none read or written by the new files. `DealCard`'s `AddButton` uses `useCustomizerStore`, and `CustomizerRoot` is already mounted in the layout.
- **Env vars:** none. `NEXT_PUBLIC_WHATSAPP_NUMBER` is not shown or used here.
- **New types or zod schemas:** none beyond the order-type label map's own type.

## Implementation outline

Files to create:

- `app/home-categories.tsx`: server component; the shortcuts header and the tile grid (the tile can be a small function in the same file).
- `app/home-deals.tsx`: server component; the deals header, the three `DealCard`s and the "See all" link.
- `app/home-find-us.tsx`: server component; the Find Us header and panel with the TBD-safe contact rows.
- `lib/order-types.ts`: the `OrderType` → label map.

Files to move:

- `app/menu/deal-card.tsx` → `components/menu/deal-card.tsx`, now that `/` uses it (CLAUDE.md section 11; spec 14 planned this). Update the import in `app/menu/deals-section.tsx` in the same change. No other change to the card.

Files to modify:

- `app/page.tsx`: append the three sections after `HomeCairoFeature`.
- `lib/menu.ts`: the category lowest-price helper; optionally a small `getShortcutCategories()` if the filter reads better there than in the component.
- `CLAUDE.md`: after verification, set spec 16 to `Implemented` and update section 1's "Current state" (the five home sections, `DealCard`'s new path, `lib/order-types.ts`).

Files that stay as they are: `data/menu.json`, `types/`, `lib/format.ts`, `lib/cart/`, `store/`, `components/cart/`, `components/customizer/`, `components/layout/`, `components/brand/`, `components/ui/`, `components/menu/` other than the moved card, `app/home-hero.tsx`, `app/home-cairo-feature.tsx` (unless its bottom padding must change for the rhythm), `app/layout.tsx`, `app/globals.css` (unless a tile style truly needs a utility), `next.config.ts`, `package.json`, `package-lock.json`, `public/`, `docs/`.

Order of work:

- Read `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md` for hash links to another route under `partialPrefetching`, and load the `frontend-design` skill.
- Move `DealCard`, confirm `/menu` is unchanged.
- `lib/menu.ts` helper and `lib/order-types.ts`.
- Category shortcuts, then the deals preview, then Find Us (with every contact value TBD first, then temporarily with fake values in a local edit to check the filled layout, reverted before committing).
- `app/page.tsx`, then lint, build, browser checks, then the CLAUDE.md update.

## Edge cases

- **Hash links across routes:** `/menu#burgers` must land with the Burgers heading visible below the header and the category bar (spec 06's `scroll-margin-top`), and the chip active. `layout.tsx` sets `data-scroll-behavior="smooth"` so Next turns smooth scrolling off for route changes; check the landing is a jump, not a long animated scroll through Cairo Crunch, both on client navigation and on a fresh load of `/menu#burgers`.
- **Section id `deals` on `/`** is the same id as `/menu`'s Deals section, on a different page, so there is no clash; `categories` and `find-us` must not collide with `content` or with any `/` section id (`cairo-crunch`).
- **Tile name length:** the longest names are "Premium Pizza" / "Special Pizza" / "Classic Pizza" (13 characters). At 320px a 2-column tile is about 140px wide; names wrap between words, never mid-word, never overflow.
- **Price line:** "From Rs. 649" must stay on one line in the narrowest tile (`whitespace-nowrap` on the price, the "From" may sit on the same line).
- **Dips tile:** the `dips` category is sauces sold alone (Rs. 60–90). It still gets a tile; its lowest price makes it read as an add-on, which is accurate.
- **Pizza prices:** the lowest pizza price is the smallest size present, not always `small` (spec 03's note on `getDefaultVariant`). Compute across every variant.
- **Hidden third deal at `sm`–`lg`:** it is hidden from everyone (`display: none`), not just visually, so the tab order and the screen-reader list match what is seen.
- **Deal card height:** the three previewed deals have 3–4 content lines; cards in a row keep equal height (the card already uses `h-full`). The preview must not pick deals 16 or 7 by default, whose long lists would make the row uneven; it uses file order, which is deals 1–3.
- **`DealCard` move:** it uses `useId` and imports `AddButton` (client); the card itself stays a server component. Moving it must not add `"use client"`.
- **Contact values from the data:** when the owners fill them in, they may contain spaces or dashes; the `tel:` href strips whitespace the way the footer does. Only the phone is a link.
- **Partial contact data:** e.g. hours known but address still TBD. Only the present rows render, and from `md` the panel is two columns; the layout still balances when the right column holds a single row and the action.
- **No contact rows at `md` and up:** the panel must not keep a two-column grid with an empty side; the single-column layout is chosen from the data on the server, not hidden with CSS.
- **Corner decorations in the panel:** clipped by the panel (`overflow-hidden` on the panel, not the section), never behind text, no horizontal page scroll at 320px.
- **Client boundary:** no new `"use client"` file. `ProductImage` and `AddButton` are the existing client components.
- **`cacheComponents`:** the page reads only the static menu import, so it still prerenders with no `"use cache"` and no `Suspense`.
- **`cn` and `text-*`:** no `--text-*` theme sizes for the tile names; use Tailwind's built-in sizes or the existing `heading-card` utility if it fits a 140px tile.
- **`AGENTS.md`:** `next dev` rewrites it; commit it with the work if it changes.

## Acceptance criteria

- [x] `/` renders, in order: hero, "The Line-up", category shortcuts, deals preview, Find Us, all inside the layout's `<main>`, with no `<main>` of its own.
- [x] The shortcuts section is `<section id="categories">` labelled by an `h2` reading "Pick Your" (cream) / "Craving" (gold), opened by a `GoldRule`.
- [x] It shows exactly one tile per non-featured category with items, in `menu.json` order (8 today), each with the category image through `ProductImage` (`object-contain`, lazy), the category name and "From Rs. …" equal to the lowest variant price in that category.
- [x] Each tile is a single link to `/menu#<category.id>`, the whole tile is the tap target, and its accessible name includes the category name.
- [x] Tapping a tile opens `/menu` with that category's heading in view below the header and the category bar, and the matching chip active, with no long animated scroll.
- [x] Tile grid: 2 / 3 / 4 columns at 375px / `sm` / `lg`, equal heights per row, prices on one line, no name truncated or overflowing at 320px.
- [x] The deals section is `<section id="deals">` with a `PillLabel` showing the number of buildable deals and an `h2` "Bundle" / "Deals".
- [x] It shows the first three buildable deals (deals 1, 2, 3 today) as `DealCard` from `components/menu/deal-card.tsx`; 1 column at 375px, 2 from `sm` (third hidden), 3 from `lg`.
- [x] Tapping a previewed deal's card opens the deal builder on `/`, and adding puts the deal in the cart, as on `/menu`.
- [x] "See all 16 deals" (count from the data) is an outline `lg` link to `/menu#deals`, and lands on the Deals section with the Deals chip active.
- [x] `app/menu/deal-card.tsx` no longer exists, and `/menu`'s Deals section looks and behaves as before.
- [x] The Find Us section is `<section id="find-us">` with an `h2` "Find" / "Us" and one poster panel showing `restaurant.area`, the three order types as "Delivery", "Takeaway", "Dine-in" (labels from `lib/order-types.ts`), the delivery note from `DELIVERY_NOTE`, and a gold `lg` "Start your order" link to `/menu`.
- [x] With today's data (all contact values `"TBD"`), the panel has no contact column: it shows only the area, the order types, the delivery note and "Start your order", in one centred column at 375px and at desktop width, with no contact rows, icons, empty labels, digits, "TBD" or "coming soon" text, and no empty second column.
- [x] With values temporarily filled in locally, each present value shows as its own labelled row with its icon, the phone is a `tel:` link at least 44px tall, absent values show no row, and from `md` the panel is two columns with the contact rows and the action on the right. (Reverted before committing; `menu.json` is unchanged in the diff.)
- [x] The panel's corner decorations are the shared `DotGrid` and `WaveLines`, `aria-hidden`, never behind text, and cause no horizontal scroll at 320px.
- [x] Heading outline on `/`: one `h1`, four `h2`s, and an `h3` for each Line-up card, the combo, each tile and each previewed deal.
- [x] With `prefers-reduced-motion: reduce`, no header reveals or hover lifts animate.
- [x] No item or category name, price, image path, deal number or contact value is written as a literal in the new files; the only authored strings are those listed under Data.
- [x] No hex values or `zinc` / `gray` / `neutral` classes in the new files; nothing imports `data/menu.json` directly or references `docs/`.
- [x] No new file contains `"use client"`; `app/page.tsx` contains no markup beyond arranging the five sections.
- [x] `data/menu.json`, `types/`, `store/`, `lib/cart/`, `components/cart/`, `components/customizer/`, `components/layout/`, `next.config.ts`, `package.json` and `package-lock.json` are unchanged.
- [x] `npm run lint` exits with no errors or warnings.
- [x] `npm run build` completes successfully, with `/` prerendered as static and no Cache Components errors.

## Verification

No automated tests (per CLAUDE.md).

- `npm run lint` passes.
- `npm run build` passes, and its route list shows `/` as static.
- `git status` shows only: `app/home-categories.tsx`, `app/home-deals.tsx`, `app/home-find-us.tsx` and `lib/order-types.ts` added; `deal-card.tsx` moved; `app/page.tsx`, `app/menu/deals-section.tsx` and `lib/menu.ts` modified (and `app/home-cairo-feature.tsx` / `app/globals.css` only if the rhythm or a tile utility needed it); this spec; `CLAUDE.md` once the status is updated (and `AGENTS.md` only if `next dev` rewrote it).
- Manual checks in the browser with `npm run dev`:
  - **375px, scrolling from the Line-up:** even spacing between all five sections; the shortcut tiles two per row with large images; three deal cards stacked; the Find Us panel as one centred column with no contact details; no horizontal scroll.
  - **320px:** tile names wrap cleanly, prices stay on one line, the Find Us panel and its chips fit.
  - **Shortcut tap-through:** tap Classic Pizza, Burgers and Dips; each lands on its section under the category bar with its chip active, quickly, not after a long smooth scroll. Also load `/menu#wraps` directly.
  - **Deals:** add Deal 3 from `/` (two flavours, a drink) and check the drawer; "See all 16 deals" lands on `/menu#deals`.
  - **Find Us, filled:** temporarily set address, phone and hours in `menu.json` locally; check the two-column layout from `md`, the rows and the tap-to-call link; then set only `hours` and check the partial state; revert the file.
  - **375px with items in the cart:** "Start your order" can be scrolled clear of the "View cart" bar.
  - **Desktop (1024px and 1280px):** tiles four per row in two rows; three deal cards in one row at equal height; Find Us in two columns; nothing stretched on 1920px.
  - **`sm`–`lg` (e.g. 768px):** tiles three per row; two deal cards, the third hidden and not reachable by Tab.
  - **Side by side with the posters:** the Find Us panel reads as the same brand as the deal and combo cards (gold edge, dot grid, wave lines), not a plain box.
  - **`/menu` regression:** the Deals section and its cards look and work as before.
  - **Broken image:** temporarily point one category image at a wrong path; the tile shows the fallback mark; revert.
  - **Keyboard only:** Tab through the tiles, each deal's Add, "See all 16 deals", "Start your order" (and the phone link when filled), each with a visible ring.
  - **Accessibility tree:** heading outline as above; each tile announced as one link with the category name; decorations not announced.
  - **Reduced motion emulated:** no reveal or lift animation.
  - **Console and dev-server terminal:** no errors, no hydration warnings, no `next/image` warnings.
- Repeat the 375px scroll and the shortcut tap-through once against `npm run build` + `npm run start`.

## Open questions

None. The four questions from the first draft were answered on 2026-10-14 and are folded into the sections above: the deals preview keeps the first three buildable deals in file order (which deals sell best is now an owners' question in CLAUDE.md); the shortcuts have no Cairo Crunch tile; with no contact values Find Us shows no contact column and no "coming soon" line; and the headings are "Pick Your / Craving", "Bundle / Deals" and "Find / Us".
