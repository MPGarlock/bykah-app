/**
 * BYKAH Investment Tracker — math helpers.
 *
 * Tracks what you actually have invested vs. the Forever Number target
 * (the principal you'd need invested to cover all your recurring expenses
 * forever). Progress toward financial independence at a glance.
 */
import type { InvestmentAccount } from './types';

export function totalInvested(accounts: InvestmentAccount[]): number {
  return accounts.reduce((sum, a) => sum + Number(a.current_balance), 0);
}

/**
 * Progress toward the Forever Number target as a 0-100 percentage.
 * Returns 0 if the target is zero (user has no expenses yet).
 */
export function progressTowardGoal(
  invested: number,
  target: number,
): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, (invested / target) * 100));
}
