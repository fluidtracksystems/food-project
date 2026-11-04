// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// SITE_URL can override the default; the production domain is still undecided.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://food.quantityhost.com',
  trailingSlash: 'always',
  integrations: [
    mdx(),
    preact(),
    // Fixture pages must never appear in the sitemap.
    sitemap({ filter: (page) => !page.includes('/fixture-') }),
  ],
});
