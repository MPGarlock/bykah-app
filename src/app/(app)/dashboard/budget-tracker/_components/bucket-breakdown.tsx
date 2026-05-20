import { formatCurrency } from '@/lib/forever-fund/math';
import { BUCKET_LABEL } from '@/lib/budget-tracker/types';
import type { BucketSummary } from '@/lib/budget-tracker/math';

/**
 * The 50/30/20 plan card: for each bucket, actual spend vs. the
 * income-derived target. Presentational — receives precomputed summaries.
 */
export function BucketBreakdown({
  summaries,
  income,
}: {
  summaries: BucketSummary[];
  income: number;
}) {
  const hasIncome = income > 0;

  return (
    <div className="rounded-2xl p-8 md:p-10 mb-10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-gold/30">
      <div className="flex items-baseline justify-between mb-6">
        <p className="text-xs font-bold tracking-widest uppercase text-gold">
          Your 50/30/20 plan
        </p>
        {hasIncome && (
          <p className="text-xs text-slate-subtle tabular-nums">
            {formatCurrency(income)}/mo income
          </p>
        )}
      </div>

      {!hasIncome ? (
        <p className="text-sm md:text-base text-slate-muted">
          Add your post-tax monthly income below to see your Needs / Wants /
          Investments targets and how this month&apos;s spending compares.
        </p>
      ) : (
        <div className="space-y-6">
          {summaries.map((s) => (
            <div key={s.bucket}>
              <div className="flex items-baseline justify-between mb-2 gap-3">
                <p className="font-serif text-lg md:text-xl font-bold text-gold-light">
                  {BUCKET_LABEL[s.bucket]}{' '}
                  <span className="text-sm font-sans text-slate-subtle">
                    {s.pct}%
                  </span>
                </p>
                <p className="text-sm text-slate-muted tabular-nums">
                  {formatCurrency(s.spent)} / {formatCurrency(s.target)}
                </p>
              </div>
              <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full transition-all ${s.overTarget ? 'bg-red-400/70' : 'bg-gold/70'}`}
                  style={{ width: `${s.progressPct}%` }}
                />
              </div>
              <p className="text-xs text-slate-subtle">
                {s.overTarget ? (
                  <span className="text-red-300">
                    {formatCurrency(s.delta)} over target
                  </span>
                ) : (
                  <span>
                    {formatCurrency(Math.max(0, -s.delta))} left of target
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
