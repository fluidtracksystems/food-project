# Fiber target calculator - source research (scratch note)

Retrieved: 2026-11-05. All sources opened by me (curl + pdftotext, or WebFetch). Nothing from memory unless marked UNVERIFIED.

## 1. IOM AI for total fiber (g/day)

Source: Food and Nutrition Board, National Academies, "Dietary Reference Intakes (DRIs): Recommended Dietary Allowances and Adequate Intakes, Total Water and Macronutrients" (summary table; "SOURCE: Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids (2002/2005)"; PREPUBLICATION COPY: UNCORRECTED PROOFS).
URL opened: https://www.nationalacademies.org/index.php/cdn/materials/9fb9fae6-337c-4b7c-9821-2c81d1f65ad0 (PDF)
Report: IOM 2005 (NAP 10490), https://nap.nationalacademies.org/catalog/10490 (catalog page opened; chapter 7 pages 339-421 are page images only, text not extractable).

Column "Total Fiber (g/d)", all marked `*` (= AI):

| Group | Male | Female |
|---|---|---|
| Infants 0-6 mo, 7-12 mo | ND | ND |
| 1-3 y | 19 | 19 (sex-combined row) |
| 4-8 y | 25 | 25 (sex-combined row) |
| 9-13 y | 31 | 26 |
| 14-18 y | 38 | 26 |
| 19-30 y | 38 | 25 |
| 31-50 y | 38 | 25 |
| 51-70 y | 30 | 21 |
| > 70 y | 30 | 21 |
| Pregnancy 14-18, 19-30, 31-50 | - | 28 |
| Lactation 14-18, 19-30, 31-50 | - | 29 |

Verbatim table note: "The AI for other life-stage and gender groups is believed to cover the needs of all healthy individuals in the groups, but lack of data or uncertainty in the data prevent being able to specify with confidence the percentage of individuals covered by this intake."
Pregnancy/lactation: NOT offered by the calculator (note for build).

## 2. Basis: 14 g per 1,000 kcal

IOM chapter 7 original sentence: UNVERIFIED (chapter text is images on nationalacademies.org; NCBI Bookshelf NBK222882 and ODS fact sheet return captcha/403 to my fetches). Verified via other primary-government/NAP sources:

