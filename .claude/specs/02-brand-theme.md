# Spec 02: Brand Theme

**Status:** Implemented
**Depends on:** 01

## Summary

Turn the neutral shadcn scaffold into the Drippin Bites look: brand colours as the shadcn theme variables, a dark-only warm near-black page with vignette and grain, a condensed display font plus a clean body font, and three shared brand primitives (two-colour heading, gold rule with diamond, pill label). Every later spec builds on these, so this is what makes the demo read as the cafe's own poster style instead of a template the moment the owners open it.

## Goals

- Replace the neutral values in `app/globals.css` `:root` with brand values, so every shadcn component is on-brand without per-component colours.
- Make the site dark-only: one palette, no light mode, no toggle.
- Expose the raw brand colours (gold, cream, navy, red, veg green) as Tailwind colour utilities for the few places the semantic tokens don't cover (price tags, Authentic / Lahori Twist labels, veg indicator).
- Load a condensed display font and a body font through `next/font`, and point `--font-heading` at the display font.
- Define the heading type scale (hero > section > card > body) once.
- Give the page its base atmosphere: warm near-black, subtle vignette, faint grain.
- Ship three server-component primitives in `components/brand/`: `BrandHeading`, `GoldRule`, `PillLabel` (plain and ticket variants).
- Bring `components/ui/button.tsx` up to the brand and the 44px tap-target rule: every size at least 44px tall, the primary variant a gold pill.
- Restyle the holding page in `app/page.tsx` with those primitives, so the theme is visible and checkable in the browser.
- `npm run lint` and `npm run build` pass.

## Out of scope

- Header, footer, `metadata` title/description, `viewport` / `themeColor` (spec 04). The tab title stays "Create Next App".
- Menu types, `menu.json` access and the `Rs. 1,599` formatter (spec 03). Nothing here reads `data/menu.json`.
- Product image box and the gold radial glow behind food cutouts, the navy price tag, "NEW" badge and veg indicator components (spec 05). This spec only provides the colour tokens they will use.
- The Authentic / Lahori Twist toggle (spec 11). Only its navy and red tokens are defined here.
- The real home page: hero, Cairo Crunch feature, other sections (specs 15, 16).
- Corner decorations from the posters (dot grids, wavy lines, palm-leaf shadow). They are built as a reusable component in spec 15.
- The distressed/stamped texture on the poster headline letters. Headings are flat colour.
- Reveal-on-scroll and any animation library. Only the global reduced-motion rule is added.
- Adding shadcn components, or restyling any component other than `Button`.
- Rendering a `Button` on any page. The holding page has none; the first real use is spec 04 or 15.
- Installing packages. `next/font` ships with Next.
- A style-guide or `/theme` demo route.
- Future phases from CLAUDE.md section 3: backend, auth, payments, WhatsApp Cloud API, admin dashboard, videos.
- Tests of any kind.

## User flow

No customer feature, only a visible change to the holding page:

1. A visitor opens `/` on a phone from Instagram.
2. The page is warm near-black with a soft vignette, not white.
3. Centred on screen: a gold-outlined pill label reading "Johar Town · Lahore", then the cafe name as a stacked condensed uppercase headline, first line cream and second line gold, then a thin gold rule with a diamond in the centre.
4. Nothing is interactive. The page reads like a small version of the posters in `docs/brand/`.

## UI & design

Reference: `docs/brand/poster-hawashi-crispy-pockets.jpeg`, `docs/brand/poster-faroge-grilled-wrap.jpeg` (type, rule, pills, atmosphere) and `docs/menu-reference/05-cairo-crunch.jpeg` (navy price tags, navy "Authentic" / red "Lahori Twist" labels, cream cards). Reference only; nothing is imported from `docs/`. Load the `frontend-design` skill when implementing.

### Colour tokens

All set in `:root` in `app/globals.css`. The four starting values from CLAUDE.md section 8 are fixed; the rest are derived and may be tuned by a few points during implementation as long as the contrast rules below hold.

