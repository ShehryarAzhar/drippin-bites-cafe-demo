# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 1. Project overview

- A **demo / pitch prototype** of an online ordering website for **Drippin Bites Cafe**, Johar Town, Lahore, Pakistan.
- Purpose: show the owners what their own ordering site would look like, to win the project. It is not the production system.
- The restaurant does dine-in, takeaway and delivery, and currently takes orders manually on WhatsApp.
- Main selling point: the **Cairo Crunch** Egyptian street-food line (Hawawshi, Ful, Tamaya, Chicken Faroge). Everything on the site pushes Cairo Crunch first.
- Audience: mostly mobile users arriving from Instagram. Design **mobile-first**.
- Current state: the brand theme, menu data helpers, the site shell, the item cards, the menu page, the cart store, the cart drawer, the item customiser, pizza size selection, the Cairo version toggle, the dips pickers and the Cairo Combo builder are in place (specs 01–13). `app/layout.tsx` sets `metadata` and `viewport` from `menu.restaurant` and wraps every page in a skip link, the sticky header, `<main id="content">` and the footer (`components/layout/`: `SiteHeader`, `SiteFooter`, and the client `NavLink` for the active link). `app/page.tsx` is a branded holding page (pill label, two-colour cafe name, gold rule) and `app/not-found.tsx` is the branded 404; `app/menu/` is the menu page: `page.tsx` arranges a short intro, the client `category-bar.tsx` (sticky chips that jump to each section and mark the one in view), `category-section.tsx` (Cairo Crunch with the poster treatment and stacked cards, every other category as row cards, and after a category's cards any combo built only from its items, from `getCategoryCombos` in `lib/menu.ts`), `combo-card.tsx` (the dark poster card for a combo, with the Build button) and `deals-section.tsx` (heading, count and lowest price only, until spec 14). The menu display components are in `components/menu/`: `ItemCard` (`stacked` and `row` layouts, default or single-variant mode; it carries the Add button when `canCustomize` in `lib/customizer.ts` allows the item, which today is every item), `ProductImage` (the client component with the dark gold-lit stage and missing-image fallback), `PriceTag` and `ItemTags`; `/menu` is the first route that renders them. Other components so far: `components/ui/button.tsx` (restyled: gold pill primary, every size at least 44px) and the brand primitives in `components/brand/` (`BrandHeading`, `GoldRule`, `PillLabel`). Menu access: `types/menu.ts` (all menu types), `lib/menu.ts` (the only import of `menu.json`, plus the lookups) and `lib/format.ts` (`formatPrice`, `tbdSafe`); the layout, the footer and `ItemCard` use them so far. Cart: `types/cart.ts` (line and summary types), the plain functions in `lib/cart/` (`line.ts` for validity, normalising, identity and the stored-cart check; `pricing.ts`; `summary.ts`) and the persisted Zustand store in `store/cart.ts` (`useCartStore`, key `drippin-bites-cart`). `components/cart/cart-hydration.tsx`, mounted in the layout, loads the saved cart after hydration and sets the store's `hydrated` flag. Cart UI, all in `components/cart/`: `CartButton` (header button with the count badge), `CartDrawer` (the restyled `components/ui/sheet.tsx` with lines, subtotal, delivery note and the Checkout link, mounted once in the layout), `CartLine`, `QuantityStepper` (controlled, no store access, for spec 09 to reuse) and `MobileCartBar` (the fixed "View cart" bar below `md`, with its own spacer). The drawer's open state is the separate, non-persisted `store/cart-drawer.ts` (`useCartDrawerStore`); `lib/cart/copy.ts` holds `DELIVERY_NOTE` and `formatItemCount`. Customiser, in `components/customizer/`: `AddButton` (the card control, whose tap area covers the whole card; it opens an item, or a combo with the word "Build"), `CustomizerSheet` and `CustomizerPanel` in `customizer-shell.tsx` (the frame on `Sheet`: a bottom sheet on phones, a centred two-column panel from `md`, with the stage, scrolling body and the footer stepper and Add button, for specs 10–14 to reuse), `ItemCustomizer` (the size choice for sized items, the version toggle for the Cairo version items, one dips section per add-on group, quantity, live total, add), `SizePicker` (the required size tiles on the restyled `components/ui/radio-group.tsx`, which draws no dot; data-free, with labels and prices passed in), `VersionToggle` (the Authentic / Lahori Twist segments on the restyled `components/ui/toggle-group.tsx` and `toggle.tsx`, first in the sheet's body; data-free like `SizePicker`, filled from `lib/version-colors.ts`, the navy / red map the cart's variant tag shares), `AddOnPicker` (one optional add-on group as multi-select tiles on the same `ToggleGroup`, with the heading, rule line and running cost passed in; data-free, used again for the combo's upgrade and dips; the rule and status wording comes from `getAddOnRule`, `getAddOnStatus` and `formatFreeAllowance` in `lib/cart/copy.ts`), `ComboCustomizer` (the Cairo Combo builder: one numbered step per slot from `getComboSteps` in `lib/menu.ts`, a required choice or an "Included" row, then the Loaded upgrade and the combo's dips, quantity, live total, add), `ChoicePicker` (one required single-choice step as numbered radio tiles, with `StepHeading`; data-free, for spec 14 to reuse) and `CustomizerRoot` (mounted once in the layout after the cart drawer). What is open, an item or a combo, is the non-persisted `store/customizer.ts` (`useCustomizerStore`). Every item can be added: a pizza needs a size chosen first (nothing is preselected, and until then the footer button reads "Choose a size" through `CustomizerPanel`'s `pending` prop), the four Cairo version items open on Authentic and swap name, description, tags, price and image with the toggle, and dips are optional with none preselected (Cairo Dips on the four version items, Extra Dips on burgers, sandwiches and wraps); a different set of dips is a separate cart line. The combo needs a main and a drink chosen (nothing is preselected, and the footer button names the missing step, wrapping its text if it must); a different main, drink, upgrade or set of dips is a separate line. `splitName` (the two-colour heading split) is in `lib/format.ts` and `getQuantityInCart` in `lib/cart/line.ts`. The Checkout link carries `prefetch={false}` until `/checkout` exists (spec 17). Menu data, images and logos are already in place.

