# Spec 05: Item Cards

**Status:** Implemented
**Depends on:** 02, 03

## Summary

Build the display-only menu card and the small pieces it is made of: a product image on a dark, gold-lit stage, a navy price tag, a "NEW" badge and a veg mark. The card is what the owners will see repeated across the menu page and the home page, so it carries most of the "this is our brand, not a template" impression: food large and glowing, poster type, printed-menu price tags.

## Goals

- One shared product image component: a fixed-ratio box, `next/image` with `object-contain`, a soft gold radial glow behind the transparent cutout, and a designed fallback when the file is missing.
- One price tag component that renders every price through `formatPrice`, with a "From" prefix when an item has several prices.
- A "NEW" badge and a veg mark that cover tags on the item and on the variant, without marking an item as veg when only one of its versions is.
- One `ItemCard` that takes an item and its category and shows name, subtitle, description, variant options, tags and price, with nothing hard-coded from the menu.
- Two card layouts from the same component: **stacked** (image above the text) and **row** (image beside the text), so spec 06 can keep long single-image categories compact on a phone.
- Cards in a grid line up: equal heights, price row pinned to the bottom, prices never wrap.
- Apply spec 02's cream-surface rules for the first time: dark text, `text-card-muted-foreground`, no gold text, dark hairlines.
- `npm run lint` and `npm run build` pass.

## Out of scope

- Any tap behaviour. The card is not a link or a button and has no "Add" control; the customiser opens from it in spec 09. No disabled or placeholder button is rendered.
- The Authentic / Lahori Twist toggle and its navy / red labels (spec 11), size selection (spec 10), dips pickers (spec 12).
- `/menu`, the category bar, grid column counts and the `sides` / `drinks` sub-groups (spec 06). This spec makes the card work at the widths those grids will use; it does not lay the grids out.
- Deal cards (spec 14) and the combo card (spec 13). They reuse the product image and the price tag from here.
- The home hero and featured Cairo Crunch section (spec 15), and reveal-on-scroll, which belongs to the pages.
- Cart state, quantities, add-on prices and line totals (spec 07).
- Reprocessing, cropping or re-exporting anything in `public/images/`.
- Adding shadcn components. `card` and `badge` from the registry are not used: the card is a cream panel with a dark image stage and the badges are brand shapes, so the generated components would be restyled slot by slot for no gain. This matches how `components/brand/` was built.
- Installing packages, and editing `data/menu.json`, `lib/menu.ts`, `lib/format.ts` or `types/menu.ts`. Every lookup the card needs already exists.
- Future phases from CLAUDE.md section 3: backend, auth, payments, WhatsApp Cloud API, admin dashboard, videos. No ratings, favourites, stock or "popular" labels.
- Tests of any kind.

## User flow

There is no route that shows cards yet, so nothing changes for a visitor until spec 06. What the card will give them there, on a phone:

1. They scroll the menu and see a cream card for each item. The food sits on a dark panel with a warm gold glow behind it, large enough to recognise at a glance.
2. Under the image: the item name in the poster typeface, a short description, and a navy tag with the price. For a pizza the tag reads "From Rs. 499" and a quiet line lists the sizes on offer.
3. New items carry a red "NEW" stamp; vegetarian ones a green "Veg" mark.
4. Cards in the same row are the same height and their price tags sit on one line, so the list scans cleanly.
5. If a photo fails to load, the card still looks finished: the glow and a faint Drippin Bites mark fill the panel instead of a broken-image icon.

## UI & design

Reference: `docs/menu-reference/05-cairo-crunch.jpeg` (cream cards, navy price tags, red "NEW"), `docs/brand/photo-tamaya-sandwich.jpeg` (dark surface, warm side light) and the posters for type. Reference only; nothing is imported from `docs/`. Load the `frontend-design` skill when implementing.

### Product image (`ProductImage`)

