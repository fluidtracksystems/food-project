/**
 * USDA food plan costs, September 2026, U.S. average. Transcribed exactly from the printed tables in
 * gan-harness/sources/grocery.md section 2. Dollars per person in a 4-person household. Both columns are
 * stored as printed: USDA calculates monthly from unrounded weekly values, so monthly is NOT weekly x 4.333.
 */

export type PlanId = 'thrifty' | 'low-cost' | 'moderate-cost' | 'liberal';
export type GroupSex = 'any' | 'female' | 'male';

export interface FoodPlanGroup {
  readonly id: string;
  readonly label: string;
  readonly sex: GroupSex;
  readonly minAge: number;
  readonly maxAge: number;
  /** Dollars per week, as printed. */
  readonly weekly: number;
  /** Dollars per month, as printed. */
  readonly monthly: number;
}

export interface FoodPlan {
  readonly id: PlanId;
  readonly name: string;
  readonly groups: readonly FoodPlanGroup[];
}

export interface FoodPlanSource {
  readonly name: string;
  readonly url: string;
}

export interface FoodPlanData {
  readonly asOf: string;
  readonly asOfLabel: string;
  readonly retrieved: string;
  readonly sources: readonly FoodPlanSource[];
  readonly plans: readonly FoodPlan[];
}

const freezeGroups = (groups: FoodPlanGroup[]): readonly FoodPlanGroup[] =>
  Object.freeze(groups.map((g) => Object.freeze(g)));

// Thrifty uses the age bands 14-19 and 20-50; the other three plans use 14-18 and 19-50.
const THRIFTY: readonly FoodPlanGroup[] = freezeGroups([
  { id: 'child-1', label: 'Child 1 year', sex: 'any', minAge: 1, maxAge: 1, weekly: 26.3, monthly: 114.2 },
  { id: 'child-2-3', label: 'Child 2-3 years', sex: 'any', minAge: 2, maxAge: 3, weekly: 39.8, monthly: 172.5 },
  { id: 'child-4-5', label: 'Child 4-5 years', sex: 'any', minAge: 4, maxAge: 5, weekly: 43.4, monthly: 188.3 },
  { id: 'child-6-8', label: 'Child 6-8 years', sex: 'any', minAge: 6, maxAge: 8, weekly: 48.3, monthly: 209.1 },
  { id: 'child-9-11', label: 'Child 9-11 years', sex: 'any', minAge: 9, maxAge: 11, weekly: 55.8, monthly: 241.9 },
  { id: 'female-12-13', label: 'Female 12-13 years', sex: 'female', minAge: 12, maxAge: 13, weekly: 51.7, monthly: 224.0 },
  { id: 'female-14-19', label: 'Female 14-19 years', sex: 'female', minAge: 14, maxAge: 19, weekly: 60.0, monthly: 260.0 },
  { id: 'female-20-50', label: 'Female 20-50 years', sex: 'female', minAge: 20, maxAge: 50, weekly: 58.6, monthly: 253.9 },
  { id: 'female-51-70', label: 'Female 51-70 years', sex: 'female', minAge: 51, maxAge: 70, weekly: 54.6, monthly: 236.4 },
  { id: 'female-71-plus', label: 'Female 71 years and over', sex: 'female', minAge: 71, maxAge: 120, weekly: 60.1, monthly: 260.6 },
  { id: 'male-12-13', label: 'Male 12-13 years', sex: 'male', minAge: 12, maxAge: 13, weekly: 59.7, monthly: 258.5 },
  { id: 'male-14-19', label: 'Male 14-19 years', sex: 'male', minAge: 14, maxAge: 19, weekly: 75.3, monthly: 326.3 },
  { id: 'male-20-50', label: 'Male 20-50 years', sex: 'male', minAge: 20, maxAge: 50, weekly: 73.6, monthly: 319.0 },
  { id: 'male-51-70', label: 'Male 51-70 years', sex: 'male', minAge: 51, maxAge: 70, weekly: 64.9, monthly: 281.2 },
  { id: 'male-71-plus', label: 'Male 71 years and over', sex: 'male', minAge: 71, maxAge: 120, weekly: 61.9, monthly: 268.4 },
]);

