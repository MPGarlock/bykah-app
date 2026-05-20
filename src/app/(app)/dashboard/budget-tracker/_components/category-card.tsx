'use client';

import { useState, useTransition } from 'react';
import {
  BUCKET_LABEL,
  type CategoryWithStats,
} from '@/lib/budget-tracker/types';
import { deleteCategory } from '@/lib/budget-tracker/actions';
import { formatCurrency } from '@/lib/forever-fund/math';
import { AddTransactionForm } from './add-transaction-form';
import { TransactionRow } from './transaction-row';
import { EditCategoryForm } from './edit-category-form';

const INITIAL_VISIBLE = 5;

export function CategoryCard({ category }: { category: CategoryWithStats }) {
  const [editing, setEditing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');

  const visibleTx = showAll
    ? category.transactions
    : category.transactions.slice(0, INITIAL_VISIBLE);

  function handleDelete() {
    if (
      !confirm(
        `Delete category "${category.name}" and all its transactions? This cannot be undone.`,
      )
    ) {
      return;
    }
    setErrorMsg('');
    startTransition(async () => {
      const res = await deleteCategory(category.id);
      if (!res.ok) setErrorMsg(res.error);
    });
  }

  if (editing) {
    return (
      <EditCategoryForm
        category={category}
        onCancel={() => setEditing(false)}
        onSaved={() => setEditing(false)}
      />
    );
  }

  const overBudget = category.spentThisMonth > Number(category.monthly_budget) && Number(category.monthly_budget) > 0;
  const progressColor = overBudget ? 'bg-red-400/70' : 'bg-gold/70';

  return (
    <div className="rounded-2xl p-6 md:p-8 bg-white/[0.03] border border-white/[0.08]">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-gold-light truncate">
              {category.name}
            </h2>
            <span className="text-[10px] uppercase tracking-widest text-gold border border-gold/30 rounded-full px-2 py-0.5">
              {BUCKET_LABEL[category.bucket]}
            </span>
          </div>
          <p className="text-xs text-slate-muted mt-1">
            Budget: {formatCurrency(category.monthly_budget)}/mo
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

      {/* Spent + progress */}
      <div className="mb-6">
        <div className="font-serif text-4xl md:text-6xl font-bold text-gold-light tabular-nums mb-3">
          {formatCurrency(category.spentThisMonth)}
        </div>
        <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-2">
          <div
            className={`h-full ${progressColor} transition-all`}
            style={{ width: `${category.progressPct}%` }}
          />
        </div>
        <p className="text-sm text-slate-muted">
          {category.progressPct.toFixed(1)}% of budget
          {!overBudget && Number(category.monthly_budget) > 0 && (
            <>
              {' · '}
              <span className="text-slate-subtle">
                {formatCurrency(category.remainingThisMonth)} left this month
              </span>
            </>
          )}
          {overBudget && (
            <span className="text-red-300 ml-2">
              · {formatCurrency(category.spentThisMonth - Number(category.monthly_budget))} over
            </span>
          )}
        </p>
      </div>

      {/* Add transaction form */}
      <div className="mb-6">
        <AddTransactionForm categoryId={category.id} />
      </div>

      {/* Transactions list */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-xs uppercase tracking-widest text-gold font-bold">
            This month
          </h3>
          <p className="text-xs text-slate-subtle">
            {category.transactions.length}{' '}
            {category.transactions.length === 1 ? 'transaction' : 'transactions'}
          </p>
        </div>

        {category.transactions.length === 0 ? (
          <p className="text-sm text-slate-muted py-4 text-center">
            No transactions this month yet. Log your first above.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {visibleTx.map((t) => (
                <TransactionRow key={t.id} transaction={t} />
              ))}
            </div>
            {category.transactions.length > INITIAL_VISIBLE && (
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="mt-3 text-xs uppercase tracking-widest underline text-slate-muted hover:text-gold"
              >
                {showAll
                  ? 'Show recent only'
                  : `See all ${category.transactions.length}`}
              </button>
            )}
          </>
        )}
      </div>

      {errorMsg && (
        <div className="mt-4 text-sm text-red-300 bg-red-900/20 border border-red-900/40 rounded-lg p-3">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