## 2. Tech stack and commands

- **Next.js 16.4.0**, App Router, no `src/` directory. **React 19.3.0**. `AGENTS.md` (imported above) is rewritten by `next dev`; read the bundled docs in `node_modules/next/dist/docs/` before using a Next API.
- `next.config.ts` enables `cacheComponents` and `partialPrefetching`, so caching and `<Link>` prefetching follow the Cache Components model (`01-app/01-getting-started/08-caching.md` in the bundled docs).
- **TypeScript 5**, `strict: true`. Path alias `@/*` maps to the repo root.
- **Tailwind v4**, loaded through `@tailwindcss/turbopack` (a Turbopack rule in `next.config.ts`). There is no PostCSS config and no `tailwind.config.*`; all theme config lives in `app/globals.css`.
- **shadcn/ui** only, no other component libraries. `components.json` uses style `base-vega`: components wrap **`@base-ui/react`** primitives, not Radix, so check the generated component's props rather than assuming Radix APIs. Add with `npx shadcn add <name>`. Icons: `lucide-react`.
- `cn` comes from the `cn` npm package; `lib/utils.ts` re-exports it. Import from `@/lib/utils`.
- **Cart state: Zustand** with `persist` (localStorage), wrapped so the app still works if storage is unavailable. Zustand 5 is installed; the store is `store/cart.ts`.
- **Package manager: npm** (`package-lock.json`).

```bash
npm run dev      # next dev
npm run build    # next build
npm run start    # serve the production build
npm run lint     # eslint
```

- **No tests.** Do not write unit, integration or e2e tests, and do not add testing libraries. Verify work by running `lint` and `build` and fixing any errors.

## 3. Demo scope

In scope:
- Home, menu, cart and checkout.
- Checkout opens **WhatsApp with a pre-filled order message** (section 6).

Out of scope. Do not build these, and do not add placeholders that pretend they exist:
- Backend or database
- Authentication
- Payments
- WhatsApp Cloud API automation
- Admin dashboard
- Videos

These are future phases that will be pitched to the owners.

