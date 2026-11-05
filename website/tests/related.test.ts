import { describe, expect, it } from 'vitest';
import { listedPillars, recipesInPillar, relatedRecipes, type Linkable } from '../src/lib/related';
import { PILLARS, type Pillar } from '../src/lib/recipe-schema';

function make(id: string, pillar: Pillar, tags: string[] = [], day = 1): Linkable {
  return { id, data: { pillar, tags, datePublished: new Date(Date.UTC(2026, 10, day)) } };
}

describe('recipesInPillar', () => {
  it('keeps only the pillar, newest first', () => {
    const all = [make('a', 'leftovers', [], 1), make('b', 'low-energy', [], 2), make('c', 'leftovers', [], 3)];
    expect(recipesInPillar(all, 'leftovers').map((r) => r.id)).toEqual(['c', 'a']);
  });

  it('returns an empty list for a pillar with no recipes', () => {
    expect(recipesInPillar([make('a', 'leftovers')], 'small-portion')).toEqual([]);
  });

  it('does not mutate its input', () => {
    const all = [make('a', 'leftovers', [], 1), make('b', 'leftovers', [], 2)];
    recipesInPillar(all, 'leftovers');
    expect(all.map((r) => r.id)).toEqual(['a', 'b']);
  });
});

describe('listedPillars', () => {
  const all = [make('a', 'low-energy'), make('b', 'leftovers')];

  it('lists only pillars that have recipes when empty hubs are not shown', () => {
    expect(listedPillars(all, false)).toEqual(['low-energy', 'leftovers']);
  });

  it('lists every pillar when empty hubs are shown (dev and drafts builds)', () => {
    expect(listedPillars(all, true)).toEqual([...PILLARS]);
  });

  it('lists nothing in production when there are no recipes', () => {
    expect(listedPillars([], false)).toEqual([]);
  });

  it('keeps the canonical pillar order', () => {
    expect(listedPillars([make('a', 'leftovers'), make('b', 'low-energy')], false)).toEqual([
      'low-energy',
      'leftovers',
    ]);
  });
});

describe('relatedRecipes', () => {
  it('never includes the current recipe', () => {
    const cur = make('cur', 'low-energy');
    const out = relatedRecipes(cur, [cur, make('a', 'low-energy'), make('b', 'low-energy')]);
    expect(out.map((r) => r.id)).not.toContain('cur');
  });

  it('prefers the same pillar over a different one', () => {
    const cur = make('cur', 'low-energy');
    const out = relatedRecipes(cur, [make('other', 'leftovers', [], 9), make('same', 'low-energy', [], 1)], 1);
    expect(out.map((r) => r.id)).toEqual(['same']);
  });

  it('ranks shared tags above a plain same-pillar match', () => {
    const cur = make('cur', 'low-energy', ['rice', 'egg']);
    const out = relatedRecipes(
      cur,
      [make('plain', 'low-energy', [], 9), make('tagged', 'low-energy', ['rice'], 1)],
      1,
    );
    expect(out.map((r) => r.id)).toEqual(['tagged']);
  });

  it('lets a strong tag match from another pillar beat a weak same-pillar match', () => {
    const cur = make('cur', 'low-energy', ['rice', 'egg', 'one-pan']);
    const out = relatedRecipes(
      cur,
      [make('plain', 'low-energy', [], 9), make('tagged', 'leftovers', ['rice', 'egg', 'one-pan'], 1)],
      1,
    );
    expect(out.map((r) => r.id)).toEqual(['tagged']);
  });

  it('breaks ties by newest, then id, so output is deterministic', () => {
    const cur = make('cur', 'low-energy');
    const out = relatedRecipes(cur, [
      make('b', 'low-energy', [], 5),
      make('a', 'low-energy', [], 5),
      make('c', 'low-energy', [], 7),
    ], 3);
    expect(out.map((r) => r.id)).toEqual(['c', 'a', 'b']);
  });

  it('returns two by default', () => {
    const cur = make('cur', 'low-energy');
    const all = [cur, make('a', 'low-energy'), make('b', 'low-energy'), make('c', 'low-energy')];
    expect(relatedRecipes(cur, all)).toHaveLength(2);
  });

  it('returns fewer when fewer exist, and [] when alone', () => {
    const cur = make('cur', 'low-energy');
    expect(relatedRecipes(cur, [cur, make('a', 'low-energy')])).toHaveLength(1);
    expect(relatedRecipes(cur, [cur])).toEqual([]);
    expect(relatedRecipes(cur, [])).toEqual([]);
  });

  it('treats missing tags as no tags', () => {
    const cur: Linkable = { id: 'cur', data: { pillar: 'low-energy', datePublished: new Date(0) } };
    expect(() => relatedRecipes(cur, [make('a', 'low-energy', ['x'])])).not.toThrow();
  });

  it('returns nothing for a non-positive count', () => {
    const cur = make('cur', 'low-energy');
    expect(relatedRecipes(cur, [make('a', 'low-energy')], 0)).toEqual([]);
    expect(relatedRecipes(cur, [make('a', 'low-energy')], -1)).toEqual([]);
  });
});
