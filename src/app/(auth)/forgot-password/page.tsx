'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setErrorMsg(error.message);
      setStatus('error');
      return;
    }
    setStatus('sent');
  }

  if (status === 'sent') {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h1 className="font-serif text-4xl font-bold mb-4 text-gold-light">
            Check your inbox
          </h1>
          <p className="text-slate-muted">
            If an account exists for <strong className="text-gold-light">{email}</strong>,
            you&apos;ll get a password reset link in your inbox within a minute.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block text-sm underline text-gold"
          >
            Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <Link href="/login" className="block mb-8 text-sm text-gold">
          ← Back to sign in
        </Link>
        <h1 className="font-serif text-4xl font-bold mb-2 text-gold-light">
          Reset your password
        </h1>
        <p className="mb-8 text-slate-muted">
          Enter your email and we&apos;ll send you a link to set a new password.
        </p>

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
            {status === 'submitting' ? 'Sending…' : 'Send reset link →'}
          </button>
        </form>
      </div>
    </main>
  );
}
