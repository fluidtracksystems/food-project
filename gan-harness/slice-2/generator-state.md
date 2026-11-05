# Generator State - Iteration 001

No git commands were run; all changes are uncommitted.

## Files created
- website/src/lib/units.ts
- website/src/lib/calculators/recipe-cost.ts
- website/src/lib/tools.ts
- website/src/components/calculators/RecipeCostCalculator.tsx (Preact island)
- website/src/pages/tools/index.astro
- website/src/pages/tools/recipe-cost-calculator.astro (also holds the `.rc-*` styles, as a page-level global style block)
- website/tests/units.test.ts, recipe-cost.test.ts, tools.test.ts

## Files changed
- website/src/layouts/RecipeLayout.astro: `no-print` link to the tool under the Ingredients heading
- Deleted the three `.gitkeep` files (tools page dir, lib/calculators, components/calculators)

## Validation
- Tests written first and confirmed failing (3 files, modules missing), then implemented.
- `npm run check`: 0 errors, 0 warnings, 0 hints.
- `npm test`: 11 files, 167 tests pass (52 new).
- `npm run build`: 4 pages (404, index, /tools/, /tools/recipe-cost-calculator/); sitemap lists both tool URLs; the island script is only referenced from the tool page (client="visible").
- `PUBLIC_INCLUDE_DRAFTS=true npm run build`: 12 pages; recipe pages link to the tool; the tool page lists recipe cards. Production tool page has no recipes heading (zero published recipes).
- The `<!-- TODO(chef): review cost assumptions -->` comment is present in the built HTML (it had to sit inside the `<section>`; Astro drops comments placed directly in a layout slot).

## Decisions
- Row results use `{kind:'empty'|'ok'|'error'}`; `perServing` is null and `servingsError` set when servings is invalid; the total is always computed from valid rows.
- Fields accept strings or numbers; text parsed with a strict decimal regex (rejects `0x10`, `1,5`, `NaN`, `Infinity`).
- A row is empty only if name, quantity, pack price and pack size are all blank; a row with just a name is an error.
- `formatUsd` cleans the value to 12 significant digits before rounding half up (so 1.005 gives $1.01), then uses Intl en-US USD.
- The island renders totals into ToolShell's `role="status"` div (`#rc-result`) with Preact `render`, because the island cannot fill a separate Astro slot. The static placeholder text there is replaced on hydration.
- Inputs are `type="text"` with `inputmode` so the app's own error messages show rather than silent browser number handling.
- Labels show the row number visibly ("Amount used  row 2"); each row is a `fieldset` with legend "Ingredient N"; row errors use `aria-describedby` and the text "Problem in row N:".
- Remove button is disabled when only one row remains; after removal focus goes to the Add button.

## Known issues / not done
- No browser or screen-reader testing was done (no browser tools); 320px/200% zoom behaviour relies on the grid with `minmax` and wrapping, not verified visually.
- Row errors appear as soon as a row is partly filled (for example a name only).
- Dev server not started.
