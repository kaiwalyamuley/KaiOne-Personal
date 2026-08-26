import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Flame, CheckCircle, Calendar } from 'lucide-react';
import { Account, SavingsGoalBucket, GoalContribution } from '../../../types';
import { formatINR } from '../../../utils/formatters';

interface GoalDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoalBucket | null;
  accounts: Account[];
  onRecordDeposit: (goalId: string, contribution: GoalContribution, newTotalSaved: number, isStreakIncrement: boolean) => void;
}

export const GoalDepositModal: React.FC<GoalDepositModalProps> = ({
  isOpen,
  onClose,
  goal,
  accounts,
  onRecordDeposit,
}) => {
  const [type, setType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<number>(goal?.monthlyTarget || 5000);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fromAccountId, setFromAccountId] = useState<string>(goal?.linkedAccountId || accounts[0]?.id || '');
  const [note, setNote] = useState<string>('');

  if (!isOpen || !goal) return null;

  const currentMonth = date.substring(0, 7);
  const isEligibleForMonthlyStreak =
    type === 'deposit' &&
    goal.lastContributionMonth !== currentMonth &&
    amount >= Math.min(goal.monthlyTarget * 0.5, 1000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const contributionAmount = type === 'deposit' ? amount : -amount;
    const newTotal = Math.max(0, goal.currentSaved + contributionAmount);

    const contribution: GoalContribution = {
      id: `gc_${Date.now()}`,
      amount: contributionAmount,
      date,
      month: currentMonth,
      note: note.trim() || (type === 'deposit' ? 'Monthly Goal Deposit' : 'Withdrawal from Goal Bucket'),
      fromAccountId: fromAccountId || undefined,
    };

    onRecordDeposit(goal.id, contribution, newTotal, isEligibleForMonthlyStreak);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
              style={{ backgroundColor: goal.color }}
            >
              {type === 'deposit' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                {type === 'deposit' ? 'Deposit to Goal Bucket' : 'Withdraw from Bucket'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">{goal.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Toggle Type */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setType('deposit')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                type === 'deposit' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Add Deposit
            </button>
            <button
              type="button"
              onClick={() => setType('withdraw')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                type === 'withdraw' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              - Withdraw Funds
            </button>
          </div>

          {/* Current Status Banner */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Currently Saved</span>
              <p className="text-sm font-bold text-slate-800">{formatINR(goal.currentSaved)}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Target Goal</span>
              <p className="text-sm font-bold text-indigo-600">{formatINR(goal.targetAmount)}</p>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Amount to {type === 'deposit' ? 'Deposit' : 'Withdraw'} (₹) *
            </label>
            <input
              type="number"
              required
              min="100"
              step="500"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="e.g. 15000"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:border-indigo-500 outline-none"
            />
            {type === 'deposit' && (
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
                <span>Quick:</span>
                <button
                  type="button"
                  onClick={() => setAmount(goal.monthlyTarget)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px]"
                >
                  Monthly Target ({formatINR(goal.monthlyTarget)})
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(Math.max(0, goal.targetAmount - goal.currentSaved))}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px]"
                >
                  Remaining Target
                </button>
              </div>
            )}
          </div>

          {/* Date & Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Transaction Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Source Account
              </label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-indigo-500 outline-none bg-white"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatINR(acc.initialBalance)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Monthly Streak Badge Notice */}
          {type === 'deposit' && (
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-amber-900">
                    Monthly Consistency Streak: {goal.monthlyStreak} Months
                  </span>
                </div>
                <p className="text-[10px] text-amber-800 mt-0.5">
                  {isEligibleForMonthlyStreak
                    ? '🎉 This deposit will increase your monthly consistency streak by +1!'
                    : `Already contributed for ${goal.lastContributionMonth || currentMonth}. Streak is protected!`}
                </p>
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Memo / Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Monthly SIP deposit from salary"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-xs transition-colors ${
                type === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {type === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