## 4. Menu data rules

- `data/menu.json` is the **single source of truth** for every item, price, size, deal, combo and add-on. Never hard-code a price, item name or description in components.
- Never edit `menu.json` unless explicitly asked.
- Prices are PKR integers. Display as `Rs. 1,599` through one shared formatting helper.
- Values that are the string `"TBD"` (`restaurant.address`, `whatsapp`, `phone`, `hours`) must render gracefully: show nothing or a neutral placeholder. Never invent a real-looking number or address.

Structure (top-level keys; `_notes` fields are comments, not data):

- `restaurant`: `name`, `shortName`, `tagline`, `area`, `address`, `whatsapp`, `phone`, `hours`, `currency`, `orderTypes` (`delivery`, `takeaway`, `dine-in`).
- `sizes`: `{ id, label }` for `small`, `medium`, `large`, `xl`.
- `addOnGroups`: `{ id, name, description, image?, freeCount, extraPrice?, maxSelect, options[] }`.
  - `cairo-dips`: 4 options without prices, `freeCount: 1`, `extraPrice: 70`, `maxSelect: 4`. First dip free, each additional Rs.70.
  - `dips` (Extra Dips): 8 options each with its own `price` (60–90), `freeCount: 0`, `maxSelect: 8`. All paid.
- `categories[]`: `{ id, name, image, items[], subtitle?, tagline?, featured?, variantType?, addOnGroups? }`. Order in the file: `cairo-crunch` (`featured: true`), `classic-pizza`, `special-pizza`, `premium-pizza`, `burgers`, `sandwiches`, `wraps`, `pasta`, `dips`.
- `items[]`: `{ id, name, variants[], subtitle?, description?, image?, tags?, group?, variantType?, addOnGroups? }`. Every item has at least one variant; a single-price item has one variant with id `regular`.
- `variants[]`: `{ id, price, label?, name?, description?, image?, tags? }`.
- `variantType`:
  - `size` is set on the three pizza **categories**. Pizza variants carry only `id` + `price`; the label comes from `sizes`. Not every pizza has every size (e.g. Lasagna is large/xl only).
  - `version` is set on four Cairo Crunch **items** (`hawawshi`, `ful`, `tamaya`, `faroge`), with variants `authentic` and `lahori` ("Lahori Twist"). Each variant overrides `name` and `description`, and for Ful and Tamaya also `image`.
  - All other items have no `variantType` and a single `regular` variant.
- `addOnGroups` is attached at two levels: on the **item** for the four Cairo version items (`cairo-dips`), and on the **category** for `burgers`, `sandwiches` and `wraps` (`dips`). Resolve both. Pizzas, pasta, and the other Cairo Crunch items have none.
- `tags` (`new`, `veg`) appear on items **and** on variants (`veg` is on the Authentic variant of Ful and Tamaya only). Check both.
- `group` (`sides`, `drinks`) sub-groups the non-sandwich Cairo Crunch items.
- The `dips` category sells the same eight sauces as standalone items; their prices are duplicated in the `dips` add-on group.
- `combos[]`: one entry, `cairo-combo`, Rs.749. `slots[]` are either `options` (customer picks) or `fixed`, both as `{ itemId, variantId }` references into Cairo Crunch: `main` (8 options: 4 items × 2 versions), `side` (fixed Cairo Fries), `drink` (Limonana or Karkade). `upgrades`: `loaded`, +Rs.150. `addOnGroups: ["cairo-dips"]`.
- `deals[]`: 16 entries `{ id, number, name, price, image, contents[], printedName? }`. A `contents` line is `{ qty, label, choose?, from?, size? }`:
  - `choose: "pizza"`: customer picks a flavour from the category ids in `from`, at `size`.
  - `choose: "soft-drink"`: customer picks from `softDrinks.options`.
  - no `choose`: a fixed, label-only line with no item reference. Many of these (nuggets, shakes, mini burgers, fries…) are deal-only and exist nowhere else in the file.
- `softDrinks`: `options` is a placeholder list of six flavours until the owners confirm.
- `openQuestions`: see the end of this file.

## 5. Ordering behaviour

