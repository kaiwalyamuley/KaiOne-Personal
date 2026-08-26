import {
  Category,
  CategoryBudgetStatus,
  BudgetSummary,
  MonthlyCategoryBudget,
  Transaction,
} from '../types';

export const STORAGE_KEY_BUDGETS = 'pf_monthly_budgets_v1';

/**
 * Helper to get previous month string 'YYYY-MM'
 */
export function getPreviousMonth(monthStr: string): string {
  const [yearStr, monthNumStr] = monthStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthNumStr, 10);

  month -= 1;
  if (month < 1) {
    month = 12;
    year -= 1;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Helper to get next month string 'YYYY-MM'
 */
export function getNextMonth(monthStr: string): string {
  const [yearStr, monthNumStr] = monthStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthNumStr, 10);

  month += 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Format '2026-08' to 'August 2026'
 */
export function formatMonthYear(monthStr: string): string {
  try {
    const [yearStr, monthNumStr] = monthStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthNumStr, 10) - 1;
    const date = new Date(year, month, 1);
    return new Intl.DateTimeFormat('en-IN', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    return monthStr;
  }
}

/**
 * Format '2026-08' to short 'Aug 2026'
 */
export function formatShortMonthYear(monthStr: string): string {
  try {
    const [yearStr, monthNumStr] = monthStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthNumStr, 10) - 1;
    const date = new Date(year, month, 1);
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    return monthStr;
  }
}

/**
 * Current Month string in YYYY-MM
 */
export function getCurrentMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Default Base Monthly Budgets for Categories
 */
export const DEFAULT_CATEGORY_BASE_BUDGETS: Record<string, number> = {
  cat_food: 15000,
  cat_groceries: 10000,
  cat_transport: 2000, // Matching user prompt example
  cat_bills: 6000,
  cat_shopping: 5000,
  cat_health: 3000,
  cat_entertainment: 2500,
  cat_rent: 25000,
  cat_education: 4000,
  cat_personal: 2000,
  cat_misc_exp: 2000,
};

/**
 * Initial Sample Monthly Budgets seeding August 2026 & September 2026
 * Perfectly demonstrating the user's Transportation & Shopping rollover scenario!
 */
export const INITIAL_MONTHLY_BUDGETS: MonthlyCategoryBudget[] = [
  // August 2026 Budgets
  {
    id: 'budget_2026-08_cat_transport',
    month: '2026-08',
    categoryId: 'cat_transport',
    baseBudget: 2000,
    rolloverEnabled: true,
    manualRolloverOverride: null,
    notes: 'August base fuel and commute allocation',
  },
  {
    id: 'budget_2026-08_cat_shopping',
    month: '2026-08',
    categoryId: 'cat_shopping',
    baseBudget: 5000,
    rolloverEnabled: true,
    manualRolloverOverride: null,
    notes: 'Shopping budget',
  },
  {
    id: 'budget_2026-08_cat_food',
    month: '2026-08',
    categoryId: 'cat_food',
    baseBudget: 15000,
    rolloverEnabled: true,
    manualRolloverOverride: null,
  },
  {
    id: 'budget_2026-08_cat_groceries',
    month: '2026-08',
    categoryId: 'cat_groceries',
    baseBudget: 10000,
    rolloverEnabled: true,
    manualRolloverOverride: null,
  },
  {
    id: 'budget_2026-08_cat_bills',
    month: '2026-08',
    categoryId: 'cat_bills',
    baseBudget: 6000,
    rolloverEnabled: true,
    manualRolloverOverride: null,
  },
  {
    id: 'budget_2026-08_cat_entertainment',
    month: '2026-08',
    categoryId: 'cat_entertainment',
    baseBudget: 2500,
    rolloverEnabled: true,
    manualRolloverOverride: null,
  },
  {
    id: 'budget_2026-08_cat_health',
    month: '2026-08',
    categoryId: 'cat_health',
    baseBudget: 3000,
    rolloverEnabled: true,
    manualRolloverOverride: null,
  },
  {
    id: 'budget_2026-08_cat_personal',
    month: '2026-08',
    categoryId: 'cat_personal',
    baseBudget: 2000,
    rolloverEnabled: true,
    manualRolloverOverride: null,
  },
  {
    id: 'budget_2026-08_cat_misc_exp',
    month: '2026-08',
    categoryId: 'cat_misc_exp',
    baseBudget: 2000,
    rolloverEnabled: true,
    manualRolloverOverride: null,
  },

  // September 2026 Budgets (Auto-inherits Rollovers from August 2026!)
  {
    id: 'budget_2026-09_cat_transport',
    month: '2026-09',
    categoryId: 'cat_transport',
    baseBudget: 2000,
    rolloverEnabled: true,
    manualRolloverOverride: null,
    notes: 'September commute - rolls unspent surplus from August',
  },
  {
    id: 'budget_2026-09_cat_shopping',
    month: '2026-09',
    categoryId: 'cat_shopping',
    baseBudget: 5000,
    rolloverEnabled: true,
    manualRolloverOverride: null,
  },
  {
    id: 'budget_2026-09_cat_food',
    month: '2026-09',
    categoryId: 'cat_food',
    baseBudget: 15000,
    rolloverEnabled: true,
    manualRolloverOverride: null,
  },
  {
    id: 'budget_2026-09_cat_groceries',
    month: '2026-09',
    categoryId: 'cat_groceries',
    baseBudget: 10000,
    rolloverEnabled: true,
    manualRolloverOverride: null,
  },
  {
    id: 'budget_2026-09_cat_bills',
    month: '2026-09',
    categoryId: 'cat_bills',
    baseBudget: 6000,
    rolloverEnabled: true,
    manualRolloverOverride: null,
  },
  {
    id: 'budget_2026-09_cat_entertainment',
    month: '2026-09',
    categoryId: 'cat_entertainment',
    baseBudget: 2500,
    rolloverEnabled: true,
    manualRolloverOverride: null,
  },
  {
    id: 'budget_2026-09_cat_health',
    month: '2026-09',
    categoryId: 'cat_health',
    baseBudget: 3000,
    rolloverEnabled: true,
    manualRolloverOverride: null,
  },
];

