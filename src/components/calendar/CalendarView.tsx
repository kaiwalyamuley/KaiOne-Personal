import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Dumbbell,
  CheckSquare,
  Plane,
  Clock,
  Flame,
  LayoutGrid,
  List,
  Layers,
  Crown,
  Info,
  DollarSign,
  Heart,
  Tag,
  Star,
  CheckCircle2,
} from 'lucide-react';
import {
  Transaction,
  Habit,
  HabitCompletionRecord,
  WorkoutSession,
  VitalsLog,
  DateToRemember,
  VacationPlan,
  UserProfile,
  MonthlyFestivalArt,
} from '../../types';
import { MONTHLY_FESTIVAL_ARTS } from '../../utils/calendarAndPlannerData';
import { formatINR } from '../../utils/formatters';
import { FestivalHeroArt } from './FestivalHeroArt';
import { CalendarDayModal } from './CalendarDayModal';

interface CalendarViewProps {
  userProfile: UserProfile;
  transactions: Transaction[];
  habits: Habit[];
  habitCompletions: HabitCompletionRecord[];
  workouts: WorkoutSession[];
  vitalsLogs: VitalsLog[];
  datesToRemember: DateToRemember[];
  vacations: VacationPlan[];
  onOpenLogTransaction?: (type?: any) => void;
  onOpenAddEventModal?: (defaultDate?: string) => void;
  onOpenPlanVacation?: () => void;
  onOpenAddHabit?: () => void;
  onOpenAddVacation?: () => void;
  onOpenAddDate?: (defaultDate?: string) => void;
  onOpenProfileModal?: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  userProfile,
  transactions,
  habits,
  habitCompletions,
  workouts,
  vitalsLogs,
  datesToRemember,
  vacations,
  onOpenLogTransaction,
  onOpenAddEventModal,
  onOpenPlanVacation,
  onOpenAddHabit,
  onOpenAddVacation,
  onOpenAddDate,
  onOpenProfileModal,
}) => {
  // Current active calendar view state (Default to current simulated date: Aug/Sep 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(8); // September is 8 (0-indexed)
  const [viewMode, setViewMode] = useState<'grid' | 'agenda' | 'festivals_overview'>('grid');

  // Layer Visibility Toggles
  const [showFestivals, setShowFestivals] = useState<boolean>(true);
  const [showVacations, setShowVacations] = useState<boolean>(true);
  const [showFinances, setShowFinances] = useState<boolean>(true);
  const [showHabits, setShowHabits] = useState<boolean>(true);
  const [showHealth, setShowHealth] = useState<boolean>(true);

  // Day detail modal inspection state
  const [selectedDayDetailDate, setSelectedDayDetailDate] = useState<string | null>(null);

  // Active Monthly Festival Art
  const activeFestivalArt: MonthlyFestivalArt = useMemo(() => {
    return (
      MONTHLY_FESTIVAL_ARTS[currentMonthIndex] ||
      MONTHLY_FESTIVAL_ARTS[0]
    );
  }, [currentMonthIndex]);

  // Navigate Months
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const handleJumpToCurrentMonth = () => {
    // Current simulated date is Aug/Sep 2026
    setCurrentYear(2026);
    setCurrentMonthIndex(8); // September
  };

  // Month Key: 'YYYY-MM'
  const currentMonthKey = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;

  // Compute Calendar Matrix Days for the Month
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonthIndex + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)

    const prevMonthLastDay = new Date(currentYear, currentMonthIndex, 0).getDate();

    interface DayCellData {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      transactions: Transaction[];
      totalIncome: number;
      totalExpense: number;
      habitCompletionsCount: number;
      workouts: WorkoutSession[];
      vitals?: VitalsLog;
      datesToRemember: DateToRemember[];
      vacations: VacationPlan[];
      festivals: typeof activeFestivalArt.festivals;
    }

    const days: DayCellData[] = [];

    // 1. Previous Month Spillover Days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevMonth = currentMonthIndex === 0 ? 12 : currentMonthIndex;
      const prevYear = currentMonthIndex === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: false,
        transactions: [],
        totalIncome: 0,
        totalExpense: 0,
        habitCompletionsCount: 0,
        workouts: [],
        datesToRemember: [],
        vacations: [],
        festivals: [],
      });
    }

    // 2. Current Month Days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const isToday = dateStr === '2026-09-01' || dateStr === '2026-08-25'; // Highlighted

      // Transactions on this day
      const dayTxs = transactions.filter((t) => t.dateTime && t.dateTime.startsWith(dateStr));
      const totalIncome = dayTxs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const totalExpense = dayTxs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      // Habit completions
      const habitCompletionsCount = habitCompletions.filter(
        (c) => c.date === dateStr && c.completed
      ).length;

      // Workouts & Vitals
      const dayWorkouts = workouts.filter((w) => w.date === dateStr);
      const dayVitals = vitalsLogs.find((v) => v.date === dateStr);

      // Dates to remember (Check match by full date or MM-DD for recurring)
      const mmDd = `${String(currentMonthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayDtrs = datesToRemember.filter((d) => {
        if (d.date === dateStr) return true;
        if (d.isAnnualRecurring && d.date.endsWith(mmDd)) return true;
        return false;
      });

      // Vacations active on this day
      const dayVacations = vacations.filter((v) => {
        return dateStr >= v.startDate && dateStr <= v.endDate;
      });

      // Festival Highlights matching this day
      const monthPrefixStr = activeFestivalArt.monthName.substring(0, 3);
      const dayFests = activeFestivalArt.festivals.filter((f) => {
        // e.g. "Sep 1" or "Sep 14"
        const matchSingle = f.dateStr === `${monthPrefixStr} ${dayNum}`;
        const matchSpecial = f.dateStr.includes(`${monthPrefixStr} ${dayNum}`);
        return matchSingle || matchSpecial;
      });

      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday,
        transactions: dayTxs,
        totalIncome,
        totalExpense,
        habitCompletionsCount,
        workouts: dayWorkouts,
        vitals: dayVitals,
        datesToRemember: dayDtrs,
        vacations: dayVacations,
        festivals: dayFests,
      });
    }

    // 3. Next Month Spillover Days (to complete 35 or 42 grid slots)
    const remainingSlots = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingSlots; i++) {
      const nextMonth = currentMonthIndex === 11 ? 1 : currentMonthIndex + 2;
      const nextYear = currentMonthIndex === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

      days.push({
        dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
        transactions: [],
        totalIncome: 0,
        totalExpense: 0,
        habitCompletionsCount: 0,
        workouts: [],
        datesToRemember: [],
        vacations: [],
        festivals: [],
      });
    }

    return days;
  }, [
    currentYear,
    currentMonthIndex,
    transactions,
    habitCompletions,
    workouts,
    vitalsLogs,
    datesToRemember,
    vacations,
    activeFestivalArt,
  ]);

  // Aggregate stats for current month
  const monthlyStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let txCount = 0;
    let activeVacationsCount = 0;

    transactions.forEach((tx) => {
      if (tx.dateTime && tx.dateTime.startsWith(currentMonthKey)) {
        txCount++;
        if (tx.type === 'income') income += Number(tx.amount || 0);
        if (tx.type === 'expense') expense += Number(tx.amount || 0);
      }
    });

    vacations.forEach((v) => {
      if (v.startDate.startsWith(currentMonthKey) || v.endDate.startsWith(currentMonthKey)) {
        activeVacationsCount++;
      }
    });

    const monthFestivalsCount = activeFestivalArt.festivals.length;
    const monthRemindersCount = datesToRemember.filter((d) => {
      const mm = String(currentMonthIndex + 1).padStart(2, '0');
      return d.date.includes(`-${mm}-`) || d.date.startsWith(`${currentYear}-${mm}`);
    }).length;

    return {
      income,
      expense,
      netSavings: income - expense,
      txCount,
      activeVacationsCount,
      monthFestivalsCount,
      monthRemindersCount,
    };
  }, [
    transactions,
    vacations,
    currentMonthKey,
    currentMonthIndex,
    currentYear,
    activeFestivalArt,
    datesToRemember,
  ]);

  // Selected Day data for modal
  const selectedDayCell = useMemo(() => {
    if (!selectedDayDetailDate) return null;
    return calendarDays.find((d) => d.dateStr === selectedDayDetailDate) || null;
  }, [selectedDayDetailDate, calendarDays]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Dynamic Festival Art Hero Banner */}
      <FestivalHeroArt
        festivalArt={activeFestivalArt}
        selectedYear={currentYear}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onJumpToCurrentMonth={handleJumpToCurrentMonth}
        onOpenAddEventModal={() => onOpenAddEventModal()}
      />

      {/* 2. Month Overview Metrics & Layer Toggles Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Monthly Metrics Quick Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center gap-1.5 font-semibold text-slate-800">
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              {activeFestivalArt.monthName} {currentYear} Summary:
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-emerald-800 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Income: {formatINR(monthlyStats.income)}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 font-bold text-rose-800 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            <span>Spent: {formatINR(monthlyStats.expense)}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 font-bold text-amber-900 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {monthlyStats.monthFestivalsCount} Festivals & {monthlyStats.monthRemindersCount} Reminders
            </span>
          </div>

          {monthlyStats.activeVacationsCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 font-bold text-cyan-900 flex items-center gap-1">
              <Plane className="w-3.5 h-3.5 text-cyan-600" />
              <span>{monthlyStats.activeVacationsCount} Vacation Trips</span>
            </div>
          )}
        </div>

        {/* Right: View Switcher (Grid vs Agenda vs 12-Month Matrix) */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Month Grid</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Agenda Timeline</span>
            </button>
            <button
              onClick={() => setViewMode('festivals_overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'festivals_overview'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>12M Festival Art</span>
            </button>
          </div>
        </div>
      </div>

      {/* Layer Filter Bar */}
      {viewMode !== 'festivals_overview' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Layers:
            </span>

            <button
              onClick={() => setShowFestivals((v) => !v)}
              className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                showFestivals
                  ? 'bg-amber-50 border-amber-200 text-amber-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Festivals & Milestones</span>
            </button>

            <button
              onClick={() => setShowVacations((v) => !v)}
              className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                showVacations
                  ? 'bg-cyan-50 border-cyan-200 text-cyan-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <Plane className="w-3 h-3 text-cyan-600" />
              <span>Vacations & Travel</span>
            </button>

            <button
              onClick={() => setShowFinances((v) => !v)}
              className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                showFinances
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <DollarSign className="w-3 h-3 text-emerald-600" />
              <span>Finance Dues & Cashflow</span>
            </button>

            <button
              onClick={() => setShowHabits((v) => !v)}
              className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                showHabits
                  ? 'bg-purple-50 border-purple-200 text-purple-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <CheckSquare className="w-3 h-3 text-purple-600" />
              <span>Habit Routines</span>
            </button>

            <button
              onClick={() => setShowHealth((v) => !v)}
              className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                showHealth
                  ? 'bg-rose-50 border-rose-200 text-rose-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <Dumbbell className="w-3 h-3 text-rose-500" />
              <span>Health & Workouts</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPlanVacation}
              className="px-3 py-1.5 rounded-xl border border-cyan-200 bg-cyan-50/80 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <Plane className="w-3 h-3" />
              <span>Plan Vacation</span>
            </button>
            <button
              onClick={() => onOpenLogTransaction()}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Log Expense</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT: Grid View OR Agenda View OR 12M Festival Matrix */}

      {/* MODE A: Month Grid View */}
      {viewMode === 'grid' && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {/* Weekday Columns Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600 py-3">
            {WEEKDAYS.map((w, idx) => (
              <div
                key={w}
                className={`uppercase tracking-wider ${
                  idx === 0 || idx === 6 ? 'text-indigo-600 font-extrabold' : ''
                }`}
              >
                {w}
              </div>
            ))}
          </div>

          {/* Calendar Day Grid (7 columns) */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-100">
            {calendarDays.map((day, idx) => {
              const hasActivity =
                day.festivals.length > 0 ||
                day.datesToRemember.length > 0 ||
                day.vacations.length > 0 ||
                day.transactions.length > 0 ||
                day.habitCompletionsCount > 0 ||
                day.workouts.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDayDetailDate(day.dateStr)}
                  className={`min-h-[75px] sm:min-h-[110px] md:min-h-[135px] p-1 sm:p-2.5 transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98] ${
                    day.isCurrentMonth
                      ? 'bg-white hover:bg-slate-50/90'
                      : 'bg-slate-50/60 text-slate-300 hover:bg-slate-100/60'
                  } ${
                    day.isToday
                      ? 'ring-2 ring-indigo-600/40 bg-indigo-50/20 shadow-xs'
                      : ''
                  }`}
                >
                  {/* Day Header: Date Number + Badges */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-bold font-mono inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        day.isToday
                          ? 'bg-indigo-600 text-white font-extrabold shadow-xs'
                          : day.isCurrentMonth
                          ? 'text-slate-800 group-hover:text-indigo-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {/* Quick indicator badges */}
                    <div className="flex items-center gap-1">
                      {day.dateStr === '2026-09-01' && (
                        <span className="text-[10px] p-0.5 rounded bg-amber-400 text-slate-950 font-bold" title="Kaiwalya's Birthday!">
                          👑
                        </span>
                      )}
                      {day.festivals.length > 0 && showFestivals && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title={day.festivals[0]?.name} />
                      )}
                      {day.vacations.length > 0 && showVacations && (
                        <span className="w-2 h-2 rounded-full bg-cyan-500" title="Vacation active" />
                      )}
                    </div>
                  </div>

                  {/* Day Body Content Pills */}
                  <div className="space-y-1 my-1 flex-1 overflow-hidden">
                    {/* 1. Festivals & VIP Observances */}
                    {showFestivals &&
                      day.festivals.slice(0, 1).map((fest, fIdx) => (
                        <div
                          key={`fest-${fIdx}`}
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold truncate flex items-center gap-1 ${
                            fest.isPersonalMilestone
                              ? 'bg-amber-400 text-slate-950 shadow-2xs'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                          title={`${fest.name} - ${fest.culturalNote}`}
                        >
                          <span className="shrink-0">{fest.icon}</span>
                          <span className="truncate">{fest.name}</span>
                        </div>
                      ))}

                    {/* 2. Dates to Remember (e.g. Birthday, Insurance Dues) */}
                    {showFestivals &&
                      day.datesToRemember.slice(0, 1).map((dtr) => (
                        <div
                          key={dtr.id}
                          className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-900 truncate flex items-center gap-1"
                          title={dtr.title}
                        >
                          <span className="shrink-0">{dtr.icon || '📌'}</span>
                          <span className="truncate">{dtr.title}</span>
                        </div>
                      ))}

                    {/* 3. Vacation Span Bars */}
                    {showVacations &&
                      day.vacations.slice(0, 1).map((vac) => (
                        <div
                          key={vac.id}
                          className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-cyan-100 text-cyan-950 truncate flex items-center gap-1"
                          title={`${vac.title} (${vac.destination})`}
                        >
                          <span className="shrink-0">{vac.coverEmoji}</span>
                          <span className="truncate">{vac.title}</span>
                        </div>
                      ))}

                    {/* 4. Financial Transactions Badge */}
                    {showFinances && day.transactions.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 text-[9px] font-mono font-bold">
                        {day.totalExpense > 0 && (
                          <span className="px-1 rounded bg-rose-50 text-rose-700">
                            -{formatINR(day.totalExpense)}
                          </span>
                        )}
                        {day.totalIncome > 0 && (
                          <span className="px-1 rounded bg-emerald-50 text-emerald-700">
                            +{formatINR(day.totalIncome)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 5. Health & Habit badges */}
                    <div className="flex items-center gap-1 text-[9px]">
                      {showHabits && day.habitCompletionsCount > 0 && (
                        <span className="px-1 py-0.2 rounded bg-purple-50 text-purple-700 font-semibold">
                          ⚡ {day.habitCompletionsCount} habits
                        </span>
                      )}
                      {showHealth && day.workouts.length > 0 && (
                        <span className="px-1 py-0.2 rounded bg-rose-50 text-rose-700 font-semibold">
                          💪 {day.workouts[0].type.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer hint */}
                  <div className="text-[9px] text-slate-400 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    Inspect ➔
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE B: Agenda Timeline View */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 font-heading mb-4 flex items-center gap-2">
              <List className="w-4 h-4 text-indigo-600" />
              Chronological Life Agenda — {activeFestivalArt.monthName} {currentYear}
            </h3>

            <div className="space-y-3">
              {calendarDays
                .filter((d) => d.isCurrentMonth)
                .filter(
                  (d) =>
                    d.festivals.length > 0 ||
                    d.datesToRemember.length > 0 ||
                    d.vacations.length > 0 ||
                    d.transactions.length > 0 ||
                    d.workouts.length > 0
                )
                .map((day) => {
                  const dateObj = new Date(`${day.dateStr}T00:00:00`);
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

                  return (
                    <div
                      key={day.dateStr}
                      onClick={() => setSelectedDayDetailDate(day.dateStr)}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                    >
                      {/* Left: Date Badge */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-indigo-50 border border-slate-200 group-hover:border-indigo-200 flex flex-col items-center justify-center shrink-0 transition-colors">
                          <span className="text-[10px] font-bold uppercase text-slate-400 group-hover:text-indigo-600">
                            {dayName}
                          </span>
                          <span className="text-base font-extrabold font-mono text-slate-900 group-hover:text-indigo-900">
                            {day.dayNumber}
                          </span>
                        </div>

                        {/* Events list */}
                        <div className="space-y-1">
                          {day.festivals.map((f, fIdx) => (
                            <div
                              key={`af-${fIdx}`}
                              className="flex items-center gap-2 text-xs font-bold text-amber-950"
                            >
                              <span>{f.icon}</span>
                              <span>{f.name}</span>
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-100 font-bold">
                                Festival
                              </span>
                            </div>
                          ))}

                          {day.datesToRemember.map((dtr) => (
                            <div
                              key={dtr.id}
                              className="flex items-center gap-2 text-xs font-bold text-indigo-950"
                            >
                              <span>{dtr.icon || '📌'}</span>
                              <span>{dtr.title}</span>
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-100 font-bold uppercase">
                                {dtr.category}
                              </span>
                            </div>
                          ))}

                          {day.vacations.map((vac) => (
                            <div
                              key={vac.id}
                              className="flex items-center gap-2 text-xs font-bold text-cyan-950"
                            >
                              <span>{vac.coverEmoji}</span>
                              <span>{vac.title}</span>
                              <span className="text-[10px] text-cyan-700">
                                ({vac.destination})
                              </span>
                            </div>
                          ))}

                          {day.transactions.length > 0 && (
                            <div className="text-[11px] text-slate-500">
                              {day.transactions.length} transaction(s) •{' '}
                              {day.totalExpense > 0 && `Spent: ${formatINR(day.totalExpense)}`}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Inspect Action */}
                      <button className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1 self-end sm:self-center">
                        <span>View Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* MODE C: 12-Month Festival Art Matrix */}
      {viewMode === 'festivals_overview' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  12-Month Annual Festival Art Showcase & Observances
                </h3>
                <p className="text-xs text-slate-500">
                  Full calendar year cultural festivals, auspicious dates, national holidays & personal milestones
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MONTHLY_FESTIVAL_ARTS.map((art) => {
                const isSelected = art.monthIndex === currentMonthIndex;
                const isSep = art.monthIndex === 8;

                return (
                  <div
                    key={art.monthIndex}
                    onClick={() => {
                      setCurrentMonthIndex(art.monthIndex);
                      setViewMode('grid');
                    }}
                    className={`rounded-2xl border p-4 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/30'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Month Banner Header */}
                    <div className={`p-3 -m-4 mb-3 bg-gradient-to-r ${art.gradientBg} text-white`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider">
                          M{String(art.monthIndex + 1).padStart(2, '0')} • {art.monthName}
                        </span>
                        {isSep && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            <span>VIP B'day</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold mt-1 line-clamp-1">
                        {art.heroTitle}
                      </h4>
                    </div>

                    {/* Content Quote & Festivals list */}
                    <div className="space-y-2 flex-1">
                      <p className="text-[11px] text-slate-500 italic font-serif line-clamp-2">
                        {art.culturalQuote}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        {art.festivals.map((fest, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-1 text-[11px]"
                          >
                            <span className="font-semibold text-slate-800 truncate flex items-center gap-1.5">
                              <span>{fest.icon}</span>
                              <span className="truncate">{fest.name}</span>
                            </span>
                            <span className="font-mono text-[10px] text-slate-500 font-bold shrink-0">
                              {fest.dateStr}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                      <span>Open {art.monthName} Calendar</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. Day Detail Inspection Modal */}
      {selectedDayCell && (
        <CalendarDayModal
          isOpen={!!selectedDayCell}
          onClose={() => setSelectedDayDetailDate(null)}
          dateStr={selectedDayCell.dateStr}
          festivals={selectedDayCell.festivals}
          datesToRemember={selectedDayCell.datesToRemember}
          vacations={selectedDayCell.vacations}
          transactions={selectedDayCell.transactions}
          habits={habits}
          habitCompletions={habitCompletions}
          workouts={selectedDayCell.workouts}
          vitals={selectedDayCell.vitals}
          onOpenLogTx={(date) => {
            setSelectedDayDetailDate(null);
            onOpenLogTransaction(date);
          }}
          onOpenAddEvent={(date) => {
            setSelectedDayDetailDate(null);
            onOpenAddEventModal(date);
          }}
        />
      )}
    </div>
  );
};
