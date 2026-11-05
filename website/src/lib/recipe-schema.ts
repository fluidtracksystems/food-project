import { z } from 'astro/zod';
import { PILLARS, type Pillar } from './pillar-list';

// Re-exported so existing imports from this module keep working.
export { PILLARS };
export type { Pillar };

const ingredientSchema = z.object({
  item: z.string().min(1),
  // Metric is canonical; the US customary amount is shown alongside.
  metric: z.string().min(1),
  us: z.string().min(1),
  note: z.string().optional(),
});

const nutritionSchema = z.object({
  calories: z.string().optional(),
  proteinContent: z.string().optional(),
  fiberContent: z.string().optional(),
  carbohydrateContent: z.string().optional(),
  fatContent: z.string().optional(),
  sodiumContent: z.string().optional(),
});

// Stock photo credit. Omit once the chef's own photo replaces the stock image.
const imageCreditSchema = z.object({
  photographer: z.string().min(1),
  source: z.enum(['Unsplash', 'Pexels', 'Pixabay']),
  // Photo page on the source site. https only.
  url: z.string().url().startsWith('https://'),
});

/**
 * Recipe frontmatter schema, as a function of Astro's `image()` helper so it can
 * be unit-tested without Astro's virtual `astro:content` module.
 * Fields follow docs/specs/03-recipe-content-model.md.
 */
export function recipeSchema<Img extends z.ZodType>(image: () => Img) {
  return z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    pillar: z.enum(PILLARS),
    image: image(),
    imageAlt: z.string().min(1),
    imageCredit: imageCreditSchema.optional(),
    author: z.string().min(1),
    datePublished: z.coerce.date(),
    dateModified: z.coerce.date().optional(),
    servings: z.number().int().positive(),
    prepMinutes: z.number().int().nonnegative(),
    // Zero is valid: no-cook recipes.
    cookMinutes: z.number().int().nonnegative(),
    // Short plain-text label shown as a badge, e.g. "One pot" or "No stove". Text only, never an icon.
    effort: z.string().min(1).max(40),
    ingredients: z.array(ingredientSchema).min(1),
    steps: z.array(z.string().min(1)).min(1),
    tags: z.array(z.string().min(1)).optional(),
    leftoverNote: z.string().optional(),
    estimatedCostPerServing: z.number().nonnegative().optional(),
    nutrition: nutritionSchema.optional(),
    draft: z.boolean().default(false),
  });
}

/** Parsed recipe data. `image` is `unknown` here; Astro supplies ImageMetadata at runtime. */
export type RecipeData = z.output<ReturnType<typeof recipeSchema<z.ZodType>>>;
