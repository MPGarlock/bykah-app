'use client';

import { useState, useTransition } from 'react';
import { createAccount } from '@/lib/investment-tracker/actions';
import {
  ACCOUNT_NAME_MAX,
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_LABELS,
} from '@/lib/investment-tracker/types';
import type { AccountType } from '@/lib/investment-tracker/types';

export function CreateAccountForm() {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('brokerage');
  const [balance, setBalance] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createAccount(form);
      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }
      setName('');
      setAccountType('brokerage');
      setBalance('');
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-5 md:p-6 bg-white/[0.03] border border-white/[0.08]"
    >
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-5">
          <label className="form-label">Account name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vanguard 401(k), Fidelity Brokerage..."
            required
            maxLength={ACCOUNT_NAME_MAX}
            className="form-input"
            disabled={isPending}
          />
        </div>
        <div className="md:col-span-4">
          <label className="form-label">Type</label>
          <select
            name="account_type"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as AccountType)}
            className="form-input"
            disabled={isPending}
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACCOUNT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="form-label">Current balance ($)</label>
          <input
            type="number"
            name="current_balance"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="0"
            step="0.01"
            min="0"
            required
            className="form-input"
            disabled={isPending}
          />
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
          {isPending ? 'Adding…' : 'Add account →'}
        </button>
      </div>
    </form>
  );
}
