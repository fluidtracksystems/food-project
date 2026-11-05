// Kept free of imports so client scripts can use it without pulling in the recipe schema (zod).
export const PILLARS = ['low-energy', 'small-portion', 'leftovers'] as const;
export type Pillar = (typeof PILLARS)[number];
