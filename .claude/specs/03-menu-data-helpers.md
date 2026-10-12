# Spec 03: Menu Data Helpers

**Status:** Implemented
**Depends on:** 01

## Summary

Give the app one typed doorway into `data/menu.json`: the menu types, a single typed import of the file, and a small set of plain lookup functions (size labels, add-on groups, image fallback, tags, deal and combo references), plus the `Rs. 1,599` formatter and TBD-safe contact values. Every later spec (cards, menu page, cart, combo, deals, checkout) reads the menu through these, so prices and names are never hard-coded and the awkward parts of the data (two levels of `addOnGroups`, tags on items and variants, three-step image fallback) are solved once.

## Goals

- Define every `menu.json` shape once in `types/menu.ts` and use those types everywhere.
- Import `data/menu.json` in exactly one module and expose it typed; no other file imports the JSON directly.
- Provide plain, pure lookup functions that work in both server and client components.
- Provide one shared price formatter that produces `Rs. 1,599`.
- Provide one TBD check so `restaurant.address`, `whatsapp`, `phone` and `hours` never render the literal text "TBD".
- `npm run lint` and `npm run build` pass.

## Out of scope

- Any visible UI. No component, page or style is added or changed; `app/page.tsx` keeps its hard-coded holding text and is replaced in spec 15.
- Cart line model, line identity and **pricing of a selection** (first Cairo dip free then `extraPrice`, per-option dip prices, combo `upgrades`, line totals, subtotal). Those are spec 07, with the picker rules in spec 12. This spec only resolves which groups, options and prices exist.
- Enforcing ordering rules (`maxSelect`, required size, one selection per `qty`). Specs 10, 12, 13, 14.
- Product image box, price tag, "NEW" badge and veg indicator components (spec 05). This spec returns the image path and tag list they will render.
- Checking that an image file exists on disk, and the missing-image visual state (spec 05).
- Reading `NEXT_PUBLIC_WHATSAPP_NUMBER` (spec 18). `restaurant.whatsapp` is only a contact-display value.
- Labels for `restaurant.orderTypes` (spec 17).
- Editing `data/menu.json`, including to fix anything in Open questions.
- Installing packages. Zustand arrives in spec 07.
- Future phases from CLAUDE.md section 3: backend, database, auth, payments, WhatsApp Cloud API, admin dashboard, videos. The menu stays a static JSON import, not a fetch.
- Tests of any kind.

## User flow

No customer-facing change. `/` looks exactly as it does after spec 02. The "user" of this spec is the developer of specs 04–18, who can now:

1. Import the typed menu and iterate `categories` in file order (Cairo Crunch first).
2. Ask for an item's display name, description, image, tags, variant label and add-on groups without knowing where in the JSON each one lives.
3. Format any price the same way.
4. Read a contact value and get either a real string or "nothing to show".

## UI & design

This spec adds no UI, so there is no layout, component or visual treatment to describe. It does fix a few things that later UI depends on:

- **Price text** is always `Rs. 1,599`: the prefix `Rs.`, one space, comma thousands separators, no decimals. The grouping is fixed, not taken from the device locale, so the server-rendered and client-rendered text are identical and a phone set to another locale still shows `1,599`.
- **TBD values** come back as "no value", never as the string `"TBD"` and never as an invented number or address. The neutral wording shown in their place (footer in spec 04, location section in spec 16) is those specs' decision.
- **Image paths** are returned as the `/images/...` strings from the JSON, ready for `next/image`. Every item resolves to a path because every category has an `image`.
- **Tags** come back as one de-duplicated list, so the "NEW" badge and veg indicator in spec 05 check a single place.
- No shadcn components, no brand tokens, no responsive behaviour, no loading or error states, no accessibility surface.

## Data

Everything is read from `data/menu.json`; nothing is written to it.

### Types (`types/menu.ts`)

One type per shape, with literal unions where the JSON uses a closed set of values:

