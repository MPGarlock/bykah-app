'use client';

import { useState, useTransition } from 'react';
import { deleteAccount } from '@/lib/investment-tracker/actions';
import type { InvestmentAccount } from '@/lib/investment-tracker/types';
import { ACCOUNT_TYPE_LABELS } from '@/lib/investment-tracker/types';
import { formatCurrency } from '@/lib/forever-fund/math';
import { EditAccountForm } from './edit-account-form';

function formatUpdatedAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function AccountRow({ account }: { account: InvestmentAccount }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');

  function handleDelete() {
    if (
      !confirm(
        `Delete "${account.name}"? This removes it from your tracker but does not touch the actual account.`,
      )
    ) {
      return;
    }
    setErrorMsg('');
    startTransition(async () => {
      const res = await deleteAccount(account.id);
      if (!res.ok) setErrorMsg(res.error);
    });
  }

  if (editing) {
    return (
      <EditAccountForm
        account={account}
        onCancel={() => setEditing(false)}
        onSaved={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="rounded-xl p-4 md:p-5 bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
      <div className="grid gap-3 md:grid-cols-12 items-center">
        {/* Name + type */}
        <div className="md:col-span-5 min-w-0">
          <p className="font-serif text-lg font-bold text-gold-light truncate">
            {account.name}
          </p>
          <p className="text-xs text-slate-muted">
            {ACCOUNT_TYPE_LABELS[account.account_type]}
            <span className="text-slate-subtle">
              {' · '}updated {formatUpdatedAt(account.updated_at)}
            </span>
          </p>
        </div>

        {/* Balance */}
        <div className="md:col-span-4">
          <p className="text-xs uppercase tracking-widest text-gold mb-1">
            Current balance
          </p>
          <p className="font-serif text-2xl font-bold text-gold-light tabular-nums">
            {formatCurrency(account.current_balance)}
          </p>
        </div>

        {/* Actions */}
        <div className="md:col-span-3 flex md:justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            disabled={isPending}
            className="text-sm underline text-slate-muted hover:text-gold"
          >
            Update
          </button>
          <span className="text-slate-subtle">·</span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-sm underline text-slate-muted hover:text-red-300"
          >
            {isPending ? 'Removing…' : 'Remove'}
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
