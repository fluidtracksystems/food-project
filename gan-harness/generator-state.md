# Generator State - Iteration 001

All changes are uncommitted on `feat/slice-4-grocery-fiber-calculators` (no git commit/push/checkout run).

## Files created
- `website/src/data/usda-food-plans.ts` (Sept 2026 data, 4 plans x 15 groups, weekly and monthly as printed, frozen; checked against `sources/grocery.md` by script, all 59 parsed rows match, child 1 year verified by hand and by tests)
- `website/src/lib/calculators/grocery-budget.ts`, `website/src/lib/calculators/fiber.ts`
- `website/src/components/calculators/use-live-result.ts` (shared debounced live-region hook, takes tool name)
- `website/src/components/calculators/GroceryBudgetCalculator.tsx`, `FiberCalculator.tsx`
- `website/src/components/calculators/CalculatorStyles.astro` (shared `.rc-*` styles moved out of the recipe page unchanged, plus small new rules: `.rc-narrow`, `.rc-age-sex`, `.rc-hint`, `.rc-plans`, `.rc-fiber-figure`)
- `website/src/pages/tools/grocery-budget-calculator.astro`, `fiber-calculator.astro`
- Tests: `website/tests/usda-food-plans.test.ts`, `grocery-budget.test.ts`, `fiber.test.ts` (written first and confirmed failing before implementation)

## Files changed
- `website/src/components/calculators/RecipeCostCalculator.tsx`: live-region code replaced by `useLiveResult`; markup, ids, text unchanged.
- `website/src/pages/tools/recipe-cost-calculator.astro`: `<style is:global>` block removed, replaced by `<CalculatorStyles />` (same rules).
- `website/src/lib/tools.ts` (two tools added), `website/tests/tools.test.ts` (one test added).

## Validation
- `npm run check`: 0 errors, 0 warnings, 0 hints.
- `npm test`: 17 files, 337 tests pass (201 existing + 136 new).
- `npm run build`: 6 pages; sitemap has /, /tools/, and all three tool pages. Each new island script loads only on its own page.
- `PUBLIC_INCLUDE_DRAFTS=true npm run build`: 14 pages; 3 recipe cards on each tool page. Production build renders no recipes section (0 `recipes-h`).
- Fiber page built HTML: no heart/disease/risk/reduce/prevent/treat/cure/deficiency/constipation/diabetes/"you need"/"should"; "weight" only appears in CSS. TODO(dietitian) comment is in the fiber page source and survives in built HTML; TODO(chef) in the grocery page.
- Final state of `website/dist/` is the production build.

## Decisions
- Titles: page titles are 42 and 40 characters before the layout's " | Site name TBD" suffix (total 59 and 57). Descriptions 130 and 138 characters.
- Grocery: more than 12 non-blank rows returns `limitError` and no figures (UI caps rows at 12 and disables Add, so it is a logic-level guard). Blank-age with sex chosen is an error ("Enter an age"). Sex select is disabled when the age is a whole number under 12.
- Fiber: calories given for age under 19 gives a note, not a figure; note shown inline under the field and in the result. Calorie rounding half up after cleaning float noise.
- `formatUsd` reused from `recipe-cost.ts`.
- `.rc-about` and `.rc-servings` also moved to the shared styles so all three pages get them.

## Known issues / not done
- No browser check was done (no servers started per instructions); a11y behaviour (focus after Remove, announcements) mirrors the recipe calculator but was verified by code reading and build only.
- The Low/Mod/Liberal row alignment is flagged UNVERIFIED visually in the source notes; the data follows the notes exactly.
