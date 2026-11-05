# 04 - Calculators

Status: IMPLEMENTED (slices 2 and 4), pending the launch checks below. Three calculators in the MVP.

## Implemented

All three follow the design rules below: pure functions in `website/src/lib/calculators/` with tests, a Preact island, and a static page that states the formula, cites its source and lists its limits.

- **Recipe cost** (`/tools/recipe-cost-calculator/`): pack price x amount used / pack size, with unit conversion from the exact NIST definitions (`src/lib/units.ts`). USD only.
- **Grocery budget** (`/tools/grocery-budget-calculator/`): USDA Food Plans, September 2026. Each person's weekly and monthly cost for their age and sex, summed per plan, then multiplied by USDA's household-size factor (1 person x1.20, 2 x1.10, 3 x1.05, 4 x1.00, 5-6 x0.95, 7+ x0.90). The four plans (Thrifty, Low-Cost, Moderate-Cost, Liberal) are shown side by side, never as a range: Thrifty uses newer data (2021 re-evaluation) than the other three and is higher than Low-Cost for some groups. Data is in `src/data/usda-food-plans.ts`, transcribed as printed. Weekly and monthly are summed from their own printed columns, never derived from each other (USDA's monthly figure comes from unrounded weekly values). Food at home only, US average costs (USDA publishes separate Alaska and Hawaii figures for the Thrifty plan only; not used), no infants, no income input (the source does not support one).
- **Fiber** (`/tools/fiber-calculator/`): the IOM Adequate Intake for total fiber by age (4 and over) and sex, with an optional second figure of 14 g per 1,000 kcal for adults 19 and over. The calorie range accepted (1,000 to 4,000 kcal) is this site's own limit, not from a source. No pregnancy or lactation values, no ages under 4. The Dietary Guidelines for Americans 2025-2030 give no gram target, so the page cites the 2020-2025 edition for the per-calorie basis. Published with a visible "general guideline, not medical advice" disclaimer. The copy makes no health outcome claims.

## Before launch

- [ ] **Dietitian review of the fiber page** (`TODO(dietitian)` in `fiber-calculator.astro`). The owner chose to publish with a disclaimer rather than hold the page back, so this is a launch-checklist item, not a code gate. Health-adjacent pages need review before launch (see `CLAUDE.md`).
- [ ] **Chef review of the cost assumptions** (`TODO(chef)` in the recipe cost and grocery pages).
- [ ] **Refresh the USDA data monthly, or at least on a schedule you commit to.** USDA publishes about a month after the price month. Steps: take the report URLs from the USDA landing page (file names change month to month), update `usda-food-plans.ts` (as-of month, report names and URLs, retrieved date and the 120 values), and run the tests. The page shows the as-of month, so stale data is visible but not automatic.
- [ ] Visually confirm the Low-Cost, Moderate-Cost and Liberal rows against the USDA PDF. They were read from extracted text and the row alignment was inferred (the four-person family totals match third-party figures, which supports it).
- [ ] The IOM fiber table was read from a National Academies summary marked "prepublication copy, uncorrected proofs". The original chapter text could not be opened, so the exact IOM sentence on the 14 g per 1,000 kcal basis is unverified; the page relies on the Dietary Guidelines for that basis.

## Scope

| Calculator | URL | Why | Search demand (US/mo, OpenSEO 2026-11-04) |
|---|---|---|---|
| Grocery budget | `/tools/grocery-budget-calculator/` | Wealth angle; weak SERP | "grocery budget calculator" 2.9k |
| Recipe cost per serving | `/tools/recipe-cost-calculator/` | Ties to recipes; hook for the costing spreadsheet product | "recipe cost calculator" 880; "cost per serving calculator" 110 |
| Fiber | `/tools/fiber-calculator/` | Low-competition tool | "fiber calculator" 2.9k |

Deferred (post-MVP): GLP-1-aware protein/portion calculator. It needs dietitian-reviewed formulas. Not built in the MVP.

## Design rules

- Calculation logic lives in pure TypeScript functions in `website/src/lib/calculators/`; the Preact island only handles input and display.
- Every function has unit tests (Vitest), including edge cases: zero, negative, empty, very large, non-numeric input.
- Every calculator page cites its formula source and states its limits.
- Results are estimates; no medical or dietary advice.
- Accessible by default: labels, keyboard use, readable results.

## Inputs and outputs (draft)

### Grocery budget
- Inputs: household size, ages or adult/child counts, spending level (data source TBD), optional income.
- Output: suggested weekly/monthly grocery budget range.
- Open: data source (for example USDA food plans; US numbers vs NZ) must be verified and dated.

### Recipe cost per serving
- Inputs: ingredient rows (name, quantity, unit, price per pack, pack size), servings.
- Output: total cost and cost per serving.
- Needs unit conversion (metric/US) shared with `website/src/lib/units.ts`.

### Fiber
- Inputs: age, sex, (optional) calorie intake.
- Output: daily fiber target.
- Open: formula source (for example Institute of Medicine guidance) to be cited and verified.

## Open items

- [ ] Formula/data sources for each calculator (verify and cite)
- [ ] Currency and unit defaults (US-first; NZ users)
- [ ] Whether results can be saved or shared (not planned for the MVP)
- [ ] Chef review of cost assumptions
