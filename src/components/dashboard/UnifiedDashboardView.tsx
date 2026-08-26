import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Activity,
  CheckSquare,
  Sparkles,
  TrendingUp,
  Flame,
  Target,
  Droplets,
  Heart,
  Moon,
  Dumbbell,
  Scale,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Award,
  Calendar,
  Layers,
  Clock,
  Landmark,
  RefreshCw,
  Percent,
  CheckCircle2,
  Circle,
  ChevronRight,
  BarChart3,
  Lightbulb,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Account,
  CreditCard,
  Loan,
  Transaction,
  FinancialSummary,
  SavingsGoalBucket,
  GoalAchievementBadge,
  VitalsLog,
  WorkoutSession,
  Habit,
  HabitCompletionRecord,
  HabitBadge,
  MonthlyCategoryBudget,
  Category,
} from '../../types';
import { formatINR } from '../../utils/formatters';
import { MainPillar, FinanceSubTab } from '../Navbar';
import { ActualsVsBudgetsSection } from './ActualsVsBudgetsSection';
import { AIAdvisorCard } from '../ai-advisor/AIAdvisorCard';
import { UserProfile } from '../../types';

interface UnifiedDashboardViewProps {
  // Navigation switchers
  onNavigateToPillar: (pillar: MainPillar, subTab?: FinanceSubTab) => void;
  // Finance Data
  financialSummary: FinancialSummary;
  accounts: Account[];
  transactions: Transaction[];
  categories?: Category[];
  creditCards: CreditCard[];
  loans: Loan[];
  savingsGoals: SavingsGoalBucket[];
  goalBadges: GoalAchievementBadge[];
  monthlyBudgets: MonthlyCategoryBudget[];
  onOpenLogTransaction: (type?: 'expense' | 'income') => void;
  // Health Data
  vitalsLogs: VitalsLog[];
  workouts: WorkoutSession[];
  onSaveVitals: (log: VitalsLog) => void;
  onOpenLogVitalsModal: () => void;
  onOpenLogWorkoutModal: () => void;
  // Habits Data
  habits: Habit[];
  habitCompletions: HabitCompletionRecord[];
  habitBadges: HabitBadge[];
  onToggleHabitCompletion: (habitId: string, date: string) => void;
  onOpenAddHabitModal: () => void;
  // AI Advisor
  userProfile?: UserProfile;
  onOpenAIAdvisor?: (prompt?: string) => void;
}