export function loadMonthlyBudgets(): MonthlyCategoryBudget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUDGETS);
    if (!raw) {
      saveMonthlyBudgets(INITIAL_MONTHLY_BUDGETS);
      return INITIAL_MONTHLY_BUDGETS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load monthly budgets:', e);
    return INITIAL_MONTHLY_BUDGETS;
  }
}

export function saveMonthlyBudgets(budgets: MonthlyCategoryBudget[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
  } catch (e) {
    console.error('Failed to save monthly budgets:', e);
  }
}

/**
 * Calculate expenses grouped by Month (YYYY-MM) and Category Name or Category ID
 */
export function getMonthlyCategoryExpenses(transactions: Transaction[]): Record<string, Record<string, { totalSpent: number; count: number }>> {
  const map: Record<string, Record<string, { totalSpent: number; count: number }>> = {};

  transactions.forEach((tx) => {
    // Only count expenses
    if (tx.type !== 'expense') return;

    const txDate = tx.dateTime ? tx.dateTime.substring(0, 7) : '';
    if (!txDate) return;

    if (!map[txDate]) {
      map[txDate] = {};
    }

    const catKey = tx.category.trim();
    if (!map[txDate][catKey]) {
      map[txDate][catKey] = { totalSpent: 0, count: 0 };
    }

    map[txDate][catKey].totalSpent += Number(tx.amount) || 0;
    map[txDate][catKey].count += 1;
  });

  return map;
}

/**
 * Sequential Budget Rollover Engine:
 * Computes status for all categories in a target month,
 * evaluating previous month budgets, actual spends, and cascading surpluses or deficits.
 */
