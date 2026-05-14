import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split('@')[0] ??
    'there';

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">
          Welcome
        </p>
        <h1 className="font-serif text-5xl font-bold text-gold-light mb-4">
          Hey, {displayName}.
        </h1>
        <p className="text-lg text-slate-muted max-w-xl">
          You&apos;re in. The app foundation is live — auth works, your account
          exists, and we&apos;re ready to start building the modules.
        </p>
      </div>

      <div className="rounded-2xl p-8 bg-white/[0.03] border border-white/[0.08]">
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">
          Coming Next
        </p>
        <h2 className="font-serif text-3xl font-bold text-gold-light mb-4">
          The Forever Fund Module
        </h2>
        <p className="text-base text-slate-muted mb-6 max-w-2xl">
          Track every recurring expense in your life. See how much you&apos;d
          need invested to cover each one — forever, without ever touching the
          principal. The signature concept from the show, automated.
        </p>
        <p className="text-sm text-slate-subtle">
          Phase 2 — building soon. You&apos;ll be one of the first to use it.
        </p>
      </div>

      <div className="mt-12 grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Budget Tracker', when: 'Phase 3' },
          { label: 'Investment Tracker', when: 'Phase 3' },
          { label: 'Kids House Fund', when: 'Phase 3' },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-xl p-5 bg-white/[0.02] border border-white/[0.06]"
          >
            <div className="text-xs uppercase tracking-wider text-slate-subtle mb-2">
              {m.when}
            </div>
            <div className="font-serif text-lg font-bold text-slate-text">
              {m.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
