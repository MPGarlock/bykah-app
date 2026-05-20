'use client';

import { useState, useTransition } from 'react';
import { updateBudgetSettings } from '@/lib/budget-tracker/actions';
import { formatCurrency } from '@/lib/forever-fund/math';
import type { BudgetSettings } from '@/lib/budget-tracker/types';
import {
  DEFAULT_NEEDS_PCT,
  DEFAULT_WANTS_PCT,
  DEFAULT_INVESTMENTS_PCT,
} from '@/lib/budget-tracker/types';

export function BudgetSettingsForm({
  settings,
}: {
  settings: Pick<
    BudgetSettings,
    'monthly_income' | 'needs_pct' | 'wants_pct' | 'investments_pct'
  > | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  const [income, setIncome] = useState(
    settings && settings.monthly_income > 0
      ? String(settings.monthly_income)
      : '',
  );
  const [needs, setNeeds] = useState(
    String(settings?.needs_pct ?? DEFAULT_NEEDS_PCT),
  );
  const [wants, setWants] = useState(
    String(settings?.wants_pct ?? DEFAULT_WANTS_PCT),
  );
  const [investments, setInvestments] = useState(
    String(settings?.investments_pct ?? DEFAULT_INVESTMENTS_PCT),
  );

  const nNeeds = Number(needs) || 0;
  const nWants = Number(wants) || 0;
  const nInvestments = Number(investments) || 0;
  const sum = nNeeds + nWants + nInvestments;
  const sumValid = sum === 100;
  const nIncome = Number(income) || 0;

  function resetToDefault() {
    setNeeds(String(DEFAULT_NEEDS_PCT));
    setWants(String(DEFAULT_WANTS_PCT));
    setInvestments(String(DEFAULT_INVESTMENTS_PCT));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    setSavedMsg('');
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateBudgetSettings(form);
      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }
      setSavedMsg('Saved.');
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-6 md:p-8 bg-white/[0.03] border border-white/[0.08]"
    >
      <h2 className="font-serif text-xl font-bold text-gold-light mb-1">
        Your income &amp; targets
      </h2>
      <p className="text-sm text-slate-muted mb-5">
        Enter your post-tax monthly income. The 50/30/20 guideline splits it
        into Needs, Wants, and Investments — adjust the percentages if you like
        (they must add up to 100).
      </p>

      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-4">
          <label className="form-label">Post-tax monthly income ($)</label>
          <input
            type="number"
            name="monthly_income"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="5000"
            step="0.01"
            min="0"
            required
            className="form-input"
            disabled={isPending}
          />
        </div>
        <div className="md:col-span-2">
          <label className="form-label">Needs %</label>
          <input
            type="number"
            name="needs_pct"
            value={needs}
            onChange={(e) => setNeeds(e.target.value)}
            step="1"
            min="0"
            max="100"
            required
            className="form-input"
            disabled={isPending}
          />
        </div>
        <div className="md:col-span-2">
          <label className="form-label">Wants %</label>
          <input
            type="number"
            name="wants_pct"
            value={wants}
            onChange={(e) => setWants(e.target.value)}
            step="1"
            min="0"
            max="100"
            required
            className="form-input"
            disabled={isPending}
          />
        </div>
        <div className="md:col-span-2">
          <label className="form-label">Investments %</label>
          <input
            type="number"
            name="investments_pct"
            value={investments}
            onChange={(e) => setInvestments(e.target.value)}
            step="1"
            min="0"
            max="100"
            required
            className="form-input"
            disabled={isPending}
          />
        </div>
        <div className="md:col-span-2 flex items-end">
          <p
            className={`text-sm tabular-nums ${sumValid ? 'text-slate-muted' : 'text-red-300'}`}
          >
            Total: {sum}%
          </p>
        </div>
      </div>

      {/* Live target preview */}
      {nIncome > 0 && sumValid && (
        <p className="mt-4 text-sm text-slate-muted">
          That&apos;s{' '}
          <span className="text-gold-light">
            {formatCurrency((nIncome * nNeeds) / 100)}
          </span>{' '}
          needs ·{' '}
          <span className="text-gold-light">
            {formatCurrency((nIncome * nWants) / 100)}
          </span>{' '}
          wants ·{' '}
          <span className="text-gold-light">
            {formatCurrency((nIncome * nInvestments) / 100)}
          </span>{' '}
          investments per month.
        </p>
      )}

      {errorMsg && (
        <div className="mt-4 text-sm text-red-300 bg-red-900/20 border border-red-900/40 rounded-lg p-3">
          {errorMsg}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={resetToDefault}
          disabled={isPending}
          className="text-xs uppercase tracking-widest underline text-slate-muted hover:text-gold"
        >
          Reset to 50/30/20
        </button>
        <div className="flex items-center gap-4">
          {savedMsg && <span className="text-sm text-gold-light">{savedMsg}</span>}
          <button
            type="submit"
            disabled={isPending || !sumValid}
            className="btn-primary"
          >
            {isPending ? 'Saving…' : 'Save plan'}
          </button>
        </div>
      </div>
    </form>
  );
}
