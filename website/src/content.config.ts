import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { recipeSchema } from './lib/recipe-schema';

const recipes = defineCollection({
  loader: glob({ base: './src/content/recipes', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) => recipeSchema(image),
});

export const collections = { recipes };
