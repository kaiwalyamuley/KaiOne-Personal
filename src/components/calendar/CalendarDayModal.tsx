import React from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Dumbbell,
  CheckSquare,
  Plane,
  AlertCircle,
  Plus,
  ArrowRight,
  Clock,
  Heart,
  Droplets,
  DollarSign,
  Tag,
  Gift,
} from 'lucide-react';
import {
  Transaction,
  Habit,
  HabitCompletionRecord,
  WorkoutSession,
  VitalsLog,
  DateToRemember,
  VacationPlan,
  FestivalHighlight,
} from '../../types';
import { formatINR } from '../../utils/formatters';

interface CalendarDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string; // YYYY-MM-DD
  festivals: FestivalHighlight[];
  datesToRemember: DateToRemember[];
  vacations: VacationPlan[];
  transactions: Transaction[];
  habits: Habit[];
  habitCompletions: HabitCompletionRecord[];
  workouts: WorkoutSession[];
  vitals: VitalsLog | undefined;
  onOpenLogTx: (date: string) => void;
  onOpenAddEvent: (date: string) => void;
}

export const CalendarDayModal: React.FC<CalendarDayModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  festivals,
  datesToRemember,
  vacations,
  transactions,
  habits,
  habitCompletions,
  workouts,
  vitals,
  onOpenLogTx,
  onOpenAddEvent,
}) => {
  if (!isOpen || !dateStr) return null;

  const dateObj = new Date(`${dateStr}T00:00:00`);
  const formattedHeader = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const completedHabitsCount = habitCompletions.filter(
    (c) => c.date === dateStr && c.completed
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-indigo-200 font-bold uppercase tracking-wider block">
                Daily 360° Life Ledger
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold font-heading text-white">
                {formattedHeader}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Income</span>
              <span className="text-sm font-bold font-mono text-emerald-700">
                {formatINR(totalIncome)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100">
              <span className="text-[10px] font-bold text-rose-800 uppercase block">Expense</span>
              <span className="text-sm font-bold font-mono text-rose-700">
                {formatINR(totalExpense)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
              <span className="text-[10px] font-bold text-purple-800 uppercase block">Habits Done</span>
              <span className="text-sm font-bold text-purple-700">
                {completedHabitsCount} / {habits.length}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Workouts</span>
              <span className="text-sm font-bold text-blue-700">
                {workouts.length > 0 ? `${workouts.reduce((acc, w) => acc + w.durationMinutes, 0)} mins` : 'Rest Day'}
              </span>
            </div>
          </div>

          {/* 1. Festivals & VIP Observances */}
          {(festivals.length > 0 || datesToRemember.length > 0) && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Festivals, Milestones & Reminders
              </h3>
              <div className="space-y-2">
                {festivals.map((fest, idx) => (
                  <div
                    key={`fest-${idx}`}
                    className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 flex items-start gap-3"
                  >
                    <span className="text-xl shrink-0 mt-0.5">{fest.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{fest.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-200/80 font-bold">
                          Festival
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-900/90 mt-0.5 leading-relaxed">
                        {fest.culturalNote}
                      </p>
                    </div>
                  </div>
                ))}

                {datesToRemember.map((dtr) => (
                  <div
                    key={dtr.id}
                    className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 flex items-start gap-3"
                  >
                    <span className="text-xl shrink-0 mt-0.5">{dtr.icon || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{dtr.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-200/80 font-bold uppercase">
                          {dtr.category}
                        </span>
                      </div>
                      {dtr.description && (
                        <p className="text-[11px] text-indigo-900/80 mt-0.5">
                          {dtr.description}
                        </p>
                      )}
                      {dtr.estimatedCost ? (
                        <span className="text-[10px] font-semibold text-indigo-700 block mt-1">
                          Est. Budget: {formatINR(dtr.estimatedCost)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Vacation Span & Itinerary */}
          {vacations.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-cyan-600" />
                Vacations & Travel Schedule
              </h3>
              <div className="space-y-2">
                {vacations.map((vac) => {
                  const todayItin = vac.itinerary.find((it) => it.date === dateStr);
                  return (
                    <div
                      key={vac.id}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 text-slate-900"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{vac.coverEmoji}</span>
                          <div>
                            <span className="text-xs font-bold text-cyan-950 block">
                              {vac.title}
                            </span>
                            <span className="text-[10px] text-cyan-700 font-medium">
                              {vac.destination}, {vac.country}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-100 font-bold text-cyan-800 uppercase">
                          {vac.status}
                        </span>
                      </div>

                      {todayItin && (
                        <div className="mt-2.5 pt-2.5 border-t border-cyan-200/60">
                          <span className="text-[11px] font-bold text-cyan-900 block">
                            Day {todayItin.dayNumber}: {todayItin.title}
                          </span>
                          <ul className="mt-1 space-y-0.5 text-[11px] text-cyan-800 list-disc list-inside">
                            {todayItin.activities.map((act, idx) => (
                              <li key={idx}>{act}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Financial Transactions */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Transactions Logged ({transactions.length})
              </h3>
              <button
                onClick={() => onOpenLogTx(dateStr)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Tx
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                No financial transactions recorded on this date.
              </div>
            ) : (
              <div className="space-y-1.5">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {tx.location || tx.category}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {tx.category} {tx.description ? `• ${tx.description}` : ''}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold shrink-0 ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatINR(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Habits & Atomic Routines */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
              Habit Tracker Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {habits.map((h) => {
                const isCompleted = habitCompletions.some(
                  (c) => c.habitId === h.id && c.date === dateStr && c.completed
                );
                return (
                  <div
                    key={h.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isCompleted
                        ? 'bg-purple-50/70 border-purple-200 text-purple-950 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{h.icon || '⚡'}</span>
                      <span className="truncate">{h.title}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isCompleted ? 'bg-purple-200 text-purple-900' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? 'Done' : 'Missed'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Health, Workouts & Vitals */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-rose-500" />
              Health & Biometrics
            </h3>

            {workouts.length > 0 || vitals ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {workouts.map((w) => (
                  <div
                    key={w.id}
                    className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-slate-900 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-rose-950 block">
                        {w.type}
                      </span>
                      <span className="text-[10px] text-rose-700">
                        {w.durationMinutes} mins • {w.intensity} intensity
                      </span>
                    </div>
                    {w.caloriesBurned ? (
                      <span className="text-xs font-mono font-bold text-rose-700">
                        {w.caloriesBurned} kcal
                      </span>
                    ) : null}
                  </div>
                ))}

                {vitals && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Daily Vitals
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      {vitals.weightKg && <span>⚖️ {vitals.weightKg} kg</span>}
                      {vitals.sleepHours && <span>🌙 {vitals.sleepHours} hrs sleep</span>}
                      {vitals.waterMl && <span>💧 {vitals.waterMl} ml water</span>}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
                No workouts or vitals logged for this date.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={() => onOpenAddEvent(dateStr)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Add Event / Reminder</span>
          </button>

          <button
            onClick={() => onOpenLogTx(dateStr)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Transaction</span>
          </button>
        </div>
      </div>
    </div>
  );
};
