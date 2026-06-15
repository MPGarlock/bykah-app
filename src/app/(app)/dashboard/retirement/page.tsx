import { createClient } from '@/lib/supabase/server';
import UpgradePrompt from '@/components/UpgradePrompt';
import type { RetirementGoal } from '@/lib/retirement/types';
import { calculateRetirementProjection, formatCurrency } from '@/lib/retirement/math';
import { RetirementClient } from './_components/retirement-client';
import { RetirementCalculator } from './_components/retirement-calculator';
import { DEFAULT_NEEDS_PCT, DEFAULT_WANTS_PCT } from '@/lib/budget-tracker/types';

export default async function RetirementPage() {
  let goal: RetirementGoal | null = null;

  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  const { data: profile } = await supabaseAuth.from('profiles').select('plan').eq('id', user?.id ?? '').single();
  const isProUser = profile?.plan === 'pro' || profile?.plan === 'ultimate';
  if (!isProUser) return <UpgradePrompt featureName="Retirement Goal" />;

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

  // Best-effort defaults for the "Find Your Number" calculator, pulled from
  // the user's existing 50/30/20 budget plan and investment accounts.
  let defaultNeeds = 0;
  let defaultWants = 0;
  let defaultCurrentSavings = 0;

  try {
    const supabase = await createClient();
    const [{ data: settingsRow }, { data: accounts }] = await Promise.all([
      supabase.from('budget_settings').select('*').maybeSingle(),
      supabase.from('investment_accounts').select('current_balance'),
    ]);

    const income = Number(settingsRow?.monthly_income ?? 0);
    const needsPct = Number(settingsRow?.needs_pct ?? DEFAULT_NEEDS_PCT);
    const wantsPct = Number(settingsRow?.wants_pct ?? DEFAULT_WANTS_PCT);
    defaultNeeds = (income * needsPct) / 100;
    defaultWants = (income * wantsPct) / 100;
    defaultCurrentSavings = (accounts ?? []).reduce(
      (sum: number, a: { current_balance: number }) => sum + Number(a.current_balance),
      0,
    );
  } catch {
    // Defaults stay at 0 — the calculator works fine with manual entry.
  }

  const projection = goal ? calculateRetirementProjection(goal) : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gold-light mb-2">Retirement Goal</h1>
        <p className="text-slate-muted max-w-2xl">
          Find your retirement number with a modified 50/30/20 budget and the 4% rule, then
          track your progress toward it.
        </p>
      </div>

      {/* Find Your Number calculator */}
      <div className="mb-12">
        <RetirementCalculator
          defaultNeeds={defaultNeeds}
          defaultWants={defaultWants}
          defaultCurrentSavings={defaultCurrentSavings}
        />
      </div>

      {/* Existing goal tracking / projection */}
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
