# Spec 04: Site Layout

**Status:** Implemented
**Depends on:** 02, 03

## Summary

Give every page the shared shell: a sticky header with the Drippin Bites logo and a link to the menu, a footer with the brand and TBD-safe contact details, and real `metadata` so the browser tab and link previews no longer say "Create Next App". It matters for the pitch because the owners will open the demo from a shared link, and the first things they see (the tab title, the logo at the top, their own area in the footer) should already read as their site.

## Goals

- Replace the stock `metadata` in `app/layout.tsx` with the cafe's title and description, built from `menu.restaurant`, with a title template later pages can fill.
- Add a `viewport` export so the browser chrome on a phone matches the near-black page.
- Render a header on every page: horizontal logo linking to `/`, one "Menu" link to `/menu`, and a reserved place for the cart button that spec 08 adds.
- Render a footer on every page: logo, `restaurant.tagline`, `restaurant.area`, contact details through `getContactDetails()`, and site links.
- Make the layout own the `<main>` landmark and a "Skip to content" link, so every later page gets both for free.
- Expose the header height as one CSS variable, so the sticky category bar in spec 06 can sit directly under the header.
- Add a branded `app/not-found.tsx`, because the header links to `/menu` before spec 06 builds it.
- Confirm `app/icon.svg` is the only favicon and still shows in the tab.
- `npm run lint` and `npm run build` pass.

## Out of scope

- The cart button, cart count badge, `Sheet` drawer and the sticky mobile cart button (spec 08). The header only leaves room for the button.
- `/menu` and `/checkout` themselves (specs 06, 17). No link to `/checkout` is added here; the cart drawer links to it in spec 08.
- The real home page (specs 15, 16). `app/page.tsx` keeps its holding content; only its wrapper element changes.
- The home page's location/contact section (spec 16). The footer shows the same TBD-safe values in a compact form; it is not that section.
- Labels for `restaurant.orderTypes` (spec 17). The footer does not list delivery / takeaway / dine-in.
- A mobile hamburger menu or nav `Sheet`. There is one nav link; it fits beside the logo at 375px.
- Corner decorations (dot grids, wavy lines, palm leaf). They are built in spec 15.
- Social links. `menu.json` has no Instagram handle and none is invented.
- Reading `NEXT_PUBLIC_WHATSAPP_NUMBER` (spec 18). The footer shows `restaurant.whatsapp` only as a contact value, and only when it is not TBD.
- An Open Graph image, an Apple touch icon and `metadataBase` (spec 19, once the demo URL is known).
- `robots`, `sitemap` and `manifest` files.
- Installing packages or adding shadcn components. Everything needed (`Button`, the brand primitives, `lucide-react`) exists.
- Future phases from CLAUDE.md section 3: backend, auth, payments, WhatsApp Cloud API, admin dashboard, videos. No "Login" or "Track order" links.
- Tests of any kind.

## User flow

1. A visitor taps the demo link from Instagram or WhatsApp. The link preview and the browser tab read "Drippin Bites Cafe", with the cafe's mark as the tab icon. The phone's browser bar is near-black, not white.
2. At the top of `/` is a slim dark bar: the horizontal logo on the left, a gold-outlined "Menu" pill on the right.
3. They scroll. The bar stays at the top, the page content blurring softly behind it.
4. At the bottom of the page a gold diamond rule opens the footer: logo, the tagline, "Johar Town, Lahore", and links to Home and Menu. Address, phone and hours are not shown until the owners supply them.
5. They tap the logo from any page and return to `/`.
6. They tap "Menu". Until spec 06 exists this lands on the branded not-found page ("Nothing on this plate"), which has the same header and footer and a gold button back to Home. After spec 06 it opens the menu, and the pill shows its active state there.
7. A keyboard user presses Tab once on any page: a "Skip to content" link appears at the top left; Enter moves focus past the header into the page content.

## UI & design

Reference: the posters in `docs/brand/` for the logo placement, the gold hairlines and the small tracked labels. Reference only; nothing is imported from `docs/`. Load the `frontend-design` skill when implementing.

