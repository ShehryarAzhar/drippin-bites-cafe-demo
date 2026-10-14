# Spec 18: WhatsApp Order

**Status:** Implemented
**Depends on:** 17 (and 07 for the cart store and `getLineSummary`, 08 for the drawer, 03 for `formatPrice` and `menu.restaurant`)

## Summary

Fill in the empty `sendOrder` handler that spec 17 left in `app/checkout/checkout-form.tsx`. A valid submit turns the cart and the customer's details into one plain-text WhatsApp message, opens `https://wa.me/<number>?text=<message>` and then asks "Did you send it?". The cart is cleared only when the customer says yes. For the pitch, this is where the site meets the owners' current workflow: the order arrives in the WhatsApp chat they already use, complete and readable, without the usual back-and-forth.

## Goals

- A pure **message builder** (no React, no store access) that turns the cart summaries, subtotal and parsed `CheckoutDetails` into the plain-text message, in the order CLAUDE.md section 6 sets out.
- A **WhatsApp helper** that reads `NEXT_PUBLIC_WHATSAPP_NUMBER`, checks it and builds the `wa.me` URL with the message encoded through `encodeURIComponent`.
- A valid submit opens WhatsApp in a new tab or the app, then moves checkout to a **confirmation step**. The step keeps an "Open WhatsApp" link, in case the browser blocked the new tab.
- From the confirmation step the customer can:
  - say **"Yes, I sent it"**, which clears the cart and shows a **success state**, or
  - say **"Not yet, edit details"**, which goes back to the form with everything they typed still filled in.
- When the env var is **missing or invalid**, checkout shows a clear notice in place of the send action and never builds a broken link.
- The cart is never cleared automatically: not on submit, not when the tab regains focus and not on a timer.
- `npm run lint` and `npm run build` pass, and `/checkout` still prerenders as static.

## Out of scope

- WhatsApp Cloud API or any automatic sending, delivery receipts or order status. The customer always presses Send in WhatsApp themselves. These are future phases from CLAUDE.md section 3, as are a backend or database (no order is stored anywhere), payments, auth and an admin dashboard.
- Reading `restaurant.whatsapp` from `menu.json`. It stays `"TBD"` and is not used, because the number comes from the env var only.
- Order numbers or references, timestamps, estimated times and delivery fees in the message. The delivery fee stays `DELIVERY_NOTE`.
- Remembering a pending order across a reload or a discarded tab (sessionStorage and similar). See Edge cases.
- Saving the customer's details for next time.
- Changing the checkout schema, the form fields, the order summary, the cart model, pricing, `getLineSummary` or `menu.json`. New packages. Tests.

## User flow

On a phone, with a Lahori Tikka Hawawshi (two Cairo dips), the Pizza Pair deal and a Cairo Combo in the cart:

1. They fill in the checkout form from spec 17 (Delivery, "Ali", "0300 1234567", an address and the note "Extra napkins please"), then tap **Send Order on WhatsApp**.
2. The form is valid, so WhatsApp opens: the app on a phone, or a `wa.me` tab on desktop. The restaurant's chat has the message ready:

   ```
   *New order: Drippin Bites Cafe*

   Order type: Delivery

   1 × Lahori Tikka Hawawshi (Lahori Twist): Rs. 719
      - Tahini: Free
      - Toum: + Rs. 70
   1 × Pizza Pair: Rs. 1,599
      - 2 × Medium Pizza: Fajita, Tikka
      - 1 × 1.5 Litre Drink: Pepsi
   1 × Cairo Combo: Rs. 899
      - Cairo Beef Hawawshi
      - Cairo Fries
      - Limonana
      - Loaded: + Rs. 150

   Subtotal: Rs. 3,217
   Delivery charges confirmed on WhatsApp

   Name: Ali
   Phone: +92 300 1234567
   Address: House 12, Block R1, Johar Town, near the park
   Notes: Extra napkins please
   ```

   The item names, dips and prices above are illustrative. Real values come from `menu.json` through `getLineSummary`.
