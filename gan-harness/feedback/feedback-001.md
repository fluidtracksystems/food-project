# Evaluation: slice 4, iteration 001 (mode: code-only)

Commands run in order: git status/log, `npm run check` (0 errors, 0 warnings, 74 files), `npm test` (17 files, 337 tests pass), `npm run build` (6 pages), prod HTML inspection, `PUBLIC_INCLUDE_DRAFTS=true npm run build` (14 pages). HEAD is still 420459a, no commits, nothing under `.claude/` touched. No hard cap applies (no failures, no invented numbers, no health claims).

## Scores

| # | Criterion | Weight | Score | Evidence |
|---|-----------|--------|-------|----------|
| 1 | Correctness and data fidelity | 30% | 9 | 120/120 grocery cells match source (script-compared, see below); 14 fiber cells match; bands, factors, rounding right; hand computations match. Deduct: tests-first cannot be verified from the tree; minor edge handling (below). |
| 2 | Accessibility | 20% | 8 | Unique labels per row (`GroceryBudgetCalculator.tsx:139-141,153-155`), legend per row, error `<p>` under legend tied by `aria-describedby` (`:132-136,148,161`), focus to neighbour after Remove (`:98-114`), Remove hidden on last row (`:175`), table caption + `th scope` (`:42-52`), conditional sex hint text. Deduct: informational notes styled/labelled as errors; no `aria-invalid`; see defects 3-4. |
| 3 | Design-system fit and shared code | 15% | 9 | One shared `use-live-result.ts`; styles only via tokens; `formatUsd` imported not duplicated; Recipe diff is a pure extraction. |
| 4 | Page contract, SEO, sources, claims | 15% | 8 | All 4 URLs + `/tools/` in sitemap; titles 56 and 58 chars incl. "Site name TBD"; descriptions 131 and 139 chars; one h1 each; no forbidden terms; exact disclaimer; TODO comments correct; cards 0 in prod, 3 in drafts. Deduct: "Read on2026-11-05" typo; fiber page has no "Sources" heading. |
| 5 | Code quality and weight | 10% | 8 | Pure logic in `lib`, data in `data`, islands only on own pages (one component-url each), no `.gitkeep`, no dep changes. Deduct: eslint-style deps shortcut in hook (`use-live-result.ts:50`), dead `if (!group) continue` branch. |
| 6 | Scope and content safety | 10% | 9 | Nothing out of scope built; event names unchanged; edits limited to needed files (recipe page edit is the shared-style move). |

WEIGHTED TOTAL: 8.6

(0.3*9 + 0.2*8 + 0.15*9 + 0.15*8 + 0.1*8 + 0.1*9 = 8.55, rounded to 8.6.) Verdict: PASS (threshold 7.0).

## Defects, most severe first

1. Missing space in built grocery page: "Read on2026-11-05." (`website/src/pages/tools/grocery-budget-calculator.astro:75-76`). JSX/Astro trims the newline between "Read on" and `{USDA_FOOD_PLANS.retrieved}`. Fix: `Read on{' '}{USDA_FOOD_PLANS.retrieved}` or put it on one line.
2. Fiber page has no "Sources" heading (h2s are How to use / Two figures / Adding fiber / What it does not do). Sources are cited inline with links (National Academies, DGA 2020-2025, MedlinePlus), so the content is present but not scannable. Fix: add an h2 "Sources" with a list of the three URLs plus the IOM report title.
3. `FiberCalculator.tsx:62,115-119`: the informational calorie notes ("only given for ages 19 and over", out of 1,000-4,000 range) are rendered with the `rc-error` class and a "Problem:" prefix. For an 18-year-old this is not a problem. Fix: use neutral `rc-hint`/"Note:" for the under-19 note, keep "Problem:" for invalid numbers.
4. `FiberCalculator.tsx:60-61`: calorie text is hidden whenever age is invalid (because result is not ok), so errors in two fields never show together. Also no `aria-invalid` on invalid inputs in either island. Fix: set `aria-invalid` on the field when its error is shown.
5. `use-live-result.ts:50`: effect deps `[result, resultId]` omit `view`/`hasFigure` by design (commented). It works because both are derived from `result`, but a future caller could break it silently. Fix: document the contract in the Options doc or depend on a stable key.
6. `grocery-budget.ts:130`: dead `if (!group) continue` branch (only reachable if data is broken). Fine as a guard, but then it silently under-counts; consider throwing in a test-only assertion instead.
7. `GroceryBudgetCalculator.tsx:156-159`: when age drops below 12 the select is disabled but keeps its old value (harmless to results, since sex is ignored, but a stale "Male" shows in a disabled control). Fix: show "Choose" when disabled or clear it.
8. Grocery page does not say that the printed Thrifty monthly column sums to 1,023.90 against the printed reference-family 1,024.00. The page example shows only the weekly 236.30, so no inconsistency is visible to users; informational only.
9. Fiber `bandLabel` says "Ages 4-8, male/female" though both sexes have the same AI (25); cosmetic.
10. Titles rely on the placeholder site name ("| Site name TBD", 56 and 58 chars); a longer real name can push past 60. Re-check when the name is set.

## Values checked (all MATCH unless noted)

