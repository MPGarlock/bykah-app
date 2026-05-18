/**
 * BYKAH Investment Tracker — type definitions.
 * Matches public.investment_accounts in Supabase.
 */

export type AccountType =
  | '401k'
  | 'ira'
  | 'roth_ira'
  | 'brokerage'
  | 'hsa'
  | '529'
  | 'crypto'
  | 'other';

export interface InvestmentAccount {
  id: string;
  user_id: string;
  name: string;
  account_type: AccountType;
  current_balance: number;
  created_at: string;
  updated_at: string;
}

// Validation bounds
export const ACCOUNT_NAME_MAX = 100;
export const BALANCE_MIN = 0;
export const BALANCE_MAX = 9_999_999_999.99; // ~$10B

// User-facing labels for each account type
export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  '401k': '401(k)',
  ira: 'Traditional IRA',
  roth_ira: 'Roth IRA',
  brokerage: 'Brokerage',
  hsa: 'HSA',
  '529': '529 College',
  crypto: 'Crypto',
  other: 'Other',
};

// Ordered list for select dropdowns
export const ACCOUNT_TYPES: AccountType[] = [
  '401k',
  'ira',
  'roth_ira',
  'brokerage',
  'hsa',
  '529',
  'crypto',
  'other',
];