3. They press Send in WhatsApp, then come back to the browser. Checkout now shows the **confirmation step** in place of the form: "Did you send it?", a short line explaining that the order only reaches the restaurant once it is sent in WhatsApp, and three actions:
   - **"Yes, I sent it"** (primary gold pill)
   - **"Open WhatsApp again"** (a real link to the same `wa.me` URL, for when it did not open or the chat was closed)
   - **"Not yet, edit details"** (ghost button)
4. They tap **Yes, I sent it**. The cart is cleared, the header badge goes to zero and checkout shows the **success state**: "Order sent", a line that the restaurant will confirm on WhatsApp (including delivery charges), and "Back to Home" / "Browse the Menu".
5. Alternative: they tap **Not yet, edit details**. The form returns with every value still filled in, so they can fix the address and send again. Sending again rebuilds the message.
6. Alternative: the number is not set (`.env.local` empty). The form still works and validates. Where the submit button would be, a notice says that online ordering is not connected yet and asks the customer to contact the restaurant directly. No `wa.me` link is ever shown.

## UI & design

Load the `frontend-design` skill when implementing. Follow the existing checkout styling: `summaryPanel` and `sectionLabel` from `app/checkout/order-summary.tsx`, `CartEmpty` for the centred glow-and-logo treatment, `Button` / `buttonVariants` (gold pill primary, at least 44px tall). Nothing is imported from `docs/`.

### Confirmation step (`app/checkout/send-confirmation.tsx`)

- It takes the form column's place (the same `formColumn` grid area). The order summary stays visible beside it from `lg` and above it below `lg`, so the customer can see what they sent. While the step shows, the summary's "Edit order" button stays available (see Edge cases).
- A dark panel in `summaryPanel` style, with the soft gold radial glow in one corner, centred content and generous padding (about 24px at 375px, 32px from `sm`).
- From the top:
  - the lucide `MessageCircle` icon in a gold-ringed circle;
  - `BrandHeading` (`h2`, `card` size): lead "Did You", accent "Send It?";
  - a muted line of at most about 40ch: "Your order reaches us only after you press Send in WhatsApp.";
  - the three actions stacked full-width at 375px, side by side from `sm` where they fit. "Yes, I sent it" (lucide `Check`) is primary, "Open WhatsApp again" (lucide `ExternalLink`) is `outline` with `target="_blank"` and `rel="noopener noreferrer"`, and "Not yet, edit details" (lucide `Pencil`) is `ghost`.
- When it appears, focus moves to the panel's heading (`tabIndex={-1}`) and the panel is a polite live region, so a screen reader announces the change. It enters with a short fade and rise (200ms), with none under `prefers-reduced-motion`.

### Success state (`app/checkout/order-sent.tsx`)

