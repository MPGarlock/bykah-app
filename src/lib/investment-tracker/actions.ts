/**
 * BYKAH Investment Tracker — Server Actions for account CRUD.
 *
 * All actions:
 *  - Require an authenticated user (Supabase RLS also enforces this).
 *  - Validate input and return { ok, error } shape.
 *  - revalidatePath('/dashboard/investment-tracker') and '/dashboard' so
 *    both the module page and the dashboard summary card refresh.
 */
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  ACCOUNT_NAME_MAX,
  ACCOUNT_TYPES,
  BALANCE_MIN,
  BALANCE_MAX,
} from './types';
import type { AccountType } from './types';

type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateAll() {
  revalidatePath('/dashboard/investment-tracker');
  revalidatePath('/dashboard');
}

/** Validate account fields from form data. */
function parseAccountFields(formData: FormData):
  | {
      ok: true;
      values: {
        name: string;
        account_type: AccountType;
        current_balance: number;
      };
    }
  | { ok: false; error: string } {
  const name = String(formData.get('name') ?? '').trim();
  const typeRaw = String(formData.get('account_type') ?? '').trim();
  const balanceRaw = String(formData.get('current_balance') ?? '').trim();

  if (!name) return { ok: false, error: 'Account name is required.' };
  if (name.length > ACCOUNT_NAME_MAX) {
    return {
      ok: false,
      error: `Name must be ${ACCOUNT_NAME_MAX} characters or fewer.`,
    };
  }

  if (!ACCOUNT_TYPES.includes(typeRaw as AccountType)) {
    return { ok: false, error: 'Invalid account type.' };
  }
  const account_type = typeRaw as AccountType;

  const current_balance = Number(balanceRaw);
  if (!Number.isFinite(current_balance) || current_balance < BALANCE_MIN) {
    return {
      ok: false,
      error: 'Balance must be zero or a positive number.',
    };
  }
  if (current_balance > BALANCE_MAX) {
    return { ok: false, error: 'Balance is unrealistically large.' };
  }

  return {
    ok: true,
    values: {
      name,
      account_type,
      current_balance: Math.round(current_balance * 100) / 100,
    },
  };
}

export async function createAccount(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseAccountFields(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { error } = await supabase.from('investment_accounts').insert({
    user_id: user.id,
    ...parsed.values,
  });

  if (error) {
    return { ok: false, error: `Could not create account: ${error.message}` };
  }

  revalidateAll();
  return { ok: true };
}

export async function updateAccount(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  if (!id) return { ok: false, error: 'Account ID is required.' };

  const parsed = parseAccountFields(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { error } = await supabase
    .from('investment_accounts')
    .update(parsed.values)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { ok: false, error: `Could not update account: ${error.message}` };
  }

  revalidateAll();
  return { ok: true };
}

export async function deleteAccount(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: 'Account ID is required.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { error } = await supabase
    .from('investment_accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { ok: false, error: `Could not delete account: ${error.message}` };
  }

  revalidateAll();
  return { ok: true };
}
