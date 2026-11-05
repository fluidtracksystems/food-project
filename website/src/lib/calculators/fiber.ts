export interface FiberInput {
  age: string | number;
  sex?: string;
  /** Optional daily calories. Blank means no calorie-based figure. */
  calories?: string | number;
}

export type FiberResult =
  | {
      ok: true;
      /** IOM Adequate Intake for total fiber, grams per day. Never depends on calories. */
      aiGrams: number;
      bandLabel: string;
      /** 14 g per 1,000 kcal, whole grams. Only for age 19 and over with calories in range. */
      calorieGrams?: number;
      /** Why there is no calorie figure, when calories were entered but cannot be used. */
      calorieNote?: string;
    }
  | { ok: false; errors: { age?: string; sex?: string } };

export const FIBER_MIN_AGE = 4;
export const FIBER_MAX_AGE = 120;
export const FIBER_CALORIE_MIN = 1000;
export const FIBER_CALORIE_MAX = 4000;
/** Grams of fiber per 1,000 kcal (Dietary Guidelines for Americans 2020-2025, Appendix 1). */
export const FIBER_G_PER_1000_KCAL = 14;
const CALORIE_FROM_AGE = 19;

interface Band {
  label: string;
  minAge: number;
  maxAge: number;
  male: number;
  female: number;
}

// IOM Adequate Intake for total fiber, g/day (DRI summary table, 2002/2005). Transcribed from
// gan-harness/sources/fiber.md section 1. Ages 1-3, pregnancy and lactation are not offered.
const BANDS: readonly Band[] = [
  { label: '4-8', minAge: 4, maxAge: 8, male: 25, female: 25 },
  { label: '9-13', minAge: 9, maxAge: 13, male: 31, female: 26 },
  { label: '14-18', minAge: 14, maxAge: 18, male: 38, female: 26 },
  { label: '19-30', minAge: 19, maxAge: 30, male: 38, female: 25 },
  { label: '31-50', minAge: 31, maxAge: 50, male: 38, female: 25 },
  { label: '51-70', minAge: 51, maxAge: 70, male: 30, female: 21 },
  { label: '71 and over', minAge: 71, maxAge: FIBER_MAX_AGE, male: 30, female: 21 },
];

const isBlank = (v: unknown): boolean => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
const WHOLE_NUMBER = /^-?\d+(\.\d+)?$/;
// Digits with at least one comma, optionally a decimal point: "2,000", "1,5".
const COMMA_NUMBER = /^[+-]?\d[\d,]*,[\d,]*\d(\.\d*)?$/;

function parseAge(raw: string | number): { ok: true; value: number } | { ok: false; error: string } {
  const bad = { ok: false, error: `Age must be a whole number from ${FIBER_MIN_AGE} to ${FIBER_MAX_AGE}, like 35.` } as const;
  if (isBlank(raw)) return { ok: false, error: 'Enter an age.' };
  const text = typeof raw === 'number' ? String(raw) : raw.trim();
  if (!WHOLE_NUMBER.test(text)) return bad;
  const value = Number(text);
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) return bad;
  if (value < FIBER_MIN_AGE) return { ok: false, error: `This calculator covers ages ${FIBER_MIN_AGE} and over.` };
  if (value > FIBER_MAX_AGE) return bad;
  return { ok: true, value };
}

function calorieFigure(raw: string | number, age: number): Pick<Extract<FiberResult, { ok: true }>, 'calorieGrams' | 'calorieNote'> {
  if (isBlank(raw)) return {};
  if (age < CALORIE_FROM_AGE) {
    return { calorieNote: `A calorie-based figure is only given for ages ${CALORIE_FROM_AGE} and over.` };
  }
  const text = typeof raw === 'number' ? String(raw) : raw.trim();
  const value = typeof raw === 'number' ? raw : /^[+-]?(\d+\.?\d*|\.\d+)$/.test(text) ? Number(text) : Number.NaN;
  if (!Number.isFinite(value)) {
    if (typeof raw === 'string' && COMMA_NUMBER.test(text)) {
      return { calorieNote: 'The calories must be a number. Leave out commas, for example 2000 instead of 2,000.' };
    }
    return { calorieNote: 'The calories must be a number, like 2000.' };
  }
  if (value < 0) return { calorieNote: 'The calories cannot be negative.' };
  if (value < FIBER_CALORIE_MIN || value > FIBER_CALORIE_MAX) {
    return { calorieNote: 'Enter calories from 1,000 to 4,000 a day. This range is this site’s own limit.' };
  }
  // Clean float noise before rounding so 31.5 rounds half up to 32.
  const grams = Math.round(Number(((FIBER_G_PER_1000_KCAL * value) / 1000).toPrecision(12)));
  return { calorieGrams: grams };
}

/** General daily fiber guideline by age and sex, plus an optional calorie-based figure. Pure; never throws. */
export function calculateFiber(input: FiberInput): FiberResult {
  const errors: { age?: string; sex?: string } = {};
  const age = parseAge(input?.age);
  if (!age.ok) errors.age = age.error;
  const sex = typeof input?.sex === 'string' ? input.sex.trim() : '';
  if (sex !== 'female' && sex !== 'male') errors.sex = 'Choose female or male.';
  if (!age.ok || (sex !== 'female' && sex !== 'male')) return { ok: false, errors };

  const band = BANDS.find((b) => age.value >= b.minAge && age.value <= b.maxAge);
  if (!band) return { ok: false, errors: { age: `Age must be a whole number from ${FIBER_MIN_AGE} to ${FIBER_MAX_AGE}, like 35.` } };
  return {
    ok: true,
    aiGrams: band[sex],
    // Name the sex only where the two sexes have different values.
    bandLabel: band.male === band.female ? `Ages ${band.label}` : `Ages ${band.label}, ${sex}`,
    ...calorieFigure(input.calories ?? '', age.value),
  };
}
