# Spec 06: Menu Page

**Status:** Implemented
**Depends on:** 04, 05

## Summary

Build `/menu`: one long, scrollable page with every category from `menu.json` as a section of item cards, and a category bar that sticks under the header and jumps between sections. Cairo Crunch comes first and is the only section with the full poster treatment, so the owners see their new line leading the menu the way it leads their posters. This is the first route that puts the cards from spec 05 on screen, and the page every later ordering spec (09–14) attaches to.

## Goals

- `/menu` exists, so the header and footer "Menu" links stop landing on the 404.
- All 9 categories and all 54 items render, in file order, through `ItemCard`, with nothing hard-coded from the menu.
- A sticky category bar directly under the site header: one entry per category plus a Deals entry, horizontally scrollable on a phone, marking the section currently in view.
- Cairo Crunch is first in the bar and on the page, and is visibly the featured section: its own pill label, tagline, backdrop and large stacked cards.
- Cairo Crunch's `sides` and `drinks` items sit under their own sub-headings, after the six main items.
- A Deals section exists as the anchor for the bar's Deals entry and as the place spec 14 fills with deal cards.
- The page stays a server component; the category bar is the only client code.
- `npm run lint` and `npm run build` pass.

## Out of scope

- Any tap behaviour on a card: no Add button, no link, no customiser (spec 09). Cards stay display-only, exactly as spec 05 left them.
- Size selection (spec 10), the Authentic / Lahori Twist toggle (spec 11) and dips pickers (spec 12). The card's options line ("Authentic · Lahori Twist", "Large · Extra Large") is the only hint that a choice exists.
- Deal cards, deal contents and the deal picker (spec 14). This spec renders the Deals section's header and a one-line summary only.
- The Cairo Combo card and builder (spec 13). `menu.combos` is not read here; spec 13 adds the combo to the Cairo Crunch section.
- The add-on groups (`cairo-dips`, `dips`) as content. The `dips` **category** renders like any other category; the add-on groups are not shown on the page.
- Cart button, drawer and the sticky mobile cart button (spec 08).
- Search, filters (veg only, price), sorting, and separate routes per category (`/menu/[category]`). One page, anchor links only.
- Changing `ItemCard`, `ProductImage`, `PriceTag` or `ItemTags`, other than a bug found while using them. No new props are expected. The one component change in this spec is an optional `id` prop on `BrandHeading`, so a section can be labelled by its heading.
- Adding shadcn components. The registry's `tabs` is not used: the bar is a list of anchor links to sections that are all on the page, not a tab set that hides panels, and tab semantics would be wrong for it.
- Installing packages, and editing `data/menu.json`, `types/menu.ts` or `lib/format.ts`.
- Future phases from CLAUDE.md section 3: backend, auth, payments, WhatsApp Cloud API, admin dashboard, videos. No "popular", stock or rating labels.
- Tests of any kind.

## User flow

On a phone, arriving from the header's Menu pill or a shared link:

1. The page opens with a short intro (a small pill label and "The Menu") and, right under it, a row of category chips. "Cairo Crunch" is first, marked with a sparkle, and is the active chip.
2. Just below is the Cairo Crunch section: a ticket label reading "Egyptian Street Food · Live", the two-colour heading, the line "Crispy Outside. Bold Inside.", then large cards for Hawawshi, Ful, Tamaya, Chicken Faroge and the two new sandwiches, one per row with the food big and glowing.
3. They keep scrolling: "Sides" (Cairo Fries, Tamaya Bites) and "Drinks" (Limonana, Karkade) follow as compact cards.
4. The chip row has stuck under the header. As each new section reaches the top, its chip becomes the gold one and slides into view in the row.
5. They swipe the chip row sideways and tap "Burgers". The page scrolls to the Burgers heading, which stops just below the chip row, not hidden under it.
6. Pizzas, burgers, sandwiches, wraps, pasta and dips are compact cards: a dark image column on the left, name, description and navy price tag on the right. Pizzas read "From Rs. 499" with their sizes listed.
7. They tap "Deals", the last chip. The page scrolls to the Deals section at the end of the menu, which for now shows its heading and how many deals there are and from what price.
8. Opening `/menu#burgers` directly (a link the home page will use in spec 16) lands on the Burgers section with its chip active.

