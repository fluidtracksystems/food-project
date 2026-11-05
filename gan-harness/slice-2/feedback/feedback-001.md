# Evaluation - Iteration 001 (code-only)

Commands run: git status/log (HEAD still b8a6a92, no commits), `npm run check` (0 errors, 0 warnings), `npm test` (11 files, 167 tests pass), production build (4 pages: /, /404, /tools/, /tools/recipe-cost-calculator/), then drafts build. Not verified (no browser/DOM lib): runtime behaviour of the island, tests-first ordering.

| # | Criterion | Weight | Score | Evidence |
|---|-----------|--------|-------|----------|
| 1 | Correctness and tests | 30% | 8.5 | Factors in units.ts:5-17 match spec exactly. Hand checks: 250 g of 1 kg at $4 = $1.00; 8 oz of 1 kg at $5 = 226.796/1000*5 = $1.13; 3 each of 12 at $4.80 = $1.20; all match tests/code paths (recipe-cost.test.ts:11-52). Bad row never throws, errors per row (recipe-cost.ts:86-95). Gaps: no test for comma decimals or "1e1" servings; half-cent hack untested at 0.0049999999999. |
| 2 | Accessibility | 20% | 7.0 | Unique labels with "row n" (tsx:41-43, 67-69), row-specific button names (tsx:188), aria-describedby targets exist (tsx:146-150, 175-179), error text prefixed "Problem in row n". Defects below: live region noise, focus after remove, fragile clear+render. |
| 3 | Design-system fit | 15% | 8.0 | ToolShell, tokens, .btn, global focus ring used; no hex colours; no outline:none. Hard-coded: select min-height 3rem (page.astro:127) instead of var(--target), font-weight 800, 1px/2px/4px borders. |
| 4 | Page contract, SEO, links | 15% | 8.5 | Titles "Recipe cost calculator | Site name TBD" and "Kitchen calculators | ..." (<60); descriptions 135 and 113 chars; one h1, h2s in order; formula, NIST HB44 App C + SP 811, limits are static HTML; TODO(chef) comment survives into dist HTML (count 1), no review claim; both URLs in sitemap-0.xml; drafts build: 3 recipe links + `no-print` link on all 4 recipe pages; production build renders no recipes section (conditional at page.astro:64). |
| 5 | Code quality and weight | 10% | 7.5 | Logic is pure under src/lib; island JS only referenced from tools/recipe-cost-calculator/index.html; client:visible; no dependency changes; .gitkeeps removed. Deductions: island reaches outside itself via document.getElementById and manual render() (tsx:112-124); blank double line recipe-cost.ts:53-54; `Row` redeclares string fields. |
| 6 | Scope and content safety | 10% | 9.0 | Nothing out of scope built; no analytics; "no medical or dietary advice" present; no commits. |

WEIGHTED TOTAL: 8.1

Verdict: PASS (threshold 7.0). Hard cap not triggered (check, test, build all pass).

## Defects, most severe first

1. Live region is rewritten on every keystroke. RecipeCostCalculator.tsx:113-118 does `target.textContent = ''` then `render(...)` on each result change, so a polite region is cleared and refilled per keypress (screen readers will chatter), and on hydration it announces "$0.00" before the user has entered anything. Fix: stop clearing; render once and update in place (preact diff), or only update the region on blur/after a short debounce, and keep the placeholder text until there is at least one valid row.
2. Fragile DOM handling. Clearing with textContent and then calling preact `render` on the same container desyncs preact's vnode tree from the DOM (tsx:116-117). It probably works on Preact 11.1.1 (detached nodes get reinserted) but I could not run it and no test covers it. Fix: drop the textContent clear, or use a `createPortal`/a tiny second island owning the region; add a happy-dom component test if possible.
3. Unmount cleanup (tsx:119-124) renders null, leaving the status region empty instead of restoring the static placeholder. Minor now, but it breaks the "static placeholder" contract. Restore the original text.
4. Focus after Remove always jumps to the "Add ingredient N" button (tsx:131-134) and nothing announces that the row was removed. Fix: move focus to the next row's Name input (or previous if last), or to the heading of the rows, and consider an aria-live note.
5. Comma decimals ("1,5") give a generic "must be a number" message (recipe-cost.ts:42-44) for a US-first audience that may paste "1,000". Fix: add a specific hint ("use a point, like 1.5") and a test; also test "1e1" servings (accepted as 10, recipe-cost.ts:31).
6. Hard-coded sizing vs tokens: `.rc select { min-height: 3rem }` (recipe-cost-calculator.astro:127) should be `var(--target)` (or a token); `font-weight: 800` (:105) and px borders could use tokens if they exist. Verify inputs get min-height from global.css:203-215 likewise.
7. Error `<p>` is placed after the price field, below all five fields it describes; for a 320px layout it is far from the Amount field. Acceptable, but consider placing it right under the row legend.
8. Disabled Remove on the last row (tsx:187) is a dead control with no explanation; consider hiding it or giving it an aria-description.
9. recipe-cost.ts:53-54 stray double blank line; Row interface (tsx:11-16) redundantly redeclares fields.
10. formatUsd (recipe-cost.ts:114) toPrecision(12) hack would round 0.00499999999999 up to a cent; add a test documenting the tolerance.

## Already good (do not break)
- Exact NIST factors, Result-object API, no exceptions, cross-dimension refusal with a plain-language message.
- Per-row error isolation and totals that survive bad rows; servings error is separate from the total.
- Static explanation, formula, citation, limits, noscript; TODO(chef) comment kept without a review claim.
- Island JS only on the tool page; sitemap and recipe-page link (no-print) verified in the build output.
- Unique row-numbered labels, row-specific button names, error text with prefix (not colour alone).
