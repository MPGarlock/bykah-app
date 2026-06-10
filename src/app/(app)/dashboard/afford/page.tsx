import { createClient } from '@/lib/supabase/server';
import UpgradePrompt from '@/components/UpgradePrompt';
import { AffordCalculator } from './_components/afford-calculator';

export default async function AffordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user?.id ?? '').single();
  const isPlusUser = profile?.plan === 'pro';
  if (!isPlusUser) return <UpgradePrompt featureName="Can I Afford It?" />;

  return (
    <div className="min-h-screen bg-[#0A1628] px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-gold mb-2">Can I Afford It?</h1>
          <p className="font-sans text-slate-muted text-lg">
            Run any major purchase through the BYKAH framework before you commit.
          </p>
        </div>
        <AffordCalculator />
      </div>
    </div>
  );
}
