import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/forever-fund/math';

type CategoryRow = { monthly_budget: number };
type TransactionRow = { amount: number };

function startOfMonthISO(): string {
  const d = new Date();
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const y = start.getFullYear();
  const m = String(start.getMonth() + 1).padStart(2, '0');
  const day = String(start.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfNextMonthISO(): string {
  const d = new Date();
  const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, '0');
  const day = String(next.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Server component summary card for /dashboard.
 * Shows total spent this month vs. total budget.
 */
export async function BudgetTrackerSummary() {
  const supabase = await createClient();

  const [{ data: categories }, { data: transactions }] = await Promise.all([
    supabase.from('budget_categories').select('monthly_budget'),
    supabase
      .from('budget_transactions')
      .select('amount')
      .gte('transacted_at', startOfMonthISO())
      .lt('transacted_at', startOfNextMonthISO()),
  ]);

  const categoryList: CategoryRow[] =
    (categories as CategoryRow[] | null) ?? [];
  const transactionList: TransactionRow[] =
    (transactions as TransactionRow[] | null) ?? [];

  const totalBudget = categoryList.reduce(
    (sum, c) => sum + Number(c.monthly_budget),
    0,
  );
  const totalSpent = transactionList.reduce(
    (sum, t) => sum + Number(t.amount),
    0,
  );
  const progressPct =
    totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;
  const overBudget = totalSpent > totalBudget && totalBudget > 0;

  if (categoryList.length === 0) {
    return (
      <Link
        href="/dashboard/budget-tracker"
        className="block rounded-2xl p-8 md:p-10 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30 hover:border-gold/50 transition-colors"
      >
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">
          Budget Tracker
        </p>
        <p className="font-serif text-3xl md:text-4xl font-bold text-gold-light mb-3">
          Set monthly budgets →
        </p>
        <p className="text-sm md:text-base text-slate-muted">
          Track this month&apos;s spending against your category budgets.
        </p>
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard/budget-tracker"
      className="block rounded-2xl p-8 md:p-10 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30 hover:border-gold/50 transition-colors"
    >
      <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">
        Budget Tracker
      </p>
      <div className="font-serif text-4xl md:text-5xl font-bold text-gold-light mb-3 tabular-nums">
        {formatCurrency(totalSpent)}
      </div>
      <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2">
        <div
          className={`h-full transition-all ${overBudget ? 'bg-red-400/70' : 'bg-gold/70'}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <p className="text-sm text-slate-muted">
        {progressPct.toFixed(1)}% of {formatCurrency(totalBudget)} this month →
      </p>
    </Link>
  );
}
