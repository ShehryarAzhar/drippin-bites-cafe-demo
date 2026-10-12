# Spec 01: Project Setup

**Status:** Implemented
**Depends on:** None

## Summary

Clean the `create-next-app` scaffold so every later spec starts from a neutral, brand-safe base: no Next.js/Vercel placeholder page, no leftover template assets, and the WhatsApp env var documented. It matters for the pitch because nothing an owner could stumble on (the `/` route, the browser tab icon, the `public/` folder) should still look like a stock template.

## Goals

- Replace the stock placeholder in `app/page.tsx` with a minimal neutral page that references no scaffold assets.
- Delete the create-next-app leftovers: `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg` and `app/favicon.ico`.
- Leave `app/icon.svg` as the only favicon source.
- Add `.env.example` documenting `NEXT_PUBLIC_WHATSAPP_NUMBER`, and a `!.env.example` exception in `.gitignore` so it can be committed.
- `npm run lint` and `npm run build` both pass.

## Out of scope

- Brand colours, fonts, dark-only theme and brand primitives (spec 02). `app/globals.css` and the font setup in `app/layout.tsx` are not touched.
- `metadata` title/description, header and footer (spec 04). The "Create Next App" metadata stays until then.
- Real home page content: hero, Cairo Crunch feature, other sections (specs 15, 16).
- Menu types and helpers (spec 03), so the page does not read `data/menu.json` yet.
- Reading or using `NEXT_PUBLIC_WHATSAPP_NUMBER` in code, and the missing-variable message (spec 18).
- Installing anything. Zustand arrives in spec 07; shadcn components are added by the specs that need them.
- Changes to `next.config.ts`, `eslint.config.mjs`, `tsconfig.json`, `components.json`, `data/menu.json` or anything under `public/images/` and `docs/`.
- Future phases from CLAUDE.md section 3: backend, auth, payments, WhatsApp Cloud API, admin dashboard, videos.
- Tests of any kind.

## User flow

There is no customer-facing feature here. The only visible change:

1. A visitor opens `/` on a phone.
2. Instead of the Next.js "To get started, edit the page.tsx file" screen with Vercel links, they see a bare page with the cafe name.
3. The browser tab shows the Drippin Bites mark (from `app/icon.svg`), not the Next.js favicon.

## UI & design

This spec deliberately adds no designed UI; the visual treatment starts in spec 02 and the real home page in spec 15.

- `app/page.tsx` becomes a small server component: a single `<main>` containing one `<h1>` with the cafe name, centred in the viewport. No images, no links, no buttons, no shadcn components.
- Styling uses only the existing theme tokens (`bg-background`, `text-foreground`) through Tailwind utilities, so it picks up the brand automatically once spec 02 changes the variables. No hard-coded colours (`bg-zinc-50`, `dark:bg-black`, `#383838` and similar all go), and no `dark:` variants.
- It must not overflow or look broken at 375px; the heading wraps naturally.
- It must not pretend to be a finished page: no "coming soon" marketing copy, no fake navigation, no placeholders for out-of-scope features.
- Accessibility: exactly one `<h1>` inside a `<main>` landmark. `<html lang="en">` in `app/layout.tsx` is already correct.
- States: none (static page, no data, no loading or error states).

## Data

- **`menu.json`:** not used. `restaurant.whatsapp` is `"TBD"` and is not the source of the WhatsApp number in any case.
- **Cart state:** none.
- **Env vars:** `NEXT_PUBLIC_WHATSAPP_NUMBER`, documented only. `.env.example` contains:
  - a comment explaining it is the number checkout opens in `wa.me`, in international format, digits only, no `+`, spaces or leading `0` (the same `923xxxxxxxxx` shape CLAUDE.md section 6 uses for customer phones);
  - a comment saying to copy the file to `.env.local` and fill it in;
  - the key with an **empty value**. No real-looking number is invented.
- **New types or zod schemas:** none.

## Implementation outline

Files to modify:

- `app/page.tsx`: replace the stock placeholder with the minimal neutral page; drops the `next/image` import and the `/next.svg` and `/vercel.svg` references.
- `.gitignore`: add `!.env.example` directly after the existing `.env*` line (order matters; the negation must come after the pattern it overrides).

Files to create:

- `.env.example`: documents `NEXT_PUBLIC_WHATSAPP_NUMBER` with an empty value.

Files to delete:

- `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`: unused template icons. Only `app/page.tsx` references any of them (`next.svg`, `vercel.svg`).
- `app/favicon.ico`: the Next.js default icon, which competes with `app/icon.svg`.

