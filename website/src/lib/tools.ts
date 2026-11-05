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
  {
    slug: 'grocery-budget-calculator',
    title: 'Grocery budget calculator',
    blurb: 'See a household’s weekly and monthly food-at-home cost under the four USDA Food Plans.',
    path: '/tools/grocery-budget-calculator/',
  },
  {
    slug: 'fiber-calculator',
    title: 'Fiber calculator',
    blurb: 'See the general daily fiber guideline for healthy people by age and sex.',
    path: '/tools/fiber-calculator/',
  },
];