export function calculateCategoryBudgetsForMonth(
  targetMonth: string,
  categories: Category[],
  transactions: Transaction[],
  savedBudgets: MonthlyCategoryBudget[]
): {
  categoryStatuses: CategoryBudgetStatus[];
  summary: BudgetSummary;
} {
  // 1. Filter expense categories
  const expenseCategories = categories.filter(
    (c) => c.type === 'expense' || c.type === 'all'
  );

  const monthlyExpenses = getMonthlyCategoryExpenses(transactions);

  // Helper to match category name or id
  const getCategoryActualSpent = (month: string, category: Category): { spent: number; count: number } => {
    if (!monthlyExpenses[month]) return { spent: 0, count: 0 };

    let total = 0;
    let count = 0;

    // Check exact name match
    if (monthlyExpenses[month][category.name]) {
      total += monthlyExpenses[month][category.name].totalSpent;
      count += monthlyExpenses[month][category.name].count;
    }

    // Check ID match or partial name match
    Object.keys(monthlyExpenses[month]).forEach((key) => {
      if (key !== category.name && (key.toLowerCase() === category.name.toLowerCase() || key === category.id)) {
        total += monthlyExpenses[month][key].totalSpent;
        count += monthlyExpenses[month][key].count;
      }
    });

    return { spent: total, count };
  };

  // Helper to get user saved budget config for a specific month & category
  const getBudgetConfig = (month: string, catId: string): MonthlyCategoryBudget | undefined => {
    return savedBudgets.find((b) => b.month === month && b.categoryId === catId);
  };

  // We need to resolve from an earlier starting anchor (e.g. 12 months prior or start of records) up to targetMonth
  // Generate chronological month list up to targetMonth
  const chronologicalMonths: string[] = [];
  let cur = targetMonth;
  // Look back up to 6 months for cascading rollovers
  for (let i = 0; i < 6; i++) {
    chronologicalMonths.unshift(cur);
    cur = getPreviousMonth(cur);
  }

  // Intermediate state store per category per month: { effectiveBudget, spent, remaining, effectiveRollover }
  const monthCategoryCalcStore: Record<string, Record<string, {
    baseBudget: number;
    effectiveRollover: number;
    uncappedRollover: number;
    maxRolloverCap: number | null;
    isRolloverCapped: boolean;
    cappedExcessAmount: number;
    totalEffectiveBudget: number;
    actualSpent: number;
    remaining: number;
    rolloverEnabled: boolean;
    manualOverride: number | null;
    isManual: boolean;
  }>> = {};

  // Process month by month in forward chronological order
  chronologicalMonths.forEach((m) => {
    monthCategoryCalcStore[m] = {};
    const prevMonth = getPreviousMonth(m);

    expenseCategories.forEach((cat) => {
      const config = getBudgetConfig(m, cat.id);
      const prevCalc = monthCategoryCalcStore[prevMonth]?.[cat.id];

      // Base budget: check config, then category default, then default map, then fallback
      const baseBudget =
        config?.baseBudget !== undefined
          ? config.baseBudget
          : cat.defaultMonthlyBudget !== undefined
          ? cat.defaultMonthlyBudget
          : DEFAULT_CATEGORY_BASE_BUDGETS[cat.id] !== undefined
          ? DEFAULT_CATEGORY_BASE_BUDGETS[cat.id]
          : 3000;

      const rolloverEnabled =
        config?.rolloverEnabled !== undefined ? config.rolloverEnabled : true;

      const maxRolloverCap =
        config?.maxRolloverCap !== undefined
          ? config.maxRolloverCap
          : cat.defaultMaxRolloverCap !== undefined
          ? cat.defaultMaxRolloverCap
          : null;

      const manualOverride =
        config?.manualRolloverOverride !== undefined
          ? config.manualRolloverOverride
          : null;

      // Calculate raw Rollover coming from previous month
      let rawComputedRollover = 0;
      if (rolloverEnabled && prevCalc) {
        // Prev remaining balance (+ surplus or - overspent deficit)
        rawComputedRollover = prevCalc.remaining;
      } else if (rolloverEnabled && !prevCalc) {
        // Compute directly for prevMonth if not in loop
        const prevConfig = getBudgetConfig(prevMonth, cat.id);
        const prevBase =
          prevConfig?.baseBudget !== undefined
            ? prevConfig.baseBudget
            : DEFAULT_CATEGORY_BASE_BUDGETS[cat.id] || 3000;
        const prevSpentData = getCategoryActualSpent(prevMonth, cat);
        rawComputedRollover = prevBase - prevSpentData.spent;
      }

      // Apply Maximum Rollover Cap to surplus (if cap is configured and surplus exceeds cap)
      let isRolloverCapped = false;
      let cappedExcessAmount = 0;
      let cappedRollover = rawComputedRollover;

      if (
        rolloverEnabled &&
        maxRolloverCap !== null &&
        maxRolloverCap !== undefined &&
        maxRolloverCap >= 0 &&
        rawComputedRollover > maxRolloverCap
      ) {
        isRolloverCapped = true;
        cappedExcessAmount = rawComputedRollover - maxRolloverCap;
        cappedRollover = maxRolloverCap;
      }

      // If user provided a manual override for rolled amount in this month, use that!
      const isManual = manualOverride !== null;
      const effectiveRollover = isManual ? manualOverride : (rolloverEnabled ? cappedRollover : 0);

      const totalEffectiveBudget = Math.max(0, baseBudget + effectiveRollover);
      const spentData = getCategoryActualSpent(m, cat);
      const remaining = totalEffectiveBudget - spentData.spent;

      monthCategoryCalcStore[m][cat.id] = {
        baseBudget,
        effectiveRollover,
        uncappedRollover: rawComputedRollover,
        maxRolloverCap,
        isRolloverCapped,
        cappedExcessAmount,
        totalEffectiveBudget,
        actualSpent: spentData.spent,
        remaining,
        rolloverEnabled,
        manualOverride,
        isManual,
      };
    });
  });

  // Now construct final CategoryBudgetStatus objects for targetMonth
  const prevMonthOfTarget = getPreviousMonth(targetMonth);
  const targetCalcs = monthCategoryCalcStore[targetMonth] || {};
  const prevCalcs = monthCategoryCalcStore[prevMonthOfTarget] || {};

  const categoryStatuses: CategoryBudgetStatus[] = expenseCategories.map((cat) => {
    const calc = targetCalcs[cat.id] || {
      baseBudget: DEFAULT_CATEGORY_BASE_BUDGETS[cat.id] || 3000,
      effectiveRollover: 0,
      uncappedRollover: 0,
      maxRolloverCap: null,
      isRolloverCapped: false,
      cappedExcessAmount: 0,
      totalEffectiveBudget: DEFAULT_CATEGORY_BASE_BUDGETS[cat.id] || 3000,
      actualSpent: 0,
      remaining: DEFAULT_CATEGORY_BASE_BUDGETS[cat.id] || 3000,
      rolloverEnabled: true,
      manualOverride: null,
      isManual: false,
    };

    const prevCalc = prevCalcs[cat.id];
    const prevSpent = prevCalc ? prevCalc.actualSpent : 0;
    const prevEffBudget = prevCalc ? prevCalc.totalEffectiveBudget : 0;
    const computedRollover = prevCalc ? prevCalc.remaining : 0;

    const spentData = getCategoryActualSpent(targetMonth, cat);
    const utilizationPercent =
      calc.totalEffectiveBudget > 0
        ? (spentData.spent / calc.totalEffectiveBudget) * 100
        : spentData.spent > 0
        ? 100
        : 0;

    let status: 'healthy' | 'warning' | 'overspent' | 'empty' = 'healthy';
    if (calc.totalEffectiveBudget === 0 && spentData.spent === 0) {
      status = 'empty';
    } else if (spentData.spent > calc.totalEffectiveBudget) {
      status = 'overspent';
    } else if (utilizationPercent >= 80) {
      status = 'warning';
    } else {
      status = 'healthy';
    }

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon || 'Tag',
      categoryColor: cat.color || '#6366f1',
      month: targetMonth,
      baseBudget: calc.baseBudget,
      isRolloverEnabled: calc.rolloverEnabled,
      maxRolloverCap: calc.maxRolloverCap,
      isRolloverCapped: calc.isRolloverCapped,
      uncappedRollover: calc.uncappedRollover,
      cappedExcessAmount: calc.cappedExcessAmount,
      previousMonthSpent: prevSpent,
      previousMonthEffectiveBudget: prevEffBudget,
      computedRolloverFromPrevMonth: computedRollover,
      manualRolloverOverride: calc.manualOverride,
      isManuallyOverridden: calc.isManual,
      effectiveRollover: calc.effectiveRollover,
      totalEffectiveBudget: calc.totalEffectiveBudget,
      actualSpent: spentData.spent,
      remainingBudget: calc.remaining,
      utilizationPercent,
      status,
      transactionsCount: spentData.count,
    };
  });

  // Calculate Overall Master Summary
  let totalBaseBudget = 0;
  let totalRolloverIn = 0;
  let totalEffectiveBudget = 0;
  let totalActualSpent = 0;
  let totalRemaining = 0;
  let totalOverspentAmount = 0;
  let totalSurplusSavings = 0;
  let totalCappedExcessAmount = 0;
  let cappedCategoriesCount = 0;
  let overspentCategoriesCount = 0;
  let warningCategoriesCount = 0;
  let healthyCategoriesCount = 0;

  categoryStatuses.forEach((cs) => {
    totalBaseBudget += cs.baseBudget;
    totalRolloverIn += cs.effectiveRollover;
    totalEffectiveBudget += cs.totalEffectiveBudget;
    totalActualSpent += cs.actualSpent;
    totalCappedExcessAmount += cs.cappedExcessAmount || 0;
    if (cs.isRolloverCapped) cappedCategoriesCount++;

    if (cs.remainingBudget < 0) {
      totalOverspentAmount += Math.abs(cs.remainingBudget);
      overspentCategoriesCount++;
    } else {
      totalSurplusSavings += cs.remainingBudget;
      if (cs.status === 'warning') warningCategoriesCount++;
      else healthyCategoriesCount++;
    }
  });

  totalRemaining = totalEffectiveBudget - totalActualSpent;
  const overallUtilizationPercent =
    totalEffectiveBudget > 0 ? (totalActualSpent / totalEffectiveBudget) * 100 : 0;

  const summary: BudgetSummary = {
    month: targetMonth,
    totalBaseBudget,
    totalRolloverIn,
    totalEffectiveBudget,
    totalActualSpent,
    totalRemaining,
    totalOverspentAmount,
    totalSurplusSavings,
    totalCappedExcessAmount,
    overallUtilizationPercent,
    totalCategoriesCount: categoryStatuses.length,
    overspentCategoriesCount,
    warningCategoriesCount,
    healthyCategoriesCount,
    cappedCategoriesCount,
  };

  return { categoryStatuses, summary };
}