### Page shell (`app/layout.tsx`)

- `<body>` stays a full-height flex column: skip link → header → `<main id="content">` (grows to fill, flex column) → footer. On a short page the footer sits at the bottom of the viewport, not mid-screen.
- The layout owns the single `<main>`. Pages render their content inside it and no longer render their own `<main>`; `app/page.tsx` changes its wrapper from `<main>` to a `<div>` with the same classes.
- **Skip link:** the first focusable element. Visually hidden until focused, then a gold pill (`bg-primary text-primary-foreground`) at the top left above the header, at least 44px tall. It targets `#content`; `<main>` takes `tabIndex={-1}` so focus actually moves there, with no visible outline on the `<main>` itself.

### Header (`components/layout/site-header.tsx`)

- **Position:** `sticky top-0`, above page content and below future overlays (the `Sheet` in spec 08 must cover it).
- **Height:** one CSS variable, `--header-height`, defined in `app/globals.css`: 4rem on mobile, 4.5rem from `sm` up. The header uses it, and `html` gets `scroll-padding-top: var(--header-height)` so in-page anchor targets are not hidden under the bar. Spec 06 reads the same variable for its category bar.
- **Surface:** not a flat box. `bg-background` at about 80% opacity with a backdrop blur, so the food imagery of later pages shows through softly. The bottom edge is a 1px gold hairline that fades to transparent at both ends, the same gradient treatment as `GoldRule` without the diamond; no grey border and no drop shadow.
- **Inner row:** max width matching the page content (about `max-w-6xl`), 16px side padding at 375px and 24px from `sm`, logo left, actions right, vertically centred.
- **Logo:** `public/logo.svg` (viewBox 787 × 180, about 4.4 : 1) through `next/image` with its intrinsic width and height, rendered about 34px tall on mobile (about 150px wide) and about 40px tall from `sm`. It is the content of a `<Link href="/">` whose tap area is the full header height. `alt` is `restaurant.name`. Hover and press: opacity eases to about 85% within 200ms. It is above the fold on every page, so it is loaded eagerly; check `image.md` in the bundled docs for the current prop (`preload` replaces the deprecated `priority`).
- **Menu link:** a `Link` to `/menu` styled with `buttonVariants({ variant: "outline", size: "sm" })`: a gold hairline pill, cream text, 44px tall. It carries a small lucide `UtensilsCrossed` icon before the label from `sm` up, text only at 375px.
  - **Active state:** on `/menu` it gets `aria-current="page"`, a solid gold border and the gold-tint fill (`bg-accent`). This needs `usePathname`, so the link is the one client component in this spec (`components/layout/nav-link.tsx`); the header stays a server component.
- **Cart slot:** the actions group is a flex row with a fixed gap, so spec 08 appends a 44px icon button after the Menu link without re-laying out the header. Nothing is rendered in the slot now: no disabled cart icon, no empty badge.
- **375px check:** 16px + logo (~150px) + gap + Menu pill (~84px) + 8px gap + future cart button (44px) + 16px is about 330px, inside 375px. The logo must not shrink below 30px tall or wrap.

### Footer (`components/layout/site-footer.tsx`)

- **Divider:** a `GoldRule` at the top of the footer, inside generous top padding (about 48px mobile, 64px desktop), so the footer opens the way a poster section does instead of with a border line.
- **Surface:** the page background darkening toward the bottom with a subtle gradient to near-black, so the footer reads as the base of the page without being a separate grey panel. The grain and vignette from spec 02 stay visible.
- **Mobile (375px):** one centred column, 32px between blocks:
  1. Logo (`public/logo.svg`, about 40px tall), linking to `/`.
  2. `restaurant.tagline` in the body font, upright, `text-muted-foreground`. Figtree is loaded in the normal style only, so an italic would be synthesised by the browser.
  3. **Visit** block: a small gold label in the pill-label type style (body font, uppercase, tracked, `text-primary`, no outline), then `restaurant.area` in cream with a lucide `MapPin` icon, then the contact rows described under States.
  4. **Explore** block: the same small gold label, then links "Home" (`/`) and "Menu" (`/menu`), each at least 44px tall, cream text, gold underline growing from the left on hover within 200ms, gold focus ring.
  5. Bottom line, above a faint `border-border` hairline: "© " + `restaurant.name`, in `text-muted-foreground` at 0.875rem. No year (see Edge cases).
