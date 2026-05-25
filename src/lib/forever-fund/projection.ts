/**
 * BYKAH Forever Fund — projection math.
 *
 * Projects portfolio growth year-by-year using compound interest + monthly contributions.
 * For each year, calculates which expense Forever Numbers become covered.
 */

import type { Expense } from './types';
import { expenseForeverNumber } from './math';

export interface YearProjection {
  year: number;
  portfolio: number;
  newlyCovered: string[];
  allCoveredCount: number;
  isFullyCovered: boolean;
  coveragePercent: number;
}

export interface Milestone {
  name: string;
  year: number;
}

export interface ProjectionResult {
  years: YearProjection[];
  fullyFundedYear: number | null;
  totalForeverNumber: number;
  firstMilestone: Milestone | null;
  milestones: Milestone[];
}

export function projectForeverFund(
  currentPortfolio: number,
  monthlyContribution: number,
  annualReturnRate: number,
  expenses: Expense[],
  maxYears = 50,
): ProjectionResult {
  const rate = annualReturnRate / 100;
  const annualContribution = monthlyContribution * 12;

  const expenseTargets = expenses
    .map((e) => ({
      id: e.id,
      name: e.name,
      foreverNumber: expenseForeverNumber(e),
    }))
    .sort((a, b) => a.foreverNumber - b.foreverNumber);

  const totalTarget = expenseTargets.reduce((sum, e) => sum + e.foreverNumber, 0);
  const coveredIds = new Set<string>();
  const years: YearProjection[] = [];
  const milestones: Milestone[] = [];
  let portfolio = currentPortfolio;
  let fullyFundedYear: number | null = null;

  for (let year = 1; year <= maxYears; year++) {
    portfolio = portfolio * (1 + rate) + annualContribution;

    const newlyCovered: string[] = [];
    for (const expense of expenseTargets) {
      if (!coveredIds.has(expense.id) && portfolio >= expense.foreverNumber) {
        coveredIds.add(expense.id);
        newlyCovered.push(expense.name);
        milestones.push({ name: expense.name, year });
      }
    }

    const isFullyCovered = totalTarget > 0 && portfolio >= totalTarget;
    const coveragePercent =
      totalTarget > 0 ? Math.min(100, (portfolio / totalTarget) * 100) : 0;

    years.push({
      year,
      portfolio,
      newlyCovered,
      allCoveredCount: coveredIds.size,
      isFullyCovered,
      coveragePercent,
    });

    if (isFullyCovered && fullyFundedYear === null) {
      fullyFundedYear = year;
      break;
    }
  }

  return {
    years,
    fullyFundedYear,
    totalForeverNumber: totalTarget,
    firstMilestone: milestones[0] ?? null,
    milestones,
  };
}
