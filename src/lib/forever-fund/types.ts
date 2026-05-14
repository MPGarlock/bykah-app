/**
 * BYKAH Forever Fund — type definitions.
  * Matches the public.expenses table in Supabase.
   */   export type Frequency = 'monthly' | 'annual';

   export interface Expense {
     id: string;
       user_id: string;
         name: string;
           amount: number;
             frequency: Frequency;
               withdrawal_rate: number;
                 created_at: string;
                   updated_at: string;
                   }

                   export interface ExpenseInput {
                     name: string;
                       amount: number;
                         frequency: Frequency;
                           withdrawal_rate: number;
                           }

                           export const MIN_WITHDRAWAL_RATE = 4.0;
                           export const MAX_WITHDRAWAL_RATE = 10.0;
                           export const DEFAULT_WITHDRAWAL_RATE = 4.0;
                           
