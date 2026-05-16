'use client';

import { useState, useTransition } from 'react';
import { addContribution } from '@/lib/kids-house-fund/actions';
import { NOTE_MAX } from '@/lib/kids-house-fund/types';

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function AddContributionForm({ fundId }: { fundId: string }) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayISO());

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await addContribution(fundId, form);
      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }
      setAmount('');
      setNote('');
      setDate(todayISO());
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-4 md:p-5 bg-gold/[0.04] border border-gold/20"
    >
      <div className="grid gap-3 md:grid-cols-12">
        <div className="md:col-span-3">
          <label className="form-label text-xs">Amount ($)</label>
          <input
            type="number"
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="500"
            step="0.01"
            min="0.01"
            required
            className="form-input"
            disabled={isPending}
          />
        </div>
        <div className="md:col-span-3">
          <label className="form-label text-xs">Date</label>
          <input
            type="date"
            name="contributed_at"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="form-input"
            disabled={isPending}
          />
        </div>
        <div className="md:col-span-6">
          <label className="form-label text-xs">Note (optional)</label>
          <input
            type="text"
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tax refund, birthday gift, monthly deposit..."
            maxLength={NOTE_MAX}
            className="form-input"
            disabled={isPending}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 text-sm text-red-300 bg-red-900/20 border border-red-900/40 rounded-lg p-3">
          {errorMsg}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? 'Adding…' : 'Log contribution →'}
        </button>
      </div>
    </form>
  );
}
