import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, totalForeverNumber } from '@/lib/forever-fund/math';
import { projectForeverFund } from '@/lib/forever-fund/projection';
import type { Expense } from '@/lib/forever-fund/types';

export async function ForeverFundSummary() {
  const supabase = await createClient();

  const [{ data: expenses }, { data: accounts }] = await Promise.all([
    supabase.from('expenses').select('*'),
    supabase.from('investment_accounts').select('current_balance'),
  ]);

  const expenseList: Expense[] = (expenses as Expense[] | null) ?? [];
  const invested = (accounts ?? []).reduce(
    (sum: number, a: { current_balance: number }) => sum + Number(a.current_balance),
    0,
  );
  const foreverNumber = totalForeverNumber(expenseList);
  const progressPct = foreverNumber > 0 ? Math.min(100, (invested / foreverNumber) * 100) : 0;

  const projection =
    expenseList.length > 0
      ? projectForeverFund(invested, 500, 7, expenseList)
      : null;

  const firstMilestone = projection?.firstMilestone;
  const fullyFundedYear = projection?.fullyFundedYear;
  const currentYear = new Date().getFullYear();

  if (expenseList.length === 0) {
    return (
      <Link
        href="/dashboard/forever-fund"
        className="block rounded-2xl p-8 md:p-10 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30 hover:border-gold/50 transition-colors"
      >
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Forever Fund</p>
        <p className="font-serif text-3xl md:text-4xl font-bold text-gold-light mb-3">See your projection →</p>
        <p className="text-sm md:text-base text-slate-muted">
          Add expenses on your dashboard to project when each one gets covered forever.
        </p>
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard/forever-fund"
      className="block rounded-2xl p-8 md:p-10 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30 hover:border-gold/50 transition-colors"
    >
      <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Forever Fund</p>
      {firstMilestone ? (
        <>
          <p className="font-serif text-xl md:text-2xl font-bold text-gold-light mb-1">
            {firstMilestone.name} covered in Year {firstMilestone.year}
          </p>
          {fullyFundedYear ? (
            <p className="text-sm text-slate-muted mb-3">
              Fully funded in Year {fullyFundedYear} · {currentYear + fullyFundedYear}
            </p>
          ) : (
            <p className="text-sm text-slate-muted mb-3">Increase contributions to fully fund →</p>
          )}
        </>
      ) : (
        <p className="font-serif text-2xl font-bold text-gold-light mb-3">See projection →</p>
      )}
      {foreverNumber > 0 && (
        <div>
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gold/70 transition-all"
              style={{ width: String(progressPct) + '%' }}
            />
          </div>
          <p className="text-sm text-slate-muted">
            {progressPct.toFixed(1)}% of {formatCurrency(foreverNumber)} →
          </p>
        </div>
      )}
    </Link>
  );
}
