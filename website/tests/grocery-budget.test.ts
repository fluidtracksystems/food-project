import { describe, expect, it } from 'vitest';
import {
  calculateGroceryBudget,
  findGroup,
  householdFactor,
  MAX_MEMBERS,
  type MemberInput,
} from '../src/lib/calculators/grocery-budget';
import { USDA_FOOD_PLANS } from '../src/data/usda-food-plans';

const adultF: MemberInput = { age: '30', sex: 'female' };
const adultM: MemberInput = { age: '30', sex: 'male' };

const cost = (r: ReturnType<typeof calculateGroceryBudget>, plan: string) => {
  const c = r.costs.find((x) => x.plan === plan);
  if (!c) throw new Error(`no cost for ${plan}`);
  return c;
};

describe('householdFactor', () => {
  it.each([
    [1, 1.2],
    [2, 1.1],
    [3, 1.05],
    [4, 1.0],
    [5, 0.95],
    [6, 0.95],
    [7, 0.9],
    [8, 0.9],
    [12, 0.9],
  ])('household of %d uses factor %d', (size, factor) => {
    expect(householdFactor(size)).toBe(factor);
  });
});

describe('findGroup: boundary ages', () => {
  const thrifty = USDA_FOOD_PLANS.plans[0];
  const low = USDA_FOOD_PLANS.plans[1];
  it('maps age 19 to the teen band in Thrifty and the adult band elsewhere', () => {
    expect(findGroup(thrifty, 19, 'male')?.id).toBe('male-14-19');
    expect(findGroup(low, 19, 'male')?.id).toBe('male-19-50');
    expect(findGroup(thrifty, 20, 'female')?.id).toBe('female-20-50');
    expect(findGroup(low, 18, 'female')?.id).toBe('female-14-18');
  });
  it('ignores sex for ages under 12', () => {
    expect(findGroup(thrifty, 11, 'female')?.id).toBe('child-9-11');
    expect(findGroup(thrifty, 11, undefined)?.id).toBe('child-9-11');
    expect(findGroup(thrifty, 12, undefined)).toBeUndefined();
  });
  it('returns nothing outside 1 to 120', () => {
    expect(findGroup(thrifty, 0, 'male')).toBeUndefined();
    expect(findGroup(thrifty, 121, 'male')).toBeUndefined();
  });
});

