# food.quantityhost.com

A chef-led, SEO-first recipe and calculator site: low-energy cooking, small-portion cooking, and leftovers. US-first audience, New Zealand-based chef. See the PRD for the full rationale.

## Folder map

| Folder | Purpose |
|---|---|
| `website/` | Astro app (code, content, tests) |
| `seo/` | Search strategy: keyword research, SERP notes, content briefs, technical checklist, tracking |
| `gtm/` | Go-to-market: positioning, channels, calendar, products, outreach, metrics |
| `docs/` | Technical specs (`specs/`) and decision records (`adr/`) |
| `.claude/PRPs/` | PRD, plans, and implementation reports |

## Key documents

- PRD: `.claude/PRPs/prds/chef-low-effort-kitchen.prd.md`
- Stack spec: `docs/specs/01-stack.md`
- ECC setup order: `docs/specs/06-ecc-setup.md`
- Contact form, local previews and deployment checks: `docs/specs/08-contact-form.md`

## Status

Structure and specs only. No dependencies installed and no application code yet (next: Astro scaffold, PRD Phase 1 follow-up).

## ECC note

ECC's install scripts auto-load `ecc-install.json` from the folder they run in and need the `ajv` package in the ECC plugin cache. It was installed on 2026-11-04 and the dry-run now passes. After an ECC plugin update, check `docs/specs/06-ecc-setup.md` if commands report a missing package.

## Next commands (in order)

1. `git init` (you)
2. `/ecc:project-init` and review its dry-run
3. `/ecc:configure-ecc` if you want the project-scoped rules (see `docs/specs/06-ecc-setup.md`)
4. `/ecc:prp-plan` for the Astro scaffold
