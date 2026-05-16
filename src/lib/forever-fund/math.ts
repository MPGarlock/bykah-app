/**
 * BYKAH Forever Fund — math helpers.
 *
 * The Forever Number is the principal amount you'd need invested at a
 * given withdrawal rate to cover an expense indefinitely without
 * touching the principal:
 *
 *   foreverNumber = annualAmount / (withdrawalRate / 100)
 *
 * Example: $50/mo phone bill at 4% withdrawal rate
 *   annualAmount   = 50 * 12 = $600
 *   foreverNumber  = 600 / 0.04 = $15,000
 *
 * Higher withdrawal rates (e.g. 8% for a "car fund" backed by higher-return
 * assets) shrink the Forever Number — at the cost of more volatility.
 */
import type { Expense, Frequency } from './types';

export function annualize(amount: number, frequency: Frequency): number {
  return frequency === 'monthly' ? amount * 12 : amount;
}

export function calculateForeverNumber(
  amount: number,
  frequency: Frequency,
  withdrawalRate: number,
): number {
  const annual = annualize(amount, frequency);
  if (withdrawalRate <= 0) return 0;
  return annual / (withdrawalRate / 100);
}

export function expenseForeverNumber(expense: Expense): number {
  return calculateForeverNumber(
    expense.amount,
    expense.frequency,
    expense.withdrawal_rate,
  );
}

export function totalForeverNumber(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + expenseForeverNumber(e), 0);
}

export function totalAnnualSpend(expenses: Expense[]): number {
  return expenses.reduce(
    (sum, e) => sum + annualize(e.amount, e.frequency),
    0,
  );
}

/**
 * Format a number as USD with no decimals — e.g. $1,247,389.
 * For big-number displays (Forever Number, totals).
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

/**
 * Format a number as USD with 2 decimals — e.g. $49.99.
 * For per-expense amount displays.
 */
export function formatCurrencyDetailed(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
