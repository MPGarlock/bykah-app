/**
 * BYKAH Budget Tracker — Server Actions for category + transaction CRUD
 * and the per-user 50/30/20 plan settings.
 *
 * All actions:
 *  - Require an authenticated user (Supabase RLS also enforces this).
 *  - Validate input and return { ok, error } shape.
 *  - revalidatePath('/dashboard/budget-tracker') and '/dashboard' so both
 *    refresh.
 */
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  CATEGORY_NAME_MAX,
  NOTE_MAX,
  BUDGET_MIN,
  BUDGET_MAX,
  AMOUNT_MIN,
  AMOUNT_MAX,
  INCOME_MAX,
  DUE_DAY_MIN,
  DUE_DAY_MAX,
  type Bucket,
  type ItemType,
} from './types';
import { percentagesAreValid } from './math';

type ActionResult = { ok: true } | { ok: false; error: string };

const VALID_BUCKETS: Bucket[] = ['needs', 'wants', 'investments'];

function revalidateAll() {
  revalidatePath('/dashboard/budget-tracker');
  revalidatePath('/dashboard');
}

function parseCategoryFields(formData: FormData):
  | {
      ok: true;
      values: {
        name: string;
        monthly_budget: number;
        bucket: Bucket;
        item_type: ItemType;
        due_day: number | null;
      };
    }
  | { ok: false; error: string } {
  const name = String(formData.get('name') ?? '').trim();
  const budgetRaw = String(formData.get('monthly_budget') ?? '').trim();
  const bucketRaw = String(formData.get('bucket') ?? 'needs').trim();
  const itemTypeRaw = String(formData.get('item_type') ?? 'bucket').trim();
  const dueDayRaw = String(formData.get('due_day') ?? '').trim();

  if (!name) return { ok: false, error: 'Category name is required.' };
  if (name.length > CATEGORY_NAME_MAX) {
    return {
      ok: false,
      error: `Name must be ${CATEGORY_NAME_MAX} characters or fewer.`,
    };
  }

  const monthly_budget = Number(budgetRaw);
  if (!Number.isFinite(monthly_budget) || monthly_budget < BUDGET_MIN) {
    return {
      ok: false,
      error: 'Budget must be zero or a positive number.',
    };
  }
  if (monthly_budget > BUDGET_MAX) {
    return { ok: false, error: 'Budget is unrealistically large.' };
  }

  const bucket = VALID_BUCKETS.includes(bucketRaw as Bucket)
    ? (bucketRaw as Bucket)
    : 'needs';

  const item_type: ItemType =
    itemTypeRaw === 'fixed_bill' ? 'fixed_bill' : 'bucket';

  let due_day: number | null = null;
  if (item_type === 'fixed_bill' && dueDayRaw) {
    const parsedDueDay = Math.round(Number(dueDayRaw));
    if (
      !Number.isFinite(parsedDueDay) ||
      parsedDueDay < DUE_DAY_MIN ||
      parsedDueDay > DUE_DAY_MAX
    ) {
      return {
        ok: false,
        error: `Due day must be between ${DUE_DAY_MIN} and ${DUE_DAY_MAX}.`,
      };
    }
    due_day = parsedDueDay;
  }

  return {
    ok: true,
    values: {
      name,
      monthly_budget: Math.round(monthly_budget * 100) / 100,
      bucket,
      item_type,
      due_day,
    },
  };
}

function parseTransactionFields(formData: FormData):
  | {
      ok: true;
      values: {
        amount: number;
        note: string | null;
        transacted_at: string;
      };
    }
  | { ok: false; error: string } {
  const amountRaw = String(formData.get('amount') ?? '').trim();
  const noteRaw = String(formData.get('note') ?? '').trim();
  const dateRaw = String(formData.get('transacted_at') ?? '').trim();

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
  const parsed = new Date(dateRaw);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, error: 'Date is invalid.' };
  }

  return {
    ok: true,
    values: {
      amount: Math.round(amount * 100) / 100,
      note: noteRaw || null,
      transacted_at: dateRaw,
    },
  };
}

