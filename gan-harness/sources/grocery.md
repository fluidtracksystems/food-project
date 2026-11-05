# Grocery budget calculator - USDA source notes (scratch research)
Retrieved 2026-11-05. Text extracted with pdftotext from PDFs actually downloaded.

## KEY FINDING: USDA now publishes THREE separate reports, not one "four levels" report
Landing page (title "USDA Food Plans: Monthly Cost of Food Reports"):
- https://www.fna.usda.gov/research/cnpp/usda-food-plans/cost-food-monthly-reports (www.fna.usda.gov and www.fns.usda.gov return HTTP 403 to my fetchers; I read the same page via the mirror https://fns-prod.azureedge.us/research/cnpp/usda-food-plans/cost-food-monthly-reports, page "last updated October 19, 2026")
- Reports listed: Thrifty Food Plan Sep 2026; Thrifty AK/HI Sep 2026; "Cost of Food at Home at Three Levels" (Low-Cost, Moderate-Cost, Liberal) Sep 2026.
- Agency is now styled "Food and Nutrition Administration" (older reports: "Food and Nutrition Service").

## 1. Latest report: SEPTEMBER 2026 (issued October 2026)
PDFs opened (downloaded, text extracted):
- Thrifty: https://fna-bwbufwdzbabpezgc.z01.azurefd.us/sites/default/files/resource-files/CostofFoodSep2026Thrifty.pdf (same path under fns-prod.azureedge.us is listed on the landing page)
- Low/Mod/Liberal: https://fna-bwbufwdzbabpezgc.z01.azurefd.us/sites/default/files/resource-files/CostofFoodSep2026LowModLib.pdf
- Prior-period check: https://fns-prod.azureedge.us/sites/default/files/resource-files/cnpp-costfood-3levels-dec2025.pdf (Dec 2025, issued Jan 2026)
The October 2026 report is not yet issued as of 2026-11-05 (reports are issued the following month; Sep was issued Oct 2026).
The azurefd.us host is a USDA CDN mirror; the PDFs state "This file may be accessed at: https://www.fna.usda.gov/research/cnpp/usda-food-plans/cost-food-monthly-reports".

## 2. Tables, September 2026 (pdftotext shifts value rows down one line against labels; mapping verified below)
Footnote 3: "All costs are rounded to nearest 10 cents. Monthly costs are calculated by multiplying the weekly costs by 4.333."

### Thrifty Food Plan ("Official USDA Thrifty Food Plan: U.S. Average, September 2026")
| Group | Weekly | Monthly |
|---|---|---|
| Child 1 year | $26.30 | $114.20 |
| Child 2-3 | $39.80 | $172.50 |
| Child 4-5 | $43.40 | $188.30 |
| Child 6-8 | $48.30 | $209.10 |
| Child 9-11 | $55.80 | $241.90 |
| Female 12-13 | $51.70 | $224.00 |
| Female 14-19 | $60.00 | $260.00 |
| Female 20-50 | $58.60 | $253.90 |
| Female 51-70 | $54.60 | $236.40 |
| Female 71+ | $60.10 | $260.60 |
| Male 12-13 | $59.70 | $258.50 |
| Male 14-19 | $75.30 | $326.30 |
| Male 20-50 | $73.60 | $319.00 |
| Male 51-70 | $64.90 | $281.20 |
| Male 71+ | $61.90 | $268.40 |
| Reference Family (M+F 20-50, children 6-8 and 9-11) | $236.30 | $1,024.00 |

Verification: 73.60+58.60+48.30+55.80 = 236.30 matches the printed reference family, confirming row alignment. Thrifty age bands are 14-19 and 20-50 (Low/Mod/Lib use 14-18 and 19-50).

