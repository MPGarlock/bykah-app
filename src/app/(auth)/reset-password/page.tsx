'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirm) {
      setErrorMsg('Passwords don’t match.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }

    setStatus('submitting');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

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
        <h1 className="font-serif text-4xl font-bold mb-2 text-gold-light">
          Set a new password
        </h1>
        <p className="mb-8 text-slate-muted">
          Pick something you&apos;ll remember.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="form-input"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="form-label">Confirm new password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              className="form-input"
              autoComplete="new-password"
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
            {status === 'submitting' ? 'Saving…' : 'Update password →'}
          </button>
        </form>
      </div>
    </main>
  );
}
