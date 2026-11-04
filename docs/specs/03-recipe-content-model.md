# 03 - Recipe Content Model

Status: DRAFT. Implemented as a Zod schema in `website/src/content.config.ts` in the scaffold phase.

## Frontmatter fields (proposed)

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | Unique per recipe |
| `description` | string | yes | Meta description and Recipe `description` |
| `pillar` | `low-energy` \| `small-portion` \| `leftovers` | yes | Drives hub membership |
| `image` | image asset | yes | Original photo; required for Recipe rich results per third-party guides |
| `imageAlt` | string | yes | Accessibility |
| `author` | string | yes | Chef name (named-face decision open) |
| `datePublished` | date | yes | |
| `dateModified` | date | no | |
| `servings` | number | yes | Drives `recipeYield` |
| `prepMinutes` | number | yes | Converted to ISO 8601 duration |
| `cookMinutes` | number | yes | Converted to ISO 8601 duration |
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
- [ ] Single ingredient list or two lists in JSON-LD
- [ ] Currency for `estimatedCostPerServing`
- [ ] Which food-safety authority governs `leftoverNote` (US USDA vs NZ MPI)
