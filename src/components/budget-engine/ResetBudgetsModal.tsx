import React, { useState } from 'react';
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  Sparkles,
  Sliders,
  Database,
  ArrowRight,
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import { DEFAULT_CATEGORY_BASE_BUDGETS } from '../../utils/budgetUtils';

interface ResetBudgetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetBudgetsToDefault: () => void;
  onResetEntireApp: () => void;
  totalSavedBudgetsCount: number;
  manualOverridesCount: number;
  currentMonthLabel: string;
}

export const ResetBudgetsModal: React.FC<ResetBudgetsModalProps> = ({
  isOpen,
  onClose,
  onResetBudgetsToDefault,
  onResetEntireApp,
  totalSavedBudgetsCount,
  manualOverridesCount,
  currentMonthLabel,
}) => {
  const [resetType, setResetType] = useState<'budgets_only' | 'entire_app'>('budgets_only');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleExecuteReset = () => {
    if (resetType === 'budgets_only') {
      onResetBudgetsToDefault();
      setSuccessMessage(
        'Monthly budgets have been reset to default. All manual overrides cleared and category limits restored to original base allocations.'
      );
    } else {
      onResetEntireApp();
      setSuccessMessage(
        'VitaFlow OS has been completely reset as a brand new application. All transactions, accounts, budgets, goals, and habits restored to fresh factory defaults.'
      );
    }
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Reset Monthly Budgets to Default
              </h3>
              <p className="text-xs text-slate-500">
                Clear manual overrides & restore original set limits
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

        {/* Content */}
        <div className="p-6 space-y-5">
          {isSuccess ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-center space-y-2 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-emerald-900">
                Reset Completed Successfully!
              </h4>
              <p className="text-xs text-emerald-700">{successMessage}</p>
            </div>
          ) : (
            <>
              {/* Context Summary Pill */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Active Month Scope:</span>
                  <span className="font-bold text-slate-900">{currentMonthLabel}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Manual Rollover Overrides:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      manualOverridesCount > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {manualOverridesCount} active override(s)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Custom Stored Budgets:</span>
                  <span className="font-semibold text-slate-800">
                    {totalSavedBudgetsCount} category records
                  </span>
                </div>
              </div>

              {/* Reset Scope Selector */}
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Reset Action:
                </label>

                {/* Option 1: Monthly Budgets Only */}
                <div
                  onClick={() => setResetType('budgets_only')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    resetType === 'budgets_only'
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reset_type"
                    checked={resetType === 'budgets_only'}
                    onChange={() => setResetType('budgets_only')}
                    className="mt-1 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        1. Reset Monthly Budgets to Original Limits
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Clears all manual adjustments and overrides. Restores every category back
                      to its original default base limit (e.g., Fuel/Transport: ₹2,000, Shopping:
                      ₹5,000, Food: ₹15,000) and resets automatic carryforwards. Transactions and
                      accounts remain untouched.
                    </p>
                  </div>
                </div>

                {/* Option 2: Entire Application Fresh (New One) */}
                <div
                  onClick={() => setResetType('entire_app')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    resetType === 'entire_app'
                      ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-600/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reset_type"
                    checked={resetType === 'entire_app'}
                    onChange={() => setResetType('entire_app')}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        2. Factory Reset Entire Application (New One)
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                        Full Slate
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Resets VitaFlow OS completely to its pristine out-of-the-box state. Clears all
                      local storage and re-seeds fresh starter transactions, bank balances, credit
                      cards, loans, budgets, vitals, workouts, and atomic habit trackers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample Default Limits Preview */}
              {resetType === 'budgets_only' && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 space-y-2">
                  <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block">
                    Original Baseline Limits that will be restored:
                  </span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span>Transport & Fuel:</span>
                      <span className="font-semibold text-slate-900">₹2,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shopping & E-comm:</span>
                      <span className="font-semibold text-slate-900">₹5,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Food & Dining:</span>
                      <span className="font-semibold text-slate-900">₹15,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Groceries:</span>
                      <span className="font-semibold text-slate-900">₹10,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bills & Utilities:</span>
                      <span className="font-semibold text-slate-900">₹6,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rent & Housing:</span>
                      <span className="font-semibold text-slate-900">₹25,000</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleExecuteReset}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-98 flex items-center gap-1.5 ${
                resetType === 'entire_app'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                {resetType === 'entire_app'
                  ? 'Reset Entire App as New'
                  : 'Confirm Reset to Default Limits'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
