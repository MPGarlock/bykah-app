'use client';

import { useState, useTransition } from 'react';
import { deleteExpense, updateExpense } from '@/lib/forever-fund/actions';
import type { Expense, Frequency } from '@/lib/forever-fund/types';
import {
  MIN_WITHDRAWAL_RATE,
  MAX_WITHDRAWAL_RATE,
} from '@/lib/forever-fund/types';
import {
  expenseForeverNumber,
  formatCurrency,
  formatCurrencyDetailed,
} from '@/lib/forever-fund/math';

export function ExpenseRow({ expense }: { expense: Expense }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');

  // Editable copy of the expense (used while editing)
  const [name, setName] = useState(expense.name);
  const [amount, setAmount] = useState(String(expense.amount));
  const [frequency, setFrequency] = useState<Frequency>(expense.frequency);
  const [rate, setRate] = useState<number>(expense.withdrawal_rate);

  const foreverNumber = expenseForeverNumber(expense);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    const form = new FormData(e.currentTarget);
    form.set('withdrawal_rate', String(rate));

    startTransition(async () => {
      const res = await updateExpense(expense.id, form);
      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }
      setEditing(false);
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${expense.name}"?`)) return;
    setErrorMsg('');
    startTransition(async () => {
      const res = await deleteExpense(expense.id);
      if (!res.ok) setErrorMsg(res.error);
    });
  }

  function handleCancelEdit() {
    setName(expense.name);
    setAmount(String(expense.amount));
    setFrequency(expense.frequency);
    setRate(expense.withdrawal_rate);
    setErrorMsg('');
    setEditing(false);
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        className="rounded-xl p-5 bg-gold/[0.04] border border-gold/30"
      >
        <div className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-5">
            <label className="form-label text-xs">Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className="form-input"
              disabled={isPending}
            />
          </div>
          <div className="md:col-span-3">
            <label className="form-label text-xs">Amount ($)</label>
            <input
              type="number"
              name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0.01"
              required
              className="form-input"
              disabled={isPending}
            />
          </div>
          <div className="md:col-span-4">
            <label className="form-label text-xs">Frequency</label>
            <select
              name="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Frequency)}
              className="form-input"
              disabled={isPending}
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <div className="md:col-span-12">
            <div className="flex items-baseline justify-between mb-1">
              <label className="form-label mb-0 text-xs">
                Withdrawal rate
              </label>
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
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 text-sm text-red-300 bg-red-900/20 border border-red-900/40 rounded-lg p-3">
            {errorMsg}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancelEdit}
            className="btn-secondary"
            disabled={isPending}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-xl p-4 md:p-5 bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
      <div className="grid gap-3 md:grid-cols-12 items-center">
        {/* Name + frequency */}
        <div className="md:col-span-5">
          <p className="font-serif text-lg font-bold text-gold-light">
            {expense.name}
          </p>
          <p className="text-xs text-slate-muted">
            {formatCurrencyDetailed(expense.amount)} /{' '}
            {expense.frequency === 'monthly' ? 'month' : 'year'}{' '}
            <span className="text-slate-subtle">·</span>{' '}
            {expense.withdrawal_rate.toFixed(1)}% rate
          </p>
        </div>

        {/* Forever Number */}
        <div className="md:col-span-4">
          <p className="text-xs uppercase tracking-widest text-gold mb-1">
            Forever Number
          </p>
          <p className="font-serif text-2xl font-bold text-gold-light tabular-nums">
            {formatCurrency(foreverNumber)}
          </p>
        </div>

        {/* Actions */}
        <div className="md:col-span-3 flex md:justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm underline text-slate-muted hover:text-gold"
            disabled={isPending}
          >
            Edit
          </button>
          <span className="text-slate-subtle">·</span>
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm underline text-slate-muted hover:text-red-300"
            disabled={isPending}
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 text-sm text-red-300 bg-red-900/20 border border-red-900/40 rounded-lg p-3">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
