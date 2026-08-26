import React, { useState } from 'react';
import { X, Calendar, DollarSign, Sparkles } from 'lucide-react';
import { LifeEventImpact } from '../../../types';
import { formatINR } from '../../../utils/formatters';

interface AddLifeEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: LifeEventImpact) => void;
}

export const AddLifeEventModal: React.FC<AddLifeEventModalProps> = ({
  isOpen,
  onClose,
  onAddEvent,
}) => {
  const [title, setTitle] = useState('');
  const [yearOffset, setYearOffset] = useState<number>(3);
  const [type, setType] = useState<'expense' | 'windfall' | 'income_boost'>('expense');
  const [amount, setAmount] = useState<number>(500000);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    const event: LifeEventImpact = {
      id: `le_${Date.now()}`,
      title: title.trim(),
      yearOffset: Number(yearOffset) || 1,
      amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      type,
      description: description.trim() || undefined,
    };

    onAddEvent(event);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Inject Future Life Event
              </h3>
              <p className="text-xs text-slate-500">
                Simulate major expenses or windfall lump-sums in wealth model
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Property Downpayment, ESOP Vesting, Child Education..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Event Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-indigo-500 outline-none bg-white"
              >
                <option value="expense">Major Expense (- Outflow)</option>
                <option value="windfall">Lump-Sum Windfall (+ Inflow)</option>
                <option value="income_boost">Permanent Salary Boost (+)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Occurs In (Years from Now)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={yearOffset}
                onChange={(e) => setYearOffset(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-indigo-700 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Amount Impact (₹) *
            </label>
            <input
              type="number"
              min="10000"
              step="25000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Notes
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 20% flat downpayment paid from liquid investments"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:border-indigo-500 outline-none"
            />
          </div>

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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Inject Event into Model
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
