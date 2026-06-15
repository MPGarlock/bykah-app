import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type {
  Bucket,
  BudgetCategory,
  BudgetTransaction,
  BudgetSettings,
  CategoryWithStats,
} from '@/lib/budget-tracker/types';
import {
  BUCKETS,
  BUCKET_LABEL,
  DEFAULT_NEEDS_PCT,
  DEFAULT_WANTS_PCT,
  DEFAULT_INVESTMENTS_PCT,
} from '@/lib/budget-tracker/types';
import { buildCategoryStats, buildBucketSummaries, currentMonthLabel, startOfCurrentMonth, } from '@/lib/budget-tracker/math';
import { CreateCategoryForm } from './_components/create-category-form';
import { CategoryCard } from './_components/category-card';
import { BudgetSettingsForm } from './_components/budget-settings-form';
import { BucketBreakdown } from './_components/bucket-breakdown';
import SubscriptionToggles from './_components/subscription-toggles';
import { AuditCTA } from '@/components/AuditCTA';
import { UpgradePrompt } from '@/components/UpgradePrompt';

function startOfNextMonthISO(): string {
  const d = new Date();
  const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, '0');
  const day = String(next.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfMonthISO(): string {
  const d = startOfCurrentMonth();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default async function BudgetTrackerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user?.id ?? '').single();
  const isPlusUser = profile?.plan === 'pro';

  const monthStart = startOfMonthISO();
  const monthEnd = startOfNextMonthISO();

  const [{ data: categories }, { data: transactions }, { data: settingsRow }] = await Promise.all([
    supabase
      .from('budget_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('budget_transactions')
      .select('*')
      .gte('transacted_at', monthStart)
      .lt('transacted_at', monthEnd)
      .order('transacted_at', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('budget_settings').select('*').maybeSingle(),
  ]);

  const categoryList: BudgetCategory[] = categories ?? [];
  const transactionList: BudgetTransaction[] = transactions ?? [];
  const settings = (settingsRow as BudgetSettings | null) ?? null;

  // Group transactions by category_id
  const txByCategory = new Map<string, BudgetTransaction[]>();
  for (const t of transactionList) {
    const arr = txByCategory.get(t.category_id) ?? [];
    arr.push(t);
    txByCategory.set(t.category_id, arr);
  }

  const categoriesWithStats: CategoryWithStats[] = categoryList.map((c) =>
    buildCategoryStats(c, txByCategory.get(c.id) ?? []),
  );

  const planSettings = {
    monthly_income: settings?.monthly_income ?? 0,
    needs_pct: settings?.needs_pct ?? DEFAULT_NEEDS_PCT,
    wants_pct: settings?.wants_pct ?? DEFAULT_WANTS_PCT,
    investments_pct: settings?.investments_pct ?? DEFAULT_INVESTMENTS_PCT,
  };

  const summaries = buildBucketSummaries(categoriesWithStats, planSettings);

  const hasCategories = categoriesWithStats.length > 0;

  const addedSubscriptionNames = categoryList
    .filter((c) => c.bucket === 'wants' && c.item_type === 'fixed_bill')
    .map((c) => c.name);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
          This Month
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gold-light">
          Budget Tracker
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-muted max-w-2xl">
          {currentMonthLabel()} spending vs. your monthly budgets, organized by the 50/30/20 guideline. Log transactions as they happen.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/budget-tracker/import"
          className="inline-flex items-center gap-2 rounded-lg border border-gold/30 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gold-light hover:bg-gold/10 transition-colors"
        >
          Import bank statement (CSV)
        </Link>
      </div>

      {/* 50/30/20 plan */}
      <BucketBreakdown summaries={summaries} income={planSettings.monthly_income} />

      {/* Income & targets settings */}
      <div className="mb-10">
        <BudgetSettingsForm settings={settings} />
      </div>

      {/* Categories grouped by bucket, or empty state */}
      {!hasCategories ? (
        <div className="mb-10">
          <h2 className="font-serif text-xl font-bold text-gold-light mb-4">
            Add your first category
          </h2>
          <CreateCategoryForm />
        </div>
      ) : (
        <div className="space-y-10 mb-10">
          {BUCKETS.map((b) => {
            const inBucket = categoriesWithStats.filter(
              (c) => c.bucket === (b.value as Bucket),
            );
            if (inBucket.length === 0) return null;
            return (
              <div key={b.value}>
                <h2 className="font-serif text-xl font-bold text-gold-light mb-1">
                  {BUCKET_LABEL[b.value]}
                </h2>
                <p className="text-xs text-slate-subtle mb-4">{b.blurb}</p>
                <div className="space-y-6">
                  {inBucket.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              </div>
            );
          })}
          <div className="pt-6 border-t border-white/[0.08]">
            <h2 className="font-serif text-lg font-bold text-gold-light mb-4">
              Add another category
            </h2>
            <CreateCategoryForm />
          </div>
        </div>
      )}

      {/* Audit CTA */}
      <AuditCTA />

      {/* Subscription Toggles */}
      {isPlusUser ? <SubscriptionToggles addedNames={addedSubscriptionNames} /> : <UpgradePrompt featureName="Subscription Tracker" />}

      <p className="mt-12 text-xs text-slate-subtle text-center max-w-2xl mx-auto">
        Educational tool only. Not financial advice. The 50/30/20 split is a general guideline, not a recommendation. Budgets reset at the start of each calendar month.
      </p>
    </div>
  );
}