describe('calculateGroceryBudget: hand-computed households', () => {
  // 2 adults (30) + children 7 and 10, household of 4 so the factor is 1.00.
  const family: MemberInput[] = [adultM, adultF, { age: '7', sex: '' }, { age: '10', sex: '' }];

  it('Thrifty: weekly 73.60 + 58.60 + 48.30 + 55.80 = 236.30; monthly 319.00 + 253.90 + 209.10 + 241.90 = 1023.90', () => {
    const r = calculateGroceryBudget(family);
    expect(r.factor).toBe(1);
    expect(cost(r, 'thrifty').weekly).toBe(236.3);
    expect(cost(r, 'thrifty').monthly).toBe(1023.9);
  });

  it('Low-Cost: weekly 73.30 + 63.80 + 60.40 + 62.60 = 260.10; monthly 317.70 + 276.30 + 261.50 + 271.40 = 1126.90', () => {
    const r = calculateGroceryBudget(family);
    expect(cost(r, 'low-cost').weekly).toBe(260.1);
    expect(cost(r, 'low-cost').monthly).toBe(1126.9);
  });

  it('Moderate-Cost: weekly 91.90 + 77.60 + 70.30 + 80.70 = 320.50; monthly 398.40 + 336.40 + 304.70 + 349.70 = 1389.20', () => {
    const r = calculateGroceryBudget(family);
    expect(cost(r, 'moderate-cost').weekly).toBe(320.5);
    expect(cost(r, 'moderate-cost').monthly).toBe(1389.2);
  });

  it('Liberal: weekly 112.30 + 99.10 + 82.40 + 94.20 = 388.00; monthly 486.80 + 429.60 + 357.20 + 408.20 = 1681.80', () => {
    const r = calculateGroceryBudget(family);
    expect(cost(r, 'liberal').weekly).toBe(388);
    expect(cost(r, 'liberal').monthly).toBe(1681.8);
  });

  it('returns the plans in a fixed order with names and the as-of month', () => {
    const r = calculateGroceryBudget(family);
    expect(r.costs.map((c) => c.name)).toEqual(['Thrifty', 'Low-Cost', 'Moderate-Cost', 'Liberal']);
    expect(r.asOf).toBe('2026-09');
    expect(r.asOfLabel).toBe('September 2026');
  });

  it('single member: one woman aged 30 on Thrifty is 58.60 x 1.20 = 70.32 weekly, 253.90 x 1.20 = 304.68 monthly', () => {
    const r = calculateGroceryBudget([adultF]);
    expect(r.factor).toBe(1.2);
    expect(r.validCount).toBe(1);
    expect(cost(r, 'thrifty').weekly).toBe(70.32);
    expect(cost(r, 'thrifty').monthly).toBe(304.68);
  });

  it('three people: 73.60 + 58.60 + 26.30 = 158.50 x 1.05 = 166.425 rounds half up to 166.43', () => {
    const r = calculateGroceryBudget([adultM, adultF, { age: '1', sex: '' }]);
    expect(r.factor).toBe(1.05);
    expect(cost(r, 'thrifty').weekly).toBe(166.43);
  });

  it('two people: factor 1.10 is applied to the sum of the printed weekly values', () => {
    // 73.60 + 58.60 = 132.20 x 1.10 = 145.42
    const r = calculateGroceryBudget([adultM, adultF]);
    expect(r.factor).toBe(1.1);
    expect(cost(r, 'thrifty').weekly).toBe(145.42);
  });

  it('five people use 0.95 and seven use 0.90', () => {
    // 5 x male 30 on Thrifty: 5 x 73.60 = 368.00 x 0.95 = 349.60
    const five = calculateGroceryBudget(Array.from({ length: 5 }, () => adultM));
    expect(five.factor).toBe(0.95);
    expect(cost(five, 'thrifty').weekly).toBe(349.6);
    // 7 x 73.60 = 515.20 x 0.90 = 463.68
    const seven = calculateGroceryBudget(Array.from({ length: 7 }, () => adultM));
    expect(seven.factor).toBe(0.9);
    expect(cost(seven, 'thrifty').weekly).toBe(463.68);
    const six = calculateGroceryBudget(Array.from({ length: 6 }, () => adultM));
    expect(six.factor).toBe(0.95);
  });

  it('uses the printed monthly column, not weekly x 4.333', () => {
    // Child 1 year Thrifty: printed monthly 114.20 x 1.20 = 137.04 (weekly 26.30 x 4.333 would give a different figure)
    const r = calculateGroceryBudget([{ age: '1', sex: '' }]);
    expect(cost(r, 'thrifty').monthly).toBe(137.04);
  });

  it('age 19 uses the teen band in Thrifty and the adult band in the other plans', () => {
    // Thrifty male 14-19 75.30 x 1.20 = 90.36; Low-Cost male 19-50 73.30 x 1.20 = 87.96
    const r = calculateGroceryBudget([{ age: '19', sex: 'male' }]);
    expect(cost(r, 'thrifty').weekly).toBe(90.36);
    expect(cost(r, 'low-cost').weekly).toBe(87.96);
  });
});

