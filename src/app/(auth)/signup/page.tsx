'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: fullName },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setStatus('error');
      return;
    }
    if (data.session) {
      // Email confirmation is disabled — user is immediately active
      router.push('/dashboard');
    } else {
      // Email confirmation required — ask user to check inbox
      setStatus('sent');
    }
  }

  if (status === 'sent') {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h1 className="font-serif text-4xl font-bold mb-4 text-gold-light">
            Check your inbox
          </h1>
          <p className="text-slate-muted">
            We sent a confirmation link to <strong className="text-gold-light">{email}</strong>.
            Click it to verify your email and finish signing up.
          </p>
          <p className="mt-8 text-sm text-slate-subtle">
            Didn&apos;t get it? Check your spam folder. Or{' '}
            <button
              onClick={() => setStatus('idle')}
              className="underline text-gold"
            >
              try a different email
            </button>
            .
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <Link href="/" className="block mb-8 text-sm text-gold">
          ← Back to home
        </Link>
        <h1 className="font-serif text-4xl font-bold mb-2 text-gold-light">
          Create your account
        </h1>
        <p className="mb-8 text-slate-muted">
          Free forever. No credit card required.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="form-input"
              autoComplete="name"
            />
          </div>
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
              minLength={8}
              className="form-input"
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-slate-subtle">At least 8 characters</p>
          </div>

          {errorMsg && (
            <div className="text-sm text-red-900/20 border border-red-900/40 rounded-lg p-3">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="btn-primary w-full"
          >
            {status === 'submitting' ? 'Creating account…' : 'Create account →'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-muted">
          Already have an account?{' '}
          <Link href="/login" className="underline text-gold">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
