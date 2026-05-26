import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { RetirementGoal } from '@/lib/retirement/types';
import { calculateRetirementProjection, formatCurrency } from '@/lib/retirement/math';

export async function RetirementSummary() {
  let goal: RetirementGoal | null = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('retirement_goals')
        .select('*')
        .eq('user_id', user.id)
        .single();
      goal = data ?? null;
    }
  } catch {
    goal = null;
  }

  if (!goal) {
    return (
      <Link
        href="/dashboard/retirement"
        className="block rounded-2xl p-8 md:p-10 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30 hover:border-gold/50 transition-colors"
      >
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Retirement Goal</p>
        <p className="font-serif text-xl font-bold text-gold-light mb-2">Not yet configured</p>
        <p className="text-sm text-slate-muted">Set up your retirement goal to start projecting your path to financial independence.</p>
      </Link>
    );
  }

  const projection = calculateRetirementProjection(goal);
  const barWidth = String(Math.min(100, Math.round(projection.coveragePercent))) + '%';

  return (
    <Link
      href="/dashboard/retirement"
      className="block rounded-2xl p-8 md:p-10 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30 hover:border-gold/50 transition-colors"
    >
      <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Retirement Goal</p>

      <div className="mb-4">
        <p className="font-serif text-3xl md:text-4xl font-bold text-gold-light mb-1">
          {Math.round(projection.coveragePercent)}% covered
        </p>
        <p className="text-sm text-slate-muted">
          {projection.onTrack
            ? 'On track to reach ' + formatCurrency(goal.target_nest_egg) + ' by age ' + goal.target_age
            : 'Shortfall of ' + formatCurrency(projection.shortfall)}
        </p>
      </div>

      <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-3">
        <div className="h-full bg-gold/70 transition-all" style={{ width: barWidth }} />
      </div>

      <div className="flex justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-1">Years to Retirement</p>
          <p className="font-serif text-xl md:text-2xl font-bold text-gold-light">{projection.yearsToRetirement}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-1">Target</p>
          <p className="font-serif text-xl md:text-2xl font-bold text-gold-light">{formatCurrency(goal.target_nest_egg)}</p>
        </div>
      </div>
    </Link>
  );
}
