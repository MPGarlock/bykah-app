'use client';

import { useState } from 'react';

// ─── Data ────────────────────────────────────────────────────────────────────

// Census Bureau SIPP 2023 / SmartAsset 2026 — state median net worth
const STATE_MEDIANS: Record<string, number> = {
  'Alabama': 92600,
  'Alaska': 213700,
  'Arizona': 191500,
  'Arkansas': 107300,
  'California': 300900,
  'Colorado': 268900,
  'Connecticut': 307700,
  'Delaware': 192084, // estimated
  'Florida': 166200,
  'Georgia': 141200,
  'Hawaii': 421900,
  'Idaho': 192084, // estimated
  'Illinois': 176400,
  'Indiana': 155200,
  'Iowa': 179600,
  'Kansas': 179200,
  'Kentucky': 107600,
  'Louisiana': 87000,
  'Maine': 192084, // estimated
  'Maryland': 284600,
  'Massachusetts': 361000,
  'Michigan': 148700,
  'Minnesota': 252600,
  'Mississippi': 68300,
  'Missouri': 148200,
  'Montana': 192084, // estimated
  'Nebraska': 196100,
  'Nevada': 173400,
  'New Hampshire': 282100,
  'New Jersey': 338400,
  'New Mexico': 88300,
  'New York': 213100,
  'North Carolina': 163500,
  'North Dakota': 192084, // estimated
  'Ohio': 151900,
  'Oklahoma': 118500,
  'Oregon': 264600,
  'Pennsylvania': 178100,
  'Rhode Island': 230400,
  'South Carolina': 133100,
  'South Dakota': 192084, // estimated
  'Tennessee': 149400,
  'Texas': 166600,
  'Utah': 228000,
  'Vermont': 192084, // estimated
  'Virginia': 268100,
  'Washington': 330900,
  'West Virginia': 86000,
  'Wisconsin': 202900,
  'Wyoming': 192084, // estimated
};

// Federal Reserve SCF 2023 — US net worth percentiles [percentile, net worth $]
const US_PERCENTILE_TABLE: [number, number][] = [
  [1, -76472], [5, -9878], [10, 440], [15, 6532], [20, 13528],
  [25, 27016], [30, 51366], [35, 79054], [40, 110314], [45, 147316],
  [50, 192084], [55, 250380], [60, 312622], [65, 402800], [70, 493068],
  [75, 658340], [80, 891750], [85, 1234848], [90, 1920758],
  [95, 3779600], [99, 13666778],
];

// UBS/Credit Suisse Global Wealth Report 2024 — global wealth [percentile, USD]
const GLOBAL_PERCENTILE_TABLE: [number, number][] = [
  [0, -50000], [10, 0], [20, 100], [30, 500], [40, 2000],
  [50, 8654], [60, 20000], [70, 42000], [75, 62000], [80, 100000],
  [85, 155000], [90, 250000], [95, 550000], [99, 1100000],
  [99.5, 2500000], [99.9, 10000000],
];

