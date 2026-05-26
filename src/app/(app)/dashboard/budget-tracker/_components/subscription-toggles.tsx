'use client';

import { useState, useMemo } from 'react';
import { SUBSCRIPTION_PRESETS, SubscriptionPreset } from '@/lib/subscriptions/presets';

// Forever Number multiplier: monthly cost * 12 / 0.04 (4% rule, 25x annual)
function foreverNumber(monthly: number): number {
  return Math.round((monthly * 12) / 0.04);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
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

export default function SubscriptionToggles() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState(false);

  function toggleItem(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setAdded(false);
  }

  const selectedPresets = useMemo(
    () => SUBSCRIPTION_PRESETS.filter(p => selected.has(p.id)),
    [selected]
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

  function handleAddAll() {
    setAdded(true);
  }

  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/3 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-serif text-2xl text-gold">Common Subscriptions</h2>
        <p className="mt-1 text-sm text-slate-muted">
          Toggle on what you have — see the Forever Number impact instantly.
        </p>
      </div>

      {/* Category sections */}
      {CATEGORIES.map(cat => (
        <div key={cat} className="mb-6">
          <h3 className={"mb-3 text-xs font-semibold uppercase tracking-widest " + (CATEGORY_COLORS[cat] || 'text-slate-muted')}>
            {cat}
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {presetsByCategory[cat].map(preset => {
              const on = selected.has(preset.id);
              return (
                <button
                  key={preset.id}
                  onClick={() => toggleItem(preset.id)}
                  className={
                    'flex flex-col items-start rounded-xl border p-3 text-left transition-all duration-150 ' +

import { useState, useMemo } from 'react';
import { SUBSCRIPTION_PRESETS, SubscriptionPreset } from '@/lib/subscriptions/presets';

// Forever Number multiplier: monthly cost * 12 / 0.04 (4% rule, 25x annual)
function foreverNumber(monthly: number): number {
  return Math.round((monthly * 12) / 0.04);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
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

export default function SubscriptionToggles() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState(false);

  function toggleItem(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setAdded(false);
  }

  const selectedPresets = useMemo(
    () => SUBSCRIPTION_PRESETS.filter(p => selected.has(p.id)),
    [selected]
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

  function handleAddAll() {
    setAdded(true);
  }

  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/3 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-serif text-2xl text-gold">Common Subscriptions</h2>
        <p className="mt-1 text-sm text-slate-muted">
          Toggle on what you have — see the Forever Number impact instantly.
        </p>
      </div>

      {/* Category sections */}
      {CATEGORIES.map(cat => (
        <div key={cat} className="mb-6">
          <h3 className={"mb-3 text-xs font-semibold uppercase tracking-widest " + (CATEGORY_COLORS[cat] || 'text-slate-muted')}>
            {cat}
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {presetsByCategory[cat].map(preset => {
              const on = selected.has(preset.id);
              return (
                <button
                  key={preset.id}
                  onClick={() => toggleItem(preset.id)}
                  className={
                    'flex flex-col items-start rounded-xl border p-3 text-left transition-all duration-150 ' +
                    (on
                      ? 'border-yellow-500 bg-yellow-500/15 text-white'
                      : 'border-white/10 bg-white/5 text-slate-muted hover:border-white/20 hover:bg-white/8')
                  }
                >
                  <span className="mb-1 text-xl">{preset.icon}</span>
                  <span className={"text-xs font-medium leading-tight " + (on ? 'text-white' : 'text-slate-subtle')}>
                    {preset.name}
                  </span>
                  <span className={"mt-1 text-xs " + (on ? 'text-gold-light' : 'text-slate-muted')}>
                    {'$' + preset.monthlyAmount + '/mo'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Footer summary */}
      {selected.size > 0 && (
        <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/8 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-slate-muted">
                <span className="font-semibold text-white">{selected.size} subscription{selected.size !== 1 ? 's' : ''}</span>
                {' selected · '}
                <span className="font-semibold text-gold">{formatCurrency(totalMonthly)}/mo</span>
                {' · '}
                <span className="text-slate-subtle">{formatCurrency(totalMonthly * 12)}/yr</span>
              </p>
              <p className="text-xs text-slate-muted">
                {'Forever Number impact: '}
                <span className="font-semibold text-gold">{formatCurrency(totalForever)}</span>
                <span className="text-slate-muted"> needed to cover these forever</span>
              </p>
            </div>
            <button
              onClick={handleAddAll}
              className={
                'shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-all ' +
                (added
                  ? 'bg-green-600/30 text-green-400 cursor-default'
                  : 'bg-gold text-slate-900 hover:bg-gold-light')
              }
            >
              {added ? '✓ Added to budget' : 'Add all selected to your budget →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
