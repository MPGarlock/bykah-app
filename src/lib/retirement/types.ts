export interface RetirementGoal {
  id: string;
  user_id: string;
  target_age: number;
  current_age: number;
  monthly_contribution: number;
  current_savings: number;
  target_nest_egg: number;
  withdrawal_rate: number;
  expected_return: number;
}

export interface RetirementProjection {
  yearsToRetirement: number;
  projectedNestEgg: number;
  onTrack: boolean;
  shortfall: number;
  monthlyNeededToClose: number;
  coveragePercent: number;
}