### Low-Cost / Moderate-Cost / Liberal ("Official USDA Food Plans: Cost of Food at Home at Three Levels, U.S. Average, September 2026")
Each cell: weekly / monthly.
| Group | Low-Cost | Moderate-Cost | Liberal |
|---|---|---|---|
| Child 1 year | $38.10 / $165.00 | $42.90 / $185.70 | $52.30 / $226.40 |
| Child 2-3 | $40.00 / $173.50 | $47.80 / $207.20 | $58.20 / $252.10 |
| Child 4-5 | $41.30 / $179.00 | $51.10 / $221.50 | $61.90 / $268.30 |
| Child 6-8 | $60.40 / $261.50 | $70.30 / $304.70 | $82.40 / $357.20 |
| Child 9-11 | $62.60 / $271.40 | $80.70 / $349.70 | $94.20 / $408.20 |
| Female 12-13 | $62.30 / $269.80 | $74.30 / $321.70 | $92.60 / $401.10 |
| Female 14-18 | $62.50 / $270.90 | $74.60 / $323.30 | $92.20 / $399.70 |
| Female 19-50 | $63.80 / $276.30 | $77.60 / $336.40 | $99.10 / $429.60 |
| Female 51-70 | $62.10 / $268.90 | $76.50 / $331.30 | $92.20 / $399.50 |
| Female 71+ | $61.90 / $268.20 | $76.10 / $329.80 | $91.00 / $394.40 |
| Male 12-13 | $73.00 / $316.50 | $90.50 / $392.20 | $106.30 / $460.60 |
| Male 14-18 | $74.50 / $322.90 | $93.10 / $403.50 | $109.40 / $473.90 |
| Male 19-50 | $73.30 / $317.70 | $91.90 / $398.40 | $112.30 / $486.80 |
| Male 51-70 | $69.10 / $299.40 | $86.50 / $374.90 | $103.60 / $449.10 |
| Male 71+ | $68.40 / $296.30 | $84.10 / $364.30 | $103.40 / $448.10 |

Alignment check: a web search summary (not primary) cited 1-year Low-Cost $38.10 / $165.00, consistent. This PDF has no printed reference family, so the row mapping is inferred from row counts (5 child, 5 female, 5 male) and the identical Dec 2025 layout. Visually confirm against the PDF before publishing (I did not view a rendered image).
Third-party-only figures (UNVERIFIED): family of four Moderate $1,389/mo, Low $1,127/mo, Liberal $1,682/mo.

## 3. Household-size adjustment (identical wording in both PDFs, footnote 2)
"The costs given are for individuals in 4-person households. For individuals in other size households, the following adjustments are suggested: 1-person--add 20 percent; 2-person--add 10 percent; 3-person--add 5 percent; 4-person--no adjustment; 5- or 6-person--subtract 5 percent; 7- (or more) person--subtract 10 percent. To calculate total foods costs for a household, (1) sum the food costs for each individual in the household and then (2) apply the appropriate adjustment factor based on household size"
Factors: 1 -> x1.20, 2 -> x1.10, 3 -> x1.05, 4 -> x1.00, 5-6 -> x0.95, 7+ -> x0.90.
Reference family of four (Thrifty PDF footnote 4): "Defined in the Food and Nutrition Act of 2008, this reference family of four is used to determine the maximum Supplemental Nutrition Assistance Program (SNAP) allotment, which is then adjusted downward for smaller households and upward for larger households."

