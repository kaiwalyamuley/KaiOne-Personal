import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Zap,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Flame,
  CheckCircle2,
  DollarSign,
  Heart,
  Star,
  Layers,
} from 'lucide-react';
import {
  FinancialSummary,
  Account,
  Transaction,
  SavingsGoalBucket,
  WorkoutSession,
  Habit,
  UserProfile,
} from '../../types';
import { formatINR } from '../../utils/formatters';

interface AIAdvisorCardProps {
  financialSummary: FinancialSummary;
  accounts: Account[];
  transactions: Transaction[];
  savingsGoals: SavingsGoalBucket[];
  workoutSessions: WorkoutSession[];
  habits: Habit[];
  userProfile?: UserProfile;
  onOpenAdvisorWithPrompt: (prompt?: string) => void;
}

export const AIAdvisorCard: React.FC<AIAdvisorCardProps> = ({
  financialSummary,
  accounts,
  transactions,
  savingsGoals,
  workoutSessions,
  habits,
  userProfile,
  onOpenAdvisorWithPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'savings' | 'habits'>('daily');

  const surplus = financialSummary.totalIncome - financialSummary.totalExpense;
  const isSurplus = surplus >= 0;

  // Recent 7 days workouts
  const past7Days = new Date();
  past7Days.setDate(past7Days.getDate() - 7);
  const past7DaysStr = past7Days.toISOString().split('T')[0];
  const recentWorkouts = workoutSessions.filter((w) => w.date >= past7DaysStr);
  const weeklyCalories = recentWorkouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0);

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg border border-indigo-700/40 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-indigo-400 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold font-heading text-white">
                  KAIONE AI Advisor
                </h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-300" />
                  <span>Simple Words • 100% Satisfaction</span>
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Your personal guide for Money, Health & Habits—explained in clear, plain words.
              </p>
            </div>
          </div>

          {/* Direct Trigger to Open Full Chat */}
          <button
            onClick={() => onOpenAdvisorWithPrompt()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <span>Ask Advisor Anything</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Simple Insights Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Tile 1: Money Simple Verdict */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-indigo-200 mb-1 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-amber-300 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-amber-300" /> Money Clarity
              </span>
              <span className="font-mono text-emerald-400 font-bold text-xs">
                {isSurplus ? `+${formatINR(surplus)}` : `-${formatINR(Math.abs(surplus))}`}
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {isSurplus ? (
                <>
                  You have a healthy positive cash flow this month. You're on track to grow your savings!
                </>
              ) : (
                <>
                  Spending is slightly higher than income this month. A small ₹300/day pause restores balance.
                </>
              )}
            </p>
          </div>

          {/* Tile 2: Health Simple Verdict */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-indigo-200 mb-1 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-rose-300 flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-400" /> Energy & Workouts
              </span>
              <span className="font-mono text-rose-300 font-bold text-xs">
                {weeklyCalories} kcal
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {recentWorkouts.length > 0 ? (
                <>
                  {recentWorkouts.length} workouts logged in the last 7 days. Consistency is your superpower!
                </>
              ) : (
                <>
                  No workouts logged yet this week. A quick 15-min walk today recharges your energy!
                </>
              )}
            </p>
          </div>

          {/* Tile 3: Habit Simple Verdict */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-indigo-200 mb-1 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-purple-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-purple-300" /> Daily Habits
              </span>
              <span className="font-mono text-purple-300 font-bold text-xs">
                {habits.length} Active
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Use the 2-minute rule today: even 2 minutes of your habit protects your daily streak identity.
            </p>
          </div>
        </div>

        {/* 1-Click Interactive Quick Prompt Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> 1-Click Advice:
          </span>

          <button
            onClick={() =>
              onOpenAdvisorWithPrompt(
                'Give me a simple 30-second Life & Money audit in plain words for 100% peace of mind.'
              )
            }
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>⚡ 30-Sec Life Audit</span>
          </button>

          <button
            onClick={() =>
              onOpenAdvisorWithPrompt(
                'Find 3 simple places where I can easily save ₹3,000 to ₹5,000 this month without feeling deprived.'
              )
            }
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>💰 Save ₹3,000 This Month</span>
          </button>

          <button
            onClick={() =>
              onOpenAdvisorWithPrompt(
                'Look at my active savings goals and calculate the exact daily or weekly savings needed to hit them faster.'
              )
            }
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>🎯 Fast-Track My Goals</span>
          </button>

          <button
            onClick={() =>
              onOpenAdvisorWithPrompt(
                'How can I keep my daily habit streaks 100% consistent even on busy or tired days?'
              )
            }
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>🔥 Never Break a Habit Streak</span>
          </button>
        </div>
      </div>
    </div>
  );
};
