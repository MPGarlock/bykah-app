import type { RetirementGoal, RetirementProjection } from './types';

export function calculateRetirementProjection(goal: RetirementGoal): RetirementProjection {
  const { target_age, current_age, monthly_contribution, current_savings, target_nest_egg, expected_return } = goal;
  const yearsToRetirement = target_age - current_age;
  const rate = expected_return / 100;

  const fvCurrentSavings = current_savings * Math.pow(1 + rate, yearsToRetirement);
  const fvContributions =
    rate === 0
      ? monthly_contribution * 12 * yearsToRetirement
      : monthly_contribution * 12 * (Math.pow(1 + rate, yearsToRetirement) - 1) / rate;

  const projectedNestEgg = fvCurrentSavings + fvContributions;
  const coveragePercent = Math.min(100, (projectedNestEgg / target_nest_egg) * 100);
  const shortfall = Math.max(0, target_nest_egg - projectedNestEgg);
  const onTrack = shortfall === 0;

  let monthlyNeededToClose = 0;
  if (!onTrack && yearsToRetirement > 0 && rate > 0) {
    monthlyNeededToClose = (shortfall * rate) / (12 * (Math.pow(1 + rate, yearsToRetirement) - 1));
  } else if (!onTrack && yearsToRetirement > 0) {
    monthlyNeededToClose = shortfall / (yearsToRetirement * 12);
  }

  return {
    yearsToRetirement,
    projectedNestEgg,
    onTrack,
    shortfall,
    monthlyNeededToClose,
    coveragePercent,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}
