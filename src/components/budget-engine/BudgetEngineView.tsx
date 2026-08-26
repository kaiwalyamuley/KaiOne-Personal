import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Edit3,
  Sliders,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Search,
  Filter,
  PieChart,
  ArrowRight,
  Sparkles,
  Info,
  Layers,
  BarChart3,
  Check,
  Shield,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import {
  Category,
  CategoryBudgetStatus,
  MonthlyCategoryBudget,
  Transaction,
  TransactionType,
} from '../../types';
import { formatINR } from '../../utils/formatters';
import {
  calculateCategoryBudgetsForMonth,
  formatMonthYear,
  formatShortMonthYear,
  getNextMonth,
  getPreviousMonth,
} from '../../utils/budgetUtils';
import { EditBudgetRolloverModal } from './EditBudgetRolloverModal';
import { RolloverWaterfallAudit } from './RolloverWaterfallAudit';
import { RolloverSimulator } from './RolloverSimulator';
import { ResetBudgetsModal } from './ResetBudgetsModal';
import { AnnualBudgetPlanner } from './AnnualBudgetPlanner';

interface BudgetEngineViewProps {
  categories: Category[];
  transactions: Transaction[];
  savedBudgets: MonthlyCategoryBudget[];
  onSaveMonthlyBudget: (budget: MonthlyCategoryBudget) => void;
  onSaveBatchMonthlyBudgets: (budgets: MonthlyCategoryBudget[]) => void;
  onResetBudgetsToDefault: () => void;
  onResetEntireApp: () => void;
  onOpenLogTx: (
    type: TransactionType,
    category?: string,
    amount?: number,
    description?: string
  ) => void;
  onOpenAddCategory: () => void;
  onOpenEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onOpenCategoryManager: () => void;
}

