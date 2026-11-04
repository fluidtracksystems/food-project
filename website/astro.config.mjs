// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// SITE_URL can override the default; the production domain is still undecided.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://food.quantityhost.com',
  trailingSlash: 'always',
  // Nunito (OFL-1.1) is self-hosted at build time by Astro's Fonts API.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Nunito',
      cssVariable: '--font-nunito',
      weights: ['400 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-rounded', 'SF Pro Rounded', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
    },
  ],
  integrations: [
    mdx(),
    preact(),
    // Fixture and styleguide pages must never appear in the sitemap.
    sitemap({ filter: (page) => !page.includes('/fixture-') && !page.includes('/styleguide') }),
  ],
});
