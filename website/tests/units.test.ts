import { describe, expect, it } from 'vitest';
import { UNITS, convert, dimensionOf, isUnit, type Unit } from '../src/lib/units';

function value(amount: number, from: string, to: string): number {
  const r = convert(amount, from, to);
  if (!r.ok) throw new Error(r.error);
  return r.value;
}

describe('dimensionOf / isUnit', () => {
  it('classifies every unit into mass, volume or count', () => {
    expect(dimensionOf('g')).toBe('mass');
    expect(dimensionOf('kg')).toBe('mass');
    expect(dimensionOf('oz')).toBe('mass');
    expect(dimensionOf('lb')).toBe('mass');
    for (const u of ['ml', 'l', 'tsp', 'tbsp', 'cup', 'floz']) expect(dimensionOf(u as Unit)).toBe('volume');
    expect(dimensionOf('each')).toBe('count');
  });

  it('lists all eleven units', () => {
    expect([...UNITS].sort()).toEqual(['cup', 'each', 'floz', 'g', 'kg', 'l', 'lb', 'ml', 'oz', 'tbsp', 'tsp']);
  });

  it('recognises only known units', () => {
    expect(isUnit('cup')).toBe(true);
    expect(isUnit('stone')).toBe(false);
    expect(isUnit('')).toBe(false);
    expect(isUnit('CUP')).toBe(false);
  });
});

describe('convert: exact factors', () => {
  it('mass', () => {
    expect(value(1, 'lb', 'g')).toBe(453.59237);
    expect(value(1, 'oz', 'g')).toBe(28.349523125);
    expect(value(1, 'kg', 'g')).toBe(1000);
    expect(value(1000, 'g', 'kg')).toBe(1);
  });

  it('volume', () => {
    expect(value(1, 'tsp', 'ml')).toBe(4.92892159375);
    expect(value(1, 'tbsp', 'ml')).toBe(14.78676478125);
    expect(value(1, 'floz', 'ml')).toBe(29.5735295625);
    expect(value(1, 'cup', 'ml')).toBe(236.5882365);
    expect(value(1, 'l', 'ml')).toBe(1000);
  });

  it('round-trips and relates US units', () => {
    expect(value(16, 'oz', 'lb')).toBeCloseTo(1, 12);
    expect(value(1, 'cup', 'floz')).toBeCloseTo(8, 12);
    expect(value(3, 'tsp', 'tbsp')).toBeCloseTo(1, 12);
    expect(value(2.5, 'lb', 'lb')).toBe(2.5);
    expect(value(7, 'each', 'each')).toBe(7);
  });

  it('keeps zero as zero', () => {
    expect(value(0, 'cup', 'ml')).toBe(0);
  });
});

describe('convert: errors never throw', () => {
  it('refuses to cross dimensions and does not guess a density', () => {
    const r = convert(1, 'cup', 'g');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/density/i);
    expect(convert(1, 'each', 'g').ok).toBe(false);
    expect(convert(1, 'ml', 'each').ok).toBe(false);
  });

  it('rejects unknown units', () => {
    expect(convert(1, 'stone', 'g').ok).toBe(false);
    expect(convert(1, 'g', 'pinch').ok).toBe(false);
    expect(convert(1, '', '').ok).toBe(false);
  });

  it('rejects NaN, Infinity and negative amounts', () => {
    expect(convert(Number.NaN, 'g', 'kg').ok).toBe(false);
    expect(convert(Infinity, 'g', 'kg').ok).toBe(false);
    expect(convert(-Infinity, 'g', 'kg').ok).toBe(false);
    expect(convert(-1, 'g', 'kg').ok).toBe(false);
  });

  it('rejects a result that overflows', () => {
    expect(convert(Number.MAX_VALUE, 'kg', 'g').ok).toBe(false);
  });

  it('handles very large finite amounts', () => {
    expect(value(1e15, 'kg', 'g')).toBe(1e18);
  });
});
