import { describe, expect, it } from 'vitest';
import { TOOLS } from '../src/lib/tools';

describe('TOOLS', () => {
  it('lists the recipe cost calculator', () => {
    expect(TOOLS.map((t) => t.slug)).toContain('recipe-cost-calculator');
  });

  it('has unique slugs and paths that match the slug', () => {
    expect(new Set(TOOLS.map((t) => t.slug)).size).toBe(TOOLS.length);
    for (const t of TOOLS) {
      expect(t.path).toBe(`/tools/${t.slug}/`);
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.blurb.length).toBeGreaterThan(0);
    }
  });
});
