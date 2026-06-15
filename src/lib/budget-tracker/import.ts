import type { BudgetCategory, Bucket } from './types';

/**
 * Parsed CSV row before categorization.
 */
export interface ParsedTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // always positive (spend amount)
  suggestedCategoryId: string | null;
  suggestedBucket: Bucket | null;
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  skippedRows: number;
  error?: string;
}

/**
 * Parse raw CSV text into rows of string cells.
 * Handles quoted fields with embedded commas, quotes, and newlines (RFC4180-ish).
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  // Normalize line endings
  const input = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (char === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
      continue;
    }

    field += char;
  }

  // Final field/row
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop fully-empty trailing rows
  return rows.filter((r) => r.some((cell) => cell.trim().length > 0));
}

interface ColumnMap {
  dateIdx: number;
  descriptionIdx: number;
  amountIdx: number | null;
  debitIdx: number | null;
  creditIdx: number | null;
}

const DATE_HEADER_HINTS = ['date', 'transaction date', 'posted date', 'posting date'];
const DESC_HEADER_HINTS = ['description', 'memo', 'name', 'payee', 'transaction', 'details'];
const AMOUNT_HEADER_HINTS = ['amount', 'amt'];
const DEBIT_HEADER_HINTS = ['debit', 'withdrawal', 'withdrawals'];
const CREDIT_HEADER_HINTS = ['credit', 'deposit', 'deposits'];

function findHeaderIndex(headers: string[], hints: string[]): number | null {
  const normalized = headers.map((h) => h.trim().toLowerCase());
  for (const hint of hints) {
    const idx = normalized.findIndex((h) => h === hint);
    if (idx !== -1) return idx;
  }
  for (const hint of hints) {
    const idx = normalized.findIndex((h) => h.includes(hint));
    if (idx !== -1) return idx;
  }
  return null;
}

/**
 * Detect which columns hold date / description / amount(s) from a header row.
 * Returns null if the header row doesn't look like a recognizable bank export.
 */
export function detectColumns(headers: string[]): ColumnMap | null {
  const dateIdx = findHeaderIndex(headers, DATE_HEADER_HINTS);
  const descriptionIdx = findHeaderIndex(headers, DESC_HEADER_HINTS);
  const amountIdx = findHeaderIndex(headers, AMOUNT_HEADER_HINTS);
  const debitIdx = findHeaderIndex(headers, DEBIT_HEADER_HINTS);
  const creditIdx = findHeaderIndex(headers, CREDIT_HEADER_HINTS);

  if (dateIdx === null || descriptionIdx === null) return null;
  if (amountIdx === null && debitIdx === null && creditIdx === null) return null;

  return { dateIdx, descriptionIdx, amountIdx, debitIdx, creditIdx };
}

/**
 * Parse a date string in common bank export formats into YYYY-MM-DD.
 * Supports: YYYY-MM-DD, MM/DD/YYYY, M/D/YYYY, MM-DD-YYYY.
 */
export function normalizeDate(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  // YYYY-MM-DD already
  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // MM/DD/YYYY or M/D/YYYY or MM-DD-YYYY
  const usMatch = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (usMatch) {
    const [, m, d, y] = usMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Fallback: try Date parsing
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return null;
}

function parseAmount(raw: string): number | null {
  const cleaned = raw.trim().replace(/[$,]/g, '');
  if (!cleaned) return null;

  // Handle parenthesized negatives: (12.34) => -12.34
  const parenMatch = cleaned.match(/^\((.+)\)$/);
  const normalized = parenMatch ? `-${parenMatch[1]}` : cleaned;

  const value = Number(normalized);
  if (Number.isNaN(value)) return null;
  return value;
}

/**
 * Convert raw CSV rows (including header) into spend transactions.
 * Only outflows (debits / negative amounts) are included — deposits and
 * credits are treated as income/transfers and skipped, since the budget
 * tracker tracks spending against monthly category budgets.
 */
export function buildTransactions(rows: string[][]): ParseResult {
  if (rows.length < 2) {
    return { transactions: [], skippedRows: 0, error: 'CSV file needs a header row and at least one transaction.' };
  }

  const headers = rows[0];
  const columns = detectColumns(headers);
  if (!columns) {
    return {
      transactions: [],
      skippedRows: 0,
      error:
        "Couldn't find Date / Description / Amount columns. Make sure your CSV has a header row with columns like Date, Description, and Amount (or Debit/Credit).",
    };
  }

  const transactions: ParsedTransaction[] = [];
  let skippedRows = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const dateRaw = row[columns.dateIdx] ?? '';
    const description = (row[columns.descriptionIdx] ?? '').trim();
    const date = normalizeDate(dateRaw);

    let spendAmount: number | null = null;

    if (columns.debitIdx !== null || columns.creditIdx !== null) {
      const debit = columns.debitIdx !== null ? parseAmount(row[columns.debitIdx] ?? '') : null;
      const credit = columns.creditIdx !== null ? parseAmount(row[columns.creditIdx] ?? '') : null;
      if (debit !== null && debit !== 0) {
        spendAmount = Math.abs(debit);
      } else if (credit !== null && credit !== 0) {
        // Credit/deposit — not a spend transaction, skip.
        spendAmount = null;
      }
    } else if (columns.amountIdx !== null) {
      const amount = parseAmount(row[columns.amountIdx] ?? '');
      if (amount !== null) {
        if (amount < 0) {
          spendAmount = Math.abs(amount);
        }
        // amount >= 0 => income/credit, skip
      }
    }

    if (!date || !description || spendAmount === null || spendAmount <= 0) {
      skippedRows++;
      continue;
    }

    transactions.push({
      id: `import-${i}-${Math.random().toString(36).slice(2, 9)}`,
      date,
      description,
      amount: Math.round(spendAmount * 100) / 100,
      suggestedCategoryId: null,
      suggestedBucket: null,
    });
  }

  return { transactions, skippedRows };
}

