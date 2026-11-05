import { describe, expect, it } from 'vitest';
import { calculateRecipeCost, formatUsd, type RowInput } from '../src/lib/calculators/recipe-cost';

function row(p: Partial<RowInput> = {}): RowInput {
  return { name: '', quantity: '', unit: 'g', packPrice: '', packSize: '', packUnit: 'g', ...p };
}

const rice = row({ name: 'Rice', quantity: '250', unit: 'g', packPrice: '4.00', packSize: '1', packUnit: 'kg' });

describe('calculateRecipeCost: hand-checked values', () => {
  it('250 g from a 1 kg pack at $4.00 costs $1.00', () => {
    const r = calculateRecipeCost([rice], '1');
    expect(r.rows[0]).toEqual({ kind: 'ok', cost: 1 });
    expect(r.total).toBe(1);
    expect(r.perServing).toBe(1);
  });

  it('1 lb from a 2 lb bag at $3.20 costs $1.60', () => {
    const r = calculateRecipeCost(
      [row({ quantity: '1', unit: 'lb', packPrice: '3.20', packSize: '2', packUnit: 'lb' })],
      '1',
    );
    expect(r.total).toBeCloseTo(1.6, 10);
  });

  it('1 cup from a 2 lb bag cannot be priced without a density', () => {
    const r = calculateRecipeCost(
      [row({ quantity: '1', unit: 'cup', packPrice: '3.20', packSize: '2', packUnit: 'lb' })],
      '1',
    );
    expect(r.rows[0]).toMatchObject({ kind: 'error' });
    expect(r.total).toBe(0);
  });

  it('mixes US and metric: 8 oz from a 1 kg pack at $5.00', () => {
    const r = calculateRecipeCost(
      [row({ quantity: '8', unit: 'oz', packPrice: '5', packSize: '1', packUnit: 'kg' })],
      '1',
    );
    // 8 oz = 226.796185 g = 0.226796185 kg
    expect(r.total).toBeCloseTo(1.133980925, 9);
  });

  it('volume: 2 tbsp from a 500 ml bottle at $6.00', () => {
    const r = calculateRecipeCost(
      [row({ quantity: '2', unit: 'tbsp', packPrice: '6', packSize: '500', packUnit: 'ml' })],
      '1',
    );
    expect(r.total).toBeCloseTo((6 * 2 * 14.78676478125) / 500, 10);
  });

  it('counts: 3 eggs from a dozen at $4.80', () => {
    const r = calculateRecipeCost(
      [row({ quantity: '3', unit: 'each', packPrice: '4.80', packSize: '12', packUnit: 'each' })],
      '1',
    );
    expect(r.total).toBeCloseTo(1.2, 10);
  });

  it('divides the total by servings', () => {
    const r = calculateRecipeCost([rice, rice], '4');
    expect(r.total).toBe(2);
    expect(r.perServing).toBe(0.5);
  });

  it('works with servings of 1 and many rows', () => {
    const rows = Array.from({ length: 50 }, () => rice);
    const r = calculateRecipeCost(rows, '1');
    expect(r.total).toBeCloseTo(50, 9);
    expect(r.perServing).toBeCloseTo(50, 9);
    expect(r.errors).toEqual([]);
  });

  it('accepts numbers as well as strings', () => {
    const r = calculateRecipeCost([row({ quantity: 250, packPrice: 4, packSize: 1, packUnit: 'kg' })], 2);
    expect(r.total).toBe(1);
    expect(r.perServing).toBe(0.5);
  });
});

describe('calculateRecipeCost: empty and zero', () => {
  it('ignores empty rows (not errors)', () => {
    const r = calculateRecipeCost([row(), row({ unit: 'cup', packUnit: 'kg' }), rice], '2');
    expect(r.rows[0]).toEqual({ kind: 'empty' });
    expect(r.rows[1]).toEqual({ kind: 'empty' });
    expect(r.errors).toEqual([]);
    expect(r.total).toBe(1);
  });

  it('with no rows at all, total is zero and there are no errors', () => {
    const r = calculateRecipeCost([], '2');
    expect(r.total).toBe(0);
    expect(r.perServing).toBe(0);
    expect(r.errors).toEqual([]);
  });

  it('treats whitespace-only fields as empty', () => {
    expect(calculateRecipeCost([row({ name: '  ', quantity: ' ' })], '1').rows[0]).toEqual({ kind: 'empty' });
  });

  it('a zero quantity is a valid zero-cost row', () => {
    const r = calculateRecipeCost([row({ quantity: '0', packPrice: '4', packSize: '1', packUnit: 'kg' })], '1');
    expect(r.rows[0]).toEqual({ kind: 'ok', cost: 0 });
    expect(r.errors).toEqual([]);
  });

  it('a zero pack price is valid and free', () => {
    const r = calculateRecipeCost([row({ quantity: '5', packPrice: '0', packSize: '1', packUnit: 'kg' })], '1');
    expect(r.rows[0]).toEqual({ kind: 'ok', cost: 0 });
  });

  it('a row with only a name is incomplete, not empty', () => {
    const r = calculateRecipeCost([row({ name: 'Salt' })], '1');
    expect(r.rows[0]).toMatchObject({ kind: 'error' });
  });
});

