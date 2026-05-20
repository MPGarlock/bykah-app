import { createClient } from '@/lib/supabase/server';
import type {
  BudgetCategory,
  BudgetTransaction,
  CategoryWithStats,
} from '@/lib/budget-tracker/types';
import {
  buildCategoryStats,
  currentMonthLabel,
  startOfCurrentMonth,
} from '@/lib/budget-tracker/math';
import { formatCurrency } from '@/lib/forever-fund/math';
import { CreateCategoryForm } from './_components/create-category-form';
import { CategoryCard } from './_components/category-card';

function startOfNextMonthISO(): string {
  const d = new Date();
  const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, '0');
  const day = String(next.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfMonthISO(): string {
  const d = startOfCurrentMonth();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default async function BudgetTrackerPage() {
  const supabase = await createClient();

  // Fetch categories + this-month transactions in parallel
  const monthStart = startOfMonthISO();
  const monthEnd = startOfNextMonthISO();

  const [{ data: categories }, { data: transactions }] = await Promise.all([
    supabase
      .from('budget_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('budget_transactions')
      .select('*')
      .gte('transacted_at', monthStart)
      .lt('transacted_at', monthEnd)
      .order('transacted_at', { ascending: false })
      .order('created_at', { ascending: false }),
  ]);

  const categoryList: BudgetCategory[] = categories ?? [];
  const transactionList: BudgetTransaction[] = transactions ?? [];

  // Group transactions by category_id
  const txByCategory = new Map<string, BudgetTransaction[]>();
  for (const t of transactionList) {
    const arr = txByCategory.get(t.category_id) ?? [];
    arr.push(t);
    txByCategory.set(t.category_id, arr);
  }

  const categoriesWithStats: CategoryWithStats[] = categoryList.map((c) =>
    buildCategoryStats(c, txByCategory.get(c.id) ?? []),
  );

  const totalBudget = categoriesWithStats.reduce(
    (sum, c) => sum + Number(c.monthly_budget),
    0,
  );
  const totalSpent = categoriesWithStats.reduce(
    (sum, c) => sum + c.spentThisMonth,
    0,
  );
  const overallProgress =
    totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;
  const overBudget = totalSpent > totalBudget && totalBudget > 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
          This Month
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gold-light">
          Budget Tracker
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-muted max-w-2xl">
          {currentMonthLabel()} spending vs. your monthly budgets. Log
          transactions as they happen.
        </p>
      </div>

      {/* Summary card */}
      {categoriesWithStats.length > 0 && (
        <div className="rounded-2xl p-8 md:p-10 mb-10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-gold/30">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">
            Spent this month
          </p>
          <div className="font-serif text-5xl md:text-7xl font-bold text-gold-light mb-3 tabular-nums">
            {formatCurrency(totalSpent)}
          </div>
          <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-3 max-w-xl">
            <div
              className={`h-full transition-all ${overBudget ? 'bg-red-400/70' : 'bg-gold/70'}`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-sm md:text-base text-slate-muted">
            {overallProgress.toFixed(1)}% of {formatCurrency(totalBudget)} total
            budget
            {overBudget && (
              <span className="text-red-300 ml-2">
                · {formatCurrency(totalSpent - totalBudget)} over
              </span>
            )}
          </p>
        </div>
      )}

      {/* Categories list or empty state */}
      {categoriesWithStats.length === 0 ? (
        <div className="mb-10">
          <h2 className="font-serif text-xl font-bold text-gold-light mb-4">
            Add your first category
          </h2>
          <CreateCategoryForm />
        </div>
      ) : (
        <div className="space-y-6 mb-10">
          {categoriesWithStats.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}

          <div className="pt-6 border-t border-white/[0.08]">
            <h2 className="font-serif text-lg font-bold text-gold-light mb-4">
              Add another category
            </h2>
            <CreateCategoryForm />
          </div>
        </div>
      )}

      {/* Footer note */}
      <p className="mt-12 text-xs text-slate-subtle text-center max-w-2xl mx-auto">
        Educational tool only. Not financial advice. Budgets reset at the start
        of each calendar month.
      </p>
    </div>
  );
}
