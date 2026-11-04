import type { RecipeData } from './recipe-schema';

export interface JsonLdContext {
  /** Recipe id (slug); used in error messages. */
  id: string;
  /** Absolute page URL. */
  url: string;
  /** Absolute image URL. */
  imageUrl: string;
}

const isAbsolute = (value: string): boolean => /^https?:\/\//.test(value);

/** Minutes to an ISO 8601 duration, e.g. 90 -> "PT1H30M". */
export function minutesToIso8601(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `PT${hours}H${minutes}M`;
  if (hours > 0) return `PT${hours}H`;
  return `PT${minutes}M`;
}

/** Builds schema.org Recipe JSON-LD from validated recipe data. */
export function buildRecipeJsonLd(data: RecipeData, ctx: JsonLdContext): Record<string, unknown> {
  if (!isAbsolute(ctx.imageUrl)) {
    throw new Error(`recipe "${ctx.id}": imageUrl must be absolute, got "${ctx.imageUrl}"`);
  }
  if (!isAbsolute(ctx.url)) {
    throw new Error(`recipe "${ctx.id}": url must be absolute, got "${ctx.url}"`);
  }

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: data.title,
    url: ctx.url,
    image: [ctx.imageUrl],
    description: data.description,
    author: { '@type': 'Person', name: data.author },
    datePublished: data.datePublished.toISOString(),
    prepTime: minutesToIso8601(data.prepMinutes),
    cookTime: minutesToIso8601(data.cookMinutes),
    totalTime: minutesToIso8601(data.prepMinutes + data.cookMinutes),
    recipeYield: String(data.servings),
    recipeCategory: data.pillar,
    // US amounts are used here; one-list vs two-list is an open item in the spec.
    recipeIngredient: data.ingredients.map(({ us, item, note }) =>
      note ? `${us} ${item}, ${note}` : `${us} ${item}`,
    ),
    recipeInstructions: data.steps.map((text) => ({ '@type': 'HowToStep', text })),
  };

  if (data.dateModified) jsonLd.dateModified = data.dateModified.toISOString();
  if (data.tags && data.tags.length > 0) jsonLd.keywords = data.tags.join(', ');
  if (data.nutrition) jsonLd.nutrition = { '@type': 'NutritionInformation', ...data.nutrition };

  return jsonLd;
}
