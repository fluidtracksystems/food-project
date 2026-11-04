// Placeholder values: the site name and final domain are still undecided (see the PRD).
export const SITE_NAME = 'Site name TBD';
export const SITE_DESCRIPTION = 'Chef-written, low-effort recipes and free kitchen calculators.';

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
