import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  Sliders,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Category, MonthlyCategoryBudget, Transaction } from '../../types';
import { formatINR } from '../../utils/formatters';
import {
  formatMonthYear,
  getCategoryRolloverAuditTrail,
  getNextMonth,
  getPreviousMonth,
} from '../../utils/budgetUtils';

interface RolloverWaterfallAuditProps {
  categories: Category[];
  transactions: Transaction[];
  savedBudgets: MonthlyCategoryBudget[];
  selectedMonth: string;
  onEditCategoryBudget: (categoryId: string) => void;
}

export const RolloverWaterfallAudit: React.FC<RolloverWaterfallAuditProps> = ({
  categories,
  transactions,
  savedBudgets,
  selectedMonth,
  onEditCategoryBudget,
}) => {
  const expenseCategories = categories.filter(
    (c) => c.type === 'expense' || c.type === 'all'
  );

  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    expenseCategories.find((c) => c.id === 'cat_transport')?.id ||
      expenseCategories[0]?.id ||
      'cat_transport'
  );

  // We show 4 continuous months starting from 1 month before selectedMonth
  const startMonth = getPreviousMonth(selectedMonth);
  const auditTrail = getCategoryRolloverAuditTrail(
    activeCategoryId,
    categories,
    transactions,
    savedBudgets,
    startMonth,
    4
  );

  const activeCategory = expenseCategories.find((c) => c.id === activeCategoryId);

  return (
    <div className="space-y-6">
      {/* Category Picker Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Select Category for Waterfall Audit
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Tracking multi-month rollover continuity & variance
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {expenseCategories.map((cat) => {
            const isSelected = cat.id === activeCategoryId;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Waterfall Visual Cards & Flow */}
      {activeCategory && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <h4 className="text-lg font-bold text-slate-900 font-heading">
                  {activeCategory.name} • 4-Month Rollover Timeline
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed step-by-step carryforward breakdown showing Opening Balance, Base Budget, Actual Spend, and Closing Rollover.
              </p>
            </div>

            <button
              onClick={() => onEditCategoryBudget(activeCategory.id)}
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit {activeCategory.name} Budget</span>
            </button>
          </div>

          {/* Chronological Month Cards Progression */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {auditTrail.map((step, idx) => {
              const isSelected = step.month === selectedMonth;
              const hasSurplus = step.netMonthVariance > 0;
              const isOverspent = step.netMonthVariance < 0;

              return (
                <div
                  key={step.month}
                  className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-md'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        {step.monthLabel}
                      </span>
                      {isSelected ? (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white">
                          Selected
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Month {idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Step Metrics */}
                    <div className="space-y-2 text-xs pt-2 border-t border-slate-200/80">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Opening Rollover:</span>
                        <span className={`font-semibold ${
                          step.openingRollover > 0
                            ? 'text-emerald-600'
                            : step.openingRollover < 0
                            ? 'text-rose-600'
                            : 'text-slate-600'
                        }`}>
                          {step.openingRollover > 0 ? '+' : ''}
                          {formatINR(step.openingRollover)}
                          {step.isManuallyOverridden && (
                            <span className="ml-1 text-[8px] bg-amber-100 text-amber-800 px-1 rounded">Edit</span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500">
                        <span>Base Allocation:</span>
                        <span className="font-semibold text-slate-800">
                          {formatINR(step.baseBudget)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-900 font-bold bg-white p-2 rounded-lg border border-slate-200">
                        <span>Total Active Budget:</span>
                        <span className="text-indigo-600">{formatINR(step.totalEffectiveBudget)}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span>Actual Spent:</span>
                        <span className="font-semibold text-slate-800">
                          {formatINR(step.spent)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Net Result & Rollover to next */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80">
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      hasSurplus
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : isOverspent
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider block opacity-80">
                          {hasSurplus ? 'Surplus Carryforward' : isOverspent ? 'Overspent Deficit' : 'Net Balanced'}
                        </span>
                        <span className="text-xs font-extrabold">
                          {hasSurplus ? '+' : ''}
                          {formatINR(step.closingRolloverToNextMonth)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-bold">
                        <span className="hidden sm:inline">To Next</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Audit Chain Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Full Mathematical Rollover Table
              </h5>
              <span className="text-[10px] text-slate-400 font-semibold">
                Formula: Opening Rollover + Base Budget - Spent = Closing Rollover
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Month</th>
                    <th className="py-3 px-4 text-right">Opening Rollover</th>
                    <th className="py-3 px-4 text-right">Base Budget</th>
                    <th className="py-3 px-4 text-right">Total Effective</th>
                    <th className="py-3 px-4 text-right">Actual Spent</th>
                    <th className="py-3 px-4 text-right">Closing Carryforward</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {auditTrail.map((row) => (
                    <tr
                      key={row.month}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        row.month === selectedMonth ? 'bg-indigo-50/30 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {row.monthLabel}
                        {row.month === selectedMonth && (
                          <span className="ml-2 text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-bold">
                            Current
                          </span>
                        )}
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${
                        row.openingRollover > 0
                          ? 'text-emerald-600'
                          : row.openingRollover < 0
                          ? 'text-rose-600'
                          : 'text-slate-500'
                      }`}>
                        {row.openingRollover > 0 ? '+' : ''}
                        {formatINR(row.openingRollover)}
                      </td>
                      <td className="py-3 px-4 text-right">{formatINR(row.baseBudget)}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatINR(row.totalEffectiveBudget)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-800">
                        {formatINR(row.spent)}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${
                        row.closingRolloverToNextMonth > 0
                          ? 'text-emerald-600'
                          : row.closingRolloverToNextMonth < 0
                          ? 'text-rose-600'
                          : 'text-slate-500'
                      }`}>
                        {row.closingRolloverToNextMonth > 0 ? '+' : ''}
                        {formatINR(row.closingRolloverToNextMonth)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.closingRolloverToNextMonth >= 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            <CheckCircle2 className="w-3 h-3" />
                            Surplus
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                            <AlertTriangle className="w-3 h-3" />
                            Deficit
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
