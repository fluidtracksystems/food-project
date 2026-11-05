import { describe, expect, it } from 'vitest';
import { USDA_FOOD_PLANS, type FoodPlan, type FoodPlanGroup } from '../src/data/usda-food-plans';

const plan = (id: string): FoodPlan => {
  const p = USDA_FOOD_PLANS.plans.find((x) => x.id === id);
  if (!p) throw new Error(`no plan ${id}`);
  return p;
};
const sexes = ['female', 'male'] as const;

function matching(p: FoodPlan, age: number, sex: 'female' | 'male'): FoodPlanGroup[] {
  return p.groups.filter((g) => age >= g.minAge && age <= g.maxAge && (g.sex === 'any' || g.sex === sex));
}
function band(p: FoodPlan, age: number, sex: 'female' | 'male'): string {
  return matching(p, age, sex)[0]?.id ?? 'none';
}
const row = (p: FoodPlan, id: string): FoodPlanGroup => {
  const g = p.groups.find((x) => x.id === id);
  if (!g) throw new Error(`no group ${id}`);
  return g;
};

describe('USDA food plans data: metadata', () => {
  it('records the month, retrieval date and sources', () => {
    expect(USDA_FOOD_PLANS.asOf).toBe('2026-09');
    expect(USDA_FOOD_PLANS.asOfLabel).toBe('September 2026');
    expect(USDA_FOOD_PLANS.retrieved).toBe('2026-11-05');
    expect(USDA_FOOD_PLANS.sources.length).toBeGreaterThanOrEqual(3);
    for (const s of USDA_FOOD_PLANS.sources) expect(s.url).toMatch(/^https:\/\//);
  });

  it('has the four plans in a fixed order', () => {
    expect(USDA_FOOD_PLANS.plans.map((p) => p.id)).toEqual(['thrifty', 'low-cost', 'moderate-cost', 'liberal']);
    expect(USDA_FOOD_PLANS.plans.map((p) => p.name)).toEqual(['Thrifty', 'Low-Cost', 'Moderate-Cost', 'Liberal']);
  });
});

describe('USDA food plans data: groups', () => {
  it('has 15 groups per plan', () => {
    for (const p of USDA_FOOD_PLANS.plans) expect(p.groups).toHaveLength(15);
  });

  it('maps every whole age 1 to 120 to exactly one group per sex, and ages under 1 to none', () => {
    for (const p of USDA_FOOD_PLANS.plans) {
      for (const sex of sexes) {
        for (let age = 1; age <= 120; age++) expect(matching(p, age, sex), `${p.id} ${sex} ${age}`).toHaveLength(1);
        expect(matching(p, 0, sex)).toHaveLength(0);
        expect(matching(p, -1, sex)).toHaveLength(0);
      }
    }
  });

  it('puts boundary ages in the right band (children are not split by sex)', () => {
    const all = USDA_FOOD_PLANS.plans;
    const child: [number, string][] = [
      [1, 'child-1'], [2, 'child-2-3'], [3, 'child-2-3'], [4, 'child-4-5'], [5, 'child-4-5'],
      [6, 'child-6-8'], [8, 'child-6-8'], [9, 'child-9-11'], [11, 'child-9-11'],
    ];
    for (const p of all) {
      for (const [age, id] of child) {
        expect(band(p, age, 'female')).toBe(id);
        expect(band(p, age, 'male')).toBe(id);
      }
    }
    for (const p of all) {
      for (const sex of sexes) {
        expect(band(p, 12, sex)).toBe(`${sex}-12-13`);
        expect(band(p, 13, sex)).toBe(`${sex}-12-13`);
        expect(band(p, 14, sex)).toBe(p.id === 'thrifty' ? `${sex}-14-19` : `${sex}-14-18`);
        expect(band(p, 51, sex)).toBe(`${sex}-51-70`);
        expect(band(p, 70, sex)).toBe(`${sex}-51-70`);
        expect(band(p, 71, sex)).toBe(`${sex}-71-plus`);
        expect(band(p, 120, sex)).toBe(`${sex}-71-plus`);
      }
    }
    for (const sex of sexes) {
      const t = plan('thrifty');
      expect(band(t, 18, sex)).toBe(`${sex}-14-19`);
      expect(band(t, 19, sex)).toBe(`${sex}-14-19`);
      expect(band(t, 20, sex)).toBe(`${sex}-20-50`);
      expect(band(t, 50, sex)).toBe(`${sex}-20-50`);
      for (const id of ['low-cost', 'moderate-cost', 'liberal']) {
        const p = plan(id);
        expect(band(p, 18, sex)).toBe(`${sex}-14-18`);
        expect(band(p, 19, sex)).toBe(`${sex}-19-50`);
        expect(band(p, 20, sex)).toBe(`${sex}-19-50`);
        expect(band(p, 50, sex)).toBe(`${sex}-19-50`);
      }
    }
  });

  it('has positive, finite values and unique ids', () => {
    for (const p of USDA_FOOD_PLANS.plans) {
      expect(new Set(p.groups.map((g) => g.id)).size).toBe(15);
      for (const g of p.groups) {
        for (const v of [g.weekly, g.monthly]) {
          expect(Number.isFinite(v)).toBe(true);
          expect(v).toBeGreaterThan(0);
        }
      }
    }
  });

  it('keeps monthly within 1.5 percent of weekly x 4.333 (transcription check, not a derivation)', () => {
    for (const p of USDA_FOOD_PLANS.plans) {
      for (const g of p.groups) {
        expect(Math.abs(g.monthly - g.weekly * 4.333) / g.monthly, `${p.id} ${g.id}`).toBeLessThan(0.015);
      }
    }
  });

  it('is immutable', () => {
    expect(Object.isFrozen(USDA_FOOD_PLANS)).toBe(true);
    expect(Object.isFrozen(USDA_FOOD_PLANS.plans)).toBe(true);
    expect(Object.isFrozen(USDA_FOOD_PLANS.plans[0].groups)).toBe(true);
    expect(Object.isFrozen(USDA_FOOD_PLANS.plans[0].groups[0])).toBe(true);
  });
});

describe('USDA food plans data: Thrifty reference family', () => {
  const t = plan('thrifty');
  const family = ['male-20-50', 'female-20-50', 'child-6-8', 'child-9-11'].map((id) => row(t, id));

  it('weekly sums to exactly 236.30', () => {
    const cents = family.reduce((s, g) => s + Math.round(g.weekly * 100), 0);
    expect(cents).toBe(23630);
  });

  it('monthly sums to within 0.10 of the printed 1,024.00 (printed column sums to 1,023.90)', () => {
    const cents = family.reduce((s, g) => s + Math.round(g.monthly * 100), 0);
    expect(Math.abs(cents - 102400)).toBeLessThanOrEqual(10);
  });
});

describe('USDA food plans data: spot checks copied from the source table', () => {
  const cases: [string, string, number, number][] = [
    ['thrifty', 'child-1', 26.3, 114.2],
    ['thrifty', 'child-9-11', 55.8, 241.9],
    ['thrifty', 'female-14-19', 60.0, 260.0],
    ['thrifty', 'female-20-50', 58.6, 253.9],
    ['thrifty', 'male-14-19', 75.3, 326.3],
    ['thrifty', 'male-71-plus', 61.9, 268.4],
    ['low-cost', 'child-1', 38.1, 165.0],
    ['low-cost', 'female-19-50', 63.8, 276.3],
    ['low-cost', 'male-71-plus', 68.4, 296.3],
    ['moderate-cost', 'child-6-8', 70.3, 304.7],
    ['moderate-cost', 'male-14-18', 93.1, 403.5],
    ['moderate-cost', 'female-51-70', 76.5, 331.3],
    ['liberal', 'child-2-3', 58.2, 252.1],
    ['liberal', 'female-19-50', 99.1, 429.6],
    ['liberal', 'male-19-50', 112.3, 486.8],
    ['liberal', 'male-51-70', 103.6, 449.1],
  ];
  it.each(cases)('%s %s is %d weekly and %d monthly', (planId, groupId, weekly, monthly) => {
    const g = row(plan(planId), groupId);
    expect(g.weekly).toBe(weekly);
    expect(g.monthly).toBe(monthly);
  });
});
