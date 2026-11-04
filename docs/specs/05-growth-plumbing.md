# 05 - Growth Plumbing

Status: DRAFT. Providers are undecided; no vendor claims are made here.

## Requirements

| Capability | Requirement | Provider |
|---|---|---|
| Email capture | Signup form on home, recipes, tools; consent text; double opt-in if the provider supports it | TBD |
| Analytics | Page views, calculator usage events, signups; respect privacy | TBD |
| Search Console | Verified property; sitemap submitted | Google Search Console |
| Social meta | Open Graph and Twitter cards on every page; Pinterest-friendly vertical images for recipes | n/a |
| Social links | Pinterest and Instagram profile links in header/footer | n/a |

## Events to track (proposed)

- `calculator_used` (tool name)
- `email_signup` (page, form)
- `recipe_viewed` (slug, pillar)
- Outbound click to Pinterest/Instagram

## Privacy and legal (to confirm)

- Privacy page describing analytics and email use.
- Cookie/consent approach depends on the analytics choice and audience location (US-first; NZ chef).
- Health disclaimer page before health-related content launches.

## Open items

- [ ] Choose email provider (compare free tiers from official pricing pages)
- [ ] Choose analytics (cookie-less vs GA4; verify terms)
- [ ] Pinterest/Instagram account names and whether to use Pinterest rich pins (requirements unverified)
- [ ] Whether to add the recipe image sizes Pinterest prefers (unverified)
