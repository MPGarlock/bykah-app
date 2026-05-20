'use client';

import { useState, useTransition } from 'react';
import {
  deleteTransaction,
  updateTransaction,
} from '@/lib/budget-tracker/actions';
import {
  NOTE_MAX,
  type BudgetTransaction,
} from '@/lib/budget-tracker/types';
import { formatCurrencyDetailed } from '@/lib/forever-fund/math';

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function TransactionRow({
  transaction,
}: {
  transaction: BudgetTransaction;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');

  const [amount, setAmount] = useState(String(transaction.amount));
  const [note, setNote] = useState(transaction.note ?? '');
  const [date, setDate] = useState(transaction.transacted_at);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateTransaction(transaction.id, form);
      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }
      setEditing(false);
    });
  }

  function handleDelete() {
    if (
      !confirm(
        `Delete this transaction of ${formatCurrencyDetailed(transaction.amount)}?`,
      )
    ) {
      return;
    }
    setErrorMsg('');
    startTransition(async () => {
      const res = await deleteTransaction(transaction.id);
      if (!res.ok) setErrorMsg(res.error);
    });
  }

  function handleCancel() {
    setAmount(String(transaction.amount));
    setNote(transaction.note ?? '');
    setDate(transaction.transacted_at);
    setErrorMsg('');
    setEditing(false);
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        className="rounded-lg p-3 bg-gold/[0.04] border border-gold/30"
      >
        <div className="grid gap-2 md:grid-cols-12">
          <div className="md:col-span-3">
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
          <div className="md:col-span-3">
            <input
              type="date"
              name="transacted_at"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="form-input"
              disabled={isPending}
            />
          </div>
          <div className="md:col-span-6">
            <input
              type="text"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={NOTE_MAX}
              placeholder="Note (optional)"
              className="form-input"
              disabled={isPending}
            />
          </div>
        </div>

        {errorMsg && (
          <div className="mt-2 text-xs text-red-300 bg-red-900/20 border border-red-900/40 rounded p-2">
            {errorMsg}
          </div>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="text-xs uppercase tracking-widest underline text-slate-muted hover:text-gold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="text-xs uppercase tracking-widest underline text-gold hover:text-gold-light"
          >
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-lg p-3 bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gold-light tabular-nums">
            {formatCurrencyDetailed(transaction.amount)}
          </p>
          <p className="text-xs text-slate-muted truncate">
            {formatDate(transaction.transacted_at)}
            {transaction.note && (
              <>
                {' · '}
                <span className="text-slate-subtle">{transaction.note}</span>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setEditing(true)}
            disabled={isPending}
            className="text-xs uppercase tracking-widest underline text-slate-muted hover:text-gold"
          >
            Edit
          </button>
          <span className="text-slate-subtle">·</span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs uppercase tracking-widest underline text-slate-muted hover:text-red-300"
          >
            {isPending ? '…' : 'Delete'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-2 text-xs text-red-300 bg-red-900/20 border border-red-900/40 rounded p-2">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
