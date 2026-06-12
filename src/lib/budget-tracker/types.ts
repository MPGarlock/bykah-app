/**
 * BYKAH Budget Tracker — type definitions.
 * Matches public.budget_categories, public.budget_transactions, and
 * public.budget_settings in Supabase.
 */

/** 50/30/20 bucket a category belongs to. */
export type Bucket = 'needs' | 'wants' | 'investments';

export const BUCKETS: { value: Bucket; label: string; blurb: string }[] = [
  { value: 'needs', label: 'Needs', blurb: 'Essentials: housing, groceries, utilities, transport.' },
  { value: 'wants', label: 'Wants', blurb: 'Lifestyle: dining out, subscriptions, fun.' },
  { value: 'investments', label: 'Investments', blurb: 'Savings + investing toward the house fund.' },
];

export const BUCKET_LABEL: Record<Bucket, string> = {
  needs: 'Needs',
  wants: 'Wants',
  investments: 'Investments',
};

/**
 * How a category's monthly amount is tracked:
 *  - 'bucket': a spending pool you draw from over the month (groceries,
 *    gas, fun money). Tracked via a running total of transactions vs.
 *    the monthly budget.
 *  - 'fixed_bill': a single flat recurring payment (mortgage, car
 *    payment, insurance premium). Tracked as due/paid for the month
 *    rather than a running spend total.
 */
export type ItemType = 'bucket' | 'fixed_bill';

export const ITEM_TYPES: { value: ItemType; label: string; blurb: string }[] = [
  { value: 'bucket', label: 'Bucket', blurb: 'A spending pool you draw from all month, e.g. groceries, gas, fun money.' },
  { value: 'fixed_bill', label: 'Fixed Bill', blurb: 'A single recurring payment due each month, e.g. mortgage, car payment, insurance.' },
];

export const ITEM_TYPE_LABEL: Record<ItemType, string> = {
  bucket: 'Bucket',
  fixed_bill: 'Fixed Bill',
};

export interface BudgetCategory {
  id: string;
  user_id: string;
  name: string;
  monthly_budget: number;
  bucket: Bucket;
  item_type: ItemType;
  /** Day of the month (1-31) a fixed bill is due. Null for buckets. */
  due_day: number | null;
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
  /** True if at least one transaction has been logged this month. */
  paidThisMonth: boolean;
}

/** Per-user 50/30/20 plan settings. */
export interface BudgetSettings {
  user_id: string;
  monthly_income: number;
  needs_pct: number;
  wants_pct: number;
  investments_pct: number;
  created_at: string;
  updated_at: string;
}

// Default 50/30/20 split
export const DEFAULT_NEEDS_PCT = 50;
export const DEFAULT_WANTS_PCT = 30;
export const DEFAULT_INVESTMENTS_PCT = 20;

export const DEFAULT_SETTINGS: Omit<
  BudgetSettings,
  'user_id' | 'created_at' | 'updated_at'
> = {
  monthly_income: 0,
  needs_pct: DEFAULT_NEEDS_PCT,
  wants_pct: DEFAULT_WANTS_PCT,
  investments_pct: DEFAULT_INVESTMENTS_PCT,
};

// Validation bounds
export const CATEGORY_NAME_MAX = 100;
export const NOTE_MAX = 280;
export const BUDGET_MIN = 0;
export const BUDGET_MAX = 9_999_999.99;
export const AMOUNT_MIN = 0.01;
export const AMOUNT_MAX = 1_000_000;
export const INCOME_MAX = 9_999_999.99;
export const DUE_DAY_MIN = 1;
export const DUE_DAY_MAX = 31;