## UI & design

Reference: `docs/menu-reference/05-cairo-crunch.jpeg` and the other printed menu pages for section order and the cream cards; `docs/brand/poster-*.jpeg` for the ticket label, the stacked heading and the gold rules. Reference only; nothing is imported from `docs/`. Load the `frontend-design` skill when implementing.

### Page structure

- The page renders inside the layout's `<main>` and adds no `<main>` of its own. Content sits on the same max width as the header (`max-w-6xl`, 16px side padding at 375px, 24px from `sm`); the category bar and the Cairo Crunch backdrop are full-bleed with their content on that width.
- Order: intro → category bar → Cairo Crunch section → the other eight category sections in file order → Deals section.
- Vertical rhythm: about 56px between sections at 375px and 88px from `md`. Each section after Cairo Crunch opens with a `GoldRule`, so the diamond rule is the divider and there are no border lines between sections.

### Intro

- Deliberately short, so Cairo Crunch starts within the first screen at 375px: about 24px top padding, then a `PillLabel` (pill variant, sparkles) with `restaurant.area`, then `BrandHeading` as the page's only `h1`, `section` size, lead "The", accent "Menu", centred. No paragraph.

### Category bar (`app/menu/category-bar.tsx`)

- **Position:** `sticky` with `top: var(--header-height)`, stacked below the header (`z-30`, the header is `z-40`), full width. It scrolls with the page until it reaches the header, then stays.
- **Surface:** the same treatment as the header so the two read as one piece when stuck: `bg-background` at about 80% with a backdrop blur, and a bottom edge that is a 1px gold hairline fading out at both ends. No grey border, no shadow.
- **Height:** one CSS variable, `--category-bar-height` (about 3.5rem), defined once beside `--header-height` in `app/globals.css`. Sections use it for their scroll offset.
- **Chips:** a single non-wrapping row of anchor links, `overflow-x-auto` with the scrollbar hidden, `scroll-snap-type: x proximity`, 8px gaps, and 16px / 24px start padding matching the page gutter so the first chip lines up with the content. Each chip is a pill, 44px tall, body font, 0.875rem, medium weight, `whitespace-nowrap`.
  - **Default chip:** cream text, hairline `border-border`, transparent fill.
  - **Featured chip (Cairo Crunch):** gold text and a solid gold border, with a small filled lucide `Sparkle` before the label. This marking is permanent, so Cairo Crunch stands out even when another section is active.
  - **Deals chip:** default style with a small lucide `Tag` icon before the label. Last in the row.
  - **Active chip:** solid gold fill (`bg-primary text-primary-foreground`), whichever chip it is; the icon takes the dark colour. Exactly one chip is active at a time.
  - **Hover / press:** the gold-tint fill (`bg-accent`) eases in within 200ms; press scales to about 0.97. **Focus:** the gold ring from spec 02.
- **Overflow hint:** the row fades to transparent at whichever edge has more chips to scroll to (a CSS mask on the row), so a half-visible chip reads as "more this way" instead of a clipped box. At desktop width, when all ten chips fit, the row is centred and has no fade.
- **Behaviour:**
  - Tapping a chip scrolls the page to that section. The section heading stops just below the bar (see scroll offset under Sections).
  - As the page scrolls, the chip for the section at the top of the visible area becomes active, and the bar scrolls itself sideways so the active chip is in view. This is the client part: an `IntersectionObserver` over the sections.
  - The URL hash is updated by the browser on tap, as for any anchor link. Scrolling by hand does not rewrite the hash.
  - Without JavaScript the chips are still working anchor links; only the active marking is missing. For that reason no chip is active in the server-rendered HTML: the observer marks the first one right after hydration, which also keeps the wrong chip from flashing gold on `/menu#burgers`.
