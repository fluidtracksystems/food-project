import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import { recipeSchema } from '../src/lib/recipe-schema';
import { buildRecipeJsonLd, minutesToIso8601 } from '../src/lib/recipe-jsonld';

const schema = recipeSchema(() => z.string());

const base = {
  title: 'Test recipe',
  description: 'A recipe used for testing.',
  pillar: 'leftovers',
  image: 'image.png',
  imageAlt: 'A test image',
  author: 'Chef Test',
  datePublished: '2026-11-04',
  servings: 2,
  prepMinutes: 15,
  cookMinutes: 90,
  ingredients: [
    { item: 'cooked rice', metric: '200 g', us: '1 cup' },
    { item: 'egg', metric: '1', us: '1', note: 'beaten' },
  ],
  steps: ['Heat the pan.', 'Add the rice.', 'Serve.'],
};

const ctx = {
  id: 'test-recipe',
  url: 'https://example.com/recipes/test-recipe/',
  imageUrl: 'https://example.com/_astro/image.png',
};

const parse = (overrides: Record<string, unknown> = {}) => schema.parse({ ...base, ...overrides });

describe('minutesToIso8601', () => {
  it('formats minutes only', () => expect(minutesToIso8601(15)).toBe('PT15M'));
  it('formats hours and minutes', () => expect(minutesToIso8601(90)).toBe('PT1H30M'));
  it('formats whole hours', () => expect(minutesToIso8601(60)).toBe('PT1H'));
  it('formats zero', () => expect(minutesToIso8601(0)).toBe('PT0M'));
});

describe('buildRecipeJsonLd', () => {
  it('sets the core Recipe fields', () => {
    const ld = buildRecipeJsonLd(parse(), ctx);
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('Recipe');
    expect(ld.name).toBe('Test recipe');
    expect(ld.url).toBe(ctx.url);
    expect(ld.image).toEqual([ctx.imageUrl]);
    expect(ld.author).toEqual({ '@type': 'Person', name: 'Chef Test' });
    expect(ld.recipeCategory).toBe('leftovers');
  });

  it('converts times to ISO 8601 durations', () => {
    const ld = buildRecipeJsonLd(parse(), ctx);
    expect(ld.prepTime).toBe('PT15M');
    expect(ld.cookTime).toBe('PT1H30M');
    expect(ld.totalTime).toBe('PT1H45M');
  });

  it('handles zero cook time', () => {
    const ld = buildRecipeJsonLd(parse({ prepMinutes: 10, cookMinutes: 0 }), ctx);
    expect(ld.cookTime).toBe('PT0M');
    expect(ld.totalTime).toBe('PT10M');
  });

  it('writes recipeYield as the serving count', () => {
    expect(buildRecipeJsonLd(parse({ servings: 2 }), ctx).recipeYield).toBe('2');
  });

  it('builds ingredient strings from the US amount, with optional notes', () => {
    const ld = buildRecipeJsonLd(parse(), ctx);
    expect(ld.recipeIngredient).toEqual(['1 cup cooked rice', '1 egg, beaten']);
  });

  it('maps steps to HowToStep objects', () => {
    const ld = buildRecipeJsonLd(parse(), ctx);
    expect(ld.recipeInstructions).toEqual([
      { '@type': 'HowToStep', text: 'Heat the pan.' },
      { '@type': 'HowToStep', text: 'Add the rice.' },
      { '@type': 'HowToStep', text: 'Serve.' },
    ]);
  });

  it('omits optional keys when absent', () => {
    const ld = buildRecipeJsonLd(parse(), ctx);
    expect('keywords' in ld).toBe(false);
    expect('nutrition' in ld).toBe(false);
    expect('dateModified' in ld).toBe(false);
  });

  it('includes keywords and nutrition when present', () => {
    const ld = buildRecipeJsonLd(parse({ tags: ['rice', 'quick'], nutrition: { calories: '300 calories' } }), ctx);
    expect(ld.keywords).toBe('rice, quick');
    expect(ld.nutrition).toEqual({ '@type': 'NutritionInformation', calories: '300 calories' });
  });

  it('throws with the recipe id when the image URL is not absolute', () => {
    expect(() => buildRecipeJsonLd(parse(), { ...ctx, imageUrl: '/_astro/image.png' })).toThrow(/test-recipe/);
  });

  it('throws with the recipe id when the page URL is not absolute', () => {
    expect(() => buildRecipeJsonLd(parse(), { ...ctx, url: '/recipes/test-recipe/' })).toThrow(/test-recipe/);
  });
});
