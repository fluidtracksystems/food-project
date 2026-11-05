import { PILLARS, type Pillar } from './recipe-schema';

/** The minimum a recipe entry needs for linking. Matches Astro collection entries. */
export interface Linkable {
  id: string;
  data: { pillar: Pillar; tags?: string[]; datePublished: Date };
}

// A shared pillar outweighs one shared tag; three shared tags outweigh a shared pillar.
const SAME_PILLAR_WEIGHT = 1.5;
const SHARED_TAG_WEIGHT = 1;

const byNewestThenId = (a: Linkable, b: Linkable): number =>
  b.data.datePublished.getTime() - a.data.datePublished.getTime() || a.id.localeCompare(b.id);

function tagSet(r: Linkable): Set<string> {
  return new Set((r.data.tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean));
}

/** Recipes in one pillar, newest first. Does not mutate the input. */
export function recipesInPillar<T extends Linkable>(all: readonly T[], pillar: Pillar): T[] {
  return all.filter((r) => r.data.pillar === pillar).sort(byNewestThenId);
}

/**
 * Pillars that get a hub page, in canonical order. Production builds only a hub that lists recipes,
 * so an empty one never reaches the sitemap or the index; dev and drafts builds (`showEmpty`) keep
 * every hub. The hub route and every page that links to hubs must use this one rule.
 */
export function listedPillars(all: readonly Linkable[], showEmpty: boolean): Pillar[] {
  return PILLARS.filter((p) => showEmpty || all.some((r) => r.data.pillar === p));
}

/**
 * Recipes related to `current`: same pillar and shared tags score higher. Ties break by
 * newest, then id, so the build output is deterministic. Excludes `current`.
 */
export function relatedRecipes<T extends Linkable>(current: T, all: readonly T[], count = 2): T[] {
  if (count <= 0) return [];
  const mine = tagSet(current);
  const score = (r: Linkable): number => {
    let shared = 0;
    for (const tag of tagSet(r)) if (mine.has(tag)) shared++;
    return shared * SHARED_TAG_WEIGHT + (r.data.pillar === current.data.pillar ? SAME_PILLAR_WEIGHT : 0);
  };
  return all
    .filter((r) => r.id !== current.id)
    .map((r) => ({ r, s: score(r) }))
    .sort((a, b) => b.s - a.s || byNewestThenId(a.r, b.r))
    .slice(0, count)
    .map(({ r }) => r);
}
