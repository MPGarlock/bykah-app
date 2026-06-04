import Link from 'next/link';

export function TravelPointsSummary() {
  return (
    <Link
      href="/dashboard/points-calculator"
      className="block rounded-2xl p-8 md:p-10 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30 hover:border-gold/50 transition-colors"
    >
      <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Travel Points</p>
      <p className="font-serif text-xl font-bold text-gold-light mb-2">3-Card Optimized System</p>
      <p className="text-sm text-slate-muted">Calculate how long until your family can fly on points.</p>
    </Link>
  );
}
