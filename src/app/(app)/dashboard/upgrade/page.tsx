import { createClient } from '@/lib/supabase/server';
import UpgradeClient from './UpgradeClient';

export default async function UpgradePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let currentPlan = 'free';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();
    currentPlan = profile?.plan ?? 'free';
  }

  return <UpgradeClient currentPlan={currentPlan} />;
}
