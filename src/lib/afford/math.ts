import type { AffordInput, AffordResult } from './types';

export function calculateMortgagePayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (principal <= 0 || annualRate <= 0 || termMonths <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = termMonths;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function calculateAffordability(input: AffordInput): AffordResult {
  const { netMonthlyIncome, category } = input;
  let monthlyPayment = 0;
  let budgetCeiling = 0;
  let insights: string[] = [];

  switch (category) {
    case 'house': {
      const price = input.homePrice ?? 0;
      const downPct = input.downPaymentPct ?? 20;
      const rate = input.interestRate ?? 6.5;
      const termYears = input.loanTermYears ?? 30;
      const principal = price * (1 - downPct / 100);
      monthlyPayment = calculateMortgagePayment(principal, rate, termYears * 12);
      budgetCeiling = netMonthlyIncome * 0.25;
      const downAmount = price * (downPct / 100);
      insights = [
        'BYKAH uses a 25% housing ceiling (not the outdated 28% rule) because health insurance now consumes ~10% of income.',
        'Your down payment of ' + formatCurrency(downAmount) + ' (' + downPct + '%) reduces your loan to ' + formatCurrency(principal) + '.',
        remainingBudgetInsight(budgetCeiling, monthlyPayment, 'food and health insurance'),
      ];
      break;
    }
    case 'car': {
      const price = input.vehiclePrice ?? 0;
      const down = input.carDownPayment ?? 0;
      const rate = input.carInterestRate ?? 6;
      const termMonths = input.carLoanTermMonths ?? 60;
      const principal = price - down;
      monthlyPayment = calculateMortgagePayment(principal, rate, termMonths);
      budgetCeiling = netMonthlyIncome * 0.10;
      insights = [
        'BYKAH allocates ~10% of net income for a car payment — keeping your Needs bucket balanced.',
        'A longer loan term lowers your payment but increases total interest paid.',
        remainingBudgetInsight(budgetCeiling, monthlyPayment, 'other transportation costs'),
      ];
      break;
    }
    case 'vacation': {
      const total = input.totalVacationCost ?? 0;
      const months = input.monthsSaving ?? 12;
      monthlyPayment = months > 0 ? total / months : 0;
      budgetCeiling = netMonthlyIncome * 0.10;
      insights = [
        'Saving ' + formatCurrency(monthlyPayment) + '/month for ' + months + ' months reaches your ' + formatCurrency(total) + ' goal.',
        'Vacation savings come from your Wants bucket — ideally 10% of net income or less.',
        remainingBudgetInsight(budgetCeiling, monthlyPayment, 'other discretionary spending'),
      ];
      break;
    }
    case 'hobby': {
      monthlyPayment = input.monthlyHobbyCost ?? 0;
      budgetCeiling = netMonthlyIncome * 0.10;
      insights = [
        'Hobbies live in your Wants bucket. BYKAH suggests keeping all Wants under 20% of net income combined.',
        'At ' + formatCurrency(monthlyPayment) + '/month, this costs ' + formatCurrency(monthlyPayment * 12) + ' per year.',
        remainingBudgetInsight(budgetCeiling, monthlyPayment, 'other hobbies and fun'),
      ];
      break;
    }
  }

  const incomePercent = netMonthlyIncome > 0 ? (monthlyPayment / netMonthlyIncome) * 100 : 0;
  const remainingBudget = budgetCeiling - monthlyPayment;
  const canAfford = monthlyPayment <= budgetCeiling;
  const foreverNumber = (monthlyPayment * 12) / 0.04;

  let verdict: string;
  if (canAfford && incomePercent < (budgetCeiling / netMonthlyIncome) * 100 * 0.8) {
    verdict = 'You can afford this';
  } else if (canAfford) {
    verdict = 'Tight but doable';
  } else {
    verdict = 'Out of range';
  }

  return {
    canAfford,
    verdict,
    monthlyPayment,
    incomePercent,
    budgetCeiling,
    remainingBudget,
    foreverNumber,
    insights,
  };
}

function remainingBudgetInsight(ceiling: number, payment: number, label: string): string {
  const remaining = ceiling - payment;
  if (remaining >= 0) {
    return 'You have ' + formatCurrency(remaining) + ' remaining in this budget category for ' + label + '.';
  }
  return 'You are ' + formatCurrency(Math.abs(remaining)) + ' over the BYKAH ceiling for this category.';
}