- **Pizzas:** the customer must choose a size. Show only the sizes present in that pizza's variants.
- **Cairo Crunch:** an Authentic / Lahori Twist toggle (shadcn `ToggleGroup`). Switching updates name, description, price and, where the variant has one, the image.
- **Cairo dips:** a picker where the first dip is free and each extra adds Rs.70 (read `freeCount` / `extraPrice` from the group). Applies to items and combos whose `addOnGroups` include `cairo-dips`.
- **Extra dips:** optional paid add-ons for categories that list the `dips` group.
- **Cairo Combo:** a step-by-step picker (main → fries included → drink) with an optional Loaded upgrade.
- **Deals:** sold as fixed bundles. For lines with `choose`, the customer selects the pizza flavour (filtered by `from` and `size`) or the soft drink. A line with `qty` 2 needs two selections.
- **Cart line uniqueness:** item + variant + add-ons + choices. Identical selections increase quantity; different ones get separate lines.
- **Cart UI:** quantity controls, remove and a running subtotal in a shadcn `Sheet` drawer, with a sticky cart button on mobile.
- **Delivery fee:** unknown. Show "Delivery charges confirmed on WhatsApp".

## 6. Checkout and WhatsApp message

- Collect: order type (delivery / takeaway / dine-in), name, phone, address (delivery only), optional notes.
- Phone: Pakistani format. Accept `03xxxxxxxxx`, normalise to `923xxxxxxxxx`.
- Validate with simple inline errors, following section 13.
- The WhatsApp number comes from env var `NEXT_PUBLIC_WHATSAPP_NUMBER`, not from `restaurant.whatsapp`. `.env.example` documents it (committed through a `!.env.example` exception to the `.env*` rule in `.gitignore`); copy it to `.env.local` and fill in the value. If the variable is missing, show a clear message instead of a broken link.
- Open `https://wa.me/<number>?text=<encoded message>`. The message is plain text, readable on a phone, in this order:
  1. header with the restaurant name
  2. order type
  3. each line as `qty × name (variant)`, with add-ons and deal choices indented below
  4. line totals
  5. subtotal
  6. the delivery-fee note
  7. customer name, phone, address and notes
- Clear the cart only after the customer confirms they sent the order, never automatically.

## 7. Pages and layout

- **Home `/`**
  - Hero: `public/images/cairo/tamaya-authentic.webp` (transparent) over a dark gradient with a soft gold glow behind it, a Cairo Crunch headline, and an "Order Now" CTA.
  - Then: featured Cairo Crunch section, category shortcuts, deals preview, location/contact section (TBD-safe).
- **Menu `/menu`**: category tabs or a sticky category bar, Cairo Crunch always first and visually highlighted. Deals reachable from the menu.
- **Checkout `/checkout`**
- **Shared:** header with logo and cart button, footer. The root layout owns the only `<main>`; pages render their content inside it and must not add their own. The header height is `--header-height` in `globals.css` (also the `scroll-padding-top`); anything sticky below the header offsets by it. The menu page's category bar height is `--category-bar-height`, defined beside it; menu sections add it to their `scroll-margin-top`. The cart button is in the header's actions group after the Menu link; the cart drawer and the mobile cart bar are mounted in the root layout after the footer.
- Use the Next.js `metadata` API for title and description. The root layout sets the default title and the template `%s | Drippin Bites Cafe`, so a page exports only its own short `title`.

## 8. Brand and design

Style, from the posters in `docs/brand/` and the printed menu in `docs/menu-reference/`:

- Near-black warm background with a subtle vignette.
- Gold accent; cream text on dark, and cream cards with dark text.
- Navy-blue rounded price tags with white text (printed menu). The menu labels "Authentic" in navy and "Lahori Twist" in red.
- Bold condensed uppercase headings, stacked in two colours: first line cream, second line gold.
- Thin gold rules with a small diamond ornament in the centre; gold-outlined pill labels ("CAIRO CRUNCH", "Now at Drippin Bites").
- Faint decorative details in corners: dot grids, wavy line patterns, a palm-leaf shadow.
- Moody, dark food photography: dark plate, dark surface, warm side light.

Starting colour tokens:

