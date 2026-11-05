import type { Pillar } from './recipe-schema';

export interface PillarPage {
  title: string;
  description: string;
  intro: string;
}

// Placeholder copy pending the chef. No medical or treatment claims (see tests/pillars.test.ts).
export const PILLAR_PAGES: Record<Pillar, PillarPage> = {
  'low-energy': {
    title: 'Low-Energy Recipes: Easy Dinners for Tired Days',
    description:
      'Chef-written dinners for days when you have little energy: lazy, no-cook and one-pan meals that take minutes, not hours.',
    intro:
      'Some days there is not much left in the tank. These are chef-tested meals with short ingredient lists, few dishes and very little standing at the stove.',
  },
  'small-portion': {
    title: 'Small-Portion Recipes: Small Appetite, Big Flavour',
    description:
      'Small, protein-rich meals with big flavour for when you want less on the plate. Chef-written, gentle and easy to make.',
    intro:
      'Smaller plates do not have to mean duller food. These recipes pack flavour and protein into modest portions and keep the cooking simple.',
  },
  leftovers: {
    title: 'Leftover Recipes: Use It Up and Cook for One',
    description:
      'Turn leftovers into meals you actually want to eat again, with chef tips for cooking for one and wasting less food.',
    intro:
      'Leftovers are a head start, not a chore. Here is how to turn last night’s dinner into something new, in portions that suit one or two.',
  },
};
