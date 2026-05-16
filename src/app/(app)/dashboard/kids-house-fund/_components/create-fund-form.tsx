'use client';

import { useState, useTransition } from 'react';
import { createFund } from '@/lib/kids-house-fund/actions';
import { FUND_NAME_MAX } from '@/lib/kids-house-fund/types';

export function CreateFundForm() {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createFund(form);
      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }
      setName('');
      setTarget('');
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-5 md:p-6 bg-white/[0.03] border border-white/[0.08]"
    >
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-7">
          <label className="form-label">Fund name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kids House Fund, Sophia's house, ..."
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
            placeholder="350000"
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

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary"
        >
          {isPending ? 'Creating…' : 'Create fund →'}
        </button>
      </div>
    </form>
  );
}
