import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import { recipeSchema } from '../src/lib/recipe-schema';

// Stub for Astro's image() helper, which is only available inside content.config.ts.
const schema = recipeSchema(() => z.string());

const valid = {
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
  effort: 'One pot',
  ingredients: [{ item: 'cooked rice', metric: '200 g', us: '1 cup' }],
  steps: ['Heat the pan.', 'Add the rice.', 'Serve.'],
};

describe('recipeSchema', () => {
  it('accepts a complete recipe and applies defaults', () => {
    const result = schema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.draft).toBe(false);
      expect(result.data.datePublished).toBeInstanceOf(Date);
    }
  });

  it('rejects a recipe with no image', () => {
    const { image: _image, ...withoutImage } = valid;
    expect(schema.safeParse(withoutImage).success).toBe(false);
  });

  it('rejects empty ingredients', () => {
    expect(schema.safeParse({ ...valid, ingredients: [] }).success).toBe(false);
  });

  it('rejects empty steps', () => {
    expect(schema.safeParse({ ...valid, steps: [] }).success).toBe(false);
  });

  it('rejects an unknown pillar', () => {
    expect(schema.safeParse({ ...valid, pillar: 'dessert' }).success).toBe(false);
  });

  it('rejects zero servings', () => {
    expect(schema.safeParse({ ...valid, servings: 0 }).success).toBe(false);
  });

  it('rejects negative prep time', () => {
    expect(schema.safeParse({ ...valid, prepMinutes: -1 }).success).toBe(false);
  });

  it('allows zero cook time for no-cook recipes', () => {
    expect(schema.safeParse({ ...valid, cookMinutes: 0 }).success).toBe(true);
  });

  it('rejects a recipe with no effort label', () => {
    const { effort: _effort, ...withoutEffort } = valid;
    expect(schema.safeParse(withoutEffort).success).toBe(false);
  });

  it('rejects an empty effort label', () => {
    expect(schema.safeParse({ ...valid, effort: '' }).success).toBe(false);
  });

  it('rejects an effort label over 40 characters', () => {
    expect(schema.safeParse({ ...valid, effort: 'x'.repeat(41) }).success).toBe(false);
  });

  it('accepts an effort label of exactly 40 characters', () => {
    expect(schema.safeParse({ ...valid, effort: 'x'.repeat(40) }).success).toBe(true);
  });

  describe('imageCredit', () => {
    const credit = {
      photographer: 'Jane Doe',
      source: 'Unsplash',
      url: 'https://unsplash.com/photos/abc123',
    };

    it('accepts a valid credit', () => {
      expect(schema.safeParse({ ...valid, imageCredit: credit }).success).toBe(true);
    });

    it('accepts no credit', () => {
      expect(schema.safeParse(valid).success).toBe(true);
    });

    it('rejects a missing photographer', () => {
      const { photographer: _p, ...rest } = credit;
      expect(schema.safeParse({ ...valid, imageCredit: rest }).success).toBe(false);
    });

    it('rejects a non-URL url', () => {
      expect(schema.safeParse({ ...valid, imageCredit: { ...credit, url: 'not a url' } }).success).toBe(false);
    });

    it('rejects an unknown source', () => {
      expect(schema.safeParse({ ...valid, imageCredit: { ...credit, source: 'Flickr' } }).success).toBe(false);
    });

    it('rejects javascript: and http: urls', () => {
      for (const url of ['javascript:alert(1)', 'http://unsplash.com/photos/abc']) {
        expect(schema.safeParse({ ...valid, imageCredit: { ...credit, url } }).success).toBe(false);
      }
    });
  });

  it('rejects an ingredient missing its metric amount', () => {
    const ingredients = [{ item: 'cooked rice', us: '1 cup' }];
    expect(schema.safeParse({ ...valid, ingredients }).success).toBe(false);
  });
});
