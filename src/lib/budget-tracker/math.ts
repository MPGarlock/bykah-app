/**
 * BYKAH Budget Tracker — math helpers.
 *
 * Tracks actual monthly spending per category vs. budget, plus the
 * 50/30/20 plan breakdown (Needs / Wants / Investments) against a
 * post-tax monthly income.
 */
import type {
  Bucket,
  BudgetCategory,
  BudgetTransaction,
  BudgetSettings,
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

// ---------------------------------------------------------------------------
// 50/30/20 plan helpers
// ---------------------------------------------------------------------------

export interface BucketSummary {
  bucket: Bucket;
  /** Whole-number percentage of income allocated to this bucket. */
  pct: number;
  /** income * pct / 100 */
  target: number;
  /** Actual spend this month across categories in this bucket. */
  spent: number;
  /** Sum of monthly budgets assigned to categories in this bucket. */
  budgeted: number;
  /** spent / target as a clamped 0–100 percentage (0 if no target). */
  progressPct: number;
  /** spent - target (positive => over the target). */
  delta: number;
  overTarget: boolean;
}

export function bucketTarget(income: number, pct: number): number {
  return (Number(income) * Number(pct)) / 100;
}

/**
 * Build a Needs / Wants / Investments summary from category stats + settings.
 * Always returns the three buckets in display order.
 */
export function buildBucketSummaries(
  categories: CategoryWithStats[],
  settings: Pick<
    BudgetSettings,
    'monthly_income' | 'needs_pct' | 'wants_pct' | 'investments_pct'
  >,
): BucketSummary[] {
  const income = Number(settings.monthly_income);
  const pctByBucket: Record<Bucket, number> = {
    needs: Number(settings.needs_pct),
    wants: Number(settings.wants_pct),
    investments: Number(settings.investments_pct),
  };

  const order: Bucket[] = ['needs', 'wants', 'investments'];

  return order.map((bucket) => {
    const inBucket = categories.filter((c) => c.bucket === bucket);
    const spent = inBucket.reduce((sum, c) => sum + c.spentThisMonth, 0);
    const budgeted = inBucket.reduce(
      (sum, c) => sum + Number(c.monthly_budget),
      0,
    );
    const pct = pctByBucket[bucket];
    const target = bucketTarget(income, pct);
    return {
      bucket,
      pct,
      target,
      spent,
      budgeted,
      progressPct: progressPct(spent, target),
      delta: spent - target,
      overTarget: target > 0 && spent > target,
    };
  });
}

/** Whether three percentages form a valid 50/30/20-style split. */
export function percentagesAreValid(
  needs: number,
  wants: number,
  investments: number,
): boolean {
  const vals = [needs, wants, investments];
  if (vals.some((v) => !Number.isFinite(v) || v < 0 || v > 100)) return false;
  return needs + wants + investments === 100;
}
