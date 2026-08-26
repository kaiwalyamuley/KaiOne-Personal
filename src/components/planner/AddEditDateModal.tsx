import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Sparkles,
  Tag,
  DollarSign,
  Clock,
  Check,
  Heart,
  Crown,
  Plane,
  AlertCircle,
  Save,
} from 'lucide-react';
import { DateToRemember, DateCategory } from '../../types';

interface AddEditDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDate: (date: DateToRemember) => void;
  editingDate?: DateToRemember | null;
  defaultDate?: string;
}

const CATEGORY_OPTIONS: { value: DateCategory; label: string; icon: string }[] = [
  { value: 'birthday', label: 'Birthday', icon: '🎂' },
  { value: 'festival', label: 'Festival / Holiday', icon: '🌺' },
  { value: 'anniversary', label: 'Anniversary', icon: '💍' },
  { value: 'renewal', label: 'Policy / Insurance Renewal', icon: '🚗' },
  { value: 'bill_due', label: 'Bill / Tax / EMI Due', icon: '💳' },
  { value: 'medical', label: 'Health / Medical Checkup', icon: '🩺' },
  { value: 'milestone', label: 'Life Milestone', icon: '🎯' },
  { value: 'personal', label: 'Personal Reminder', icon: '📌' },
];

export const AddEditDateModal: React.FC<AddEditDateModalProps> = ({
  isOpen,
  onClose,
  onSaveDate,
  editingDate,
  defaultDate,
}) => {
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [category, setCategory] = useState<DateCategory>('birthday');
  const [isAnnualRecurring, setIsAnnualRecurring] = useState<boolean>(true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState<number>(7);
  const [estimatedCost, setEstimatedCost] = useState<string>('');
  const [icon, setIcon] = useState<string>('🎂');
  const [color, setColor] = useState<string>('#8b5cf6');
  const [personName, setPersonName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isImportant, setIsImportant] = useState<boolean>(false);

  useEffect(() => {
    if (editingDate) {
      setTitle(editingDate.title);
      setDate(editingDate.date);
      setCategory(editingDate.category);
      setIsAnnualRecurring(editingDate.isAnnualRecurring);
      setReminderDaysBefore(editingDate.reminderDaysBefore || 7);
      setEstimatedCost(editingDate.estimatedCost ? String(editingDate.estimatedCost) : '');
      setIcon(editingDate.icon || '📌');
      setColor(editingDate.color || '#8b5cf6');
      setPersonName(editingDate.personName || '');
      setDescription(editingDate.description || '');
      setIsImportant(editingDate.isImportant || false);
    } else {
      setTitle('');
      setDate(defaultDate || '2026-09-01');
      setCategory('birthday');
      setIsAnnualRecurring(true);
      setReminderDaysBefore(7);
      setEstimatedCost('');
      setIcon('🎂');
      setColor('#8b5cf6');
      setPersonName('');
      setDescription('');
      setIsImportant(false);
    }
  }, [editingDate, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const newRecord: DateToRemember = {
      id: editingDate?.id || `dtr_${Date.now()}`,
      title: title.trim(),
      date,
      category,
      isAnnualRecurring,
      reminderDaysBefore: Number(reminderDaysBefore) || 7,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      icon,
      color,
      personName: personName.trim() || undefined,
      description: description.trim() || undefined,
      isImportant,
    };

    onSaveDate(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading">
                {editingDate ? 'Edit Date to Remember' : 'Add Date to Remember / Milestone'}
              </h2>
              <p className="text-xs text-indigo-200">
                Track birthdays, festivals, renewal deadlines & milestones
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - 2 Column Layout */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Title, Category, Date, Person & Planned Budget */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Event / Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kaiwalya's Birthday, Ganesh Chaturthi, Car Insurance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const cat = e.target.value as DateCategory;
                      setCategory(cat);
                      const matched = CATEGORY_OPTIONS.find((c) => c.value === cat);
                      if (matched) setIcon(matched.icon);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 font-medium cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Associated Person (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kaiwalya, Mom, Dad, Self"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Planned Budget (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Icon Picker, Reminder, Recurring/VIP & Notes */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Icon Emoji
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {['🎂', '🌺', '🐘', '🪔', '👑', '💍', '🚗', '🩺', '✨', '🏖️'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setIcon(em)}
                      className={`w-9 h-9 rounded-xl text-base flex items-center justify-center transition-all cursor-pointer ${
                        icon === em
                          ? 'bg-indigo-600 text-white scale-105 shadow-xs ring-2 ring-indigo-400'
                          : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reminder Days Before
                </label>
                <select
                  value={reminderDaysBefore}
                  onChange={(e) => setReminderDaysBefore(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 font-medium cursor-pointer"
                >
                  <option value={1}>1 Day before</option>
                  <option value={3}>3 Days before</option>
                  <option value={7}>7 Days before (1 Week)</option>
                  <option value={14}>14 Days before (2 Weeks)</option>
                  <option value={30}>30 Days before (1 Month)</option>
                </select>
              </div>

              {/* Recurring & Important Checkboxes */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-medium text-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnnualRecurring}
                    onChange={(e) => setIsAnnualRecurring(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Repeats Annually (Every Year on this date)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Star as VIP / High-Priority Celebration ⭐</span>
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Celebration Memo & Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Add gifts wishlist, dinner reservations, or policy renewal notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 font-medium resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingDate ? 'Save Changes' : 'Add Milestone'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
