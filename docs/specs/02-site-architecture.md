# 02 - Site Architecture

Status: DRAFT. Derived from the PRD (`.claude/PRPs/prds/chef-low-effort-kitchen.prd.md`).

## Content pillars

| Pillar | URL | Purpose |
|---|---|---|
| Low-energy cooking | `/low-energy/` | Sick-day, lazy and no-cook meals |
| Small-portion cooking | `/small-portion/` | Small, protein-dense, gentle meals; framed discreetly (no medical claims) |
| Leftovers | `/leftovers/` | Reusing leftovers; cooking for one |

## URL structure

| Page type | URL pattern | Notes |
|---|---|---|
| Home | `/` | Pillars, featured recipes, tools, email signup |
| Pillar hub | `/{pillar}/` | Lists recipes in the pillar; internal-link hub |
| Recipe | `/recipes/{slug}/` | Recipe JSON-LD, dual units, related recipes |
| Tools index | `/tools/` | Lists calculators |
| Tool | `/tools/{tool}/` | `grocery-budget-calculator`, `recipe-cost-calculator`, `fiber-calculator` |
| About | `/about/` | Chef's story and credentials (author trust) |
| Legal | `/privacy/`, `/disclaimer/` | Health disclaimer is required before any health content launches |

## Templates

- `BaseLayout` (head, canonical, OG/Twitter, JSON-LD slot, nav, footer)
- `RecipeLayout` (uses the recipe content model in `03-recipe-content-model.md`)
- `PillarLayout`, `ToolLayout`
- Components: `RecipeSchema` (JSON-LD), `UnitToggle` (optional), calculator islands

## Internal linking rules (proposed)

- Every recipe links to its pillar hub and at least two related recipes.
- Every tool page links to 2-3 relevant recipes; recipes link to a relevant tool when one applies (for example, recipe cost).
- Hubs link to every recipe in the pillar.

## SEO requirements (details in `seo/technical/checklist.md`)

- One canonical URL per page; sitemap generated; `robots.txt` generated from `site`.
- Static HTML for all content pages; JavaScript only inside calculator islands.
- Each recipe page has a photo (stock until the chef shoots, credited), valid Recipe schema and a unique title/description.

## Open items

- [ ] Final site name and domain strategy (subdomain vs dedicated domain)
- [ ] Whether the chef is the named face (affects `/about/` and author markup)
- [ ] Whether a hub page may include editorial copy beyond recipe lists
