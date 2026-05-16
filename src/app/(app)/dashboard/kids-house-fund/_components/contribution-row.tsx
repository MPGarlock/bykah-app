'use client';

import { useState, useTransition } from 'react';
import {
  deleteContribution,
  updateContribution,
} from '@/lib/kids-house-fund/actions';
import type { Contribution } from '@/lib/kids-house-fund/types';
import { NOTE_MAX } from '@/lib/kids-house-fund/types';
import { formatCurrencyDetailed } from '@/lib/forever-fund/math';

function formatDate(iso: string): string {
  // Parse YYYY-MM-DD as local date (avoid UTC shift)
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ContributionRow({
  contribution,
}: {
  contribution: Contribution;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');

  const [amount, setAmount] = useState(String(contribution.amount));
  const [note, setNote] = useState(contribution.note ?? '');
  const [date, setDate] = useState(contribution.contributed_at);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateContribution(contribution.id, form);
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
        `Delete this contribution of ${formatCurrencyDetailed(contribution.amount)}?`,
      )
    ) {
      return;
    }
    setErrorMsg('');
    startTransition(async () => {
      const res = await deleteContribution(contribution.id);
      if (!res.ok) setErrorMsg(res.error);
    });
  }

  function handleCancel() {
    setAmount(String(contribution.amount));
    setNote(contribution.note ?? '');
    setDate(contribution.contributed_at);
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
              name="contributed_at"
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
            {formatCurrencyDetailed(contribution.amount)}
          </p>
          <p className="text-xs text-slate-muted truncate">
            {formatDate(contribution.contributed_at)}
            {contribution.note && (
              <>
                {' · '}
                <span className="text-slate-subtle">{contribution.note}</span>
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
