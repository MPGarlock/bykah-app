export function AuditCTA() {
  return (
    <div className="mt-12 rounded-2xl p-8 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-gold/40 text-center">
      <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
        Ready to put a plan together?
      </p>
      <p className="text-sm text-slate-muted max-w-xl mx-auto mb-6">
        Book a private 1:1 budget audit with Matt &amp; Andrew — we&apos;ll apply the 50/30/20 framework to your actual numbers.
      </p>
      <a
        href="https://buyyourkidsahouse.com/audit"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-6 py-3 rounded-xl bg-gold/10 border border-gold/40 text-gold font-semibold text-sm hover:bg-gold/20 transition-colors"
      >
        Book a 1:1 Audit →
      </a>
    </div>
  );
}
