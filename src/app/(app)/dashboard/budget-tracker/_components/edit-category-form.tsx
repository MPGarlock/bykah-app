'use client';

import { useState, useTransition } from 'react';
import { updateCategory } from '@/lib/budget-tracker/actions';
import {
  CATEGORY_NAME_MAX,
  BUCKETS,
  type Bucket,
  type BudgetCategory,
} from '@/lib/budget-tracker/types';

export function EditCategoryForm({
  category,
  onCancel,
  onSaved,
}: {
  category: BudgetCategory;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [name, setName] = useState(category.name);
  const [budget, setBudget] = useState(String(category.monthly_budget));
  const [bucket, setBucket] = useState<Bucket>(category.bucket);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateCategory(category.id, form);
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
        Edit category
      </h2>
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-5">
          <label className="form-label">Category name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
