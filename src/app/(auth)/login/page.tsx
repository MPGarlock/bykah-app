'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg(error.message);
      setStatus('error');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <Link href="/" className="block mb-8 text-sm text-gold">
          ← Back to home
        </Link>
        <h1 className="font-serif text-4xl font-bold mb-2 text-gold-light">
          Welcome back
        </h1>
        <p className="mb-8 text-slate-muted">Sign in to keep building.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              autoComplete="current-password"
            />
            <Link
              href="/forgot-password"
              className="mt-2 inline-block text-xs underline text-gold"
            >
              Forgot your password?
            </Link>
          </div>

          {errorMsg && (
            <div className="text-sm text-red-300 bg-red-900/20 border border-red-900/40 rounded-lg p-3">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="btn-primary w-full"
          >
            {status === 'submitting' ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-muted">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline text-gold">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