## 4. Inclusions / exclusions / purpose
- Food at home only. Thrifty fn1: "Another basis of the Thrifty Food Plan is that all meals and snacks are prepared at home." Low/Mod/Lib fn1: "Another basis of the Food Plans is that all meals and snacks are prepared at home." Title: "Cost of Food at Home". So no restaurant or meals-out costs. Non-food items (cleaning, paper goods) are not addressed in the reports (do not claim either way).
- Infants: not covered. The lowest age group is "1 year" in both reports (inferred from the tables; no explicit sentence found).
- Alaska/Hawaii: main tables are "U.S. Average" (AKHI PDF: "the cost of the Thrifty Food Plan for Hawaii is the cost of the Thrifty Food Plan for the contiguous 48 States and DC adjusted for the price of food in Honolulu"). Separate Thrifty-only AK/HI report, Sep 2026 reference family monthly: Anchorage $1,296.90, Hawaii $1,573.60. URL: https://fna-bwbufwdzbabpezgc.z01.azurefd.us/sites/default/files/resource-files/CostofFoodSep2026AKHI.pdf . No AK/HI figures for Low/Mod/Liberal.
- Purpose: Thrifty: "represents a nutritious, practical, cost-effective diet"; basis of the maximum SNAP allotment. TFP 2021 report describes the baskets as "a framework to support a healthy diet on a limited budget", not an item-specific shopping list or prescriptive diet. Low/Mod/Lib: "represent a nutritious diet at three different cost levels"; based on 1997-2005 DRIs, 2005 DGA, 2005 MyPyramid, 2001-02 data updated by CPI; the PDF notes the 2021 re-evaluation "begins the process to address" these three plans.
- IMPORTANT: no single "four levels" report exists in 2026. Thrifty is built on 2013-16 consumption and 2015-16 prices (2021 reevaluation); the other three on 2001-02 data. USDA's archive page warns costs from different market baskets should not be combined into one time series. Also these are costs of a nutritious diet, not what households actually spend.

## 5. Methodology citations
- Thrifty Food Plan, 2021. USDA FNS, August 2021, FNS-916. Printed suggested citation: "U.S. Department of Agriculture. Thrifty Food Plan, 2021. August 2021. FNS-916. Available at https://FNS.usda.gov/TFP."
  PDF opened: https://fns-prod.azureedge.us/sites/default/files/resource-files/TFP2021.pdf
  Page: https://fns-prod.azureedge.us/cnpp/thrifty-food-plan-2021 (last updated Jan 14 2026; costs effective Oct 1 2021)
- Monthly update method is printed in the Thrifty PDF note: costs updated monthly using CPIs, "compared to June 2021".
- Low/Mod/Liberal methodology: "The Low-Cost, Moderate-Cost, and Liberal Food Plans, 2007" (path /cnpp/low-moderate-liberal-food-plans-2007; not opened).
- AK/HI: https://fns-prod.azureedge.us/cnpp/tfp-akhi (opened, HTTP 200).

## 6. Update frequency and archive
- Monthly, issued about one month after the price month (Sep 2026 issued Oct 2026; Dec 2025 issued Jan 2026). Landing page says Thrifty costs are updated monthly using CPIs (via a summarising fetch of the mirror, so paraphrase).
- Older months stay available. Archive Excel files confirmed HTTP 200 (HEAD only; contents not parsed):
  - Thrifty June 2021 to Sep 2026: https://fna-bwbufwdzbabpezgc.z01.azurefd.us/sites/default/files/resource-files/usda-thriftyplan-june2021-sept2026.xlsx
  - Low/Mod/Liberal Sep 2007 to Sep 2026: https://fna-bwbufwdzbabpezgc.z01.azurefd.us/sites/default/files/resource-files/usda-lowcostplan-sept2007-sept2026.xlsx
- File names are not uniform (CostofFoodSep2026Thrifty.pdf vs cnpp-costfood-3levels-dec2025.pdf); guessed May-Oct 2026 URLs under the cnpp-costfood-3levels pattern returned 404. Take URLs from the landing page each month.
- Website: label "as of September 2026"; refresh monthly.

## 7. Income
Neither report contains any income share or percent-of-income figure. Income-based budgeting is NOT supported by this source. (TFP 2021 mentions the SNAP formula, TFP minus 30% of net income; that is a benefit formula, not a household grocery guideline.)

## UNVERIFIED
- Rendered visual check of Low/Mod/Lib row alignment (inferred from text layout; consistent with Dec 2025 layout and one search-snippet value).
- Family-of-four Low/Mod/Liberal totals: third-party only.
- Excel archive contents; the 2007 methodology report.
- Whether non-food household items are excluded (not stated).
- Landing page read via mirror and a summarising tool (direct fna/fns.usda.gov fetches got 403); update-frequency wording is paraphrase.
- Whether an Oct 2026 report will appear in mid-November (expected, not confirmed).
