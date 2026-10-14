# Spec 17: Checkout Form

**Status:** Implemented
**Depends on:** 07, 08 (and 02 for the brand primitives, 03 for `lib/menu.ts`, 04 for the layout and `metadata` template, 16 for `ORDER_TYPE_LABELS`)

## Summary

Build `/checkout`, the page the cart drawer's Checkout link has pointed at since spec 08. It has a read-only summary of the order and a react-hook-form + zod form that asks for the order type, name, phone, address (delivery only) and optional notes, with short inline errors and the phone number normalised to `923xxxxxxxxx`. For the pitch, this is the step that replaces the owners' manual WhatsApp back-and-forth: the customer is asked for every detail once, in a clear order, so spec 18 can turn it into one complete WhatsApp message.

## Goals

- A `/checkout` route: a server `page.tsx` that exports `metadata` (`title: "Checkout"`) and arranges small components. It has no `<main>` of its own.
- Three page states, all designed: **loading** (before the cart store's `hydrated` flag is set), **empty cart**, and **order + form**.
- An **order summary** built from `getLineSummary` (`lib/cart/summary.ts`). It shows each line's quantity, title, variant tag, details and line total, then the subtotal from `getSubtotal` and `DELIVERY_NOTE`. It is read-only, with an "Edit order" button that opens the existing cart drawer.
- A **checkout form** on react-hook-form 7 + zod 4 through `zodResolver`, built from shadcn's `field`, `input` and `textarea` components, restyled with brand tokens:
  - **Order type:** required, one of `restaurant.orderTypes`, labelled through `ORDER_TYPE_LABELS`, shown as radio tiles. Nothing is preselected (decided 2026-10-14).
  - **Name:** required.
  - **Phone:** required, Pakistani mobile. It accepts `03xxxxxxxxx` and normalises to `923xxxxxxxxx`.
  - **Address:** shown and required only for delivery.
  - **Notes:** optional.
- One zod schema in `lib/validations/checkout.ts`, with the TypeScript types derived from it (`z.infer`, plus `z.input` for the form's raw values). There are no hand-written form interfaces and no manual validation.
- Short, plain-English errors under each field, shown after submit and then updated as the customer corrects them. Focus goes to the first invalid field.
- A "Send Order on WhatsApp" submit button. A valid submit only calls the submit handler with the parsed, normalised details; spec 18 fills that handler in and is built immediately after this spec (decided 2026-10-14).
- `prefetch={false}` comes off the drawer's Checkout link, now that the route exists.
- Mobile-first: one column at 375px, and two columns (form + sticky summary) from `lg`.
- `npm run lint` and `npm run build` pass. `/checkout` prerenders as static, because everything cart-dependent is client-side.

## Out of scope

- **Spec 18:** building the WhatsApp message, the `wa.me` link, reading `NEXT_PUBLIC_WHATSAPP_NUMBER`, the missing-env-var message, the "Did you send it?" confirmation and clearing the cart. This spec does not read the env var and never clears the cart.
- Editing quantities or removing lines on the page itself. The summary is read-only, and changes go through the existing drawer.
- Saving the form's values (localStorage, sessionStorage, the cart store) or keeping them across a reload or a trip back to the menu.
- Delivery fee, delivery areas, minimum order, tax, discounts, promo codes, estimated times, scheduled orders. Extra dine-in fields (table number, party size, arrival time): dine-in asks for the same details as takeaway (decided 2026-10-14). The subtotal is the only figure, followed by `DELIVERY_NOTE`.
- Address autocomplete, a map, geolocation, a delivery-area check.
- Phone verification (OTP), email, accounts or saved addresses. Future phases from CLAUDE.md section 3: backend, auth, payments, WhatsApp Cloud API, admin dashboard, videos.
- Landlines and non-Pakistani numbers. Only mobiles (`03…`, `+92 3…`, `923…`) are accepted, because WhatsApp needs one (decided 2026-10-14).
- A delivery-area check. The address stays free text; delivery areas remain an owners' question (open question 8 in CLAUDE.md).
- Any change to the cart model, pricing, `getLineSummary`, the customiser or `menu.json`. Installing packages beyond the shadcn components named here. Tests.

## User flow

On a phone, with three lines in the cart:

1. They tap "Checkout" in the drawer (or in a link elsewhere). The drawer closes and `/checkout` opens. The mobile "View cart" bar is not shown here (spec 08 already hides it on `/checkout`).
2. Top of the page: a gold rule and the heading "PLACE YOUR / ORDER", with a short line under it ("Fill in your details and we'll take it from here on WhatsApp.").
3. **Your order:** a dark card listing the three lines, e.g. "2 × Hawawshi" with the navy "Authentic" tag, its dips indented below and "Rs. 1,640" at the right. Then "Subtotal Rs. 4,187", the delivery note with the truck icon, and an "Edit order" text button.
4. They tap "Edit order". The cart drawer opens over the page. They raise a quantity and close it, and the summary and subtotal on the page update straight away.
5. **How do you want it?** Three tiles in a row: Delivery, Takeaway, Dine-in, each with an icon. Nothing is chosen yet.
6. They tap "Submit" without filling anything in. The page scrolls to the order-type tiles and focuses them. Errors show under each field: "Choose delivery, takeaway or dine-in.", "Enter your name.", "Enter your phone number."
7. They choose Delivery. An **Address** textarea appears under the phone field, and the order-type error clears.
8. They type the name "Ali" and the phone "0300 1234567". They tab out of the phone field; it is valid, so no error shows. A mistyped "030012" shows "Enter a mobile number like 03001234567."
9. They type an address and an optional note ("Extra napkins please").
10. They switch to Takeaway. The address field disappears; what they typed is kept but no longer required or submitted. Back on Delivery, it is still there.
11. They submit. Everything is valid, so the parsed details (`orderType: "delivery"`, `phone: "923001234567"`, trimmed text, `address` present only for delivery) go to the submit handler that spec 18 fills in.

Empty cart: they open `/checkout` directly with nothing in the cart. Instead of the form, they see the same empty state as the drawer ("Nothing here yet", logo mark on a gold glow) with "Browse the Menu" linking to `/menu`.

## UI & design

Reference: `docs/brand/poster-*.jpeg` for headings, rules and pills; the cart drawer (`components/cart/cart-drawer.tsx`) and `SizePicker` for the tile and summary styling already in the app. Load the `frontend-design` skill when implementing. Nothing is imported from `docs/`.

### Page layout

- Site width (`max-w-6xl`), 16px side gutter at 375px and 24px from `sm`. Top padding about 40px at 375px and 64px from `md`, and about 64px / 96px before the footer.
- **Header block:** centred `GoldRule` → `BrandHeading` `h1`, `section` size, lead "Place Your", accent "Order" → one short muted line. It uses `reveal-on-scroll` like the other section headers.
- **Below `lg`:** one column, max width about 36rem and centred. Summary card first, then the form.
- **From `lg`:** two columns. The form is on the left (about 7/12), and the summary is on the right (about 5/12), `sticky` with `top` set to `var(--header-height)` plus a gap, so it stays in view while the form scrolls. Source order stays summary-then-form, and the columns are placed with grid order, so a screen reader reads the order first.

### Order summary (`app/checkout/order-summary.tsx`)

- A dark panel (`bg-secondary/60`, `rounded-2xl`, a `ring-1 ring-gold/20` edge, a soft gold radial glow in one corner, like the drawer's header), not a cream card. It sits on the dark page, with cream text.
- Heading row: a small uppercase gold label "Your order" (`h2`, the same style as the customiser's step headings) and `formatItemCount(count)` muted at the right.
- **Rows:** one per line. No images, to keep it compact on a phone; the drawer already shows them.
  - `{quantity} × {title}`, semibold, wrapping with `wrap-break-word`. The line total is on the right, bold, `tabular-nums`, `whitespace-nowrap`. If quantity > 1, "{unit} each" goes under it in muted `text-xs`.
  - The variant tag (`versionColors[variantId]` for Authentic / Lahori Twist, else the neutral secondary tag for pizza sizes) shows only when `hasMultipleVariants`, exactly as in `CartLine`.
  - `details` are indented in muted `text-[0.8125rem]`: "{qty} × " prefix where present, "Free" in gold for a price of 0, "+ Rs. 70" for a paid add-on, and deal `choices` in cream under their contents line. This is the same rendering as `CartLine`; extract the shared detail list rather than copying it (see Implementation outline).
  - Rows are separated by the same faded gold hairline the drawer uses.
- **Footer of the card:** the hairline, "Subtotal" (uppercase muted label) with the amount in `heading-card` gold at the right, then `DELIVERY_NOTE` with the lucide `Truck` icon, then a ghost "Edit order" button (lucide `Pencil`, at least 44px tall) that calls `useCartDrawerStore`'s `setOpen(true)`.
- Long carts: the card grows with the page; it does not get its own scroll area. At `lg`, where it is sticky, it gets `max-h` of the viewport minus the header, with the rows scrolling inside it and the subtotal block pinned at its bottom.

### Checkout form (`app/checkout/checkout-form.tsx`)

- `<form noValidate>` built from shadcn `Field` parts: `FieldSet` / `FieldLegend` for the order type, `Field` + `FieldLabel` + `Input`/`Textarea` + `FieldError` (+ `FieldDescription` for hints) for the rest. Section headings are small uppercase gold labels (the same as the summary's), and the fields are spaced about 20px apart.
- **Restyle `input` and `textarea`** in `components/ui/` with brand tokens, not per use:
  - a dark warm surface (`bg-secondary/60`) with a `ring-1 ring-gold/20` edge instead of a grey border, `rounded-xl`, cream text and muted placeholder;
  - height at least 48px (`h-12`) for inputs. The textarea starts at about 3 rows and grows with `field-sizing-content` up to a max height;
  - **`text-base` (16px) at every width**, so iOS Safari does not zoom on focus;
  - focus: `ring-2 ring-ring` with an offset to the background, the same as the buttons;
  - invalid (`aria-invalid="true"`): `ring-destructive`, the label stays cream, and the error text is `text-destructive` (`#f0705f`, 6.5:1 on the background) below the field;
  - disabled: lowered opacity, `cursor-not-allowed`.
- **Order type tiles:** `RadioGroup` / `RadioGroupItem` from `components/ui/radio-group.tsx`, styled like `SizePicker`'s tiles. There are three columns at every width, each tile at least 72px tall, with a lucide icon above the label: `Truck` for Delivery, `ShoppingBag` for Takeaway and `UtensilsCrossed` for Dine-in. When chosen, a tile is a gold fill with dark text. The labels come from `ORDER_TYPE_LABELS`, and the tiles follow `restaurant.orderTypes`. The group has the legend "How do you want it?", and its error shows under the row. When Delivery is chosen, `DELIVERY_NOTE` appears under the tiles as a `FieldDescription`.
- **Name:** label "Name", `autoComplete="name"`, `autoCapitalize="words"`, `enterKeyHint="next"`.
- **Phone:** label "Phone", `type="tel"`, `inputMode="tel"`, `autoComplete="tel"`, placeholder "03XX XXXXXXX", and the hint "We'll confirm your order on this number." The customer may type spaces or dashes.
- **Address** (delivery only): label "Delivery address", a `Textarea` with `autoComplete="street-address"`, and the hint "House, street, block and nearby landmark." It appears with a short height/opacity transition (200ms, none under `prefers-reduced-motion`). When another order type is chosen it unmounts, so it is out of the tab order and away from screen readers.
- **Notes:** label "Notes" with a muted "(optional)", a `Textarea`, placeholder "Allergies, extra napkins, landmarks…". There is a live character count against the maximum, muted, at the right below the field.
- **Submit:** a full-width primary gold pill, size `lg`, at the end of the form, reading "Send Order on WhatsApp" with the lucide `Send` icon. It is never disabled for invalid input; tapping it shows the errors. Under it, a muted line: "You'll review the message in WhatsApp before it's sent."
- **Error behaviour:** `mode: "onSubmit"`, `reValidateMode: "onChange"`. Errors appear only after the first submit and then update as the customer types. Each `FieldError` is tied to its control through `aria-describedby`, and the control gets `aria-invalid`. RHF's `shouldFocusError` focuses the first invalid field in visual order. The order-type group must pass its ref through so it can take focus.

### States

- **Loading** (`!hydrated`): the header block renders as normal. The summary card shows three stand-in rows like the drawer's `LoadingRows`, and the form area shows muted blocks of field height, so there is no flash of the empty state for someone with a saved cart. Everything is `aria-hidden`, with an `aria-busy` wrapper.
- **Empty cart** (`hydrated` with no summarisable lines): the drawer's empty state, centred on the page, with "Browse the Menu" as a `Link` to `/menu`. It is not a 404, and no form is shown.
- **Cart emptied while on the page** (the last line removed in the drawer): the page switches to the empty state.
- **Errors:** inline per field as above; there is no toast or banner.

### Accessibility

- One `h1` on the page; "Your order" and the form sections are `h2`.
- Every control has a visible label; the radio tiles are a real radio group with a legend; the error text is announced through `aria-describedby`; and "(optional)" is part of the Notes label.
- Tap targets are at least 44px, and focus rings are visible on dark.
- The "Edit order" button is labelled "Edit order" and opens a dialog (the drawer), which returns focus to it on close.

## Data

- **Cart:** `useCartStore` → `lines`, `hydrated` (`store/cart.ts`). Select `lines` and derive outside the selector, as the store's comment says: `getLineSummary` per line (drop the `undefined`s, like the drawer does), `getItemCount`, `getSubtotal` (`lib/cart/pricing.ts`). `useCartDrawerStore` → `setOpen` for "Edit order".
- **Menu:** `menu.restaurant.orderTypes` (`OrderType[]`: `"delivery" | "takeaway" | "dine-in"`) through `lib/menu.ts`; labels from `ORDER_TYPE_LABELS` in `lib/order-types.ts`. `restaurant.name` is used only via the layout's title template.
- **Copy constants:** `DELIVERY_NOTE` and `formatItemCount` from `lib/cart/copy.ts`; `formatPrice` from `lib/format.ts`; `versionColors` from `lib/version-colors.ts`.
- **Env vars:** none in this spec. `NEXT_PUBLIC_WHATSAPP_NUMBER` is spec 18's.
- **New zod schema, `lib/validations/checkout.ts`** (zod v4 API):
  - `orderType`: an enum of the `OrderType` values, required. If it is missing the message is "Choose delivery, takeaway or dine-in." (the wording built from `ORDER_TYPE_LABELS`, not hard-coded).
  - `name`: trimmed string, 2–60 characters. Errors: "Enter your name." when empty, "Name is too long." over 60.
  - `phone`: a trimmed string with spaces and dashes removed. It accepts `03` + 9 digits, and also `+923` / `923` + 9 digits (what a phone's autofill gives). It transforms to `92` + the 10 digits after the leading `0` / `92`, so the output is always `923xxxxxxxxx` (12 digits). Errors: "Enter your phone number." when empty, "Enter a mobile number like 03001234567." otherwise.
  - `address`: a trimmed string, required only when `orderType` is `"delivery"` (a schema-level refinement or a discriminated union on `orderType`; decided in Plan Mode). Length 10–200, with errors "Enter your delivery address." and "Add a bit more detail so the rider can find you." For other order types it is dropped from the output.
  - `notes`: trimmed, optional, at most 300 characters ("Keep notes under 300 characters."). Empty becomes absent.
  - Types derived from the schema: the form's raw values (`z.input`) for `useForm`, and the parsed details (`z.infer` / `z.output`) for the submit handler and spec 18. There are no other interfaces.
- Form state lives only in react-hook-form while the page is mounted. Nothing new goes in `store/` or storage.

## Implementation outline

Files to create:

- `app/checkout/page.tsx`: the server component. It exports `metadata` (`title: "Checkout"`) and renders the header block and `CheckoutView`.
- `app/checkout/checkout-view.tsx`: a client component. It reads `hydrated` / `lines` and picks loading, empty, or summary + form, and owns the two-column grid.
- `app/checkout/order-summary.tsx`: the read-only order card with subtotal, delivery note and "Edit order".
- `app/checkout/checkout-form.tsx`: a client component. It holds the react-hook-form form with `zodResolver`, the fields and the submit handler (the hook point spec 18 fills in).
- `app/checkout/order-type-picker.tsx`: the three radio tiles, data-free (options and labels passed in), controlled through RHF's `Controller`.
- `lib/validations/checkout.ts`: the zod schema and its derived types.
- `components/ui/field.tsx`, `components/ui/input.tsx`, `components/ui/textarea.tsx` (and `label.tsx` / `separator.tsx` if `field` pulls them in), added with `npx shadcn add field input textarea` and then restyled. **Do not add shadcn `form`:** its registry item depends on `radix-ui`, and this project's components are on `@base-ui/react`. `field` + RHF's `Controller` is the base-ui pattern.
- `components/cart/line-details.tsx`: the detail list (add-ons, combo parts, deal contents and choices, "Free" / "+ Rs. N") extracted from `CartLine`, so the drawer and the checkout summary render it identically.
- `components/cart/cart-empty.tsx`: the empty state extracted from `CartDrawer` (glow, logo mark, heading, line, rule, "Browse the Menu"), taking the action as a prop or slot so the drawer keeps its close-on-tap behaviour.

Files to modify:

- `components/cart/cart-line.tsx`: use `LineDetails`.
- `components/cart/cart-drawer.tsx`: use `CartEmpty`; drop `prefetch={false}` and its comment from the Checkout link. On `/checkout`, the Checkout link only closes the drawer (the route-change effect will not fire for the same path).
- `CLAUDE.md`: section 1 current state (the checkout route and its files, the new `components/ui` and `components/cart` files, no more `prefetch={false}`), and the spec 17 status once verified.

Order of work:

- Schema and types in `lib/validations/checkout.ts`.
- Add and restyle `field`, `input` and `textarea`; extract `LineDetails` and `CartEmpty`, and check the drawer looks unchanged.
- `OrderSummary` and `CheckoutView` with the loading and empty states.
- `OrderTypePicker` and `CheckoutForm`, then wire them into the page.
- The drawer's link change, the CLAUDE.md update, lint and build.

## Edge cases

- **Opened directly before hydration:** the loading state shows; then the empty state or the form appears, never the empty state first for a saved cart.
- **Storage blocked:** the store still sets `hydrated`; the page shows the empty state (or the in-memory cart), and nothing throws.
- **A saved line that no longer matches the menu:** `getLineSummary` returns `undefined`, the row is skipped, and the count and subtotal follow `getItemCount` / `getSubtotal` as in the drawer. If every line is skipped, the empty state shows.
- **Cart changed from the drawer while on the page:** the summary, count and subtotal update live; if it is emptied, the empty state replaces the form (the form's values are lost; acceptable).
- **Switching order type away from Delivery:** the address is no longer required, its error disappears, and it is absent from the parsed output. Switching back restores the typed value (RHF `shouldUnregister: false`, the default).
- **Phone input variants:** `0300-1234567`, `0300 1234567`, `+92 300 1234567` and `923001234567` all parse to `923001234567`. `3001234567`, `04235761234` (landline) and `030012345678` (12 digits) are rejected.
- **Whitespace-only name, address or notes:** treated as empty after trimming.
- **Very long name or note:** limited by the schema (the inputs also carry `maxLength` so typing stops at the limit), and the text wraps in the summary and the fields without horizontal scroll.
- **Long cart (10+ lines):** at 375px the page simply gets longer. At `lg` the sticky summary scrolls inside itself, and the subtotal stays visible.
- **Large totals:** "Rs. 17,980"-sized line totals and five-figure subtotals do not wrap at 375px.
- **Submitting with Enter** from a text input submits the form (validation runs); Enter in a textarea makes a new line.
- **Browser autofill** of name, phone and address fills the fields and passes validation (autofilled `+92…` numbers included).
- **Back from `/checkout`** returns to the previous page with the drawer closed (spec 08's route-change effect).
- **`/checkout/anything`:** the branded 404; there are no nested routes.

## Acceptance criteria

- [x] `/checkout` exists, has the browser title "Checkout | Drippin Bites Cafe", renders inside the layout's `<main>` without adding its own, and builds as a static route.
- [x] `app/checkout/page.tsx` is a server component that only exports `metadata` and arranges components; all cart and form logic is in the client components under `app/checkout/`.
- [x] Before hydration a loading state shows; with a saved cart, the empty state never flashes.
- [x] With an empty cart, the page shows the same empty state as the drawer (from a shared `CartEmpty`) with "Browse the Menu" linking to `/menu`, and no form.
- [x] The summary lists every cart line with quantity, title, the variant tag when the item has more than one variant, the details (add-ons with "Free" / "+ Rs. N", combo parts, deal contents with the chosen flavours and drinks) and the line total, matching the drawer for the same cart.
- [x] The summary shows the item count, "Subtotal" with the amount from `getSubtotal`, and the exact text "Delivery charges confirmed on WhatsApp". No delivery fee or grand total appears.
- [x] "Edit order" opens the cart drawer; changes made there update the summary immediately, and emptying the cart switches the page to the empty state.
- [x] The drawer and the summary render details through the same `LineDetails` component; the drawer looks and behaves as before.
- [x] The form uses react-hook-form with `zodResolver` and the single schema in `lib/validations/checkout.ts`; the form's types come from that schema (`z.input` / `z.infer`), with no hand-written form interface and no manual validation code.
- [x] shadcn `field`, `input` and `textarea` are added (not `form`), restyled in `components/ui/` with brand tokens: dark warm surface, gold-tinted edge, gold focus ring, destructive ring when invalid, 16px text, at least 44px tall.
- [x] Order type shows three tiles in `restaurant.orderTypes` order labelled "Delivery", "Takeaway", "Dine-in" from `ORDER_TYPE_LABELS`, none preselected, and works as a radio group with the keyboard.
- [x] Submitting the empty form shows "Choose delivery, takeaway or dine-in.", "Enter your name." and "Enter your phone number." under their fields and focuses the order-type group; no errors show before the first submit.
- [x] After the first submit, errors clear as soon as the field becomes valid.
- [x] The address field appears only when Delivery is chosen, is required then ("Enter your delivery address."), and its value is kept when switching type and back, but absent from the parsed output for takeaway and dine-in.
- [x] `03001234567`, `0300 1234567`, `0300-1234567`, `+92 300 1234567` and `923001234567` are all accepted and parsed to `923001234567`; `3001234567`, `04235761234` and `030012345678` show "Enter a mobile number like 03001234567."
- [x] Notes are optional, capped at 300 characters with a visible count, and empty notes are absent from the parsed output.
- [x] A valid submit passes the parsed details (`orderType`, trimmed `name`, normalised `phone`, `address` for delivery only, `notes` when given) to the submit handler, and does not clear the cart.
- [x] Every error is linked to its control (`aria-invalid`, `aria-describedby`), every control has a visible label, and the page has one `h1`.
- [x] At 375px: one column, no horizontal scroll, the three order-type tiles fit in one row, prices do not wrap, and the inputs do not zoom on focus in iOS Safari.
- [x] From `lg`: the form on the left, the summary sticky on the right below the header, and its rows scroll inside it when the cart is long.
- [x] The mobile "View cart" bar does not appear on `/checkout`.
- [x] The drawer's Checkout link no longer has `prefetch={false}`, and no 404 or prefetch error appears in the console.
- [x] `CLAUDE.md` section 1 describes the checkout route, the shared cart pieces and the new UI components.
- [x] `npm run lint` and `npm run build` pass.

## Verification

No automated tests (CLAUDE.md section 2).

- `npm run lint` and `npm run build` pass, and the build output lists `/checkout` as static (○).
- Manual checks with `npm run dev`, first at 375px (DevTools device mode), then at 768px and 1280px:
  - **Empty:** clear `drippin-bites-cart` in localStorage, open `/checkout`: the empty state shows with no flash of the form; "Browse the Menu" goes to `/menu`.
  - **Loading:** with a saved cart, hard-reload `/checkout` with CPU throttling: stand-in rows show, then the order, and never the empty state.
  - **Summary:** fill the cart with a Hawawshi (Lahori Twist, two Cairo dips), a pizza (large), the Cairo Combo with Loaded, and Deal 3 with picks. Compare the summary to the drawer line by line: titles, tags, details, "Free" / "+ Rs. 70", choices, line totals, subtotal.
  - **Edit order:** open the drawer from the summary, change a quantity and remove a line, close it: the summary updates and focus returns to "Edit order". Remove everything: the empty state shows.
  - **Validation:** submit empty → the three errors and focus on the order type. Choose Takeaway → no address field. Choose Delivery → address field, and submit → the address error. Type each phone variant from the acceptance criteria and check accepted / rejected. Paste 301 characters into Notes → the count stops at 300.
  - **Parsed output:** temporarily log the submit handler's argument in the console (remove before committing) and confirm `phone: "923001234567"`, trimmed strings, and no `address` for takeaway, no `notes` when empty. Confirm the cart is unchanged after submit.
  - **Keyboard:** Tab through the whole page; arrow keys move between the order-type tiles; every focus ring is visible; Enter in Name submits; Enter in Notes adds a new line.
  - **Screen reader spot check** (NVDA or VoiceOver): the legend, labels, "(optional)" and error messages are read with their fields.
  - **Layout:** no horizontal scroll at 375px; the tiles fit in one row; at 1280px the summary is sticky and scrolls internally with 10+ lines in the cart.
  - **iOS Safari or a 16px check:** the computed `font-size` of the inputs and textareas is 16px.
  - **Drawer:** the Checkout link from `/menu` lands on `/checkout` with the drawer closed, and the Network panel shows no failed prefetch.
  - **Reduced motion:** with `prefers-reduced-motion: reduce` emulated, the address field appears without animation.
