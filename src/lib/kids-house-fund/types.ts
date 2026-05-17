/**
 * BYKAH Kids House Fund — type definitions.
 * Matches public.kids_house_funds and public.kids_house_contributions in Supabase.
 */

export interface Fund {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Contribution {
  id: string;
  fund_id: string;
  user_id: string;
  amount: number;
  note: string | null;
  /** YYYY-MM-DD (date-only, no time) */
  contributed_at: string;
  created_at: string;
  updated_at: string;
}

export interface FundWithStats extends Fund {
  contributions: Contribution[];
  balance: number;
  /** 0-100, clamped */
  progressPct: number;
  /** null if goal already reached or pace too slow to project */
  monthsToGoal: number | null;
}

// Validation bounds
export const FUND_NAME_MAX = 100;
export const NOTE_MAX = 280;
export const TARGET_MIN = 1;
export const TARGET_MAX = 99_999_999.99;
export const AMOUNT_MIN = 0.01;
export const AMOUNT_MAX = 1_000_000_000;

// Projection window for monthsToGoal — last N days of contributions
export const PROJECTION_WINDOW_DAYS = 90;
