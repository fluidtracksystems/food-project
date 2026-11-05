export interface Tool {
  slug: string;
  title: string;
  blurb: string;
  path: string;
}

/** Calculators that exist. Add an entry here when the next calculator ships. */
export const TOOLS: Tool[] = [
  {
    slug: 'recipe-cost-calculator',
    title: 'Recipe cost calculator',
    blurb: 'Add your ingredients and pack prices to see what a recipe costs in total and per serving.',
    path: '/tools/recipe-cost-calculator/',
  },
];
