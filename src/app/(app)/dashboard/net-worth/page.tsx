import { createClient } from '@/lib/supabase/server';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { NetWorthBenchmarker } from './_components/net-worth-benchmarker';

export default async function NetWorthPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user?.id ?? '')
    .single();

  const isUltimateUser = profile?.plan === 'ultimate';
  if (!isUltimateUser) {
    return <UpgradePrompt featureName="Net Worth Benchmarker" tier="ultimate" />;
  }

  let initialNetWorth = 0;
  try {
    const { data: accounts } = await supabase
      .from('investment_accounts')
      .select('current_balance');
    initialNetWorth = (accounts ?? []).reduce(
      (sum: number, a: { current_balance: number }) =>
        sum + Number(a.current_balance ?? 0),
      0
    );
  } catch {
    initialNetWorth = 0;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">Ultimate</p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gold-light">
          Where Do You Stand?
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-muted max-w-2xl">
          See how your net worth compares to your state, the country, and the
          world — using the latest Census Bureau and Federal Reserve data.
        </p>
      </div>
      <NetWorthBenchmarker initialNetWorth={initialNetWorth} />
    </div>
  );
}
