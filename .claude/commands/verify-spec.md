---
description: Verify an implemented spec with the spec-verifier agent
argument-hint: <spec number>, e.g. 01
---

Verify an implemented feature against its spec. The review itself is done by the read-only `spec-verifier` subagent so that the code is judged by something that didn't write it; this session coordinates, applies only the fixes the user approves, and updates statuses at the end.

Raw arguments: `$ARGUMENTS`

## 1. Find the spec

- Take the first whitespace-separated token of the raw arguments. It must be all digits; zero-pad it to 2 digits (`1` becomes `01`).
- Find the file matching `.claude/specs/<number>-*.md`.
- If the number is missing or not numeric, no file matches, or more than one file matches, stop and say which. Usage: `/verify-spec <spec number>`, e.g. `/verify-spec 01`.

## 2. Delegate

Hand the verification to the `spec-verifier` subagent, passing it the spec file path. Don't verify in this session yourself, and don't tell the agent what you expect it to find.

## 3. Show the report

Show the agent's full report, unedited and unsummarised.

## 4. If the report lists issues

- Ask which issues to fix: all, specific numbers, or none.
- **Do not change any file before the user answers.**
- Fix only the issues the user approves, and of those only the ones marked **SMALL fix**.
- Don't fix issues marked **NEEDS REPLANNING**, even if approved. Tell the user to handle them in Plan Mode.
- After fixing, run lint and build again (script names from `package.json`) and report the result. Re-run the `spec-verifier` agent only if the user asks.

## 5. Manual checks

Ask the user to confirm the manual browser checks from the report, including the mobile-width ones.

## 6. Update status, only when everything passes

Everything passes when all of these hold:

- every acceptance criterion is Pass (criteria the agent marked "Needs manual check" count as Pass once the user has confirmed them)
- lint and build are clean
- the user has confirmed the manual checks

Then:

- tick the acceptance criteria checkboxes in the spec file (`- [ ]` becomes `- [x]`)
- set the spec's `**Status:**` to `Implemented`
- set that spec's row in the "Spec roadmap" table in `CLAUDE.md` to `Implemented`

Otherwise leave both statuses unchanged and summarise what is still outstanding.
