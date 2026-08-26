import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Sparkles, Brain, Dumbbell, Receipt, BookOpen, Ban } from 'lucide-react';
import { Habit, HabitCategoryType, HabitFrequency } from '../../types';

interface AddEditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveHabit: (habit: Habit) => void;
  editingHabit: Habit | null;
}

const CATEGORY_MAP: { value: HabitCategoryType; label: string; defaultColor: string; defaultIcon: string }[] = [
  { value: 'mind', label: 'Mind & Focus', defaultColor: '#7c3aed', defaultIcon: 'Sparkles' },
  { value: 'body', label: 'Body & Physical Health', defaultColor: '#0284c7', defaultIcon: 'Droplets' },
  { value: 'productivity', label: 'Deep Work & Productivity', defaultColor: '#4f46e5', defaultIcon: 'Brain' },
  { value: 'wealth', label: 'Financial Discipline', defaultColor: '#059669', defaultIcon: 'Receipt' },
  { value: 'growth', label: 'Personal Growth & Reading', defaultColor: '#d97706', defaultIcon: 'BookOpen' },
];

export const AddEditHabitModal: React.FC<AddEditHabitModalProps> = ({
  isOpen,
  onClose,
  onSaveHabit,
  editingHabit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HabitCategoryType>('mind');
  const [cue, setCue] = useState('');
  const [routine, setRoutine] = useState('');
  const [reward, setReward] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('morning');
  const [targetDaysPerMonth, setTargetDaysPerMonth] = useState<number>(30);
  const [color, setColor] = useState('#7c3aed');

  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title);
      setCategory(editingHabit.category);
      setCue(editingHabit.cue || '');
      setRoutine(editingHabit.routine);
      setReward(editingHabit.reward || '');
      setFrequency(editingHabit.frequency);
      setTimeOfDay(editingHabit.timeOfDay);
      setTargetDaysPerMonth(editingHabit.targetDaysPerMonth);
      setColor(editingHabit.color);
    } else {
      setTitle('');
      setCategory('mind');
      setCue('Right after morning coffee');
      setRoutine('10-min meditation or reading');
      setReward('Enjoy uninterrupted breakfast');
      setFrequency('daily');
      setTimeOfDay('morning');
      setTargetDaysPerMonth(30);
      setColor('#7c3aed');
    }
  }, [editingHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !routine.trim()) return;

    const habit: Habit = {
      id: editingHabit ? editingHabit.id : `habit_${Date.now()}`,
      title: title.trim(),
      category,
      cue: cue.trim() || undefined,
      routine: routine.trim(),
      reward: reward.trim() || undefined,
      frequency,
      timeOfDay,
      targetDaysPerMonth: Number(targetDaysPerMonth) || 30,
      color,
      icon: CATEGORY_MAP.find((c) => c.value === category)?.defaultIcon || 'CheckSquare',
      currentStreak: editingHabit?.currentStreak || 0,
      bestStreak: editingHabit?.bestStreak || 0,
      totalCompletions: editingHabit?.totalCompletions || 0,
      active: true,
      createdAt: editingHabit?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSaveHabit(habit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: color }}
            >
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {editingHabit ? 'Edit Habit Protocol' : 'Build New Habit Routine'}
              </h3>
              <p className="text-xs text-slate-500">
                Cue ➔ Routine ➔ Reward neuro-habit loop architecture
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

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Basic Habit Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Habit Name *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 10-Min Morning Meditation, 90-Min Deep Work..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:border-indigo-500 outline-none bg-slate-50/60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Pillar Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const val = e.target.value as HabitCategoryType;
                      setCategory(val);
                      const matched = CATEGORY_MAP.find((c) => c.value === val);
                      if (matched) setColor(matched.defaultColor);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-indigo-500 outline-none bg-slate-50/60 cursor-pointer"
                  >
                    {CATEGORY_MAP.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Time of Day
                  </label>
                  <select
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-indigo-500 outline-none bg-slate-50/60 cursor-pointer"
                  >
                    <option value="morning">Morning 🌅</option>
                    <option value="afternoon">Afternoon ☀️</option>
                    <option value="evening">Evening 🌙</option>
                    <option value="anytime">Anytime ⏱️</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                <span className="font-bold text-indigo-700 block uppercase tracking-wider text-[10px]">Neuro-habit Rule</span>
                <p>Attach the new action to a non-negotiable anchor moment in your day to achieve effortless automaticity.</p>
              </div>
            </div>

            {/* Right Column: Habit Loop: Cue, Routine, Reward */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">
                Habit Stacking Loop (Atomic Formula)
              </h4>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                  1. Cue / Trigger (When & Where)
                </label>
                <input
                  type="text"
                  value={cue}
                  onChange={(e) => setCue(e.target.value)}
                  placeholder="e.g. After turning off alarm at 6:30 AM"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                  2. Routine Action (The Micro-Habit) *
                </label>
                <input
                  type="text"
                  required
                  value={routine}
                  onChange={(e) => setRoutine(e.target.value)}
                  placeholder="e.g. Drink 500ml water and complete 10 box breaths"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 outline-none bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                  3. Immediate Reward (Dopamine Anchor)
                </label>
                <input
                  type="text"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder="e.g. Check off streak in VitaFlow & savor morning tea"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none bg-white focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {editingHabit ? 'Update Habit' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
