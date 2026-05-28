import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex flex-col leading-tight">
            <span className="font-serif text-lg font-bold text-gold-light">
              Buy Your Kids
            </span>
            <span className="font-serif text-xs tracking-widest uppercase text-gold">
              A House
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-muted hidden sm:block">
              {user.email}
            </span>
            {profile?.plan !== 'plus' && (
              <Link
                href="/dashboard/upgrade"
                style={{ color: '#C9973A' }}
                className="text-sm font-semibold"
              >
                Upgrade to Plus
              </Link>
            )}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm underline text-slate-muted hover:text-gold"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/5 px-6 py-4 text-xs text-slate-subtle text-center">
        © {new Date().getFullYear()} Buy Your Kids A House · For educational purposes only. Not financial advice.
      </footer>
    </div>
  );
}
