# 07 - Launch checklist

Status: LIVING DOCUMENT. Everything still open before the site goes public, collected from the specs, the PRD, code comments (`TODO(chef)`, `TODO(dietitian)`, `TODO(legal)`) and the reviews run while building. Written 2026-11-05 after the first five build slices. Tick items as they are done; add the date.

What exists today: the Astro site with a design system, recipe template and JSON-LD, pillar hubs, three calculators, an email signup shell, an analytics hook, and About, Privacy and Disclaimer pages. All recipes are placeholders or fixtures (drafts), so a production build lists no recipes. Nothing is deployed.

## Decisions only the owner can make

- [ ] **Site name and domain.** `SITE_NAME` in `website/src/lib/site.ts` and `site` in `website/astro.config.mjs` are placeholders; the header, footer, About heading and every page title show "Site name TBD".
- [ ] **Chef identity** (named face or brand). `AUTHOR_BOX_VARIANT` in `site.ts`. The About page says only what is known; add the chef's story and credentials (`TODO(chef)` in `about.astro`).
- [ ] **Email provider.** Set `PUBLIC_EMAIL_FORM_ACTION` (an https form endpoint, never a key or token), `EMAIL_PROVIDER_NAME` and `CONTACT_EMAIL` in `site.ts`. The build fails if the form is on without the other two. Confirm the provider's emails carry the sender's postal address and an unsubscribe link (CAN-SPAM). Check the endpoint value by hand before each release: the code accepts any https host.
- [ ] **Analytics vendor** (or none). Today nothing is sent anywhere; the `site:analytics` DOM event is the hook. Adding a vendor means updating the privacy page first and revisiting consent and Global Privacy Control.
- [ ] **Social accounts.** Fill `SOCIAL_LINKS` in `navigation.ts` (https on pinterest.com or instagram.com only). Decide whether to use Pinterest rich pins and which image sizes (both unverified).
- [ ] **Hosting.** Cloudflare Pages is proposed; confirm its terms and limits before relying on it (`01-stack.md`). Set `SITE_URL` for the real domain.
- [ ] **Food-safety authority** for `leftoverNote` and the leftovers pages: US (USDA) or NZ (MPI).
- [ ] **Currency** for `estimatedCostPerServing`, and whether hub pages get editorial copy beyond recipe lists.
- [ ] **Minor stack choices** still open in `01-stack.md`: npm vs pnpm, Preact vs Svelte.

## Reviews that must happen first

- [ ] **Dietitian review** of the fiber calculator and any health-adjacent page (`TODO(dietitian)` in `fiber-calculator.astro`). The owner chose to ship the fiber page with a visible disclaimer rather than hold it back, so this is a launch condition, not a code gate. Also decide who the dietitian is and whether a New Zealand credential carries weight with a US audience (PRD open questions).
- [ ] **Legal review** of the privacy notice and disclaimer (`TODO(legal)`): US state privacy law, the "children under 13" sentence, the "currently no advertising" statement, and the email-list wording.
- [ ] **Chef review** of cost assumptions on the recipe cost and grocery pages (`TODO(chef)`).

## Content

- [ ] **15 real recipes with original photos.** The three `placeholder-*` recipes and the `fixture-example-recipe` are drafts; delete the placeholders when real ones exist. Until recipes are published, a production build has no hub pages, yet the header and footer navigation link to `/low-energy/`, `/small-portion/` and `/leftovers/`, which would return 404. Publish at least one recipe per pillar, or hide those nav items until then.
- [ ] **Recipe structured data.** Check the Recipe JSON-LD against Google's Recipe documentation and the Rich Results Test (required vs recommended properties are unverified), and settle the single-vs-dual ingredient list in `recipeIngredient` (`03-recipe-content-model.md`).
- [ ] **Brand assets.** The site has no favicon (browsers request `/favicon.ico` and get a 404), and non-recipe pages have no default Open Graph image.

## Data that goes stale or needs checking

- [ ] **USDA Food Plans refresh.** The grocery calculator shows September 2026. USDA publishes monthly; the steps are in `04-calculators.md`. Commit to a schedule.
- [ ] **Visual check of the Low-Cost, Moderate-Cost and Liberal rows** against the USDA PDF. They were read from extracted text and the row alignment was inferred (the four-person totals match third-party figures, which supports it but does not confirm it).
- [ ] **Canonical USDA links.** The two USDA report links in `website/src/data/usda-food-plans.ts` point at a USDA CDN host (`fna-bwbufwdzbabpezgc.z01.azurefd.us`) because the official host returned 403 to the research tool. Replace them with the canonical `fna.usda.gov` or `fns.usda.gov` URLs.
- [ ] **IOM fiber source.** The Adequate Intake table comes from a National Academies summary marked "prepublication copy, uncorrected proofs", and the chapter's own sentence on the 14 g per 1,000 kcal basis could not be opened. Confirm against the published report.

## Technical launch steps (PRD Phase 6)

- [ ] Deploy pipeline, Search Console property verification, sitemap submission.
- [ ] Re-run Lighthouse and a real performance trace on the deployed site. Lab results on 2026-11-05 against a local build: accessibility, best practices and SEO all 100 on the home and grocery pages; LCP 77 ms and CLS 0.00 on the grocery page. These are not real-network numbers.
- [ ] Decide whether draft images should be kept out of production builds (`01-stack.md`: an unpublished recipe's image is still emitted to `dist/_astro/`).
- [ ] Test the email form end to end against the real provider, and confirm the `site:analytics` events if a vendor is added.
- [ ] Keyboard and screen-reader walkthrough, 320px width and 200% zoom, and dark mode on the three calculators (only automated and scripted checks so far).

## Not planned for launch

Accounts, saved recipes, a recipe search, an AI ingredient finder, a GLP-1 protein calculator (needs dietitian-reviewed formulas), paid products, and ads. See the PRD "What We're NOT Building".
