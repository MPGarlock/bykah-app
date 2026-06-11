'use client';

import { useMemo, useRef, useState } from 'react';
import {
  calculateRetirementGoal,
  formatCurrency,
  totalDropOffAmount,
  DEFAULT_INFLATION_RATE,
  DEFAULT_EXPECTED_RETURN,
  MIN_EXPECTED_RETURN,
  MAX_EXPECTED_RETURN,
  type DropOffItem,
} from '@/lib/retirement/calculator-math';

interface Props {
  /** Default monthly "Needs" spend, pulled from the Budget Tracker's 50/30/20 plan if available. */
  defaultNeeds?: number;
  /** Default monthly "Wants" spend, pulled from the Budget Tracker's 50/30/20 plan if available. */
  defaultWants?: number;
  /** Default current retirement savings balance, pulled from the Investment Tracker if available. */
  defaultCurrentSavings?: number;
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-left"
    >
      <span
        className={
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ' +
          (checked ? 'bg-gold' : 'bg-white/[0.12]')
        }
      >
        <span
          className={
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform ' +
            (checked ? 'translate-x-6' : 'translate-x-1')
          }
        />
      </span>
      <span className="text-sm font-medium text-slate-text">{label}</span>
    </button>
  );
}

export function RetirementCalculator({
  defaultNeeds = 0,
  defaultWants = 0,
  defaultCurrentSavings = 0,
}: Props) {
  // Step 1 inputs — current spending
  const [needs, setNeeds] = useState(defaultNeeds);
  const [wants, setWants] = useState(defaultWants);

  // Step 2 inputs — housing
  const [housePaidOff, setHousePaidOff] = useState(false);
  const [mortgagePI, setMortgagePI] = useState(0);
  const [propTaxInsMaint, setPropTaxInsMaint] = useState(0);

  // Step 3 inputs — drop-off line items
  const nextId = useRef(0);
  const [dropOffItems, setDropOffItems] = useState<DropOffItem[]>([]);

  function addDropOffItem() {
    nextId.current += 1;
    setDropOffItems((items) => [
      ...items,
      { id: `item-${nextId.current}`, label: '', amount: 0 },
    ]);
  }

  function updateDropOffItem(id: string, field: 'label' | 'amount', value: string) {
    setDropOffItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, [field]: field === 'amount' ? Number(value) || 0 : value }
          : item,
      ),
    );
  }

  function removeDropOffItem(id: string) {
    setDropOffItems((items) => items.filter((item) => item.id !== id));
  }

  // Step 4 inputs — timeline & assumptions
  const [yearsToRetirement, setYearsToRetirement] = useState(25);
  const [inflationRate, setInflationRate] = useState(DEFAULT_INFLATION_RATE);
  const [currentSavings, setCurrentSavings] = useState(defaultCurrentSavings);
  const [monthlySocialSecurity, setMonthlySocialSecurity] = useState(0);
  const [expectedReturn, setExpectedReturn] = useState(DEFAULT_EXPECTED_RETURN);

  const result = useMemo(
    () =>
      calculateRetirementGoal({
        currentNeeds: needs,
        retirementWants: wants,
        housePaidOff,
        mortgagePI,
        propertyTaxInsuranceMaintenance: propTaxInsMaint,
        dropOffItems,
        yearsToRetirement,
        inflationRate,
        currentSavings,
        monthlySocialSecurity,
        expectedReturn,
      }),
    [
      needs,
      wants,
      housePaidOff,
      mortgagePI,
      propTaxInsMaint,
      dropOffItems,
      yearsToRetirement,
      inflationRate,
      currentSavings,
      monthlySocialSecurity,
      expectedReturn,
    ],
  );

  const dropOffTotal = totalDropOffAmount(dropOffItems);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-gold/[0.06] to-white/[0.01] border border-gold/30">
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
          Find Your Number
        </p>
        <h2 className="font-serif text-xl md:text-2xl font-bold text-gold-light mb-2">
          Modified 50/30/20 + the 4% Rule
        </h2>
        <p className="text-sm text-slate-muted max-w-2xl">
          Start from your current Needs and Wants spending, adjust for how your budget will
          change in retirement, and we&apos;ll inflate it to your retirement date and apply
          the 4% rule to find your nest egg target — plus the monthly investment needed to
          get there.
        </p>
      </div>

      {/* Step 1: Current spending */}
      <div className="rounded-2xl p-6 md:p-8 bg-white/[0.03] border border-white/[0.08]">
        <h3 className="font-serif text-lg font-bold text-gold-light mb-1">
          Your monthly spending
        </h3>
        <p className="text-sm text-slate-muted mb-5">
          We pulled these from your Budget Tracker&apos;s 50/30/20 plan where available —
          adjust them to reflect your retirement lifestyle.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="form-label">Monthly &ldquo;Needs&rdquo; spending ($)</label>
            <input
              type="number"
              value={needs || ''}
              onChange={(e) => setNeeds(Number(e.target.value) || 0)}
              placeholder="2500"
              step="50"
              min="0"
              className="form-input"
            />
            <p className="mt-1 text-xs text-slate-subtle">Housing, groceries, utilities, transport, insurance.</p>
          </div>
          <div>
            <label className="form-label">Monthly &ldquo;Wants&rdquo; spending in retirement ($)</label>
            <input
              type="number"
              value={wants || ''}
              onChange={(e) => setWants(Number(e.target.value) || 0)}
              placeholder="1500"
              step="50"
              min="0"
              className="form-input"
            />
            <p className="mt-1 text-xs text-slate-subtle">
              Defaults to your current Wants — lower this if you expect to spend less on
              lifestyle in retirement.
            </p>
          </div>
        </div>
      </div>

      {/* Step 2: Housing */}
      <div className="rounded-2xl p-6 md:p-8 bg-white/[0.03] border border-white/[0.08]">
        <h3 className="font-serif text-lg font-bold text-gold-light mb-1">
          Housing in retirement
        </h3>
        <p className="text-sm text-slate-muted mb-5">
          If your mortgage will be paid off before you retire, we&apos;ll remove the
          principal &amp; interest portion from your Needs. Property taxes, insurance, and
          maintenance stick around either way.
        </p>
        <div className="mb-4">
          <ToggleSwitch
            checked={housePaidOff}
            onChange={setHousePaidOff}
            label="Will your house be paid off by retirement?"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="form-label">Mortgage payment — principal &amp; interest only ($/mo)</label>
            <input
              type="number"
              value={mortgagePI || ''}
              onChange={(e) => setMortgagePI(Number(e.target.value) || 0)}
              placeholder="1200"
              step="25"
              min="0"
              disabled={!housePaidOff}
              className="form-input disabled:opacity-40"
            />
            <p className="mt-1 text-xs text-slate-subtle">
              {housePaidOff
                ? 'Subtracted from your Needs.'
                : 'Enable the toggle above if this payment will end before retirement.'}
            </p>
          </div>
          <div>
            <label className="form-label">Property taxes, insurance &amp; maintenance ($/mo)</label>
            <input
              type="number"
              value={propTaxInsMaint || ''}
              onChange={(e) => setPropTaxInsMaint(Number(e.target.value) || 0)}
              placeholder="500"
              step="25"
              min="0"
              className="form-input"
            />
            <p className="mt-1 text-xs text-slate-subtle">These costs don&apos;t go away — always included in Needs.</p>
          </div>
        </div>
      </div>

      {/* Step 3: Drop-off items */}
      <div className="rounded-2xl p-6 md:p-8 bg-white/[0.03] border border-white/[0.08]">
        <h3 className="font-serif text-lg font-bold text-gold-light mb-1">
          Other expenses dropping off in retirement
        </h3>
        <p className="text-sm text-slate-muted mb-5">
          Add anything else that goes away or shrinks — a second car payment going from a
          2-car to a 1-car household, commuting costs, work expenses, or kids&apos; expenses.
        </p>

        {dropOffItems.length > 0 && (
          <div className="space-y-3 mb-4">
            {dropOffItems.map((item) => (
              <div key={item.id} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateDropOffItem(item.id, 'label', e.target.value)}
                    placeholder="e.g. Second car payment, insurance & gas"
                    maxLength={100}
                    className="form-input"
                  />
                </div>
                <div className="w-36">
                  <input
                    type="number"
                    value={item.amount || ''}
                    onChange={(e) => updateDropOffItem(item.id, 'amount', e.target.value)}
                    placeholder="0"
                    step="25"
                    min="0"
                    className="form-input"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeDropOffItem(item.id)}
                  aria-label="Remove item"
                  className="shrink-0 h-[46px] w-[46px] rounded-lg border border-white/[0.08] text-slate-muted hover:text-red-300 hover:border-red-300/40 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="button" onClick={addDropOffItem} className="btn-secondary text-sm">
          + Add expense
        </button>

        {dropOffItems.length > 0 && (
          <p className="mt-4 text-sm text-slate-muted">
            Total dropping off: <span className="text-gold-light font-semibold">{formatCurrency(dropOffTotal)}/mo</span>
          </p>
        )}
      </div>

      {/* Step 4: Timeline & assumptions */}
      <div className="rounded-2xl p-6 md:p-8 bg-white/[0.03] border border-white/[0.08]">
        <h3 className="font-serif text-lg font-bold text-gold-light mb-5">
          Timeline &amp; assumptions
        </h3>
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div>
            <label className="form-label">Years until retirement</label>
            <input
              type="number"
              value={yearsToRetirement || ''}
              onChange={(e) => setYearsToRetirement(Number(e.target.value) || 0)}
              placeholder="25"
              step="1"
              min="0"
              max="80"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Inflation rate (%)</label>
            <input
              type="number"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value) || 0)}
              placeholder="3"
              step="0.1"
              min="0"
              max="15"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Current retirement savings ($)</label>
            <input
              type="number"
              value={currentSavings || ''}
              onChange={(e) => setCurrentSavings(Number(e.target.value) || 0)}
              placeholder="0"
              step="1000"
              min="0"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Estimated monthly Social Security ($, optional)</label>
            <input
              type="number"
              value={monthlySocialSecurity || ''}
              onChange={(e) => setMonthlySocialSecurity(Number(e.target.value) || 0)}
              placeholder="e.g. 1900"
              step="50"
              min="0"
              className="form-input"
            />
            <p className="mt-1 text-xs text-slate-subtle">
              Offsets your annual draw under the 4% rule. Leave blank to plan conservatively
              without it.
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-slate-subtle">Expected annual investment return</label>
            <span className="text-sm font-bold text-gold-light">{expectedReturn}%</span>
          </div>
          <input
            type="range"
            min={MIN_EXPECTED_RETURN}
            max={MAX_EXPECTED_RETURN}
            step={0.5}
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(Number(e.target.value))}
            className="w-full accent-gold"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-muted">{MIN_EXPECTED_RETURN}%</span>
            <span className="text-xs text-slate-muted">{MAX_EXPECTED_RETURN}%</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-gold/[0.08] to-white/[0.01] border border-gold/30">
        <h3 className="font-serif text-xl font-bold text-gold-light mb-5">Your retirement number</h3>

        {/* Budget breakdown */}
        <div className="mb-6">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">
            Adjusted monthly retirement budget
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-muted">Needs (adjusted)</span>
              <span className="text-slate-text tabular-nums">{formatCurrency(result.adjustedMonthlyNeeds)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-muted">Wants (retirement)</span>
              <span className="text-slate-text tabular-nums">{formatCurrency(result.adjustedMonthlyWants)}</span>
            </div>
            {dropOffItems.length > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-muted">Drops-off subtracted</span>
                <span className="text-slate-text tabular-nums">−{formatCurrency(result.totalDropOffs)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-white/[0.08] font-semibold">
              <span className="text-slate-text">Total monthly (today&apos;s $)</span>
              <span className="text-gold-light tabular-nums">{formatCurrency(result.totalMonthlySpendingToday)}</span>
            </div>
          </div>
        </div>

        {/* Future spending */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <div className="rounded-xl p-5 bg-white/[0.03] border border-white/[0.08]">
            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
              Future monthly spending
            </p>
            <p className="font-serif text-2xl font-bold text-gold-light tabular-nums">
              {formatCurrency(result.futureMonthlySpending)}
            </p>
            <p className="mt-1 text-xs text-slate-subtle">
              In {yearsToRetirement} year{yearsToRetirement === 1 ? '' : 's'} at {inflationRate}% inflation
            </p>
          </div>
          <div className="rounded-xl p-5 bg-white/[0.03] border border-white/[0.08]">
            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
              Future annual spending need
            </p>
            <p className="font-serif text-2xl font-bold text-gold-light tabular-nums">
              {formatCurrency(result.futureAnnualSpending)}
            </p>
            {monthlySocialSecurity > 0 && (
              <p className="mt-1 text-xs text-slate-subtle">
                {formatCurrency(result.annualFromInvestments)}/yr after Social Security
              </p>
            )}
          </div>
        </div>

        {/* Nest egg target */}
        <div className="rounded-xl p-6 mb-6 bg-gold/10 border border-gold/40">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
            Nest egg target (4% rule)
          </p>
          <p className="font-serif text-3xl md:text-4xl font-bold text-gold-light tabular-nums">
            {formatCurrency(result.nestEggTarget)}
          </p>
          <p className="mt-1 text-sm text-slate-muted">
            25x your annual spending need from investments.
          </p>
        </div>

        {/* Savings projection & gap */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <div className="rounded-xl p-5 bg-white/[0.03] border border-white/[0.08]">
            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
              Current savings, projected
            </p>
            <p className="font-serif text-2xl font-bold text-gold-light tabular-nums">
              {formatCurrency(result.projectedSavingsAtRetirement)}
            </p>
            <p className="mt-1 text-xs text-slate-subtle">
              {formatCurrency(currentSavings)} today, grown at {expectedReturn}% for {yearsToRetirement} yr
              {yearsToRetirement === 1 ? '' : 's'}
            </p>
          </div>
          <div className="rounded-xl p-5 bg-white/[0.03] border border-white/[0.08]">
            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
              Remaining gap
            </p>
            <p className="font-serif text-2xl font-bold text-gold-light tabular-nums">
              {formatCurrency(result.gap)}
            </p>
            <p className="mt-1 text-xs text-slate-subtle">
              {result.gap === 0 ? 'Your projected savings already cover your target.' : 'Nest egg target minus projected savings.'}
            </p>
          </div>
        </div>

        {/* Required monthly contribution */}
        <div className="rounded-xl p-6 bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/50">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
            Required monthly investment
          </p>
          <p className="font-serif text-3xl md:text-4xl font-bold text-gold-light tabular-nums">
            {formatCurrency(result.requiredMonthlyContribution, 2)}
            <span className="text-base text-slate-muted font-sans">/mo</span>
          </p>
          <p className="mt-1 text-sm text-slate-muted">
            {result.gap === 0
              ? "You're already on track at this return rate — no additional contribution needed to close the gap."
              : `To close the gap by retirement, assuming a ${expectedReturn}% annual return.`}
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-subtle text-center max-w-2xl mx-auto">
        Educational tool only. Not financial advice. The 4% rule and projected returns are
        general guidelines — actual market performance, taxes, and spending needs will vary.
      </p>
    </div>
  );
}
