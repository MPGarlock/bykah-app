export type AffordCategory = 'house' | 'car' | 'vacation' | 'hobby';

export interface AffordInput {
  netMonthlyIncome: number;
  category: AffordCategory;
  // House
  homePrice?: number;
  downPaymentPct?: number;
  interestRate?: number;
  loanTermYears?: number;
  // Car
  vehiclePrice?: number;
  carDownPayment?: number;
  carInterestRate?: number;
  carLoanTermMonths?: number;
  // Vacation
  totalVacationCost?: number;
  monthsSaving?: number;
  // Hobby
  monthlyHobbyCost?: number;
}

export interface AffordResult {
  canAfford: boolean;
  verdict: string;
  monthlyPayment: number;
  incomePercent: number;
  budgetCeiling: number;
  remainingBudget: number;
  foreverNumber: number;
  insights: string[];
}
