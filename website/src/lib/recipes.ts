import { getCollection, type CollectionEntry } from 'astro:content';

/** Drafts show in dev, or in a build with PUBLIC_INCLUDE_DRAFTS=true. Never in a default production build. */
export function includeDrafts(): boolean {
  return import.meta.env.DEV || import.meta.env.PUBLIC_INCLUDE_DRAFTS === 'true';
}

/** Recipes, newest first. Sorted explicitly because collection order is platform-dependent. */
export async function getRecipes(): Promise<CollectionEntry<'recipes'>[]> {
  const entries = await getCollection('recipes', ({ data }) => includeDrafts() || !data.draft);
  return entries.sort((a, b) => b.data.datePublished.getTime() - a.data.datePublished.getTime());
}
