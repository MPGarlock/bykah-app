'use client';

import { useRef, useState, useTransition } from 'react';
import {
  parseCSV,
  buildTransactions,
  categorizeTransactions,
  type ParsedTransaction,
} from '@/lib/budget-tracker/import';
import {
  BUCKETS,
  BUCKET_LABEL,
  type BudgetCategory,
  type Bucket,
} from '@/lib/budget-tracker/types';
import { importTransactions } from '@/lib/budget-tracker/actions';
import { formatCurrencyDetailed } from '@/lib/forever-fund/math';

interface ReviewTransaction extends ParsedTransaction {
  categoryId: string | null;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ImportClient({ categories }: { categories: BudgetCategory[] }) {
  const [step, setStep] = useState<'upload' | 'review' | 'done'>('upload');
  const [items, setItems] = useState<ReviewTransaction[]>([]);
  const [error, setError] = useState('');
  const [skippedRows, setSkippedRows] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [resultMsg, setResultMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function processCSV(text: string) {
    const rows = parseCSV(text);
    const result = buildTransactions(rows);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.transactions.length === 0) {
      setError(
        'No spending transactions found in that file. (Deposits and credits are skipped automatically — only outflows are imported.)',
      );
      return;
    }

    const categorized = categorizeTransactions(result.transactions, categories);
    setItems(categorized.map((t) => ({ ...t, categoryId: t.suggestedCategoryId })));
    setSkippedRows(result.skippedRows);
    setError('');
    setStep('review');
  }

  function handleFile(file: File) {
    setError('');
    const reader = new FileReader();
    reader.onload = () => processCSV(String(reader.result ?? ''));
    reader.onerror = () => setError("Couldn't read that file.");
    reader.readAsText(file);
  }

  function moveItem(id: string, categoryId: string | null) {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, categoryId } : t)));
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDrop(e: React.DragEvent, categoryId: string | null) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) moveItem(id, categoryId);
  }

  function handleSubmit() {
    setError('');
    const toImport = items.filter((t): t is ReviewTransaction & { categoryId: string } => !!t.categoryId);

    if (toImport.length === 0) {
      setError('Assign at least one transaction to a category before importing.');
      return;
    }

    startTransition(async () => {
      const res = await importTransactions(
        toImport.map((t) => ({
          category_id: t.categoryId,
          amount: t.amount,
          note: t.description,
          transacted_at: t.date,
        })),
      );

      if (!res.ok) {
        setError(res.error);
        return;
      }

      const leftOver = items.length - toImport.length;
      setResultMsg(
        `Imported ${toImport.length} transaction${toImport.length === 1 ? '' : 's'}.` +
          (leftOver > 0
            ? ` ${leftOver} left uncategorized and ${leftOver === 1 ? 'was' : 'were'} not imported.`
            : ''),
      );
      setStep('done');
    });
  }

  function reset() {
    setItems([]);
    setError('');
    setResultMsg('');
    setSkippedRows(0);
    setStep('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  if (step === 'upload') {
    return (
      <div className="rounded-2xl p-6 md:p-8 bg-white/[0.03] border border-white/[0.08]">
        <h2 className="font-serif text-xl font-bold text-gold-light mb-2">
          Upload a bank statement (CSV)
        </h2>
        <p className="text-sm text-slate-muted mb-4 max-w-2xl">
          Export a CSV from your bank or credit card (with Date, Description, and Amount — or
          separate Debit/Credit columns) and upload it here. We&apos;ll suggest a category for
          each transaction. Deposits and other credits are skipped automatically since this
          tracks spending, not income.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="form-input"
        />
        {error && (
          <div className="mt-3 text-sm text-red-300 bg-red-900/20 border border-red-900/40 rounded-lg p-3">
            {error}
          </div>
        )}
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="rounded-2xl p-6 md:p-8 bg-white/[0.03] border border-white/[0.08] text-center">
        <h2 className="font-serif text-xl font-bold text-gold-light mb-2">Done!</h2>
        <p className="text-sm text-slate-muted mb-6">{resultMsg}</p>
        <button type="button" onClick={reset} className="btn-primary">
          Import another file
        </button>
      </div>
    );
  }

  const uncategorized = items.filter((t) => !t.categoryId);
  const categorizedCount = items.length - uncategorized.length;

  return (
    <div>
      <div className="rounded-2xl p-4 md:p-6 bg-gold/[0.04] border border-gold/20 mb-6">
        <p className="text-sm text-slate-muted">
          Found <span className="text-gold-light font-bold">{items.length}</span> transaction
          {items.length === 1 ? '' : 's'}
          {skippedRows > 0 && (
            <>
              {' '}
              ({skippedRows} row{skippedRows === 1 ? '' : 's'} skipped — deposits, credits, or
              unreadable rows)
            </>
          )}
          . Drag a transaction into the right category, or use its dropdown. Anything left in{' '}
          <span className="text-gold-light font-bold">Uncategorized</span> won&apos;t be imported.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <ReviewColumn
          title="Uncategorized"
          subtitle={`${uncategorized.length} to sort`}
          categoryId={null}
          items={uncategorized}
          categories={categories}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onSelectChange={moveItem}
        />

        {BUCKETS.map((b) =>
          categories
            .filter((c) => c.bucket === (b.value as Bucket))
            .map((cat) => (
              <ReviewColumn
                key={cat.id}
                title={cat.name}
                subtitle={BUCKET_LABEL[b.value as Bucket]}
                categoryId={cat.id}
                items={items.filter((t) => t.categoryId === cat.id)}
                categories={categories}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
                onSelectChange={moveItem}
              />
            )),
        )}
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-300 bg-red-900/20 border border-red-900/40 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 justify-end">
        <button
          type="button"
          onClick={reset}
          disabled={isPending}
          className="text-xs uppercase tracking-widest underline text-slate-muted hover:text-gold"
        >
          Start over
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || categorizedCount === 0}
          className="btn-primary"
        >
          {isPending
            ? 'Importing…'
            : `Import ${categorizedCount} transaction${categorizedCount === 1 ? '' : 's'}`}
        </button>
      </div>
    </div>
  );
}

function ReviewColumn({
  title,
  subtitle,
  categoryId,
  items,
  categories,
  onDrop,
  onDragStart,
  onSelectChange,
}: {
  title: string;
  subtitle: string;
  categoryId: string | null;
  items: ReviewTransaction[];
  categories: BudgetCategory[];
  onDrop: (e: React.DragEvent, categoryId: string | null) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onSelectChange: (id: string, categoryId: string | null) => void;
}) {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, categoryId)}
      className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06] min-h-[140px]"
    >
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gold-light truncate">{title}</h3>
        <p className="text-[10px] uppercase tracking-widest text-slate-subtle">{subtitle}</p>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-subtle italic">Drop transactions here</p>
      ) : (
        <div className="space-y-2">
          {items.map((t) => (
            <div
              key={t.id}
              draggable
              onDragStart={(e) => onDragStart(e, t.id)}
              className="rounded-lg p-2 bg-white/[0.03] border border-white/[0.06] cursor-move hover:border-gold/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-gold-light tabular-nums">
                  {formatCurrencyDetailed(t.amount)}
                </p>
                <p className="text-[10px] text-slate-subtle">{formatDate(t.date)}</p>
              </div>
              <p className="text-xs text-slate-muted truncate" title={t.description}>
                {t.description}
              </p>
              <select
                value={t.categoryId ?? ''}
                onChange={(e) => onSelectChange(t.id, e.target.value || null)}
                className="form-input mt-1 text-[10px] py-1"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
