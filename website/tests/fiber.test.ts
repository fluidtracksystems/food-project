import { describe, expect, it } from 'vitest';
import { calculateFiber, FIBER_CALORIE_MAX, FIBER_CALORIE_MIN } from '../src/lib/calculators/fiber';

const ok = (r: ReturnType<typeof calculateFiber>) => {
  if (!r.ok) throw new Error(`expected ok, got: ${JSON.stringify(r.errors)}`);
  return r;
};

describe('calculateFiber: IOM Adequate Intake by band and sex', () => {
  const cases: [number, 'female' | 'male', number, string][] = [
    [4, 'female', 25, '4-8'],
    [4, 'male', 25, '4-8'],
    [8, 'female', 25, '4-8'],
    [8, 'male', 25, '4-8'],
    [9, 'male', 31, '9-13'],
    [9, 'female', 26, '9-13'],
    [13, 'male', 31, '9-13'],
    [13, 'female', 26, '9-13'],
    [14, 'male', 38, '14-18'],
    [14, 'female', 26, '14-18'],
    [18, 'male', 38, '14-18'],
    [18, 'female', 26, '14-18'],
    [19, 'male', 38, '19-30'],
    [19, 'female', 25, '19-30'],
    [30, 'male', 38, '19-30'],
    [30, 'female', 25, '19-30'],
    [31, 'male', 38, '31-50'],
    [31, 'female', 25, '31-50'],
    [50, 'male', 38, '31-50'],
    [50, 'female', 25, '31-50'],
    [51, 'male', 30, '51-70'],
    [51, 'female', 21, '51-70'],
    [70, 'male', 30, '51-70'],
    [70, 'female', 21, '51-70'],
    [71, 'male', 30, '71 and over'],
    [71, 'female', 21, '71 and over'],
    [120, 'male', 30, '71 and over'],
    [120, 'female', 21, '71 and over'],
  ];
  it.each(cases)('age %d %s gives %d g (%s)', (age, sex, grams, label) => {
    const r = ok(calculateFiber({ age: String(age), sex }));
    expect(r.aiGrams).toBe(grams);
    expect(r.bandLabel).toContain(label);
  });

  it('names the sex in the band label only where the two sexes differ', () => {
    // Ages 4-8 share one figure, so a label saying "female" or "male" would be misleading.
    expect(ok(calculateFiber({ age: 6, sex: 'female' })).bandLabel).toBe('Ages 4-8');
    expect(ok(calculateFiber({ age: 6, sex: 'male' })).bandLabel).toBe('Ages 4-8');
    expect(ok(calculateFiber({ age: 40, sex: 'female' })).bandLabel).toBe('Ages 31-50, female');
    expect(ok(calculateFiber({ age: 40, sex: 'male' })).bandLabel).toBe('Ages 31-50, male');
    expect(ok(calculateFiber({ age: 80, sex: 'female' })).bandLabel).toBe('Ages 71 and over, female');
  });

  it('every whole age 4 to 120 gets a value for each sex', () => {
    for (let age = 4; age <= 120; age++) {
      for (const sex of ['female', 'male'] as const) expect(ok(calculateFiber({ age, sex })).aiGrams).toBeGreaterThan(0);
    }
  });

  it('a 40-year-old woman has 25 g and, at 2,000 kcal, 28 g by calories', () => {
    const r = ok(calculateFiber({ age: '40', sex: 'female', calories: '2000' }));
    expect(r.aiGrams).toBe(25);
    expect(r.calorieGrams).toBe(28);
  });

  it('accepts numbers as well as strings', () => {
    expect(ok(calculateFiber({ age: 40, sex: 'male', calories: 2000 })).calorieGrams).toBe(28);
  });
});

