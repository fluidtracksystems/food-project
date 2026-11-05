# Evaluation rubric: Grocery budget and fiber calculators (slice 4)

Score each criterion 0 to 10, then compute the weighted total. Pass threshold: 7.0. Hard rule: if `npm run check` has errors, `npm test` fails, or `npm run build` fails, the total is capped at 4.0. A second hard rule: any invented number (a figure in the data module or fiber table that does not match `gan-harness/sources/*.md`), or any health outcome claim on the fiber page, caps the total at 5.0.

Evaluation mode is **code-only**: do not use browser tools. Run the commands below from the repo root `D:\projects\food.quantityhost.com`, read the code and the built HTML, and cite file:line evidence for every score. Never run two builds in parallel (they share `website/dist/`): run the production build, inspect it, then run the drafts build. Do not start servers.

| # | Criterion | Weight | What a 9 to 10 looks like |
|---|-----------|--------|---------------------------|
| 1 | Correctness and data fidelity | 30% | Every value in `website/src/data/usda-food-plans.ts` and the fiber table matches `gan-harness/sources/grocery.md` section 2 and `fiber.md` section 1 exactly (you must spot-check at least 12 grocery values across all four plans, including every Thrifty age band and both 19-year and 20-year boundary rows, and all 13 fiber cells). Weekly and monthly are stored as printed, never derived. Age to band mapping is right at every boundary, including age 19 (Thrifty teen band, others adult). Household factors are right (1 -> 1.20, 2 -> 1.10, 3 -> 1.05, 4 -> 1.00, 5-6 -> 0.95, 7+ -> 0.90). Hand-compute at least three results (for example 2 adults aged 30 plus children aged 7 and 10 on Thrifty weekly: 73.60 + 58.60 + 48.30 + 55.80 = 236.30; one 30-year-old woman on Thrifty weekly: 58.60 x 1.20 = 70.32; fiber for a 40-year-old woman = 25 g, 2,000 kcal = 28 g). Invalid or blank members and out-of-range calories never throw and never hide valid results. Tests were clearly written first and cover the cases in the spec. |
| 2 | Accessibility | 20% | Unique visible labels per row, keyboard operable, row-specific button names, errors as text tied with `aria-describedby` under the legend, focus moves to the neighbouring row after Remove with a polite announcement, Remove hidden on the last row, sex field clearly conditional with a text explanation, 44px targets via `var(--target)`, the results table has a proper caption or heading and header cells, results in the polite status region without per-keystroke chatter, sensible at 320px and 200% zoom, dark mode via tokens, no `outline: none` without a replacement. |
| 3 | Design-system fit and shared code | 15% | Uses `ToolShell`, tokens and existing global classes; no hard-coded colours, fonts or external requests; the live-region behaviour is extracted into ONE shared helper used by all three islands, with `RecipeCostCalculator` markup, ids and text unchanged and its tests untouched and passing; no duplicated `formatUsd`; no changes to existing component APIs. |
| 4 | Page contract, SEO, sources and claims | 15% | All four tool URLs build in production and are in the sitemap; the index lists three tools; unique titles under 60 chars and descriptions of 70 to 160 chars; one `<h1>` each; heading order sensible. Visible static text on each page: formula in words, as-of month, the cited sources with the URLs from the source notes, the limits and the disclaimer. Grocery page never presents a combined range or a cheapest-to-dearest ladder, says Thrifty uses newer data, says food at home only and no infants, and does not claim anything about non-food items. Fiber page names both bases and says they differ, says the calorie range is the site's own, says ages 4+ only, has the exact disclaimer sentence, and contains NO health outcome, disease, risk-reduction, treatment or "you need" language (search the built HTML for heart, disease, risk, reduce, prevent, treat, cure, deficiency, constipation, weight, diabetes). TODO(dietitian) comment is in the fiber source and survives into the built HTML or is in the .astro source; TODO(chef) in the grocery page; no review is claimed. 2 to 3 recipe cards render in the drafts build and nothing renders (no empty heading) in production. |
| 5 | Code quality and weight | 10% | Calculation logic only in pure functions under `website/src/lib/`; data in `website/src/data/`; islands only handle input and display; no dependency changes; the new islands load only on their own pages (check built HTML); small, readable files; no dead code; no leftover `.gitkeep` in directories that now hold files. |
| 6 | Scope and content safety | 10% | Nothing from the "Out of scope" list was built; no analytics event name changes; no edits under `.claude/`; no commits by the generator (`git log` HEAD is still `420459a` on a new branch); edits limited to the files this slice needs. |

## Commands to run (in this order, one at a time)
1. `git status --short` and `git log --oneline -3`
2. `npm run check`
3. `npm test`
4. `npm run build`, then inspect `website/dist/` (the four tool pages, sitemap, `_astro` scripts per page) and run the term search on the fiber page HTML
5. `PUBLIC_INCLUDE_DRAFTS=true npm run build` (Git Bash), then check the recipe cards on the two new tool pages

## Output
Write `gan-harness/feedback/feedback-NNN.md` (NNN = iteration, three digits) containing:
- A score table with the six criteria, weights, scores and one-line evidence.
- A line exactly of the form `WEIGHTED TOTAL: X.X` (one decimal).
- A numbered list of concrete defects, most severe first, each with file:line and a fix the generator can apply.
- A list of every number you spot-checked against the source notes and the result (match or mismatch).
- A short list of what is already good (so the generator does not break it).
Be strict and specific. Do not praise to be polite. Do not edit any source files.
