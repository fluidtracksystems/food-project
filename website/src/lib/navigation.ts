export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Low-energy', href: '/low-energy/' },
  { label: 'Small portions', href: '/small-portion/' },
  { label: 'Leftovers', href: '/leftovers/' },
  { label: 'Tools', href: '/tools/' },
  { label: 'About', href: '/about/' },
];

export const FOOTER_LINKS: NavItem[] = [
  ...NAV_ITEMS,
  { label: 'Privacy', href: '/privacy/' },
  { label: 'Disclaimer', href: '/disclaimer/' },
];

// Filled when real accounts exist (Pinterest, Instagram). The footer renders none while empty.
export const SOCIAL_LINKS: NavItem[] = [];