- **Desktop (`md` up):** three columns on the same max width as the header, text aligned start: brand (logo, tagline) taking the widest column, then Visit, then Explore. The bottom line spans the full width below.
- Bottom padding is generous (about 40px) so spec 08's sticky mobile cart button has room; spec 08 adds any extra offset it needs.

### Not-found page (`app/not-found.tsx`)

- A server component rendered inside the shell, so header and footer are present. Content is vertically centred in `<main>`, 24px side padding, the same stack rhythm as the holding page:
  - `PillLabel` (pill variant) reading "404".
  - `BrandHeading` as `h1`, hero size: lead "Nothing on", accent "this plate".
  - One line of body copy in `text-muted-foreground`: "That page isn't on the menu."
  - `GoldRule`.
  - A primary gold pill `Button`-styled `Link` to `/`, size `lg`: "Back to Home".
- Its `metadata` title is "Page not found", so the tab reads "Page not found | Drippin Bites Cafe".

### States

- **Contact details, all TBD (the current data):** the Visit block shows only its label and `restaurant.area`. No placeholder line, no empty rows, no dashes, no invented values, and the literal text "TBD" never appears. The block must still look complete with a single row: the label and the area line keep the same spacing as the Explore block beside it.
- **Contact details, some present:** each real value gets its own row below the area, with a lucide icon (`MapPin` address, `Phone` phone, `MessageCircle` WhatsApp, `Clock` hours); missing ones are omitted. When `address` is present the area line drops its own `MapPin` icon, so the block does not show two pins. `phone` is a `tel:` link with a 44px tap area; `address`, `hours` and `whatsapp` are plain text.
- **Logo fails to load:** the `alt` text (`restaurant.name`) shows in cream on the dark bar, so the header is still a usable home link.
- **Active / hover / focus / press:** defined above for the logo, the Menu pill and the footer links. Every interactive element shows the gold focus ring from spec 02 on keyboard focus.
- **Loading / error:** none. Everything is static and prerendered.

### Motion

- Only hover, focus and press transitions, 150–300ms, CSS only. No scroll-triggered header change and no entrance animation. The global `prefers-reduced-motion` rule from spec 02 already covers these.

### Accessibility

- Landmarks: `<header>`, one `<main id="content">`, `<footer>`. The header nav is `<nav aria-label="Main">`, the footer links `<nav aria-label="Footer">`.
- One `<h1>` per page stays the page's job; the header and footer contain no headings above the small block labels, which are not heading elements.
- The logo link's accessible name is the image `alt`. Decorative icons are `aria-hidden`.
- The "Menu" pill and every footer link are at least 44px tall.
- Text pairings are the ones spec 02 allows: cream, gold and `muted-foreground` on the dark background only. There are no cream cards in the shell.

## Data

- **`menu.json`**, read only through `lib/menu.ts`:
  - `menu.restaurant.name` ("Drippin Bites Cafe"): default title, title template, logo `alt`, footer copyright line.
  - `menu.restaurant.tagline` ("Stay Drippin', Stay Vibin'"): footer, and the default title suffix.
  - `menu.restaurant.area` ("Johar Town, Lahore"): footer Visit block and the description.
  - `getFeaturedCategory()?.name` ("Cairo Crunch"): the description, so Cairo Crunch leads without the name being hard-coded.
  - `getContactDetails()` → `address`, `whatsapp`, `phone`, `hours`, each a string or `undefined`. All four are `undefined` with the current file.
  - Not used: `shortName`, `currency`, `orderTypes`.
