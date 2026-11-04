import type { Pillar, RecipeData } from './recipe-schema';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Minutes as a short label: "25 min", "1 h", "1 h 30 min". */
export function formatMinutes(n: number): string {
  const hours = Math.floor(n / 60);
  const minutes = n % 60;
  if (hours === 0) return `${minutes} min`;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

/** Prep plus cook time in minutes. */
export function totalMinutes(r: Pick<RecipeData, 'prepMinutes' | 'cookMinutes'>): number {
  return r.prepMinutes + r.cookMinutes;
}

/** Card meta line: total time, then servings, e.g. "25 min · Serves 2". */
export function recipeMetaLine(r: Pick<RecipeData, 'prepMinutes' | 'cookMinutes' | 'servings'>): string {
  return `${formatMinutes(totalMinutes(r))} · Serves ${r.servings}`;
}

export const PILLAR_LABELS: Record<Pillar, string> = {
  'low-energy': 'Low energy',
  'small-portion': 'Small portions',
  leftovers: 'Leftovers',
};

/** Human label for a content pillar. */
export function pillarLabel(p: Pillar): string {
  return PILLAR_LABELS[p];
}

/** Hub path for a pillar. The trailing slash matches `trailingSlash: 'always'`. */
export function pillarPath(p: Pillar): string {
  return `/${p}/`;
}

/** The date shown as "Updated": `dateModified` when set, otherwise `datePublished`. */
export function updatedDate(r: Pick<RecipeData, 'datePublished' | 'dateModified'>): Date {
  return r.dateModified ?? r.datePublished;
}

/**
 * Formats as "4 Nov 2026". Uses a fixed month table and UTC getters: `toLocaleDateString`
 * month names vary with ICU data ("Sept"), and local zones can shift the day.
 */
export function formatDate(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
