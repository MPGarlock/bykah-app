'use client';

import { useState, useTransition } from 'react';
import { addExpense } from '@/lib/forever-fund/actions';
import {
  DEFAULT_WITHDRAWAL_RATE,
  MIN_WITHDRAWAL_RATE,
  MAX_WITHDRAWAL_RATE,
} from '@/lib/forever-fund/types';
import {
  calculateForeverNumber,
  formatCurrency,
} from '@/lib/forever-fund/math';

export function AddExpenseForm() {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'annual'>('monthly');
  const [rate, setRate] = useState(DEFAULT_WITHDRAWAL_RATE);

  // Live preview of the Forever Number as the user types
  const previewAmount = Number(amount);
  const preview =
    Number.isFinite(previewAmount) && previewAmount > 0
      ? calculateForeverNumber(previewAmount, frequency, rate)
      : 0;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');

    const form = new FormData(e.currentTarget);
    form.set('withdrawal_rate', String(rate));

    startTransition(async () => {
      const res = await addExpense(form);
      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }
      // Reset
      setName('');
      setAmount('');
      setFrequency('monthly');
      setRate(DEFAULT_WITHDRAWAL_RATE);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-5 md:p-6 bg-white/[0.03] border border-white/[0.08]"
    >
      <div className="grid gap-4 md:grid-cols-12">
        {/* Name */}
        <div className="md:col-span-5">
          <label className="form-label">Expense name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Phone bill, car fund, gym..."
            required
            maxLength={100}
            className="form-input"
            disabled={isPending}
          />
        </div>

        {/* Amount */}
        <div className="md:col-span-3">
          <label className="form-label">Amount ($)</label>
          <input
            type="number"
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50"
            step="0.01"
            min="0.01"
            required
            className="form-input"
            disabled={isPending}
          />
        </div>

        {/* Frequency */}
        <div className="md:col-span-4">
          <label className="form-label">Frequency</label>
          <select
            name="frequency"
            value={frequency}
            onChange={(e) =>
              setFrequency(e.target.value as 'monthly' | 'annual')
            }
            className="form-input"
            disabled={isPending}
          >
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        </div>

        {/* Withdrawal rate slider */}
        <div className="md:col-span-8">
          <div className="flex items-baseline justify-between mb-2">
            <label className="form-label mb-0">Withdrawal rate</label>
            <span className="text-sm font-bold text-gold-light tabular-nums">
              {rate.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min={MIN_WITHDRAWAL_RATE}
            max={MAX_WITHDRAWAL_RATE}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-[#C9973A]"
            disabled={isPending}
          />
          <div className="flex justify-between text-xs text-slate-subtle mt-1">
            <span>4% (conservative)</span>
            <span>10% (aggressive)</span>
          </div>
        </div>

        {/* Live preview */}
        <div className="md:col-span-4">
          <div className="rounded-lg p-3 bg-gold/5 border border-gold/20 h-full flex flex-col justify-center">
            <p className="text-xs uppercase tracking-widest text-gold mb-1">
              Forever Number
            </p>
            <p className="font-serif text-2xl font-bold text-gold-light tabular-nums">
              {preview > 0 ? formatCurrency(preview) : '—'}
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 text-sm text-red-300 bg-red-900/20 border border-red-900/40 rounded-lg p-3">
          {errorMsg}
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary"
        >
          {isPending ? 'Adding…' : 'Add expense →'}
        </button>
      </div>
    </form>
  );
}