export const BudgetEngineView: React.FC<BudgetEngineViewProps> = ({
  categories,
  transactions,
  savedBudgets,
  onSaveMonthlyBudget,
  onSaveBatchMonthlyBudgets,
  onResetBudgetsToDefault,
  onResetEntireApp,
  onOpenLogTx,
  onOpenAddCategory,
  onOpenEditCategory,
  onDeleteCategory,
  onOpenCategoryManager,
}) => {
  // Selected Month State (defaults to current month: August 2026)
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');

  // Sub-tab Navigation
  const [activeSubTab, setActiveSubTab] = useState<
    'annual_planner' | 'category_budgets' | 'waterfall_audit' | 'simulator'
  >('category_budgets');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'warning' | 'overspent' | 'capped'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal States
  const [editingCategoryStatus, setEditingCategoryStatus] = useState<CategoryBudgetStatus | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Month navigation handlers
  const handlePrevMonth = () => setSelectedMonth((prev) => getPreviousMonth(prev));
  const handleNextMonth = () => setSelectedMonth((prev) => getNextMonth(prev));

  // Count active manual overrides
  const manualOverridesCount = useMemo(() => {
    return savedBudgets.filter(
      (b) => b.manualRolloverOverride !== null && b.manualRolloverOverride !== undefined
    ).length;
  }, [savedBudgets]);

  // Compute live budget statuses for the selected month
  const { categoryStatuses, summary } = useMemo(() => {
    return calculateCategoryBudgetsForMonth(
      selectedMonth,
      categories,
      transactions,
      savedBudgets
    );
  }, [selectedMonth, categories, transactions, savedBudgets]);

  // Filtered categories
  const filteredStatuses = useMemo(() => {
    return categoryStatuses.filter((cs) => {
      const matchesSearch =
        !searchQuery.trim() ||
        cs.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'capped'
          ? cs.maxRolloverCap !== null || cs.isRolloverCapped
          : cs.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [categoryStatuses, searchQuery, statusFilter]);

  const prevMonth = getPreviousMonth(selectedMonth);
  const prevMonthLabel = formatMonthYear(prevMonth);
  const selectedMonthLabel = formatMonthYear(selectedMonth);
  const nextMonth = getNextMonth(selectedMonth);
  const nextMonthLabel = formatMonthYear(nextMonth);

  // Quick Month Navigation Pills
  const quickMonths = ['2026-07', '2026-08', '2026-09', '2026-10'];

  return (
    <div className="space-y-6">
      {/* Top Header & Month Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 bg-indigo-600 transform rotate-45" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Financial Intelligence Engine • Smart Carryforward & Rollover Caps
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-light text-slate-800 font-heading">
            Budget Rollover Engine
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Automatic monthly carryforward for surpluses & deficits with configurable Maximum Rollover Caps and manual overrides.
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Month Pills */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {quickMonths.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedMonth === m
                    ? 'bg-white text-indigo-600 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {formatShortMonthYear(m)}
              </button>
            ))}
          </div>

          {/* Month Step Controls */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-xs p-1">
            <button
              id="btn-budget-prev-month"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title={`Go to ${prevMonthLabel}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 text-xs font-bold text-slate-900 flex items-center gap-1.5 min-w-[130px] justify-center">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>{selectedMonthLabel}</span>
            </div>

            <button
              id="btn-budget-next-month"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title={`Go to ${nextMonthLabel}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setSelectedMonth('2026-08')}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Today (Aug 2026)
          </button>
        </div>
      </div>

      {/* Prominent Rollover Highlight Card */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-white to-slate-50 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900">
                Rollover Continuity for {selectedMonthLabel}
              </h3>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                Active
              </span>
              {(summary.cappedCategoriesCount ?? 0) > 0 && (
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-600" />
                  {summary.cappedCategoriesCount} Rollover Capped ({formatINR(summary.totalCappedExcessAmount || 0)} clipped)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              {summary.totalRolloverIn >= 0 ? (
                <>
                  Carried forward <strong className="text-emerald-700 font-bold">+{formatINR(summary.totalRolloverIn)}</strong> in unspent surplus from <span className="font-semibold">{prevMonthLabel}</span> into your active budget.
                </>
              ) : (
                <>
                  Deducted <strong className="text-rose-700 font-bold">{formatINR(summary.totalRolloverIn)}</strong> in overspent deficit from <span className="font-semibold">{prevMonthLabel}</span> to balance overall budget.
                </>
              )}
              {' '}Each category supports custom base budgets, manual rollover adjustments, and Maximum Surplus Rollover Caps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-manage-categories-budget"
            onClick={onOpenCategoryManager}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Manage all categories, icons, colors, base budgets & caps"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Manage Categories</span>
          </button>

          <button
            id="btn-reset-budgets-default"
            onClick={() => setIsResetModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-xs font-bold text-amber-900 hover:bg-amber-50 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Reset monthly budgets to original baseline limits & clear manual overrides"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>Reset to Default</span>
            {manualOverridesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold">
                {manualOverridesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('simulator')}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Scenario Simulator</span>
          </button>
        </div>
      </div>

      {/* High-Level KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Effective Budget */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total Active Budget
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-light text-slate-900 font-heading">
              {formatINR(summary.totalEffectiveBudget)}
            </h3>
            <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
              <span>Base: {formatINR(summary.totalBaseBudget)}</span>
              <span className={`font-semibold ${summary.totalRolloverIn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                ({summary.totalRolloverIn >= 0 ? '+' : ''}{formatINR(summary.totalRolloverIn)} roll)
              </span>
            </p>
          </div>
        </div>

        {/* 2. Total Actual Spent */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total Spent in {formatShortMonthYear(selectedMonth)}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-light text-slate-900 font-heading">
              {formatINR(summary.totalActualSpent)}
            </h3>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    summary.overallUtilizationPercent > 100
                      ? 'bg-rose-500'
                      : summary.overallUtilizationPercent > 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, summary.overallUtilizationPercent)}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-slate-700">
                {summary.overallUtilizationPercent.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* 3. Net Remaining / Rollover to Next Month */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Net Carryforward to {formatShortMonthYear(nextMonth)}
            </span>
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
              summary.totalRemaining >= 0
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                : 'bg-rose-50 text-rose-600 border-rose-100'
            }`}>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className={`text-2xl font-light font-heading ${
              summary.totalRemaining >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {summary.totalRemaining >= 0 ? '+' : ''}
              {formatINR(summary.totalRemaining)}
            </h3>
            <p className="mt-1 text-[11px] text-slate-500">
              {summary.totalRemaining >= 0 ? 'Unspent Surplus to roll in' : 'Overspent deficit to deduct'}
            </p>
          </div>
        </div>

        {/* 4. Health & Rollover Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Budget Health & Caps
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Under Budget:</span>
              <p className="text-sm font-bold text-emerald-600">{summary.healthyCategoriesCount} Categories</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Overspent:</span>
              <p className="text-sm font-bold text-rose-600">{summary.overspentCategoriesCount} Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 pt-2 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-4">
          <button
            id="btn-tab-annual-planner"
            onClick={() => setActiveSubTab('annual_planner')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'annual_planner'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Annual Budget Matrix (Jan–Dec)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
              12 Months
            </span>
          </button>

          <button
            id="btn-tab-category-budgets"
            onClick={() => setActiveSubTab('category_budgets')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'category_budgets'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Monthly Rollovers</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
              {categoryStatuses.length}
            </span>
          </button>

          <button
            id="btn-tab-waterfall-audit"
            onClick={() => setActiveSubTab('waterfall_audit')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'waterfall_audit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>4-Month Waterfall</span>
          </button>

          <button
            id="btn-tab-simulator"
            onClick={() => setActiveSubTab('simulator')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'simulator'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Scenario Sandbox</span>
          </button>
        </div>

        {activeSubTab === 'category_budgets' && (
          <div className="hidden sm:flex items-center gap-2 pb-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
              title="Grid View"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
              title="Table View"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Sub-Tab 0: Annual Budget Matrix (Jan to Dec) */}
      {activeSubTab === 'annual_planner' && (
        <AnnualBudgetPlanner
          categories={categories}
          transactions={transactions}
          savedBudgets={savedBudgets}
          onSaveBatchMonthlyBudgets={onSaveBatchMonthlyBudgets}
          onOpenAddCategory={onOpenAddCategory}
          onOpenEditCategory={onOpenEditCategory}
          onDeleteCategory={onDeleteCategory}
        />
      )}

      {/* Sub-Tab 1: Category Budgets Grid / Table */}
      {activeSubTab === 'category_budgets' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expense category (e.g. Transport, Groceries, Shopping)..."
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                id="btn-quick-add-category"
                onClick={onOpenAddCategory}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <PlusCircle className="w-3 h-3 text-indigo-600" />
                <span>+ Category</span>
              </button>

              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                Status:
              </span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({categoryStatuses.length})
              </button>
              <button
                onClick={() => setStatusFilter('healthy')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'healthy'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                On Track ({summary.healthyCategoriesCount})
              </button>
              <button
                onClick={() => setStatusFilter('overspent')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'overspent'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Overspent ({summary.overspentCategoriesCount})
              </button>
              <button
                onClick={() => setStatusFilter('capped')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                  statusFilter === 'capped'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Shield className="w-3 h-3" />
                <span>Capped ({categoryStatuses.filter((c) => c.maxRolloverCap !== null).length})</span>
              </button>

              <button
                id="btn-reset-budgets-filter-bar"
                onClick={() => setIsResetModalOpen(true)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer shrink-0 ml-auto"
                title="Clear overrides and restore category limits"
              >
                <RotateCcw className="w-3 h-3 text-amber-600" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>
            </div>
          </div>

          {/* Cards Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStatuses.map((cs) => {
                const isOverspent = cs.status === 'overspent';
                const hasRollover = cs.effectiveRollover !== 0;
                const isSurplusRollover = cs.effectiveRollover > 0;
                const hasCap = cs.maxRolloverCap !== null && cs.maxRolloverCap !== undefined;
                const isCapped = cs.isRolloverCapped;

                return (
                  <div
                    key={cs.categoryId}
                    className={`rounded-2xl border p-5 bg-white shadow-2xs transition-all flex flex-col justify-between ${
                      isOverspent
                        ? 'border-rose-300 ring-1 ring-rose-200'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div>
                      {/* Top Category Title & Rollover Edit Button */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0"
                            style={{ backgroundColor: cs.categoryColor || '#6366f1' }}
                          >
                            {cs.categoryName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                                {cs.categoryName}
                              </h4>
                              {hasCap && (
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded inline-flex items-center gap-0.5 ${
                                    isCapped
                                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                      : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                  }`}
                                  title={
                                    isCapped
                                      ? `Rollover capped at ₹${cs.maxRolloverCap} (₹${cs.cappedExcessAmount} surplus clipped)`
                                      : `Max Rollover Cap: ₹${cs.maxRolloverCap}`
                                  }
                                >
                                  <Shield className="w-2.5 h-2.5" />
                                  {isCapped ? `Capped ₹${cs.maxRolloverCap}` : `Cap: ₹${cs.maxRolloverCap}`}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Base: {formatINR(cs.baseBudget)}
                            </span>
                          </div>
                        </div>

                        {/* Edit Rollover Trigger Button */}
                        <button
                          onClick={() => setEditingCategoryStatus(cs)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors flex items-center gap-1 border border-indigo-100"
                          title="Edit Base Budget, Rollover & Max Cap"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>

                      {/* Rollover Source Banner */}
                      <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 text-indigo-600" />
                            Rollover from {prevMonthLabel}:
                          </span>

                          <span
                            className={`font-bold text-xs px-1.5 py-0.2 rounded ${
                              isSurplusRollover
                                ? 'bg-emerald-100 text-emerald-800'
                                : cs.effectiveRollover < 0
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isSurplusRollover ? '+' : ''}
                            {formatINR(cs.effectiveRollover)}
                            {cs.isManuallyOverridden && ' (Manual)'}
                            {isCapped && ' (Capped)'}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500">
                          {cs.isManuallyOverridden
                            ? 'Custom manual rollover override applied.'
                            : isCapped
                            ? `Surplus was +${formatINR(cs.uncappedRollover)}, capped at +${formatINR(cs.effectiveRollover)} (${formatINR(cs.cappedExcessAmount)} excess saved)`
                            : cs.isRolloverEnabled
                            ? `Computed from ${prevMonthLabel} variance (${formatINR(cs.previousMonthEffectiveBudget)} budget - ${formatINR(cs.previousMonthSpent)} spent)`
                            : 'Rollover disabled for this category.'}
                        </p>
                      </div>

                      {/* Total Active Budget for this month */}
                      <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 pt-2.5">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Overall Budget:
                        </span>
                        <span className="text-lg font-bold text-indigo-600 font-heading">
                          {formatINR(cs.totalEffectiveBudget)}
                        </span>
                      </div>

                      {/* Progress Bar & Actual Spent */}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Spent so far:</span>
                          <span className="font-bold text-slate-900">
                            {formatINR(cs.actualSpent)}{' '}
                            <span className="text-slate-400 font-normal">
                              ({cs.utilizationPercent.toFixed(0)}%)
                            </span>
                          </span>
                        </div>

                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isOverspent
                                ? 'bg-rose-500'
                                : cs.utilizationPercent > 80
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, cs.utilizationPercent)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Remaining / Overspent & Quick Action */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {isOverspent ? 'Overspent Deficit:' : 'Remaining Left:'}
                        </span>
                        <span
                          className={`text-xs font-extrabold ${
                            isOverspent ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {isOverspent ? '-' : '+'}
                          {formatINR(Math.abs(cs.remainingBudget))}
                        </span>
                      </div>

                      <button
                        onClick={() => onOpenLogTx('expense', cs.categoryName)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 transition-colors flex items-center gap-1"
                      >
                        <PlusCircle className="w-3 h-3 text-indigo-600" />
                        <span>+ Expense</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4 text-right">Base Budget</th>
                      <th className="py-3.5 px-4 text-right">Rolled In ({formatShortMonthYear(prevMonth)})</th>
                      <th className="py-3.5 px-4 text-center">Max Cap</th>
                      <th className="py-3.5 px-4 text-right font-bold text-slate-900">Total Budget</th>
                      <th className="py-3.5 px-4 text-right">Actual Spent</th>
                      <th className="py-3.5 px-4 text-right">Remaining Balance</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredStatuses.map((cs) => {
                      const isOverspent = cs.status === 'overspent';
                      const hasCap = cs.maxRolloverCap !== null && cs.maxRolloverCap !== undefined;
                      return (
                        <tr key={cs.categoryId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: cs.categoryColor || '#6366f1' }}
                            />
                            <span>{cs.categoryName}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">{formatINR(cs.baseBudget)}</td>
                          <td className={`py-3.5 px-4 text-right font-bold ${
                            cs.effectiveRollover > 0
                              ? 'text-emerald-600'
                              : cs.effectiveRollover < 0
                              ? 'text-rose-600'
                              : 'text-slate-400'
                          }`}>
                            {cs.effectiveRollover > 0 ? '+' : ''}
                            {formatINR(cs.effectiveRollover)}
                            {cs.isManuallyOverridden && (
                              <span className="ml-1 text-[8px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded">
                                Edit
                              </span>
                            )}
                            {cs.isRolloverCapped && (
                              <span className="ml-1 text-[8px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded">
                                Capped
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {hasCap ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {formatINR(cs.maxRolloverCap!)}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Uncapped</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-indigo-600">
                            {formatINR(cs.totalEffectiveBudget)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                            {formatINR(cs.actualSpent)}
                          </td>
                          <td className={`py-3.5 px-4 text-right font-bold ${
                            isOverspent ? 'text-rose-600' : 'text-emerald-700'
                          }`}>
                            {isOverspent ? '-' : '+'}
                            {formatINR(Math.abs(cs.remainingBudget))}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => setEditingCategoryStatus(cs)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Waterfall Audit Chain */}
      {activeSubTab === 'waterfall_audit' && (
        <RolloverWaterfallAudit
          categories={categories}
          transactions={transactions}
          savedBudgets={savedBudgets}
          selectedMonth={selectedMonth}
          onEditCategoryBudget={(catId) => {
            const matched = categoryStatuses.find((c) => c.categoryId === catId);
            if (matched) setEditingCategoryStatus(matched);
          }}
        />
      )}

      {/* Sub-Tab 3: Scenario Sandbox Simulator */}
      {activeSubTab === 'simulator' && <RolloverSimulator categories={categories} />}

      {/* Modal for Editing Base Budget, Rolled Amount, and Cap */}
      <EditBudgetRolloverModal
        isOpen={editingCategoryStatus !== null}
        onClose={() => setEditingCategoryStatus(null)}
        status={editingCategoryStatus}
        onSaveBudget={onSaveMonthlyBudget}
      />

      {/* Modal for Resetting Budgets to Default Limits */}
      <ResetBudgetsModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetBudgetsToDefault={onResetBudgetsToDefault}
        onResetEntireApp={onResetEntireApp}
        totalSavedBudgetsCount={savedBudgets.length}
        manualOverridesCount={manualOverridesCount}
        currentMonthLabel={selectedMonthLabel}
      />
    </div>
  );
};
