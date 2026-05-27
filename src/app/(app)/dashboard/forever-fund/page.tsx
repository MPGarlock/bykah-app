import { createClient } from '@/lib/supabase/server';
import type { Expense } from '@/lib/forever-fund/types';
import { totalForeverNumber, formatCurrency } from '@/lib/forever-fund/math';
import { ProjectionClient } from './_components/projection-client';
import { AuditCTA } from '@/components/AuditCTA';

export default async function ForeverFundPage() {
  const supabase = await createClient();
  const [{ data: expenses }, { data: accounts }] = await Promise.all([
    supabase.from('expenses').select('*').order('created_at', { ascending: false }),
    supabase.from('investment_accounts').select('current_balance'),
  ]);

  const expenseList: Expense[] = expenses ?? [];
  const invested = (accounts ?? []).reduce(
    (sum: number, a: { current_balance: number }) => sum + Number(a.current_balance),
    0,
  );
  const foreverNumber = totalForeverNumber(expenseList);
  const progressPct = foreverNumber > 0 ? Math.min(100, (invested / foreverNumber) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
          Grow Until Returns Cover Everything
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gold-light">
          Forever Fund
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-muted max-w-2xl">
          Project your portfolio growth year by year. See exactly when each expense gets covered — and when you reach full financial independence.
        </p>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl p-8 md:p-10 mb-10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-gold/30">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
              Current Portfolio
            </p>
            <div className="font-serif text-3xl md:text-4xl font-bold text-gold-light tabular-nums">
              {formatCurrency(invested)}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
              Forever Number Target
            </p>
            <div className="font-serif text-3xl md:text-4xl font-bold text-gold-light tabular-nums">
              {foreverNumber > 0 ? formatCurrency(foreverNumber) : '—'}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
              Covered
            </p>
            <div className="font-serif text-3xl md:text-4xl font-bold text-gold-light tabular-nums">
              {foreverNumber > 0 ? `${progressPct.toFixed(1)}%` : '—'}
            </div>
          </div>
        </div>
        {foreverNumber > 0 && (
          <div className="mt-6">
            <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gold/70 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
      {expenseList.length === 0 ? (
        <div className="rounded-xl p-10 text-center bg-white/[0.02] border border-white/[0.06]">
          <p className="text-slate-muted">
            Add some recurring expenses on your{' '}
            <a href="/dashboard" className="text-gold underline">
              dashboard
            </a>{' '}
            first. Each expense becomes a milestone your Forever Fund works to cover.
          </p>
        </div>
      ) : (
        <ProjectionClient
          expenses={expenseList}
          currentPortfolio={invested}
          foreverNumber={foreverNumber}
        />
      )}

      {/* Audit CTA */}
      <AuditCTA />

      {/* Footer note */}
      <p className="mt-12 text-xs text-slate-subtle text-center max-w-2xl mx-auto">
        Educational tool only. Not financial advice. Projections assume steady annual returns and consistent contributions — actual returns vary and are not guaranteed.
      </p>
    </div>
  );
}