Files that stay as they are: `app/icon.svg`, `public/logo.svg`, `public/logo-stacked.svg`, `public/logo-mark.svg`, `app/layout.tsx`, `app/globals.css`, `components/ui/button.tsx`, `lib/utils.ts`.

Order of work:

- Replace `app/page.tsx` first, so nothing references the assets about to be removed.
- Delete the five `public/*.svg` leftovers and `app/favicon.ico`.
- Add `.env.example` and the `.gitignore` exception; confirm git sees the file as untracked rather than ignored.
- Run `npm run lint` and `npm run build`; fix anything that surfaces.
- After verification, set spec 01 to `Implemented` in the CLAUDE.md roadmap and update the "Current state" bullet in section 1, which will no longer be accurate.

## Edge cases

- **Stale build cache:** `.next/` may hold references to the deleted `favicon.ico`. If the build or dev server complains about it, delete `.next/` and rebuild.
- **Browser favicon cache:** the old Next.js icon can persist in a tab after the change. Check in a private window or with a hard reload before judging it broken.
- **`.gitignore` ordering:** if `!.env.example` is placed above `.env*`, the file stays ignored. `git check-ignore .env.example` must report nothing.
- **Real env files stay ignored:** `.env`, `.env.local` and `.env.production` must still be ignored after the change.
- **No env file present:** the app must build and run with no `.env.local` at all, since nothing reads the variable yet.
- **`AGENTS.md`:** `next dev` rewrites it. If it shows up modified after running the dev server, commit it with the work instead of reverting it.
- **Lint already passes** on the current scaffold; the risk is introducing an unused import in the new `app/page.tsx`, not fixing existing errors.

## Acceptance criteria

- [x] `app/page.tsx` contains no create-next-app content: no Next.js or Vercel links, logos or copy, and no `next/image` import.
- [x] `app/page.tsx` is a server component (no `"use client"`) with one `<main>` and one `<h1>`, styled only with theme-token utilities (no hard-coded colour classes, no `dark:` variants).
- [x] `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg` and `public/window.svg` no longer exist.
- [x] `app/favicon.ico` no longer exists; `app/icon.svg` is unchanged.
- [x] `public/logo.svg`, `public/logo-stacked.svg`, `public/logo-mark.svg` and everything under `public/images/` are unchanged.
- [x] A search of the repo (excluding `node_modules`, `.next`, `.claude/` and `CLAUDE.md`) finds no reference to `next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg` or `favicon.ico`.
- [x] `.env.example` exists, contains `NEXT_PUBLIC_WHATSAPP_NUMBER=` with an empty value and comments describing the expected format, and contains no real-looking phone number.
- [x] `.gitignore` has `!.env.example` after `.env*`; `git check-ignore .env.example` prints nothing, while `git check-ignore .env.local` prints `.env.local`.
- [x] `package.json` and `package-lock.json` are unchanged (no dependencies added or removed).
- [x] `data/menu.json`, `app/globals.css`, `app/layout.tsx` and `next.config.ts` are unchanged.
- [x] `npm run lint` exits with no errors or warnings.
- [x] `npm run build` completes successfully.

## Verification

No automated tests (per CLAUDE.md).

- `npm run lint` passes.
- `npm run build` passes, with no warnings about missing assets.
- `git status` shows exactly: `app/page.tsx` and `.gitignore` modified, six files deleted, `.env.example` added, plus `.claude/specs/01-project-setup.md`, and `CLAUDE.md` once the status is updated (and `AGENTS.md` only if `next dev` rewrote it).
- Manual checks in the browser with `npm run dev`:
  - `/` at 375px width: the cafe name is visible and centred, nothing overflows horizontally, no Next.js or Vercel branding anywhere.
  - `/` at desktop width: same page, still centred.
  - The tab icon is the Drippin Bites mark (private window or hard reload).
  - `/next.svg` and `/vercel.svg` return 404.
  - The browser console and the dev-server terminal show no errors or missing-asset 404s on `/`.

## Open questions

1. **Placeholder heading text.** The page hard-codes "Drippin Bites Cafe" as its `<h1>` because typed access to `restaurant.name` only arrives in spec 03, and spec 15 replaces the page anyway. Acceptable, or should the page be left with no text at all?
2. **`README.md`** is still the create-next-app default (Vercel deploy links, `yarn`/`pnpm`/`bun` instructions). It is not in the roadmap scope for this spec. Should spec 01 replace it with a short project README, or leave it?
3. **`metadata` stays "Create Next App"** until spec 04, so the browser tab title is still stock after this spec. Fine to leave for 04, or set a minimal title here?