- **Restaurant:** `name`, `shortName`, `tagline`, `area`, `address`, `whatsapp`, `phone`, `hours`, `currency`, `orderTypes` (`delivery` | `takeaway` | `dine-in`).
- **Size:** `{ id, label }`, id one of `small` | `medium` | `large` | `xl`.
- **Add-on group:** `{ id, name, description, image?, freeCount, extraPrice?, maxSelect, options[] }`; option `{ id, name, price? }`. `cairo-dips` options have no `price` and the group has `extraPrice: 70`; `dips` options each have a `price` and the group has no `extraPrice`.
- **Category:** `{ id, name, image, items[], subtitle?, tagline?, featured?, variantType?, addOnGroups? }`.
- **Item:** `{ id, name, variants[], subtitle?, description?, image?, tags?, group?, variantType?, addOnGroups? }`. `group` is `sides` | `drinks`. `description` is optional: the eight items in the `dips` category have none.
- **Variant:** `{ id, price, label?, name?, description?, image?, tags? }`. Pizza variants carry only `id` and `price`.
- **`variantType`:** `size` | `version`. **Tag:** `new` | `veg`.
- **Combo:** `{ id, name, description, image, price, upgrades[], slots[], addOnGroups? }`; upgrade `{ id, label, price }`; a slot is one of two shapes, `{ id, label, options[] }` or `{ id, label, fixed }`, where each reference is `{ itemId, variantId }`.
- **Deal:** `{ id, number, name, price, image, contents[], printedName? }`. A `contents` line is one of three shapes, told apart by `choose`:
  - `choose: "pizza"` with `qty`, `label`, `from` (category ids) and `size`
  - `choose: "soft-drink"` with `qty` and `label`
  - no `choose`: `qty` and `label` only
- **Soft drinks:** `{ options: string[] }`.
- **Menu:** the root object with `restaurant`, `sizes`, `addOnGroups`, `categories`, `combos`, `deals`, `softDrinks`, `openQuestions`.
- `_notes` (root, `combos[0]`, `softDrinks`) is typed as optional and never read. `openQuestions` is typed but not used by any helper.
- Category, item, variant, deal and add-on ids are plain `string`, not literal unions, so `menu.json` can change without a type edit.

### Typed access (`lib/menu.ts`)

- The only module that imports `@/data/menu.json` (`resolveJsonModule` is already on in `tsconfig.json`). It asserts the import to the `Menu` type once and exports the typed data.
- TypeScript infers JSON string fields as `string`, so the literal unions above cannot be checked against the file by the compiler; the assertion is a statement of trust. Decided: there is no runtime validation of the file, because it is static, hand-checked and never edited without being asked.
- No `"use client"` and no `server-only`: the module is used by server components (menu page) and client components (customiser, cart) alike.

### Lookups (`lib/menu.ts`)

All pure functions over the typed data. An unknown id returns `undefined`; nothing throws.