Method: a script parsed both source tables in `gan-harness/sources/grocery.md` and compared every weekly and monthly cell by index and value against `website/src/data/usda-food-plans.ts`. Result: Thrifty 15 rows x 2 = 30 cells, Low-Cost/Moderate/Liberal 15 rows x 2 x 3 = 90 cells, total 120, mismatches 0. Row order, labels, sex and min/max ages also read by eye: bands are 1, 2-3, 4-5, 6-8, 9-11 (sex any); 12-13, 51-70, 71-120 for all plans; Thrifty 14-19 and 20-50; others 14-18 and 19-50. All four plans have 15 groups.
- Thrifty reference family (male 20-50 73.60, female 20-50 58.60, child 6-8 48.30, child 9-11 55.80): weekly sum 236.30 (match). Monthly sum from the data 319.00 + 253.90 + 209.10 + 241.90 = 1,023.90 against printed 1,024.00 (within 0.10, as the spec expects; stored as printed, not derived).
- Fiber (IOM AI, g/day, male/female): 4-8 25/25; 9-13 31/26; 14-18 38/26; 19-30 38/25; 31-50 38/25; 51-70 30/21; 71+ 30/21. All 14 cells match `fiber.md` section 1. Age 1-3 (19 g), pregnancy, lactation not offered (match spec).
- Household factors (`grocery-budget.ts:48-55`): 1 -> 1.2, 2 -> 1.1, 3 -> 1.05, 4 -> 1.0, 5-6 -> 0.95, 7+ -> 0.9. Match (also exercised: 7 children -> 0.9, 12 -> 0.9).
- Age 19 and 20 (run through the function): male 19 Thrifty weekly 75.30 x 1.2 = 90.36 (teen band), male 20 Thrifty 73.60 x 1.2 = 88.32 (adult band); Low-Cost male 19 and 20 both 73.30 x 1.2 = 87.96 (adult band in both). Correct.
- Hand-computed vs function: family of four (men 30, woman 30, children 7 and 10) Thrifty weekly 236.30, monthly 1,023.90 (summed from monthly column, factor 1.00); Low-Cost 260.10/1,126.90; woman 30 alone Thrifty 58.60 x 1.2 = 70.32 weekly, 253.90 x 1.2 = 304.68 monthly (function returns 70.32 and 304.68). Fiber woman 40: AI 25, 2,000 kcal -> 28; 2,250 kcal -> 31.5 -> 32 (half up); 1,000 kcal -> 14.
- Edge inputs through the functions: " 07 " accepted as 7 (child, no sex needed); "1e1", "3,5", 99999999999999999999, NaN, Infinity rejected with message; "-0" gives the infant message; member with sex but no age -> "Enter an age." and is not silently dropped; 12 members compute (factor 0.9); 13 filled members -> `limitError`, no costs; 12 filled + 1 blank row computes; mixed valid/invalid computes from valid only and lists both errors; null age is treated as blank; empty list returns no costs. Fiber: calories "2,000" -> comma message; 999 and 4001 -> range note; " 1000 " -> 14 g; "1e3" and "abc" -> number note; age 18 with calories -> under-19 note; age 3 -> "covers ages 4 and over"; age 121, "4.5", "1e1" rejected; sex "Male" (capitalised) rejected with message (the island always sends lowercase); age 70 -> 51-70 band, 71 -> 71+ band.
- Recipe cost calculator, `git diff`: only changes are the extraction of debounce (600 ms), placeholder capture/restore on unmount, once-per-view `calculator_used` (tool name `recipe-cost-calculator`) into `use-live-result.ts` with logic copied verbatim; the `untouched` check moved to render time (same value); markup, ids and text untouched; recipe tests untouched and passing; the page's inline `<style is:global>` moved verbatim to `CalculatorStyles.astro` with new rules appended (confirmed: the rules appear in the built recipe page).
- Built fiber page, forbidden-term counts (heart, disease, risk, reduce, prevent, treat, cure, deficiency, constipation, diabetes, "you need", recommended, should): 0 each. "weight": 8 hits, all CSS `font-weight` in inlined styles, none in visible text.
- Built grocery page: four plans side by side in one table with caption, no combined range, text explicitly says "should not be read as a ladder from cheapest to dearest", Thrifty newer data, food at home only, no infants, no claim about non-food items, US average contiguous 48 + DC, as-of "September 2026", sources and URLs for landing page, both PDFs and TFP 2021 (FNS-916). Claim that Thrifty exceeds Low-Cost for some groups is true (child 4-5: 43.40 vs 41.30).
- Hard-coded colours/sizes in `CalculatorStyles.astro`: none (colours all `var(--...)`, widths in rem, borders 1/2/4 px only as border widths, same as before).
- Built `<title>`/description: fiber 56 chars / 139; grocery 58 / 131; one `<h1>` on each; `/_astro` has one island component per page (FiberCalculator, GroceryBudgetCalculator, RecipeCostCalculator on their own pages only).

## Already good (do not break)

- Data module is exactly the source, frozen, with both printed columns stored; tests include sanity bands, boundary and exhaustive age mapping.
- Rounding in cents only at the end, cleaned for float noise; monthly summed from monthly column.
- Never-throw result objects with per-member errors that do not hide valid members; household size uses valid members.
- Shared hook is small, documented, keeps announcement-quiet behaviour; focus management and polite removal announcement match the recipe calculator.
- Fiber page wording stays neutral, has the exact disclaimer, states the site's own calorie limit, TODO(dietitian) present, no review claimed.
