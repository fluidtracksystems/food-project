import { pillarPath } from './recipe-display';

// Placeholder pending the chef. Only pillar-backed chips are listed: "Sick day", "No-cook" and
// "Under a budget" need filtered lists (Phase 4+) before they have a page to link to.
export const SITUATIONS: { label: string; href: string }[] = [
  { label: 'Low energy', href: pillarPath('low-energy') },
  { label: 'Small portions', href: pillarPath('small-portion') },
  { label: 'Use up leftovers', href: pillarPath('leftovers') },
];