| Token | Value |
|---|---|
| background | `#14100C` |
| gold | `#EBA92B` |
| cream | `#F3E6CC` |
| navy | `#1B2A6B` |

- Set these as the shadcn theme CSS variables in `app/globals.css` (`--background`, `--foreground`, `--primary` = gold, `--card`, etc.) so every component is on-brand. Don't style components one by one with ad-hoc colours.
- The site is **dark-only**, no light-mode toggle. The brand values live in `:root` in `globals.css`; there is no `.dark` block. `<html>` carries a static `dark` class so the `dark:` variants in shadcn components apply.
- Beyond the shadcn variables, `globals.css` defines `gold`, `cream`, `navy`, `brand-red`, `veg` and `card-muted-foreground` as Tailwind colours. `navy`, `brand-red` and `veg` are fills with white text, not text colours. On cream cards use `text-card-muted-foreground` instead of `text-muted-foreground`, and never gold text.
- Fonts via `next/font`: **Anton** for headings (`--font-display`, mapped to `--font-heading`) and **Figtree** for body (`--font-body`, mapped to `--font-sans`). Anton has one weight; don't set a font weight on headings.
- Heading sizes come from the `heading-hero`, `heading-section` and `heading-card` utilities in `globals.css`, normally through `BrandHeading`. Don't add `--text-*` theme sizes: `cn` reads an unknown `text-*` class as a colour and merges it away.
- Text contrast must stay readable: cream on dark, dark text on cream cards.

## 8a. Design quality bar

- For all UI work, use the installed `frontend-design` skill alongside section 8.
- The bar: the site must feel like a premium street-food brand, as considered as the posters in `docs/brand/`, not a template.
- **Food is the hero:** large product images with a soft gold radial glow behind each transparent cutout. No small thumbnails in plain boxes.
- **Poster-style type:** large headings on a clear size scale (hero > section > card > body), using section 8's two-colour treatment for headlines.
- **Spacing:** generous and consistent, never cramped on mobile.
- **Depth:** grain, warm gradients and soft shadows. Use section 8's diamond rules and pill labels as section dividers.
- **Motion:** subtle hover and press feedback, 150–300ms transitions, gentle reveal on scroll. Respect `prefers-reduced-motion`. CSS/Tailwind only; no new animation library without asking.
- **Avoid the default shadcn look:** grey borders, flat identical boxes, default radius everywhere, plain grey surfaces. Restyle components with brand tokens.
- **Design every state:** empty cart, missing image, TBD contact details, form errors, success.
- Check at 375px width first, then desktop. Card grids align, and prices never wrap awkwardly.
- Every spec's "UI & design" section must describe the visual treatment specifically, and `/verify-spec` checks it.

## 9. Images and logos

- `public/images/` is the **only** source of images used in the app. `menu.json` paths like `/images/...` point there.
  - `cairo/` (12): `hawawshi`, `faroge`, `ful-authentic`, `ful-lahori`, `tamaya-authentic`, `tamaya-lahori`, `sando-sandwich`, `croissant-sandwich`, `cairo-sides`, `cairo-drinks`, `cairo-combo`, `cairo-dips`. Hawawshi and Faroge have one image for both versions; both sides share `cairo-sides`, both drinks share `cairo-drinks`.
  - `categories/` (8): `pizza-classic`, `pizza-special`, `pizza-premium`, `burgers`, `sandwiches`, `wraps`, `pasta`, `dips`.
  - `deals/` (16): `deal-01` … `deal-16`.
- All are 800×800 WebP with **transparent backgrounds** and **inconsistent padding/scale. This is accepted; do not try to fix or reprocess them.** Always render with `next/image` inside a fixed-size box using `object-contain`, so cards line up.
- Items without their own image (all pizzas, burgers, sandwiches, wraps, pasta, dips) use their category image. Image lookup order: variant → item → category.
- `docs/menu-reference/` and `docs/brand/` are **visual reference only**:
  - `docs/brand/poster-*.jpeg`: typography and layout style
  - `docs/brand/photo-tamaya-sandwich.jpeg`: photo mood
  - `docs/menu-reference/*.jpeg`: printed menu pages, for menu structure

  Never import, link or copy from `docs/`. If an image is needed that isn't in `public/images/`, ask.