const LOW_COST: readonly FoodPlanGroup[] = freezeGroups([
  { id: 'child-1', label: 'Child 1 year', sex: 'any', minAge: 1, maxAge: 1, weekly: 38.1, monthly: 165.0 },
  { id: 'child-2-3', label: 'Child 2-3 years', sex: 'any', minAge: 2, maxAge: 3, weekly: 40.0, monthly: 173.5 },
  { id: 'child-4-5', label: 'Child 4-5 years', sex: 'any', minAge: 4, maxAge: 5, weekly: 41.3, monthly: 179.0 },
  { id: 'child-6-8', label: 'Child 6-8 years', sex: 'any', minAge: 6, maxAge: 8, weekly: 60.4, monthly: 261.5 },
  { id: 'child-9-11', label: 'Child 9-11 years', sex: 'any', minAge: 9, maxAge: 11, weekly: 62.6, monthly: 271.4 },
  { id: 'female-12-13', label: 'Female 12-13 years', sex: 'female', minAge: 12, maxAge: 13, weekly: 62.3, monthly: 269.8 },
  { id: 'female-14-18', label: 'Female 14-18 years', sex: 'female', minAge: 14, maxAge: 18, weekly: 62.5, monthly: 270.9 },
  { id: 'female-19-50', label: 'Female 19-50 years', sex: 'female', minAge: 19, maxAge: 50, weekly: 63.8, monthly: 276.3 },
  { id: 'female-51-70', label: 'Female 51-70 years', sex: 'female', minAge: 51, maxAge: 70, weekly: 62.1, monthly: 268.9 },
  { id: 'female-71-plus', label: 'Female 71 years and over', sex: 'female', minAge: 71, maxAge: 120, weekly: 61.9, monthly: 268.2 },
  { id: 'male-12-13', label: 'Male 12-13 years', sex: 'male', minAge: 12, maxAge: 13, weekly: 73.0, monthly: 316.5 },
  { id: 'male-14-18', label: 'Male 14-18 years', sex: 'male', minAge: 14, maxAge: 18, weekly: 74.5, monthly: 322.9 },
  { id: 'male-19-50', label: 'Male 19-50 years', sex: 'male', minAge: 19, maxAge: 50, weekly: 73.3, monthly: 317.7 },
  { id: 'male-51-70', label: 'Male 51-70 years', sex: 'male', minAge: 51, maxAge: 70, weekly: 69.1, monthly: 299.4 },
  { id: 'male-71-plus', label: 'Male 71 years and over', sex: 'male', minAge: 71, maxAge: 120, weekly: 68.4, monthly: 296.3 },
]);

const MODERATE_COST: readonly FoodPlanGroup[] = freezeGroups([
  { id: 'child-1', label: 'Child 1 year', sex: 'any', minAge: 1, maxAge: 1, weekly: 42.9, monthly: 185.7 },
  { id: 'child-2-3', label: 'Child 2-3 years', sex: 'any', minAge: 2, maxAge: 3, weekly: 47.8, monthly: 207.2 },
  { id: 'child-4-5', label: 'Child 4-5 years', sex: 'any', minAge: 4, maxAge: 5, weekly: 51.1, monthly: 221.5 },
  { id: 'child-6-8', label: 'Child 6-8 years', sex: 'any', minAge: 6, maxAge: 8, weekly: 70.3, monthly: 304.7 },
  { id: 'child-9-11', label: 'Child 9-11 years', sex: 'any', minAge: 9, maxAge: 11, weekly: 80.7, monthly: 349.7 },
  { id: 'female-12-13', label: 'Female 12-13 years', sex: 'female', minAge: 12, maxAge: 13, weekly: 74.3, monthly: 321.7 },
  { id: 'female-14-18', label: 'Female 14-18 years', sex: 'female', minAge: 14, maxAge: 18, weekly: 74.6, monthly: 323.3 },
  { id: 'female-19-50', label: 'Female 19-50 years', sex: 'female', minAge: 19, maxAge: 50, weekly: 77.6, monthly: 336.4 },
  { id: 'female-51-70', label: 'Female 51-70 years', sex: 'female', minAge: 51, maxAge: 70, weekly: 76.5, monthly: 331.3 },
  { id: 'female-71-plus', label: 'Female 71 years and over', sex: 'female', minAge: 71, maxAge: 120, weekly: 76.1, monthly: 329.8 },
  { id: 'male-12-13', label: 'Male 12-13 years', sex: 'male', minAge: 12, maxAge: 13, weekly: 90.5, monthly: 392.2 },
  { id: 'male-14-18', label: 'Male 14-18 years', sex: 'male', minAge: 14, maxAge: 18, weekly: 93.1, monthly: 403.5 },
  { id: 'male-19-50', label: 'Male 19-50 years', sex: 'male', minAge: 19, maxAge: 50, weekly: 91.9, monthly: 398.4 },
  { id: 'male-51-70', label: 'Male 51-70 years', sex: 'male', minAge: 51, maxAge: 70, weekly: 86.5, monthly: 374.9 },
  { id: 'male-71-plus', label: 'Male 71 years and over', sex: 'male', minAge: 71, maxAge: 120, weekly: 84.1, monthly: 364.3 },
]);