| Variable | Value | Used for |
|---|---|---|
| `--background` | `#14100C` | page |
| `--foreground` | `#F3E6CC` (cream) | default text |
| `--card` | `#F3E6CC` | cream cards, as on the printed menu |
| `--card-foreground` | `#14100C` | dark text on cream cards |
| `--popover` | warm raised dark, about `#1E1811` | menus, popovers, later the cart `Sheet` |
| `--popover-foreground` | cream | |
| `--primary` | `#EBA92B` (gold) | CTAs, accents |
| `--primary-foreground` | `#14100C` | text on gold |
| `--secondary` | warm raised dark, about `#2A2118` (a step lighter than `--muted`) | secondary buttons and chips on the dark page |
| `--secondary-foreground` | cream | |
| `--muted` | warm dark surface, about `#221B14` | quiet panels |
| `--muted-foreground` | dimmed cream, about `#B8AA8E` | secondary text **on dark surfaces only** |
| `--accent` | gold at low opacity over the background | hover / pressed surfaces |
| `--accent-foreground` | cream | |
| `--destructive` | a red light enough to read as text on the dark background | form errors, remove actions |
| `--border` | gold at roughly 15–20% opacity | hairlines |
| `--input` | cream at roughly 15–20% opacity | field borders |
| `--ring` | gold | focus rings |
| `--radius` | `0.875rem` | softer cards than the shadcn default; pills and price tags set their own radius |

Brand tokens added alongside, each also mapped in `@theme inline` so `bg-gold`, `text-cream`, `bg-navy`, `bg-brand-red`, `text-veg` exist:

- `--gold` `#EBA92B`, `--cream` `#F3E6CC`, `--navy` `#1B2A6B`.
- Navy is **not** a semantic shadcn token. As a surface on the near-black page it has too little contrast to read as a shape, so it is used only through `bg-navy` with white text, for price tags and the "Authentic" label, which sit on cream cards.
- `--brand-red`: the "Lahori Twist" / "NEW" tag red from the printed menu (about `#D3202A`), used as a **fill with white text**. It is too dark to use as text on the page background, which is why `--destructive` is a separate, lighter red.
- `--veg`: a mid green based on the printed "(Veg)" marker, used like `--brand-red` as a **mark or fill with white text**, not as text. One green cannot reach 4.5:1 as text on both cream and the dark page (the two surfaces are about 15:1 apart), so it is tuned to stand out as a shape on both.
- `--card-muted-foreground`: a dark warm brown (about `#5C4F3D`) for secondary text **inside cream cards**, where `--muted-foreground` would be unreadable.

Removed: the whole `.dark` block, and the `--chart-*` and `--sidebar-*` variables with their `@theme` mappings. No spec in the roadmap uses charts or a sidebar.

### Dark-only

- Brand values live in `:root`. There is no second palette and no toggle.
- `<html>` gets a static `dark` class and `color-scheme: dark`. Reason: `components/ui/button.tsx` and every component `npx shadcn add` will generate carry `dark:` variants written for dark surfaces (`dark:bg-input/30`, `dark:hover:bg-muted/50`…). Without the class those never apply and the components fall back to their light-surface styling on a dark page. The existing `@custom-variant dark` line stays.
- `color-scheme: dark` also makes native scrollbars, form controls and autofill dark.

### Contrast rules

- Cream on background (about 15:1), gold on background (about 9:1), cream on `--secondary`, white on navy (about 13:1), dark on cream and dark on gold all pass AA and are the allowed text pairings.
- `bg-navy` is for fills on cream surfaces. Don't place a navy fill directly on the page background.
- **Gold text never sits on cream** (under 2:1). On cream cards, emphasis is navy or dark.
- `--destructive` text on `--background` must reach at least 4.5:1. `--veg` must reach at least 3:1 against both cream and the page background as a shape, and white text on `--veg` and on `--brand-red` at least 4.5:1. Check with a contrast tool during implementation and record the final hex values in the file.

### Typography