describe('calculateFiber: age and sex validation', () => {
  it('says ages under 4 are not covered', () => {
    for (const age of ['3', '1', '0', 3]) {
      const r = calculateFiber({ age, sex: 'female' });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.age).toMatch(/4 and over/);
    }
  });

  it.each(['121', 121, '4.5', 40.5, 'abc', '', '  ', '-5', -5, 'NaN', 'Infinity', Infinity, Number.NaN, '1e1'])(
    'rejects age %s',
    (age) => {
      const r = calculateFiber({ age, sex: 'male' });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.age).toBeTruthy();
    },
  );

  it('requires a sex', () => {
    for (const sex of ['', undefined, 'other']) {
      const r = calculateFiber({ age: '40', sex });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.sex).toBeTruthy();
    }
  });

  it('reports the age and sex problems together', () => {
    const r = calculateFiber({ age: 'x', sex: '' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.age).toBeTruthy();
      expect(r.errors.sex).toBeTruthy();
    }
  });

  it('does not throw on odd input', () => {
    expect(() => calculateFiber({ age: undefined as unknown as string, sex: null as unknown as string })).not.toThrow();
  });
});

describe('calculateFiber: calorie-based figure', () => {
  const grams = (calories: string | number | undefined, age: string | number = '40') =>
    ok(calculateFiber({ age, sex: 'male', calories }));

  it('exposes the site range', () => {
    expect(FIBER_CALORIE_MIN).toBe(1000);
    expect(FIBER_CALORIE_MAX).toBe(4000);
  });

  it('accepts the edges 1000 and 4000', () => {
    expect(grams('1000').calorieGrams).toBe(14);
    expect(grams('4000').calorieGrams).toBe(56);
  });

  it('rejects 999 and 4001 with a note and no number', () => {
    for (const c of ['999', '4001']) {
      const r = grams(c);
      expect(r.calorieGrams).toBeUndefined();
      expect(r.calorieNote).toMatch(/1,000 to 4,000/);
      expect(r.aiGrams).toBe(38);
    }
  });

  it('blank calories mean no calorie figure and no note', () => {
    for (const c of [undefined, '', '   ']) {
      const r = grams(c);
      expect(r.calorieGrams).toBeUndefined();
      expect(r.calorieNote).toBeUndefined();
    }
  });

  it('gives a message for text, NaN and Infinity', () => {
    for (const c of ['abc', 'NaN', 'Infinity', Number.NaN, Infinity, '-2000', -2000]) {
      const r = grams(c);
      expect(r.calorieGrams).toBeUndefined();
      expect(r.calorieNote).toBeTruthy();
    }
  });

  it('gives the comma message for "2,000" like the recipe calculator', () => {
    const r = grams('2,000');
    expect(r.calorieGrams).toBeUndefined();
    expect(r.calorieNote).toMatch(/comma/i);
    expect(r.calorieNote).toMatch(/2000/);
  });

  it('trims whitespace', () => {
    expect(grams('  2000 ').calorieGrams).toBe(28);
  });

  it('is only for age 19 and over', () => {
    for (const age of ['18', '14', '9', '4']) {
      const r = grams('2000', age);
      expect(r.calorieGrams).toBeUndefined();
      expect(r.calorieNote).toMatch(/19/);
    }
    expect(grams('2000', '19').calorieGrams).toBe(28);
  });

  it('rounds to the nearest gram, half up', () => {
    expect(grams('2500').calorieGrams).toBe(35);
    expect(grams('1800').calorieGrams).toBe(25); // 25.2
    expect(grams('2250').calorieGrams).toBe(32); // 31.5 rounds up
    expect(grams('1250').calorieGrams).toBe(18); // 17.5 rounds up
    expect(grams('2000.5').calorieGrams).toBe(28);
  });

  it('never changes the AI figure', () => {
    const base = ok(calculateFiber({ age: '40', sex: 'female' })).aiGrams;
    for (const c of ['1000', '2000', '4000', '999', 'abc', '2,000', '']) {
      expect(ok(calculateFiber({ age: '40', sex: 'female', calories: c })).aiGrams).toBe(base);
    }
  });
});
