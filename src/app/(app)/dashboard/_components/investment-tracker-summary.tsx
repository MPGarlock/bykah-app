import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, totalForeverNumber } from '@/lib/forever-fund/math';
import type { Expense } from '@/lib/forever-fund/types';

type AccountSummaryRow = { current_balance: number };

/**
 * Server component summary card for /dashboard.
 * Shows total invested + progress % toward the Forever Number target.
 */
export async function InvestmentTrackerSummary() {
  const supabase = await createClient();

  const [{ data: accounts }, { data: expenses }] = await Promise.all([
    supabase.from('investment_accounts').select('current_balance'),
    supabase.from('expenses').select('*'),
  ]);

  const accountList: AccountSummaryRow[] =
    (accounts as AccountSummaryRow[] | null) ?? [];
  const expenseList: Expense[] = (expenses as Expense[] | null) ?? [];

  const invested = accountList.reduce(
    (sum, a) => sum + Number(a.current_balance),
    0,
  );
  const foreverNumber = totalForeverNumber(expenseList);
  const progressPct =
    foreverNumber > 0 ? Math.min(100, (invested / foreverNumber) * 100) : 0;

  if (accountList.length === 0) {
    return (
      <Link
        href="/dashboard/investment-tracker"
        className="block rounded-2xl p-8 md:p-10 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30 hover:border-gold/50 transition-colors"
      >
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">
          Investment Tracker
        </p>
        <p className="font-serif text-3xl md:text-4xl font-bold text-gold-light mb-3">
          Track your accounts →
        </p>
        <p className="text-sm md:text-base text-slate-muted">
          See your invested total measured against your Forever Number.
        </p>
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard/investment-tracker"
      className="block rounded-2xl p-8 md:p-10 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30 hover:border-gold/50 transition-colors"
    >
      <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">
        Investment Tracker
      </p>
      <div className="font-serif text-4xl md:text-5xl font-bold text-gold-light mb-3 tabular-nums">
        {formatCurrency(invested)}
      </div>
      {foreverNumber > 0 ? (
        <>
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gold/70 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-sm text-slate-muted">
            {progressPct.toFixed(1)}% of {formatCurrency(foreverNumber)} →
          </p>
        </>
      ) : (
        <p className="text-sm text-slate-muted">
          {accountList.length}{' '}
          {accountList.length === 1 ? 'account' : 'accounts'} tracked →
        </p>
      )}
    </Link>
  );
}