export async function createCategory(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseCategoryFields(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { error } = await supabase.from('budget_categories').insert({
    user_id: user.id,
    ...parsed.values,
  });

  if (error) {
    return { ok: false, error: `Could not create category: ${error.message}` };
  }

  revalidateAll();
  return { ok: true };
}

export async function updateCategory(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  if (!id) return { ok: false, error: 'Category ID is required.' };

  const parsed = parseCategoryFields(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { error } = await supabase
    .from('budget_categories')
    .update(parsed.values)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { ok: false, error: `Could not update category: ${error.message}` };
  }

  revalidateAll();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: 'Category ID is required.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { error } = await supabase
    .from('budget_categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { ok: false, error: `Could not delete category: ${error.message}` };
  }

  revalidateAll();
  return { ok: true };
}

export async function addTransaction(
  categoryId: string,
  formData: FormData,
): Promise<ActionResult> {
  if (!categoryId) return { ok: false, error: 'Category ID is required.' };

  const parsed = parseTransactionFields(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  // Verify the category belongs to the user
  const { data: category } = await supabase
    .from('budget_categories')
    .select('id')
    .eq('id', categoryId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!category) return { ok: false, error: 'Category not found.' };

  const { error } = await supabase.from('budget_transactions').insert({
    category_id: categoryId,
    user_id: user.id,
    ...parsed.values,
  });

  if (error) {
    return {
      ok: false,
      error: `Could not add transaction: ${error.message}`,
    };
  }

  revalidateAll();
  return { ok: true };
}

export async function updateTransaction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  if (!id) return { ok: false, error: 'Transaction ID is required.' };

  const parsed = parseTransactionFields(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { error } = await supabase
    .from('budget_transactions')
    .update(parsed.values)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return {
      ok: false,
      error: `Could not update transaction: ${error.message}`,
    };
  }

  revalidateAll();
  return { ok: true };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: 'Transaction ID is required.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { error } = await supabase
    .from('budget_transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return {
      ok: false,
      error: `Could not delete transaction: ${error.message}`,
    };
  }

  revalidateAll();
  return { ok: true };
}

/**
 * Upsert the per-user 50/30/20 plan: post-tax monthly income + the three
 * percentages (which must sum to 100).
 */
