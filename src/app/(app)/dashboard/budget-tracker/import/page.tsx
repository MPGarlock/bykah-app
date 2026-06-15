import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { BudgetCategory } from '@/lib/budget-tracker/types';
import { ImportClient } from './_components/import-client';

export default async function ImportTransactionsPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('budget_categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  const categoryList: BudgetCategory[] = categories ?? [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
          Budget Tracker
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gold-light">
          Import Bank Transactions
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-muted max-w-2xl">
          Upload a CSV export from your bank and we&apos;ll sort each transaction into your 50/30/20 categories automatically. Review and adjust before importing — nothing is saved until you confirm.
        </p>
        <Link
          href="/dashboard/budget-tracker"
          className="inline-block mt-3 text-xs uppercase tracking-widest underline text-slate-muted hover:text-gold"
        >
          ← Back to Budget Tracker
        </Link>
      </div>

      {categoryList.length === 0 ? (
        <div className="rounded-2xl p-6 md:p-8 bg-white/[0.03] border border-white/[0.08]">
          <h2 className="font-serif text-xl font-bold text-gold-light mb-2">
            Add a category first
          </h2>
          <p className="text-sm text-slate-muted mb-4">
            You don&apos;t have any budget categories yet. Head back to the Budget Tracker and add at least one category under Needs, Wants, or Investments — then come back here to import transactions.
          </p>
          <Link href="/dashboard/budget-tracker" className="btn-primary inline-block">
            Go to Budget Tracker
          </Link>
        </div>
      ) : (
        <ImportClient categories={categoryList} />
      )}
    </div>
  );
}
