import Link from 'next/link';

export function AffordSummary() {
  return (
    <div className="bg-[#111f38] rounded-2xl p-6 border border-white/10 flex flex-col gap-3">
      <div>
        <h2 className="font-serif text-xl text-gold mb-1">Can I Afford It?</h2>
        <p className="font-sans text-slate-muted text-sm">
          Run any major purchase through the BYKAH framework before you commit.
        </p>
      </div>
      <Link
        href="/dashboard/afford"
        className="mt-auto inline-flex items-center gap-2 font-sans text-sm text-gold hover:text-gold-light transition-colors"
      >
        Open Calculator
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
