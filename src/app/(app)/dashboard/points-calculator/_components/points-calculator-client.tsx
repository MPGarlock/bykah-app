'use client';

import { useState, useMemo } from 'react';

const DOMESTIC_PER_PERSON = 25000;
const INTERNATIONAL_PER_PERSON = 60000;

function formatNum(n: number) {
  return n.toLocaleString('en-US');
}

interface SpendInputProps {
  label: string;
  card: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
  multiplier: number;
}

function SpendInput({ label, card, value, onChange, max, multiplier }: SpendInputProps) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-sm font-medium text-slate-subtle">{label}</label>
        <span className="text-sm font-bold text-gold-light">${formatNum(value)}/mo</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={25}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-yellow-500"
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-muted">$0</span>
        <span className="text-xs text-gold">{multiplier}x pts · {card}</span>
        <span className="text-xs text-slate-muted">${formatNum(max)}</span>
      </div>
    </div>
  );
}
export function PointsCalculatorClient() {
  const [groceries, setGroceries] = useState(800);
  const [dining, setDining] = useState(400);
  const [travel, setTravel] = useState(200);
  const [gas, setGas] = useState(200);
  const [other, setOther] = useState(300);
  const [familySize, setFamilySize] = useState(4);

  const { monthlyPoints, domesticMonths, internationalMonths, domesticGoal, internationalGoal } = useMemo(() => {
    const pts =
      groceries * 4 +
      dining * 4 +
      travel * 3 +
      gas * 2 +
      other * 2;

    const domGoal = DOMESTIC_PER_PERSON * familySize;
    const intlGoal = INTERNATIONAL_PER_PERSON * familySize;

    return {
      monthlyPoints: pts,
      domesticGoal: domGoal,
      internationalGoal: intlGoal,
      domesticMonths: pts > 0 ? Math.ceil(domGoal / pts) : 0,
      internationalMonths: pts > 0 ? Math.ceil(intlGoal / pts) : 0,
    };
  }, [groceries, dining, travel, gas, other, familySize]);

  const domProgress = Math.min(100, monthlyPoints > 0 ? (monthlyPoints / domesticGoal) * 100 : 0);
  const intlProgress = Math.min(100, monthlyPoints > 0 ? (monthlyPoints / internationalGoal) * 100 : 0);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30 space-y-6">
        <p className="text-xs font-bold tracking-widest uppercase text-gold">Monthly Spending</p>
        <SpendInput label="Groceries" card="Amex Gold" value={groceries} onChange={setGroceries} max={2000} multiplier={4} />
        <SpendInput label="Dining" card="Amex Gold" value={dining} onChange={setDining} max={1500} multiplier={4} />
        <SpendInput label="Travel (flights, hotels)" card="Chase Sapphire" value={travel} onChange={setTravel} max={2000} multiplier={3} />
        <SpendInput label="Gas" card="Capital One Venture" value={gas} onChange={setGas} max={600} multiplier={2} />
        <SpendInput label="Everything Else" card="Capital One Venture" value={other} onChange={setOther} max={2000} multiplier={2} />
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-slate-subtle">Family Size</label>
            <span className="text-sm font-bold text-gold-light">{familySize} {familySize === 1 ? 'person' : 'people'}</span>
          </div>
          <input
            type="range"
            min={1}
            max={6}
            step={1}
            value={familySize}
            onChange={e => setFamilySize(Number(e.target.value))}
            className="w-full accent-yellow-500"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-muted">1</span>
            <span className="text-xs text-slate-muted">6</span>
          </div>
        </div>
      </div>
      {/* Monthly Points */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30">
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">Points Earned Per Month</p>
        <p className="font-serif text-4xl font-bold text-gold-light">{formatNum(monthlyPoints)}</p>
        <p className="text-sm text-slate-muted mt-1">across all 3 cards</p>
      </div>

      {/* Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-6 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Domestic Round Trip</p>
          <p className="text-sm text-slate-muted mb-1">Family of {familySize} · {formatNum(domesticGoal)} pts needed</p>
          <p className="font-serif text-3xl font-bold text-gold-light mb-3">
            {domesticMonths === 0 ? '—' : domesticMonths + (domesticMonths === 1 ? ' mo' : ' mos')}
          </p>
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-gold/70 rounded-full transition-all" style={{ width: String(Math.round(domProgress)) + '%' }} />
          </div>
          <p className="text-xs text-slate-muted mt-1">~25k pts/person (economy)</p>
        </div>
        <div className="rounded-2xl p-6 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">International Round Trip</p>
          <p className="text-sm text-slate-muted mb-1">Family of {familySize} · {formatNum(internationalGoal)} pts needed</p>
          <p className="font-serif text-3xl font-bold text-gold-light mb-3">
            {internationalMonths === 0 ? '—' : internationalMonths + (internationalMonths === 1 ? ' mo' : ' mos')}
          </p>
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-gold/70 rounded-full transition-all" style={{ width: String(Math.round(intlProgress)) + '%' }} />
          </div>
          <p className="text-xs text-slate-muted mt-1">~60k pts/person (economy)</p>
        </div>
      </div>
      {/* Card Strategy */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30">
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-4">Card Strategy — What to Swipe</p>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0 bg-yellow-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gold-light">Amex Gold</p>
              <p className="text-xs text-slate-muted">Groceries &amp; Dining</p>
            </div>
            <span className="text-xs font-bold text-gold">4x points</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0 bg-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gold-light">Chase Sapphire Preferred</p>
              <p className="text-xs text-slate-muted">Travel (flights, hotels)</p>
            </div>
            <span className="text-xs font-bold text-gold">3x points</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0 bg-red-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gold-light">Capital One Venture</p>
              <p className="text-xs text-slate-muted">Gas &amp; Everything Else</p>
            </div>
            <span className="text-xs font-bold text-gold">2x points</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-subtle text-center">
        Point estimates are approximate. Actual award costs vary by airline, route, and availability.
      </p>
    </div>
  );
}