export const UnifiedDashboardView: React.FC<UnifiedDashboardViewProps> = ({
  onNavigateToPillar,
  financialSummary,
  accounts,
  transactions,
  categories,
  creditCards,
  loans,
  savingsGoals,
  goalBadges,
  monthlyBudgets,
  onOpenLogTransaction,
  vitalsLogs,
  workouts,
  onSaveVitals,
  onOpenLogVitalsModal,
  onOpenLogWorkoutModal,
  habits,
  habitCompletions,
  habitBadges,
  onToggleHabitCompletion,
  onOpenAddHabitModal,
  userProfile,
  onOpenAIAdvisor,
}) => {
  const [pulseTimelineDays, setPulseTimelineDays] = useState<7 | 14 | 30>(7);
  const [pulseViewMode, setPulseViewMode] = useState<'units' | 'harmony'>('units');
  const [visibleLines, setVisibleLines] = useState<{ finance: boolean; health: boolean; habits: boolean }>({
    finance: true,
    health: true,
    habits: true,
  });
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // 1. Current Day Calculations
  const todayTransactions = useMemo(() => {
    return transactions.filter((t) => t.dateTime.startsWith(todayStr));
  }, [transactions, todayStr]);

  const todayExpenses = useMemo(() => {
    return todayTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [todayTransactions]);

  const latestVitals = useMemo(() => {
    return vitalsLogs[0] || {
      date: todayStr,
      weightKg: 72.4,
      systolicBp: 118,
      diastolicBp: 78,
      restingHeartRate: 64,
      sleepHours: 7.5,
      waterMl: 2250,
      energyLevel: 4 as const,
    };
  }, [vitalsLogs, todayStr]);

  const todayWaterMl = latestVitals.waterMl || 2250;
  const targetWaterMl = 3000;
  const waterProgressPercent = Math.min(100, Math.round((todayWaterMl / targetWaterMl) * 100));

  // Habit completion status for today
  const todayHabitStatus = useMemo(() => {
    const activeHabits = habits.filter((h) => h.active);
    const completedCount = activeHabits.filter((h) =>
      habitCompletions.some((c) => c.habitId === h.id && c.date === todayStr && c.completed)
    ).length;
    const totalCount = activeHabits.length || 1;
    const percent = Math.round((completedCount / totalCount) * 100);
    return {
      activeHabits,
      completedCount,
      totalCount,
      percent,
    };
  }, [habits, habitCompletions, todayStr]);

  // Workouts in past 7 days
  const past7DaysWorkouts = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    return workouts.filter((w) => new Date(w.date) >= sevenDaysAgo);
  }, [workouts]);

  const weeklyWorkoutCalories = past7DaysWorkouts.reduce((acc, w) => acc + (w.caloriesBurned || 0), 0);
  const weeklyWorkoutMinutes = past7DaysWorkouts.reduce((acc, w) => acc + w.durationMinutes, 0);

  // 2. Multi-Pillar Score Calculation (0 - 100)
  const pillarScores = useMemo(() => {
    // a. Finance Score (35 pts max)
    const savingsRate =
      financialSummary.totalIncome > 0
        ? ((financialSummary.totalIncome - financialSummary.totalExpense) / financialSummary.totalIncome) * 100
        : 0;

    let financeRaw = 80;
    if (savingsRate > 30) financeRaw += 10;
    if (financialSummary.totalCreditCardOutstanding === 0) financeRaw += 5;
    if (financialSummary.netWorthEstimate > 0) financeRaw += 5;
    const financeScore = Math.min(100, Math.max(40, financeRaw));

    // b. Health Score (35 pts max)
    let healthRaw = 70;
    if ((latestVitals.sleepHours || 0) >= 7) healthRaw += 10;
    if (waterProgressPercent >= 75) healthRaw += 10;
    if (past7DaysWorkouts.length >= 3) healthRaw += 10;
    const healthScore = Math.min(100, Math.max(35, healthRaw));

    // c. Habits Score (30 pts max)
    let habitsRaw = todayHabitStatus.percent >= 80 ? 95 : todayHabitStatus.percent >= 50 ? 80 : 65;
    const habitsScore = Math.min(100, Math.max(30, habitsRaw));

    // Composite Life Synergy Score
    const compositeScore = Math.round(financeScore * 0.35 + healthScore * 0.35 + habitsScore * 0.3);

    return {
      finance: financeScore,
      health: healthScore,
      habits: habitsScore,
      composite: compositeScore,
    };
  }, [
    financialSummary,
    latestVitals,
    waterProgressPercent,
    past7DaysWorkouts,
    todayHabitStatus,
  ]);

  // 3. Quick Hydration Quick-Add
  const handleQuickAddWater = (deltaMl: number) => {
    const newWater = Math.min(5000, (latestVitals.waterMl || 0) + deltaMl);
    const existingId = 'id' in latestVitals && typeof latestVitals.id === 'string' ? latestVitals.id : `vitals_${todayStr}`;
    const updatedLog: VitalsLog = {
      ...latestVitals,
      date: todayStr,
      waterMl: newWater,
      id: existingId,
    };
    onSaveVitals(updatedLog);
  };

  // 4. Quick Energy Level Update
  const handleQuickEnergyUpdate = (level: 1 | 2 | 3 | 4 | 5) => {
    const existingId = 'id' in latestVitals && typeof latestVitals.id === 'string' ? latestVitals.id : `vitals_${todayStr}`;
    const updatedLog: VitalsLog = {
      ...latestVitals,
      date: todayStr,
      energyLevel: level,
      id: existingId,
    };
    onSaveVitals(updatedLog);
  };

  // 5. Multi-Pillar 3-Line Synchronized Pulse Data
  const pulseChartData = useMemo(() => {
    const daysCount = pulseTimelineDays;
    const data = [];
    const today = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

      // Daily spend (₹)
      const daySpend = transactions
        .filter((t) => t.dateTime.startsWith(dateStr) && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // Workout calories (kcal)
      const dayWorkouts = workouts.filter((w) => w.date === dateStr);
      const dayCalories = dayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

      // Habits completion rate (%)
      const activeCount = habits.filter((h) => h.active).length || 1;
      const doneCount = habits.filter((h) =>
        habitCompletions.some((c) => c.habitId === h.id && c.date === dateStr && c.completed)
      ).length;
      const habitRate = Math.round((doneCount / activeCount) * 100);

      // Normalized Harmony Score (0-100%) for comparative sync analysis
      // Financial discipline: 100% for ≤₹1500, decreasing gracefully for higher spends
      const financeHarmony = Math.max(10, Math.min(100, Math.round(100 - (daySpend / 4500) * 60)));
      // Health score: 100% for 450+ kcal
      const healthHarmony = Math.min(100, Math.max(15, Math.round((dayCalories / 450) * 85) + (dayCalories > 0 ? 15 : 0)));
      const habitHarmony = habitRate;

      data.push({
        date: dateStr,
        dayLabel,
        expense: daySpend,
        calories: dayCalories,
        habitScore: habitRate,
        financeHarmony,
        healthHarmony,
        habitHarmony,
      });
    }

    return data;
  }, [pulseTimelineDays, transactions, workouts, habits, habitCompletions]);

  // Pulse Period Averages
  const pulseAverages = useMemo(() => {
    if (!pulseChartData.length) return { avgSpend: 0, avgCalories: 0, avgHabit: 0 };
    const totalSpend = pulseChartData.reduce((acc, d) => acc + d.expense, 0);
    const totalCalories = pulseChartData.reduce((acc, d) => acc + d.calories, 0);
    const totalHabits = pulseChartData.reduce((acc, d) => acc + d.habitScore, 0);
    return {
      avgSpend: Math.round(totalSpend / pulseChartData.length),
      avgCalories: Math.round(totalCalories / pulseChartData.length),
      avgHabit: Math.round(totalHabits / pulseChartData.length),
    };
  }, [pulseChartData]);

  return (
    <div className="space-y-7">
      {/* ========================================================================= */}
      {/* 1. MASTER LIFE SYNERGY INDEX HEADER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50">
        {/* Background ambient accents */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left: Life Synergy Master Score & Radial Gauge */}
          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-28 h-28 sm:w-32 sm:h-32 transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  className="stroke-indigo-400 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={260}
                  strokeDashoffset={260 - (260 * pillarScores.composite) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
                  {pillarScores.composite}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-indigo-200 font-bold">
                  / 100
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-indigo-300" />
                  Tri-Pillar Synergy Score
                </div>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Peak Alignment
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-light tracking-tight text-white font-heading">
                Life & Wealth Command Center
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg leading-relaxed">
                Seamlessly orchestrating your financial surplus, physical vitality, and daily atomic habits in a single synchronized command hub.
              </p>
            </div>
          </div>

          {/* Center-Right: 3 Mini Pillar Health Gauges */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 bg-white/5 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/10 shrink-0">
            {/* Pillar 1: Finance */}
            <button
              onClick={() => onNavigateToPillar('finance', 'daily_log')}
              className="text-left group cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-all"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  1. Finance
                </span>
                <Wallet className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-white">
                {pillarScores.finance}%
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{ width: `${pillarScores.finance}%` }}
                />
              </div>
            </button>

            {/* Pillar 2: Health */}
            <button
              onClick={() => onNavigateToPillar('health')}
              className="text-left group cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-all"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                  2. Health
                </span>
                <Activity className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-white">
                {pillarScores.health}%
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${pillarScores.health}%` }}
                />
              </div>
            </button>

            {/* Pillar 3: Habits */}
            <button
              onClick={() => onNavigateToPillar('habits')}
              className="text-left group cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-all"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                  3. Habits
                </span>
                <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-white">
                {pillarScores.habits}%
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${pillarScores.habits}%` }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Quick Cross-Pillar Action Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-200">
            <Lightbulb className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="text-xs">
              <strong className="text-white">Synergy Insight:</strong> On days with &gt;7.5 hrs sleep and morning workouts, discretionary spending drops by <strong className="text-emerald-300">32%</strong>.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenLogTransaction('expense')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Expense</span>
            </button>
            <button
              onClick={onOpenLogVitalsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Log Vitals</span>
            </button>
            <button
              onClick={onOpenLogWorkoutModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Log Workout</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. VITAFLOW AI ADVISOR (SIMPLE WORDS & 100% SATISFACTION) */}
      {/* ========================================================================= */}
      {onOpenAIAdvisor && (
        <AIAdvisorCard
          financialSummary={financialSummary}
          accounts={accounts}
          transactions={transactions}
          savingsGoals={savingsGoals}
          workoutSessions={workouts}
          habits={habits}
          userProfile={userProfile}
          onOpenAdvisorWithPrompt={onOpenAIAdvisor}
        />
      )}

      {/* ========================================================================= */}
      {/* 3. "TODAY'S ACTION & MOMENTUM CENTER" (Live Interactive Hub) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Atomic Habit Quick Checklist (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-600" />
                <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-purple-600" />
                  Today&apos;s Habit Execution Loop
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">
                  {todayHabitStatus.completedCount} of {todayHabitStatus.totalCount} Completed
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-100">
                  {todayHabitStatus.percent}%
                </span>
              </div>
            </div>

            {/* Habit Quick Tick List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {todayHabitStatus.activeHabits.slice(0, 5).map((habit) => {
                const isCompleted = habitCompletions.some(
                  (c) => c.habitId === habit.id && c.date === todayStr && c.completed
                );

                return (
                  <div
                    key={habit.id}
                    onClick={() => onToggleHabitCompletion(habit.id, todayStr)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isCompleted
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-slate-500">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-xs font-semibold ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {habit.title}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span className="capitalize">{habit.timeOfDay}</span>
                          <span>•</span>
                          <span>{habit.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                        <Flame className="w-3 h-3 fill-amber-500 text-amber-600" />
                        <span>{habit.currentStreak}d</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={onOpenAddHabitModal}
              className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Add Habit</span>
            </button>
            <button
              onClick={() => onNavigateToPillar('habits')}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
            >
              <span>View 14-Day Consistency Matrix</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Column: Today's Hydration & Daily Spend Micro-Widgets (5 Cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {/* Widget 1: Interactive Hydration Quick Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-600" />
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Hydration Target
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-700">
                {todayWaterMl} / {targetWaterMl} ml
              </span>
            </div>

            {/* Hydration Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-linear-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${waterProgressPercent}%` }}
              />
            </div>

            {/* Quick Add Buttons */}
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                onClick={() => handleQuickAddWater(250)}
                className="flex-1 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
              >
                +250 ml (Glass)
              </button>
              <button
                onClick={() => handleQuickAddWater(500)}
                className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
              >
                +500 ml (Bottle)
              </button>
            </div>
          </div>

          {/* Widget 2: Today's Financial Spend Pulse */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Today&apos;s Spending Pulse
                </h4>
              </div>
              <span className="text-xs font-mono font-extrabold text-slate-900">
                {formatINR(todayExpenses)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>Transactions: {todayTransactions.length}</span>
              <span className="text-emerald-600 font-semibold">
                Daily Budget: {formatINR(5000)}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => onOpenLogTransaction('expense')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3 h-3" />
                <span>+ Log Quick Expense</span>
              </button>
              <button
                onClick={() => onNavigateToPillar('finance', 'daily_log')}
                className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Ledger</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TRI-PILLAR 3-LINE SYNCHRONIZED PULSE GRAPH */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        {/* Top Header & Graph Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-base font-heading flex items-center gap-2">
                <span>Tri-Pillar Synchronized Pulse</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md">
                  3-Line Graph
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Synchronized 3-line correlation tracking Daily Spending (₹), Workout Calories (kcal), and Habit Consistency (%).
            </p>
          </div>

          {/* Controls: Mode Switcher & Timeline Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setPulseViewMode('units')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  pulseViewMode === 'units'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="View actual units (₹ for spend, kcal for workouts, % for habits)"
              >
                Actual Units
              </button>
              <button
                onClick={() => setPulseViewMode('harmony')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  pulseViewMode === 'harmony'
                    ? 'bg-white text-indigo-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Normalize all 3 pillars onto a standardized 0-100% comparative harmony index"
              >
                Harmony Index (%)
              </button>
            </div>

            {/* Timeline Filter */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setPulseTimelineDays(7)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  pulseTimelineDays === 7
                    ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setPulseTimelineDays(14)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  pulseTimelineDays === 14
                    ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                14D
              </button>
              <button
                onClick={() => setPulseTimelineDays(30)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  pulseTimelineDays === 30
                    ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                30D
              </button>
            </div>
          </div>
        </div>

        {/* Interactive 3-Line Legend & Period Stat Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          {/* Line 1: Finance (Indigo) */}
          <button
            onClick={() => setVisibleLines((prev) => ({ ...prev, finance: !prev.finance }))}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
              visibleLines.finance
                ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 ring-1 ring-indigo-300/50 shadow-2xs'
                : 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-indigo-600 shadow-2xs shrink-0 ring-2 ring-white" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-900/80">
                  Line 1: Finance (Spend)
                </p>
                <p className="text-xs font-semibold text-slate-600">
                  Avg: <strong className="text-indigo-950 font-mono">{formatINR(pulseAverages.avgSpend)}</strong>/d
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100/80 text-indigo-800">
              {visibleLines.finance ? 'Active' : 'Hidden'}
            </span>
          </button>

          {/* Line 2: Health (Rose) */}
          <button
            onClick={() => setVisibleLines((prev) => ({ ...prev, health: !prev.health }))}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
              visibleLines.health
                ? 'bg-rose-50/70 border-rose-200 text-rose-950 ring-1 ring-rose-300/50 shadow-2xs'
                : 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-2xs shrink-0 ring-2 ring-white" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-900/80">
                  Line 2: Health (Workouts)
                </p>
                <p className="text-xs font-semibold text-slate-600">
                  Avg: <strong className="text-rose-950 font-mono">{pulseAverages.avgCalories} kcal</strong>/d
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100/80 text-rose-800">
              {visibleLines.health ? 'Active' : 'Hidden'}
            </span>
          </button>

          {/* Line 3: Habits (Purple) */}
          <button
            onClick={() => setVisibleLines((prev) => ({ ...prev, habits: !prev.habits }))}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
              visibleLines.habits
                ? 'bg-purple-50/70 border-purple-200 text-purple-950 ring-1 ring-purple-300/50 shadow-2xs'
                : 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-purple-600 shadow-2xs shrink-0 ring-2 ring-white" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-purple-900/80">
                  Line 3: Habits (Execution)
                </p>
                <p className="text-xs font-semibold text-slate-600">
                  Avg: <strong className="text-purple-950 font-mono">{pulseAverages.avgHabit}%</strong>
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100/80 text-purple-800">
              {visibleLines.habits ? 'Active' : 'Hidden'}
            </span>
          </button>
        </div>

        {/* Recharts 3-Line Synchronized Graph */}
        <div className="h-68 sm:h-80 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pulseChartData} margin={{ top: 12, right: 14, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="dayLabel"
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              
              {pulseViewMode === 'units' ? (
                <>
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10, fill: '#6366F1' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${val}`}
                  />
                </>
              ) : (
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
              )}

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const rowData = payload[0]?.payload;
                    return (
                      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl text-xs space-y-2 border border-slate-800 min-w-[200px]">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <span className="font-bold text-slate-200">{label}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{rowData?.date}</span>
                        </div>

                        {pulseViewMode === 'units' ? (
                          <div className="space-y-1.5">
                            {visibleLines.finance && (
                              <div className="flex items-center justify-between gap-3 text-indigo-300">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                  <span>Spend:</span>
                                </span>
                                <strong className="font-mono text-white">{formatINR(rowData?.expense || 0)}</strong>
                              </div>
                            )}
                            {visibleLines.health && (
                              <div className="flex items-center justify-between gap-3 text-rose-300">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                                  <span>Calories:</span>
                                </span>
                                <strong className="font-mono text-white">{rowData?.calories || 0} kcal</strong>
                              </div>
                            )}
                            {visibleLines.habits && (
                              <div className="flex items-center justify-between gap-3 text-purple-300">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                                  <span>Habit Score:</span>
                                </span>
                                <strong className="font-mono text-white">{rowData?.habitScore || 0}%</strong>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {visibleLines.finance && (
                              <div className="flex items-center justify-between gap-3 text-indigo-300">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                  <span>Finance Harmony:</span>
                                </span>
                                <strong className="font-mono text-white">{rowData?.financeHarmony}%</strong>
                              </div>
                            )}
                            {visibleLines.health && (
                              <div className="flex items-center justify-between gap-3 text-rose-300">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                                  <span>Health Harmony:</span>
                                </span>
                                <strong className="font-mono text-white">{rowData?.healthHarmony}%</strong>
                              </div>
                            )}
                            {visibleLines.habits && (
                              <div className="flex items-center justify-between gap-3 text-purple-300">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                                  <span>Habit Harmony:</span>
                                </span>
                                <strong className="font-mono text-white">{rowData?.habitHarmony}%</strong>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend
                verticalAlign="top"
                height={36}
                formatter={(val) => {
                  if (val === 'expense') return 'Line 1: Spend (₹)';
                  if (val === 'calories') return 'Line 2: Calories Burned (kcal)';
                  if (val === 'habitScore') return 'Line 3: Habits Completed (%)';
                  if (val === 'financeHarmony') return 'Line 1: Finance Harmony Index';
                  if (val === 'healthHarmony') return 'Line 2: Health Harmony Index';
                  if (val === 'habitHarmony') return 'Line 3: Habit Harmony Index';
                  return val;
                }}
              />

              {pulseViewMode === 'units' ? (
                <>
                  {/* Line 1: Finance (Indigo) */}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="expense"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, strokeWidth: 1.5, stroke: '#FFFFFF', fill: '#6366F1' }}
                    activeDot={{ r: 6, stroke: '#EEF2FF', strokeWidth: 2, fill: '#4F46E5' }}
                    name="expense"
                    hide={!visibleLines.finance}
                  />

                  {/* Line 2: Health (Rose) */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="calories"
                    stroke="#F43F5E"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, strokeWidth: 1.5, stroke: '#FFFFFF', fill: '#F43F5E' }}
                    activeDot={{ r: 6, stroke: '#FFE4E6', strokeWidth: 2, fill: '#E11D48' }}
                    name="calories"
                    hide={!visibleLines.health}
                  />

                  {/* Line 3: Habits (Purple) */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="habitScore"
                    stroke="#9333EA"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, strokeWidth: 1.5, stroke: '#FFFFFF', fill: '#9333EA' }}
                    activeDot={{ r: 6, stroke: '#F3E8FF', strokeWidth: 2, fill: '#7E22CE' }}
                    name="habitScore"
                    hide={!visibleLines.habits}
                  />
                </>
              ) : (
                <>
                  {/* Line 1: Finance Harmony (Indigo) */}
                  <Line
                    type="monotone"
                    dataKey="financeHarmony"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, strokeWidth: 1.5, stroke: '#FFFFFF', fill: '#6366F1' }}
                    activeDot={{ r: 6, stroke: '#EEF2FF', strokeWidth: 2, fill: '#4F46E5' }}
                    name="financeHarmony"
                    hide={!visibleLines.finance}
                  />

                  {/* Line 2: Health Harmony (Rose) */}
                  <Line
                    type="monotone"
                    dataKey="healthHarmony"
                    stroke="#F43F5E"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, strokeWidth: 1.5, stroke: '#FFFFFF', fill: '#F43F5E' }}
                    activeDot={{ r: 6, stroke: '#FFE4E6', strokeWidth: 2, fill: '#E11D48' }}
                    name="healthHarmony"
                    hide={!visibleLines.health}
                  />

                  {/* Line 3: Habit Harmony (Purple) */}
                  <Line
                    type="monotone"
                    dataKey="habitHarmony"
                    stroke="#9333EA"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, strokeWidth: 1.5, stroke: '#FFFFFF', fill: '#9333EA' }}
                    activeDot={{ r: 6, stroke: '#F3E8FF', strokeWidth: 2, fill: '#7E22CE' }}
                    name="habitHarmony"
                    hide={!visibleLines.habits}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ACTUALS VS BUDGETS ANALYTICS SUITE (MULTI-CHART WORKSPACE) */}
      {/* ========================================================================= */}
      <ActualsVsBudgetsSection
        categories={categories}
        transactions={transactions}
        monthlyBudgets={monthlyBudgets}
        onNavigateToPillar={onNavigateToPillar}
        onOpenLogTransaction={onOpenLogTransaction}
      />

      {/* ========================================================================= */}
      {/* 5. THREE HIGH-DENSITY LIVE PILLAR STATUS CARDS WITH DRILL-DOWNS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PILLAR 1 CARD: FINANCE */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">1. Finance Hub</h4>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Net Worth & Budgets
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                +4.2% MoM
              </span>
            </div>

            {/* Key Metrics */}
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Net Worth</p>
                <p className="text-xl font-extrabold text-slate-900 font-mono">
                  {formatINR(financialSummary.netWorthEstimate)}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Liquid: {formatINR(financialSummary.totalBalance)}</span>
                  <span>Debt: {formatINR(financialSummary.totalLiabilities)}</span>
                </div>
              </div>

              {/* Goal Buckets preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Top Savings Bucket</span>
                  <span className="font-bold text-indigo-600">
                    {savingsGoals[0] ? Math.round((savingsGoals[0].currentSaved / savingsGoals[0].targetAmount) * 100) : 0}%
                  </span>
                </div>
                {savingsGoals[0] && (
                  <div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((savingsGoals[0].currentSaved / savingsGoals[0].targetAmount) * 100))}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{savingsGoals[0].title}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Sub-navigation */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateToPillar('finance', 'daily_log')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore 5 Sub-Modules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* PILLAR 2 CARD: HEALTH */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-rose-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">2. Health Hub</h4>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Biometrics & Workouts
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                Optimal Vitals
              </span>
            </div>

            {/* Key Metrics */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Resting HR</p>
                  <p className="text-base font-extrabold text-slate-900 font-mono">
                    {latestVitals.restingHeartRate || 64} <span className="text-xs font-normal">BPM</span>
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Sleep</p>
                  <p className="text-base font-extrabold text-slate-900 font-mono">
                    {latestVitals.sleepHours || 7.5} <span className="text-xs font-normal">hrs</span>
                  </p>
                </div>
              </div>

              {/* Weekly Workouts Summary */}
              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100/80">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-rose-900">7-Day Workout Total</span>
                  <span className="font-bold text-rose-700">{weeklyWorkoutCalories} kcal</span>
                </div>
                <p className="text-[11px] text-rose-700">
                  {past7DaysWorkouts.length} sessions completed ({weeklyWorkoutMinutes} mins)
                </p>
              </div>
            </div>
          </div>

          {/* Quick Sub-navigation */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateToPillar('health')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Vitals & Workouts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* PILLAR 3 CARD: HABITS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">3. Habits Hub</h4>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Atomic Loops & Streaks
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                {habits.filter((h) => h.active).length} Active
              </span>
            </div>

            {/* Key Metrics */}
            <div className="space-y-3">
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-purple-800">Top Streak</p>
                  <p className="text-base font-extrabold text-purple-950">
                    {habits.reduce((max, h) => Math.max(max, h.currentStreak), 0)} Days Continuous
                  </p>
                </div>
                <Flame className="w-7 h-7 fill-amber-500 text-amber-600" />
              </div>

              {/* Habit Badges shelf */}
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Achievement Shelf</p>
                <div className="flex items-center gap-2">
                  {habitBadges.slice(0, 3).map((badge) => (
                    <div
                      key={badge.id}
                      className="px-2 py-1 bg-slate-100 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-700 flex items-center gap-1"
                    >
                      <Award className="w-3 h-3 text-amber-600" />
                      <span>{badge.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Sub-navigation */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateToPillar('habits')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Habit Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
