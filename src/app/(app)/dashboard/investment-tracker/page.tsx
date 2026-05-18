import { createClient } from '@/lib/supabase/server';
import type { InvestmentAccount } from '@/lib/investment-tracker/types';
import type { Expense } from '@/lib/forever-fund/types';
import { totalInvested, progressTowardGoal } from '@/lib/investment-tracker/math';
import { totalForeverNumber, formatCurrency } from '@/lib/forever-fund/math';
import { CreateAccountForm } from './_components/create-account-form';
import { AccountRow } from './_components/account-row';

export default async function InvestmentTrackerPage() {
  const supabase = await createClient();

  // Fetch investment accounts AND expenses (to compute Forever Number target)
  const [{ data: accounts }, { data: expenses }] = await Promise.all([
    supabase
      .from('investment_accounts')
      .select('*')
      .order('current_balance', { ascending: false }),
    supabase.from('expenses').select('*'),
  ]);

  const accountList: InvestmentAccount[] = accounts ?? [];
  const expenseList: Expense[] = expenses ?? [];

  const invested = totalInvested(accountList);
  const foreverNumber = totalForeverNumber(expenseList);
  const progressPct = progressTowardGoal(invested, foreverNumber);
  const remaining = Math.max(0, foreverNumber - invested);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
          Progress Toward Independence
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gold-light">
          Investment Tracker
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-muted max-w-2xl">
          What you actually have invested, measured against your Forever Number.
          Update balances whenever you check your accounts.
        </p>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl p-8 md:p-10 mb-10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-gold/30">
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">
          Total invested
        </p>
        <div className="font-serif text-5xl md:text-7xl font-bold text-gold-light mb-3 tabular-nums">
          {formatCurrency(invested)}
        </div>
        {foreverNumber > 0 ? (
          <>
            <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-3 max-w-xl">
              <div
                className="h-full bg-gold/70 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-sm md:text-base text-slate-muted">
              {progressPct.toFixed(1)}% of your Forever Number (
              {formatCurrency(foreverNumber)})
              {remaining > 0 && (
                <span className="text-slate-subtle">
                  {' · '}
                  {formatCurrency(remaining)} to go
                </span>
              )}
              {invested >= foreverNumber && (
                <span className="text-gold ml-2">· You&apos;re there!</span>
              )}
            </p>
          </>
        ) : (
          <p className="text-sm md:text-base text-slate-muted">
            Add some recurring expenses on your dashboard to set your Forever
            Number target.
          </p>
        )}
      </div>

      {/* Accounts list or empty state */}
      {accountList.length === 0 ? (
        <div className="mb-10">
          <h2 className="font-serif text-xl font-bold text-gold-light mb-4">
            Add your first account
          </h2>
          <CreateAccountForm />
        </div>
      ) : (
        <div className="mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-serif text-xl font-bold text-gold-light">
              Your accounts
            </h2>
            <p className="text-xs uppercase tracking-widest text-slate-subtle">
              {accountList.length}{' '}
              {accountList.length === 1 ? 'account' : 'accounts'}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {accountList.map((account) => (
              <AccountRow key={account.id} account={account} />
            ))}
          </div>

          <div className="pt-6 border-t border-white/[0.08]">
            <h2 className="font-serif text-lg font-bold text-gold-light mb-4">
              Add another account
            </h2>
            <CreateAccountForm />
          </div>
        </div>
      )}

      {/* Footer note */}
      <p className="mt-12 text-xs text-slate-subtle text-center max-w-2xl mx-auto">
        Educational tool only. Not financial advice. Update balances as often or
        as rarely as you like.
      </p>
    </div>
  );
}
