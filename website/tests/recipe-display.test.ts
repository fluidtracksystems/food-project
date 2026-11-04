import { describe, expect, it } from 'vitest';
import {
  PILLAR_LABELS,
  formatDate,
  formatMinutes,
  pillarLabel,
  pillarPath,
  recipeMetaLine,
  totalMinutes,
  updatedDate,
} from '../src/lib/recipe-display';
import { PILLARS } from '../src/lib/recipe-schema';

describe('formatMinutes', () => {
  it.each([
    [0, '0 min'],
    [59, '59 min'],
    [60, '1 h'],
    [90, '1 h 30 min'],
    [120, '2 h'],
  ])('formats %i minutes as "%s"', (n, expected) => {
    expect(formatMinutes(n)).toBe(expected);
  });
});

describe('totalMinutes and recipeMetaLine', () => {
  it('adds prep and cook', () => {
    expect(totalMinutes({ prepMinutes: 10, cookMinutes: 15 })).toBe(25);
  });

  it('treats zero cook time as prep only', () => {
    expect(totalMinutes({ prepMinutes: 10, cookMinutes: 0 })).toBe(10);
  });

  it('builds the meta line with total time then servings', () => {
    expect(recipeMetaLine({ prepMinutes: 10, cookMinutes: 15, servings: 2 })).toBe('25 min · Serves 2');
  });
});

describe('pillar helpers', () => {
  it('labels every pillar', () => {
    for (const p of PILLARS) {
      expect(PILLAR_LABELS[p].length).toBeGreaterThan(0);
      expect(pillarLabel(p)).toBe(PILLAR_LABELS[p]);
    }
  });

  it('builds a trailing-slash path', () => {
    expect(pillarPath('leftovers')).toBe('/leftovers/');
    expect(pillarPath('small-portion')).toBe('/small-portion/');
  });
});

describe('updatedDate and formatDate', () => {
  const published = new Date('2026-11-04');
  const modified = new Date('2026-12-01');

  it('prefers dateModified', () => {
    expect(updatedDate({ datePublished: published, dateModified: modified })).toBe(modified);
  });

  it('falls back to datePublished', () => {
    expect(updatedDate({ datePublished: published })).toBe(published);
  });

  it('formats dates with a fixed month table', () => {
    expect(formatDate(new Date('2026-11-04'))).toBe('4 Nov 2026');
    expect(formatDate(new Date('2026-09-01'))).toBe('1 Sep 2026');
  });
});
