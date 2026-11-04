import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../src/lib/contrast';

// Read as text, not imported: the JSON lives outside the Vite root.
const tokensJson = JSON.parse(
  readFileSync(new URL('../../docs/design/design-tokens.json', import.meta.url), 'utf8'),
) as { color: { light: Record<string, string>; dark: Record<string, string> } };
const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

const DARK_MARKER = '@media (prefers-color-scheme: dark)';
const darkAt = css.indexOf(DARK_MARKER);

function parseVars(block: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const match of block.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
}

/** `surfaceAlt` -> `--surface-alt`. JSON uses `textMuted`; the CSS token is `--muted`. */
function cssName(key: string): string {
  if (key === 'textMuted') return '--muted';
  return `--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
}

const light = parseVars(css.slice(0, darkAt));
// Dark values layer over the light ones, as in the browser.
const dark = { ...light, ...parseVars(css.slice(darkAt)) };

const themes = [
  { name: 'light', vars: light, json: tokensJson.color.light },
  { name: 'dark', vars: dark, json: tokensJson.color.dark },
] as const;

describe('tokens.css structure', () => {
  it('has a dark-mode block', () => {
    expect(darkAt).toBeGreaterThan(0);
  });
});

describe.each(themes)('tokens.css ($name theme)', ({ vars, json }) => {
  it('matches design-tokens.json for every colour', () => {
    for (const [key, hex] of Object.entries(json)) {
      const name = cssName(key);
      expect(vars[name], `${name} is missing from tokens.css`).toBeDefined();
      expect(vars[name].toLowerCase(), name).toBe(hex.toLowerCase());
    }
  });

  const textPairs = [
    ['--text', '--bg'],
    ['--muted', '--bg'],
    ['--text', '--surface'],
    ['--muted', '--surface'],
    ['--text', '--surface-alt'],
    ['--muted', '--surface-alt'],
    ['--accent', '--bg'],
    ['--accent', '--surface-alt'],
    ['--accent', '--surface'],
    ['--on-accent', '--accent'],
    ['--on-accent', '--accent-hover'],
    ['--badge-text', '--badge-bg'],
  ];
  it.each(textPairs)('%s on %s is at least 4.5:1', (fg, bg) => {
    expect(vars[fg], `${fg} missing`).toBeDefined();
    expect(vars[bg], `${bg} missing`).toBeDefined();
    expect(contrastRatio(vars[fg], vars[bg])).toBeGreaterThanOrEqual(4.5);
  });

  const interfacePairs = [
    ['--focus', '--bg'],
    ['--border-strong', '--bg'],
    ['--border-strong', '--surface'],
  ];
  it.each(interfacePairs)('%s on %s is at least 3:1', (fg, bg) => {
    expect(vars[fg], `${fg} missing`).toBeDefined();
    expect(vars[bg], `${bg} missing`).toBeDefined();
    expect(contrastRatio(vars[fg], vars[bg])).toBeGreaterThanOrEqual(3);
  });
});

describe('non-colour tokens', () => {
  it('defines the layout and target tokens used by components', () => {
    for (const name of ['--content-max', '--page-max', '--gutter', '--target', '--focus-width', '--radius-md', '--space-4']) {
      expect(light[name], `${name} missing`).toBeDefined();
    }
  });

  it('removes the card shadow in dark mode', () => {
    expect(dark['--shadow']).toBe('none');
  });
});
