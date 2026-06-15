import Link from 'next/link';

export function NetWorthSummary() {
  return (
    <Link
      href="/dashboard/net-worth"
      className="block rounded-2xl p-8 md:p-10 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30 hover:border-gold/50 transition-colors"
    >
      <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">
        Ultimate · Net Worth
      </p>
      <p className="font-serif text-xl font-bold text-gold-light mb-2">
        Where Do You Stand?
      </p>
      <p className="text-sm text-slate-muted">
        Compare your net worth to your state, the country, and the world.
      </p>
    </Link>
  );
}