- **Metadata** (`app/layout.tsx`):
  - `title.default`: `restaurant.name` + " | " + `restaurant.tagline`.
  - `title.template`: `"%s | " + restaurant.name`, so later pages export just "Menu" or "Checkout".
  - `description`: one sentence composed from the featured category name, `restaurant.name` and `restaurant.area`, along the lines of "Order Cairo Crunch Egyptian street food, pizzas, burgers and more from Drippin Bites Cafe, Johar Town, Lahore." The joining words are copy; the name, area and category name come from the data.
  - `openGraph`: `title`, `description`, `siteName` (`restaurant.name`), `type: "website"`, `locale: "en_PK"`. No image and no `metadataBase`; both arrive in spec 19.
  - `icons`: nothing is set; the `app/icon.svg` file convention already provides the favicon.
- **Viewport** (`app/layout.tsx`): a `viewport` export with `themeColor` equal to the `--background` value (`#14100C`) and `colorScheme: "dark"`. The hex is repeated here because the export cannot read a CSS variable; a comment points at `globals.css`.
- **Cart state:** none.
- **Env vars:** none.
- **New types or zod schemas:** none. Component prop types stay in their files.

## Implementation outline

Files to create:

- `components/layout/site-header.tsx`: sticky header with logo link, Menu link and the actions group spec 08 extends.
- `components/layout/nav-link.tsx`: client `Link` wrapper that sets `aria-current` and the active style from `usePathname`.
- `components/layout/site-footer.tsx`: footer with brand, TBD-safe Visit block, Explore links and copyright line.
- `app/not-found.tsx`: branded 404 inside the shell.

Files to modify:

- `app/layout.tsx`: `metadata` and `viewport` exports; skip link, header, `<main id="content">` and footer around `children`.
- `app/page.tsx`: wrapper `<main>` becomes a `<div>`; nothing else changes.
- `app/globals.css`: `--header-height` (with its `sm` value) and `scroll-padding-top` on `html`.
- `CLAUDE.md`: after verification, set spec 04 to `Implemented`, update the "Current state" bullet in section 1 and the "current values are the create-next-app defaults" note in section 7, and record that the layout owns `<main>`.

Files that stay as they are: `data/menu.json`, `lib/menu.ts`, `lib/format.ts`, `types/menu.ts`, `components/ui/button.tsx`, everything under `components/brand/`, `app/icon.svg`, `public/`, `next.config.ts`, `package.json`, `package-lock.json`.

Order of work:

- Read the bundled docs first (AGENTS.md rule): `03-api-reference/04-functions/generate-metadata.md`, `generate-viewport.md`, `use-pathname.md` (its Cache Components section), `03-api-reference/02-components/image.md` and `link.md`, `03-api-reference/03-file-conventions/not-found.md` and `layout.md`. Load the `frontend-design` skill.
- `metadata` and `viewport` in `app/layout.tsx`.
- `--header-height` in `globals.css`, then the header and the nav link.
- The footer, including the all-TBD and some-present contact states.
- Shell wiring in `app/layout.tsx` (skip link, `<main>`), the `app/page.tsx` wrapper change, then `app/not-found.tsx`.
- `npm run lint`, `npm run build`, browser checks at 375px and desktop, then the CLAUDE.md update.

## Edge cases