- **Stage:** a dark panel, not a plain box. A warm gradient from `--muted` at the top to `--background` at the bottom, with a soft radial glow of `--gold` (about 30–35% at the centre, fading to transparent by about 65% of the radius) sitting slightly below centre, where the plate would catch light. The glow is a CSS gradient layer behind the image, not a blurred element.
- **Image:** `next/image` with `fill` and `object-contain`, inside the stage with about 8% inner padding so differently padded cutouts never touch the edge. A soft dark `drop-shadow` filter under the cutout grounds it on the stage. The inconsistent scale between files is accepted and not corrected per image.
- **Box shape:** set by the caller through `className`. The card uses a 4:3 box in the stacked layout and a fixed-width column that stretches to the card's height in the row layout; `object-contain` keeps the cutout square and centred in either. The box never depends on the image for its size, so nothing shifts when the image arrives.
- **`sizes`:** the caller can pass it; each layout has a sensible default (about `(min-width: 64rem) 25vw, (min-width: 40rem) 50vw, 100vw` for stacked, a fixed pixel width for row). The files are 800×800 and the optimiser does not upscale, so no served image is wider than that, even when a high-density phone requests a larger `w=` step from the default `deviceSizes`.
- **Loading:** lazy by default, with a `loading` pass-through for the eager case that spec 15's hero section needs (`loading="eager"`, which the bundled docs prefer over `preload`). No blur placeholder: the stage and glow are the loading state.
- **Missing image:** the stage and glow stay, and `public/logo-mark.svg` is shown centred at about 40% of the box and about 25% opacity. No alt text spills into the box and no browser broken-image icon shows. Detecting the failure needs an error handler, so this is the one client component in the spec.
- **Alt text:** passed by the caller. Inside `ItemCard` it is empty, because the item name is the heading directly beside it.

### Item card (`ItemCard`)

Shared anatomy: a `bg-card` cream panel, `rounded-xl`, clipped, with a soft warm shadow (dark, low opacity, about 24px blur) so it lifts off the page. No grey border; a 1px `ring` in gold at about 15% is the only edge. The card fills the height of its grid cell.

- **Stacked layout (default):** stage on top at 4:3, cream body below with 16px padding (20px from `sm`). Designed for cells from about 260px wide: one-up at 375px, two- to four-up on larger screens.
- **Row layout:** stage on the left as a dark column, 7rem wide at 375px and 8rem from `sm`, stretching to the card's height with the cutout square and centred inside it; cream body on the right with 12–16px padding. Designed for full-width cells on a phone and two-up from `md`. This is the compact form for categories whose items all share one category image (pizzas, burgers, sandwiches, wraps, pasta, dips).

Body, top to bottom:

1. **Tag row:** the "NEW" badge and veg mark, when present. In the stacked layout the row straddles the seam between stage and body (half on each), start-aligned with the body padding, like a label stamped on the card. In the row layout it is the first line of the body. With no tags the row is not rendered and leaves no gap.
2. **Title:** the `heading-card` utility in `text-card-foreground`, no font weight set. The heading level is chosen by the caller (default `h3`). Up to three lines, then clamped. `BrandHeading` is not used here: its cream and gold lines are unreadable on cream.
3. **Subtitle** (`item.subtitle`, Cairo version items only): body font, uppercase, tracked, 0.75rem, `text-card-muted-foreground`, directly under the title as on the posters ("HAWAWSHI" / "CRISPY POCKETS").
4. **Description:** body font, 0.875rem, `text-card-muted-foreground`, clamped to three lines in stacked and two in row. Omitted, with no blank line, when there is none.
5. **Options line** (items with more than one variant, when no specific variant was requested): the variant labels joined with " · ", for example "Authentic · Lahori Twist" or "Large · Extra Large". Same type as the subtitle but not uppercase. It tells the customer a choice exists before the customiser does.
6. **Footer row,** pinned to the bottom of the body: the price tag at the start and an empty action slot at the end. Spec 09 puts its Add control in the slot; nothing is rendered there now. The row sits above a hairline in `--card-foreground` at about 10%, not `border-border` (gold-alpha vanishes on cream).

### Price tag (`PriceTag`)

- A navy rounded rectangle (`bg-navy`, radius about 0.5rem, not a full pill) with white text, as on the printed menu. Body font, bold, `tabular-nums`, `whitespace-nowrap`, about 1rem with 6px × 12px padding.
- With the "from" option: a small uppercase tracked "From" (about 0.6875rem, white at about 80%) before the amount, inside the same tag.
- It is a label, not a control: no hover, no pointer cursor.
- It is only placed on cream. Navy on the page background is too dark to read as a shape (spec 02).

### "NEW" badge and veg mark

- **NEW:** `bg-brand-red`, white text, body font, bold, uppercase, tracked, about 0.6875rem, a small radius, rotated about −3° so it reads as a stamp rather than a chip. Text is "New", uppercased with CSS.
- **Veg:** a `bg-veg` pill with white text: a lucide `Leaf` icon (decorative, `aria-hidden`) and the word "Veg". Never green text on its own.
- Both come from one small component that takes a tag list and renders in a fixed order (new, then veg), so callers cannot forget one. Which tags reach it is the card's decision; see the tag rule under Data.

