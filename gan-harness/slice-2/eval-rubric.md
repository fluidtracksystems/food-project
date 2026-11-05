# Evaluation rubric: Recipe cost calculator (slice 2)

Score each criterion 0 to 10, then compute the weighted total. Pass threshold: 7.0. Hard rule: if `npm run check` has errors, `npm test` fails, or `npm run build` fails, the total is capped at 4.0.

The default GAN rubric (design, originality, craft, functionality) does not fit this slice: the visual design is already approved and fixed in `docs/design/DESIGN.md`. This rubric replaces it.

Evaluation mode is **code-only**: do not use browser tools. Run the commands below from the repo root `D:\projects\food.quantityhost.com`, read the code and the built HTML, and cite file:line evidence for every score. Never run two builds in parallel (they share `website/dist/`): run the production build, inspect it, then run the drafts build.

| # | Criterion | Weight | What a 9 to 10 looks like |
|---|-----------|--------|---------------------------|
| 1 | Correctness and tests | 30% | Tests were clearly written first and cover zero, negative, empty, very large, non-numeric, NaN/Infinity, mixed units, incompatible units, many rows, servings of 1, half-cent rounding. Conversion factors match the spec exactly. Hand-check at least three calculations (for example 250 g from a 1 kg pack at $4.00 is $1.00; 1 cup flour from a 2 lb bag at $3.20; a bad row does not hide good rows). One bad row never throws. |
| 2 | Accessibility | 20% | Every input has an associated visible label with a unique name per row; keyboard operable; buttons have row-specific accessible names; errors are text tied with `aria-describedby`, not colour alone; 44px targets via `var(--target)`; result in the polite live region; sensible at 320px and 200% zoom; no `outline: none` without a replacement; works with dark mode via tokens. |
| 3 | Design-system fit | 15% | Uses `ToolShell`, tokens from `website/src/styles/tokens.css` and existing global classes; no hard-coded colours, fonts or external requests; no changes to existing component APIs; looks like the rest of the site; print and dark mode not broken. |
| 4 | Page contract, SEO and links | 15% | Both pages build in production; unique title under 60 chars and description of 70 to 160 chars; one `<h1>`; sensible heading order; the formula, NIST citation and limits are visible static text; the chef-review TODO comment is present and no chef-review claim is made; the tool page links 2 to 3 recipes and renders nothing (no empty heading, no broken links) when there are none; recipe pages link to the tool and the link is hidden in print; both tool URLs appear in the production sitemap. |
| 5 | Code quality and weight | 10% | Calculation logic only in pure functions under `website/src/lib/`; the component only handles input and display; no dependency changes; island hydrates with `client:visible` and no other page loads its JS (check built HTML/`dist/_astro`); small, readable files; no dead code or leftover `.gitkeep` in directories that now have files. |
| 6 | Scope and content safety | 10% | Nothing from the "Out of scope" list was built; no medical or dietary claims; no analytics, no new dependencies; edits limited to the files this slice needs; no commits were made by the generator (`git log` unchanged from `b8a6a92`). |

## Commands to run (in this order, one at a time)
1. `git status --short` and `git log --oneline -3`
2. `npm run check`
3. `npm test`
4. `npm run build` then inspect `website/dist/` (tools pages, sitemap, `_astro` scripts)
5. `PUBLIC_INCLUDE_DRAFTS=true npm run build` (Git Bash) then inspect the recipe page link and the tool page recipe links

## Output
Write `gan-harness/feedback/feedback-NNN.md` (NNN = iteration, three digits) containing:
- A score table with the six criteria, weights, scores and one-line evidence.
- A line exactly of the form `WEIGHTED TOTAL: X.X` (one decimal).
- A numbered list of concrete defects, most severe first, each with file:line and a fix the generator can apply.
- A short list of what is already good (so the generator does not break it).
Be strict and specific. Do not praise to be polite. Do not edit any source files.