describe('calculateRecipeCost: invalid input', () => {
  const bad = (p: Partial<RowInput>): string => {
    const r = calculateRecipeCost([row({ quantity: '1', packPrice: '1', packSize: '1', ...p })], '1');
    const first = r.rows[0];
    if (first?.kind !== 'error') throw new Error(`expected an error, got ${JSON.stringify(first)}`);
    return first.error;
  };

  it('rejects negative numbers', () => {
    expect(bad({ quantity: '-1' })).toMatch(/quantity/i);
    expect(bad({ packPrice: '-0.01' })).toMatch(/price/i);
    expect(bad({ packSize: '-5' })).toMatch(/size/i);
  });

  it('rejects a pack size of zero', () => {
    expect(bad({ packSize: '0' })).toMatch(/greater than 0/i);
  });

  it('rejects non-numeric text', () => {
    expect(bad({ quantity: 'abc' })).toMatch(/number/i);
    expect(bad({ packPrice: '$4' })).toMatch(/number/i);
    expect(bad({ packSize: '1,5' })).toMatch(/number/i);
    expect(bad({ quantity: '0x10' })).toMatch(/number/i);
    expect(bad({ quantity: '1e' })).toMatch(/number/i);
  });

  it('rejects NaN and Infinity as text or number', () => {
    expect(bad({ quantity: 'NaN' })).toMatch(/number/i);
    expect(bad({ quantity: 'Infinity' })).toMatch(/number/i);
    expect(bad({ quantity: Number.NaN })).toMatch(/number/i);
    expect(bad({ packPrice: Infinity })).toMatch(/number/i);
    expect(bad({ packSize: -Infinity })).toMatch(/number/i);
  });

  it('reports a missing field by name', () => {
    expect(bad({ quantity: '' })).toMatch(/quantity/i);
    expect(bad({ packPrice: '' })).toMatch(/price/i);
    expect(bad({ packSize: '' })).toMatch(/size/i);
  });

  it('rejects incompatible units with a plain explanation', () => {
    expect(bad({ unit: 'cup', packUnit: 'g' })).toMatch(/density/i);
    expect(bad({ unit: 'each', packUnit: 'kg' })).toMatch(/same kind/i);
  });

  it('rejects unknown units', () => {
    expect(bad({ unit: 'pinch' })).toMatch(/unit/i);
    expect(bad({ packUnit: 'stone' })).toMatch(/unit/i);
  });

  it('rejects a cost that overflows', () => {
    expect(bad({ quantity: '1e308', packPrice: '1e308', packSize: '1', packUnit: 'g' })).toMatch(/too large/i);
  });

  it('copes with very large but finite values', () => {
    const r = calculateRecipeCost([row({ quantity: '1e12', packPrice: '1e6', packSize: '1', packUnit: 'g' })], '1');
    expect(r.total).toBe(1e18);
  });
});

describe('calculateRecipeCost: one bad row never hides the others', () => {
  it('sums the valid rows and lists the error with its row index', () => {
    const r = calculateRecipeCost([rice, row({ quantity: 'x', packPrice: '1', packSize: '1' }), rice], '2');
    expect(r.total).toBe(2);
    expect(r.perServing).toBe(1);
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0]?.row).toBe(1);
    expect(r.errors[0]?.message).toMatch(/quantity/i);
    expect(r.rows[0]).toEqual({ kind: 'ok', cost: 1 });
    expect(r.rows[2]).toEqual({ kind: 'ok', cost: 1 });
  });

  it('does not throw on a mix of garbage', () => {
    const rows = [row({ name: 'x' }), row({ quantity: 'NaN', packPrice: '-1', packSize: '0' }), rice];
    expect(() => calculateRecipeCost(rows, 'two')).not.toThrow();
  });
});

describe('calculateRecipeCost: servings', () => {
  it.each(['0', '-2', '2.5', 'abc', '', 'Infinity', '1e400'])('rejects servings %j', (s) => {
    const r = calculateRecipeCost([rice], s);
    expect(r.perServing).toBeNull();
    expect(r.servingsError).toMatch(/serving/i);
    expect(r.total).toBe(1);
  });

  it('accepts whole numbers including a trailing .0', () => {
    expect(calculateRecipeCost([rice], '4').servingsError).toBeUndefined();
    expect(calculateRecipeCost([rice], '4.0').perServing).toBe(0.25);
    expect(calculateRecipeCost([rice], 1).perServing).toBe(1);
  });
});

describe('formatUsd', () => {
  it('formats as US dollars', () => {
    expect(formatUsd(0)).toBe('$0.00');
    expect(formatUsd(1)).toBe('$1.00');
    expect(formatUsd(1234.5)).toBe('$1,234.50');
  });

  it('rounds half up at half-cent boundaries', () => {
    expect(formatUsd(0.005)).toBe('$0.01');
    expect(formatUsd(0.015)).toBe('$0.02');
    expect(formatUsd(0.025)).toBe('$0.03');
    expect(formatUsd(1.005)).toBe('$1.01');
    expect(formatUsd(2.675)).toBe('$2.68');
    expect(formatUsd(0.004)).toBe('$0.00');
    expect(formatUsd(0.0049)).toBe('$0.00');
  });

  it('absorbs floating point noise on an exact half cent', () => {
    expect(formatUsd(0.1 + 0.2 - 0.295)).toBe('$0.01');
  });

  it('handles very large amounts', () => {
    expect(formatUsd(1e15)).toBe('$1,000,000,000,000,000.00');
  });
});