const US_MEDIAN = 192084;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lerp(
  table: [number, number][],
  value: number,
  bySecond = false
): number {
  // Interpolate: given a net worth, find percentile (bySecond=true)
  //              or given a percentile, find net worth
  const src = bySecond ? table.map(([a, b]) => [b, a] as [number, number]) : table;
  if (value <= src[0][0]) return src[0][1];
  if (value >= src[src.length - 1][0]) return src[src.length - 1][1];
  for (let i = 0; i < src.length - 1; i++) {
    const [x0, y0] = src[i];
    const [x1, y1] = src[i + 1];
    if (value >= x0 && value <= x1) {
      const t = (value - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return src[src.length - 1][1];
}

function netWorthToPercentile(nw: number, table: [number, number][]): number {
  return Math.min(99.9, Math.max(0, lerp(table, nw, true)));
}

function getStatePercentile(nw: number, state: string): number {
  const stateMed = STATE_MEDIANS[state] ?? US_MEDIAN;
  const scaledNW = nw * (US_MEDIAN / stateMed);
  return netWorthToPercentile(scaledNW, US_PERCENTILE_TABLE);
}

function formatCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function topPercent(p: number): string {
  const top = 100 - p;
  if (top < 1) return 'Top 1%';
  return `Top ${top.toFixed(0)}%`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface BenchmarkCardProps {
  label: string;
  percentile: number;
  median: number;
  userNW: number;
  note?: string;
}

function BenchmarkCard({ label, percentile, median, userNW, note }: BenchmarkCardProps) {
  const top = Math.max(0, 100 - percentile);
  const barWidth = Math.min(100, percentile);
  const diff = userNW - median;
  const sign = diff >= 0 ? '+' : '';

  return (
    <div className="bg-navy-light border border-navy-border rounded-2xl p-6 flex flex-col gap-4">
      <p className="text-xs font-bold tracking-widest uppercase text-gold opacity-80">{label}</p>

      <div>
        <p className="text-4xl font-serif font-bold text-gold-light">{topPercent(percentile)}</p>
        <p className="text-sm text-slate-muted mt-1">
          Percentile {percentile.toFixed(1)} — higher than{' '}
          {percentile.toFixed(1)}% of people
        </p>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 rounded-full bg-navy-border overflow-hidden">
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-gold transition-all duration-700"
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-muted">
        <span>Median: {formatCurrency(median)}</span>
        <span className={diff >= 0 ? 'text-green-400' : 'text-red-400'}>
          {sign}{formatCurrency(diff)} vs. median
        </span>
      </div>

      {note && <p className="text-xs text-slate-muted italic">{note}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function NetWorthBenchmarker({ initialNetWorth }: { initialNetWorth: number }) {
  const [rawInput, setRawInput] = useState(
    initialNetWorth > 0 ? initialNetWorth.toString() : ''
  );
  const [selectedState, setSelectedState] = useState('');

  const nw = parseFloat(rawInput.replace(/[^\d.-]/g, '')) || 0;
  const hasValue = rawInput.trim() !== '' && !isNaN(nw);

  const usPercentile = hasValue ? netWorthToPercentile(nw, US_PERCENTILE_TABLE) : 0;
  const globalPercentile = hasValue ? netWorthToPercentile(nw, GLOBAL_PERCENTILE_TABLE) : 0;
  const statePercentile =
    hasValue && selectedState ? getStatePercentile(nw, selectedState) : null;

  const globalMedian = 8654;
  const stateMed = selectedState ? (STATE_MEDIANS[selectedState] ?? US_MEDIAN) : US_MEDIAN;

  return (
    <div className="space-y-8">
      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Your Net Worth
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 250000"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-navy-light border border-navy-border text-white placeholder-slate-muted focus:outline-none focus:border-gold text-lg"
          />
          {hasValue && (
            <p className="text-xs text-slate-muted mt-1">{formatCurrency(nw)}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Your State (optional)
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-navy-light border border-navy-border text-white focus:outline-none focus:border-gold text-base"
          >
            <option value="">— Select state —</option>
            {Object.keys(STATE_MEDIANS)
              .sort()
              .map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
          </select>
        </div>
      </div>

      {/* Cards */}
      {hasValue ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statePercentile !== null && selectedState && (
            <BenchmarkCard
              label={`${selectedState} (Est.)`}
              percentile={statePercentile}
              median={stateMed}
              userNW={nw}
              note="Estimated by scaling to national distribution using state median."
            />
          )}
          <BenchmarkCard
            label="United States"
            percentile={usPercentile}
            median={US_MEDIAN}
            userNW={nw}
            note="Source: Federal Reserve SCF 2023"
          />
          <BenchmarkCard
            label="Global"
            percentile={globalPercentile}
            median={globalMedian}
            userNW={nw}
            note="Source: UBS Global Wealth Report 2024"
          />
        </div>
      ) : (
        <div className="text-center py-16 text-slate-muted">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-lg">Enter your net worth to see where you stand.</p>
          <p className="text-sm mt-1 opacity-70">
            Include all assets minus all debts.
          </p>
        </div>
      )}

      <p className="text-xs text-slate-muted text-center opacity-60">
        Data: Federal Reserve SCF 2023 · UBS Global Wealth Report 2024 · Census Bureau SIPP 2023.
        Estimates only — individual circumstances vary.
      </p>
    </div>
  );
}
