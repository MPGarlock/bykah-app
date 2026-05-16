/**
 * BYKAH Kids House Fund — Server Actions for fund + contribution CRUD.
 *
 * All actions:
 *  - Require an authenticated user (Supabase RLS also enforces this).
 *  - Validate input and return { ok, error } shape.
 *  - revalidatePath('/dashboard/kids-house-fund') and '/dashboard' so
 *    both the module page and the dashboard summary card refresh.
 */
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  FUND_NAME_MAX,
  NOTE_MAX,
  TARGET_MIN,
  TARGET_MAX,
  AMOUNT_MIN,
  AMOUNT_MAX,
} from './types';

type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateAll() {
  revalidatePath('/dashboard/kids-house-fund');
  revalidatePath('/dashboard');
}

/** Validate fund name + target. */
function parseFundFields(formData: FormData):
  | { ok: true; values: { name: string; target_amount: number } }
  | { ok: false; error: string } {
  const name = String(formData.get('name') ?? '').trim();
  const targetRaw = String(formData.get('target_amount') ?? '').trim();

  if (!name) return { ok: false, error: 'Fund name is required.' };
  if (name.length > FUND_NAME_MAX) {
    return { ok: false, error: `Name must be ${FUND_NAME_MAX} characters or fewer.` };
  }

  const target_amount = Number(targetRaw);
  if (!Number.isFinite(target_amount) || target_amount < TARGET_MIN) {
    return { ok: false, error: 'Target amount must be a positive number.' };
  }
  if (target_amount > TARGET_MAX) {
    return { ok: false, error: 'Target amount is unrealistically large.' };
  }

  return {
    ok: true,
    values: {
      name,
      target_amount: Math.round(target_amount * 100) / 100,
    },
  };
}

/** Validate contribution amount + note + date. */
function parseContributionFields(formData: FormData):
  | { ok: true; values: { amount: number; note: string | null; contributed_at: string } }
  | { ok: false; error: string } {
  const amountRaw = String(formData.get('amount') ?? '').trim();
  const noteRaw = String(formData.get('note') ?? '').trim();
  const dateRaw = String(formData.get('contributed_at') ?? '').trim();

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount < AMOUNT_MIN) {
    return { ok: false, error: 'Amount must be a positive number.' };
  }
  if (amount > AMOUNT_MAX) {
    return { ok: false, error: 'Amount is unrealistically large.' };
  }

  if (noteRaw.length > NOTE_MAX) {
    return { ok: false, error: `Note must be ${NOTE_MAX} characters or fewer.` };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateRaw)) {
    return { ok: false, error: 'Date must be in YYYY-MM-DD format.' };
  }
  const parsedDate = new Date(dateRaw);
  if (Number.isNaN(parsedDate.getTime())) {
    return { ok: false, error: 'Date is invalid.' };
  }

  return {
    ok: true,
    values: {
      amount: Math.round(amount * 100) / 100,
      note: noteRaw || null,
      contributed_at: dateRaw,
    },
  };
}

export async function createFund(formData: FormData): Promise<ActionResult> {
  const parsed = parseFundFields(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { error } = await supabase.from('kids_house_funds').insert({
    user_id: user.id,
    ...parsed.values,
  });

  if (error) return { ok: false, error: `Could not create fund: ${error.message}` };

  revalidateAll();
  return { ok: true };
}

export async function updateFund(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  if (!id) return { ok: false, error: 'Fund ID is required.' };

  const parsed = parseFundFields(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { error } = await supabase
    .from('kids_house_funds')
    .update(parsed.values)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { ok: false, error: `Could not update fund: ${error.message}` };

  revalidateAll();
  return { ok: true };
}

export async function deleteFund(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: 'Fund ID is required.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { error } = await supabase
    .from('kids_house_funds')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { ok: false, error: `Could not delete fund: ${error.message}` };

  revalidateAll();
  return { ok: true };
}

export async function addContribution(
  fundId: string,
  formData: FormData,
): Promise<ActionResult> {
  if (!fundId) return { ok: false, error: 'Fund ID is required.' };

  const parsed = parseContributionFields(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  // Verify the fund belongs to the user (defense-in-depth; RLS will also enforce)
  const { data: fund } = await supabase
    .from('kids_house_funds')
    .select('id')
    .eq('id', fundId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!fund) return { ok: false, error: 'Fund not found.' };

  const { error } = await supabase.from('kids_house_contributions').insert({
    fund_id: fundId,
    user_id: user.id,
    ...parsed.values,
  });

  if (error) {
    return { ok: false, error: `Could not add contribution: ${error.message}` };
  }

  revalidateAll();
  return { ok: true };
}

export async function updateContribution(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  if (!id) return { ok: false, error: 'Contribution ID is required.' };

  const parsed = parseContributionFields(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { error } = await supabase
    .from('kids_house_contributions')
    .update(parsed.values)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { ok: false, error: `Could not update contribution: ${error.message}` };
  }

  revalidateAll();
  return { ok: true };
}

export async function deleteContribution(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: 'Contribution ID is required.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { error } = await supabase
    .from('kids_house_contributions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { ok: false, error: `Could not delete contribution: ${error.message}` };
  }

  revalidateAll();
  return { ok: true };
}