- **Scrolling:** smooth for in-page jumps, through `scroll-behavior: smooth` on `html`. Next 16 no longer disables smooth scrolling during route changes by itself, so `<html>` in `app/layout.tsx` also gets `data-scroll-behavior="smooth"` (see `02-guides/upgrading/version-16.md` in the bundled docs); route changes must still land at the top instantly. The global `prefers-reduced-motion` rule already turns the smooth scroll off.

### Sections

Every section is a `<section>` labelled by its `h2`, with `id` equal to the category id (`cairo-crunch`, `classic-pizza`, … `dips`) or `deals`. Each has `scroll-margin-top` of the bar height plus about 16px; `html` already pads by `--header-height`, so the two add up to the full sticky stack.

**Cairo Crunch (featured)**

- **Backdrop:** a full-bleed band behind the section, not a boxed panel: a wide, soft radial glow of `--gold` at about 10–14% centred behind the heading, fading into the page background well before the section's edges, with a faint gold hairline (fading at both ends) at the top and bottom of the band. The grain and vignette from spec 02 stay visible through it.
- **Header, centred:** `PillLabel` ticket variant with `category.subtitle`; `BrandHeading` as `h2`, `section` size, with the category name split over two lines (lead "Cairo" in cream, accent "Crunch" in gold); `category.tagline` in the body font, uppercase, tracked, `text-muted-foreground`; then a `GoldRule`.
- **Main items (the six without a `group`):** `ItemCard` in the `stacked` layout, heading level `h3`. Grid: 1 column at 375px, 2 from `sm`, 3 from `lg`, 20–24px gaps, so the six make three rows of two or two rows of three. The first two cards load their image eagerly; the rest are lazy. The grid passes its own `sizes` to `ItemCard`, because the card's default assumes four-up at `lg`.
- **Sub-groups:** "Sides" then "Drinks", each opened by a small `h3` in the pill-label type style (body font, uppercase, tracked, `text-primary`) flanked by short gold hairlines, with no outline. Their items share one image per group, so they use the `row` layout with heading level `h4`: 1 column at 375px, 2 from `md`. From `lg` the two sub-groups sit side by side, one column each.

**Other categories (pizzas, burgers, sandwiches, wraps, pasta, dips)**

- **Header, centred:** `GoldRule`, then `BrandHeading` as `h2`, `section` size. Two-word names split over the two colours ("Classic" cream / "Pizza" gold); one-word names ("Burgers", "Dips") are a single cream line. No subtitle or tagline; none of these categories has one.
- **Items:** `ItemCard` in the `row` layout, heading level `h3`: 1 column at 375px, 2 from `md`, 3 from `xl`, 12–16px gaps. Every item in these categories resolves to its category image, so the compact card keeps a nine-pizza list to about four screens on a phone instead of nine.
- A section with an odd number of cards leaves the last cell empty; cards are not stretched across columns.

**Deals**

- **Header:** `GoldRule`, `PillLabel` (pill variant) reading the deal count ("16 Deals"), `BrandHeading` as `h2`, lead "Deals".
- **Body, until spec 14:** one centred line in `text-muted-foreground`, built from the data: the lowest deal price through `formatPrice` ("Bundles from Rs. 749"). No cards, no "coming soon" wording, no disabled controls. Spec 14 replaces this line with the deal cards.

### Responsive

- **375px first:** intro, bar and the Cairo Crunch label and heading fit in the first screen; the first stacked card starts within it. The bar shows about three chips and part of a fourth. No horizontal page scroll: only the chip row scrolls sideways.
- **`sm`–`md`:** Cairo main items two-up; other categories go two-up from `md`.
- **`lg` and up:** Cairo main items three-up, sides and drinks side by side; from `xl` other categories three-up. All ten chips fit and the row is centred.
- Row cards at their narrowest three-up width (about 360px) are wider than at 375px one-up (343px), which spec 05 already covers.

### States

