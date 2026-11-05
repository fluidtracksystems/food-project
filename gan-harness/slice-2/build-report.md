# GAN Harness Build Report: slice 2, recipe cost calculator

**Brief:** Build the recipe cost per serving calculator (`/tools/recipe-cost-calculator/`, `/tools/` index) per `gan-harness/spec.md`.
**Result:** PASS at iteration 1 (threshold 7.0, eval mode `code-only`, max iterations set to 4).
**Iterations used:** 1 / 4
**Final score:** 8.1 / 10

## Score progression
| Iter | Correctness (30%) | Accessibility (20%) | Design fit (15%) | Page/SEO (15%) | Code quality (10%) | Scope/safety (10%) | Total |
|------|---|---|---|---|---|---|---|
| 1 | 8.5 | 7.0 | 8.0 | 8.5 | 7.5 | 9.0 | 8.1 |

The default GAN rubric (design, originality, craft, functionality) was replaced by a slice-specific rubric because the visual design is already approved (see `eval-rubric.md`).

## What happened after the pass (orchestrator, not the loop)
The evaluator could not run the island (no browser tools in code-only mode). The orchestrator fixed three of its defects directly instead of spending a second generator/evaluator cycle, then tested the island in a real browser against the production build:
- Live region no longer rewritten on every keystroke: updates are debounced (600 ms), the untouched start state keeps the static placeholder, and the placeholder is restored on unmount or when all rows are cleared.
- Select min-height now uses `var(--target)`.
- Corrected a code comment (`role="status"` is atomic).

Browser results (production build, Chrome): initial state shows the placeholder only; 0 live-region changes while typing, 1 update after a pause; 250 g from a 1 kg pack at $4.00 = $1.00 and $0.25 per serving for 4 servings; a cup-vs-gram row is rejected with a row-specific message while the good row stays in the total; no duplicate ids; `aria-describedby` target exists; clearing a row restores the placeholder.

## Remaining issues (not fixed)
- Focus after Remove always goes to the Add button and the removal is not announced.
- Comma decimals ("1,5") get a generic "must be a number" message; no test for "1,5" or "1e1" servings.
- Error text sits below all five fields of a row, far from the field at 320px.
- The disabled Remove button on the last row has no explanation.
- `formatUsd` rounding tolerance (12 significant digits) is untested.
- Not tested: screen readers, 320px width and 200% zoom, keyboard-only walkthrough, dark mode.
- Chef review of cost assumptions and the NIST citations is still outstanding (`TODO(chef)` comment in the page).
- The site has no favicon (browser requests `/favicon.ico` and gets a 404). Pre-existing; for launch QA.

## Files
- gan-harness/spec.md, gan-harness/eval-rubric.md
- gan-harness/feedback/feedback-001.md
- gan-harness/generator-state.md
- gan-harness/build-report.md