- It replaces the whole checkout grid and is centred like `CartEmpty`: a gold glow behind a gold-ringed lucide `CheckCircle2` (not the logo mark, so it doesn't read as the empty state), a `GoldRule`, `BrandHeading` (`h2`): lead "Order", accent "Sent", then a muted line: "We'll confirm your order and delivery charges on WhatsApp."
- It has two actions (decided 2026-10-14): "Back to Home" (`Link` to `/`, primary) and "Browse the Menu" (`Link` to `/menu`, outline).
- Focus moves to its heading when it appears. It shows **instead of** the empty-cart state, even though the cart is now empty (see Implementation outline).
- The page header from `page.tsx` ("Place Your Order") stays above it. The success panel carries its own heading.

### WhatsApp not configured (`app/checkout/whatsapp-unavailable.tsx`)

- Inside the form, where the submit button and its helper line sit: a panel with a `ring-1 ring-destructive/40` edge on the dark surface, the lucide `MessageCircleOff` icon, the heading "Online ordering isn't connected yet" and the line "Please contact the restaurant directly to place your order."
- The submit button is **not rendered**, so there is no dead or disabled button. The rest of the form stays usable, so the page still demos.
- Contact details: show any of `getContactDetails()` from `lib/menu.ts` that `tbdSafe` keeps (phone, WhatsApp), as `tel:` links. Today all of them are `"TBD"`, so nothing extra shows. Never invent a number. The notice stays generic, with no Instagram or other new contact field (decided 2026-10-14).

### Submit button

- There are no visual changes from spec 17. While `handleSubmit` runs, the button is briefly `disabled` (RHF's `isSubmitting`), so a double tap can't open two chats.

### Accessibility

- Every new action is a real `<button>` or `<a>` with a visible label, at least 44px tall, and has a visible focus ring.
- "Open WhatsApp again" says it opens in a new tab through visually hidden text: "(opens WhatsApp)".
- The page keeps exactly one `h1`, and the confirmation and success headings are `h2`.

## Data

- **Env var:** `NEXT_PUBLIC_WHATSAPP_NUMBER`, already documented in `.env.example` (`923xxxxxxxxx`, digits only). `.env.local` exists with an empty value.
  - Read it as the literal `process.env.NEXT_PUBLIC_WHATSAPP_NUMBER`, because Next inlines only literal references, at build time (`node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`).
  - Strip spaces, dashes and a leading `+`. What remains is accepted only if it is 10–15 digits and doesn't start with `0`. Anything else, including an empty value, counts as **not configured**.
  - Changing the value needs a dev restart or a rebuild. Note this in a comment next to the reader.
- **Cart:** `useCartStore` → `lines`, `clear`; `getLineSummary` (`lib/cart/summary.ts`) per line, skipping `undefined` as `CheckoutView` already does; `getSubtotal` (`lib/cart/pricing.ts`).
- **Summary fields used by the message** (`LineSummary` in `types/cart.ts`): `quantity`, `title`, `variantLabel` + `hasMultipleVariants` (the variant shows in brackets only when the item has more than one variant, the same rule as `LineVariantTag`), `lineTotal`, and `details[]` (`label`, `quantity?`, `price?`, `choices?`).
- **Details:** `CheckoutDetails` from `lib/validations/checkout.ts`: `orderType`, `name`, `phone` (`923xxxxxxxxx`), `address?` (delivery only), `notes?`.
- **Menu:** `menu.restaurant.name` for the header line; `ORDER_TYPE_LABELS` (`lib/order-types.ts`) for the order type; `DELIVERY_NOTE` (`lib/cart/copy.ts`); `formatPrice` (`lib/format.ts`). No hard-coded names or prices.
- **Message format rules:**
  - Line breaks are `\n`. The whole text goes through `encodeURIComponent`, never by hand.
  - The only WhatsApp formatting is `*…*` (bold) on the header line (decided 2026-10-14). Everything else is plain text.
  - Detail rows are indented with three spaces and a `- `. A detail with a `quantity` gets `N × `. A `price` of 0 reads `Free`, and a positive one reads `+ Rs. N`. A deal's `choices` follow the label after a colon, comma-separated.
  - The phone is shown as `+92 3XX XXXXXXX` from the normalised value.
  - `Address:` appears only for delivery, and `Notes:` only when there are notes.
  - Blank lines separate the header, order type, lines, totals and customer blocks.
- **New types:** none beyond what the helpers return. The message builder takes the existing `LineSummary[]`, a subtotal and `CheckoutDetails`. No new zod schema: the env var check is a plain function, because it isn't form validation.
- **New state:** the checkout step (`form` → `confirm` → `sent`) and the last built `wa.me` URL, held in React state in `CheckoutView`. Nothing goes in `store/` or storage.

## Implementation outline

Files to create:

- `lib/order-message.ts`: the pure message builder (summaries + subtotal + details → text) and the phone display formatter.
- `lib/whatsapp.ts`: reads and checks `NEXT_PUBLIC_WHATSAPP_NUMBER` (returns the digits or `undefined`), and builds the `wa.me` URL from a number and a text.
- `app/checkout/send-confirmation.tsx`: the "Did you send it?" panel with its three actions.
- `app/checkout/order-sent.tsx`: the success state.
- `app/checkout/whatsapp-unavailable.tsx`: the not-configured notice that replaces the submit button.

Files to modify:

- `app/checkout/checkout-view.tsx`: owns the step state and the last URL. It renders the form or the confirmation in the form column, and the success state in place of the grid. The success state wins over the empty-cart check. While the step is `confirm`, the form stays mounted but hidden (or its values are otherwise kept), so "Not yet" restores them.
- `app/checkout/checkout-form.tsx`: `sendOrder` hands the parsed details up through a prop. The form renders `WhatsAppUnavailable` in place of the submit button when no number is configured, and disables the button while submitting.
- `CLAUDE.md`: section 1 (the new lib files, the checkout steps and that `sendOrder` is no longer empty) and the spec 18 status once verified.

Order of work:

- `lib/whatsapp.ts` and `lib/order-message.ts`, checked by logging a message for a mixed cart in the browser console (removed afterwards).
- The step state in `CheckoutView` and the wiring from `CheckoutForm`'s submit, including opening WhatsApp.
- `SendConfirmation` and `OrderSent`, with focus handling and the clear-cart action.
- `WhatsAppUnavailable` and the not-configured path.
- The CLAUDE.md update, lint and build, then the manual checks at 375px and desktop.

## Edge cases

- **Popup blocked:** iOS Safari and others may block a new window opened after the async validation. Opening is attempted once on submit, and the confirmation step always offers "Open WhatsApp again" as a real link the customer taps directly. Plan Mode checks whether `window.open` or same-tab navigation works better on iOS Safari and Android Chrome.
- **Env var missing, empty, `"TBD"`, has a leading `0` or is too short:** treated as not configured. The notice shows, there is no submit button and no `wa.me` URL is built.
- **Env var with `+` or spaces** (`+92 300 1234567`): accepted and normalised to digits.
- **The cart changes during the confirmation step** (through "Edit order" and the drawer): the message that was sent no longer matches. Checkout goes back to the form step, keeping the typed values, so the next send rebuilds the message.
- **The cart is emptied from the drawer during the confirmation step:** the empty-cart state shows, as in spec 17. Only "Yes, I sent it" leads to the success state.
- **The tab is reloaded or discarded while in WhatsApp** (common on low-memory phones): the step state is lost, and checkout opens on the form with the cart intact and the details empty. Nothing is lost that matters, and the cart is not cleared. This is accepted for the demo.
- **The customer taps "Yes, I sent it" without sending:** the cart is cleared anyway. It is their stated choice, and the restaurant never received anything.
- **Double tap on submit:** the button is disabled while submitting, so only one chat opens.
- **Lines that no longer match the menu:** they are skipped in the message, as in the summary. The subtotal comes from `getSubtotal(lines)`, which prices them at 0, so it matches the summary on screen.
- **Large carts** (20 lines, long deal choices): the URL grows to a few thousand characters, which `wa.me` handles. No truncation, and the message is never cut silently.
- **Special characters in name, address or notes** (`&`, `#`, `?`, `%`, Urdu text, emoji, line breaks in the address): encoded correctly. The address's own line breaks are kept, each continuation indented under `Address:`.
- **Same flavour picked twice in a deal:** written as the summary shows it ("Fajita, Fajita").
- **Back from the success state:** the cart is empty, so checkout shows the empty-cart state.

## Acceptance criteria

- [x] A valid submit opens `https://wa.me/<number>?text=<encoded message>` with the number from `NEXT_PUBLIC_WHATSAPP_NUMBER` (digits only) and never reads `restaurant.whatsapp`.
- [x] The message is plain text in this order: header with `restaurant.name`; order type (from `ORDER_TYPE_LABELS`); each line as `qty × title`, plus `(variant)` when the item has more than one variant, with its line total, and add-ons, combo parts and deal contents with their choices indented below; subtotal; the exact text "Delivery charges confirmed on WhatsApp"; name, phone, address (delivery only) and notes (only when given).
- [x] Names, prices and labels in the message all come from `getLineSummary`, `getSubtotal`, `formatPrice` and `menu.json`. Nothing is hard-coded, and the figures match the order summary on screen.
- [x] Message building and URL building are plain functions in `lib/`, with no React or store imports.
- [x] After submit, checkout shows the confirmation step with "Yes, I sent it", "Open WhatsApp again" (a working link to the same URL) and "Not yet, edit details", and the order summary is still visible.
- [x] The cart is cleared only by "Yes, I sent it". Submitting, returning to the tab and choosing "Not yet" leave it unchanged.
- [x] "Yes, I sent it" shows the success state, not the empty-cart state, and the header cart count reads zero.
- [x] "Not yet, edit details" returns to the form with every value the customer typed still there.
- [x] Changing the cart during the confirmation step returns checkout to the form.
- [x] With `NEXT_PUBLIC_WHATSAPP_NUMBER` empty or invalid, the form shows the "Online ordering isn't connected yet" notice in place of the submit button, and no `wa.me` link exists anywhere on the page.
- [x] The submit button is disabled while submitting, so a double tap opens one chat.
- [x] Focus moves to the confirmation heading and to the success heading when they appear. Every new action is at least 44px tall with a visible focus ring, and the page keeps one `h1`.
- [x] At 375px the confirmation and success panels fit without horizontal scroll, and their buttons stack full-width.
- [x] Animations are off under `prefers-reduced-motion: reduce`.
- [x] `CLAUDE.md` section 1 describes the WhatsApp flow and the new files.
- [x] `npm run lint` and `npm run build` pass, with `/checkout` still static.

## Verification

No automated tests (CLAUDE.md section 2).

- `npm run lint` and `npm run build` pass, and the build output lists `/checkout` as static (○).
- Manual checks with `npm run dev`, first at 375px (DevTools device mode), then at 1280px. During development, `.env.local` holds your own number (decided 2026-10-14); restart dev after setting it.
  - **Message:** fill the cart with a Cairo version item with two Cairo dips, a single-variant item, a sized pizza, the Cairo Combo with Loaded and dips, and a deal with a `qty` 2 pizza line. Submit as Delivery with notes. In the `wa.me` tab (or on your phone), check the order of the blocks, the indentation, the bracketed variants (none for single-variant items), "Free" / "+ Rs. 70", the deal choices, the line totals, the subtotal against the on-screen summary, the delivery note, `+92 3XX XXXXXXX` and the address. Then send it, and check how it reads in the chat on a phone.
  - **Takeaway / no notes:** submit as Takeaway with empty notes. The message has no `Address:` or `Notes:` line.
  - **Encoding:** use the name `Ali & Sons #1` and a two-line address. Both arrive intact.
  - **Confirmation:** after submit, the step shows and the cart badge is unchanged. "Open WhatsApp again" opens the same chat. "Not yet, edit details" brings back the filled form. Submit again, then "Yes, I sent it": the success state shows, the badge reads zero, and `drippin-bites-cart` in localStorage has no lines.
  - **Cart change mid-confirm:** at the confirmation step, open "Edit order", raise a quantity and close the drawer. Checkout returns to the form, and a new submit shows the new quantity in the message.
  - **Popup blocking:** on iOS Safari (or a real phone) and Android Chrome, check that WhatsApp opens on submit. If it is blocked, the "Open WhatsApp again" link works.
  - **Not configured:** empty the value in `.env.local` and restart dev. The notice replaces the submit button, the rest of the form still validates and the page has no `wa.me` link. Repeat with `0300 1234567`, which has a leading 0.
  - **Keyboard and screen reader:** tab through the confirmation and success panels. Focus lands on each heading when it appears, and the actions are announced with their labels.
  - **Reduced motion:** emulate `prefers-reduced-motion: reduce`. The confirmation panel appears without animation.
- **Deployment:** the number for the demo is decided later, and only `NEXT_PUBLIC_WHATSAPP_NUMBER` changes; no code changes (decided 2026-10-14). On Vercel, changing the variable needs a **redeploy**, because `NEXT_PUBLIC_` values are inlined at build time.
