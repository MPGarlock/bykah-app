/**
 * BYKAH Budget Tracker — math helpers.
 *
 * Tracks actual monthly spending per category vs. budget. Operational
 * counterpart to the Forever Fund's strategic view: am I on track THIS
 * month?
 */
import type {
  BudgetCategory,
  BudgetTransaction,
  CategoryWithStats,
} from './types';

/**
 * First day of the current month at 00:00:00 local time.
 */
export function startOfCurrentMonth(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Parse a YYYY-MM-DD date string as a local Date (avoiding UTC shift).
 */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function isThisMonth(iso: string, now: Date = new Date()): boolean {
  const d = parseDate(iso);
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
}

export function spentInCurrentMonth(transactions: BudgetTransaction[]): number {
  const now = new Date();
  return transactions
    .filter((t) => isThisMonth(t.transacted_at, now))
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

export function progressPct(spent: number, budget: number): number {
  if (budget <= 0) return spent > 0 ? 100 : 0;
  return Math.min(100, Math.max(0, (spent / budget) * 100));
}

export function buildCategoryStats(
  category: BudgetCategory,
  transactions: BudgetTransaction[],
): CategoryWithStats {
  const spent = spentInCurrentMonth(transactions);
  const budget = Number(category.monthly_budget);
  return {
    ...category,
    transactions,
    spentThisMonth: spent,
    remainingThisMonth: Math.max(0, budget - spent),
    progressPct: progressPct(spent, budget),
  };
}

/**
 * Format a "Month Year" label for the current month, e.g. "May 2026".
 */
export function currentMonthLabel(now: Date = new Date()): string {
  return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
