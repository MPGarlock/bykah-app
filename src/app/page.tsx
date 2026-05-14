import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full text-center">
        <div className="inline-block px-3 py-1 mb-8 rounded-full bg-gold/10 border border-gold/30">
          <span className="text-xs font-bold tracking-widest uppercase text-gold">
            The Buy Your Kids A House App
          </span>
        </div>

        <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 leading-tight text-gold-light">
          Your <span className="italic text-gold">Forever Number</span>
          <br />
          starts here.
        </h1>

        <p className="text-lg md:text-xl mb-10 max-w-xl mx-auto text-slate-muted">
          Track every recurring expense. See how much you&apos;d need invested
          to cover it forever. Build generational wealth, one expense at a time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="btn-primary">
            Get Started — Free →
          </Link>
          <Link href="/login" className="btn-secondary">
            Sign In
          </Link>
        </div>

        <p className="mt-12 text-sm text-slate-subtle">
          New here? Listen to the podcast at{' '}
          <a
            href="https://buyyourkidsahouse.com"
            className="underline text-gold"
          >
            buyyourkidsahouse.com
          </a>
        </p>
      </div>
    </main>
  );
}