- Two fonts through `next/font/google`, in `app/layout.tsx`: **Anton** for headings (closest to the weight of the poster headlines) and **Figtree** for body (close to the poster's sub-line).
- Inter, Geist and Geist Mono are removed; nothing uses a mono font. `--font-mono` is dropped from `@theme`.
- The `next/font` CSS variables get their own names (for example `--font-display`, `--font-body`) instead of the current `--font-sans`, which today is both the font variable and the theme key (`--font-sans: var(--font-sans)`). `@theme inline` then maps `--font-sans` to the body font and `--font-heading` to the display font.
- Headings: display font, uppercase, tight line-height (about 0.9–0.95) so the two stacked lines lock together, slight positive letter-spacing.
- Scale, defined once in `globals.css` as three utilities, `heading-hero`, `heading-section` and `heading-card`, each setting the display font, uppercase, line-height, tracking and a fluid size. They are deliberately not theme text sizes: `cn` treats an unknown `text-*` class such as `text-hero` as a colour and would drop it, or the colour, when the two are merged.
  - **hero**: about 3.2rem at 375px (13.5vw) up to about 7rem, scaling with the viewport width. The mobile size is set by the 14-character rule in Edge cases, not by a fixed figure.
  - **section**: about 2.5rem up to about 4rem
  - **card**: about 1.5rem up to about 1.75rem
  - **body**: 1rem, never below 0.875rem for secondary text
- Pill labels and small caps labels use the **body** font, uppercase, medium weight, wide tracking, as on the posters.

### Page atmosphere

- `body`: `--background` with a warm radial vignette, slightly lighter and warmer near the upper centre, falling to near-black at the edges.
- A faint film grain across the whole viewport: a fixed, `pointer-events: none` layer using an inline SVG noise pattern from CSS (no image file, nothing from `docs/`), at very low opacity. The layer sits **behind** page content together with the vignette, so it textures the dark page but not cream cards or overlays, cannot block taps, and must not cause scroll jank on a phone.
- Text selection: gold background, dark text.

### Brand primitives (`components/brand/`)

All three are server components with no client JS, styled only with theme tokens, and each accepts `className`.

- **`BrandHeading`**: one heading element containing two block-level lines, first line cream (`text-foreground`), second line gold (`text-primary`). The caller chooses the heading level (h1–h3) and the size step (hero / section / card) independently, so visual size never forces the wrong document outline. The second line is optional; with one line it renders cream. Alignment centre or start. A screen reader announces it as a single heading, "line one line two".
- **`GoldRule`**: a thin horizontal gold line with a small outlined diamond (a rotated square) in the centre, the line fading to transparent at both outer ends as on the posters. Purely decorative: hidden from assistive tech. Width follows its container with a sensible max width; used as the section divider throughout the site.
- **`PillLabel`**: a 1px gold-outlined label with a transparent or very dark fill and gold uppercase tracked text in the body font. It is a text label, not a button: no hover state, no pointer cursor. Two variants through a `variant` prop:
  - **`pill`** (default): fully rounded ends, as on the "Now at Drippin Bites" poster label. An option adds a small four-point sparkle either side of the text (lucide `Sparkle`, decorative, hidden from assistive tech).
  - **`ticket`**: the "CAIRO CRUNCH" poster label. Same height, outline weight and type as the pill, but each end comes to a shallow point with the corners where the point meets the top and bottom edges softly rounded, like a ticket stub or bracket. The outline must stay a continuous, even 1px gold line around the whole shape, including the points, and scale with the text length; it is drawn with CSS or an inline SVG, not an image. No sparkles on this variant. Used by specs 06 and 15 for the Cairo Crunch label.

### Button (`components/ui/button.tsx`)

The generated shadcn file is edited in place; it keeps wrapping `@base-ui/react/button` and keeps its variant and size names, so later `Button` usage needs no special props.

- **Sizes:** every size is at least 44px tall, and every icon size at least 44×44px, including `xs`, `sm`, `icon-xs` and `icon-sm`. The small sizes may keep smaller text, icons and horizontal padding, but not a smaller height. Horizontal padding grows to suit the taller buttons; `lg` is the hero CTA size and is visibly larger than `default`.
- **`default` (primary):** a gold pill. Fully rounded, `bg-primary` with `text-primary-foreground`, body font, semibold, a soft warm shadow so it lifts off the dark page. Hover brightens slightly, press nudges down as it does today, both within 150–300ms.
- **Other variants** (`outline`, `secondary`, `ghost`, `destructive`, `link`): fully rounded to match, coloured only by the theme tokens. `outline` is a gold hairline on a transparent fill; `secondary` is the warm raised dark surface with cream text.
- **Focus:** the gold ring stays clearly visible around the pill shape.
- No hex values or `zinc` / `gray` / `neutral` classes in the file. The `import { cn } from "cn"` line is switched to `@/lib/utils`, as CLAUDE.md section 2 requires.

### Holding page (`app/page.tsx`)

- Stays a server component with one `<main>` and one `<h1>`, vertically centred.
- Stack, centred, generous vertical spacing: `PillLabel` (`pill` variant, with sparkles) reading "Johar Town · Lahore" → `BrandHeading` at hero size, level h1, lines "Drippin" / "Bites Cafe" → `GoldRule`.
- No images, links or buttons. It is replaced in spec 15.

### Responsive

- 375px first: the hero heading must fit on two lines without a word breaking mid-word or overflowing horizontally; 24px side padding minimum.
- Desktop: the same stack, larger type, rule capped at a max width so it doesn't span the screen.

### States and motion

- No loading, empty or error states; everything is static.
- Font loading: `display: swap` behaviour with `next/font`'s size-adjusted fallback, so the stacked heading doesn't jump badly when the display font arrives.
- A global `prefers-reduced-motion: reduce` rule in `globals.css` that cuts animation and transition durations to near zero, so later specs inherit it.

### Accessibility

- Focus ring is gold and clearly visible on the dark page. On cream cards a gold ring is too faint; components placed on cream must switch the ring to a dark colour. This spec documents the rule; the first cream-card component (spec 05) applies it.
- Decorative elements (`GoldRule`, sparkles, grain layer) are hidden from assistive tech.

## Data

- **`menu.json`:** not used. The cafe name and the "Johar Town · Lahore" pill text on the holding page are hard-coded, because typed access to `restaurant.name` and `restaurant.area` arrives in spec 03 and spec 15 replaces the page.
- **Cart state:** none.
- **Env vars:** none.
- **New types or zod schemas:** none beyond the primitives' own prop types, kept in each component file.

## Implementation outline

Files to modify:

- `app/globals.css`: brand values in `:root`; remove `.dark`, `--chart-*`, `--sidebar-*`; add brand colour tokens and their `@theme inline` mappings; font theme keys and the `heading-*` utilities; vignette, grain, selection, `color-scheme`, reduced-motion rule.
- `app/layout.tsx`: swap Inter / Geist / Geist Mono for the display and body fonts; static `dark` class on `<html>`. `metadata` is not touched.
- `app/page.tsx`: holding page rebuilt from the three primitives.
- `components/ui/button.tsx`: 44px minimum sizes, gold pill primary, pill-shaped variants on brand tokens.

Files to create:

- `components/brand/brand-heading.tsx`: two-colour stacked heading.
- `components/brand/gold-rule.tsx`: gold divider with centre diamond.
- `components/brand/pill-label.tsx`: gold-outlined label with `pill` (optional sparkles) and `ticket` variants.

Files that stay as they are: `lib/utils.ts`, `components.json`, `next.config.ts`, `package.json`, `package-lock.json`, `data/menu.json`, everything under `public/` and `docs/`.

Order of work:

- Read `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md` before touching fonts (AGENTS.md rule), and load the `frontend-design` skill.
- Colour tokens and dark-only setup in `globals.css`; check contrast for the derived values.
- Fonts in `layout.tsx`, then the font and type-scale theme keys.
- Page atmosphere (vignette, grain) and the reduced-motion rule.
- The three primitives, then the holding page.
- `Button` sizes and variants, checked on a temporary render that is removed afterwards.
- `npm run lint`, `npm run build`, browser check at 375px and desktop. After verification, set spec 02 to `Implemented` in the CLAUDE.md roadmap and update the "Current state" bullet in section 1 and the notes about `globals.css` and fonts in section 8.

## Edge cases

- **`dark:` variants:** if the `dark` class is missing from `<html>`, the outline and ghost button variants render with light-surface styles. Check a `<Button variant="outline">` temporarily during implementation, then remove it.
- **Small button sizes:** `xs`, `sm`, `icon-xs` and `icon-sm` no longer produce a short button. Anything that later needs a visually compact control (quantity steppers in spec 08) still gets a 44px hit area and must be laid out for it.
- **Ticket pill with long or wrapping text:** the pointed ends must not distort or detach when the label is long. The label stays on one line; at 375px a long label shrinks its tracking or text size before it overflows.
- **Ticket outline rendering:** a `clip-path` cuts off a CSS border at the points, leaving gaps in the outline. The shape needs an approach that keeps the stroke continuous.
- **`muted-foreground` on cream:** shadcn components use `text-muted-foreground` freely. Inside a `bg-card` surface that is dimmed cream on cream. Anything placed on a cream card must use `--card-muted-foreground` instead.
- **Gold on cream:** `text-primary` inside a cream card is unreadable. Same rule: navy or dark for emphasis on cream.
- **Single-weight display font:** Anton and Bebas Neue ship one weight. `font-bold` or `font-semibold` on a heading makes the browser synthesise a fake bold; headings must not set a weight. The current `font-semibold` on the holding page `<h1>` goes.
- **Uppercase and screen readers:** headings are uppercased with CSS, not typed in capitals, so they are not read letter by letter.
- **Long words at 375px:** later headings such as "CHICKEN FAROGE" or "CRISPY POCKETS" are wider than "DRIPPIN". The hero size must be fluid enough that a 14-character line fits inside 375px minus padding.
- **Grain layer:** must not intercept taps, must not cover the later `Sheet` overlay incorrectly, and must not create a horizontal scrollbar.
- **Removed tokens:** if a later `npx shadcn add` brings in a component that references `--sidebar-*` or `--chart-*`, those tokens have to be re-added with brand values at that point.
- **Opacity-based `--border`:** borders drawn on cream cards with a gold-alpha colour nearly vanish. Dividers inside cream cards need a dark-alpha colour.
- **Stale `.next/`:** after renaming the font variables, delete `.next/` if the old font still shows.
- **`AGENTS.md`:** `next dev` rewrites it; commit it with the work if it changes.

## Acceptance criteria

- [x] `app/globals.css` `:root` sets `--background: #14100C`, `--foreground: #F3E6CC`, `--primary: #EBA92B` (or exact colour-space equivalents), with `--card` cream and `--card-foreground` dark.
- [x] `--secondary` is a warm raised dark surface with `--secondary-foreground` cream, not navy. Navy (`#1B2A6B`) appears only as `--navy` / `bg-navy`.
- [x] `app/globals.css` has no `.dark` block and no `--chart-*` or `--sidebar-*` variables or mappings.
- [x] `--gold`, `--cream`, `--navy`, `--brand-red`, `--veg` and `--card-muted-foreground` are defined and mapped in `@theme inline`, so `bg-gold`, `text-cream`, `bg-navy`, `bg-brand-red` and `text-veg` compile.
- [x] `<html>` has a static `dark` class and `color-scheme: dark` applies; there is no theme toggle or `prefers-color-scheme` branch anywhere.
- [x] `app/layout.tsx` loads exactly two fonts through `next/font`, Anton and Figtree; the Inter, Geist and Geist Mono imports are gone.
- [x] `--font-heading` in `@theme` resolves to the display font and `--font-sans` to the body font; `font-heading` and `font-sans` utilities render the right faces in the browser.
- [x] Hero, section and card heading sizes are defined once in `globals.css` as the `heading-hero`, `heading-section` and `heading-card` utilities and used by `BrandHeading`; no heading size is hard-coded in `app/page.tsx`, and no `--text-hero`-style theme key exists.
- [x] A 14-character hero line ("Chicken Faroge") fits on one line at 375px width with 24px side padding.
- [x] `components/brand/brand-heading.tsx`, `gold-rule.tsx` and `pill-label.tsx` exist, contain no `"use client"`, and use only theme tokens (no hex values, no `zinc` / `gray` / `neutral` classes).
- [x] `BrandHeading` renders a single heading element with two lines, first cream, second gold, uppercase in the display font, with the level and size chosen independently.
- [x] `GoldRule` shows a thin gold line fading at both ends with an outlined diamond in the centre, and is hidden from assistive tech.
- [x] `PillLabel` with the default `pill` variant shows a gold-outlined, fully rounded label with uppercase tracked gold text and optional sparkles either side.
- [x] `PillLabel` with `variant="ticket"` shows the same label with pointed ends and a continuous 1px gold outline with no gaps at the points, for both a short and a long label.
- [x] Every `Button` size in `components/ui/button.tsx`, including `xs`, `sm` and all icon sizes, renders at least 44px tall (icon sizes at least 44×44px).
- [x] The default `Button` variant is a fully rounded gold pill with dark text, and every variant is styled only with theme tokens (no hex values, no `zinc` / `gray` / `neutral` classes).
- [x] `components/ui/button.tsx` imports `cn` from `@/lib/utils` and still wraps `@base-ui/react/button` with the same variant and size names.
- [x] `/` shows a pill label reading "Johar Town · Lahore", two-colour heading and gold rule on a near-black page with a visible but subtle vignette and grain; it still has exactly one `<main>` and one `<h1>` and no `"use client"`.
- [x] At 375px width nothing on `/` overflows horizontally and no heading word breaks mid-word.
- [x] Cream and gold text on the page background, white on navy, white on `--brand-red`, white on `--veg` and `--destructive` text on the page background all meet WCAG AA (4.5:1); `--veg` is at least 3:1 against both cream and the page background.
- [x] A `prefers-reduced-motion: reduce` rule exists in `globals.css`.
- [x] `package.json`, `package-lock.json`, `data/menu.json` and `metadata` in `app/layout.tsx` are unchanged.
- [x] Nothing imports or references a file under `docs/`.
- [x] `npm run lint` exits with no errors or warnings.
- [x] `npm run build` completes successfully.

## Verification

No automated tests (per CLAUDE.md).

- `npm run lint` passes.
- `npm run build` passes.
- `git status` shows only: `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `components/ui/button.tsx` modified; three files added under `components/brand/`; this spec; `CLAUDE.md` once the status is updated (and `AGENTS.md` only if `next dev` rewrote it).
- Manual checks in the browser with `npm run dev`:
  - `/` at 375px: near-black warm page, pill → cream/gold stacked heading → gold rule with diamond, centred, no horizontal scroll, comfortable spacing.
  - `/` at desktop width: same stack, larger type, rule capped in width, vignette visible at the edges.
  - Side by side with `docs/brand/poster-hawashi-crispy-pockets.jpeg`: heading weight and proportions, gold tone, rule and pill read as the same brand.
  - DevTools computed styles: the `<h1>` uses the display font, body text the body font, and no Geist or Inter request appears in the Network tab.
  - DevTools: `--background`, `--primary`, `--card`, `--secondary` on `:root` match the table above.
  - Emulate `prefers-color-scheme: light`: the page does not change.
  - Emulate `prefers-reduced-motion: reduce`: no errors, rule is active.
  - Throttled reload: heading shows in the fallback font then swaps without a large layout jump.
  - No console errors or 404s.
  - Temporary check, then removed: one `<Button>` of every variant and every size on the page. The default is a gold pill with dark text, `secondary` is a warm dark surface with cream text, `outline` a gold hairline; every one measures at least 44px tall in DevTools, at 375px and desktop; the focus ring is visible on each with keyboard focus.
  - Temporary check, then removed: `PillLabel variant="ticket"` with a short label ("Cairo Crunch") and a long one, at 375px and desktop, compared with the poster. The outline is unbroken at both points.

## Open questions

None. The seven questions from the first draft were answered on 2026-10-13 and are folded into the sections above. Three conflicts found while planning (theme text sizes vs `cn`, the hero mobile size vs the 14-character rule, and `--veg` as text on both surfaces) were resolved the same day and are also folded in.