- **Category with no items:** its section and its chip are both skipped. No current category is empty; the rule keeps a future edit from leaving an empty heading.
- **No featured category:** every category renders in the standard style, the first chip is active, and the page still works.
- **Sub-group with no items:** its sub-heading is not rendered.
- **Missing image:** `ProductImage`'s fallback from spec 05. Nothing extra here.
- **Deals with an empty `deals` array:** the Deals section and chip are skipped.
- **Unknown or stale hash** (`/menu#nothing`): the page opens at the top with the first chip active.
- **Loading / error:** none. The page is static and prerendered.

### Motion

- Chip hover, press and active colour changes: 150–200ms.
- Section headers (label, heading, rule) ease in as they enter the viewport: about 12px upward travel and a fade, CSS only, using a scroll-driven animation (`animation-timeline: view()`) inside an `@supports` check. The animation is tied to scroll position, so it has no duration: it completes over the stretch in which the header enters the viewport. Browsers without it show the headers in place with no animation. Cards do not animate: spec 05 ruled out per-card fades, and fifty-four animated cards would be noise.
- All of it is covered by the global `prefers-reduced-motion` rule; the `@supports` block must also sit inside `prefers-reduced-motion: no-preference`, because a scroll-driven animation is not shortened by `animation-duration`.

### Accessibility

- One `h1` ("The Menu"). Sections are `h2`, Cairo sub-groups `h3`, cards `h3` or `h4` as above, so the outline has no skipped level.
- The bar is `<nav aria-label="Menu categories">` containing a list of links; the active link carries `aria-current="true"`. It comes before the sections in the DOM, so the skip link plus one Tab reaches it.
- Chips are at least 44px tall; decorative icons are `aria-hidden`.
- Keyboard: Tab moves through the chips, and focusing a chip outside the visible part of the row scrolls it into view. Enter jumps to the section; the next Tab continues from there.
- Text pairings stay within spec 02: cream, gold and `muted-foreground` on dark; dark on the gold active chip (`primary-foreground` on `primary`). Gold is never used on the cream cards.

## Data

- **`menu.json`,** read only through `lib/menu.ts`, in the server components:
  - `menu.categories` in file order: `id`, `name`, `subtitle`, `tagline`, `featured`, `items`. `getFeaturedCategory()` is the featured test.
  - `groupItems(category)` → `ungrouped`, `sides`, `drinks` for the Cairo Crunch section. With the current file: 6 / 2 / 2. For every other category `sides` and `drinks` are empty.
  - Each card receives its `Item` and `Category`; `ItemCard` does its own lookups (spec 05).
  - `menu.deals`: only its length and the smallest `price` (749, `deal-05`), for the Deals header and summary line.
  - `menu.restaurant.area` for the intro label.
  - Not used: `combos`, `addOnGroups`, `sizes` (directly), `softDrinks`, deal `contents`.
- **Bar entries:** the page builds a plain list of `{ id, label, kind }` (kind: featured / category / deals) from the data and passes it to the client bar as props. The bar does not import `lib/menu.ts`, so the menu JSON does not enter the client bundle for it.
- **Authored copy,** the only words not from the data: "The Menu", "Sides", "Drinks", "Deals", "Bundles from", and the bar's accessible label. The sub-group labels come from one small map keyed by `ItemGroup`, so a new group value fails the type check instead of rendering nothing.
- **Heading split:** one plain function beside the section component turns a category `name` into lead and accent (everything before the last space / the last word; a one-word name is lead only). No category name is typed into a component.
- **Formatting:** the deal price through `formatPrice`.
- **Cart state:** none. **Env vars:** none.
- **New types or zod schemas:** none in `types/`; the bar-entry prop type stays in its file.
- **Metadata:** `app/menu/page.tsx` exports `metadata` with `title: "Menu"` (the tab reads "Menu | Drippin Bites Cafe") and a short `description` composed from the featured category name and `restaurant.name`.

## Implementation outline

Files to create (route-only components, next to the page per CLAUDE.md section 11):

