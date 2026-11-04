const HEX = /^#[0-9a-fA-F]{6}$/;

/** WCAG 2.x relative luminance of a `#RRGGBB` colour (0 = black, 1 = white). */
export function relativeLuminance(hex: string): number {
  if (!HEX.test(hex)) {
    throw new Error(`invalid hex colour "${hex}"`);
  }
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two `#RRGGBB` colours, from 1 to 21. Argument order does not matter. */
export function contrastRatio(fg: string, bg: string): number {
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  const [lighter, darker] = a >= b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}
