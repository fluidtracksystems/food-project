import { USDA_FOOD_PLANS, type FoodPlan, type FoodPlanGroup, type PlanId } from '../../data/usda-food-plans';

/** Raw member fields as typed. `sex` is only used from age 12 up. */
export interface MemberInput {
  age: string | number;
  sex?: string;
}

export type MemberResult = { kind: 'empty' } | { kind: 'ok'; age: number; sex?: 'female' | 'male' } | { kind: 'error'; error: string };

export interface MemberError {
  /** Zero-based index into the members that were passed in. */
  member: number;
  message: string;
}

export interface PlanCost {
  plan: PlanId;
  name: string;
  /** Dollars, rounded to the cent after the household-size factor is applied. */
  weekly: number;
  monthly: number;
}

export interface GroceryResult {
  members: MemberResult[];
  errors: MemberError[];
  /** Members that were counted. Household size for the factor is this number. */
  validCount: number;
  /** Members with a problem, left out of the totals. */
  excludedCount: number;
  /** The household-size factor used, or null when there is nothing to calculate. */
  factor: number | null;
  /** One entry per plan, or empty when there is no valid member or too many members. */
  costs: PlanCost[];
  limitError?: string;
  asOf: string;
  asOfLabel: string;
}

export const MAX_MEMBERS = 12;
export const MIN_AGE = 1;
export const MAX_AGE = 120;
/** Sex matters for the USDA tables from this age. */
export const SEX_FROM_AGE = 12;

/** USDA household-size adjustment (footnote 2 of the Cost of Food reports). */
export function householdFactor(size: number): number {
  if (size <= 1) return 1.2;
  if (size === 2) return 1.1;
  if (size === 3) return 1.05;
  if (size === 4) return 1.0;
  if (size <= 6) return 0.95;
  return 0.9;
}

/** The plan's group for this age and sex, if any. Sex is ignored for children (groups with sex 'any'). */
export function findGroup(plan: FoodPlan, age: number, sex?: string): FoodPlanGroup | undefined {
  return plan.groups.find((g) => age >= g.minAge && age <= g.maxAge && (g.sex === 'any' || g.sex === sex));
}

const isBlank = (v: unknown): boolean => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

function parseAge(raw: string | number): { ok: true; value: number } | { ok: false; error: string } {
  const whole = { ok: false, error: `Age must be a whole number from ${MIN_AGE} to ${MAX_AGE}, like 35.` } as const;
  const text = typeof raw === 'number' ? String(raw) : raw.trim();
  if (!/^-?\d+(\.\d+)?$/.test(text)) return whole;
  const value = Number(text);
  if (!Number.isFinite(value)) return whole;
  if (value < 0) return { ok: false, error: 'Age cannot be negative.' };
  if (!Number.isInteger(value)) return whole;
  if (value < MIN_AGE) {
    return { ok: false, error: 'Infants under 1 are not covered by the USDA food plans. Enter an age of 1 or more.' };
  }
  if (value > MAX_AGE) return whole;
  return { ok: true, value };
}

function checkMember(input: MemberInput): MemberResult {
  const ageBlank = isBlank(input?.age);
  const sexBlank = isBlank(input?.sex);
  if (ageBlank && sexBlank) return { kind: 'empty' };
  if (ageBlank) return { kind: 'error', error: 'Enter an age.' };
  const age = parseAge(input.age);
  if (!age.ok) return { kind: 'error', error: age.error };
  if (age.value < SEX_FROM_AGE) return { kind: 'ok', age: age.value };
  const sex = typeof input.sex === 'string' ? input.sex.trim() : '';
  if (sex !== 'female' && sex !== 'male') {
    return { kind: 'error', error: `Choose female or male. The USDA costs differ by sex from age ${SEX_FROM_AGE}.` };
  }
  return { kind: 'ok', age: age.value, sex };
}

/** Rounds half up to the cent; the cents figure is cleaned to 12 significant digits to undo float noise. */
const toDollars = (cents: number): number => Math.round(Number(cents.toPrecision(12))) / 100;

/**
 * Household food-at-home cost under each USDA plan: sum each member's printed cost for their age and sex,
 * then apply the household-size factor. Weekly and monthly are summed separately from the printed
 * columns (never derived from each other). Pure and never throws.
 */
export function calculateGroceryBudget(inputs: readonly MemberInput[]): GroceryResult {
  const members = inputs.map(checkMember);
  const errors: MemberError[] = [];
  members.forEach((m, member) => {
    if (m.kind === 'error') errors.push({ member, message: m.error });
  });
  const valid = members.filter((m): m is Extract<MemberResult, { kind: 'ok' }> => m.kind === 'ok');
  const filled = members.filter((m) => m.kind !== 'empty').length;
  const base = {
    members,
    errors,
    validCount: valid.length,
    excludedCount: errors.length,
    asOf: USDA_FOOD_PLANS.asOf,
    asOfLabel: USDA_FOOD_PLANS.asOfLabel,
  };

  if (filled > MAX_MEMBERS) {
    return { ...base, factor: null, costs: [], limitError: `Enter at most ${MAX_MEMBERS} people. Remove a row to see the estimate.` };
  }
  if (valid.length === 0) return { ...base, factor: null, costs: [] };

  const factor = householdFactor(valid.length);
  const costs = USDA_FOOD_PLANS.plans.map((plan): PlanCost => {
    let weeklyCents = 0;
    let monthlyCents = 0;
    for (const m of valid) {
      const group = findGroup(plan, m.age, m.sex);
      if (!group) continue; // not reachable for validated members; the data tests cover every age
      weeklyCents += Math.round(group.weekly * 100);
      monthlyCents += Math.round(group.monthly * 100);
    }
    return { plan: plan.id, name: plan.name, weekly: toDollars(weeklyCents * factor), monthly: toDollars(monthlyCents * factor) };
  });
  return { ...base, factor, costs };
}
