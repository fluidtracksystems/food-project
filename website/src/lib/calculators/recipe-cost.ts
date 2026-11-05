import { convert } from '../units';

/** Raw field values as typed. Numbers are accepted for convenience; strings are what a form gives. */
export interface RowInput {
  name: string;
  quantity: string | number;
  unit: string;
  packPrice: string | number;
  packSize: string | number;
  packUnit: string;
}

export type RowResult = { kind: 'empty' } | { kind: 'ok'; cost: number } | { kind: 'error'; error: string };

export interface RowError {
  /** Zero-based index into the rows that were passed in. */
  row: number;
  message: string;
}

export interface RecipeCostResult {
  rows: RowResult[];
  /** Sum of the valid rows. Always computed, even when other rows or the servings are invalid. */
  total: number;
  /** `total / servings`, or null when servings is not a positive whole number. */
  perServing: number | null;
  servingsError?: string;
  errors: RowError[];
}

const DECIMAL = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

type Parsed = { ok: true; value: number } | { ok: false; error: string };

function isBlank(v: string | number): boolean {
  return typeof v === 'string' && v.trim() === '';
}

function parseNumber(raw: string | number, label: string): Parsed {
  if (isBlank(raw)) return { ok: false, error: `Enter the ${label}.` };
  const value = typeof raw === 'number' ? raw : DECIMAL.test(raw.trim()) ? Number(raw.trim()) : Number.NaN;
  if (!Number.isFinite(value)) {
    return { ok: false, error: `The ${label} must be a number, like 2 or 0.5.` };
  }
  return { ok: true, value };
}

function parseNonNegative(raw: string | number, label: string): Parsed {
  const parsed = parseNumber(raw, label);
  if (parsed.ok && parsed.value < 0) return { ok: false, error: `The ${label} cannot be negative.` };
  return parsed;
}


function rowCost(input: RowInput): RowResult {
  const quantity = parseNonNegative(input.quantity, 'quantity used');
  if (!quantity.ok) return { kind: 'error', error: quantity.error };
  const price = parseNonNegative(input.packPrice, 'pack price');
  if (!price.ok) return { kind: 'error', error: price.error };
  const size = parseNonNegative(input.packSize, 'pack size');
  if (!size.ok) return { kind: 'error', error: size.error };
  if (size.value === 0) return { kind: 'error', error: 'The pack size must be greater than 0.' };

  const used = convert(quantity.value, input.unit, input.packUnit);
  if (!used.ok) return { kind: 'error', error: used.error };

  const cost = (price.value * used.value) / size.value;
  if (!Number.isFinite(cost)) return { kind: 'error', error: 'That cost is too large to calculate.' };
  return { kind: 'ok', cost };
}

function parseServings(raw: string | number): { ok: true; value: number } | { ok: false; error: string } {
  const parsed = parseNumber(raw, 'servings');
  if (!parsed.ok || !Number.isInteger(parsed.value) || parsed.value < 1) {
    return { ok: false, error: 'Servings must be a whole number of 1 or more, like 4.' };
  }
  return { ok: true, value: parsed.value };
}

/** Unit-cost arithmetic for a recipe. Pure and never throws: each bad row reports its own error. */
export function calculateRecipeCost(inputs: readonly RowInput[], servings: string | number): RecipeCostResult {
  const rows: RowResult[] = [];
  const errors: RowError[] = [];
  let total = 0;

  inputs.forEach((input, index) => {
    const untouched = [input.name, input.quantity, input.packPrice, input.packSize].every(isBlank);
    let result: RowResult = untouched ? { kind: 'empty' } : rowCost(input);
    if (result.kind === 'ok') {
      if (Number.isFinite(total + result.cost)) total += result.cost;
      else result = { kind: 'error', error: 'The total is too large to calculate.' };
    }
    if (result.kind === 'error') errors.push({ row: index, message: result.error });
    rows.push(result);
  });

  const parsedServings = parseServings(servings);
  return {
    rows,
    total,
    perServing: parsedServings.ok ? total / parsedServings.value : null,
    ...(parsedServings.ok ? {} : { servingsError: parsedServings.error }),
    errors,
  };
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/**
 * Formats dollars, rounding half up to the cent. Binary floats put values like 1.005 just under the
 * half-cent, so the cents figure is cleaned to 12 significant digits before rounding.
 */
export function formatUsd(amount: number): string {
  const cents = Math.abs(amount) < 1e9 ? Math.round(Number((amount * 100).toPrecision(12))) / 100 : amount;
  return usd.format(cents || 0);
}
