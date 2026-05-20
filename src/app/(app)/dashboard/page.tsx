import { createClient } from '@/lib/supabase/server';
import type { Expense } from '@/lib/forever-fund/types';
import {
  totalForeverNumber,
  totalAnnualSpend,
  formatCurrency,
} from '@/lib/forever-fund/math';
import { AddExpenseForm } from './_components/add-expense-form';
import { ExpenseRow } from './_components/expense-row';
import { KidsHouseFundSummary } from './_components/kids-house-fund-summary';
import { InvestmentTrackerSummary } from './_components/investment-tracker-summary';
import { BudgetTrackerSummary } from './_components/budget-tracker-summary';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false });

  const list: Expense[] = expenses ?? [];
  const total = totalForeverNumber(list);
  const annual = totalAnnualSpend(list);
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split('@')[0] ??
    'there';

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Greeting */}
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
          Welcome back
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gold-light">
          Hey, {displayName}.
        </h1>
      </div>

      {/* 2x2 summary grid: Forever Number + Kids House Fund + Investment Tracker + Budget Tracker */}
      <div className="grid gap-4 md:grid-cols-2 mb-10">
        <div className="rounded-2xl p-8 md:p-10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-gold/30">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">
            Your Forever Number
          </p>
          <div className="font-serif text-4xl md:text-5xl font-bold text-gold-light mb-3 tabular-nums">
            {formatCurrency(total)}
          </div>
          <p className="text-sm text-slate-muted">
            {list.length === 0
              ? 'Add your first recurring expense to start building your Forever Number.'
              : `What you'd need invested to cover ${formatCurrency(annual)}/yr forever.`}
          </p>
        </div>
        <KidsHouseFundSummary />
        <InvestmentTrackerSummary />
        <BudgetTrackerSummary />
      </div>

      {/* Add Expense */}
      <div className="mb-10">
        <h2 className="font-serif text-xl font-bold text-gold-light mb-4">
          Add a recurring expense
        </h2>
        <AddExpenseForm />
      </div>

      {/* Expense List */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif text-xl font-bold text-gold-light">
            Your expenses
          </h2>
          <p className="text-xs uppercase tracking-widest text-slate-subtle">
            {list.length} {list.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {list.length === 0 ? (
          <div className="rounded-xl p-10 text-center bg-white/[0.02] border border-white/[0.06]">
            <p className="text-slate-muted">
              No expenses yet. Try adding one like &ldquo;Phone bill — $50/mo&rdquo;
              to see how your Forever Number works.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} />
            ))}
          </div>
        )}
      </div>

      {/* Footer note */}
      <p className="mt-12 text-xs text-slate-subtle text-center max-w-2xl mx-auto">
        Educational tool only. Not financial advice. Withdrawal rates and
        market returns are not guaranteed.
      </p>
    </div>
  );
}
