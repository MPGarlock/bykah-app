/**
 * BYKAH Kids House Fund — math helpers.
 *
 * Tracks principal saved toward a finite goal (buying your kids a house).
 * Unlike the Forever Fund (perpetual income), this is "deposit money,
 * watch it accumulate, see how close you are to the target."
 *
 * Pace projection uses the last 90 days of contributions, so the
 * months-to-goal reflects what you're actually saving now, not a stale
 * lifetime average.
 */
import type { Contribution, Fund, FundWithStats } from './types';
import { PROJECTION_WINDOW_DAYS } from './types';

export function totalContributed(contributions: Contribution[]): number {
  return contributions.reduce((sum, c) => sum + Number(c.amount), 0);
}

export function progressPct(balance: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, (balance / target) * 100));
}

/**
 * Months to goal based on the last 90 days of contributions.
 * Returns null if the goal is already met or there's no recent activity.
 */
export function monthsToGoal(
  contributions: Contribution[],
  target: number,
  balance: number,
): number | null {
  if (balance >= target) return null;
  if (contributions.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const windowStart = new Date(today);
  windowStart.setDate(windowStart.getDate() - PROJECTION_WINDOW_DAYS);

  const recent = contributions.filter((c) => {
    const d = parseDate(c.contributed_at);
    return d >= windowStart && d <= today;
  });

  if (recent.length === 0) return null;

  const recentTotal = recent.reduce((sum, c) => sum + Number(c.amount), 0);
  if (recentTotal <= 0) return null;

  // Convert to monthly pace: avg over 90 days, then * ~30 days/month
  const monthlyPace = (recentTotal / PROJECTION_WINDOW_DAYS) * 30;
  if (monthlyPace <= 0) return null;

  const remaining = target - balance;
  return Math.ceil(remaining / monthlyPace);
}

export function buildFundStats(
  fund: Fund,
  contributions: Contribution[],
): FundWithStats {
  const balance = totalContributed(contributions);
  return {
    ...fund,
    contributions,
    balance,
    progressPct: progressPct(balance, Number(fund.target_amount)),
    monthsToGoal: monthsToGoal(contributions, Number(fund.target_amount), balance),
  };
}

/**
 * Parse a YYYY-MM-DD date string as a local Date (avoiding UTC shift).
 */
function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
