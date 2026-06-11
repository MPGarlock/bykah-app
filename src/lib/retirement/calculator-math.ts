/**
 * BYKAH Retirement Goal — "Find Your Number" calculator.
 *
 * A modified 50/30/20 + 4% rule approach:
 *  1. Re-shape today's Needs/Wants spending for a retirement lifestyle
 *     (drop the mortgage P&I if the house will be paid off, keep
 *     property tax/insurance/maintenance, remove items that go away).
 *  2. Inflate that monthly figure to the future dollar amount at
 *     retirement.
 *  3. Net out Social Security to find what investments must cover.
 *  4. Apply the 4% rule (x25) to get the nest egg target.
 *  5. Net off the future value of current savings to find the gap.
 *  6. Solve the future-value-of-an-annuity formula for the monthly
 *     contribution needed to close that gap by retirement.
 */

export interface DropOffItem {
  id: string;
  label: string;
  amount: number;
}

export interface RetirementGoalInputs {
  /** Current monthly "Needs" spending (the 50% bucket). */
  currentNeeds: number;
  /** Adjusted monthly "Wants" spending in retirement (the 30% bucket). */
  retirementWants: number;
  /** Whether the house will be paid off by retirement. */
  housePaidOff: boolean;
  /** Mortgage payment, principal & interest only. */
  mortgagePI: number;
  /** Property taxes, insurance, and maintenance — persists in retirement. */
  propertyTaxInsuranceMaintenance: number;
  /** Custom expenses that drop off or shrink in retirement. */
  dropOffItems: DropOffItem[];
  /** Years until retirement. */
  yearsToRetirement: number;
  /** Annual inflation rate, percent (e.g. 3 for 3%). */
  inflationRate: number;
  /** Current retirement savings / investment balance. */
  currentSavings: number;
  /** Estimated monthly Social Security benefit (optional, 0 if none). */
  monthlySocialSecurity: number;
  /** Expected annual investment return, percent (slider, 0-20). */
  expectedReturn: number;
}

export interface RetirementGoalResult {
  /** Sum of all "drops off in retirement" line items. */
  totalDropOffs: number;
  /** Adjusted monthly Needs in today's dollars. */
  adjustedMonthlyNeeds: number;
  /** Adjusted monthly Wants in today's dollars. */
  adjustedMonthlyWants: number;
  /** adjustedMonthlyNeeds + adjustedMonthlyWants, today's dollars. */
  totalMonthlySpendingToday: number;
  /** Total monthly spending inflated to the retirement date. */
  futureMonthlySpending: number;
  /** futureMonthlySpending * 12. */
  futureAnnualSpending: number;
  /** Annual spending need minus annual Social Security. */
  annualFromInvestments: number;
  /** The 4% rule nest egg target (annualFromInvestments / 0.04). */
  nestEggTarget: number;
  /** Future value of current savings at the expected return rate. */
  projectedSavingsAtRetirement: number;
  /** Remaining gap between the nest egg target and projected savings. */
  gap: number;
  /** Monthly contribution required to close the gap by retirement. */
  requiredMonthlyContribution: number;
}

export const DEFAULT_INFLATION_RATE = 3;
export const DEFAULT_EXPECTED_RETURN = 10;
export const DEFAULT_SOCIAL_SECURITY = 1900;
export const WITHDRAWAL_RATE = 0.04;
export const MIN_EXPECTED_RETURN = 0;
export const MAX_EXPECTED_RETURN = 20;

export function totalDropOffAmount(items: DropOffItem[]): number {
  return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

export function calculateRetirementGoal(inputs: RetirementGoalInputs): RetirementGoalResult {
  const totalDropOffs = totalDropOffAmount(inputs.dropOffItems);

  // 1. Adjusted monthly Needs.
  const adjustedMonthlyNeeds = Math.max(
    0,
    inputs.currentNeeds -
      (inputs.housePaidOff ? inputs.mortgagePI : 0) +
      inputs.propertyTaxInsuranceMaintenance -
      totalDropOffs,
  );

  // 2. Adjusted monthly Wants (user-editable, defaults to current Wants).
  const adjustedMonthlyWants = Math.max(0, inputs.retirementWants);

  // 3. Total monthly retirement spending, today's dollars.
  const totalMonthlySpendingToday = adjustedMonthlyNeeds + adjustedMonthlyWants;

  // 4. Inflate forward to the retirement date.
  const years = Math.max(0, inputs.yearsToRetirement);
  const inflationFactor = Math.pow(1 + inputs.inflationRate / 100, years);
  const futureMonthlySpending = totalMonthlySpendingToday * inflationFactor;

  // 5. Annual spending need.
  const futureAnnualSpending = futureMonthlySpending * 12;

  // 6. Net out Social Security.
  const annualSocialSecurity = Math.max(0, inputs.monthlySocialSecurity || 0) * 12;
  const annualFromInvestments = Math.max(0, futureAnnualSpending - annualSocialSecurity);

  // 7. The 4% rule: nest egg target = annual need / 0.04 (i.e. x25).
  const nestEggTarget = annualFromInvestments / WITHDRAWAL_RATE;

  // 8. Future value of current savings.
  const returnRate = inputs.expectedReturn / 100;
  const returnFactor = Math.pow(1 + returnRate, years);
  const projectedSavingsAtRetirement = Math.max(0, inputs.currentSavings) * returnFactor;

  // 9. Remaining gap.
  const gap = Math.max(0, nestEggTarget - projectedSavingsAtRetirement);

  // 10. Solve the future value of an annuity for the monthly payment.
  const monthlyRate = returnRate / 12;
  const months = years * 12;
  let requiredMonthlyContribution = 0;
  if (gap > 0 && months > 0) {
    if (monthlyRate === 0) {
      requiredMonthlyContribution = gap / months;
    } else {
      requiredMonthlyContribution = (gap * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
    }
  }

  return {
    totalDropOffs,
    adjustedMonthlyNeeds,
    adjustedMonthlyWants,
    totalMonthlySpendingToday,
    futureMonthlySpending,
    futureAnnualSpending,
    annualFromInvestments,
    nestEggTarget,
    projectedSavingsAtRetirement,
    gap,
    requiredMonthlyContribution,
  };
}

export function formatCurrency(value: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits,
  }).format(value);
}
