'use client';

import { useState, useTransition } from 'react';
import { createCategory } from '@/lib/budget-tracker/actions';
import {
  CATEGORY_NAME_MAX,
  BUCKETS,
  ITEM_TYPES,
  DUE_DAY_MIN,
  DUE_DAY_MAX,
  type Bucket,
  type ItemType,
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
  const [itemType, setItemType] = useState<ItemType>('bucket');
  const [dueDay, setDueDay] = useState('');

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
      setItemType('bucket');
      setDueDay('');
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-5 md:p-6 bg-white/[0.03] border border-white/[0.08]"
    >
      <div className="mb-4">
        <label className="form-label">Type</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {ITEM_TYPES.map((t) => (
            <label
              key={t.value}
              className={`cursor-pointer rounded-lg border p-3 text-sm transition-colors ${
                itemType === t.value
                  ? 'border-emerald-400/60 bg-emerald-400/10'
                  : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <input
                type="radio"
                name="item_type"
                value={t.value}
                checked={itemType === t.value}
                onChange={() => setItemType(t.value)}
                disabled={isPending}
                className="sr-only"
              />
              <div className="font-medium">{t.label}</div>
              <div className="text-xs text-white/50 mt-0.5">{t.blurb}</div>
            </label>
          ))}
        </div>
      </div>

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
          <label className="form-label">
            {itemType === 'fixed_bill' ? 'Bill amount ($)' : 'Monthly budget ($)'}
          </label>
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

      {itemType === 'fixed_bill' && (
        <div className="mt-4 grid gap-4 md:grid-cols-12">
          <div className="md:col-span-3">
            <label className="form-label">Due day of month (optional)</label>
            <input
              type="number"
              name="due_day"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              placeholder="1"
              min={DUE_DAY_MIN}
              max={DUE_DAY_MAX}
              className="form-input"
              disabled={isPending}
            />
          </div>
        </div>
      )}

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
