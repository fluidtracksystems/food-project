# Design System - food.quantityhost.com

Status: APPROVED by the owner (2026-11-04), including the assumed defaults (dark mode on, no ads at launch). Not yet implemented in `website/`. Tokens: `design-tokens.json`. Interactive preview: `design-preview.html` (open it in a browser). Nothing here has been wired into `website/` yet.

## 1. Decisions from the interview

| Question | Decision |
|---|---|
| Look and feel | **Calm and soft**: muted warm palette, generous space, large readable type, big tap targets |
| Colours | **Warm cream + terracotta** |
| Typography | **Friendly rounded sans throughout** (Nunito proposed) |
| Recipe header (launch) | **Jump to Recipe + Print**, **effort badge** |
| Discovery (launch) | **Situation chips**, **ingredient pages**, **simple 5-item menu** |
| Deferred until after launch | Prominent search, cost per serving on every recipe, articles mixed with recipes, a metric/US toggle |
| Chef identity | **Decide later**: author box designed to work in three variants |
| Dark mode | Yes (assumed; the current CSS already supports it) |
| Ads | None at launch (assumed); keep a reserved product-promo slot for later |
| What you like about The Kitchn | Photography and warmth, articles alongside recipes (deferred), clean uncluttered layout |

The two assumed defaults (dark mode, no ads) were confirmed by the owner's approval on 2026-11-04.

## 2. What we borrow, and from where

Observed on 2026-11-04 from screenshots of Budget Bytes and Allrecipes. **The Kitchn could not be viewed** (the browser tool refused the domain and a direct fetch returned 403), so nothing here claims to describe it beyond what you told us you like.

| Feature | Source | How we use it |
|---|---|---|
| Round category chips (Under $10, Quick, One Pot Meals) | Budget Bytes | Situation chips: low energy, sick day, no-cook, small portions, use up leftovers, under a budget |
| Prep / Cook / Servings and a price line in the recipe header | Budget Bytes | Facts card now; the price line slot is reserved for later |
| Jump to Recipe, Save, Rate | Both | Jump to Recipe and Print now; Save and Rate need accounts, so they are deferred |
| "Tested by" and author attribution, updated date | Allrecipes, Budget Bytes | Author box with a visible updated date (trust signal) |
| Trust band under the header | Allrecipes | A short credentials strip once we have real credentials to show |
| Facts card (Prep, Cook, Total, Servings) | Allrecipes | Recipe facts card |
| Warm photography and clean layout | The Kitchn (from your description) | Photo-led cards and generous white space |

**Deliberately not borrowed:** floating video ads (Allrecipes), a ten-item menu (Allrecipes), a sidebar that pushes a paid membership (Budget Bytes), heavy uppercase headings and thick outlines (Budget Bytes; wrong mood for a calm site).

## 3. Principles

1. **Energy-first.** Every page should be usable by someone tired: big text, big targets, few choices at once.
2. **The recipe is the product.** Title, effort, time and the Jump to Recipe button come before any story.
3. **Warm, not loud.** One accent colour. No gradients, no glass effects, no decorative animation.
4. **Honest and safe.** No medical claims; health-adjacent pages carry a visible disclaimer and review credit once it exists.
5. **Fast.** Static pages, one font family, no JavaScript except where a tool needs it.

## 4. Colour

Verified with the WCAG relative-luminance formula (2026-11-04).

| Token | Light | Dark | Use |
|---|---|---|---|
| bg | `#FBF6EE` | `#1D1612` | Page background |
| surface | `#FFFFFF` | `#281E18` | Cards, inputs |
| surfaceAlt | `#F3EADB` | `#33271F` | Facts card, callouts |
| text | `#3A2A1F` | `#F4EADD` | Body text |
| textMuted | `#6A5545` | `#CDBCA7` | Secondary text |
| accent | `#A8472A` | `#E39A78` | Links, primary buttons |
| accentHover | `#8C3920` | `#EDAE92` | Hover and active |
| onAccent | `#FFFFFF` | `#1D1612` | Text on accent buttons |
| badgeBg / badgeText | `#F0E2CE` / `#5A3C28` | `#3A2C22` / `#F0DCC4` | Effort badge |
| borderSubtle | `#E4D6C2` | `#43342A` | Decorative card edges only |
| borderStrong | `#8C7662` | `#8A7360` | Input fields, outlined buttons |
| focus | `#1F4E9A` | `#8FB8F0` | Focus ring |