describe('calculateGroceryBudget: ages and sex', () => {
  it('accepts numbers as well as strings, and trims whitespace', () => {
    const r = calculateGroceryBudget([
      { age: 7, sex: '' },
      { age: ' 30 ', sex: 'male' },
    ]);
    expect(r.errors).toEqual([]);
    expect(r.validCount).toBe(2);
  });

  it('ignores sex for a child and does not require it', () => {
    const withSex = calculateGroceryBudget([{ age: '8', sex: 'male' }]);
    const without = calculateGroceryBudget([{ age: '8' }]);
    expect(withSex.errors).toEqual([]);
    expect(cost(withSex, 'thrifty').weekly).toBe(cost(without, 'thrifty').weekly);
  });

  it('requires sex from age 12 up', () => {
    const r = calculateGroceryBudget([{ age: '12', sex: '' }, { age: '11' }]);
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].member).toBe(0);
    expect(r.errors[0].message).toMatch(/female or male/);
    expect(r.validCount).toBe(1);
  });

  it('gives infants a specific message', () => {
    for (const age of ['0', 0]) {
      const r = calculateGroceryBudget([{ age, sex: '' }]);
      expect(r.errors[0].message).toMatch(/infants/i);
      expect(r.costs).toEqual([]);
    }
  });

  it.each(['121', 121, '1.5', 1.5, 'abc', '-3', -3, 'NaN', 'Infinity', Infinity, Number.NaN, '1e2', '30 years'])(
    'rejects age %s',
    (age) => {
      const r = calculateGroceryBudget([{ age, sex: 'male' }]);
      expect(r.errors).toHaveLength(1);
      expect(r.errors[0].message.length).toBeGreaterThan(0);
      expect(r.validCount).toBe(0);
      expect(r.costs).toEqual([]);
    },
  );

  it('accepts the edges 1 and 120', () => {
    expect(calculateGroceryBudget([{ age: '1' }]).errors).toEqual([]);
    expect(calculateGroceryBudget([{ age: '120', sex: 'female' }]).errors).toEqual([]);
  });

  it('asks for an age when only a sex is chosen', () => {
    const r = calculateGroceryBudget([{ age: '', sex: 'female' }]);
    expect(r.errors[0].message).toMatch(/age/i);
  });
});

describe('calculateGroceryBudget: blank and mixed members', () => {
  it('ignores fully blank members without an error', () => {
    const r = calculateGroceryBudget([adultF, { age: '', sex: '' }, { age: '  ' }, adultM]);
    expect(r.errors).toEqual([]);
    expect(r.validCount).toBe(2);
    expect(r.members.map((m) => m.kind)).toEqual(['ok', 'empty', 'empty', 'ok']);
  });

  it('with only blank members there is no result and no error', () => {
    const r = calculateGroceryBudget([{ age: '', sex: '' }, { age: '' }]);
    expect(r.errors).toEqual([]);
    expect(r.validCount).toBe(0);
    expect(r.costs).toEqual([]);
    expect(r.factor).toBeNull();
  });

  it('with no members at all there is no result', () => {
    const r = calculateGroceryBudget([]);
    expect(r.costs).toEqual([]);
  });

  it('computes from the valid members, reports the bad ones and counts them as excluded', () => {
    // valid: man 30 + woman 30 -> household of 2 -> 132.20 x 1.10 = 145.42
    const r = calculateGroceryBudget([adultM, { age: 'abc', sex: '' }, adultF, { age: '15', sex: '' }]);
    expect(r.errors.map((e) => e.member)).toEqual([1, 3]);
    expect(r.excludedCount).toBe(2);
    expect(r.validCount).toBe(2);
    expect(r.factor).toBe(1.1);
    expect(cost(r, 'thrifty').weekly).toBe(145.42);
    expect(r.members.map((m) => m.kind)).toEqual(['ok', 'error', 'ok', 'error']);
  });

  it('does not throw on odd input', () => {
    expect(() =>
      calculateGroceryBudget([{ age: undefined as unknown as string, sex: null as unknown as string }]),
    ).not.toThrow();
  });
});

describe('calculateGroceryBudget: member limit', () => {
  const many = (n: number): MemberInput[] => Array.from({ length: n }, () => ({ age: '30', sex: 'female' }));

  it('allows 12 members', () => {
    expect(MAX_MEMBERS).toBe(12);
    const r = calculateGroceryBudget(many(12));
    expect(r.limitError).toBeUndefined();
    expect(r.factor).toBe(0.9);
    // 12 x 58.60 = 703.20 x 0.90 = 632.88
    expect(cost(r, 'thrifty').weekly).toBe(632.88);
  });

  it('refuses 13 members with a message and no figures', () => {
    const r = calculateGroceryBudget(many(13));
    expect(r.limitError).toMatch(/12/);
    expect(r.costs).toEqual([]);
  });

  it('does not count blank rows toward the limit', () => {
    const r = calculateGroceryBudget([...many(12), { age: '', sex: '' }]);
    expect(r.limitError).toBeUndefined();
    expect(r.costs).toHaveLength(4);
  });
});
