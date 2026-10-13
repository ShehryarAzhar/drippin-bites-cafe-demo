# Spec 15: Home Hero and Cairo Crunch Feature

**Status:** Implemented
**Depends on:** 04, 05 (and 06 for `reveal-on-scroll` and `splitName`, 09 and 11 for the cards' Add control, 13 for `ComboCard`)

## Summary

Replace the holding page at `/` with the first two parts of the real home page: a poster-style hero that leads with Cairo Crunch and an "Order Now" button, and a featured section that puts the four Authentic / Lahori Twist dishes and the Cairo Combo in front of the visitor. This is the first screen the owners see when the demo link is opened, and the first screen an Instagram visitor lands on, so it has to look like their own posters and get a customer to the menu in one tap. It also builds the poster corner decorations that specs 02 and 04 deferred to this spec.

## Goals

- `/` opens with a full-bleed hero: `public/images/cairo/tamaya-authentic.webp` over a dark gradient with a soft gold glow behind it, a two-colour Cairo Crunch headline, and an "Order Now" button that goes to `/menu`.
- The hero follows the posters' anatomy: ticket label, cream line, gold line, supporting line, the food, a "Now at Drippin Bites" pill.
- At 375 × 667 the label, the headline, the "Order Now" button and the top of the plate are visible without scrolling.
- A featured Cairo Crunch section directly under the hero: the four version items (`hawawshi`, `ful`, `tamaya`, `faroge`) as stacked `ItemCard`s that can be added from the home page, then the Cairo Combo card, then a link to the full menu.
- Reusable corner decorations (dot grid, wavy lines and, if it passes its trial, a palm-leaf shadow) in `components/brand/`, used by the hero.
- Everything shown comes from `menu.json` through `lib/menu.ts`, apart from the short authored copy listed under Data.
- `app/page.tsx` stays a small server component that arranges the two sections; spec 16 appends its sections below them.
- `npm run lint` and `npm run build` pass.

## Out of scope

- The rest of the home page: category shortcuts, deals preview and the location / contact section (spec 16).
- The Cairo Crunch items outside the four version items: Sando and Croissant sandwiches, sides and drinks. They stay on `/menu`; the section links there.
- Any change to how items or the combo are customised or added. The cards and the combo card bring the behaviour of specs 09, 11, 12 and 13 unchanged.
- A carousel, slider or auto-rotating hero. One image, one headline.
- Video or animated backgrounds (CLAUDE.md section 3), parallax, and any animation library.
- New images. The hero uses a file already in `public/images/`; the corner decorations are drawn in CSS and inline SVG, not image files. Nothing is copied from `docs/`.
- `logo-stacked.svg` in the hero. The header's logo is directly above it; a second logo would repeat it.
- A fourth heading size. The hero headline uses `heading-hero` as it is.
- Open Graph image, Apple touch icon and `metadataBase` (spec 20). A page-specific `metadata` export: the root layout's default title and description already describe the home page.
- Contact details, opening hours or a delivery promise in the hero (all `"TBD"`; spec 16 owns the TBD-safe section).
- Editing `data/menu.json`, `types/menu.ts`, the cart or the customiser. Installing packages or adding shadcn components.
- Future phases from CLAUDE.md section 3: backend, auth, payments, WhatsApp Cloud API, admin dashboard, videos. No ratings, "bestseller" or stock labels.
- Tests of any kind.

## User flow

On a phone, arriving from the Instagram bio link:

1. The page opens on a dark, warm screen. Under the header: a gold ticket label "Egyptian Street Food · Live", then "CAIRO CRUNCH" in cream and "HAS LANDED" in gold, each line nearly the width of the screen, then "Crispy Outside. Bold Inside."
2. Right under that is a large gold "Order Now" button, and below it the Tamaya sandwich on its wooden plate, lit from behind by a gold glow, with a "Now at Drippin Bites" pill beneath it.
3. They tap "Order Now" and land at the top of `/menu`, where Cairo Crunch is the first section.
4. Or they scroll instead. "The Line-up" eases in, with the line "Every dish, two ways." and the navy "Authentic" and red "Lahori Twist" labels from the printed menu.
5. Four cream cards follow, one per row: Hawawshi, Ful, Tamaya, Chicken Faroge, each with its photo, "From Rs. …" tag and a gold Add button.
6. They tap the Tamaya card. The customiser sheet opens on the home page exactly as it does on the menu: Authentic / Lahori Twist toggle, Cairo Dips, quantity, "Add to cart". They add it; the cart badge pops and the "View cart" bar appears.
7. Below the four cards is the dark Cairo Combo card with its "Build" button, which opens the combo builder.
8. Last in the section is a "See the full menu" button, which goes to `/menu`.

## UI & design

Reference: `docs/brand/poster-hawashi-crispy-pockets.jpeg` and `poster-faroge-grilled-wrap.jpeg` for the hero (ticket label, two-colour headline filling the width, one supporting line, food low in the frame, sparkle pill, dot grids top-left and bottom-right, wavy lines bottom-left, palm shadow top-right); `docs/brand/photo-tamaya-sandwich.jpeg` for the light. Reference only; nothing is imported from `docs/`. Load the `frontend-design` skill when implementing.

### Page structure

- `app/page.tsx` renders inside the layout's `<main>` and adds none of its own. Order: hero → Cairo Crunch feature. Spec 16 adds sections after it.
- The hero band is full-bleed; its content and the feature section sit on the site width (`max-w-6xl`, 16px side padding at 375px, 24px from `sm`).
- The holding page's centred pill / heading / rule is removed entirely.

### Hero (`app/home-hero.tsx`)

- **Band:** a `<section>` labelled by the `h1`, full width, directly under the sticky header (in flow, not behind it). Background layers, back to front, all `aria-hidden` and none an image file:
  1. a vertical gradient from `--background` at the top to a slightly warmer, lighter brown (toward `--secondary`) low in the band, then back to `--background` at the bottom edge, so the band has no hard end;
  2. the plate glow: a large radial gradient of `--gold`, about 35–40% at its centre falling to transparent, centred on the plate and wider than the image box so it spills behind the headline's last line. Clearly stronger than the 13% band glow on `/menu`'s featured section: this is the brightest thing on the site;
  3. the corner decorations (below).
  The page's fixed grain and vignette stay visible through all of it. A gold hairline fading at both ends closes the band, the same line the header uses.
- **Text block,** top to bottom:
  1. `PillLabel` ticket variant with `category.subtitle`.
  2. `BrandHeading` as the page's only `h1`, `hero` size: lead `category.name` ("Cairo Crunch", cream), accent "Has Landed" (gold). At 375px each line is one line and fills most of the width, like the poster headline.
  3. `category.tagline` in the body font, about 1.125rem, cream at reduced opacity or `text-muted-foreground`, not uppercase, as the poster's supporting line.
  4. The call to action: a `Link` to `/menu` styled with `buttonVariants({ size: "lg" })` (the 56px gold pill), text "Order Now", with a lucide `ArrowRight` after the text that slides about 4px on hover. One button only.
- **Image:** the featured category's `image` (`/images/cairo/tamaya-authentic.webp`) through `ProductImage` with its stage turned off (see Implementation outline), so the cutout sits directly on the band's glow with no box, no clip and no second glow. `object-contain` in a square box sized by the layout; a soft dark drop shadow under the plate. Eager-loaded with high fetch priority: it is the page's largest paint. Empty `alt`: the headline beside it names what is shown.
- **Sparkle pill:** `PillLabel` (pill variant, `sparkles`) reading "Now at" plus `restaurant.shortName`, centred under the plate and overlapping its lower edge slightly, as on the posters.
- **Layout at 375px:** one centred column in the order label → headline → tagline → button → image → sparkle pill. About 24px above the label; 16–20px gaps in the text block; the image box is about 80vw wide, capped so the fold rule in Goals holds. The button comes before the image so it is in the first screen and never sits under the fixed "View cart" bar.
- **Layout from `lg`:** two columns, vertically centred, at least about 560px tall: the text block start-aligned on the left (label, headline with `align="start"`, tagline, button), the image on the right at about 480–560px with the glow centred behind it and the sparkle pill under it. If the 12-character headline line cannot sit beside the image at 1024px without wrapping, the split starts at `xl` instead and `lg` keeps the centred column.
- **Between `sm` and the split:** the centred column, with the image capped at about 420px.

### Corner decorations (`components/brand/`)

Three decorative, `aria-hidden`, pointer-events-none pieces, positioned by the caller with `className`, all in `--gold` and all faint enough that they read as texture, not content:

- **Dot grid:** a small square of gold dots (about 6 × 5, 10–12px pitch), fading toward one corner with a mask. `ComboCard` and `DealCard` already draw this inline with a CSS gradient; that is the starting point, and both switch to the shared piece.
- **Wavy lines:** five or six thin concentric wave strokes, as in the posters' bottom-left corner. Inline SVG, 1px strokes, about 25–35% opacity.
- **Palm-leaf shadow:** a soft, blurred palm frond silhouette, as in the posters' top-right corner. Inline SVG with a blur, gold-brown at about 10–15% opacity, large (it should run off the corner). This piece is a trial: it is judged in the browser at 375px and at desktop width against the two posters. If it does not read as a convincing palm shadow at both, it is removed (component and hero placement), the hero keeps the dot grids and wavy lines, and the outcome is recorded under Open questions in this spec before verification.

In the hero: dot grid top-left, palm shadow top-right from `sm` (see Open questions), wavy lines bottom-left, a second dot grid bottom-right from `md`. At 375px the decorations stay in the corners and never sit behind the headline, button or plate; the bottom-right dot grid is hidden.

### Cairo Crunch feature (`app/home-cairo-feature.tsx`)

- A `<section id="cairo-crunch">` labelled by its `h2`, about 56px below the hero at 375px and 88px from `md` (the menu page's section rhythm), with `pb` to match so spec 16's first section starts on the same rhythm.
- **Header, centred, with `reveal-on-scroll`:** `GoldRule` → `BrandHeading` as `h2`, `section` size, lead "The", accent "Line-up" → one sentence in `text-muted-foreground`: "Every dish, two ways." followed by the two version labels as small filled tags, read from the data: "Authentic" on `bg-navy` and "Lahori Twist" on `bg-brand-red`, white text, using `versionColors` from `lib/version-colors.ts`. On the dark page the navy tag gets the thin cream ring `ComboCard` gives its price tag, because navy alone fades into the background.
- **Cards:** the featured category's version items as `ItemCard` in the default `stacked` layout and default mode (title `item.name`, subtitle, Authentic description and image, "From" price, options line, Add button), heading level `h3`. Grid: 1 column at 375px, 2 from `sm`, 4 from `lg`, 20–24px gaps. `ItemCard`'s default `sizes` already assumes this grid. All lazy-loaded.
- **Combo:** `ComboCard` for each combo from `getCategoryCombos(category)` (one today), full width under the grid with the same gap, as on `/menu`.
- **Closing link:** centred, about 32px below: a `Link` to `/menu` styled with `buttonVariants({ variant: "outline", size: "lg" })`, text "See the full menu", with a lucide `ArrowRight`.
- No backdrop band: the hero already carries the glow, and a second one directly below would flatten both.

### States

- **Hero image missing:** the band keeps its height and glow, and `ProductImage`'s fallback (the faint `logo-mark.svg`) shows in the image box. No broken-image icon.
- **No featured category** (`getFeaturedCategory()` returns nothing): the hero falls back to `restaurant.name` split over two colours with `restaurant.tagline` as the supporting line, no ticket label, the "Order Now" button, and the glow with the faint `logo-mark.svg` in place of the photo; the feature section is not rendered. The page must not crash.
- **Featured category with no version items:** the feature section is not rendered (no empty heading).
- **No `subtitle` / `tagline`:** that line is absent and leaves no gap.
- **No combo for the category:** the combo row is absent; the closing link follows the grid.
- **Cart has items (phone):** the fixed "View cart" bar covers the bottom 80px of the screen. The hero's button is above it by layout; the layout's existing spacer keeps the closing link reachable.
- **Loading / error:** none beyond the image. The page is static and prerendered.

### Motion

- **Hero entrance,** once on load, CSS only: label, headline, tagline and button rise about 12px and fade in, staggered by about 60–80ms, each 300ms or less. The image and glow do not fade from zero: the image may ease in scale (about 0.96 → 1) but stays opaque, so the largest paint is not delayed.
- **Button:** the existing hover brightness and press translate; the arrow's slide, 200ms.
- **Feature header:** `reveal-on-scroll`. Cards do not animate in (spec 05's rule); they keep their hover lift from spec 09. `ComboCard` keeps its own reveal.
- The global `prefers-reduced-motion` rule shortens durations but not delays, so the staggered hero entrance is opted out inside `prefers-reduced-motion: no-preference`, as `reveal-on-scroll` is. With reduced motion nothing animates and everything is in place at once.

### Accessibility

- One `h1` (the hero headline), one `h2` (feature heading), cards and combo `h3`. No skipped level.
- "Order Now" and "See the full menu" are links, not buttons, at least 56px tall, with the gold focus ring. Their arrow icons are `aria-hidden`.
- All background layers, decorations and the hero image are hidden from assistive technology; the sparkle pill and ticket label are real text.
- Text pairs: cream, gold and `muted-foreground` on the dark band only. No text is placed over the plate. Check the tagline's contrast where the glow is brightest behind it.
- The skip link lands on `<main>` and the first Tab reaches "Order Now".

## Data

- **`menu.json`,** read only through `lib/menu.ts`, in server components:
  - `getFeaturedCategory()` → `name` (headline lead), `subtitle` (ticket label), `tagline` (supporting line), `image` (hero image; today `/images/cairo/tamaya-authentic.webp`, the file CLAUDE.md section 7 names), `id` (section id), `items`.
  - The version items: the featured category's items whose `getVariantType(item, category)` is `"version"`. Four today, in file order: `hawawshi`, `ful`, `tamaya`, `faroge`. No item id is typed into a component.
  - The version labels for the header line: `variants[].id` and `variants[].label` of the first version item (`authentic` / "Authentic", `lahori` / "Lahori Twist"), coloured through `versionColors`.
  - `getCategoryCombos(category)` → the `cairo-combo` entry for `ComboCard`.
  - `menu.restaurant.shortName` for the sparkle pill; `restaurant.name` and `restaurant.tagline` only in the no-featured-category fallback.
  - Each card receives its `Item` and `Category`; `ItemCard` and `ComboCard` do their own lookups.
  - Not used: `deals`, `softDrinks`, `addOnGroups` (directly), `sizes`, `restaurant.address` / `whatsapp` / `phone` / `hours`.
- **Authored copy,** the only words not from the data: "Has Landed", "Order Now", "Now at", "The", "Line-up", "Every dish, two ways.", "See the full menu".
- **Cart / customiser state:** none read or written here. The cards' `AddButton` uses `useCustomizerStore`, and `CustomizerRoot` is already mounted in the layout, so the sheets open on `/` with no extra work.
- **Env vars:** none.
- **New types or zod schemas:** none. Prop types stay in their files.
- **Metadata:** `app/page.tsx` exports none; the layout's default title and description apply.

## Implementation outline

Files to create:

- `app/home-hero.tsx`: server component; the hero band, text block, image and sparkle pill. Next to the route because only `/` uses it.
- `app/home-cairo-feature.tsx`: server component; the feature header, the version-item grid, the combo row and the closing link.
- `components/brand/corner-ornaments.tsx` (or one file per piece): the dot grid, wavy lines and (if kept) the palm-leaf shadow.

Files to move:

- `app/menu/combo-card.tsx` → `components/menu/combo-card.tsx`, now that a second route uses it (CLAUDE.md section 11; spec 13 planned this). Update the import in `app/menu/category-section.tsx` in the same change, and swap the card's inline dot grid for the shared piece.

Files to modify:

- `app/page.tsx`: replace the holding content with the two sections; stays a server component.
- `components/menu/product-image.tsx`: one optional prop that turns the stage off (no background, no clip, no built-in glow) while keeping `next/image`, `object-contain` and the missing-image handling, plus a pass-through for fetch priority. `src` becomes optional: with none, the existing fallback mark is shown, which is how the no-featured-category hero reaches it. Existing callers are unaffected.
- `app/menu/deal-card.tsx`: its inline dot grid, identical to the combo card's, is swapped for the shared piece. Nothing else.
- `lib/menu.ts`: a small lookup for a category's version items, if it reads better than filtering in the component.
- `app/globals.css`: the hero entrance keyframes / utility. No new heading size and no new colour token unless the hero gradient clearly needs one.
- `CLAUDE.md`: after verification, set spec 15 to `Implemented`, update the "Current state" paragraph in section 1 (home page, corner decorations, `ComboCard`'s new path) and the `/` bullet in section 7 if the built hero differs from it.

Files that stay as they are: `data/menu.json`, `types/`, `lib/format.ts`, `lib/cart/`, `store/`, `components/cart/`, `components/customizer/`, `components/layout/`, `components/ui/`, `components/menu/item-card.tsx`, `app/layout.tsx`, `app/menu/` other than the import change and `deal-card.tsx`'s dot grid, `next.config.ts`, `package.json`, `package-lock.json`, everything under `public/` and `docs/`.

Order of work:

- Read the bundled docs first (AGENTS.md rule): `01-app/03-api-reference/02-components/image.md` for eager loading and fetch priority in Next 16 (the old `priority` prop has changed), and `link.md` for prefetching under `partialPrefetching`. Load the `frontend-design` skill.
- Move `ComboCard` and confirm `/menu` is unchanged.
- Corner decorations (the palm shadow last, since it may be dropped), then the `ProductImage` stage option.
- The hero: band and layers, text block, image, then both layouts and the entrance motion.
- The feature section, then `app/page.tsx`.
- `npm run lint`, `npm run build`, browser checks at 375px and desktop, then the CLAUDE.md update.

## Edge cases

- **Headline width:** "Cairo Crunch" is 12 characters; `heading-hero` is tuned so a 14-character line fits 375px with 24px padding (spec 02). The gutter here is 16px, so it fits with room; check 320px too, where the line must not break mid-word or overflow.
- **`heading-hero` tops out at 7rem,** where a 12-character line is about 620px wide. That is what decides whether the two-column split can start at `lg` or must wait for `xl`.
- **`BrandHeading` and `text-balance`:** each line is a block span, so balancing must not split "Cairo Crunch" over two lines when it fits on one.
- **Short viewports:** at 375 × 667 the fold rule must hold with the header's 64px. In a landscape phone or a 320 × 568 screen the hero simply grows taller than the screen; nothing is clipped, and no `100vh` height traps content. Use `svh`, not `vh`, for any viewport-relative sizing so the mobile browser bar does not cause a jump.
- **Glow and stacking:** the page's vignette and grain are `z-index: -1` on `body`. The band's layers must sit above them and below the text and image, without an `overflow: hidden` that cuts the glow at the band's edge in a visible line. The palm shadow and wavy lines do need clipping at the viewport edge; clip the decorations, not the glow, and make sure nothing causes horizontal page scroll.
- **`ProductImage` without its stage:** the fallback mark and the pre-hydration error check must still work, and the existing staged callers (`ItemCard`, `ComboCard`, deal cards, the customiser, the cart line) must render exactly as before.
- **Largest paint:** the hero image is the LCP element. It must not be lazy, must not start at `opacity: 0`, and must have a `sizes` value that matches its real width (about 80vw on a phone, about 560px on desktop). The file is 800 × 800, so it is never served wider.
- **Image padding:** `tamaya-authentic.webp` has a wide transparent margin (the plate fills roughly the middle 80%), so the visible plate is smaller than its box. Size the box for the plate, and let the transparent margin overlap the button above and the pill below rather than adding dead space.
- **Section id:** `cairo-crunch` is also a section id on `/menu`, on a different page, so there is no clash. It must not collide with `content` (`<main>`).
- **`/menu` vs `/menu#cairo-crunch`:** both buttons link to `/menu`. Cairo Crunch is the first section there, and a hash would scroll past the "The Menu" intro for no gain.
- **Veg mark:** the Ful and Tamaya cards show no veg mark in default mode (spec 05's rule), although the photo and description are the Authentic ones. Do not pass a variant to change that.
- **Same tap target rules as `/menu`:** the Add button's stretched tap layer needs the card to stay `relative isolate`; do not wrap cards in a transformed element that would break it (the reveal goes on the header, not the cards).
- **Client boundary:** no new `"use client"` file. `ProductImage` and `AddButton` are the existing client components; `home-hero.tsx` and `home-cairo-feature.tsx` must stay server components.
- **`cacheComponents`:** the page reads only the static menu import, so it prerenders with no `"use cache"` and no `Suspense`.
- **`cn` and `text-*`:** no `--text-*` theme sizes for the tagline or pill; use Tailwind's built-in sizes.
- **`AGENTS.md`:** `next dev` rewrites it; commit it with the work if it changes.

## Acceptance criteria

- [x] `/` no longer shows the holding content; it renders the hero and then the Cairo Crunch feature inside the layout's `<main>`, with no `<main>` of its own.
- [x] The hero shows, in order at 375px: a ticket `PillLabel` with `category.subtitle`, an `h1` reading the category name in cream and "Has Landed" in gold, `category.tagline`, an "Order Now" link, the Tamaya image, and a sparkle pill reading "Now at Drippin Bites".
- [x] At 375 × 667 the label, both headline lines, the "Order Now" link and the top of the plate are visible without scrolling; each headline line is a single line.
- [x] The hero image is `/images/cairo/tamaya-authentic.webp`, taken from the featured category's `image`, rendered through `next/image` with `object-contain`, with no box, border or panel around it and a clearly visible gold radial glow behind the plate.
- [x] The hero image request is not lazy and carries high fetch priority; no `next/image` `sizes` or LCP warning appears in the console.
- [x] "Order Now" is a link to `/menu`, at least 56px tall, styled as the gold `lg` button, with a visible focus ring.
- [x] From the split breakpoint the hero is two columns (text start-aligned left, image right) and the headline still sits on two lines.
- [x] Dot grid and wavy lines render in the hero's corners from shared components in `components/brand/`, are `aria-hidden`, never sit behind the headline, button or plate at 375px, and cause no horizontal scroll.
- [x] The palm-leaf shadow is either rendered top-right under the same rules, or removed entirely with no unused component left behind; this spec's Open questions section records which, and why. (Accepted as built: rendered from `sm` up, hidden on phones.)
- [x] The feature section is `<section id="cairo-crunch">` labelled by an `h2`, opened by a `GoldRule`, with the two version labels shown as a navy "Authentic" tag and a red "Lahori Twist" tag read from the data.
- [x] Exactly four `ItemCard`s render, for `hawawshi`, `ful`, `tamaya` and `faroge` in that order, selected by `variantType`, not by id; grid 1 / 2 / 4 columns at 375px / `sm` / `lg`, equal heights per row, price tags on one line.
- [x] Tapping a card on `/` opens the item customiser with the version toggle and Cairo Dips, and adding puts the line in the cart; tapping the combo card opens the combo builder.
- [x] The Cairo Combo card renders under the grid from `components/menu/combo-card.tsx`; `app/menu/combo-card.tsx` no longer exists and `/menu` looks and behaves as before.
- [x] "See the full menu" is a link to `/menu` in the outline `lg` button style, centred under the combo card.
- [x] Heading outline on `/`: one `h1`, one `h2`, five `h3`s (four cards and the combo).
- [x] With the hero image path broken, the hero keeps its height and glow and shows the faint logo mark, in `next dev` and `next start`.
- [x] With `prefers-reduced-motion: reduce`, the hero content is in place immediately and the feature header does not animate.
- [x] No item name, description, price, image path or item id is written as a literal in the new files; the only authored strings are those listed under Data.
- [x] No hex values or `zinc` / `gray` / `neutral` classes in the new files; nothing imports `data/menu.json` directly or references `docs/`.
- [x] No new file contains `"use client"`; `app/page.tsx` contains no markup beyond arranging the two sections.
- [x] `data/menu.json`, `types/`, `store/`, `lib/cart/`, `components/cart/`, `components/customizer/`, `next.config.ts`, `package.json` and `package-lock.json` are unchanged.
- [x] `npm run lint` exits with no errors or warnings.
- [x] `npm run build` completes successfully, with `/` prerendered as static and no Cache Components errors.

## Verification

No automated tests (per CLAUDE.md).

- `npm run lint` passes.
- `npm run build` passes, and its route list shows `/` as static.
- `git status` shows only: `app/home-hero.tsx`, `app/home-cairo-feature.tsx` and the ornaments file(s) added; `combo-card.tsx` moved; `app/page.tsx`, `app/menu/category-section.tsx`, `app/menu/deal-card.tsx`, `components/menu/product-image.tsx`, `app/globals.css` and possibly `lib/menu.ts` modified; this spec; `CLAUDE.md` once the status is updated (and `AGENTS.md` only if `next dev` rewrote it).
- Manual checks in the browser with `npm run dev`:
  - **375 × 667, top of page:** the fold rule above; headline lines fill most of the width; glow visible behind the plate; decorations in the corners only; no horizontal scroll.
  - **320px wide:** headline does not overflow or break mid-word; the ticket label fits.
  - **375px, scrolling:** the feature header eases in; four cards one per row with large images; combo card; closing link; comfortable spacing throughout.
  - **375px with items in the cart:** the "View cart" bar does not cover "Order Now" at the top of the page, and "See the full menu" can be scrolled clear of it.
  - **Tap through:** "Order Now" and "See the full menu" both open `/menu` at the top, instantly, with no slow scroll. Add a Tamaya (Lahori Twist, two dips) and build a combo from `/`; check the drawer.
  - **Desktop (1280px and 1024px):** two-column hero from the chosen breakpoint, image large on the right, headline on two lines; four cards in one row at equal heights; nothing stretched on a 1920px screen (content stays on `max-w-6xl`, the band is full-bleed).
  - **Side by side with the two posters:** ticket label, two-colour headline, sparkle pill and corner details read as the same brand.
  - **Palm shadow decision:** compare it with the posters' at 375px and at desktop width. Keep it only if it is convincing at both; otherwise remove it and record the decision in this spec.
  - **`/menu` regression:** the Cairo Combo card and its dot grid look as before; the Build button works.
  - **Broken image:** temporarily point the hero at a wrong path; check the fallback on first load and after a hard reload, then revert.
  - **DevTools:** the hero image is requested eagerly with high priority and is the LCP element; card images load lazily; no layout shift when the image arrives.
  - **Keyboard only:** skip link, then Tab reaches "Order Now", then each card's Add button, the combo's Build button and "See the full menu", each with a visible ring.
  - **Screen reader or accessibility tree:** one `h1` announced as "Cairo Crunch Has Landed", one `h2`, cards as articles; decorations and the hero image not announced.
  - **Reduced motion emulated:** no entrance or reveal animation; content in place.
  - **Console and dev-server terminal:** no errors, no hydration warnings, no `next/image` warnings.
- Repeat the 375px top-of-page and tap-through checks once against `npm run build` + `npm run start`.

## Open questions

None. The five questions from the first draft were answered on 2026-10-14 and are folded into the sections above: the headline is "CAIRO CRUNCH / HAS LANDED"; the feature shows the four version items only; the Cairo Combo card stays on the home page and `ComboCard` moves to `components/menu/`; the feature heading stays "THE / LINE-UP" and its sentence is "Every dish, two ways."; and the palm-leaf shadow is tried as an inline SVG, to be dropped in favour of the dot grids and wavy lines alone if it is not convincing at 375px and desktop.

**Palm-leaf shadow outcome (2026-10-14):** kept from `sm` up, hidden on phones. At desktop width it reads as the posters' palm shadow. At 375px the top-right corner is taken by the header and the ticket label, so the only way to show it is behind the label and headline, which this spec rules out; it is hidden there, not shown badly. This is narrower than the agreed rule ("convincing at 375px and desktop, or dropped"); the user accepted it as built after verification on 2026-10-14.

**Found during implementation:**

- The two-column hero starts at `xl`. The headline is 605px wide at its cap, which leaves too little room for the image at 1024px.
- The ticket label is 280px wide and fits at 320px with no adjustment.
- `next dev` logs one LCP warning for `tamaya-authentic.webp`. It is a false positive: Next's dev-only check looks images up by `src`, and the lazy Tamaya card further down the page uses the same file as the eager hero image, so the card's entry is the one it finds. The hero `<img>` is `loading="eager"` with `fetchpriority="high"`, and the production build logs nothing. The acceptance criterion on this is met in production only.