/**
 * Keyword -> {category name hint, bucket} dictionary used as a fallback
 * when a transaction description doesn't directly match an existing
 * category name.
 */
const KEYWORD_RULES: { keywords: string[]; categoryHints: string[]; bucket: Bucket }[] = [
  // Needs
  { keywords: ['rent', 'mortgage', 'apartment', 'property mgmt', 'landlord'], categoryHints: ['housing', 'rent', 'mortgage'], bucket: 'needs' },
  { keywords: ['grocery', 'groceries', 'market', 'walmart', 'kroger', 'trader joe', 'whole foods', 'safeway', 'costco', 'aldi', 'publix', 'sprouts', 'food lion', 'wegmans'], categoryHints: ['grocer', 'food'], bucket: 'needs' },
  { keywords: ['electric', 'pg&e', 'pge', 'duke energy', 'water dept', 'water utility', 'sewer', 'gas company', 'natural gas', 'comcast', 'xfinity', 'spectrum', 'at&t', 'verizon', 'tmobile', 't-mobile', 'internet'], categoryHints: ['utilit', 'bill'], bucket: 'needs' },
  { keywords: ['insurance', 'geico', 'progressive', 'allstate', 'state farm', 'usaa'], categoryHints: ['insurance'], bucket: 'needs' },
  { keywords: ['shell', 'chevron', 'exxon', 'mobil', 'bp gas', 'gas station', 'auto loan', 'car payment', 'dmv', 'parking'], categoryHints: ['car', 'auto', 'transport'], bucket: 'needs' },
  { keywords: ['pharmacy', 'cvs', 'walgreens', 'rite aid', 'doctor', 'medical', 'dental', 'urgent care', 'clinic'], categoryHints: ['health', 'medical'], bucket: 'needs' },
  { keywords: ['daycare', 'childcare', 'preschool', 'tuition'], categoryHints: ['child', 'daycare', 'education'], bucket: 'needs' },

  // Wants
  { keywords: ['restaurant', 'starbucks', 'mcdonald', 'chipotle', 'doordash', 'uber eats', 'ubereats', 'grubhub', 'pizza', 'cafe', 'coffee', 'bar', 'taco'], categoryHints: ['dining', 'restaurant', 'food out', 'eating out'], bucket: 'wants' },
  { keywords: ['netflix', 'spotify', 'hulu', 'disney+', 'disney plus', 'hbo', 'apple tv', 'youtube premium', 'movie', 'amc', 'theater', 'theatre'], categoryHints: ['entertainment', 'subscription', 'streaming'], bucket: 'wants' },
  { keywords: ['amazon', 'target', 'best buy', 'mall', 'shein', 'etsy', 'ebay'], categoryHints: ['shopping', 'personal'], bucket: 'wants' },
  { keywords: ['gym', 'planet fitness', 'membership', 'fitness'], categoryHints: ['gym', 'fitness', 'subscription'], bucket: 'wants' },
  { keywords: ['airline', 'airlines', 'hotel', 'airbnb', 'expedia', 'uber', 'lyft', 'rental car'], categoryHints: ['travel', 'vacation'], bucket: 'wants' },

  // Investments
  { keywords: ['transfer to savings', 'savings transfer', '401k', '401(k)', 'ira contribution', 'brokerage', 'vanguard', 'fidelity', 'schwab', 'robinhood', 'investment transfer'], categoryHints: ['invest', 'saving', 'forever fund', 'house fund'], bucket: 'investments' },
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9& ]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Assign a suggested category (and bucket) to each parsed transaction by:
 *  1. Direct match — the transaction description contains an existing
 *     category's name, or vice versa.
 *  2. Keyword rules — common merchant/keyword patterns mapped to a
 *     category-name hint + bucket; if a category whose name matches the
 *     hint exists, use it.
 *  3. No match — leave suggestedCategoryId null (shows up as
 *     "Uncategorized" in the review UI) but still suggest a bucket if a
 *     keyword rule matched.
 */
export function categorizeTransactions(
  transactions: ParsedTransaction[],
  categories: BudgetCategory[],
): ParsedTransaction[] {
  const normalizedCategories = categories.map((c) => ({
    category: c,
    normalizedName: normalize(c.name),
  }));

  return transactions.map((tx) => {
    const desc = normalize(tx.description);

    // 1. Direct category-name match
    for (const { category, normalizedName } of normalizedCategories) {
      if (!normalizedName) continue;
      if (desc.includes(normalizedName) || normalizedName.includes(desc)) {
        return { ...tx, suggestedCategoryId: category.id, suggestedBucket: category.bucket };
      }
    }

    // 2. Keyword rules
    for (const rule of KEYWORD_RULES) {
      const matchesKeyword = rule.keywords.some((kw) => desc.includes(kw));
      if (!matchesKeyword) continue;

      const matchingCategory = normalizedCategories.find(({ normalizedName }) =>
        rule.categoryHints.some((hint) => normalizedName.includes(hint)),
      );

      if (matchingCategory) {
        return {
          ...tx,
          suggestedCategoryId: matchingCategory.category.id,
          suggestedBucket: matchingCategory.category.bucket,
        };
      }

      // No matching category exists yet, but we know the bucket.
      return { ...tx, suggestedCategoryId: null, suggestedBucket: rule.bucket };
    }

    // 3. No match at all
    return { ...tx, suggestedCategoryId: null, suggestedBucket: null };
  });
}
