import { describe, expect, it } from 'vitest';
import { PILLAR_PAGES } from '../src/lib/pillars';
import { PILLARS } from '../src/lib/recipe-schema';

// docs/specs: no medical or treatment claims in content.
const MEDICAL = /\b(treat\w*|cure\w*|dos(e|es|ing)|medicat\w*|glp-?1|diagnos\w*|therap\w*|heal\w*|disease)\b/i;

describe('PILLAR_PAGES', () => {
  it('has copy for every pillar and nothing extra', () => {
    expect(Object.keys(PILLAR_PAGES).sort()).toEqual([...PILLARS].sort());
  });

  it.each([...PILLARS])('%s has a title that fits a search result', (p) => {
    const { title } = PILLAR_PAGES[p];
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it.each([...PILLARS])('%s has a meta description of a sensible length', (p) => {
    const { description } = PILLAR_PAGES[p];
    expect(description.length).toBeGreaterThanOrEqual(70);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it('uses a unique title and description per pillar', () => {
    const titles = PILLARS.map((p) => PILLAR_PAGES[p].title);
    const descriptions = PILLARS.map((p) => PILLAR_PAGES[p].description);
    expect(new Set(titles).size).toBe(PILLARS.length);
    expect(new Set(descriptions).size).toBe(PILLARS.length);
  });

  it.each([...PILLARS])('%s copy makes no medical or treatment claims', (p) => {
    const { title, description, intro } = PILLAR_PAGES[p];
    expect(`${title} ${description} ${intro}`).not.toMatch(MEDICAL);
  });
});
