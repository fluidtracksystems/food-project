import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { z } from 'astro/zod';
import { PILLARS, recipeSchema } from '../src/lib/recipe-schema';

// Launch-scope integrity: 15 recipes, 5 per pillar, each with a credited photo on disk.
const recipesDir = resolve(dirname(fileURLToPath(import.meta.url)), '../src/content/recipes');
const schema = recipeSchema(() => z.string());

const BANNED = /\b(cure[sd]?|treat(s|ed|ing|ment)?|heal(s|ed|ing)?|detox|GLP-1|Ozempic|Wegovy|diabetes|diabetic)\b/i;

interface Loaded {
  file: string;
  slug: string;
  raw: Record<string, unknown>;
  body: string;
}

function load(): Loaded[] {
  return readdirSync(recipesDir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('fixture-'))
    .sort()
    .map((file) => {
      const text = readFileSync(join(recipesDir, file), 'utf8').replace(/\r\n/g, '\n');
      const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
      if (!match) throw new Error(`${file}: no frontmatter`);
      return { file, slug: file.replace(/\.md$/, ''), raw: parse(match[1]) as Record<string, unknown>, body: match[2] };
    });
}

const recipes = load();

describe('launch recipe content', () => {
  it('has exactly 15 non-fixture recipes', () => {
    expect(recipes.length, `expected 15 recipes, found ${recipes.length}`).toBe(15);
  });

  it('has exactly 5 recipes per pillar', () => {
    for (const pillar of PILLARS) {
      const count = recipes.filter((r) => r.raw.pillar === pillar).length;
      expect(count, `pillar ${pillar} has ${count} recipes, expected 5`).toBe(5);
    }
  });

  it('has no placeholder recipes', () => {
    expect(recipes.filter((r) => r.file.startsWith('placeholder-')).map((r) => r.file)).toEqual([]);
  });

  it('has unique titles and slugs', () => {
    expect(new Set(recipes.map((r) => r.raw.title)).size).toBe(recipes.length);
    expect(new Set(recipes.map((r) => r.slug)).size).toBe(recipes.length);
  });

  for (const r of recipes) {
    describe(r.slug, () => {
      it('is schema-valid', () => {
        const result = schema.safeParse(r.raw);
        expect(result.success, result.success ? '' : JSON.stringify(result.error.issues)).toBe(true);
      });

      it('has a credited photo that exists on disk', () => {
        expect(r.raw.imageCredit, 'missing imageCredit').toBeTruthy();
        const imagePath = resolve(recipesDir, String(r.raw.image));
        expect(existsSync(imagePath), `missing image ${imagePath}`).toBe(true);
      });

      it('has no medical claims', () => {
        const copy = [r.raw.title, r.raw.description, ...((r.raw.steps as string[]) ?? []), r.body].join('\n');
        expect(BANNED.exec(copy)?.[0]).toBeUndefined();
      });
    });
  }
});
