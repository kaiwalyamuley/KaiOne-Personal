import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Save,
  CheckCircle2,
  Download,
  Plus,
  Edit2,
  Trash2,
  Search,
  Copy,
  Sliders,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  RotateCcw,
} from 'lucide-react';
import { Category, MonthlyCategoryBudget, Transaction } from '../../types';
import { formatINR } from '../../utils/formatters';
import { DEFAULT_CATEGORY_BASE_BUDGETS } from '../../utils/budgetUtils';
import { CategoryIcon } from '../categories/CategoryIcon';

interface AnnualBudgetPlannerProps {
  categories: Category[];
  transactions: Transaction[];
  savedBudgets: MonthlyCategoryBudget[];
  onSaveBatchMonthlyBudgets: (budgets: MonthlyCategoryBudget[]) => void;
  onOpenAddCategory: () => void;
  onOpenEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const FULL_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const AnnualBudgetPlanner: React.FC<AnnualBudgetPlannerProps> = ({
  categories,
  transactions,
  savedBudgets,
  onSaveBatchMonthlyBudgets,
  onOpenAddCategory,
  onOpenEditCategory,
  onDeleteCategory,
}) => {
  // Current active planning year
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [viewMode, setViewMode] = useState<'planned' | 'actual' | 'variance'>('planned');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'expense' | 'all'>('expense');

  // Matrix state: categoryId -> monthIndex (0-11) -> amount
  const [matrixData, setMatrixData] = useState<Record<string, number[]>>({});
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  // Filter categories to expense only or all
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (typeFilter === 'expense' && cat.type !== 'expense' && cat.type !== 'all') {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = cat.name.toLowerCase().includes(q);
        const matchesSub = cat.subcategories?.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesSub) return false;
      }
      return true;
    });
  }, [categories, typeFilter, searchQuery]);

  // Compute actual expenditures grouped by category and month for the selected year
  const actualSpendsByMonth = useMemo(() => {
    const spends: Record<string, number[]> = {};

    categories.forEach((c) => {
      spends[c.id] = Array(12).fill(0);
    });

    transactions.forEach((tx) => {
      if (tx.type !== 'expense') return;
      if (!tx.dateTime) return;

      const txYear = parseInt(tx.dateTime.substring(0, 4), 10);
      if (txYear !== selectedYear) return;

      const txMonth = parseInt(tx.dateTime.substring(5, 7), 10) - 1; // 0 - 11
      if (txMonth < 0 || txMonth > 11) return;

      // Find matching category
      const matchedCat = categories.find(
        (c) => c.name.toLowerCase() === tx.category.toLowerCase() || c.id === tx.category
      );

      if (matchedCat) {
        if (!spends[matchedCat.id]) {
          spends[matchedCat.id] = Array(12).fill(0);
        }
        spends[matchedCat.id][txMonth] += Number(tx.amount) || 0;
      }
    });

    return spends;
  }, [categories, transactions, selectedYear]);

  // Initialize or re-populate matrix when selectedYear, savedBudgets, or categories change
  useEffect(() => {
    const initialMatrix: Record<string, number[]> = {};

    categories.forEach((cat) => {
      const rowMonths: number[] = [];

      for (let m = 1; m <= 12; m++) {
        const monthKey = `${selectedYear}-${String(m).padStart(2, '0')}`;
        const existingBudget = savedBudgets.find(
          (b) => b.month === monthKey && b.categoryId === cat.id
        );

        if (existingBudget && existingBudget.baseBudget !== undefined) {
          rowMonths.push(existingBudget.baseBudget);
        } else if (cat.defaultMonthlyBudget !== undefined) {
          rowMonths.push(cat.defaultMonthlyBudget);
        } else if (DEFAULT_CATEGORY_BASE_BUDGETS[cat.id] !== undefined) {
          rowMonths.push(DEFAULT_CATEGORY_BASE_BUDGETS[cat.id]);
        } else {
          rowMonths.push(2000);
        }
      }

      initialMatrix[cat.id] = rowMonths;
    });

    setMatrixData(initialMatrix);
    setIsDirty(false);
  }, [selectedYear, categories, savedBudgets]);

  // Handle single cell change
  const handleCellChange = (categoryId: string, monthIndex: number, value: string) => {
    const num = Math.max(0, parseFloat(value) || 0);
    setMatrixData((prev) => {
      const catRow = prev[categoryId] ? [...prev[categoryId]] : Array(12).fill(0);
      catRow[monthIndex] = num;
      return {
        ...prev,
        [categoryId]: catRow,
      };
    });
    setIsDirty(true);
  };

  // Tool: Copy month value to all remaining months for a row
  const handleCopyAcrossMonths = (categoryId: string, fromMonthIndex: number) => {
    setMatrixData((prev) => {
      const catRow = prev[categoryId] ? [...prev[categoryId]] : Array(12).fill(0);
      const val = catRow[fromMonthIndex] || 0;
      const updatedRow = catRow.map(() => val);
      return {
        ...prev,
        [categoryId]: updatedRow,
      };
    });
    setIsDirty(true);
  };

  // Tool: Distribute an Annual Target evenly across 12 months for a category
  const handleDistributeAnnualAmount = (categoryId: string) => {
    const currentTotal = matrixData[categoryId]?.reduce((a, b) => a + b, 0) || 0;
    const inputStr = prompt(
      'Enter total planned Annual Budget for this category (₹):',
      currentTotal > 0 ? String(currentTotal) : '60000'
    );
    if (!inputStr) return;

    const targetAnnual = Math.max(0, parseFloat(inputStr) || 0);
    const monthlyAmt = Math.round(targetAnnual / 12);

    setMatrixData((prev) => {
      return {
        ...prev,
        [categoryId]: Array(12).fill(monthlyAmt),
      };
    });
    setIsDirty(true);
  };

  // Tool: Bulk Adjust all category budgets by %
  const handleBulkPercentageAdjustment = (percentDelta: number) => {
    if (
      !window.confirm(
        `Apply a ${percentDelta > 0 ? '+' : ''}${percentDelta}% adjustment to all budget cells in ${selectedYear}?`
      )
    ) {
      return;
    }

    setMatrixData((prev) => {
      const next: Record<string, number[]> = {};
      Object.keys(prev).forEach((catId) => {
        next[catId] = prev[catId].map((val) => {
          const adjusted = Math.round(val * (1 + percentDelta / 100));
          return Math.max(0, adjusted);
        });
      });
      return next;
    });
    setIsDirty(true);
  };

  // Tool: Fill January value across all 12 months for ALL categories
  const handleCopyJanToAllCategories = () => {
    if (
      !window.confirm(
        `Copy the January allocation across all 12 months (Jan–Dec) for every category?`
      )
    ) {
      return;
    }

    setMatrixData((prev) => {
      const next: Record<string, number[]> = {};
      Object.keys(prev).forEach((catId) => {
        const janVal = prev[catId]?.[0] || 0;
        next[catId] = Array(12).fill(janVal);
      });
      return next;
    });
    setIsDirty(true);
  };

  // Finalize & Save All 12 Months to System State & Local Storage
  const handleFinalizeYearPlan = () => {
    const batchToSave: MonthlyCategoryBudget[] = [];

    Object.keys(matrixData).forEach((catId) => {
      const monthsArray = matrixData[catId];
      if (!monthsArray) return;

      monthsArray.forEach((amount, idx) => {
        const monthKey = `${selectedYear}-${String(idx + 1).padStart(2, '0')}`;
        const existingConfig = savedBudgets.find(
          (b) => b.month === monthKey && b.categoryId === catId
        );

        const budgetRecord: MonthlyCategoryBudget = {
          id: `budget_${monthKey}_${catId}`,
          month: monthKey,
          categoryId: catId,
          baseBudget: amount,
          rolloverEnabled: existingConfig?.rolloverEnabled ?? true,
          maxRolloverCap: existingConfig?.maxRolloverCap ?? null,
          manualRolloverOverride: existingConfig?.manualRolloverOverride ?? null,
          manualRolloverNotes: existingConfig?.manualRolloverNotes,
          notes: existingConfig?.notes ?? `${FULL_MONTH_NAMES[idx]} ${selectedYear} Plan`,
          updatedAt: new Date().toISOString(),
        };

        batchToSave.push(budgetRecord);
      });
    });

    onSaveBatchMonthlyBudgets(batchToSave);
    setIsDirty(false);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  // Export Matrix as CSV
  const handleExportCSV = () => {
    const headers = ['Category ID', 'Category Name', ...MONTH_NAMES, 'Annual Total', 'Monthly Avg'];
    const rows = filteredCategories.map((cat) => {
      const rowData = matrixData[cat.id] || Array(12).fill(0);
      const total = rowData.reduce((a, b) => a + b, 0);
      const avg = Math.round(total / 12);
      return [
        cat.id,
        `"${cat.name.replace(/"/g, '""')}"`,
        ...rowData,
        total,
        avg,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `VitaFlow_Annual_Budget_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate Monthly Column Totals and Grand Total
  const columnTotals = useMemo(() => {
    const totals = Array(12).fill(0);
    const actualTotals = Array(12).fill(0);

    filteredCategories.forEach((cat) => {
      const planRow = matrixData[cat.id] || Array(12).fill(0);
      const actualRow = actualSpendsByMonth[cat.id] || Array(12).fill(0);

      for (let i = 0; i < 12; i++) {
        totals[i] += planRow[i] || 0;
        actualTotals[i] += actualRow[i] || 0;
      }
    });

    const grandPlannedAnnual = totals.reduce((a, b) => a + b, 0);
    const grandActualAnnual = actualTotals.reduce((a, b) => a + b, 0);
    const monthlyAveragePlanned = Math.round(grandPlannedAnnual / 12);

    return {
      monthlyPlanned: totals,
      monthlyActual: actualTotals,
      grandPlannedAnnual,
      grandActualAnnual,
      monthlyAveragePlanned,
    };
  }, [filteredCategories, matrixData, actualSpendsByMonth]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner & Control Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                Annual Budget Planning Matrix
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                  Jan – Dec
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Plan, calibrate, and lock 12-month category allocations across the entire calendar year
              </p>
            </div>
          </div>

          {/* Year Picker & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-end lg:self-center">
            {/* Year Selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                id="btn-prev-year"
                onClick={() => setSelectedYear((y) => y - 1)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
                title="Previous Year"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-bold text-slate-900 font-mono">
                CY {selectedYear}
              </span>
              <button
                id="btn-next-year"
                onClick={() => setSelectedYear((y) => y + 1)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
                title="Next Year"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Export CSV */}
            <button
              id="btn-export-annual-csv"
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="Download Annual Spreadsheet CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Add Category Button */}
            <button
              id="btn-add-category-annual"
              onClick={onOpenAddCategory}
              className="px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50/80 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>

            {/* Finalize Button */}
            <button
              id="btn-finalize-annual-budget"
              onClick={handleFinalizeYearPlan}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                isDirty
                  ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400/40 animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isDirty ? 'Save Changes' : 'Lock Year Plan'}</span>
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              Annual Budget for {selectedYear} has been finalized and saved across all 12 months!
            </span>
          </div>
        )}

        {/* Annual Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Planned ({selectedYear})
            </span>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {formatINR(columnTotals.grandPlannedAnnual)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Avg {formatINR(columnTotals.monthlyAveragePlanned)} / mo
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              YTD Actual Spends
            </span>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {formatINR(columnTotals.grandActualAnnual)}
            </div>
            <span className="text-[11px] text-slate-500">
              {transactions.filter((t) => t.dateTime?.startsWith(String(selectedYear))).length} transactions
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Budget Delta
            </span>
            <div
              className={`text-base font-bold font-mono mt-0.5 ${
                columnTotals.grandPlannedAnnual >= columnTotals.grandActualAnnual
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              }`}
            >
              {columnTotals.grandPlannedAnnual >= columnTotals.grandActualAnnual ? '+' : ''}
              {formatINR(columnTotals.grandPlannedAnnual - columnTotals.grandActualAnnual)}
            </div>
            <span className="text-[11px] text-slate-500">
              {columnTotals.grandPlannedAnnual >= columnTotals.grandActualAnnual
                ? 'Under budget ceiling'
                : 'Over budget ceiling'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block">
              Category Scope
            </span>
            <div className="text-sm font-bold text-indigo-950">
              {filteredCategories.length} Categories
            </div>
            <div className="text-[11px] text-indigo-700 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Rollover Continuity Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control & Batch Tools Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        {/* Left: View Mode Segmented Switcher & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              id="btn-matrix-mode-planned"
              onClick={() => setViewMode('planned')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'planned'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Planned Budget (Editable)
            </button>
            <button
              id="btn-matrix-mode-actual"
              onClick={() => setViewMode('actual')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'actual'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Actual Spends
            </button>
            <button
              id="btn-matrix-mode-variance"
              onClick={() => setViewMode('variance')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'variance'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Variance (Delta)
            </button>
          </div>

          {/* Search Category */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 w-44"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Quick Batch Tools */}
        {viewMode === 'planned' && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Batch:
            </span>
            <button
              id="btn-copy-jan-all"
              onClick={handleCopyJanToAllCategories}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              title="Copy January values across Feb–Dec for all categories"
            >
              <Copy className="w-3 h-3 text-slate-500" />
              <span>Copy Jan to All</span>
            </button>

            <button
              id="btn-adjust-plus-5"
              onClick={() => handleBulkPercentageAdjustment(5)}
              className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition-colors cursor-pointer"
              title="Increase all category budgets by 5%"
            >
              +5%
            </button>

            <button
              id="btn-adjust-plus-10"
              onClick={() => handleBulkPercentageAdjustment(10)}
              className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition-colors cursor-pointer"
              title="Increase all category budgets by 10%"
            >
              +10%
            </button>

            <button
              id="btn-adjust-minus-5"
              onClick={() => handleBulkPercentageAdjustment(-5)}
              className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition-colors cursor-pointer"
              title="Reduce all category budgets by 5%"
            >
              -5%
            </button>
          </div>
        )}
      </div>

      {/* Main Tabular Matrix (Jan to Dec) */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1180px]">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                {/* Category Column (Sticky Left) */}
                <th className="sticky left-0 z-20 bg-slate-50 py-3.5 px-4 min-w-[240px] max-w-[260px] border-r border-slate-200 shadow-xs">
                  Category ({filteredCategories.length})
                </th>

                {/* 12 Months: Jan to Dec */}
                {MONTH_NAMES.map((m, idx) => (
                  <th key={m} className="py-3 px-2 text-right min-w-[92px] w-24 border-r border-slate-100 font-semibold">
                    <div className="flex flex-col items-end">
                      <span className="text-slate-900 font-bold text-xs">{m}</span>
                      <span className="text-[9px] text-slate-400 font-normal">M{String(idx + 1).padStart(2, '0')}</span>
                    </div>
                  </th>
                ))}

                {/* Annual Total Column */}
                <th className="py-3 px-3 text-right min-w-[110px] bg-indigo-50/60 text-indigo-950 font-bold border-l border-indigo-100">
                  Annual Total
                </th>

                {/* Monthly Avg Column */}
                <th className="py-3 px-3 text-right min-w-[90px] bg-slate-50 text-slate-900 font-bold">
                  Avg/Mo
                </th>

                {/* Actions Column */}
                <th className="py-3 px-2 text-center min-w-[80px] bg-slate-50 text-slate-500 font-bold">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCategories.map((cat) => {
                const planRow = matrixData[cat.id] || Array(12).fill(0);
                const actualRow = actualSpendsByMonth[cat.id] || Array(12).fill(0);
                const annualPlanTotal = planRow.reduce((a, b) => a + b, 0);
                const annualActualTotal = actualRow.reduce((a, b) => a + b, 0);
                const monthlyAvg = Math.round(annualPlanTotal / 12);

                return (
                  <tr
                    key={cat.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Sticky Category Name Cell */}
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 py-2.5 px-4 min-w-[240px] max-w-[260px] border-r border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CategoryIcon
                            icon={cat.icon}
                            color={cat.color}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate text-xs" title={cat.name}>
                              {cat.name}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {cat.subcategories?.length
                                ? `${cat.subcategories.length} subcategories`
                                : 'Primary Category'}
                            </span>
                          </div>
                        </div>

                        {/* Fill Jan across row shortcut button */}
                        {viewMode === 'planned' && (
                          <button
                            onClick={() => handleCopyAcrossMonths(cat.id, 0)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all cursor-pointer shrink-0"
                            title="Copy Jan value across all 12 months"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* 12 Monthly Cells */}
                    {MONTH_NAMES.map((m, monthIdx) => {
                      const plannedVal = planRow[monthIdx] || 0;
                      const actualVal = actualRow[monthIdx] || 0;
                      const variance = plannedVal - actualVal;

                      if (viewMode === 'planned') {
                        return (
                          <td key={monthIdx} className="py-1.5 px-1.5 text-right border-r border-slate-100 min-w-[92px]">
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                step="100"
                                value={plannedVal === 0 ? '' : plannedVal}
                                placeholder="0"
                                onChange={(e) => handleCellChange(cat.id, monthIdx, e.target.value)}
                                className="w-full text-right py-1 px-2 text-xs font-mono tabular-nums font-semibold text-slate-900 rounded-lg border border-transparent hover:border-slate-300 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                          </td>
                        );
                      }

                      if (viewMode === 'actual') {
                        return (
                          <td
                            key={monthIdx}
                            className={`py-2.5 px-2 text-right border-r border-slate-100 font-mono text-xs tabular-nums font-semibold ${
                              actualVal > 0 ? 'text-slate-900' : 'text-slate-300'
                            }`}
                          >
                            {formatINR(actualVal)}
                          </td>
                        );
                      }

                      // Variance Mode (Planned - Actual)
                      return (
                        <td
                          key={monthIdx}
                          className={`py-2.5 px-2 text-right border-r border-slate-100 font-mono text-xs tabular-nums font-bold ${
                            variance > 0
                              ? 'text-emerald-600 bg-emerald-50/20'
                              : variance < 0
                              ? 'text-rose-600 bg-rose-50/20'
                              : 'text-slate-400'
                          }`}
                        >
                          {variance > 0 ? '+' : ''}
                          {formatINR(variance)}
                        </td>
                      );
                    })}

                    {/* Annual Row Total */}
                    <td className="py-2.5 px-3 text-right bg-indigo-50/40 text-indigo-950 font-bold font-mono text-xs tabular-nums border-l border-indigo-100">
                      {viewMode === 'planned' && formatINR(annualPlanTotal)}
                      {viewMode === 'actual' && formatINR(annualActualTotal)}
                      {viewMode === 'variance' && (
                        <span
                          className={
                            annualPlanTotal >= annualActualTotal ? 'text-emerald-700' : 'text-rose-700'
                          }
                        >
                          {annualPlanTotal >= annualActualTotal ? '+' : ''}
                          {formatINR(annualPlanTotal - annualActualTotal)}
                        </span>
                      )}
                    </td>

                    {/* Monthly Avg */}
                    <td className="py-2.5 px-3 text-right bg-slate-50/50 text-slate-700 font-semibold font-mono text-xs tabular-nums">
                      {formatINR(monthlyAvg)}
                    </td>

                    {/* Actions Cell */}
                    <td className="py-2.5 px-1.5 text-center bg-white group-hover:bg-slate-50">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleDistributeAnnualAmount(cat.id)}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Distribute custom annual amount evenly"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenEditCategory(cat)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Category Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {categories.length > 1 && (
                          <button
                            onClick={() => onDeleteCategory(cat.id)}
                            className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer Summary Row */}
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold text-xs text-slate-900">
                {/* Sticky Total Label */}
                <td className="sticky left-0 z-20 bg-slate-100 py-3.5 px-4 border-r border-slate-200 shadow-xs uppercase tracking-wider font-extrabold text-slate-800">
                  Total Monthly Budget
                </td>

                {/* 12 Monthly Totals */}
                {MONTH_NAMES.map((m, idx) => {
                  const plannedTotal = columnTotals.monthlyPlanned[idx] || 0;
                  const actualTotal = columnTotals.monthlyActual[idx] || 0;
                  const delta = plannedTotal - actualTotal;

                  if (viewMode === 'planned') {
                    return (
                      <td key={idx} className="py-3 px-2 text-right border-r border-slate-200 text-slate-900 font-mono tabular-nums">
                        {formatINR(plannedTotal)}
                      </td>
                    );
                  }
                  if (viewMode === 'actual') {
                    return (
                      <td key={idx} className="py-3 px-2 text-right border-r border-slate-200 text-slate-900 font-mono tabular-nums">
                        {formatINR(actualTotal)}
                      </td>
                    );
                  }
                  return (
                    <td
                      key={idx}
                      className={`py-3 px-2 text-right border-r border-slate-200 font-mono tabular-nums ${
                        delta >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {delta >= 0 ? '+' : ''}
                      {formatINR(delta)}
                    </td>
                  );
                })}

                {/* Grand Annual Total */}
                <td className="py-3 px-3 text-right bg-indigo-100 text-indigo-950 font-extrabold font-mono tabular-nums border-l border-indigo-200">
                  {viewMode === 'planned' && formatINR(columnTotals.grandPlannedAnnual)}
                  {viewMode === 'actual' && formatINR(columnTotals.grandActualAnnual)}
                  {viewMode === 'variance' && (
                    <span
                      className={
                        columnTotals.grandPlannedAnnual >= columnTotals.grandActualAnnual
                          ? 'text-emerald-800'
                          : 'text-rose-800'
                      }
                    >
                      {columnTotals.grandPlannedAnnual >= columnTotals.grandActualAnnual ? '+' : ''}
                      {formatINR(columnTotals.grandPlannedAnnual - columnTotals.grandActualAnnual)}
                    </span>
                  )}
                </td>

                {/* Grand Monthly Average */}
                <td className="py-3 px-3 text-right bg-slate-200 text-slate-900 font-extrabold font-mono tabular-nums">
                  {formatINR(columnTotals.monthlyAveragePlanned)}
                </td>

                {/* Blank action footer */}
                <td className="py-3 px-2 text-center bg-slate-100 text-slate-400">
                  -
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Guidance Note */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 flex items-start gap-3 text-xs text-indigo-900">
        <Info className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <span className="font-bold block">Annual Budget Matrix Guide:</span>
          <p className="text-indigo-800/90 leading-relaxed text-[11px]">
            • <strong>Instant Inline Planning:</strong> Edit any monthly cell directly, use <em>Copy Jan to All</em> or <em>% Batch Adjustments</em> to project full year numbers.
            <br />
            • <strong>Locking:</strong> Click <strong>Save Changes / Lock Year Plan</strong> to write allocations directly to the Monthly Budget Rollover Engine.
          </p>
        </div>
      </div>
    </div>
  );
};