| Lookup | Rule | Example from the file |
|---|---|---|
| Category by id, item by id | Item ids are unique across all 54 items, so an item is found without its category; the result also gives the owning category. | `drippin-special-pizza` → in `premium-pizza` |
| Featured category | The category with `featured: true`. | `cairo-crunch` |
| Items by `group` | Split a category's items into ungrouped, `sides`, `drinks`, keeping file order. | Cairo Crunch: 6 / 2 / 2 |
| Effective `variantType` | Item's own, else the category's, else none. | `hawawshi` → `version`; `tikka` → `size`; `zinger-burger` → none |
| Variant by id, default variant | Default is the first entry in `variants`. | `ful` → `authentic`; `lasagna` → `large` |
| Variant label | For `size` items, the `sizes` label for the variant id; otherwise the variant's `label`. | `xl` → "Extra Large"; `lahori` → "Lahori Twist"; `tamaya-bites` → "6 pcs" |
| Display name | Variant `name`, else item `name`. | `hawawshi` + `lahori` → "Lahori Tikka Hawawshi" |
| Display description | Variant `description`, else item `description`, else none. | `chipotle-sauce` → none |
| Image | Variant `image` → item `image` → category `image`. | `ful` + `lahori` → `ful-lahori.webp`; `hawawshi` + `lahori` → `hawawshi.webp`; `tikka` → `pizza-classic.webp` |
| Tags | Item `tags` plus the variant's `tags`, de-duplicated. Without a variant, item tags only. | `ful` + `authentic` → `veg`; `ful` + `lahori` → none; `hot-dragon` → `new` |
| Lowest price | The smallest `price` in an item's variants, and whether the item has more than one price. It lives here, not in spec 05; the card wording around it ("From Rs. 499") is spec 05's. | `tikka` → 499, several; `tamaya` → 499, one price |
| Add-on groups for an item | Item-level ids plus category-level ids, de-duplicated, resolved to full group objects. | `hawawshi` → `cairo-dips`; `zinger-burger` → `dips`; `sando-sandwich`, pizzas, pasta → none |
| Add-on groups for a combo | The combo's `addOnGroups` ids resolved the same way. | `cairo-combo` → `cairo-dips` |
| Resolve an item reference | `{ itemId, variantId }` → item, variant and category. | combo `side` slot → Cairo Fries, `regular` |
| Combo by id, deal by id | Direct lookups in `combos` and `deals`. | `cairo-combo`, `deal-01` |
| Pizza options for a deal line | Items in the line's `from` categories that have a variant whose id equals the line's `size`, each with that variant. | `classic-pizza` + `large` → 9; `premium-pizza` + `large` → 5; `premium-pizza` + `small` → 1 |
| Soft drink options | `softDrinks.options`. | 6 flavours |

### Formatting and TBD (`lib/format.ts`)

- **Price formatter:** integer PKR in, `Rs. 1,599` out. `0` gives `Rs. 0`; showing the word "Free" for a free dip is a UI decision in spec 12. The prefix is the fixed text `Rs.`; `restaurant.currency` (`"PKR"`) is not used for display.
- **TBD check:** a string that is `"TBD"` (any case, surrounding whitespace ignored) or empty counts as missing and yields no value; anything else is returned trimmed. Applied to `restaurant.address`, `whatsapp`, `phone` and `hours`, exposed as one "contact details" lookup so callers cannot forget the check.

### Cart state, env vars, zod

- **Cart state:** none.
- **Env vars:** none.
- **Zod schemas:** none. CLAUDE.md section 13 scopes zod to forms in `lib/validations/`, and the menu is not validated at runtime.

## Implementation outline

Files to create:

- `types/menu.ts`: all menu types. New top-level folder, as CLAUDE.md section 11 names it.
- `lib/menu.ts`: the single typed import of `data/menu.json` and the lookup functions.
- `lib/format.ts`: the price formatter and the TBD check.

Files to modify:

- `CLAUDE.md`: after verification, set spec 03 to `Implemented` in the roadmap and mention the new files in the "Current state" bullet of section 1.