- **`/menu` does not exist yet:** the header and footer link to it from this spec on. Until spec 06 it resolves to `app/not-found.tsx`. `<Link>` prefetching of a missing route must not log errors; check the console.
- **No copyright year:** `cacheComponents` is on, and reading the current time (`new Date()`) in a prerendered server component is flagged by Next as a prerender error. The footer line has no year instead of adding a client component or a cache directive for four digits.
- **`usePathname` and Cache Components:** every route in the roadmap is static, so the nav link resolves during prerendering and needs no `Suspense` boundary. If a route with unknown dynamic params is ever added, the nav link must be wrapped in one or the build fails (`use-pathname.md`).
- **Nested paths:** the Menu pill is active for `/menu` and anything under it, but not for a path that merely starts with the same letters (for example `/menus`).
- **SVG through `next/image`:** a `src` ending in `.svg` is served unoptimised automatically, so no `dangerouslyAllowSVG` setting is needed and `next.config.ts` is not touched. Width and height must be given so the header does not shift when the logo loads.
- **Logo colours:** all three logos are for dark backgrounds only. The header's translucent surface must stay dark enough over any later hero image that the cream "DRIPPIN" text keeps its contrast.
- **Sticky header and the fixed atmosphere layers:** the vignette and grain sit at `z-index: -1` on `body`. The header's backdrop blur must not create a visible seam against them or cause scroll jank on a phone; if it does, raise the background opacity and reduce the blur before removing the effect.
- **Backdrop blur unsupported:** the 80% dark fill alone must still keep the logo and Menu pill readable.
- **Short pages:** the holding page and the not-found page are shorter than the viewport. `<main>` grows so the footer stays at the bottom, and the page's own centred content stays centred in the remaining space.
- **Skip link target:** without `tabIndex={-1}` on `<main>`, some browsers scroll but leave focus on the link.
- **Contact value shapes:** when the owners supply values, `phone` may arrive as `03xx…` or `+92…`. The `tel:` link uses the value with spaces removed; no reformatting or validation is done here.
- **Long address:** a real address may run to two or three lines; it wraps inside its column and does not push the Explore column off the grid.
- **Apostrophes in the tagline:** "Stay Drippin', Stay Vibin'" is rendered from data, so it needs no JSX escaping; any authored copy with an apostrophe ("isn't") must satisfy `react/no-unescaped-entities`.
- **Later pages render no `<main>`:** specs 06, 15 and 17 must not add their own, or the document gets nested `<main>` elements.
- **`AGENTS.md`:** `next dev` rewrites it; commit it with the work if it changes.

## Acceptance criteria

- [x] `app/layout.tsx` exports `metadata` with a default title containing "Drippin Bites Cafe", a `title.template` ending in the restaurant name, and a description; the strings "Create Next App" and "Generated by create next app" are gone from the repo (search excluding `node_modules`, `.next`, `.claude/` and `CLAUDE.md`).
- [x] The restaurant name, tagline, area and the featured category name in the metadata and footer come from `lib/menu.ts`, not from literals in the components or layout.
- [x] `app/layout.tsx` exports `viewport` with `themeColor` `#14100C` and `colorScheme: "dark"`; the rendered `<head>` has the matching `theme-color` meta tag.
- [x] The rendered `<head>` has `og:title`, `og:description` and `og:site_name`, and no `og:image`.
- [x] `app/icon.svg` is unchanged, is the only icon file under `app/`, and shows as the tab icon.
- [x] Every route renders, in order: skip link, `<header>`, exactly one `<main id="content">`, `<footer>`. `app/page.tsx` no longer contains a `<main>` element and is otherwise unchanged.
- [x] The header is sticky at the top while scrolling, uses `--header-height` (defined once in `app/globals.css`), and `html` has `scroll-padding-top` set from the same variable.
- [x] The header shows `public/logo.svg` through `next/image` with explicit dimensions and `alt` from `restaurant.name`, inside a link to `/`.
- [x] The header has one nav link, "Menu", to `/menu`, at least 44px tall, styled from `buttonVariants` with brand tokens only.
- [x] On `/menu` (or a path under it) the Menu link has `aria-current="page"` and a visibly different active style; on `/` it has neither.
- [x] `components/layout/nav-link.tsx` is the only file added by this spec with `"use client"`; `site-header.tsx`, `site-footer.tsx` and `app/not-found.tsx` are server components.
- [x] The header renders no cart button, cart icon, badge or disabled placeholder.
- [x] The footer opens with a `GoldRule` and shows the logo, `restaurant.tagline`, `restaurant.area`, links to `/` and `/menu`, and a copyright line with `restaurant.name` and no year.
- [x] With the current `menu.json`, the footer's Visit block shows only its label and `restaurant.area`: no address, phone, WhatsApp or hours rows and no placeholder or "to be confirmed" wording; the text "TBD" appears nowhere in the rendered HTML.
- [x] With a contact value temporarily replaced by a real-looking test value in a local, uncommitted edit, its row appears with its icon below the area and the other rows stay hidden; a phone value renders as a `tel:` link. `data/menu.json` shows no diff afterwards.
- [x] The footer is a centred single column at 375px and three start-aligned columns from `md` up.
- [x] `app/not-found.tsx` renders inside the header and footer with a pill label, a two-colour `BrandHeading` as the only `<h1>`, a `GoldRule` and a gold link back to `/`; its tab title is "Page not found | Drippin Bites Cafe".
- [x] The first Tab press on any page focuses a visible "Skip to content" link; activating it moves focus to `<main>`.
- [x] Every link in the header and footer shows the gold focus ring on keyboard focus and is at least 44px tall.
- [x] At 375px there is no horizontal scroll on `/` or the not-found page, the logo does not wrap or shrink below 30px tall, and there is room for a 44px button to the right of the Menu pill.
- [x] No hex values or `zinc` / `gray` / `neutral` classes in the new components (the `themeColor` in `app/layout.tsx` is the one allowed hex), and nothing imports or references a file under `docs/`.
- [x] `data/menu.json`, `next.config.ts`, `package.json` and `package-lock.json` are unchanged.
- [x] `npm run lint` exits with no errors or warnings.
- [x] `npm run build` completes successfully, with `/` and the not-found page prerendered and no Cache Components errors.

