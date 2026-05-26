'use client';

import { useState, useMemo } from 'react';
import type { AffordCategory, AffordInput } from '@/lib/afford/types';
import { calculateAffordability, formatCurrency } from '@/lib/afford/math';

const CATEGORIES: { id: AffordCategory; label: string }[] = [
  { id: 'house', label: 'House' },
  { id: 'car', label: 'Car' },
  { id: 'vacation', label: 'Vacation' },
  { id: 'hobby', label: 'Hobby' },
];

export function AffordCalculator() {
  const [grossMonthlyIncome, setGrossMonthlyIncome] = useState<number>(0);
  const [category, setCategory] = useState<AffordCategory>('house');

  const [homePrice, setHomePrice] = useState<number>(300000);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);

  const [vehiclePrice, setVehiclePrice] = useState<number>(30000);
  const [carDownPayment, setCarDownPayment] = useState<number>(5000);
  const [carInterestRate, setCarInterestRate] = useState<number>(6);
  const [carLoanTermMonths, setCarLoanTermMonths] = useState<number>(60);

  const [totalVacationCost, setTotalVacationCost] = useState<number>(3000);
  const [monthsSaving, setMonthsSaving] = useState<number>(12);

  const [monthlyHobbyCost, setMonthlyHobbyCost] = useState<number>(200);

  const hasIncome = grossMonthlyIncome > 0;

  const categoryInputsFilled = useMemo(() => {
    switch (category) {
      case 'house': return homePrice > 0;
      case 'car': return vehiclePrice > 0;
      case 'vacation': return totalVacationCost > 0;
      case 'hobby': return monthlyHobbyCost > 0;
      default: return false;
    }
  }, [category, homePrice, vehiclePrice, totalVacationCost, monthlyHobbyCost]);

  const input: AffordInput = useMemo(() => ({
    grossMonthlyIncome,
    category,
    homePrice,
    downPaymentPct,
    interestRate,
    loanTermYears,
    vehiclePrice,
    carDownPayment,
    carInterestRate,
    carLoanTermMonths,
    totalVacationCost,
    monthsSaving,
    monthlyHobbyCost,
  }), [grossMonthlyIncome, category, homePrice, downPaymentPct, interestRate, loanTermYears,
      vehiclePrice, carDownPayment, carInterestRate, carLoanTermMonths, totalVacationCost,
      monthsSaving, monthlyHobbyCost]);

  const result = useMemo(() => {
    if (!hasIncome || !categoryInputsFilled) return null;
    return calculateAffordability(input);
  }, [input, hasIncome, categoryInputsFilled]);

  const ceilingLabel = category === 'house' ? '25%' : '10%';

  return (
    <div className="space-y-6">
      <div className="bg-[#111f38] rounded-2xl p-6 border border-white/10">
        <label className="block font-sans text-slate-subtle text-sm mb-2 uppercase tracking-wider">
          Monthly Gross Income (before tax)
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gold font-serif text-2xl">$</span>
          <input
            type="number"
            min="0"
            value={grossMonthlyIncome || ''}
            onChange={(e) => setGrossMonthlyIncome(Number(e.target.value))}
            placeholder="e.g. 8000"
            className="bg-transparent border-b border-white/20 focus:border-gold outline-none text-white font-sans text-2xl w-full py-1"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={
              'px-5 py-2 rounded-full font-sans text-sm transition-all ' +
              (category === cat.id
                ? 'bg-gold text-[#0A1628] font-semibold'
                : 'bg-white/5 text-slate-muted hover:bg-white/10')
            }
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="bg-[#111f38] rounded-2xl p-6 border border-white/10 space-y-5">
        {category === 'house' && (
          <>
            <NumberField label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" />
            <SliderField
              label={'Down Payment: ' + downPaymentPct + '%'}
              value={downPaymentPct}
              onChange={setDownPaymentPct}
              min={5} max={30} step={1}
            />
            <SliderField
              label={'Interest Rate: ' + interestRate.toFixed(2) + '%'}
              value={interestRate}
              onChange={setInterestRate}
              min={3} max={10} step={0.25}
            />
            <div>
              <p className="font-sans text-slate-subtle text-sm mb-2">Loan Term</p>
              <ToggleField
                options={[{ label: '15 yr', value: 15 }, { label: '30 yr', value: 30 }]}
                value={loanTermYears}
                onChange={setLoanTermYears}
              />
            </div>
          </>
        )}

        {category === 'car' && (
          <>
            <NumberField label="Vehicle Price" value={vehiclePrice} onChange={setVehiclePrice} prefix="$" />
            <NumberField label="Down Payment" value={carDownPayment} onChange={setCarDownPayment} prefix="$" />
            <SliderField
              label={'Interest Rate: ' + carInterestRate.toFixed(2) + '%'}
              value={carInterestRate}
              onChange={setCarInterestRate}
              min={3} max={15} step={0.25}
            />
            <div>
              <p className="font-sans text-slate-subtle text-sm mb-2">Loan Term</p>
              <ToggleField
                options={[
                  { label: '48 mo', value: 48 },
                  { label: '60 mo', value: 60 },
                  { label: '72 mo', value: 72 },
                ]}
                value={carLoanTermMonths}
                onChange={setCarLoanTermMonths}
              />
            </div>
          </>
        )}

        {category === 'vacation' && (
          <>
            <NumberField label="Total Vacation Cost" value={totalVacationCost} onChange={setTotalVacationCost} prefix="$" />
            <SliderField
              label={'Months to Save: ' + monthsSaving}
              value={monthsSaving}
              onChange={setMonthsSaving}
              min={1} max={24} step={1}
            />
          </>
        )}

        {category === 'hobby' && (
          <NumberField label="Monthly Cost" value={monthlyHobbyCost} onChange={setMonthlyHobbyCost} prefix="$" />
        )}
      </div>

      {result && (
        <div className="bg-[#111f38] rounded-2xl p-6 border border-white/10 space-y-5">
          <div className={'text-3xl font-serif ' + (result.canAfford ? 'text-gold' : 'text-slate-muted')}>
            {result.verdict}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between font-sans text-sm text-slate-subtle">
              <span>Your monthly payment</span>
              <span className="text-white font-semibold">{formatCurrency(result.monthlyPayment)}</span>
            </div>
            <div className="flex justify-between font-sans text-sm text-slate-subtle">
              <span>{'BYKAH ceiling (' + ceilingLabel + ' of income)'}</span>
              <span className="text-white font-semibold">{formatCurrency(result.budgetCeiling)}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 mt-2">
              <div
                className={'h-3 rounded-full transition-all ' + (result.canAfford ? 'bg-gold' : 'bg-red-500')}
                style={{ width: Math.min((result.monthlyPayment / result.budgetCeiling) * 100, 100) + '%' }}
              />
            </div>
            <p className="font-sans text-xs text-slate-subtle">
              {result.incomePercent.toFixed(1) + '% of gross monthly income'}
            </p>
          </div>

          <div className="bg-gold/10 border border-gold/30 rounded-xl p-4">
            <p className="font-sans text-gold-light text-xs uppercase tracking-wider mb-1">The Forever Number</p>
            <p className="font-serif text-2xl text-gold">{formatCurrency(result.foreverNumber)}</p>
            <p className="font-sans text-slate-subtle text-sm mt-1">
              invested at a 4% withdrawal rate would cover this expense forever without touching principal.
            </p>
          </div>

          <ul className="space-y-2">
            {result.insights.map((insight, i) => (
              <li key={i} className="flex gap-2 font-sans text-sm text-slate-muted">
                <span className="text-gold mt-0.5">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>

          <p className="font-sans text-xs italic" style={{ color: 'rgba(148,163,184,0.6)' }}>
            Educational only. Not financial advice.
          </p>
        </div>
      )}

      {!hasIncome && (
        <p className="font-sans text-slate-subtle text-sm text-center">
          Enter your monthly gross income above to see your results.
        </p>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  prefix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
}) {
  return (
    <div>
      <label className="block font-sans text-slate-subtle text-sm mb-1">{label}</label>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-gold font-serif">{prefix}</span>}
        <input
          type="number"
          min="0"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="bg-transparent border-b border-white/20 focus:border-gold outline-none text-white font-sans text-lg w-full py-1"
        />
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div>
      <label className="block font-sans text-slate-subtle text-sm mb-2">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#C9973A]"
      />
      <div className="flex justify-between font-sans text-xs text-slate-subtle mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function ToggleField<T extends number>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={
            'px-4 py-1.5 rounded-lg font-sans text-sm transition-all border ' +
            (value === opt.value
              ? 'bg-gold text-[#0A1628] border-gold font-semibold'
              : 'border-white/20 text-slate-muted hover:border-white/40')
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