- `app/menu/page.tsx`: server component; reads the menu, builds the bar entries, arranges intro, bar and sections; exports `metadata`.
- `app/menu/category-bar.tsx`: client component; the sticky chip row, active-section tracking and keeping the active chip in view.
- `app/menu/category-section.tsx`: server component; one category's header and card grids, with the featured treatment and the `sides` / `drinks` sub-groups.
- `app/menu/deals-section.tsx`: server component; the Deals header and summary line that spec 14 extends.

Files to modify:

- `components/brand/brand-heading.tsx`: an optional `id` prop passed to the heading element. Nothing else.
- `app/globals.css`: `--category-bar-height`, `scroll-behavior: smooth` on `html`, and the scroll-reveal animation for section headers.
- `app/layout.tsx`: `data-scroll-behavior="smooth"` on `<html>`. Nothing else.
- `CLAUDE.md`: after verification, set spec 06 to `Implemented`, update the "Current state" bullet in section 1 (the `/menu` 404 note, "no route renders them yet"), and note `--category-bar-height` beside `--header-height` in section 7.

Files that stay as they are: `data/menu.json`, `types/menu.ts`, `lib/menu.ts`, `lib/format.ts`, everything under `components/` except `brand/brand-heading.tsx`, `app/page.tsx`, `app/not-found.tsx`, `next.config.ts`, `package.json`, `package-lock.json`, everything under `public/` and `docs/`.

Order of work:

- Read the bundled docs first (AGENTS.md rule): `01-app/01-getting-started/08-caching.md` for a static page under Cache Components, the scroll-behaviour section of `02-guides/upgrading/version-16.md`, and `link.md` for hash links. Load the `frontend-design` skill.
- `page.tsx` with the intro and plain, unstyled sections, to confirm all 54 items render and the anchors work.
- `category-section.tsx`: the standard section, then the featured treatment and sub-groups; then `deals-section.tsx`.
- `category-bar.tsx`: static sticky row first, then active tracking, then the overflow fade.
- Scroll offsets, smooth scrolling and the header reveal in `globals.css` and `layout.tsx`.
- `npm run lint`, `npm run build`, browser checks at 375px and desktop, then the CLAUDE.md update.

## Edge cases