- Logos in `public/`:
  - `logo.svg`: horizontal, for header and footer
  - `logo-stacked.svg`: for hero/splash
  - `logo-mark.svg`: the icon; `app/icon.svg` is an identical copy used as the favicon

  All are for **dark backgrounds only** (the "DRIPPIN" text is cream `#F3E6CC`).
## 10. Content conventions

- Use the spelling in `menu.json`. It is already corrected from the printed menu.
- Items or variants tagged `new` get a "NEW" badge; those tagged `veg` get a small veg indicator.
- Copy tone: short, confident, food-focused. English only.

## 11. Code conventions

- TypeScript strict mode. Define the menu JSON types in one file (e.g. `types/menu.ts`) and use them everywhere.
- Keep pricing and cart logic in plain functions, separate from components.
- Server components by default. Use `"use client"` only where interactivity requires it.
- Keep components small and in sensible folders. Don't create new top-level folders without a reason.
- Shared components stay in `components/<purpose>/` (like `components/brand/` and `components/layout/`). shadcn primitives stay in `components/ui/`.
- A component used by only one route lives next to that route's `page.tsx` (e.g. `app/menu/category-bar.tsx`). If another route starts using it, move it to `components/<purpose>/` and update the imports in the same change.
- `page.tsx` mainly reads data through `lib/menu.ts` and arranges components. No large blocks of UI, form logic or interactive state directly in it. Split pages into small, focused components with one clear responsibility.
- Put client interactivity in the smallest component that needs it, so `page.tsx` stays a server component.
- Accessible labels on icon buttons, visible focus states, tap targets at least 44px.

## 12. Workflow rules

- Before large changes, briefly state the plan, then implement.
- After changes, run `npm run lint` and `npm run build` and fix errors.
- Features are verified with `/verify-spec <number>` (using the read-only `spec-verifier` agent) before they're marked `Implemented`.
- Don't install new dependencies without saying why.
- If something in `menu.json` seems wrong or ambiguous, ask instead of guessing.

## 13. Forms and validation

- All forms and validation use **react-hook-form** (7.x) + **zod** (**v4**). Check `package.json` for the exact versions and follow the matching API; zod v3 and v4 differ.
- Connect them with `zodResolver` from `@hookform/resolvers` (5.x, installed). If it is ever missing, say so before installing it.
- Build forms with shadcn's form components, not raw unstyled inputs. None are added yet; the registry has `form` and `field`, so add what's needed with `npx shadcn add <name>`.
- Define each zod schema once, in `lib/validations/`, and derive the TypeScript types with `z.infer`. Don't write separate interfaces for form data.
- Show error messages inline under each field, in short plain English.
- Don't use any other form or validation library, and don't write manual validation logic.

## 14. Spec roadmap

Each feature gets one numbered spec in `.claude/specs/`. Build in this order.

