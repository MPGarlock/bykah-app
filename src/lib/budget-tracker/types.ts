/**
 * BYKAH Budget Tracker — type definitions.
 * Matches public.budget_categories and public.budget_transactions in Supabase.
 */

export interface BudgetCategory {
  id: string;
  user_id: string;
  name: string;
  monthly_budget: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetTransaction {
  id: string;
  category_id: string;
  user_id: string;
  amount: number;
  note: string | null;
  /** YYYY-MM-DD */
  transacted_at: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithStats extends BudgetCategory {
  transactions: BudgetTransaction[];
  spentThisMonth: number;
  remainingThisMonth: number;
  progressPct: number;
}

// Validation bounds
export const CATEGORY_NAME_MAX = 100;
export const NOTE_MAX = 280;
export const BUDGET_MIN = 0;
export const BUDGET_MAX = 9_999_999.99;
export const AMOUNT_MIN = 0.01;
export const AMOUNT_MAX = 1_000_000;