- DGA 2015-2020 Appendix 7 (https://webharvest.gov/congress115th/20190108210326/https://health.gov/dietaryguidelines/2015/guidelines/appendix-7): footnote "14 g fiber per 1,000 kcal = basis for AI for fiber."
- NAP "Dietary Reference Intakes Research Synthesis: Workshop Summary" (2007), https://www.nationalacademies.org/read/11767/chapter/9, p. 75: "Decreased risk of coronary heart disease was the end point used." and "the specific numbers for the DRI value were generated from three prospective trials." (fetch tool returned fragments; treat quotes as fragmentary).
- DGA 2020-2025 p. 101 (Chapter 4: Adults): "These recommendations are based on levels observed to reduce risk of coronary heart disease."
Derivation (as supported): CHD-risk-reduction intake levels, expressed per 1,000 kcal then multiplied by reference energy intakes. The workshop summary p. 82 says: "The AIs for children and the elderly are based on a calorie conversion factor, not on empirical data." Check arithmetic: 38 g / 14 = 2,714 kcal (men 19-50), 25 g / 14 = 1,786 kcal; this reference-kcal derivation is my inference, not a quote (UNVERIFIED as stated by IOM).

## 3. Dietary Guidelines for Americans

### 2025-2030 (published; checked)
URL: https://cdn.realfood.gov/DGA.pdf (linked from https://www.dietaryguidelines.gov/, cover "2025-2030"). Opened 2026-11-05.
- NO gram fiber target, NO 14 g/1,000 kcal anywhere in the document (full text searched; only fiber mentions below).
- p. 2, Gut Health: "...vegetables, fruits, fermented foods (e.g., sauerkraut, kimchi, kefir, miso), and high-fiber foods support a diverse microbiome, which may be beneficial for health."
- p. 3, Focus on Whole Grains: "Prioritize fiber-rich whole grains." and "Whole grains serving goals: 2-4 servings per day, adjusting as needed based on your individual caloric requirements."
(Page numbers from footers "Dietary Guidelines for Americans, 2025-2030 | 2/3"; the footer sits at the end of the page, so check against the PDF before citing.)

### 2020-2025 (has fiber goals)
URL: https://www.dietaryguidelines.gov/sites/default/files/2020-12/Dietary_Guidelines_for_Americans_2020-2025.pdf
- p. 101 (Chapter 4: Adults): "More than 90 percent of women and 97 percent of men do not meet recommended intakes for dietary fiber." "Appendix 1. Nutritional Goals for Age-Sex Groups provides dietary fiber goals for men and women based on the Dietary Reference Intakes. These recommendations are based on levels observed to reduce risk of coronary heart disease."
- Appendix 1, Table A1-2 (p. 133), source-of-goal "14g/1,000 kcal", at the table's assessed calorie level:

| Group (calorie level) | Fiber g |
|---|---|
| 2-3 (1,000) | 14 |
| F 4-8 (1,200) | 17 |
| F 9-13 (1,600) | 22 |
| F 14-18 (1,800) | 25 |
| F 19-30 (2,000) | 28 |
| F 31-50 (1,800) | 25 |
| F 51+ (1,600) | 22 |
| M 4-8 (1,400) | 20 |
| M 9-13 (1,800) | 25 |
| M 14-18 (2,200) | 31 |
| M 19-30 (2,400) | 34 |
| M 31-50 (2,200) | 31 |
| M 51+ (2,000) | 28 |

(pdftotext column alignment inferred; values match 14 x kcal/1,000 rounded.) Table A1-3 (p. 135, pregnancy): 25 / 31 / 34 g at 1,800 / 2,200 / 2,400 kcal per trimester-age combos (alignment less certain).

## 4. Per-kcal scaling and limits

CONFLICT: IOM AI (men 19-50 = 38, women 19-50 = 25, over 50 = 30/21) vs DGA 2020-2025 Appendix 1 (14 g x DGA calorie level: M 19-30 = 34, F 19-30 = 28, M 51+ = 28, F 51+ = 22). Both rest on 14 g/1,000 kcal; difference is the calorie level assumed. Calculator should state which it uses.
- DGA 2020-25 itself scales 14 g per 1,000 kcal with calorie level, supporting per-kcal scaling for a user-supplied kcal (inference; no sentence says "use this to scale individuals").
- Stated limits found: workshop summary (NAP 11767) p. 76: "Considerable concern has been expressed that the AI of 14 grams of fiber per 1,000 calories is too high for children." p. 82: "Applying the same ratio (14 g of fiber/1,000 kcal) to elderly adults results in a lower absolute AI than for younger adults." and "The AIs for children and the elderly are based on a calorie conversion factor, not on empirical data." (fragmentary fetch output).
- No source I opened states a rule for very low or very high calorie intakes (e.g., cap/floor). UNVERIFIED / not found. Suggest the site clamps kcal to a sensible range and says so itself.

## 5. Pregnancy and lactation
IOM: 28 g (pregnancy), 29 g (lactation) - see table in section 1. Not offered by the calculator.

## 6. Healthy people / not a prescription; gradual increase

- Healthy people: the IOM table note quoted in section 1 (AI "believed to cover the needs of all healthy individuals"). No "not a prescription" sentence found in sources opened; do not attribute one. UNVERIFIED.
- NAP workshop summary p. 82 (fragment): "Unlike the case for most other nutrients, the recommended intake of fiber was based on protection against disease."
- Gradual increase, MedlinePlus (NIH/NLM) https://medlineplus.gov/ency/article/002470.htm: "Eating a large amount of fiber in a short period of time can cause intestinal gas (flatulence), bloating, and abdominal cramps." "Add fiber gradually over a period of a few weeks to avoid stomach distress. Water helps fiber pass through the digestive system."
- MedlinePlus https://medlineplus.gov/dietaryfiber.html: "But add it to your diet slowly. Increasing dietary fiber too quickly can lead to gas, bloating, and cramps."
- MedlinePlus ency: "Too much fiber may interfere with the absorption of minerals such as iron, zinc, magnesium, and calcium."
- Other government figures that differ (do not use as the main number): MedlinePlus ency "21 to 38 grams of fiber each day"; NIDDK https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/eating-diet-nutrition "Depending on your age and sex, adults should get 22 to 34 grams of fiber a day." (22-34 matches the DGA 2020 calorie-level numbers, not the IOM AI).

## UNVERIFIED list
- IOM chapter 7 verbatim sentence on 14 g/1,000 kcal and the exact derivation (tried: NAP/nationalacademies.org read pages = images; NCBI Bookshelf NBK222882 = captcha; NAP PDF download 404/HTML; ODS Fiber fact sheet = 403).
- NIH ODS fiber fact sheet values (403).
- Any "AI is a goal not a prescription" quote.
- Any explicit calorie-range limit for per-kcal scaling.
- FDA Daily Value 28 g: not checked in a primary source (mentioned only in a search snippet).
- 2025-2030 DGA page numbers: derived from footers; confirm in PDF.
