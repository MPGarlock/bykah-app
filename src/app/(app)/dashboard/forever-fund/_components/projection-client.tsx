'use client';

import { useState, useMemo } from 'react';
import type { Expense } from '@/lib/forever-fund/types';
import { projectForeverFund, type YearProjection } from '@/lib/forever-fund/projection';
import { formatCurrency } from '@/lib/forever-fund/math';

interface Props {
  expenses: Expense[];
  currentPortfolio: number;
  foreverNumber: number;
}

export function ProjectionClient({ expenses, currentPortfolio, foreverNumber }: Props) {
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [returnRate, setReturnRate] = useState(7);

  const projection = useMemo(
    () => projectForeverFund(currentPortfolio, monthlyContribution, returnRate, expenses),
    [currentPortfolio, monthlyContribution, returnRate, expenses],
  );

  const { years, fullyFundedYear, firstMilestone } = projection;
  const currentYear = new Date().getFullYear();
  const displayYears = years.slice(
    0,
    fullyFundedYear ? Math.min(fullyFundedYear, years.length) : 30,
  );

  return (
    <div>
      <div className="rounded-2xl p-6 mb-8 bg-white/[0.03] border border-white/[0.08]">
        <h2 className="font-serif text-xl font-bold text-gold-light mb-5">What if…</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-gold mb-3">
              Monthly contribution
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={5000}
                step={50}
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="flex-1 accent-gold"
              />
              <span className="font-serif text-xl font-bold text-gold-light tabular-nums w-28 text-right shrink-0">
                {formatCurrency(monthlyContribution)}
                <span className="text-xs text-slate-muted font-sans">/mo</span>
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-gold mb-3">
              Expected annual return
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={3}
                max={12}
                step={0.5}
                value={returnRate}
                onChange={(e) => setReturnRate(Number(e.target.value))}
                className="flex-1 accent-gold"
              />
              <span className="font-serif text-xl font-bold text-gold-light tabular-nums w-14 text-right shrink-0">
                {returnRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {firstMilestone && (
        <div className="rounded-2xl p-6 mb-8 bg-gold/[0.08] border border-gold/30">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-1">
            First milestone
          </p>
          <p className="font-serif text-2xl font-bold text-gold-light">
            {firstMilestone.name} covered in Year {firstMilestone.year}{' '}
            <span className="text-base text-slate-muted font-sans font-normal">
              ({currentYear + firstMilestone.year})
            </span>
          </p>
          {fullyFundedYear && (
            <p className="mt-1 text-sm text-slate-muted">
              Fully funded in Year {fullyFundedYear} — {currentYear + fullyFundedYear}
            </p>
          )}
          {!fullyFundedYear && (
            <p className="mt-1 text-sm text-slate-muted">
              Increase your contribution to reach full funding within 50 years.
            </p>
          )}
        </div>
      )}

      {!firstMilestone && (
        <div className="rounded-2xl p-6 mb-8 bg-white/[0.02] border border-white/[0.06] text-center">
          <p className="text-slate-muted">
            Try increasing your monthly contribution or return rate to see milestones.
          </p>
        </div>
      )}

      <div>
        <h2 className="font-serif text-xl font-bold text-gold-light mb-4">
          Year-by-year projection
        </h2>
        <div className="space-y-2">
          {displayYears.map((y) => (
            <ProjectionRow
              key={y.year}
              row={y}
              foreverNumber={foreverNumber}
              currentYear={currentYear}
            />
          ))}
        </div>
        {!fullyFundedYear && displayYears.length === 30 && (
          <p className="mt-4 text-xs text-slate-subtle text-center">
            Showing 30 years. Adjust sliders to see full funding.
          </p>
        )}
      </div>
    </div>
  );
}

function ProjectionRow({
  row,
  foreverNumber,
  currentYear,
}: {
  row: YearProjection;
  foreverNumber: number;
  currentYear: number;
}) {
  const hasMilestone = row.newlyCovered.length > 0;
  const isFull = row.isFullyCovered;

  let containerClass = 'rounded-xl px-5 py-4 border transition-colors ';
  if (isFull) containerClass += 'bg-gold/[0.10] border-gold/40';
  else if (hasMilestone) containerClass += 'bg-gold/[0.05] border-gold/20';
  else containerClass += 'bg-white/[0.02] border-white/[0.05]';

  const coverageClass =
    'text-sm font-bold tabular-nums w-14 text-right ' +
    (row.coveragePercent >= 100 ? 'text-gold' : 'text-slate-muted');

  const barClass =
    'h-full rounded-full ' + (row.coveragePercent >= 100 ? 'bg-gold' : 'bg-gold/40');

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 text-xs text-slate-subtle tabular-nums w-24">
            Yr {row.year} · {currentYear + row.year}
          </div>
          {hasMilestone && (
            <div className="min-w-0 truncate">
              {row.newlyCovered.map((name, i) => (
                <span
                  key={i}
                  className={
                    isFull
                      ? 'text-sm font-semibold text-gold-light'
                      : 'text-sm font-semibold text-gold'
                  }
                >
                  {isFull ? '✅' : '🎯'} {name} covered
                  {i < row.newlyCovered.length - 1 && ' · '}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="font-serif text-base font-bold text-gold-light tabular-nums hidden sm:block">
            {formatCurrency(row.portfolio)}
          </span>
          <span className={coverageClass}>{row.coveragePercent.toFixed(1)}%</span>
        </div>
      </div>
      <div className="mt-2 w-full h-1 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className={barClass}
          style={{ width: String(Math.min(100, row.coveragePercent)) + '%' }}
        />
      </div>
    </div>
  );
}