const LIBERAL: readonly FoodPlanGroup[] = freezeGroups([
  { id: 'child-1', label: 'Child 1 year', sex: 'any', minAge: 1, maxAge: 1, weekly: 52.3, monthly: 226.4 },
  { id: 'child-2-3', label: 'Child 2-3 years', sex: 'any', minAge: 2, maxAge: 3, weekly: 58.2, monthly: 252.1 },
  { id: 'child-4-5', label: 'Child 4-5 years', sex: 'any', minAge: 4, maxAge: 5, weekly: 61.9, monthly: 268.3 },
  { id: 'child-6-8', label: 'Child 6-8 years', sex: 'any', minAge: 6, maxAge: 8, weekly: 82.4, monthly: 357.2 },
  { id: 'child-9-11', label: 'Child 9-11 years', sex: 'any', minAge: 9, maxAge: 11, weekly: 94.2, monthly: 408.2 },
  { id: 'female-12-13', label: 'Female 12-13 years', sex: 'female', minAge: 12, maxAge: 13, weekly: 92.6, monthly: 401.1 },
  { id: 'female-14-18', label: 'Female 14-18 years', sex: 'female', minAge: 14, maxAge: 18, weekly: 92.2, monthly: 399.7 },
  { id: 'female-19-50', label: 'Female 19-50 years', sex: 'female', minAge: 19, maxAge: 50, weekly: 99.1, monthly: 429.6 },
  { id: 'female-51-70', label: 'Female 51-70 years', sex: 'female', minAge: 51, maxAge: 70, weekly: 92.2, monthly: 399.5 },
  { id: 'female-71-plus', label: 'Female 71 years and over', sex: 'female', minAge: 71, maxAge: 120, weekly: 91.0, monthly: 394.4 },
  { id: 'male-12-13', label: 'Male 12-13 years', sex: 'male', minAge: 12, maxAge: 13, weekly: 106.3, monthly: 460.6 },
  { id: 'male-14-18', label: 'Male 14-18 years', sex: 'male', minAge: 14, maxAge: 18, weekly: 109.4, monthly: 473.9 },
  { id: 'male-19-50', label: 'Male 19-50 years', sex: 'male', minAge: 19, maxAge: 50, weekly: 112.3, monthly: 486.8 },
  { id: 'male-51-70', label: 'Male 51-70 years', sex: 'male', minAge: 51, maxAge: 70, weekly: 103.6, monthly: 449.1 },
  { id: 'male-71-plus', label: 'Male 71 years and over', sex: 'male', minAge: 71, maxAge: 120, weekly: 103.4, monthly: 448.1 },
]);

export const USDA_FOOD_PLANS: FoodPlanData = Object.freeze({
  asOf: '2026-09',
  asOfLabel: 'September 2026',
  retrieved: '2026-11-05',
  sources: Object.freeze([
    Object.freeze({
      name: 'USDA Food Plans: Monthly Cost of Food Reports (landing page)',
      url: 'https://www.fna.usda.gov/research/cnpp/usda-food-plans/cost-food-monthly-reports',
    }),
    Object.freeze({
      name: 'Official USDA Thrifty Food Plan: U.S. Average, September 2026',
      url: 'https://fna-bwbufwdzbabpezgc.z01.azurefd.us/sites/default/files/resource-files/CostofFoodSep2026Thrifty.pdf',
    }),
    Object.freeze({
      name: 'Official USDA Food Plans: Cost of Food at Home at Three Levels, U.S. Average, September 2026',
      url: 'https://fna-bwbufwdzbabpezgc.z01.azurefd.us/sites/default/files/resource-files/CostofFoodSep2026LowModLib.pdf',
    }),
    Object.freeze({
      name: 'Thrifty Food Plan, 2021 (FNS-916)',
      url: 'https://fns-prod.azureedge.us/sites/default/files/resource-files/TFP2021.pdf',
    }),
  ]),
  plans: Object.freeze([
    Object.freeze({ id: 'thrifty', name: 'Thrifty', groups: THRIFTY }),
    Object.freeze({ id: 'low-cost', name: 'Low-Cost', groups: LOW_COST }),
    Object.freeze({ id: 'moderate-cost', name: 'Moderate-Cost', groups: MODERATE_COST }),
    Object.freeze({ id: 'liberal', name: 'Liberal', groups: LIBERAL }),
  ]),
});
