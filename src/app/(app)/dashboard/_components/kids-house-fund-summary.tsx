import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/forever-fund/math';

type FundSummaryRow = { id: string; target_amount: number };
type ContributionSummaryRow = { amount: number };

/**
 * Server component summary card for /dashboard.
 * Pulls totals across all of a user's funds + contributions and renders a
 * clickable card linking to the full /dashboard/kids-house-fund page.
 */
export async function KidsHouseFundSummary() {
  const supabase = await createClient();

  const [{ data: funds }, { data: contributions }] = await Promise.all([
    supabase.from('kids_house_funds').select('id, target_amount'),
    supabase.from('kids_house_contributions').select('amount'),
  ]);

  const fundList: FundSummaryRow[] = (funds as FundSummaryRow[] | null) ?? [];
  const contributionList: ContributionSummaryRow[] =
    (contributions as ContributionSummaryRow[] | null) ?? [];

  const totalBalance = contributionList.reduce(
    (sum, c) => sum + Number(c.amount),
    0,
  );
  const totalTarget = fundList.reduce(
    (sum, f) => sum + Number(f.target_amount),
    0,
  );
  const progressPct =
    totalTarget > 0 ? Math.min(100, (totalBalance / totalTarget) * 100) : 0;

  if (fundList.length === 0) {
    return (
      <Link
        href="/dashboard/kids-house-fund"
        className="block rounded-2xl p-8 md:p-10 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30 hover:border-gold/50 transition-colors"
      >
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">
          Kids House Fund
        </p>
        <p className="font-serif text-3xl md:text-4xl font-bold text-gold-light mb-3">
          Start the fund →
        </p>
        <p className="text-sm md:text-base text-slate-muted">
          Set a target and start saving toward buying your kids a house.
        </p>
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard/kids-house-fund"
      className="block rounded-2xl p-8 md:p-10 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30 hover:border-gold/50 transition-colors"
    >
      <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">
        Kids House Fund
      </p>
      <div className="font-serif text-4xl md:text-5xl font-bold text-gold-light mb-3 tabular-nums">
        {formatCurrency(totalBalance)}
      </div>
      <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-gold/70 transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <p className="text-sm text-slate-muted">
        {progressPct.toFixed(1)}% of {formatCurrency(totalTarget)}
        {' · '}
        {fundList.length} {fundList.length === 1 ? 'fund' : 'funds'} →
      </p>
    </Link>
  );
}