Key ratios (light / dark): text on bg 12.75 / 15.02; muted text on bg 6.51 / 9.65; link on bg 5.42 / 7.79; button text on accent 5.83 / 7.79; badge 7.80 / 10.07; focus ring on bg 7.47 / 8.75; strong border on bg 4.00 / 4.00. All text pairs pass AA (4.5:1); interface boundaries pass 3:1. `borderSubtle` is decorative only and must never be the sole boundary of an input or button.

## 5. Typography

- Family: **Nunito** (rounded sans) with a system fallback stack. One family keeps the page light.
- Base size **18px** (1.125rem), line height **1.65**, body column max **42rem** for comfortable line length.
- Scale: caption 0.875rem, small 0.95rem, body 1.125rem, h4 1.25rem, h3 1.5rem, h2 fluid 1.625-2rem, h1 fluid 2-2.75rem.
- Weights: 400 body, 600 medium, 700 bold, 800 for h1 and the site name.
- Sentence case everywhere; no all-caps headings.
- Implementation: self-host a variable font file (for example via the `@fontsource-variable/nunito` package; confirm the package and the font's licence before bundling) with `font-display: swap`. The fallback stack means the layout works even if the font fails to load.

## 6. Spacing, layout, shape

- Spacing scale (4px base): 4, 8, 12, 16, 24, 32, 48, 64.
- Page max width 72rem; reading column 42rem; gutters 16px on phones, 24px from 48rem.
- Radius: 6 (inputs inner), 12 (cards, buttons), 20 (hero blocks), pill (chips, badges).
- Shadow: one soft card shadow in light mode; none in dark mode (use surface colour instead).
- Breakpoints: 30rem, 48rem, 64rem. Mobile first.

## 7. Components

**Site header.** Site name (weight 800) left; five links: Low-energy, Small portions, Leftovers, Tools, About; a "Get recipes" email button right. On phones the menu collapses behind a labelled "Menu" button. *Reserved:* a search slot between the links and the button, empty at launch.

**Situation chips.** Round tinted circles with a label beneath (the Budget Bytes pattern, in this palette). Minimum 44x44px target, wraps to two rows on phones. Chips link to pillar hubs or filtered lists. Launch set: Low energy, Sick day, No-cook, Small portions, Use up leftovers, Under a budget (final set TBD with the chef).

**Recipe card.** Photo (3:2), pillar label, title, one meta line ("10 min - Serves 2"), effort badge. The whole card is one link. *Reserved:* a cost-per-serving line.

**Effort badge.** Pill with text such as "One pot", "No stove", "10 minutes". Always text, never colour or an icon alone.

**Buttons.** Primary (accent fill), secondary (surface fill, strong border), text link. Height at least 44px, 12px radius. States: hover (accentHover), active (slight darken, no movement), focus (3px focus ring with 2px offset), disabled (muted text, strong border dashed, `aria-disabled`).

**Recipe facts card.** Surface-alt block with Prep, Cook, Total, Serves, Effort. *Reserved:* a "Cost per serving" cell.

**Ingredient table.** Two columns: metric and US customary amounts side by side, then the ingredient. No toggle at launch (deferred), so no JavaScript.

**Method.** Numbered steps with large numerals, one action per step where possible.

**Author box.** Three variants (see section 9). Always shows the updated date.

**Email signup.** Label above the input, strong border, 48px high, consent line below; one per page, never a popup.

**Tool shell.** Heading, short purpose line, inputs in a surface card, result in a surface-alt block with `aria-live="polite"`, formula source and limits stated below.

**Footer.** Pillars, Tools, About, Privacy, Disclaimer, social links (Pinterest, Instagram), copyright.

## 8. Page templates

- **Home:** hero (one sentence, two buttons), situation chips, latest recipes (3-6 cards), tools teaser, short chef introduction, email signup.
- **Pillar hub:** title, one-paragraph intro, recipe cards grid, related tools.
- **Recipe:** breadcrumb, h1, meta line with effort badge, Jump to Recipe + Print, photo, short intro, facts card, ingredients (metric + US), method, storing and reheating note, author box, related recipes, email signup. Allow the reader to reach the ingredients without scrolling past a long story.
- **Tool:** shell above, then a short explainer and three related recipes.
- **About:** the chef's story and credentials (content depends on the identity decision).
- **404:** friendly message, link home, link to pillars. Marked noindex (already implemented).

## 9. Chef identity variants (decision deferred)

The author box works three ways so the decision can wait until launch:

- **A. Named with photo and bio:** round photo, name, one-line credential, link to About.
- **B. Named, no photo:** name and credential line.
- **C. Brand only:** "Tested in our kitchen" with the updated date.

## 10. Accessibility and states

- WCAG AA contrast verified (section 4); interface boundaries at 3:1 or better.
- All interactive targets at least 44x44px (stricter than the 24px WCAG 2.2 minimum, chosen for tired users).
- Visible 3px focus ring on every interactive element; never remove outlines.
- Skip link first in the page (already in the scaffold); logical heading order; one h1 per page.
- `prefers-reduced-motion`: no transitions or animations. Default motion is only a 120-200ms colour change on hover.
- Forms: visible labels, no placeholder-only labels, errors in text with `aria-describedby`.
- Empty states: calculators show an example result before input; a hub with no recipes says so plainly.

## 11. Print

Recipe pages print cleanly: hide the header, footer, email signup and related recipes; show title, meta, facts, ingredients (metric and US), method and the storing note in black on white at 12pt; keep each step from breaking across pages where possible.

## 12. Deferred features and where they fit

| Deferred | Reserved space |
|---|---|
| Prominent search | Empty slot in the header between links and the email button |
| Cost per serving | A cell in the facts card and a line on recipe cards |
| Metric / US toggle | Ingredient table already shows both; a toggle would replace the two columns with one |
| Articles | A fourth content type needing its own card style; not designed yet |
| Save / Rate | Needs accounts; not designed yet |
| Product promo | A single sidebar or in-content block, only once there are products to sell |

## 13. AI-slop self-check

- Gradients: none. Backgrounds are flat tints.
- Glass or blur effects: none.
- Purple/blue defaults: none; the palette is warm neutrals with one terracotta accent.
- Generic stock hero: the hero is text and buttons; real photography comes from the chef.
- Animation: none beyond a short hover colour change.
- Rounded corners: used on cards, buttons and chips only, at two sizes.
- Personality: one rounded family, a warm palette, plain-spoken copy.

## 14. Implementation notes (for the next plan)

- Map the tokens to CSS custom properties in `website/src/styles/global.css`, replacing the current placeholder values. Keep `prefers-color-scheme` and add a manual theme override only if you want one.
- New components (Astro): `SiteHeader`, `SiteFooter`, `RecipeCard`, `SituationChips`, `EffortBadge`, `RecipeFacts`, `IngredientTable`, `AuthorBox`, `EmailSignup`, `ToolShell`. `BaseHead`, `BaseLayout`, `RecipeLayout` and `JsonLd` already exist.
- Add `effort` (and later `costPerServing`) to the recipe schema (`website/src/lib/recipe-schema.ts`); today the schema has `estimatedCostPerServing` but no effort field.
- Self-host the font; test Core Web Vitals after adding it.

## 15. Not verified / open items

- The Kitchn was not viewed; its influence is limited to your description.
- Nunito: confirm the licence and the package before bundling.
- Preview typography uses Nunito from Google Fonts if the browser is online; offline it falls back to a system font.
- Situation chip set and the exact hero copy are placeholders.
- Whether to add a manual light/dark switch (currently follows the system setting).
- Chef identity (variant A, B or C) and the site name/logo.
- Real photography will change how the palette feels; revisit accents after the first photo shoot.
