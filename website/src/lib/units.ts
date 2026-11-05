export type Dimension = 'mass' | 'volume' | 'count';

// Each unit's size in its dimension's base unit (g, ml, each). US customary definitions
// (NIST Handbook 44, Appendix C; NIST SP 811), exact by definition.
const FACTORS = {
  g: { dimension: 'mass', perBase: 1 },
  kg: { dimension: 'mass', perBase: 1000 },
  oz: { dimension: 'mass', perBase: 28.349523125 },
  lb: { dimension: 'mass', perBase: 453.59237 },
  ml: { dimension: 'volume', perBase: 1 },
  l: { dimension: 'volume', perBase: 1000 },
  tsp: { dimension: 'volume', perBase: 4.92892159375 },
  tbsp: { dimension: 'volume', perBase: 14.78676478125 },
  floz: { dimension: 'volume', perBase: 29.5735295625 },
  cup: { dimension: 'volume', perBase: 236.5882365 },
  each: { dimension: 'count', perBase: 1 },
} as const;

export type Unit = keyof typeof FACTORS;

export const UNITS = Object.keys(FACTORS) as Unit[];

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function isUnit(value: string): value is Unit {
  return Object.hasOwn(FACTORS, value);
}

export function dimensionOf(unit: Unit): Dimension {
  return FACTORS[unit].dimension;
}

/**
 * Converts within one dimension. Never crosses mass, volume and count: that needs the
 * ingredient's density, which this module does not guess. Never throws.
 */
export function convert(amount: number, from: string, to: string): Result<number> {
  if (!isUnit(from)) return { ok: false, error: `Unknown unit "${from}".` };
  if (!isUnit(to)) return { ok: false, error: `Unknown unit "${to}".` };
  if (!Number.isFinite(amount) || amount < 0) {
    return { ok: false, error: 'The amount must be a number that is zero or more.' };
  }
  if (FACTORS[from].dimension !== FACTORS[to].dimension) {
    return {
      ok: false,
      error: `Cannot convert ${from} to ${to} without the ingredient's density. Use the same kind of unit as the pack.`,
    };
  }
  const value = (amount * FACTORS[from].perBase) / FACTORS[to].perBase;
  if (!Number.isFinite(value)) return { ok: false, error: 'That amount is too large to convert.' };
  return { ok: true, value };
}
