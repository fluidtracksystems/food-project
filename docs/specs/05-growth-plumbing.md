# 05 - Growth Plumbing

Status: PARTLY IMPLEMENTED (slice 3). Providers are still undecided; no vendor claims are made here.

## Implemented without a provider

- **Email signup** (`EmailSignup.astro`, `src/lib/email.ts`): a plain HTML form that posts to the provider's endpoint. It renders only when `PUBLIC_EMAIL_FORM_ACTION` is a valid `https` URL without credentials; otherwise nothing renders in a production build (dev shows a hint). The variable is public by design: it ships in the page HTML, so it must be a form endpoint, never a secret or API key. Placed on the home page, recipe pages and the recipe cost calculator page. The consent text has no Privacy link yet because `/privacy/` does not exist.
- **Analytics hook** (`src/lib/analytics.ts`, `src/scripts/track.ts`): `track(name, params)` validates a typed event and dispatches one DOM event, `site:analytics`, with `detail = { name, params }`. No cookies, no network calls, no vendor. A provider later subscribes with `window.addEventListener('site:analytics', e => provider.send(e.detail.name, e.detail.params))`. Events: `calculator_used` (tool; once per page view, on the first real result), `email_signup` (page, form; on submit, never the address), `recipe_viewed` (slug, pillar; on load), `outbound_click` (destination, page; Pinterest or Instagram). Any value containing `@` is refused. Content pages load about 1.1 KB gzipped of JavaScript for this.
- **Social links** (`src/lib/social.ts`, `SOCIAL_LINKS` in `navigation.ts`): a link renders only if it is `https` on pinterest.com or instagram.com with no credentials. The list is empty until the accounts exist.
- **Social meta**: Open Graph and Twitter tags on every page, plus `og:locale` and image alt text where a page has an image.

## Before setting `PUBLIC_EMAIL_FORM_ACTION` in production

From the slice 3 security review:

- [ ] The `/privacy/` page exists, names the email provider, and the signup text links to it (US-first audience: say what is collected and why at the point of collection). The footer already links to `/privacy/`, which is a 404 until then.
- [ ] The value is checked by hand before each release. The code accepts any `https` host, so a typo or the wrong provider would send subscribers' addresses to a third party. It must be a form endpoint only: no API key or token, in the path or the query string, because it ships to every visitor.
- [ ] Each email carries the sender's postal address and a working unsubscribe link (CAN-SPAM). This is the provider's template, not the site.
- [ ] When an analytics vendor is added as a `site:analytics` listener, revisit consent and Global Privacy Control handling; today nothing is sent anywhere.

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
