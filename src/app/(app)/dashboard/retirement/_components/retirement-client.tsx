'use client';

import { useState, useMemo } from 'react';
import type { RetirementGoal } from '@/lib/retirement/types';
import { calculateRetirementProjection, formatCurrency } from '@/lib/retirement/math';

interface Props {
  goal: RetirementGoal;
}

export function RetirementClient({ goal }: Props) {
  const [monthlyContribution, setMonthlyContribution] = useState(goal.monthly_contribution);
  const [returnRate, setReturnRate] = useState(goal.expected_return);
  const [targetAge, setTargetAge] = useState(goal.target_age);

  const projection = useMemo(() => {
    return calculateRetirementProjection({
      ...goal,
      monthly_contribution: monthlyContribution,
      expected_return: returnRate,
      target_age: targetAge,
    });
  }, [goal, monthlyContribution, returnRate, targetAge]);

  const barWidth = String(Math.min(100, Math.round(projection.coveragePercent))) + '%';

  const years = projection.yearsToRetirement;
  const midYear = goal.current_age + Math.floor(years / 2);
  const midGoal = calculateRetirementProjection({ ...goal, monthly_contribution: monthlyContribution, expected_return: returnRate, target_age: midYear });

  const yr75Age = goal.current_age + Math.floor(years * 0.75);
  const yr75Goal = calculateRetirementProjection({ ...goal, monthly_contribution: monthlyContribution, expected_return: returnRate, target_age: yr75Age });

  let bannerClass = 'rounded-2xl p-4 mb-6 border text-sm font-medium ';
  if (projection.onTrack) {
    bannerClass += 'bg-gold/10 border-gold/40 text-gold-light';
  } else {
    bannerClass += 'bg-white/[0.04] border-white/10 text-slate-muted';
  }

  return (
    <div className="space-y-6">
      <div className={bannerClass}>
        {projection.onTrack ? (
          <span>You are on track to reach your retirement goal of {formatCurrency(goal.target_nest_egg)} by age {targetAge}.</span>
        ) : (
          <span>
            Projected shortfall of {formatCurrency(projection.shortfall)}.
            Increase monthly contributions by {formatCurrency(projection.monthlyNeededToClose)} to close the gap.
          </span>
        )}
      </div>

      <div className="rounded-2xl p-6 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30 space-y-6">
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-xs font-bold tracking-widest uppercase text-gold">Projected Coverage</p>
            <p className="text-xs text-slate-muted">{Math.round(projection.coveragePercent)}%</p>
          </div>
          <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-gold/70 transition-all rounded-full" style={{ width: barWidth }} />
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-xs text-slate-muted">$0</p>
            <p className="text-xs text-slate-muted">{formatCurrency(goal.target_nest_egg)}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-subtle">Monthly Contribution</label>
              <span className="text-sm font-bold text-gold-light">{formatCurrency(monthlyContribution)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={5000}
              step={50}
              value={monthlyContribution}
              onChange={e => setMonthlyContribution(Number(e.target.value))}
              className="w-full accent-yellow-500"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-muted">$0</span>
              <span className="text-xs text-slate-muted">$5,000</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-subtle">Expected Annual Return</label>
              <span className="text-sm font-bold text-gold-light">{returnRate}%</span>
            </div>
            <input
              type="range"
              min={3}
              max={12}
              step={0.5}
              value={returnRate}
              onChange={e => setReturnRate(Number(e.target.value))}
              className="w-full accent-yellow-500"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-muted">3%</span>
              <span className="text-xs text-slate-muted">12%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-subtle">Target Retirement Age</label>
              <span className="text-sm font-bold text-gold-light">Age {targetAge}</span>
            </div>
            <input
              type="range"
              min={50}
              max={75}
              step={1}
              value={targetAge}
              onChange={e => setTargetAge(Number(e.target.value))}
              className="w-full accent-yellow-500"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-muted">50</span>
              <span className="text-xs text-slate-muted">75</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-6 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30">
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-4">Key Milestones</p>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-muted">Halfway (Age {midYear})</span>
            <span className="text-sm font-bold text-gold-light">{formatCurrency(midGoal.projectedNestEgg)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-muted">75% Mark (Age {yr75Age})</span>
            <span className="text-sm font-bold text-gold-light">{formatCurrency(yr75Goal.projectedNestEgg)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-muted">At Retirement (Age {targetAge})</span>
            <span className="text-sm font-bold text-gold-light">{formatCurrency(projection.projectedNestEgg)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