## Verification

No automated tests (per CLAUDE.md).

- `npm run lint` passes.
- `npm run build` passes.
- `git status` shows only: `app/layout.tsx`, `app/page.tsx`, `app/globals.css` modified; `app/not-found.tsx` and three files under `components/layout/` added; this spec; `CLAUDE.md` once the status is updated (and `AGENTS.md` only if `next dev` rewrote it).
- Manual checks in the browser with `npm run dev`:
  - Tab title on `/` reads "Drippin Bites Cafe | Stay Drippin', Stay Vibin'"; the tab icon is the Drippin Bites mark (private window or hard reload).
  - DevTools Elements, `<head>`: description, `theme-color`, `og:title`, `og:description`, `og:site_name` present; no `og:image`.
  - `/` at 375px: header with logo left and Menu pill right, nothing clipped or wrapped; the holding content is still centred between header and footer; footer is a centred column whose Visit block shows only "Johar Town, Lahore"; no horizontal scroll.
  - `/` at desktop width: header content aligned to the page max width; footer in three columns; `GoldRule` centred above it.
  - Mobile device emulation: the browser UI colour follows the dark `theme-color`.
  - Temporarily make the page taller than the viewport and scroll: the header stays fixed at the top, content blurs behind it, the gold hairline is visible, no jank. Remove the change.
  - Tap the logo from the not-found page: returns to `/`.
  - Tap "Menu": the branded not-found page appears inside the shell, tab title "Page not found | Drippin Bites Cafe", the Menu pill shows its active state with `aria-current="page"`, and "Back to Home" returns to `/`.
  - Keyboard only: Tab shows the skip link first; Enter moves focus to the content; continuing to Tab reaches the logo, the Menu pill and each footer link with a visible gold ring.
  - Temporary check, then reverted: set `restaurant.phone` and `restaurant.hours` to test values in `data/menu.json`, confirm the two rows and the `tel:` link appear below the area and no address or WhatsApp row does, then `git checkout data/menu.json` and confirm `git diff data/menu.json` prints nothing.
  - Emulate `prefers-reduced-motion: reduce`: hover and focus states still apply, without animated transitions.
  - Console and dev-server terminal: no errors, no hydration warnings, no 404 for `/logo.svg`.

## Open questions

None. The four questions from the first draft were answered on 2026-10-13 and are folded into the sections above: `app/not-found.tsx` stays in this spec; the Open Graph image, Apple touch icon and `metadataBase` move to a new spec 19 (`19-share-preview`); the footer shows only `restaurant.area` when every contact value is missing, with no "to be confirmed" line; and the header keeps the outlined "Menu" pill.
