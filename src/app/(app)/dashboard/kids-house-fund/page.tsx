import { createClient } from '@/lib/supabase/server';
import type { Contribution, Fund, FundWithStats } from '@/lib/kids-house-fund/types';
import { buildFundStats } from '@/lib/kids-house-fund/math';
import { formatCurrency } from '@/lib/forever-fund/math';
import { CreateFundForm } from './_components/create-fund-form';
import { FundCard } from './_components/fund-card';

export default async function KidsHouseFundPage() {
  const supabase = await createClient();

  // Fetch funds and contributions in parallel
  const [{ data: funds }, { data: contributions }] = await Promise.all([
    supabase
      .from('kids_house_funds')
      .select('*')
      .order('created_at', { ascending: true }),
    supabase
      .from('kids_house_contributions')
      .select('*')
      .order('contributed_at', { ascending: false })
      .order('created_at', { ascending: false }),
  ]);

  const fundList: Fund[] = funds ?? [];
  const contributionList: Contribution[] = contributions ?? [];

  // Group contributions by fund_id
  const contributionsByFund = new Map<string, Contribution[]>();
  for (const c of contributionList) {
    const arr = contributionsByFund.get(c.fund_id) ?? [];
    arr.push(c);
    contributionsByFund.set(c.fund_id, arr);
  }

  const fundsWithStats: FundWithStats[] = fundList.map((f) =>
    buildFundStats(f, contributionsByFund.get(f.id) ?? []),
  );

  const totalBalance = fundsWithStats.reduce((sum, f) => sum + f.balance, 0);
  const totalTarget = fundsWithStats.reduce(
    (sum, f) => sum + Number(f.target_amount),
    0,
  );
  const overallProgress =
    totalTarget > 0 ? Math.min(100, (totalBalance / totalTarget) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
          The Whole Point
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gold-light">
          Kids House Fund
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-muted max-w-2xl">
          Money set aside toward buying your kids a house. Log every
          contribution. Watch it climb.
        </p>
      </div>

      {/* Summary card (only if at least one fund exists) */}
      {fundsWithStats.length > 0 && (
        <div className="rounded-2xl p-8 md:p-10 mb-10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-gold/30">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">
            Total saved
          </p>
          <div className="font-serif text-5xl md:text-7xl font-bold text-gold-light mb-3 tabular-nums">
            {formatCurrency(totalBalance)}
          </div>
          <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-3 max-w-xl">
            <div
              className="h-full bg-gold/70 transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-sm md:text-base text-slate-muted">
            {overallProgress.toFixed(1)}% of {formatCurrency(totalTarget)} target
            {' · '}
            {fundsWithStats.length}{' '}
            {fundsWithStats.length === 1 ? 'fund' : 'funds'}
          </p>
        </div>
      )}

      {/* Funds list or empty state */}
      {fundsWithStats.length === 0 ? (
        <div className="mb-10">
          <h2 className="font-serif text-xl font-bold text-gold-light mb-4">
            Create your first fund
          </h2>
          <CreateFundForm />
        </div>
      ) : (
        <div className="space-y-6 mb-10">
          {fundsWithStats.map((fund) => (
            <FundCard key={fund.id} fund={fund} />
          ))}

          <div className="pt-6 border-t border-white/[0.08]">
            <h2 className="font-serif text-lg font-bold text-gold-light mb-4">
              Add another fund
            </h2>
            <CreateFundForm />
          </div>
        </div>
      )}

      {/* Footer note */}
      <p className="mt-12 text-xs text-slate-subtle text-center max-w-2xl mx-auto">
        Educational tool only. Not financial advice. Pace projections are based
        on the last 90 days of contributions.
      </p>
    </div>
  );
}
