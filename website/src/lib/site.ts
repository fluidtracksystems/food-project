// Placeholder values: the site name and final domain are still undecided (see the PRD).
export const SITE_NAME = 'Site name TBD';
export const SITE_DESCRIPTION = 'Chef-written, low-effort recipes and free kitchen calculators.';

// Decisions only the site owner can make. Leave undecided values undefined. src/lib/privacy.ts makes
// the build fail if the email signup is turned on (PUBLIC_EMAIL_FORM_ACTION) while these are missing,
// because the privacy page must name who receives the addresses and how to reach the owner.
export const EMAIL_PROVIDER_NAME: string | undefined = undefined;
export const CONTACT_EMAIL = 'food@quantityhost.com';
// Shown on the privacy and disclaimer pages. Update it whenever their text changes.
export const LEGAL_UPDATED = '6 November 2026';

export type AuthorBoxVariant = 'named-photo' | 'named' | 'brand';
// Chef identity is undecided (PRD open question). Change here to switch every recipe.
export const AUTHOR_BOX_VARIANT: AuthorBoxVariant = 'brand';

/** Resolves a path against the configured `site` (astro.config.mjs). */
export function absoluteUrl(path: string, site: URL | undefined): string {
  if (!site) {
    throw new Error('astro.config.mjs must define `site` to build absolute URLs');
  }
  return new URL(path, site).href;
}
