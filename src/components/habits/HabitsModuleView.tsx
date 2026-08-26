import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Flame,
  Zap,
  Trophy,
  Award,
  Crown,
  PlusCircle,
  Sparkles,
  Calendar,
  Layers,
  Edit3,
  Trash2,
  Brain,
  Droplets,
  Receipt,
  BookOpen,
  Ban,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { Habit, HabitBadge, HabitCompletionRecord, HabitCategoryType } from '../../types';
import { AddEditHabitModal } from './AddEditHabitModal';

interface HabitsModuleViewProps {
  habits: Habit[];
  completions: HabitCompletionRecord[];
  badges: HabitBadge[];
  onSaveHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onToggleHabitCompletion: (habitId: string, date: string) => void;
}

export const HabitsModuleView: React.FC<HabitsModuleViewProps> = ({
  habits,
  completions,
  badges,
  onSaveHabit,
  onDeleteHabit,
  onToggleHabitCompletion,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Past 14 days dates array for heatmap
  const pastDays = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  // Today's completion set
  const completionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    completions.forEach((c) => {
      map.set(`${c.habitId}_${c.date}`, c.completed);
    });
    return map;
  }, [completions]);

  // Aggregate metrics
  const activeHabitsCount = habits.filter((h) => h.active).length;
  const todayCompletedCount = habits.filter((h) =>
    completionMap.get(`${h.id}_${todayStr}`)
  ).length;
  const todayProgressPercent =
    activeHabitsCount > 0 ? (todayCompletedCount / activeHabitsCount) * 100 : 0;
  const maxHabitStreak = Math.max(0, ...habits.map((h) => h.currentStreak));
  const unlockedHabitBadges = badges.filter((b) => b.isUnlocked).length;

  const filteredHabits = habits.filter((h) => {
    if (selectedCategory === 'all') return true;
    return h.category === selectedCategory;
  });

  const getCategoryIcon = (category: HabitCategoryType) => {
    switch (category) {
      case 'mind':
        return <Sparkles className="w-4 h-4" />;
      case 'body':
        return <Droplets className="w-4 h-4" />;
      case 'productivity':
        return <Brain className="w-4 h-4" />;
      case 'wealth':
        return <Receipt className="w-4 h-4" />;
      case 'growth':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <CheckSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 bg-indigo-600 transform rotate-45" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Pillar 3 • Habit Automation & Consistency Loops
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-light text-slate-800 font-heading">
            Daily Habits & Routine Engine
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Build unbreakable identity routines with Cue-Routine-Reward loops, 30-day consistency heatmaps, and milestone streak locks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setEditingHabit(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Build Habit Routine</span>
          </button>
        </div>
      </div>

      {/* Hero 4 KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Today's Completion Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Today's Execution
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-light text-slate-900 font-heading text-indigo-600">
              {todayCompletedCount} / {activeHabitsCount}
            </h3>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all"
                  style={{ width: `${todayProgressPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-slate-700">
                {todayProgressPercent.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Top Active Streak */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Top Active Streak
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-light text-slate-900 font-heading text-amber-600 flex items-center gap-1">
              <span>{maxHabitStreak}</span>
              <span className="text-sm font-bold text-slate-600">Days 🔥</span>
            </h3>
            <p className="mt-1 text-[11px] text-slate-500">Unbroken daily discipline</p>
          </div>
        </div>

        {/* 3. Consistency Badges Unlocked */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Habit Badges
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-light text-slate-900 font-heading text-emerald-700">
              {unlockedHabitBadges} / {badges.length}
            </h3>
            <p className="mt-1 text-[11px] text-slate-500">
              21-Day Lock & 30-Day Master unlocked!
            </p>
          </div>
        </div>

        {/* 4. Total Lifetime Reps */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Cumulative Executions
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-light text-slate-900 font-heading text-rose-600">
              {habits.reduce((acc, h) => acc + h.totalCompletions, 0)}{' '}
              <span className="text-sm font-semibold text-slate-500">Reps</span>
            </h3>
            <p className="mt-1 text-[11px] text-slate-500">Total micro-actions logged</p>
          </div>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Routines ({habits.length})
        </button>
        <button
          onClick={() => setSelectedCategory('mind')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            selectedCategory === 'mind'
              ? 'bg-purple-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Mind & Focus
        </button>
        <button
          onClick={() => setSelectedCategory('body')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            selectedCategory === 'body'
              ? 'bg-sky-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Body & Vitality
        </button>
        <button
          onClick={() => setSelectedCategory('productivity')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            selectedCategory === 'productivity'
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Deep Work
        </button>
        <button
          onClick={() => setSelectedCategory('wealth')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            selectedCategory === 'wealth'
              ? 'bg-emerald-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Financial Discipline
        </button>
      </div>

      {/* Habits List with Daily Quick Check-off and 14-Day Consistency Heatmaps */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Daily Habit Loop Checklist & Consistency Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Click today's checkbox to complete • View 14-day consistency heatmap
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {todayCompletedCount} of {habits.length} Done Today
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredHabits.map((habit) => {
            const isCompletedToday = Boolean(completionMap.get(`${habit.id}_${todayStr}`));

            return (
              <div
                key={habit.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors p-2 rounded-2xl"
              >
                {/* Left: Checkbox + Title + Stacking details */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleHabitCompletion(habit.id, todayStr)}
                    className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      isCompletedToday
                        ? 'bg-emerald-600 text-white shadow-xs scale-105'
                        : 'border-2 border-slate-300 hover:border-slate-500 bg-white text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-bold truncate ${
                          isCompletedToday ? 'text-slate-500 line-through' : 'text-slate-900'
                        }`}
                      >
                        {habit.title}
                      </h4>
                      <span
                        className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded"
                        style={{ backgroundColor: `${habit.color}15`, color: habit.color }}
                      >
                        {habit.category}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-400">
                        {habit.timeOfDay}
                      </span>
                    </div>

                    {habit.cue && (
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        <strong className="text-slate-700">Cue:</strong> {habit.cue} ➔{' '}
                        <strong className="text-slate-700">Routine:</strong> {habit.routine}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: 14-Day Heatmap Strip + Streaks */}
                <div className="flex items-center gap-4 shrink-0 pl-10 md:pl-0">
                  {/* 14-Day Heatmap Blocks */}
                  <div className="flex items-center gap-1">
                    {pastDays.map((d) => {
                      const isDone = Boolean(completionMap.get(`${habit.id}_${d}`));
                      const isToday = d === todayStr;

                      return (
                        <button
                          key={d}
                          onClick={() => onToggleHabitCompletion(habit.id, d)}
                          className={`w-4.5 h-4.5 rounded-md transition-all cursor-pointer ${
                            isDone
                              ? 'bg-emerald-500 hover:bg-emerald-600 shadow-2xs'
                              : 'bg-slate-100 hover:bg-slate-200'
                          } ${isToday ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
                          title={`${d}: ${isDone ? 'Completed ✅' : 'Missed ❌'}`}
                        />
                      );
                    })}
                  </div>

                  {/* Streak pill */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 font-bold text-xs">
                    <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    <span>{habit.currentStreak}d</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingHabit(habit);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete habit "${habit.title}"?`)) {
                          onDeleteHabit(habit.id);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AddEditHabitModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingHabit(null);
        }}
        onSaveHabit={onSaveHabit}
        editingHabit={editingHabit}
      />
    </div>
  );
};
