/**
 * BYKAH Forever Fund — Server Actions for expense CRUD.
 *
 * All actions:
 *  - Require an authenticated user (Supabase RLS also enforces this).
 *  - Validate input and return { ok, error } shape.
 *  - revalidatePath('/dashboard') so the UI refreshes after mutation.
 */
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Frequency } from './types';
import {
  MIN_WITHDRAWAL_RATE,
  MAX_WITHDRAWAL_RATE,
  DEFAULT_WITHDRAWAL_RATE,
} from './types';

type ActionResult = { ok: true } | { ok: false; error: string };

/** Validate and coerce raw form input. Returns parsed values or an error message. */
function parseExpenseFields(formData: FormData): {
  ok: true;
  values: {
    name: string;
    amount: number;
    frequency: Frequency;
    withdrawal_rate: number;
  };
} | { ok: false; error: string } {
  const name = String(formData.get('name') ?? '').trim();
  const amountRaw = String(formData.get('amount') ?? '').trim();
  const frequencyRaw = String(formData.get('frequency') ?? '').trim();
  const rateRaw = String(formData.get('withdrawal_rate') ?? '').trim();

  if (!name) return { ok: false, error: 'Name is required.' };
  if (name.length > 100) {
    return { ok: false, error: 'Name must be 100 characters or fewer.' };
  }

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: 'Amount must be a positive number.' };
  }
  if (amount > 1_000_000_000) {
    return { ok: false, error: 'Amount is unrealistically large.' };
  }

  if (frequencyRaw !== 'monthly' && frequencyRaw !== 'annual') {
    return { ok: false, error: 'Frequency must be monthly or annual.' };
  }
  const frequency: Frequency = frequencyRaw;

  const rate = rateRaw ? Number(rateRaw) : DEFAULT_WITHDRAWAL_RATE;
  if (
    !Number.isFinite(rate) ||
    rate < MIN_WITHDRAWAL_RATE ||
    rate > MAX_WITHDRAWAL_RATE
  ) {
    return {
      ok: false,
      error: `Withdrawal rate must be between ${MIN_WITHDRAWAL_RATE}% and ${MAX_WITHDRAWAL_RATE}%.`,
    };
  }

  return {
    ok: true,
    values: {
      name,
      amount: Math.round(amount * 100) / 100, // 2-decimal precision
      frequency,
      withdrawal_rate: Math.round(rate * 100) / 100,
    },
  };
}

export async function addExpense(formData: FormData): Promise<ActionResult> {
  const parsed = parseExpenseFields(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    ...parsed.values,
  });

  if (error) {
    return { ok: false, error: `Could not save: ${error.message}` };
  }

  revalidatePath('/dashboard');
  return { ok: true };
}

export async function updateExpense(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  if (!id) return { ok: false, error: 'Expense ID is required.' };

  const parsed = parseExpenseFields(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { error } = await supabase
    .from('expenses')
    .update(parsed.values)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { ok: false, error: `Could not update: ${error.message}` };
  }

  revalidatePath('/dashboard');
  return { ok: true };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: 'Expense ID is required.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { ok: false, error: `Could not delete: ${error.message}` };
  }

  revalidatePath('/dashboard');
  return { ok: true };
}
