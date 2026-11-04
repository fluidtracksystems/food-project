# ADR 0001 - Astro static site

Date: 2026-11-04. Status: Proposed.

## Context
The site is content-heavy (recipes, hubs) with a few interactive calculators. SEO from day one is a requirement. Budget is minimal and the developer is solo.

## Decision
Use Astro in static-output mode, with content collections for recipes and Preact islands for calculators.

## Alternatives considered
- **WordPress:** large recipe-plugin ecosystem; a source quoted about $425/year managed hosting (single operator's blog) plus ongoing upkeep.
- **Next.js:** strong SEO tooling; a source indicated commercial use of Vercel's free tier is restricted and Pro is $20/member/month (single vendor blog; verify).
- **Astro 6.4.8:** documentation I could retrieve matches it; kept as the fallback.

## Consequences
- Pages ship little JavaScript by default; good for Core Web Vitals.
- No built-in CMS: the chef's recipes need a file-based workflow (TBD).
- Recipe JSON-LD is written by us, not a plugin; the schema must be validated.

## Unknowns
- Astro 7 content-collection API differences (to be confirmed on first build).
- Cost claims above come from marketing and personal blogs; verify before relying on them.
