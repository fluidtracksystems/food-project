# 03 - Recipe Content Model

Status: IMPLEMENTED (2026-11-04). The Zod schema is `recipeSchema()` in `website/src/lib/recipe-schema.ts` (a function of Astro's `image()` helper so it can be unit-tested), wired up in `website/src/content.config.ts`. JSON-LD is built by `website/src/lib/recipe-jsonld.ts`. Tests are in `website/tests/`.

## Frontmatter fields (proposed)

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | Unique per recipe |
| `description` | string | yes | Meta description and Recipe `description` |
| `pillar` | `low-energy` \| `small-portion` \| `leftovers` | yes | Drives hub membership |
| `image` | image asset | yes | Photo (stock until the chef shoots; credited); required for Recipe rich results per third-party guides |
| `imageAlt` | string | yes | Accessibility |
| `imageCredit` | object | no | Stock photo credit: `photographer`, `source` (Unsplash, Pexels or Pixabay), `url` (https photo page). Shown as a caption. Remove it when a chef photo replaces the stock image |
| `author` | string | yes | Chef name (named-face decision open) |
| `datePublished` | date | yes | |
| `dateModified` | date | no | |
| `servings` | number | yes | Drives `recipeYield` |
| `prepMinutes` | number | yes | Converted to ISO 8601 duration |
| `cookMinutes` | number | yes | Converted to ISO 8601 duration; `0` is allowed (no-cook recipes) |
| `effort` | string (1-40 chars) | yes | Badge text such as "One pot"; not in JSON-LD (schema.org has no matching property) |
| `ingredients` | array of `{ item, metric, us, note? }` | yes | Metric is canonical; US customary shown alongside |
| `steps` | array of strings | yes | Becomes `HowToStep` list |
| `tags` | array of strings | no | Used for related recipes |
| `leftoverNote` | string | no | Storage/reheating note; food-safety source TBD |
| `estimatedCostPerServing` | number | no | Currency TBD; ties to the cost calculator |
| `nutrition` | object | no | Only when verified; no health claims |
| `draft` | boolean | no | Excluded from build when true |

## JSON-LD mapping (Recipe)

| Schema.org property | Source |
|---|---|
| `name` | `title` |
| `image` | `image` (absolute URL) |
| `description` | `description` |
| `author` | `author` as `Person` |
| `datePublished` | `datePublished` |
| `prepTime` / `cookTime` / `totalTime` | Minutes to ISO 8601 (for example `PT15M`) |
| `recipeYield` | `servings` |
| `recipeCategory` | `pillar` |
| `recipeIngredient` | `ingredients[].us` and `ingredients[].metric` (decision TBD: one list or both) |
| `recipeInstructions` | `steps` as `HowToStep` |
| `keywords` | `tags` |
| `nutrition` | `nutrition`, when present |

## Rules

- A recipe missing a required field must fail the build (Zod validation).
- Units: metric canonical; render US customary alongside.
- No medical or treatment claims in recipe copy.

## Open items

- [ ] Required vs recommended Recipe properties: verify against Google's Recipe documentation and the Rich Results Test (third-party guides disagree; only `image` is agreed)
- [x] Single ingredient list or two lists in JSON-LD: for now `recipeIngredient` uses the US amount plus item and note (for example `"1 cup cooked rice"`). Revisit before launch.
- [ ] Currency for `estimatedCostPerServing`
- [ ] Which food-safety authority governs `leftoverNote` (US USDA vs NZ MPI)
