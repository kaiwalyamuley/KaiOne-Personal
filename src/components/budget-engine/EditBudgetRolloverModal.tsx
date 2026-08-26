import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Edit3,
  Check,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  Sliders,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Shield,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { CategoryBudgetStatus, MonthlyCategoryBudget } from '../../types';
import { formatINR } from '../../utils/formatters';
import {
  formatMonthYear,
  getPreviousMonth,
  DEFAULT_CATEGORY_BASE_BUDGETS,
} from '../../utils/budgetUtils';

interface EditBudgetRolloverModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: CategoryBudgetStatus | null;
  onSaveBudget: (budget: MonthlyCategoryBudget) => void;
}

export const EditBudgetRolloverModal: React.FC<EditBudgetRolloverModalProps> = ({
  isOpen,
  onClose,
  status,
  onSaveBudget,
}) => {
  // Form states - declared unconditionally at top level
  const [baseBudget, setBaseBudget] = useState<number>(status?.baseBudget || 0);
  const [rolloverMode, setRolloverMode] = useState<'auto' | 'manual' | 'disabled'>(
    !status?.isRolloverEnabled
      ? 'disabled'
      : status?.isManuallyOverridden
      ? 'manual'
      : 'auto'
  );
  const [manualOverrideAmount, setManualOverrideAmount] = useState<number>(
    status?.manualRolloverOverride !== null && status?.manualRolloverOverride !== undefined
      ? status.manualRolloverOverride
      : status?.computedRolloverFromPrevMonth || 0
  );

  // Maximum Rollover Cap States
  const [isCapEnabled, setIsCapEnabled] = useState<boolean>(
    status?.maxRolloverCap !== null && status?.maxRolloverCap !== undefined
  );
  const [maxRolloverCapAmount, setMaxRolloverCapAmount] = useState<number>(
    status?.maxRolloverCap !== null && status?.maxRolloverCap !== undefined
      ? status.maxRolloverCap
      : 1000
  );

  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (status) {
      setBaseBudget(status.baseBudget);
      setRolloverMode(
        !status.isRolloverEnabled
          ? 'disabled'
          : status.isManuallyOverridden
          ? 'manual'
          : 'auto'
      );
      setManualOverrideAmount(
        status.manualRolloverOverride !== null
          ? status.manualRolloverOverride
          : status.computedRolloverFromPrevMonth
      );
      setIsCapEnabled(
        status.maxRolloverCap !== null && status.maxRolloverCap !== undefined
      );
      setMaxRolloverCapAmount(
        status.maxRolloverCap !== null && status.maxRolloverCap !== undefined
          ? status.maxRolloverCap
          : 1000
      );
      setNotes(status.manualRolloverNotes || '');
    }
  }, [status, isOpen]);

  // Safe early return only after all hooks have executed
  if (!isOpen || !status) return null;

  const prevMonth = getPreviousMonth(status.month);
  const prevMonthLabel = formatMonthYear(prevMonth);
  const currentMonthLabel = formatMonthYear(status.month);

  // Compute live effective rollover and capping behavior
  const rawComputedSurplusOrDeficit = status.computedRolloverFromPrevMonth;
  const currentCapValue = isCapEnabled ? Math.max(0, Number(maxRolloverCapAmount) || 0) : null;

  let computedWithCap = rawComputedSurplusOrDeficit;
  let isCappedActive = false;
  let excessCappedAmount = 0;

  if (
    isCapEnabled &&
    currentCapValue !== null &&
    rawComputedSurplusOrDeficit > currentCapValue
  ) {
    isCappedActive = true;
    excessCappedAmount = rawComputedSurplusOrDeficit - currentCapValue;
    computedWithCap = currentCapValue;
  }

  const effectiveRollover =
    rolloverMode === 'disabled'
      ? 0
      : rolloverMode === 'manual'
      ? Number(manualOverrideAmount) || 0
      : computedWithCap;

  const totalEffectiveBudget = Math.max(0, (Number(baseBudget) || 0) + effectiveRollover);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const isEnabled = rolloverMode !== 'disabled';
    const overrideValue =
      rolloverMode === 'manual' ? Number(manualOverrideAmount) || 0 : null;

    const budgetRecord: MonthlyCategoryBudget = {
      id: `budget_${status.month}_${status.categoryId}`,
      month: status.month,
      categoryId: status.categoryId,
      baseBudget: Math.max(0, Number(baseBudget) || 0),
      rolloverEnabled: isEnabled,
      maxRolloverCap: isCapEnabled ? Math.max(0, Number(maxRolloverCapAmount) || 0) : null,
      manualRolloverOverride: overrideValue,
      manualRolloverNotes: notes.trim() || undefined,
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onSaveBudget(budgetRecord);
    onClose();
  };

  const handleResetCategoryToDefault = () => {
    const defaultLimit = DEFAULT_CATEGORY_BASE_BUDGETS[status.categoryId] ?? 2000;
    setBaseBudget(defaultLimit);
    setRolloverMode('auto');
    setManualOverrideAmount(status.computedRolloverFromPrevMonth);
    setIsCapEnabled(false);
    setMaxRolloverCapAmount(1000);
    setNotes('');

    const budgetRecord: MonthlyCategoryBudget = {
      id: `budget_${status.month}_${status.categoryId}`,
      month: status.month,
      categoryId: status.categoryId,
      baseBudget: defaultLimit,
      rolloverEnabled: true,
      maxRolloverCap: null,
      manualRolloverOverride: null,
      manualRolloverNotes: undefined,
      notes: undefined,
      updatedAt: new Date().toISOString(),
    };

    onSaveBudget(budgetRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Edit Budget, Rollover & Cap
              </h3>
              <p className="text-xs text-slate-500">
                {status.categoryName} • <span className="font-semibold text-slate-700">{currentMonthLabel}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {/* Previous Month Variance Context Banner */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
              <span>Previous Month Context ({prevMonthLabel})</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Carryforward Source</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-200/70">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Prev Budget</span>
                <p className="text-xs font-bold text-slate-800">{formatINR(status.previousMonthEffectiveBudget)}</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Prev Spent</span>
                <p className="text-xs font-bold text-slate-800">{formatINR(status.previousMonthSpent)}</p>
              </div>
              <div className={`p-2 rounded-lg border ${
                rawComputedSurplusOrDeficit >= 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <span className="text-[10px] uppercase font-semibold">
                  {rawComputedSurplusOrDeficit >= 0 ? 'Surplus (+)' : 'Overspent (-)'}
                </span>
                <p className="text-xs font-bold">
                  {rawComputedSurplusOrDeficit >= 0 ? '+' : ''}
                  {formatINR(rawComputedSurplusOrDeficit)}
                </p>
              </div>
            </div>
          </div>

          {/* 1. Base Budget Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Base Monthly Budget (INR ₹)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold">
                ₹
              </div>
              <input
                type="number"
                min="0"
                step="50"
                value={baseBudget}
                onChange={(e) => setBaseBudget(Math.max(0, Number(e.target.value)))}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                placeholder="e.g. 2000"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500">
              The standard base allocation for {status.categoryName} in {currentMonthLabel}.
            </p>
          </div>

          {/* 2. Rollover Mechanism Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Budget Rollover Settings
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Option A: Auto Rollover */}
              <button
                type="button"
                onClick={() => setRolloverMode('auto')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  rolloverMode === 'auto'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                    Auto Rollover
                  </span>
                  {rolloverMode === 'auto' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Auto-inherit surplus or deficit ({rawComputedSurplusOrDeficit >= 0 ? '+' : ''}{formatINR(rawComputedSurplusOrDeficit)})
                </p>
              </button>

              {/* Option B: Manual Rollover Edit */}
              <button
                type="button"
                onClick={() => setRolloverMode('manual')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  rolloverMode === 'manual'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    Manual Edit
                  </span>
                  {rolloverMode === 'manual' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Specify custom rolled amount or reset carryforward
                </p>
              </button>

              {/* Option C: Disabled */}
              <button
                type="button"
                onClick={() => setRolloverMode('disabled')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  rolloverMode === 'disabled'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">
                    No Rollover
                  </span>
                  {rolloverMode === 'disabled' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Reset to zero each month without carryforward
                </p>
              </button>
            </div>
          </div>

          {/* 3. Maximum Rollover Cap (New Feature!) */}
          {rolloverMode !== 'disabled' && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    3. Maximum Rollover Cap
                  </label>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsCapEnabled(false)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      !isCapEnabled
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Uncapped
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCapEnabled(true)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      isCapEnabled
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>Cap Active</span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Limits the maximum surplus amount allowed to roll over from the previous month to prevent runaway balance inflation.
              </p>

              {isCapEnabled ? (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-700 shrink-0">
                      Cap Surplus At:
                    </span>
                    <div className="relative flex-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 font-bold text-xs">
                        ₹
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={maxRolloverCapAmount}
                        onChange={(e) => setMaxRolloverCapAmount(Math.max(0, Number(e.target.value)))}
                        className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
                        placeholder="e.g. 1000"
                      />
                    </div>
                  </div>

                  {/* Preset Cap Pill Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-medium">Presets:</span>
                    {[500, 1000, 1500, 2000, 3000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setMaxRolloverCapAmount(amt)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                          maxRolloverCapAmount === amt
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>

                  {/* Capping Live Status Badge */}
                  {isCappedActive && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Rollover Cap Clamped Surplus:</strong>
                        <p className="text-[10px] text-amber-800 mt-0.5">
                          Uncapped surplus is <span className="font-semibold">+{formatINR(rawComputedSurplusOrDeficit)}</span>, but will be capped at <span className="font-bold text-amber-950">{formatINR(currentCapValue || 0)}</span>. The excess <span className="font-bold text-amber-950">{formatINR(excessCappedAmount)}</span> is preserved/saved.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-200/80">
                  ⚡ Rollover is uncapped: 100% of any surplus or deficit carries forward unconditionally.
                </div>
              )}
            </div>
          )}

          {/* If Manual Rollover is selected: Custom Amount Input */}
          {rolloverMode === 'manual' && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-amber-900">
                  Custom Rolled Over Amount (INR ₹)
                </label>
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Can be positive (Surplus) or negative (Overspent)
                </span>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-amber-700 font-bold">
                  ₹
                </div>
                <input
                  type="number"
                  step="50"
                  value={manualOverrideAmount}
                  onChange={(e) => setManualOverrideAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-amber-300 bg-white text-sm font-bold text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                  placeholder="e.g. 600 or -400"
                />
              </div>
              <p className="text-[11px] text-amber-800">
                You are manually editing the rolled over amount for this category in {currentMonthLabel}.
              </p>
            </div>
          )}

          {/* 4. Live Mathematical Calculation Breakdown */}
          <div className="rounded-xl border-2 border-indigo-100 bg-indigo-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
              <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                Overall Budget Calculation for {currentMonthLabel}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-600 text-white rounded">
                Live Result
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Base Monthly Budget:</span>
                <span className="font-semibold text-slate-900">{formatINR(baseBudget)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  Rolled Over from {prevMonthLabel}:
                  {rolloverMode === 'manual' && (
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded">Manual</span>
                  )}
                  {rolloverMode === 'auto' && isCappedActive && (
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" />
                      Capped at {formatINR(currentCapValue || 0)}
                    </span>
                  )}
                  {rolloverMode === 'auto' && !isCappedActive && (
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">Auto</span>
                  )}
                  {rolloverMode === 'disabled' && (
                    <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-1 rounded">Disabled</span>
                  )}
                </span>
                <span className={`font-semibold ${
                  effectiveRollover > 0
                    ? 'text-emerald-600'
                    : effectiveRollover < 0
                    ? 'text-rose-600'
                    : 'text-slate-500'
                }`}>
                  {effectiveRollover > 0 ? '+' : ''}
                  {formatINR(effectiveRollover)}
                </span>
              </div>

              <div className="border-t border-indigo-200/60 pt-2 flex items-center justify-between text-sm">
                <span className="font-bold text-indigo-950">Total Overall Budget:</span>
                <span className="font-extrabold text-base text-indigo-600">
                  {formatINR(totalEffectiveBudget)}
                </span>
              </div>

              {status.actualSpent > 0 && (
                <div className="border-t border-indigo-200/40 pt-2 flex items-center justify-between text-xs text-slate-600">
                  <span>Current Spent in {currentMonthLabel}:</span>
                  <span className="font-semibold text-slate-800">
                    {formatINR(status.actualSpent)} ({((status.actualSpent / Math.max(1, totalEffectiveBudget)) * 100).toFixed(0)}%)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Optional Memo / Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Adjustment Notes / Memo (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Extra commute planned for family visit"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetCategoryToDefault}
            className="px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Clear manual overrides and return to original baseline limit"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm transition-all active:scale-98"
            >
              Save Budget & Rollover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
