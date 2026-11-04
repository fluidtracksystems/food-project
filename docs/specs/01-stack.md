# 01 - Stack

Status: DRAFT. Versions verified against the npm registry on 2026-11-04. Nothing is installed yet.

## Decisions

| Area | Choice | Basis |
|---|---|---|
| Framework | Astro `^7.4.5` (static output) | Current `latest` on npm. See "Astro 6 vs 7" below. |
| Language | TypeScript `^6.0.3` | `@astrojs/check` peers accept `^5 \|\| ^6` only, so TypeScript 7.0.2 (which exists) is NOT used. Astro 7.4.5 lists `typescript ^6.0.3` as a dev dependency (tested against TS 6; not a runtime requirement). |
| Content | Markdown/MDX in content collections (`@astrojs/mdx ^8.1.2`) | mdx 8.x peers on `astro ^7.2.10` |
| Interactivity | Preact islands (`@astrojs/preact ^6.1.1`, `preact ^11.1.1`) | Small bundles; calculators only. Peer range allows preact 10 or 11. Alternative: Svelte (not evaluated). |
| Sitemap | `@astrojs/sitemap ^3.7.4` | Needs `site` in `astro.config.mjs` |
| Tests | Vitest `^5.1.0` via `getViteConfig()` from `astro/config` | Astro testing guide (documented for Astro 6; confirm for 7) |
| Node | `>=22.23.4` required by Astro 7.4.5 | Local machine: v24.14.0 (satisfies) |
| Package manager | npm 11.9.0 with workspaces (root + `website`) | Default; no lockfile yet. TBD if you prefer pnpm. |
| Hosting | Cloudflare Pages free tier | TBD - verify limits and pricing before relying on it |
| Analytics | TBD | See `05-growth-plumbing.md` |
| Email | TBD | See `05-growth-plumbing.md` |

## Astro 6 vs 7

- The documentation I could retrieve for content collections (`glob()` loader, `z` from `astro/zod`, `getViteConfig`) is for Astro 6 (Context7 index `v6`; npm still publishes `astro@6.4.8`).
- Astro 7 is current. Its upgrade page (https://docs.astro.build/en/guides/upgrade-to/v7/) lists: Vite 8, a new Markdown renderer (Sätteri; `@astrojs/markdown-remark` no longer installed by default), `compressHTML` default `'jsx'`, stricter Rust-compiler errors on unclosed tags. It did NOT confirm whether the content-collection API changed.
- Decision: start on Astro 7. First build in the scaffold phase must confirm `src/content.config.ts` works as specified. If it does not, fall back to Astro 6.4.8 with `@astrojs/mdx ^5.0.6` (peer `astro ^6.0.0`).
- Recorded in `docs/adr/0001-astro-static.md`.

## Peer dependencies to watch at install

- `astro@7.4.5` peer: `@astrojs/markdown-remark ^7.3.0`
- `@astrojs/mdx@8.1.2` peers: `astro ^7.2.10`, `@astrojs/markdown-remark ^7.3.0`, `@astrojs/markdown-satteri ^0.4.0`
- `vitest@5.1.0` peer: `vite ^6.4 || ^7 || ^8`
- npm may auto-install these; if it does not, add them explicitly.

## Project conventions

- Folders and content files: `kebab-case`. Recipe slug = filename.
- TypeScript: `camelCase` functions, `PascalCase` types and components.
- No secrets in the repo; `.env` is git-ignored.

## Open items

- [ ] Confirm Astro 7 content collections API on first build
- [ ] Choose Preact vs Svelte (Preact proposed; integration docs not reviewed)
- [ ] Confirm Cloudflare Pages terms
- [ ] Decide npm vs pnpm
- [ ] Pin exact versions after first successful install (lockfile)
