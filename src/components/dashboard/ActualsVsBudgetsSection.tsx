import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Layers,
  Sparkles,
  RefreshCw,
  PlusCircle,
  ShieldAlert,
  Percent,
  SlidersHorizontal,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
  ReferenceLine,
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts';
import {
  Category,
  Transaction,
  MonthlyCategoryBudget,
  CategoryBudgetStatus,
} from '../../types';
import { formatINR } from '../../utils/formatters';
import {
  calculateCategoryBudgetsForMonth,
  formatMonthYear,
  formatShortMonthYear,
  getPreviousMonth,
  getNextMonth,
} from '../../utils/budgetUtils';
import { DEFAULT_CATEGORIES } from '../../utils/defaultData';
import { MainPillar, FinanceSubTab } from '../Navbar';

interface ActualsVsBudgetsSectionProps {
  categories?: Category[];
  transactions: Transaction[];
  monthlyBudgets: MonthlyCategoryBudget[];
  onNavigateToPillar: (pillar: MainPillar, subTab?: FinanceSubTab) => void;
  onOpenLogTransaction: (type?: 'expense' | 'income') => void;
}

export const ActualsVsBudgetsSection: React.FC<ActualsVsBudgetsSectionProps> = ({
  categories = DEFAULT_CATEGORIES,
  transactions,
  monthlyBudgets,
  onNavigateToPillar,
  onOpenLogTransaction,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [activeChartTab, setActiveChartTab] = useState<'categories' | 'trend' | 'burn_pace' | 'allocation'>('categories');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'overspent' | 'healthy'>('all');
  const [sortBy, setSortBy] = useState<'spend' | 'budget' | 'utilization' | 'name'>('spend');

  const selectedMonthLabel = useMemo(() => formatMonthYear(selectedMonth), [selectedMonth]);
  const prevMonth = useMemo(() => getPreviousMonth(selectedMonth), [selectedMonth]);
  const prevMonthLabel = useMemo(() => formatShortMonthYear(prevMonth), [prevMonth]);
  const nextMonth = useMemo(() => getNextMonth(selectedMonth), [selectedMonth]);
  const nextMonthLabel = useMemo(() => formatShortMonthYear(nextMonth), [nextMonth]);

  const quickMonths = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];

  // 1. Calculate Category Statuses and Summary for Selected Month
  const { categoryStatuses, summary } = useMemo(() => {
    return calculateCategoryBudgetsForMonth(
      selectedMonth,
      categories,
      transactions,
      monthlyBudgets
    );
  }, [selectedMonth, categories, transactions, monthlyBudgets]);

  // 2. Filter & Sort Category Data for Comparison Chart
  const chartCategoryData = useMemo(() => {
    let list = [...categoryStatuses];

    if (categoryFilter === 'overspent') {
      list = list.filter((c) => c.status === 'overspent');
    } else if (categoryFilter === 'healthy') {
      list = list.filter((c) => c.status === 'healthy' || c.status === 'warning');
    }

    list.sort((a, b) => {
      if (sortBy === 'spend') return b.actualSpent - a.actualSpent;
      if (sortBy === 'budget') return b.totalEffectiveBudget - a.totalEffectiveBudget;
      if (sortBy === 'utilization') return b.utilizationPercent - a.utilizationPercent;
      return a.categoryName.localeCompare(b.categoryName);
    });

    return list.map((c) => {
      const variance = c.totalEffectiveBudget - c.actualSpent; // positive = surplus, negative = overspent
      const isOver = c.actualSpent > c.totalEffectiveBudget;
      return {
        id: c.categoryId,
        name: c.categoryName,
        shortName: c.categoryName.split(' ')[0],
        budget: c.totalEffectiveBudget,
        baseBudget: c.baseBudget,
        effectiveRollover: c.effectiveRollover,
        actualSpent: c.actualSpent,
        variance,
        isOver,
        utilization: Math.round(c.utilizationPercent),
        status: c.status,
        color: c.categoryColor || '#6366f1',
      };
    });
  }, [categoryStatuses, categoryFilter, sortBy]);

  // 3. Multi-Month Actuals vs Budgets Trend (Past 6 Months)
  const multiMonthTrendData = useMemo(() => {
    const months: string[] = [];
    let cur = selectedMonth;
    for (let i = 0; i < 6; i++) {
      months.unshift(cur);
      cur = getPreviousMonth(cur);
    }

    return months.map((m) => {
      const res = calculateCategoryBudgetsForMonth(m, categories, transactions, monthlyBudgets);
      const netSavingsSurplus = res.summary.totalEffectiveBudget - res.summary.totalActualSpent;
      return {
        month: m,
        label: formatShortMonthYear(m),
        totalBudget: res.summary.totalEffectiveBudget,
        totalSpent: res.summary.totalActualSpent,
        surplus: netSavingsSurplus,
        utilization: Math.round(res.summary.overallUtilizationPercent),
        overspentCount: res.summary.overspentCategoriesCount,
      };
    });
  }, [selectedMonth, categories, transactions, monthlyBudgets]);

  // 4. Daily Cumulative Burn Pace vs Linear Run-Rate for Selected Month
  const dailyBurnPaceData = useMemo(() => {
    const [yearStr, monthNumStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthNumStr, 10) - 1;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const monthlyTotalBudget = summary.totalEffectiveBudget || 1;
    const dailyBudgetPace = monthlyTotalBudget / daysInMonth;

    // Filter all transactions for this selected month
    const monthExpenses = transactions.filter(
      (t) => t.dateTime.startsWith(selectedMonth) && t.type === 'expense'
    );

    let cumulativeActual = 0;
    const data = [];

    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const isCurrentMonth = selectedMonth === currentMonthStr;
    const currentDayOfMonth = isCurrentMonth ? now.getDate() : daysInMonth;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
      const dayExpenses = monthExpenses
        .filter((t) => t.dateTime.startsWith(dayStr))
        .reduce((sum, t) => sum + t.amount, 0);

      const targetPace = Math.round(dailyBudgetPace * day);

      if (day <= currentDayOfMonth || !isCurrentMonth) {
        cumulativeActual += dayExpenses;
        data.push({
          day: `Day ${day}`,
          dayNum: day,
          targetPace,
          actualCumulative: cumulativeActual,
          dailySpend: dayExpenses,
          isPastOrCurrent: true,
        });
      } else {
        // Future days in current month
        data.push({
          day: `Day ${day}`,
          dayNum: day,
          targetPace,
          targetProjected: targetPace,
          dailySpend: 0,
          isPastOrCurrent: false,
        });
      }
    }

    return data;
  }, [selectedMonth, summary.totalEffectiveBudget, transactions]);

  // Handle month steps
  const handlePrevMonth = () => setSelectedMonth((prev) => getPreviousMonth(prev));
  const handleNextMonth = () => setSelectedMonth((prev) => getNextMonth(prev));

  const isNetSurplus = summary.totalRemaining >= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Top Header & Month Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg font-heading">
              Actuals vs. Budgets Analytics
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
              Live Variance Suite
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Interactive multi-dimensional comparison of allocated envelope budgets (with carryover rollovers) vs actual cash expenditures.
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Month Chips */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
            {quickMonths.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedMonth === m
                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {formatShortMonthYear(m)}
              </button>
            ))}
          </div>

          {/* Month Step Controls */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-2xs p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title={`Go to ${prevMonthLabel}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 text-xs font-bold text-slate-900 flex items-center gap-1.5 min-w-[125px] justify-center">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>{selectedMonthLabel}</span>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title={`Go to ${nextMonthLabel}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onNavigateToPillar('finance', 'budget_engine')}
            className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Budget Engine</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* KPI Cards for the Selected Month */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Total Allocated Budget */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Active Budget</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 font-mono">
            {formatINR(summary.totalEffectiveBudget)}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Base: {formatINR(summary.totalBaseBudget)}</span>
            {summary.totalRolloverIn !== 0 && (
              <span className={summary.totalRolloverIn > 0 ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                ({summary.totalRolloverIn > 0 ? '+' : ''}{formatINR(summary.totalRolloverIn)} roll)
              </span>
            )}
          </p>
        </div>

        {/* 2. Total Actual Spent */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Actual Spent</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 font-mono">
            {formatINR(summary.totalActualSpent)}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Burn Rate: <strong className="text-slate-800 font-mono">{summary.overallUtilizationPercent.toFixed(1)}%</strong> of total envelope
          </p>
        </div>

        {/* 3. Net Variance (Surplus or Deficit) */}
        <div className={`p-4 rounded-xl border ${
          isNetSurplus
            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
            : 'bg-rose-50/60 border-rose-200 text-rose-950'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isNetSurplus ? 'Net Budget Surplus' : 'Net Budget Deficit'}
            </span>
            {isNetSurplus ? (
              <ArrowDownRight className="w-4 h-4 text-emerald-600" />
            ) : (
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <p className={`text-xl font-extrabold font-mono ${isNetSurplus ? 'text-emerald-700' : 'text-rose-700'}`}>
            {isNetSurplus ? '+' : '-'}{formatINR(Math.abs(summary.totalRemaining))}
          </p>
          <p className="text-[10px] text-slate-600 mt-1">
            {isNetSurplus ? 'Available to roll forward into next month' : 'Overspent beyond total active limit'}
          </p>
        </div>

        {/* 4. Category Health Breakdown */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Envelopes Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-emerald-700 font-mono">
              {summary.healthyCategoriesCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">On-Track</span>
            <span className="text-slate-300">|</span>
            <span className="text-xl font-extrabold text-rose-600 font-mono">
              {summary.overspentCategoriesCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">Over</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full"
              style={{
                width: `${summary.totalCategoriesCount ? (summary.healthyCategoriesCount / summary.totalCategoriesCount) * 100 : 100}%`,
              }}
            />
            <div
              className="bg-rose-500 h-full"
              style={{
                width: `${summary.totalCategoriesCount ? (summary.overspentCategoriesCount / summary.totalCategoriesCount) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Chart Navigation Tabs & Interactive Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        {/* Chart View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveChartTab('categories')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeChartTab === 'categories'
                ? 'bg-white text-indigo-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Category Comparison</span>
          </button>

          <button
            onClick={() => setActiveChartTab('trend')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeChartTab === 'trend'
                ? 'bg-white text-indigo-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>6-Month Trend</span>
          </button>

          <button
            onClick={() => setActiveChartTab('burn_pace')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeChartTab === 'burn_pace'
                ? 'bg-white text-indigo-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Daily Burn vs Pace</span>
          </button>

          <button
            onClick={() => setActiveChartTab('allocation')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeChartTab === 'allocation'
                ? 'bg-white text-indigo-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-indigo-600" />
            <span>Utilization Matrix</span>
          </button>
        </div>

        {/* Category Controls (Visible when on Category tab) */}
        {activeChartTab === 'categories' && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  categoryFilter === 'all' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryFilter('overspent')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  categoryFilter === 'overspent' ? 'bg-white font-bold text-rose-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Overspent ({summary.overspentCategoriesCount})
              </button>
              <button
                onClick={() => setCategoryFilter('healthy')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  categoryFilter === 'healthy' ? 'bg-white font-bold text-emerald-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                On Track
              </button>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort categories by"
                className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="spend">Sort: Highest Spend</option>
                <option value="budget">Sort: Largest Budget</option>
                <option value="utilization">Sort: Utilization %</option>
                <option value="name">Sort: Name</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CHART VIEW 1: CATEGORY-WISE ACTUALS VS BUDGET (GROUPED BAR CHART) */}
      {/* ========================================================================= */}
      {activeChartTab === 'categories' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              Showing {chartCategoryData.length} categories for {selectedMonthLabel}
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-300" />
                <span>Total Active Budget (₹)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>Actual Spent (≤100%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                <span>Actual Spent (&gt;100% Over)</span>
              </span>
            </div>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartCategoryData} margin={{ top: 12, right: 12, left: -10, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0]?.payload;
                      const isOver = item.isOver;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl text-xs space-y-2 border border-slate-800 min-w-[220px]">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                            <span className="font-bold text-slate-200 text-sm">{item.name}</span>
                            <span
                              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                isOver ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {item.utilization}% Used
                            </span>
                          </div>

                          <div className="space-y-1 font-mono text-[11px]">
                            <div className="flex justify-between text-indigo-300">
                              <span>Total Active Budget:</span>
                              <strong>{formatINR(item.budget)}</strong>
                            </div>
                            {item.effectiveRollover !== 0 && (
                              <div className="flex justify-between text-slate-400 text-[10px]">
                                <span>↳ Base + Rollover:</span>
                                <span>{formatINR(item.baseBudget)} {item.effectiveRollover > 0 ? '+' : ''}{formatINR(item.effectiveRollover)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-rose-300">
                              <span>Actual Spent:</span>
                              <strong>{formatINR(item.actualSpent)}</strong>
                            </div>
                            <div className="flex justify-between border-t border-slate-800 pt-1 font-bold">
                              <span>{isOver ? 'Overspent Deficit:' : 'Remaining Left:'}</span>
                              <span className={isOver ? 'text-rose-400' : 'text-emerald-400'}>
                                {isOver ? '-' : '+'}{formatINR(Math.abs(item.variance))}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* 1. Active Budget Bar */}
                <Bar
                  dataKey="budget"
                  name="Active Budget"
                  fill="#CBD5E1"
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                />
                {/* 2. Actual Spent Bar with dynamic color fill */}
                <Bar
                  dataKey="actualSpent"
                  name="Actual Spent"
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                >
                  {chartCategoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.isOver
                          ? '#EF4444' // Rose-500 for overspent
                          : entry.utilization > 80
                          ? '#F59E0B' // Amber-500 for high warning
                          : '#10B981' // Emerald-500 for healthy
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHART VIEW 2: 6-MONTH ACTUALS VS BUDGETS MULTI-MONTH TREND */}
      {/* ========================================================================= */}
      {activeChartTab === 'trend' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              Historical & Projected 6-Month Budget Performance
            </span>
            <span className="text-[11px] text-slate-400">
              Compares Total Budget Allocation vs Actual Spend & Net Savings
            </span>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={multiMonthTrendData} margin={{ top: 12, right: 12, left: -10, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10, fill: '#10B981' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0]?.payload;
                      const hasSurplus = d.surplus >= 0;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl text-xs space-y-2 border border-slate-800 min-w-[200px]">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                            <span className="font-bold text-slate-200">{label}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{d.month}</span>
                          </div>
                          <div className="space-y-1.5 font-mono">
                            <div className="flex justify-between text-indigo-300">
                              <span>Total Budget:</span>
                              <strong>{formatINR(d.totalBudget)}</strong>
                            </div>
                            <div className="flex justify-between text-rose-300">
                              <span>Actual Spend:</span>
                              <strong>{formatINR(d.totalSpent)}</strong>
                            </div>
                            <div className="flex justify-between text-emerald-300 border-t border-slate-800 pt-1">
                              <span>Net {hasSurplus ? 'Surplus' : 'Deficit'}:</span>
                              <strong className={hasSurplus ? 'text-emerald-400' : 'text-rose-400'}>
                                {hasSurplus ? '+' : ''}{formatINR(d.surplus)}
                              </strong>
                            </div>
                            <div className="flex justify-between text-slate-400 text-[10px]">
                              <span>Overall Burn:</span>
                              <span>{d.utilization}% ({d.overspentCount} overspent)</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(val) => {
                    if (val === 'totalBudget') return 'Active Budget (₹)';
                    if (val === 'totalSpent') return 'Actual Spent (₹)';
                    if (val === 'surplus') return 'Net Savings Surplus (₹)';
                    return val;
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="totalBudget"
                  fill="#818CF8"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                  name="totalBudget"
                />
                <Bar
                  yAxisId="left"
                  dataKey="totalSpent"
                  fill="#FB7185"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                  name="totalSpent"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="surplus"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 1.5, stroke: '#FFFFFF', fill: '#10B981' }}
                  name="surplus"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHART VIEW 3: CUMULATIVE DAILY BURN VS LINEAR RUN-RATE PACE */}
      {/* ========================================================================= */}
      {activeChartTab === 'burn_pace' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              Cumulative Daily Burn vs. Ideal Linear Target Pace
            </span>
            <span className="text-[11px] text-slate-400">
              Tracks whether your spending is staying safely below the month's pro-rated budget line
            </span>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyBurnPaceData} margin={{ top: 12, right: 12, left: -10, bottom: 8 }}>
                <defs>
                  <linearGradient id="burnGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="dayNum"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  tickFormatter={(val) => `D${val}`}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0]?.payload;
                      const diff = (d.actualCumulative || 0) - d.targetPace;
                      const isUnderPace = diff <= 0;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl text-xs space-y-2 border border-slate-800 min-w-[200px]">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                            <span className="font-bold text-slate-200">Day {label} ({selectedMonthLabel})</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isUnderPace ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {isUnderPace ? 'Under Pace (Disciplined)' : 'Ahead of Pace'}
                            </span>
                          </div>
                          <div className="space-y-1.5 font-mono">
                            {d.isPastOrCurrent && (
                              <>
                                <div className="flex justify-between text-indigo-300">
                                  <span>Cumulative Spend:</span>
                                  <strong>{formatINR(d.actualCumulative)}</strong>
                                </div>
                                <div className="flex justify-between text-slate-400 text-[10px]">
                                  <span>Spent Today:</span>
                                  <span>{formatINR(d.dailySpend)}</span>
                                </div>
                              </>
                            )}
                            <div className="flex justify-between text-slate-300">
                              <span>Target Linear Pace:</span>
                              <strong>{formatINR(d.targetPace)}</strong>
                            </div>
                            {d.isPastOrCurrent && (
                              <div className="flex justify-between border-t border-slate-800 pt-1 font-bold">
                                <span>Variance:</span>
                                <span className={isUnderPace ? 'text-emerald-400' : 'text-rose-400'}>
                                  {isUnderPace ? '-' : '+'}{formatINR(Math.abs(diff))}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(val) => {
                    if (val === 'actualCumulative') return 'Cumulative Actual Spend (₹)';
                    if (val === 'targetPace') return 'Linear Budget Pace Benchmark (₹)';
                    return val;
                  }}
                />
                {/* Target Linear Pace Benchmark */}
                <Line
                  type="linear"
                  dataKey="targetPace"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name="targetPace"
                />
                {/* Cumulative Actual Spending */}
                <Area
                  type="monotone"
                  dataKey="actualCumulative"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fill="url(#burnGradient)"
                  dot={{ r: 3, strokeWidth: 1.5, stroke: '#FFFFFF', fill: '#6366F1' }}
                  name="actualCumulative"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHART VIEW 4: CATEGORY UTILIZATION & ALLOCATION CARDS */}
      {/* ========================================================================= */}
      {activeChartTab === 'allocation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              Envelope Burn Gauge & Category Allocations ({selectedMonthLabel})
            </span>
            <span className="text-[11px] text-slate-400">
              Ranked by highest envelope utilization
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {chartCategoryData.map((item) => {
              const isOver = item.isOver;
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isOver
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-slate-50/60 border-slate-200/80 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <h4 className="font-bold text-slate-900 text-xs truncate max-w-[150px]">
                        {item.name}
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        isOver
                          ? 'bg-rose-100 text-rose-800'
                          : item.utilization > 80
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.utilization}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 my-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOver
                          ? 'bg-rose-500'
                          : item.utilization > 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, item.utilization)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                    <span>
                      Spent: <strong className="text-slate-900">{formatINR(item.actualSpent)}</strong>
                    </span>
                    <span>
                      Budget: <strong className="text-indigo-900">{formatINR(item.budget)}</strong>
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">
                      {isOver ? 'Overspent:' : 'Surplus Left:'}
                    </span>
                    <span
                      className={`font-bold font-mono ${
                        isOver ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {isOver ? '-' : '+'}{formatINR(Math.abs(item.variance))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section Footer with Quick Logging & Action Link */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            Rollover surpluses and deficits automatically cascade between months to maintain mathematical continuity.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenLogTransaction('expense')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ Log Expense</span>
          </button>
          <button
            onClick={() => onNavigateToPillar('finance', 'budget_engine')}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <span>Manage Budget Limits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