Files that stay as they are: `data/menu.json`, `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `lib/utils.ts`, `tsconfig.json`, `next.config.ts`, `package.json`, `package-lock.json`, everything under `components/`, `public/` and `docs/`.

Order of work:

- Types first, written against the real file, including the two slot shapes and three deal-line shapes.
- The typed import and the basic lookups (category, item, variant, sizes).
- The resolving lookups (name, description, image, tags, add-on groups, references, deal pizza options).
- The formatter and TBD check.
- A temporary render on `app/page.tsx` that prints the checks in Verification, compared by eye, then removed completely: `git diff app/page.tsx` must print nothing before the work is finished.
- `npm run lint`, `npm run build`, then the CLAUDE.md update.

## Edge cases

- **`dips` is two different things:** a category id and an add-on group id. Lookups must not share one id map across categories and add-on groups.
- **Dip item ids vs dip option ids:** the category sells `chipotle-sauce`; the add-on group lists `chipotle`. They are the same sauce at the same price but are not linked in the data. Nothing here tries to link them.
- **Missing sizes:** `lasagna` has only `large` and `xl`; four special/premium pizzas start at `medium`. The default variant is therefore not always `small`, and a deal's pizza list must filter by the exact `size`.
- **A size id not in `sizes`:** the label falls back to the variant's own `label`, then to its id, instead of rendering `undefined`.
- **`Regular` labels:** every single-variant item has a variant labelled "Regular" (or "6 pcs"). The label is returned as stored; whether to print "(Regular)" in the cart or WhatsApp message is decided in specs 08 and 18. The "more than one price" flag from the lowest-price lookup lets them tell.
- **Same price on both versions:** `tamaya` is Rs.499 for both variants, so "has several variants" and "has several prices" are different questions. Card wording ("From Rs. 499") is spec 05's.
- **Tags on a variant only:** `veg` on Ful and Tamaya sits on the `authentic` variant, not the item. A caller that passes no variant gets no `veg` tag; cards should pass the default variant.
- **Item with no description:** the eight `dips` items. The description lookup returns nothing, not an empty string that renders a blank line.
- **Add-on group id that doesn't exist:** skipped silently when resolving, so a typo in the JSON cannot crash a page.
- **Broken `{ itemId, variantId }` reference:** resolves to `undefined`; the combo builder (spec 13) decides how to show it.
- **A `choose` line with exactly one option:** deal 7's "Premium Small Pizza" (`premium-pizza` at `small`) matches only `afghani-malai-boti`, because no other premium pizza has a `small` variant. The lookup returns what the data says, a list of one, and does not widen it. Spec 14 should auto-select a `choose` line when it has exactly one option instead of asking the customer to pick. Which small premium pizzas really exist is an owners' question, recorded in CLAUDE.md's Open questions.
- **Deal lines without `choose`:** label-only, many naming things that exist nowhere else in the file (nuggets, shakes, "Small Afghani Malai Boti Pizza" in deal 12). They must not be matched against items by name.
- **`add-on group description` text:** `cairo-dips` carries "1 free, each additional Rs.70", a hand-written string in a different price format. It is data and is passed through untouched; computed prices use the formatter.
- **Formatter input:** prices in the file are positive integers up to 4,399; sums in a cart can pass 10,000 and must still group correctly (`Rs. 12,345`).
- **Bundle size:** client components that import `lib/menu.ts` pull the whole JSON (about 25 KB) into the client bundle. Accepted for the demo.
- **Cache Components:** the menu is a static import, not a request-time read, so it needs no `"use cache"` and adds no dynamic boundary.
- **`AGENTS.md`:** `next dev` rewrites it; commit it with the work if it changes.

## Acceptance criteria

- [x] `types/menu.ts` exists and exports a type for each shape listed under Data, including the root menu type, with no `any`.
- [x] Order types, size ids, `variantType`, tags, item `group` and deal `choose` are literal unions; combo slots and deal content lines are unions of their distinct shapes.
- [x] `data/menu.json` is imported in exactly one file, `lib/menu.ts`; a repo search (excluding `node_modules`, `.next`, `.claude/`, `CLAUDE.md`) finds no other import of it.
- [x] `lib/menu.ts` and `lib/format.ts` contain no `"use client"`, no `server-only` import, no React import and no JSX.
- [x] No price, item name or description from the menu is written as a literal in `types/menu.ts`, `lib/menu.ts` or `lib/format.ts`.
- [x] The typed data exposes 9 categories in file order with `cairo-crunch` first, 54 items in total, 1 combo and 16 deals.
- [x] The price formatter returns `Rs. 1,599` for 1599, `Rs. 499` for 499, `Rs. 0` for 0 and `Rs. 12,345` for 12345, with the same output on server and client.
- [x] The contact-details lookup returns no value for `address`, `whatsapp`, `phone` and `hours` with the current file, and the string "TBD" cannot reach a caller through it.
- [x] Variant label: `xl` on a pizza gives "Extra Large"; `lahori` on `hawawshi` gives "Lahori Twist"; `regular` on `tamaya-bites` gives "6 pcs".
- [x] Display name and description for `hawawshi` + `lahori` are "Lahori Tikka Hawawshi" and its variant description; for `zinger-burger` they are the item's own; the description for `chipotle-sauce` is empty/absent.
- [x] Image lookup returns `/images/cairo/ful-lahori.webp` for `ful` + `lahori`, `/images/cairo/hawawshi.webp` for `hawawshi` + `lahori`, and `/images/categories/pizza-classic.webp` for `tikka`.
- [x] Tags: `ful` + `authentic` includes `veg`; `ful` + `lahori` does not; `sando-sandwich` includes `new`; `tamaya-bites` includes `veg`.
- [x] Add-on groups: `hawawshi` resolves to the `cairo-dips` group object; `zinger-burger`, `bbq-sandwich` and `grilled-wrap` to `dips`; `sando-sandwich`, `tikka` and `alfredo-pasta` to none; `cairo-combo` to `cairo-dips`.
- [x] Effective `variantType` is `version` for `hawawshi`, `size` for `tikka` and none for `zinger-burger`.
- [x] Lowest price for `lasagna` is 1649 and for `tikka` 499; the default variant of `lasagna` is `large`.
- [x] Cairo Crunch items split into 6 ungrouped, 2 `sides` and 2 `drinks`, in file order.
- [x] The combo's `side` slot reference resolves to Cairo Fries / `regular`, and all 8 `main` options and both `drink` options resolve to an item and variant.
- [x] Deal pizza options: `classic-pizza` at `large` gives 9 items, `premium-pizza` at `large` gives 5, `premium-pizza` at `small` gives 1 (`afghani-malai-boti`).
- [x] Unknown category, item, variant, deal or add-on group ids return `undefined` and do not throw.
- [x] `data/menu.json`, `app/page.tsx`, `package.json` and `package-lock.json` are unchanged.
- [x] `npm run lint` exits with no errors or warnings.
- [x] `npm run build` completes successfully.

## Verification

No automated tests (per CLAUDE.md).

- `npm run lint` passes.
- `npm run build` passes (this is also the type check for the new files).
- `git status` shows only: `types/menu.ts`, `lib/menu.ts`, `lib/format.ts` added; this spec; `CLAUDE.md` once the status is updated (and `AGENTS.md` only if `next dev` rewrote it). `app/page.tsx` shows no diff.
- Temporary check, then removed: render the helper outputs on `app/page.tsx` with `npm run dev` and compare each against the acceptance criteria and against `data/menu.json`:
  - category count and order, item count, deal and combo counts
  - the four formatter outputs
  - the contact-details result (all four missing)
  - label, name, description, image and tags for `hawawshi` + `lahori`, `ful` + both versions, `tikka` + `xl`, `tamaya-bites`, `chipotle-sauce`
  - add-on groups for `hawawshi`, `zinger-burger`, `sando-sandwich`, `tikka`, `cairo-combo`
  - combo slot references and the three deal pizza-option counts
  - an unknown id for each lookup
- With that temporary output on screen, view it at 375px width and at desktop width: no hydration warning in the console (the formatter output matches on server and client) and no errors in the dev-server terminal.
- After removing the temporary render: `git diff app/page.tsx` prints nothing, and `/` at 375px and desktop looks exactly as it did after spec 02, with no console errors.

## Open questions

None. The four questions from the first draft were answered on 2026-10-13 and are folded into the sections above: no runtime validation of `menu.json`; the deal 7 lookup returns the single option the data gives, with the owners' question recorded in CLAUDE.md; verification through a temporary render on `app/page.tsx` that leaves no diff; and the lowest-price lookup stays in this spec.
