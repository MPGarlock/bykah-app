'use client';

import { useState, useTransition } from 'react';
import { updateFund } from '@/lib/kids-house-fund/actions';
import { FUND_NAME_MAX } from '@/lib/kids-house-fund/types';
import type { Fund } from '@/lib/kids-house-fund/types';

export function EditFundForm({
  fund,
  onCancel,
  onSaved,
}: {
  fund: Fund;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [name, setName] = useState(fund.name);
  const [target, setTarget] = useState(String(fund.target_amount));

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateFund(fund.id, form);
      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }
      onSaved();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-6 md:p-8 bg-gold/[0.04] border border-gold/30"
    >
      <h2 className="font-serif text-lg font-bold text-gold-light mb-4">
        Edit fund
      </h2>
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-7">
          <label className="form-label">Fund name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={FUND_NAME_MAX}
            className="form-input"
            disabled={isPending}
          />
        </div>
        <div className="md:col-span-5">
          <label className="form-label">Target amount ($)</label>
          <input
            type="number"
            name="target_amount"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            step="0.01"
            min="1"
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

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
