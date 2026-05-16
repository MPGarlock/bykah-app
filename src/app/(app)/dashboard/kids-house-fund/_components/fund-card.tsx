'use client';

import { useState, useTransition } from 'react';
import type { FundWithStats } from '@/lib/kids-house-fund/types';
import { deleteFund } from '@/lib/kids-house-fund/actions';
import { formatCurrency } from '@/lib/forever-fund/math';
import { AddContributionForm } from './add-contribution-form';
import { ContributionRow } from './contribution-row';
import { EditFundForm } from './edit-fund-form';

const INITIAL_VISIBLE = 5;

export function FundCard({ fund }: { fund: FundWithStats }) {
  const [editing, setEditing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');

  const visibleContributions = showAll
    ? fund.contributions
    : fund.contributions.slice(0, INITIAL_VISIBLE);

  function handleDelete() {
    if (
      !confirm(
        `Delete fund "${fund.name}" and all its contributions? This cannot be undone.`,
      )
    ) {
      return;
    }
    setErrorMsg('');
    startTransition(async () => {
      const res = await deleteFund(fund.id);
      if (!res.ok) setErrorMsg(res.error);
    });
  }

  if (editing) {
    return (
      <EditFundForm
        fund={fund}
        onCancel={() => setEditing(false)}
        onSaved={() => setEditing(false)}
      />
    );
  }

  const goalReached = fund.balance >= fund.target_amount;

  return (
    <div className="rounded-2xl p-6 md:p-8 bg-white/[0.03] border border-white/[0.08]">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-gold-light truncate">
            {fund.name}
          </h2>
          <p className="text-xs text-slate-muted mt-1">
            Target: {formatCurrency(fund.target_amount)}
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

      {/* Balance + progress */}
      <div className="mb-6">
        <div className="font-serif text-4xl md:text-6xl font-bold text-gold-light tabular-nums mb-3">
          {formatCurrency(fund.balance)}
        </div>
        <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gold/70 transition-all"
            style={{ width: `${fund.progressPct}%` }}
          />
        </div>
        <p className="text-sm text-slate-muted">
          {fund.progressPct.toFixed(1)}% of goal
          {fund.monthsToGoal !== null && (
            <>
              {' · '}
              <span className="text-slate-subtle">
                ~{fund.monthsToGoal}{' '}
                {fund.monthsToGoal === 1 ? 'month' : 'months'} to go at current
                pace
              </span>
            </>
          )}
          {goalReached && (
            <span className="text-gold ml-2">· Goal reached!</span>
          )}
        </p>
      </div>

      {/* Add contribution form */}
      <div className="mb-6">
        <AddContributionForm fundId={fund.id} />
      </div>

      {/* Contributions list */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-xs uppercase tracking-widest text-gold font-bold">
            Recent contributions
          </h3>
          <p className="text-xs text-slate-subtle">
            {fund.contributions.length}{' '}
            {fund.contributions.length === 1 ? 'contribution' : 'contributions'}
          </p>
        </div>

        {fund.contributions.length === 0 ? (
          <p className="text-sm text-slate-muted py-4 text-center">
            No contributions yet. Log your first one above.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {visibleContributions.map((c) => (
                <ContributionRow key={c.id} contribution={c} />
              ))}
            </div>
            {fund.contributions.length > INITIAL_VISIBLE && (
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="mt-3 text-xs uppercase tracking-widest underline text-slate-muted hover:text-gold"
              >
                {showAll
                  ? 'Show recent only'
                  : `See all ${fund.contributions.length}`}
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
