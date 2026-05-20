'use client';

import { useState, useTransition } from 'react';
import { createCategory } from '@/lib/budget-tracker/actions';
import {
  CATEGORY_NAME_MAX,
  BUCKETS,
  type Bucket,
} from '@/lib/budget-tracker/types';

export function CreateCategoryForm({
  defaultBucket = 'needs',
}: {
  defaultBucket?: Bucket;
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [bucket, setBucket] = useState<Bucket>(defaultBucket);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createCategory(form);
      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }
      setName('');
      setBudget('');
      setBucket(defaultBucket);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-5 md:p-6 bg-white/[0.03] border border-white/[0.08]"
    >
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-5">
          <label className="form-label">Category name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Groceries, Restaurants, Gas, Entertainment..."
            required
            maxLength={CATEGORY_NAME_MAX}
            className="form-input"
            disabled={isPending}
          />
        </div>
        <div className="md:col-span-4">
          <label className="form-label">Bucket</label>
          <select
            name="bucket"
            value={bucket}
            onChange={(e) => setBucket(e.target.value as Bucket)}
            className="form-input"
            disabled={isPending}
          >
            {BUCKETS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="form-label">Monthly budget ($)</label>
          <input
            type="number"
            name="monthly_budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="500"
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
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? 'Adding…' : 'Add category →'}
        </button>
      </div>
    </form>
  );
}
