import { createClient } from '@/lib/supabase/server';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { PointsCalculatorClient } from './_components/points-calculator-client';

export default async function PointsCalculatorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user?.id ?? '').single();
  const isProUser = profile?.plan === 'pro' || profile?.plan === 'ultimate';

  if (!isProUser) return <UpgradePrompt featureName="Travel Points Calculator" />;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-gold-light mb-2">Travel Points Calculator</h1>
      <p className="text-slate-muted mb-8">See how long your 3-card strategy takes to earn a family flight.</p>
      <PointsCalculatorClient />
    </div>
  );
}
