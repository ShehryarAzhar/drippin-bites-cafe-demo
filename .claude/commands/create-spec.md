---
description: Create a feature spec in .claude/specs
argument-hint: <number> <spec name>, e.g. 01 project setup or 04 cart drawer
---

Write a feature spec for this project's spec-driven workflow. Each feature is specced first, reviewed by the user, and only then implemented in a separate step. This command covers the spec only: do not write or change application code, install packages, or start implementing.

Raw arguments: `$ARGUMENTS`

## 1. Parse the arguments

Work from the whole raw argument string above, because the spec name can contain spaces.

- **Number:** the first whitespace-separated token. It must be all digits. Zero-pad it to 2 digits (`1` becomes `01`).
- **Name:** everything after the first token. Convert it to a slug:
  1. lowercase and trim whitespace
  2. replace spaces and underscores with `-`
  3. remove every character that isn't `a-z`, `0-9` or `-`
  4. collapse repeated `-` and strip leading/trailing `-`

  Example: `Cart Drawer & Checkout` becomes `cart-drawer-checkout`.
- If the number is missing or not numeric, or the name is missing or slugs to an empty string, stop and show the usage:

  ```
  /create-spec <number> <spec name>
  e.g. /create-spec 01 project setup
       /create-spec 04 cart drawer
  ```

- **Output path:** `.claude/specs/<number>-<slug>.md`. Create `.claude/specs/` if it doesn't exist.
- **Number collision:** if any file in `.claude/specs/` already starts with the same number, whatever its name, stop and ask whether to overwrite it or use another number. Never overwrite silently.

## 2. Gather context before writing

1. Read `CLAUDE.md` and follow every rule in it: scope, stack, no tests, forms and validation, images, brand.
2. If the feature touches menu data, read `data/menu.json` and reference its real field names. Don't invent fields.
3. Read every existing spec in `.claude/specs/` to find:
   - **dependencies** on earlier specs
   - anything **already covered**, so this spec doesn't repeat it
4. Inspect the relevant existing code (`app/`, `components/`, `lib/`, `store/`, `types/`, and so on; some of these may not exist yet) so the spec matches what is actually built.
5. If the name is too vague to spec confidently, ask up to 3 short clarifying questions first, then write the spec.
6. A spec covers **one feature**. If the request is too big for one spec, say so and suggest how to split it into several numbered specs instead of writing an oversized one.

## 3. Write the spec

Use exactly these sections, in this order:

```
# Spec <number>: <Readable Title>

**Status:** Draft
**Depends on:** <earlier spec numbers, or "None">

## Summary
2–3 sentences: what this feature is and why it matters for the demo/pitch.

## Goals
## Out of scope
(Explicitly list what this spec does NOT include, especially anything CLAUDE.md marks as a future phase.)

## User flow
Step-by-step from the customer's point of view, mobile-first.

## UI & design
Layout, shadcn components to use, brand tokens, responsive behaviour,
empty/loading/error states, accessibility notes.

## Data
Which parts of menu.json / cart state / env vars are used, with real field names.
Any new types or zod schemas needed.

## Implementation plan
Files to create and files to modify (with paths), and what each contains.
Ordered steps small enough to implement and check one at a time.

## Edge cases
## Acceptance criteria
A checkbox list (- [ ]) of concrete, verifiable outcomes.

## Verification
No automated tests (per CLAUDE.md). List:
- lint and build must pass
- manual checks to perform in the browser, including at mobile width

## Open questions
Anything that needs my or the restaurant owners' decision.
```

Be concrete throughout: real file paths, real component names, real `menu.json` fields. No generic filler. The person implementing the spec later should not have to rediscover what you found while writing it.

## 4. Report and stop

When the file is written, show:

- the file path
- a short summary of the spec
- its open questions

Then wait for approval. Nothing gets implemented until the user says so.