### Responsive

- 375px first. Stacked one-up is 343px wide: the image is large, the title sits on one or two lines for every current item. Row is 343px wide with a 112px stage: title and price tag fit beside it without the price wrapping.
- Stacked at its narrowest supported width (about 260px): "Crunchy Cheesy Croissant Sandwich" wraps to three lines and nothing overflows.
- Desktop: the same card; only padding and the row stage size step up. The card does not grow its type with the viewport beyond what `heading-card` already does.

### States

- **No description:** the eight `dips` items. Body closes up; footer still pinned to the bottom.
- **No tags, no subtitle, single variant:** each line is simply absent.
- **Missing image:** described above.
- **Long name or description:** clamped as above; the full text is still in the DOM for screen readers.
- **Hover / press / focus:** none. The card is not interactive yet, so it shows no pointer cursor, lift or ring that would promise a tap target. Spec 09 adds feedback together with the control.
- **Loading / error:** nothing beyond the image; the data is a static import.

### Motion

- None. A fade-in on load was considered, but CSS cannot react to an image finishing loading, and doing it with load state would leave an image invisible when it loads before hydration.

### Accessibility

- Each card is an `<article>` whose accessible name is its heading.
- The veg mark's visible "Veg" and the badge's "New" are real text, read in the card's reading order before the title.
- The price tag reads as "From Rs. 499" / "Rs. 499"; no extra hidden label.
- Contrast pairs used: dark on cream (15.3:1), `--card-muted-foreground` on cream (6.4:1), white on navy (13.2:1), white on `--brand-red` (5.2:1), white on `--veg` (5.0:1). No gold text on cream anywhere in the card.
- Anything interactive later placed in the action slot must use a dark focus ring; the gold ring is too faint on cream (spec 02).

## Data

