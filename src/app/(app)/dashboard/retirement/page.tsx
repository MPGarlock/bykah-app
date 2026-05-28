import { createClient } from '@/lib/supabase/server';
import UpgradePrompt from '@/components/UpgradePrompt';
import type { RetirementGoal } from '@/lib/retirement/types';
import { calculateRetirementProjection, formatCurrency } from '@/lib/retirement/math';
import { RetirementClient } from './_components/retirement-client';

export default async function RetirementPage() {
  let goal: RetirementGoal | null = null;

  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  const { data: profile } = await supabaseAuth.from('profiles').select('plan').eq('id', user?.id ?? '').single();
  const isPlusUser = profile?.plan === 'plus';
  if (!isPlusUser) return <UpgradePrompt featureName="Retirement Goal" />;

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

  const projection = goal ? calculateRetirementProjection(goal) : null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-gold-light mb-2">Retirement Goal</h1>
      <p className="text-slate-muted mb-8">Project your path to financial independence.</p>

      {goal && projection ? (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-2xl p-6 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30">
              <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">Current Savings</p>
              <p className="font-serif text-2xl font-bold text-gold-light">{formatCurrency(goal.current_savings)}</p>
            </div>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30">
              <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">Target Nest Egg</p>
              <p className="font-serif text-2xl font-bold text-gold-light">{formatCurrency(goal.target_nest_egg)}</p>
            </div>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30">
              <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">On Track</p>
              <p className="font-serif text-2xl font-bold text-gold-light">{Math.round(projection.coveragePercent)}%</p>
            </div>
          </div>
          <RetirementClient goal={goal} />
        </>
      ) : (
        <div className="rounded-2xl p-8 md:p-10 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Getting Started</p>
          <p className="font-serif text-2xl font-bold text-gold-light mb-3">Set Up Your Retirement Goal</p>
          <p className="text-slate-muted mb-4">
            The Retirement Goal module helps you project how your savings and contributions will grow over time,
            so you can see whether you're on track to reach your target nest egg by retirement age.
          </p>
          <p className="text-sm text-slate-subtle">
            Goal setup is coming soon. Once configured, you'll be able to adjust monthly contributions,
            expected returns, and target retirement age with interactive sliders.
          </p>
        </div>
      )}
    </div>
  );
}