- **`dips` is a category id and an add-on group id.** Only the category is used here, and its id is the section anchor.
- **Anchor ids vs existing ids:** `<main>` is `#content`. No category is called `content` or `deals`; the Deals section's id must not collide if a category with that id is ever added.
- **Two sticky bars and one offset:** `html` has `scroll-padding-top: var(--header-height)`. The bar's height is added per section with `scroll-margin-top`, not by changing the global padding, so anchors on other pages keep the header-only offset.
- **`--header-height` changes at `sm`** (4rem → 4.5rem). The bar's `top` and the observer's offset must follow the variable, not a fixed pixel number; the observer has to be set up again when the breakpoint is crossed.
- **Short last section:** until spec 14 the Deals section is a few lines tall and can never reach the top of the viewport. When the page is scrolled to the bottom, the last chip must still become active. A second observer on the last section alone handles this: while that section is fully visible, its chip is the active one.
- **Tall and short sections together:** Sandwiches, Wraps and Pasta are one or two rows of cards at desktop width, so two section headings can be in view at once. Exactly one chip is active, the one for the section nearest the top line.
- **Tap, then scroll-spy:** during the smooth scroll after a tap, the active chip should not visibly step through every section on the way.
- **Bar's own scrolling:** bringing the active chip into view must scroll only the chip row. `scrollIntoView` on a chip can also move the page; it must not.
- **State in effects:** the installed `react-hooks` lint rules flag setting state synchronously in an effect (spec 05 hit this). Setting it from the observer's callback is fine.
- **Arriving with a hash:** `/menu#burgers` must land with the heading clear of both bars, on a hard load and on client navigation from another page. The images above it are in fixed-ratio boxes, so nothing shifts after the jump.
- **Back / forward:** after tapping several chips, Back steps through the hashes; the active chip follows.
- **Backdrop blur on the bar:** a second blurred sticky layer under the header can cost scroll performance on a phone. If it janks, raise the fill opacity and drop the bar's blur before removing the header's.
- **Cairo backdrop and the fixed atmosphere layers:** the vignette and grain sit at `z-index: -1` on `body`. The section's glow must sit above them and below the cards without creating a stacking context that hides the cards' shadows.
- **Veg mark on default cards:** `ful` and `tamaya` show no veg mark here (spec 05's rule); `tamaya-bites` does. This page must not pass a variant to change that.
- **Long names in the row layout:** "Crunchy Cheesy Croissant Sandwich" is in the stacked grid; the longest row-layout names ("Grilled Chicken Cheese", "Macaroni Cheesy Pasta", "Thousand Island Sauce") must fit beside a 112px stage at 343px.
- **Dips have no description:** their row cards are shorter than cards in other sections but equal within their own grid.
- **Client boundary:** `category-bar.tsx` is the only new client file (`ProductImage` already is one). The sections must stay server components even though the bar tracks them; it finds them by id, not by being their parent.
- **`cacheComponents`:** the page reads only the static menu import, so it prerenders with no `"use cache"` and no `Suspense`. Nothing may read the current time or request data.
- **`AGENTS.md`:** `next dev` rewrites it; commit it with the work if it changes.

## Acceptance criteria

- [x] `/menu` renders inside the site shell with no `<main>` of its own; the header's Menu pill shows its active state there and the tab title is "Menu | Drippin Bites Cafe".
- [x] The page has exactly one `h1` and ten `<section>` elements with the ids `cairo-crunch`, `classic-pizza`, `special-pizza`, `premium-pizza`, `burgers`, `sandwiches`, `wraps`, `pasta`, `dips`, `deals`, in that order, each labelled by its `h2`.
- [x] 54 item cards render, each from `ItemCard`, with per-section counts 10, 9, 3, 5, 10, 3, 3, 3, 8.
- [x] Cairo Crunch shows `category.subtitle` in a ticket `PillLabel`, a two-colour heading and `category.tagline`, on a gold-glow backdrop no other section has.
- [x] Cairo Crunch's six ungrouped items use the stacked layout; Cairo Fries and Tamaya Bites sit under a "Sides" sub-heading and Limonana and Karkade under "Drinks", in the row layout, after the six.
- [x] Every item in the other eight categories uses the row layout.
- [x] Heading levels: section `h2`; "Sides" / "Drinks" `h3`; cards `h3`, except the four sub-group cards, which are `h4`.
- [x] Section headings come from `category.name`: two-word names are split cream / gold, one-word names are a single cream line; no category name, item name, description or price is written as a literal in the new files.
- [x] The category bar lists ten entries in page order: Cairo Crunch first with its sparkle and gold marking, Deals last with its icon.
- [x] The bar sticks directly under the site header while scrolling, with no gap and no overlap, at 375px and at desktop width.
- [x] Tapping any chip scrolls to its section with the heading fully visible below the bar; the same holds when loading `/menu#burgers` and `/menu#deals` directly.
- [x] While scrolling the page, exactly one chip is active (gold fill, `aria-current`), it matches the section at the top of the view, and the bar scrolls sideways to keep it visible without moving the page.
- [x] Scrolled to the very bottom, the Deals chip is the active one.
- [x] At 375px only the chip row scrolls horizontally; the page has no horizontal scroll, and the row fades at the edge that has more chips.
- [x] Every chip is at least 44px tall and shows the gold focus ring on keyboard focus; the bar is a `<nav>` with an accessible label.
- [x] The Deals section shows its heading, the deal count and the lowest deal price formatted by `formatPrice` ("Rs. 749" with the current file), and no deal cards, buttons or placeholder wording.
- [x] No card on the page is a link or a button, and no Add control is rendered.
- [x] `ful` and `tamaya` show no veg mark; `tamaya-bites` does; the five `new` items show the "NEW" badge.
- [x] Grids: Cairo main items 1 / 2 / 3 columns at 375px / `sm` / `lg`; other categories 1 / 2 / 3 at 375px / `md` / `xl`; cards in a row are equal height with price tags on one line.
- [x] `app/menu/category-bar.tsx` is the only new file with `"use client"`, and it does not import `lib/menu.ts`.
- [x] With `prefers-reduced-motion: reduce`, chip jumps are instant and section headers do not animate.
- [x] No hex values or `zinc` / `gray` / `neutral` classes in the new files; nothing imports `data/menu.json` directly or references `docs/`.
- [x] `data/menu.json`, `types/menu.ts`, `lib/menu.ts`, `lib/format.ts`, `next.config.ts`, `package.json` and `package-lock.json` are unchanged; under `components/` the only change is the optional `id` prop on `BrandHeading`.
- [x] `npm run lint` exits with no errors or warnings.
- [x] `npm run build` completes successfully, with `/menu` prerendered as static and no Cache Components errors.

## Verification

No automated tests (per CLAUDE.md).

- `npm run lint` passes.
- `npm run build` passes, and its route list shows `/menu` as static.
- `git status` shows only: four files added under `app/menu/`; `app/globals.css`, `app/layout.tsx` and `components/brand/brand-heading.tsx` modified; this spec; `CLAUDE.md` once the status is updated (and `AGENTS.md` only if `next dev` rewrote it).
- Manual checks in the browser with `npm run dev`:
  - **375px, top of page:** intro, chip row and the Cairo Crunch label and heading are in the first screen; Cairo Crunch chip is active; no horizontal page scroll.
  - **375px, scrolling:** the chip row sticks under the header; the active chip changes at each section and stays in view; stacked Cairo cards are large with a visible glow; row cards fit name, description and price without the price wrapping.
  - **375px, tapping:** tap each of the ten chips in turn, including backwards; every heading lands fully below the bar. Swipe the chip row and confirm the page does not move.
  - **Bottom of page:** the Deals chip is active; the Deals section shows "16 Deals" and "Bundles from Rs. 749".
  - **Desktop:** all ten chips fit and are centred; Cairo main items three-up in two rows; Sides and Drinks side by side; pizzas three-up from `xl`; card rows equal height.
  - **Resize across `sm`:** the bar stays flush under the header as the header height changes, and chip jumps still land correctly.
  - **Direct links:** hard-load `/menu#burgers`, `/menu#deals` and `/menu#nothing`; then navigate from `/` to `/menu` and confirm it opens at the top without a slow scroll.
  - **Back / forward** after several chip taps: the page and the active chip follow.
  - **Compare with the data:** section order, item order within each section, and a spot check of five prices against `data/menu.json`.
  - **Keyboard only:** skip link, then Tab through all ten chips with a visible ring; Enter on "Pasta" jumps there.
  - **Screen reader or accessibility tree:** one `h1`, ten `h2`s, the "Menu categories" navigation, the current chip announced, cards as articles named by their headings.
  - **Reduced motion emulated:** instant jumps, no header reveal, chips still change state.
  - **JavaScript disabled:** all sections and cards render and the chips still jump to their sections.
  - **Console and dev-server terminal:** no errors, no hydration warnings, no `next/image` `sizes` warning.
- Repeat the 375px sticky and tap checks once against `npm run build` + `npm run start`.

## Open questions

None. The five questions from the first draft were answered on 2026-10-13, each confirming the draft, so no other section changed: the Deals section stays minimal (heading, count, lowest price) and deal cards stay in spec 14; Deals is the last section and the last chip; the Cairo Combo is left entirely to spec 13 and nothing is reserved for it here; only Cairo Crunch's six main items use the stacked cards and every other category uses the row layout; and the page heading is "The Menu" with the area pill above it. Five corrections found while planning were folded in the same day: `BrandHeading` gains an optional `id` so sections can be labelled by their headings; the header reveal is scroll-linked and has no duration; no chip is active before hydration; a second observer makes the Deals chip active at the bottom of the page; and the Cairo grid passes its own `sizes`.