export async function updateBudgetSettings(
  formData: FormData,
): Promise<ActionResult> {
  const incomeRaw = String(formData.get('monthly_income') ?? '').trim();
  const needsRaw = String(formData.get('needs_pct') ?? '').trim();
  const wantsRaw = String(formData.get('wants_pct') ?? '').trim();
  const investmentsRaw = String(formData.get('investments_pct') ?? '').trim();

  const monthly_income = Number(incomeRaw);
  if (!Number.isFinite(monthly_income) || monthly_income < 0) {
    return { ok: false, error: 'Income must be zero or a positive number.' };
  }
  if (monthly_income > INCOME_MAX) {
    return { ok: false, error: 'Income is unrealistically large.' };
  }

  const needs_pct = Math.round(Number(needsRaw));
  const wants_pct = Math.round(Number(wantsRaw));
  const investments_pct = Math.round(Number(investmentsRaw));

  if (!percentagesAreValid(needs_pct, wants_pct, investments_pct)) {
    return {
      ok: false,
      error: 'Needs, Wants, and Investments percentages must each be 0–100 and add up to exactly 100.',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { error } = await supabase.from('budget_settings').upsert(
    {
      user_id: user.id,
      monthly_income: Math.round(monthly_income * 100) / 100,
      needs_pct,
      wants_pct,
      investments_pct,
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    return { ok: false, error: `Could not save settings: ${error.message}` };
  }

  revalidateAll();
  return { ok: true };
}

/**
 * Mark a fixed-bill category as paid for the current month by logging a
 * transaction equal to its monthly budget.
 */
export async function markBillPaid(categoryId: string): Promise<ActionResult> {
  if (!categoryId) return { ok: false, error: 'Category ID is required.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { data: category } = await supabase
    .from('budget_categories')
    .select('id, monthly_budget, item_type')
    .eq('id', categoryId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!category) return { ok: false, error: 'Category not found.' };
  if (category.item_type !== 'fixed_bill') {
    return { ok: false, error: 'Only fixed bills can be marked as paid.' };
  }

  const today = new Date();
  const transacted_at = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const { error } = await supabase.from('budget_transactions').insert({
    category_id: categoryId,
    user_id: user.id,
    amount: category.monthly_budget,
    note: 'Paid',
    transacted_at,
  });

  if (error) {
    return { ok: false, error: `Could not mark bill as paid: ${error.message}` };
  }

  revalidateAll();
  return { ok: true };
}

/**
 * Mark a fixed-bill category as unpaid for the current month by removing
 * this month's transactions for it.
 */
export async function markBillUnpaid(categoryId: string): Promise<ActionResult> {
  if (!categoryId) return { ok: false, error: 'Category ID is required.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;

  const { error } = await supabase
    .from('budget_transactions')
    .delete()
    .eq('category_id', categoryId)
    .eq('user_id', user.id)
    .gte('transacted_at', monthStart)
    .lt('transacted_at', monthEnd);

  if (error) {
    return { ok: false, error: `Could not mark bill as unpaid: ${error.message}` };
  }

  revalidateAll();
  return { ok: true };
}

/**
 * Toggle a subscription preset in/out of the user's budget as a Fixed Bill
 * in the "wants" bucket. Adding creates a new category; removing deletes it.
 */
export async function setSubscriptionCategory(
  name: string,
  monthlyAmount: number,
  enabled: boolean,
): Promise<ActionResult> {
  const trimmedName = name.trim();
  if (!trimmedName) return { ok: false, error: 'Subscription name is required.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { data: existing } = await supabase
    .from('budget_categories')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', trimmedName)
    .eq('bucket', 'wants')
    .eq('item_type', 'fixed_bill')
    .maybeSingle();

  if (enabled) {
    if (existing) return { ok: true };

    const { error } = await supabase.from('budget_categories').insert({
      user_id: user.id,
      name: trimmedName,
      monthly_budget: Math.round(monthlyAmount * 100) / 100,
      bucket: 'wants',
      item_type: 'fixed_bill',
    });

    if (error) {
      return { ok: false, error: `Could not add subscription: ${error.message}` };
    }
  } else {
    if (!existing) return { ok: true };

    const { error } = await supabase
      .from('budget_categories')
      .delete()
      .eq('id', existing.id)
      .eq('user_id', user.id);

    if (error) {
      return { ok: false, error: `Could not remove subscription: ${error.message}` };
    }
  }

  revalidateAll();
  return { ok: true };
}

/**
 * Bulk-insert transactions parsed from a CSV import after the user has
 * reviewed/adjusted category assignments in the UI.
 */
export interface ImportTransactionItem {
  category_id: string;
  amount: number;
  note: string | null;
  transacted_at: string; // YYYY-MM-DD
}

export type ImportResult =
  | { ok: true; inserted: number }
  | { ok: false; error: string };

export async function importTransactions(
  items: ImportTransactionItem[],
): Promise<ImportResult> {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: 'No transactions to import.' };
  }
  if (items.length > 500) {
    return { ok: false, error: 'Too many transactions in one import (max 500). Try splitting your file.' };
  }

  for (const item of items) {
    if (!item.category_id) {
      return { ok: false, error: 'Every transaction must be assigned a category.' };
    }
    if (!Number.isFinite(item.amount) || item.amount < AMOUNT_MIN || item.amount > AMOUNT_MAX) {
      return { ok: false, error: 'One or more transaction amounts are invalid.' };
    }
    if (item.note && item.note.length > NOTE_MAX) {
      return { ok: false, error: `Notes must be ${NOTE_MAX} characters or fewer.` };
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.transacted_at)) {
      return { ok: false, error: 'One or more transaction dates are invalid.' };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  // Verify every referenced category belongs to this user
  const categoryIds = Array.from(new Set(items.map((i) => i.category_id)));
  const { data: ownedCategories, error: catError } = await supabase
    .from('budget_categories')
    .select('id')
    .eq('user_id', user.id)
    .in('id', categoryIds);

  if (catError) {
    return { ok: false, error: `Could not verify categories: ${catError.message}` };
  }

  const ownedIds = new Set((ownedCategories ?? []).map((c) => c.id));
  if (categoryIds.some((id) => !ownedIds.has(id))) {
    return { ok: false, error: 'One or more categories were not found.' };
  }

  const rows = items.map((item) => ({
    category_id: item.category_id,
    user_id: user.id,
    amount: Math.round(item.amount * 100) / 100,
    note: item.note?.trim() ? item.note.trim().slice(0, NOTE_MAX) : null,
    transacted_at: item.transacted_at,
  }));

  const { error } = await supabase.from('budget_transactions').insert(rows);

  if (error) {
    return { ok: false, error: `Could not import transactions: ${error.message}` };
  }

  revalidateAll();
  return { ok: true, inserted: rows.length };
}
