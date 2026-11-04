# 04 - Calculators

Status: DRAFT. Three calculators in the MVP. Formulas and data sources are TBD and must be cited before launch.

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