- **`menu.json`,** read only through `lib/menu.ts`. The card receives an `Item` and its `Category` (types from `types/menu.ts`) and optionally a specific `Variant`.
  - **Default mode (no variant passed),** used by the menu grid:
    - title: `item.name`; subtitle: `item.subtitle`
    - description and image: from `getDefaultVariant(item)` through `getDisplayDescription` and `getImage`
    - tags: the item's own tags (`getTags(item)` with no variant) plus any tag that is on **every** variant. A tag on only some variants is not shown. This small rule is a plain function beside the card; `lib/menu.ts` is not changed.
    - price: `getLowestPrice(item)`; "From" is shown when `hasMultiplePrices` is true
    - options line: `getVariantLabel` for each entry in `item.variants`, when there is more than one
  - **Variant mode (a variant passed),** for later callers that show one exact choice (featured section, combo options): title from `getDisplayName`, description and image for that variant, tags from `getTags(item, variant)` (item tags plus that variant's own), its own `price` with no "From", and no options line.
  - Fields read: `item.name`, `subtitle`, `description`, `image`, `tags`, `variants[].id` / `price` / `label` / `name` / `description` / `image` / `tags`, `category.image`, `category.variantType`, `sizes[].label`.
  - Not used: `addOnGroups`, `group`, `combos`, `deals`.
- **Formatting:** every amount goes through `formatPrice`. "From", "New" and "Veg" are the only authored words in these components.
- **Cart state:** none. **Env vars:** none.
- **New types or zod schemas:** none. Component prop types stay in their files.
- **`next.config.ts`:** unchanged. Local images under `public/` need no `images` configuration at the default quality.

## Implementation outline

Files to create (shared, so in `components/menu/`):

- `components/menu/product-image.tsx`: client component; the stage, glow, `next/image` and the missing-image fallback.
- `components/menu/price-tag.tsx`: navy price label with the optional "From" prefix.
- `components/menu/item-tags.tsx`: "NEW" badge and veg mark from a tag list.
- `components/menu/item-card.tsx`: server component; resolves the display values and arranges the two layouts.

Files to modify:

- `app/page.tsx`: only for the temporary check in Verification; `git diff app/page.tsx` must print nothing when the work is finished.
- `CLAUDE.md`: after verification, set spec 05 to `Implemented` and add `components/menu/` to the "Current state" bullet in section 1.

Files that stay as they are: `data/menu.json`, `lib/menu.ts`, `lib/format.ts`, `types/menu.ts`, `app/globals.css` (unless a shared shadow or glow value is clearly worth a token), `app/layout.tsx`, `components/brand/`, `components/layout/`, `components/ui/button.tsx`, `next.config.ts`, `package.json`, `package-lock.json`, everything under `public/` and `docs/`.

Order of work:

- Read `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` (`fill`, `sizes`, `loading`, `onError`) before writing the image component (AGENTS.md rule), and load the `frontend-design` skill.
- `ProductImage`: stage, glow, image, then the fallback.
- `PriceTag` and the tags component.
- `ItemCard`: stacked layout, then row, then variant mode.
- Temporary render on `app/page.tsx` covering the items listed in Verification, checked at 375px and desktop, then removed.
- `npm run lint`, `npm run build`, then the CLAUDE.md update.

## Edge cases

- **Same price on both versions:** `tamaya` is Rs. 499 for both, so its tag reads "Rs. 499" with no "From", while the options line still shows both versions.
- **First variant is not the smallest size:** `lasagna` starts at `large`. The price comes from `getLowestPrice`, not from the default variant, and its options line reads "Large · Extra Large".
- **Tags on a variant only:** `veg` for `ful` and `tamaya` is on the `authentic` variant only, and the Lahori Ful contains egg. In default mode their cards show no veg mark, even though the description shown is the Authentic one; the mark appears in variant mode for `authentic` and later in the customiser (spec 11). `tamaya-bites` is tagged on the item and keeps its mark.
- **Single-variant items and the "every variant" rule:** an item with one variant that carries a tag satisfies "every variant" and shows it. No current item is tagged this way, but the rule must not special-case variant counts.
- **Default mode must not pass the default variant to `getTags`:** that would bring the Authentic-only `veg` back onto the Ful and Tamaya cards.
- **Shared images:** every pizza in a category, both sides and both drinks resolve to the same file. The card does nothing special; choosing the row layout for those lists is spec 06's call.
- **`hawawshi` and `faroge`:** one image for both versions, so variant mode shows the same photo for either.
- **Single-variant labels:** "Regular" is never printed on the card. "6 pcs" on `tamaya-bites` is already in its description and is also not printed, since the options line needs more than one variant.
- **Image error before hydration:** a failed request can finish before the client component hydrates, and the error event is then missed. The component must also check the image's state when it mounts, in a ref callback rather than an effect (the installed `react-hooks` lint rules flag setting state in an effect).
- **Dev vs build for a missing file:** the image optimiser returns an error response rather than a 404 page; the fallback must appear in both `next dev` and the production build.
- **Client boundary:** `ProductImage` is the only client file. `ItemCard` stays a server component and must not import `lib/menu.ts` into the client file, so the menu JSON is not pulled into the bundle for a card.
- **`cn` and `text-*`:** card type sizes use Tailwind's built-in sizes or the `heading-card` utility; no new `--text-*` theme keys.
- **Clamped titles:** a clamp on a heading needs the `heading-card` line-height of 1 to leave room for descenders and accents; check "Jalapeño"-style characters are not clipped in descriptions.
- **Long future names:** a name with one very long word must break rather than overflow the row layout's narrow body.
- **`AGENTS.md`:** `next dev` rewrites it; commit it with the work if it changes.

## Acceptance criteria

- [x] `components/menu/product-image.tsx`, `price-tag.tsx`, `item-tags.tsx` and `item-card.tsx` exist; only `product-image.tsx` contains `"use client"`.
- [x] `ProductImage` renders `next/image` with `fill` and `object-contain` inside a box sized by its caller, on a dark stage with a visible gold radial glow behind the cutout.
- [x] With an image path that does not exist, the box keeps its size and shows the stage, glow and a faint `logo-mark.svg`; no broken-image icon or stray alt text appears, in both `next dev` and `next start`.
- [x] `PriceTag` output comes from `formatPrice`; it is a navy rounded rectangle with white text, never wraps, and shows "From" only when asked.
- [x] `tikka` shows "From Rs. 499", `lasagna` "From Rs. 1,649", `hawawshi` "From Rs. 499", `tamaya` "Rs. 499" and `zinger-burger` "Rs. 449".
- [x] "NEW" appears on `sando-sandwich`, `croissant-sandwich`, `hot-dragon`, `sweet-and-chilli-wrap` and `macaroni-cheesy-pasta`; neither badge appears on `zinger-burger`.
- [x] In default mode the veg mark appears on `tamaya-bites` and does **not** appear on `ful` or `tamaya`; a tag is shown in default mode only when it is on the item or on every variant.
- [x] In variant mode, `ful` + `authentic` and `tamaya` + `authentic` show the veg mark; `ful` + `lahori` and `tamaya` + `lahori` do not.
- [x] In variant mode, `ful` + `lahori` shows "Ful Masala Roll", its own description, `ful-lahori.webp`, "Rs. 749", no veg mark and no options line.
- [x] The options line reads "Authentic · Lahori Twist" for `hawawshi`, "Small · Medium · Large · Extra Large" for `tikka`, "Large · Extra Large" for `lasagna`, and is absent for `zinger-burger`.
- [x] `hawawshi` shows the title "Hawawshi" with the subtitle "Crispy Pockets"; `zinger-burger` has no subtitle line and no gap where it would be.
- [x] `chipotle-sauce` renders with no description and no blank line, and its price tag still sits at the bottom of the card.
- [x] `ItemCard` supports a stacked and a row layout from one component; both render correctly at 375px and at desktop width with no horizontal scroll.
- [x] In a grid row, cards with different amounts of text are the same height and their price tags align on one line.
- [x] The card is an `<article>` named by its heading; the heading level can be chosen by the caller; the card contains no link, button, pointer cursor or hover lift.
- [x] Card text uses `text-card-foreground` and `text-card-muted-foreground` only; there is no `text-primary`, `text-gold` or `text-muted-foreground` on the cream surface, and no `font-bold` / `font-semibold` on the title.
- [x] No hex values or `zinc` / `gray` / `neutral` classes in the new files; no item name, description or price is written as a literal in them; nothing imports `data/menu.json` directly or references `docs/`.
- [x] `data/menu.json`, `lib/menu.ts`, `lib/format.ts`, `types/menu.ts`, `next.config.ts`, `package.json` and `package-lock.json` are unchanged, and `git diff app/page.tsx` prints nothing.
- [x] `npm run lint` exits with no errors or warnings.
- [x] `npm run build` completes successfully.

## Verification

No automated tests (per CLAUDE.md).

- `npm run lint` passes.
- `npm run build` passes.
- `git status` shows only: four files added under `components/menu/`; this spec; `CLAUDE.md` once the status is updated (and `AGENTS.md` only if `next dev` rewrote it).
- Temporary check, then removed: render a grid of cards on `app/page.tsx` with `npm run dev`, in both layouts, for `hawawshi`, `ful`, `tamaya`, `croissant-sandwich`, `tamaya-bites`, `limonana`, `tikka`, `lasagna`, `hot-dragon`, `zinger-burger` and `chipotle-sauce`, plus `ful` + `authentic` and `ful` + `lahori` in variant mode and one `ProductImage` with a deliberately wrong path. Then:
  - 375px, stacked one-up: images large with a visible glow, titles readable, tags straddling the seam, price tags unwrapped, comfortable spacing, no horizontal scroll.
  - 375px, row: dark stage column at the left with the cutout centred, text and price fit beside it for the longest name.
  - Desktop, three- or four-up: equal heights per row, price tags on one line, descriptions clamped.
  - Compare each card's text and price with `data/menu.json` and with the acceptance criteria.
  - Side by side with `docs/menu-reference/05-cairo-crunch.jpeg`: the navy tag, red "NEW" and cream card read as the same menu.
  - The wrong-path image shows the fallback, at first load and after a hard reload; repeat once against `npm run build` + `npm run start`.
  - DevTools Network: image responses are WebP with an intrinsic width of at most 800px, and off-screen cards load lazily.
  - Screen reader or accessibility tree: each card is an article named by its heading; "New" / "Veg" and the price are announced once.
  - Console and dev-server terminal: no errors, no hydration warnings, no missing `sizes` warning from `next/image`.
- After removing the temporary render: `git diff app/page.tsx` prints nothing and `/` looks as it did after spec 04.

## Open questions

None. The four questions from the first draft were answered on 2026-10-13 and are folded into the sections above: in default mode a tag shows only when it is on the item or on every variant, so the Ful and Tamaya cards carry no veg mark; the four version items are titled with `item.name` and `item.subtitle`, with variant names only in variant mode and the customiser; the photo sits on a dark, gold-lit stage inside the cream card; and the row layout stays. Three corrections found while planning were folded in the same day: the row stage is a full-height column rather than a square, the 800px check applies to the served image rather than the request, and there is no image fade-in.