/**
 * Generate a multi-month audit chain for a specific category or overall
 * showing the waterfall from month to month
 */
export interface RolloverAuditStep {
  month: string;
  monthLabel: string;
  openingRollover: number;
  uncappedRollover?: number;
  maxRolloverCap?: number | null;
  isRolloverCapped?: boolean;
  cappedExcessAmount?: number;
  baseBudget: number;
  totalEffectiveBudget: number;
  spent: number;
  netMonthVariance: number; // surplus (+) or deficit (-)
  closingRolloverToNextMonth: number;
  isManuallyOverridden: boolean;
  notes?: string;
}

export function getCategoryRolloverAuditTrail(
  categoryId: string,
  categories: Category[],
  transactions: Transaction[],
  savedBudgets: MonthlyCategoryBudget[],
  startMonth: string,
  monthsCount: number = 4
): RolloverAuditStep[] {
  const steps: RolloverAuditStep[] = [];
  let currentM = startMonth;

  for (let i = 0; i < monthsCount; i++) {
    const { categoryStatuses } = calculateCategoryBudgetsForMonth(
      currentM,
      categories,
      transactions,
      savedBudgets
    );
    const catStatus = categoryStatuses.find((c) => c.categoryId === categoryId);

    if (catStatus) {
      steps.push({
        month: currentM,
        monthLabel: formatMonthYear(currentM),
        openingRollover: catStatus.effectiveRollover,
        uncappedRollover: catStatus.uncappedRollover,
        maxRolloverCap: catStatus.maxRolloverCap,
        isRolloverCapped: catStatus.isRolloverCapped,
        cappedExcessAmount: catStatus.cappedExcessAmount,
        baseBudget: catStatus.baseBudget,
        totalEffectiveBudget: catStatus.totalEffectiveBudget,
        spent: catStatus.actualSpent,
        netMonthVariance: catStatus.remainingBudget,
        closingRolloverToNextMonth: catStatus.remainingBudget,
        isManuallyOverridden: catStatus.isManuallyOverridden,
      });
    }

    currentM = getNextMonth(currentM);
  }

  return steps;
}
