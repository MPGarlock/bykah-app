'use client';

import { useState, useMemo, useTransition } from 'react';
import { SUBSCRIPTION_PRESETS, SubscriptionPreset } from '@/lib/subscriptions/presets';
import { setSubscriptionCategory } from '@/lib/budget-tracker/actions';

function foreverNumber(monthly: number): number {
  return Math.round((monthly * 12) / 0.04);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

const CATEGORIES = ['Streaming', 'Music', 'Fitness', 'Productivity', 'News & Other', 'Gaming'];

const CATEGORY_COLORS: Record<string, string> = {
  Streaming: 'text-purple-400',
  Music: 'text-blue-400',
  Fitness: 'text-green-400',
  Productivity: 'text-orange-400',
  'News & Other': 'text-pink-400',
  Gaming: 'text-red-400',
};

export default function SubscriptionToggles({
  addedNames = [],
}: {
  addedNames?: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(() => {
    const addedSet = new Set(addedNames);
    return new Set(
      SUBSCRIPTION_PRESETS.filter((p) => addedSet.has(p.name)).map((p) => p.id),
    );
  });
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  function toggleItem(preset: SubscriptionPreset) {
    const turningOn = !selected.has(preset.id);
    setErrorMsg('');
    setPendingId(preset.id);
    startTransition(async () => {
      const res = await setSubscriptionCategory(preset.name, preset.monthlyAmount, turningOn);
      if (!res.ok) {
        setErrorMsg(res.error);
        setPendingId(null);
        return;
      }
      setSelected((prev) => {
        const next = new Set(prev);
        if (turningOn) {
          next.add(preset.id);
        } else {
          next.delete(preset.id);
        }
        return next;
      });
      setPendingId(null);
    });
  }

  const selectedPresets = useMemo(
    () => SUBSCRIPTION_PRESETS.filter(p => selected.has(p.id)),
    [selected],
  );

  const totalMonthly = selectedPresets.reduce((sum, p) => sum + p.monthlyAmount, 0);
  const totalForever = foreverNumber(totalMonthly);

  const presetsByCategory = useMemo(() => {
    const map: Record<string, SubscriptionPreset[]> = {};
    for (const cat of CATEGORIES) {
      map[cat] = SUBSCRIPTION_PRESETS.filter(p => p.category === cat);
    }
    return map;
  }, []);

  return (
    <div className="mt-10 rounded-2xl border border-white/10 p-6">
      <div className="mb-6">
        <h2 className="font-serif text-2xl text-gold">Common Subscriptions</h2>
        <p className="mt-1 text-sm text-slate-muted">
          Toggle on what you have — each one is added to your Wants budget as a Fixed Bill, and removed the moment you toggle it off.
        </p>
      </div>

      {CATEGORIES.map(cat => (
        <div key={cat} className="mb-6">
          <h3
            className={
              'mb-3 text-xs font-semibold uppercase tracking-widest ' +
              (CATEGORY_COLORS[cat] || 'text-slate-muted')
            }
          >
            {cat}
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {presetsByCategory[cat].map(preset => {
              const on = selected.has(preset.id);
              const busy = isPending && pendingId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => toggleItem(preset)}
                  disabled={busy}
                  className={
                    'flex flex-col items-start rounded-xl border p-3 text-left transition-all duration-150 ' +
                    (on
                      ? 'border-yellow-500 bg-yellow-500/15 text-white'
                      : 'border-white/10 bg-white/5 text-slate-muted hover:border-white/20') +
                    (busy ? ' opacity-60 cursor-wait' : '')
                  }
                >
                  <span className="mb-1 text-xl">{preset.icon}</span>
                  <span
                    className={
                      'text-xs font-medium leading-tight ' +
                      (on ? 'text-white' : 'text-slate-subtle')
                    }
                  >
                    {preset.name}
                  </span>
                  <span
                    className={
                      'mt-1 text-xs ' +
                      (on ? 'text-gold-light' : 'text-slate-muted')
                    }
                  >
                    {busy ? 'Saving…' : '$' + preset.monthlyAmount + '/mo'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {errorMsg && (
        <div className="mt-2 text-sm text-red-300 bg-red-900/20 border border-red-900/40 rounded-lg p-3">
          {errorMsg}
        </div>
      )}

      {selected.size > 0 && (
        <div className="mt-6 rounded-xl border border-yellow-500/30 p-4">
          <div className="space-y-1">
            <p className="text-sm text-slate-muted">
              <span className="font-semibold text-white">
                {selected.size} subscription{selected.size !== 1 ? 's' : ''}
              </span>
              {' in your budget · '}
              <span className="font-semibold text-gold">
                {formatCurrency(totalMonthly)}/mo
              </span>
              {' · '}
              <span className="text-slate-subtle">
                {formatCurrency(totalMonthly * 12)}/yr
              </span>
            </p>
            <p className="text-xs text-slate-muted">
              {'Forever Number impact: '}
              <span className="font-semibold text-gold">
                {formatCurrency(totalForever)}
              </span>
              {' needed to cover these forever'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
