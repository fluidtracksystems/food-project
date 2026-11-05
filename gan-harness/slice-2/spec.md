# Spec: Recipe cost calculator (slice 2)

Repo: D:\projects\food.quantityhost.com (Astro 7 static site in `website/`). Read `CLAUDE.md` first.
Context docs: `docs/specs/04-calculators.md`, `docs/specs/02-site-architecture.md`, `docs/adr/0002-us-first-market.md`, `docs/design/DESIGN.md`.
Branch: `feat/slice-2-recipe-cost-calculator`. **Do not commit, push, or switch branches.** The orchestrator commits after review.

## Goal
A working, correct, accessible "recipe cost per serving" calculator at `/tools/recipe-cost-calculator/`, plus a `/tools/` index. It is the first Preact island on the site and sets the pattern for the other two calculators.

## User flow
Search -> tool page -> enter ingredient rows and servings -> see total cost and cost per serving -> follow links to related recipes.

## Scope (build exactly this, nothing more)

### 1. Pure logic, tests first (Vitest, in `website/tests/`)
Write the failing tests BEFORE the code, and keep calculation logic out of the component.

**`website/src/lib/units.ts`** (shared unit conversion)
- Dimensions: mass (`g`, `kg`, `oz`, `lb`), volume (`ml`, `l`, `tsp`, `tbsp`, `cup`, `floz`), count (`each`).
- `convert(amount, from, to)` converts within one dimension only. Across dimensions (for example `g` to `cup`) it must report an error, never guess a density.
- Exact factors (international avoirdupois and US customary definitions): 1 lb = 453.59237 g; 1 oz = 28.349523125 g; 1 US tsp = 4.92892159375 ml; 1 US tbsp = 14.78676478125 ml; 1 US fl oz = 29.5735295625 ml; 1 US cup = 236.5882365 ml; 1 kg = 1000 g; 1 l = 1000 ml.
- Return a result object (for example `{ ok: true, value } | { ok: false, error }`), not exceptions, for invalid units, non-finite or negative amounts.

**`website/src/lib/calculators/recipe-cost.ts`**
- Input per row: `name` (string, may be empty), `quantity` (amount used), `unit`, `packPrice`, `packSize`, `packUnit`. Plus `servings`.
- Row cost = `packPrice * (quantity converted to packUnit) / packSize`.
- Output: per-row `{ cost } | { error }`, `total` (sum of valid rows), `perServing` (`total / servings`), and a list of row errors. One bad row must not hide the others.
- Reject with a clear, user-readable error message: non-numeric or non-finite values, negative numbers, `packSize <= 0`, `servings` not a positive whole number, incompatible units. Treat zero quantity as a valid zero-cost row. Empty rows (nothing entered) are ignored, not errors.
- Money: compute with plain numbers, round half up to cents only when formatting. Provide `formatUsd(n)` using `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`. Currency is USD (see ADR 0002).
- Tests must cover: zero, negative, empty, very large, non-numeric, NaN/Infinity, mixed metric and US units, incompatible units, many rows, servings of 1, rounding at half-cent boundaries.

### 2. The island
**`website/src/components/calculators/RecipeCostCalculator.tsx`** (Preact). It only handles input and display and calls the pure functions.
- Rows are add/remove-able, starting with 3 rows. A servings field. A visible result: total and cost per serving. Per-row cost shown beside each row.
- Hydrated with `client:visible`. No other page may load this island's JavaScript.
- Accessibility: every input has a programmatically associated visible label (include the row number so labels are unique); fully keyboard operable; add/remove buttons have accessible names that include the row; errors are shown as text next to the row, tied to the field with `aria-describedby` and not conveyed by colour alone; interactive targets are at least `var(--target)` (44px); visible focus ring from the existing global styles; works at 320px width and with 200% text zoom; respects dark mode.
- The result region is the existing `role="status" aria-live="polite"` slot in `ToolShell`.
- Use design tokens from `website/src/styles/tokens.css`. No hard-coded colours, no new fonts, no external requests.
- Before the island loads (and with JavaScript off) the page still shows the full explanation, the formula and the source note (static HTML). Add a short `<noscript>` message.

### 3. Pages and links
- `website/src/pages/tools/recipe-cost-calculator.astro`: uses `BaseLayout` + `ToolShell`. Unique `<title>` (under 60 characters) and meta description (70 to 160 characters). Static content: what it does, how to use it, the formula, limits, and the source note (below).
- `website/src/pages/tools/index.astro`: lists the calculators that exist (just this one now) as cards, with a short blurb each. Unique title and description.
- `website/src/lib/tools.ts`: one small list of tools (slug, title, blurb, path) used by the index page, so the next calculators only add an entry. Keep it minimal and test it if it has logic.
- Tool page links to 2 to 3 recipes using the existing `getRecipes()` and `relatedRecipes`-style selection (newest first is fine). In a production build there may be zero published recipes: render nothing, no broken links and no empty heading.
- Recipe pages link to the tool: add one clear link near the Ingredients section in `website/src/layouts/RecipeLayout.astro`, hidden in print (`no-print`).
- Remove `website/src/pages/tools/.gitkeep`, `website/src/lib/calculators/.gitkeep` and `website/src/components/calculators/.gitkeep` only if the directory now has real files.

### 4. Source note and limits (on the tool page, visible text)
- State the formula in words: cost of an ingredient = pack price x (amount used / pack size) after converting to the pack's unit; cost per serving = total / servings.
- Cite the unit definitions: NIST Handbook 44, Appendix C (General Tables of Units of Measurement), and NIST SP 811. Say the values are US customary definitions and that results are estimates.
- Limits: it does not include food waste, trimming loss, tax, energy or labour; weights and volumes cannot be converted to each other without the ingredient's density, so mixed rows need the same kind of unit as the pack. No medical or dietary advice.
- Leave a visible-in-source HTML comment `<!-- TODO(chef): review cost assumptions -->` (the specs require chef review). Do not claim the chef has reviewed it.

## Out of scope (do NOT build)
Saving or sharing results, accounts, analytics events (slice 3), the grocery budget and fiber calculators (slice 4), density conversions, currency switching, a unit toggle, nutrition, changes to the recipe schema, new dependencies, and changes to the design tokens or existing component APIs.

## Constraints
- Conventions from `CLAUDE.md`: `kebab-case` files, `camelCase` functions, `PascalCase` components and types, metric canonical with US alongside, no medical claims, calculation logic in pure functions under `website/src/lib/`.
- Do not add dependencies. TypeScript stays on `^6`.
- Do not edit existing tests except to extend them. Existing tests must keep passing.
- Windows host: run commands from the repo root (`npm run check`, `npm test`, `npm run build`). For the drafts build in PowerShell use `$env:PUBLIC_INCLUDE_DRAFTS='true'; npm run build`; in Git Bash use `PUBLIC_INCLUDE_DRAFTS=true npm run build`. Never run two builds at the same time: they share `website/dist/`.
- Keep a short log of what you built and any decisions in `gan-harness/generator-state.md`.

## Definition of done
`npm run check` reports 0 errors; `npm test` passes with new tests; `npm run build` passes and the production build contains `/tools/` and `/tools/recipe-cost-calculator/`; the tool page and the island behave as described above.
