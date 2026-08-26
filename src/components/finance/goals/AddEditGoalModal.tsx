import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, DollarSign, Tag, Check, AlertCircle } from 'lucide-react';
import { Account, GoalCategory, SavingsGoalBucket } from '../../../types';
import { formatINR } from '../../../utils/formatters';

interface AddEditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: SavingsGoalBucket) => void;
  editingGoal: SavingsGoalBucket | null;
  accounts: Account[];
}

const CATEGORY_OPTIONS: { value: GoalCategory; label: string; icon: string; defaultColor: string }[] = [
  { value: 'emergency', label: 'Emergency Fund', icon: 'ShieldCheck', defaultColor: '#059669' },
  { value: 'house', label: 'Home / Real Estate', icon: 'Home', defaultColor: '#4f46e5' },
  { value: 'vehicle', label: 'Vehicle / Car / Bike', icon: 'Car', defaultColor: '#0284c7' },
  { value: 'travel', label: 'Vacation & Travel', icon: 'Plane', defaultColor: '#d97706' },
  { value: 'retirement', label: 'Retirement & FIRE', icon: 'Sun', defaultColor: '#7c3aed' },
  { value: 'gadget', label: 'Gadget / Tech Upgrade', icon: 'Laptop', defaultColor: '#6366f1' },
  { value: 'wedding', label: 'Wedding / Celebrations', icon: 'Heart', defaultColor: '#ec4899' },
  { value: 'education', label: 'Higher Education / Upskilling', icon: 'GraduationCap', defaultColor: '#0891b2' },
  { value: 'other', label: 'Custom Goal Bucket', icon: 'Target', defaultColor: '#64748b' },
];

export const AddEditGoalModal: React.FC<AddEditGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingGoal,
  accounts,
}) => {
  // Top-level hooks always initialized unconditionally
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('emergency');
  const [targetAmount, setTargetAmount] = useState<number>(100000);
  const [currentSaved, setCurrentSaved] = useState<number>(0);
  const [targetDate, setTargetDate] = useState('2027-12-31');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [monthlyTarget, setMonthlyTarget] = useState<number>(5000);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [color, setColor] = useState('#059669');
  const [linkedAccountId, setLinkedAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [autoComputeMonthly, setAutoComputeMonthly] = useState(true);

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setCategory(editingGoal.category);
      setTargetAmount(editingGoal.targetAmount);
      setCurrentSaved(editingGoal.currentSaved);
      setTargetDate(editingGoal.targetDate);
      setStartDate(editingGoal.startDate);
      setMonthlyTarget(editingGoal.monthlyTarget);
      setPriority(editingGoal.priority);
      setColor(editingGoal.color);
      setLinkedAccountId(editingGoal.linkedAccountId || '');
      setNotes(editingGoal.notes || '');
      setAutoComputeMonthly(false);
    } else {
      // Default new goal
      setTitle('');
      setCategory('emergency');
      setTargetAmount(200000);
      setCurrentSaved(0);
      const defaultTarget = new Date();
      defaultTarget.setFullYear(defaultTarget.getFullYear() + 1);
      setTargetDate(defaultTarget.toISOString().split('T')[0]);
      setStartDate(new Date().toISOString().split('T')[0]);
      setPriority('high');
      setColor('#059669');
      setLinkedAccountId(accounts[0]?.id || '');
      setNotes('');
      setAutoComputeMonthly(true);
    }
  }, [editingGoal, isOpen, accounts]);

  // Recalculate suggested monthly target when target amount or target date changes
  useEffect(() => {
    if (autoComputeMonthly && targetAmount > 0 && targetDate) {
      const start = new Date(startDate);
      const end = new Date(targetDate);
      const monthsDiff = Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
      const remainingNeeded = Math.max(0, targetAmount - currentSaved);
      const computedMonthly = Math.ceil(remainingNeeded / monthsDiff);
      setMonthlyTarget(computedMonthly);
    }
  }, [targetAmount, currentSaved, targetDate, startDate, autoComputeMonthly]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const goalToSave: SavingsGoalBucket = {
      id: editingGoal ? editingGoal.id : `goal_${Date.now()}`,
      title: title.trim(),
      category,
      targetAmount: Number(targetAmount) || 0,
      currentSaved: Number(currentSaved) || 0,
      targetDate,
      startDate,
      monthlyTarget: Number(monthlyTarget) || 0,
      priority,
      color,
      icon: CATEGORY_OPTIONS.find((c) => c.value === category)?.icon || 'Target',
      linkedAccountId: linkedAccountId || undefined,
      contributions: editingGoal?.contributions || (currentSaved > 0 ? [
        {
          id: `gc_init_${Date.now()}`,
          amount: currentSaved,
          date: startDate,
          month: startDate.substring(0, 7),
          note: 'Initial starting seed balance',
        }
      ] : []),
      monthlyStreak: editingGoal?.monthlyStreak || 0,
      lastContributionMonth: editingGoal?.lastContributionMonth,
      status: currentSaved >= targetAmount ? 'completed' : 'in_progress',
      notes: notes.trim() || undefined,
    };

    onSave(goalToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: color }}
            >
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {editingGoal ? 'Edit Savings Bucket' : 'Create Goal Savings Bucket'}
              </h3>
              <p className="text-xs text-slate-500">
                Track target milestone corpus with monthly consistency streaks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form - 2 Column Layout */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs text-slate-700 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Goal Title, Category, Priority, Target Amount & Current Saved */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Goal Name / Objective *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 6-Month Emergency Shield, House Down Payment..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none bg-slate-50/60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const val = e.target.value as GoalCategory;
                      setCategory(val);
                      const matched = CATEGORY_OPTIONS.find((c) => c.value === val);
                      if (matched) setColor(matched.defaultColor);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-indigo-500 outline-none bg-slate-50/60 cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Priority Tier
                  </label>
                  <div className="flex items-center gap-1">
                    {(['high', 'medium', 'low'] as const).map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-2 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                          priority === p
                            ? p === 'high'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : p === 'medium'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Target Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={targetAmount || ''}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:border-indigo-500 outline-none bg-slate-50/60"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Current Saved (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={currentSaved}
                    onChange={(e) => setCurrentSaved(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-emerald-700 focus:border-indigo-500 outline-none bg-slate-50/60"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Dates, Monthly Target, Linked Account & Notes */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-indigo-500 outline-none bg-slate-50/60"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Monthly Target (₹)
                    </label>
                    <button
                      type="button"
                      onClick={() => setAutoComputeMonthly(!autoComputeMonthly)}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                        autoComputeMonthly ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {autoComputeMonthly ? 'Auto Calc' : 'Custom'}
                    </button>
                  </div>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    value={monthlyTarget || ''}
                    onChange={(e) => {
                      setMonthlyTarget(Number(e.target.value));
                      setAutoComputeMonthly(false);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-indigo-700 focus:border-indigo-500 outline-none bg-slate-50/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Linked Funding Account (Optional)
                </label>
                <select
                  value={linkedAccountId}
                  onChange={(e) => setLinkedAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-indigo-500 outline-none bg-slate-50/60 cursor-pointer"
                >
                  <option value="">-- None (Standalone Goal) --</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.bankName || acc.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Strategy & Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Parked in SBI sweep FD and Liquid debt mutual fund..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:border-indigo-500 outline-none bg-slate-50/60 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {editingGoal ? 'Update Goal Bucket' : 'Create Goal Bucket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