| # | Spec | Scope | Depends on | Status |
|---|------|-------|------------|--------|
| 01 | `01-project-setup` | Remove scaffold leftovers (placeholder page, unused `public/*.svg`, `app/favicon.ico`); add `.env.example` and the `.gitignore` exception; lint and build pass. Scaffold, shadcn init and form libraries already exist. | — | Implemented |
| 02 | `02-brand-theme` | Brand colour tokens as shadcn CSS variables, dark-only, display + body fonts, shared brand primitives (two-colour heading, gold rule with diamond, pill label). | 01 | Implemented |
| 03 | `03-menu-data-helpers` | `types/menu.ts`, typed access to `menu.json`, lookups (size labels, add-on groups, image fallback, tags), TBD-safe values, `Rs. 1,599` formatter. | 01 | Implemented |
| 04 | `04-site-layout` | Root layout, header with logo, footer with TBD-safe contact details, favicon, `metadata`. Logos and `app/icon.svg` already exist. | 02, 03 | Implemented |
| 05 | `05-item-cards` | Product image in a fixed `object-contain` box; display-only item card with name, description, price tag, "NEW" badge, veg indicator. | 02, 03 | Implemented |
| 06 | `06-menu-page` | `/menu` with sticky category bar, Cairo Crunch first and highlighted, all categories with item cards, `sides` / `drinks` sub-groups, a Deals entry in the bar. | 04, 05 | Implemented |
| 07 | `07-cart-store` | Zustand store with safe `persist`, cart line model (items, combos, deals), line identity, plain pricing functions. Installs Zustand. | 03 | Implemented |
| 08 | `08-cart-drawer` | `Sheet` with lines, quantity controls, remove, subtotal, delivery note, empty state, link to checkout; header cart button and sticky mobile cart button. | 04, 07 | Implemented |
| 09 | `09-item-customiser` | Shared add-to-cart surface opened from an item card: quantity, live total, Add to cart. Handles single-variant items end to end. | 05, 06, 07, 08 | Implemented |
| 10 | `10-pizza-size-selection` | Required size choice in the customiser, showing only the sizes in that pizza's `variants`. | 09 | Implemented |
| 11 | `11-cairo-version-toggle` | Authentic / Lahori Twist `ToggleGroup` that swaps name, description, price, tags and image. | 09 | Implemented |
| 12 | `12-dips-pickers` | One data-driven add-on picker for `cairo-dips` (first free, then `extraPrice`) and `dips` (per-option `price`), respecting `maxSelect`. | 09 | Implemented |
| 13 | `13-cairo-combo-builder` | Step-by-step combo picker (main → fixed fries → drink), Loaded upgrade, combo dips, add to cart. | 11, 12 | Implemented |
| 14 | `14-deals` | Deal cards in the menu's Deals section; picker for `choose` lines (pizza flavour by `from` + `size`, soft drink, one selection per `qty`); add to cart as a bundle. | 06, 07, 09 | Stub |
| 15 | `15-home-hero-cairo-feature` | `/` hero (Tamaya image, dark gradient, gold glow, headline, "Order Now") and the featured Cairo Crunch section. | 04, 05 | Stub |
| 16 | `16-home-sections` | Rest of `/`: category shortcuts, deals preview, TBD-safe location/contact section. | 14, 15 | Stub |
| 17 | `17-checkout-form` | `/checkout` with order summary and the form (order type, name, phone, address, notes) per section 13; empty-cart state. | 07, 08 | Stub |
| 18 | `18-whatsapp-order` | Plain-text message builder, `wa.me` link, missing-env-var message, clear the cart only after the customer confirms sending. | 17 | Stub |
| 19 | `19-responsive-accessibility-polish` | Final pass on all pages: mobile widths, 44px tap targets, focus states, icon-button labels, contrast, card alignment. | 01–18 | Stub |
| 20 | `20-share-preview` | Generated Open Graph image (`opengraph-image.tsx` with logo + brand colours), Apple touch icon and `metadataBase`, once the demo URL is known. | 04 | Stub |

- Statuses are `Stub` (not built yet) or `Implemented` (built and verified against its acceptance criteria).
- Create a spec with `/create-spec <number> <name>` using the number and slug from this table.
- After a spec is implemented and verified, update its status in this table.
- New features get the next free number. Don't renumber existing specs.

## Open questions

From `menu.json` → `openQuestions`, still unconfirmed by the owners:

1. Deal 12 shares the name "The Big Drip" with deal 1 (stored as "The Big Drip II", with `printedName` holding the original).
2. Which pizza flavours can be chosen in deals: classic only, or any? Assumed classic unless the deal says premium or names a flavour.
3. Which soft drinks are available in deals.
4. Are deal-only items (nuggets, wings, shakes, mocktails, lava cake, etc.) sold separately, and at what price?
5. Do Cairo dips apply to the Sando and Croissant sandwiches too? Currently only pockets/wraps and the Cairo Combo.
6. Confirm the "Lemonata" spelling in deal 15.
7. Mushroom Burger and Chmicow Beef Burger have very similar descriptions; confirm.
8. Address, WhatsApp number, phone, opening hours, delivery areas and fees.
9. Deal 7: only Afghani Malai Boti has a small premium size — confirm which small premium pizzas exist.
10. What does the Loaded combo upgrade include?

Also assumed in the combo's `_notes`: the Cairo Combo accepts all 8 pockets/wraps at the same Rs.749, and its drink is a Cairo drink.
