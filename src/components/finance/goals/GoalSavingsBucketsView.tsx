import React, { useState } from 'react';
import {
  Target,
  PlusCircle,
  Flame,
  Award,
  TrendingUp,
  ShieldCheck,
  Home,
  Car,
  Plane,
  Sun,
  Laptop,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Edit3,
  Trash2,
  DollarSign,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Account, GoalAchievementBadge, SavingsGoalBucket, GoalContribution } from '../../../types';
import { formatINR } from '../../../utils/formatters';
import { AddEditGoalModal } from './AddEditGoalModal';
import { GoalDepositModal } from './GoalDepositModal';
import { GoalBadgesModal } from './GoalBadgesModal';

interface GoalSavingsBucketsViewProps {
  goals: SavingsGoalBucket[];
  accounts: Account[];
  badges: GoalAchievementBadge[];
  onSaveGoal: (goal: SavingsGoalBucket) => void;
  onDeleteGoal: (goalId: string) => void;
  onRecordDeposit: (goalId: string, contribution: GoalContribution, newTotalSaved: number, isStreakIncrement: boolean) => void;
}

export const GoalSavingsBucketsView: React.FC<GoalSavingsBucketsViewProps> = ({
  goals,
  accounts,
  badges,
  onSaveGoal,
  onDeleteGoal,
  onRecordDeposit,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoalBucket | null>(null);
  const [depositGoal, setDepositGoal] = useState<SavingsGoalBucket | null>(null);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);

  // Aggregate metrics
  const totalTargetCorpus = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSavedCorpus = goals.reduce((acc, g) => acc + g.currentSaved, 0);
  const overallProgressPercent = totalTargetCorpus > 0 ? (totalSavedCorpus / totalTargetCorpus) * 100 : 0;
  const totalMonthlyTarget = goals.filter((g) => g.status === 'in_progress').reduce((acc, g) => acc + g.monthlyTarget, 0);
  const maxStreak = Math.max(0, ...goals.map((g) => g.monthlyStreak));
  const completedGoalsCount = goals.filter((g) => g.status === 'completed').length;
  const unlockedBadgesCount = badges.filter((b) => b.isUnlocked).length;

  const filteredGoals = goals.filter((g) => {
    if (activeCategoryFilter === 'all') return true;
    if (activeCategoryFilter === 'completed') return g.status === 'completed';
    return g.category === activeCategoryFilter;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency':
        return <ShieldCheck className="w-5 h-5" />;
      case 'house':
        return <Home className="w-5 h-5" />;
      case 'vehicle':
        return <Car className="w-5 h-5" />;
      case 'travel':
        return <Plane className="w-5 h-5" />;
      case 'retirement':
        return <Sun className="w-5 h-5" />;
      case 'gadget':
        return <Laptop className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
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
              Financial Intelligence • Discipline Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-light text-slate-800 font-heading">
            Goal Savings Buckets & Streak Badges
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Earmark purpose-driven wealth buckets with monthly consistency streaks, milestone badges, and automated SIP projections.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-view-goal-badges"
            onClick={() => setIsBadgesModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>Badges & Streaks</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px]">
              {unlockedBadgesCount}/{badges.length}
            </span>
          </button>

          <button
            id="btn-create-savings-goal"
            onClick={() => {
              setEditingGoal(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create Goal Bucket</span>
          </button>
        </div>
      </div>

      {/* Hero KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Saved Across Buckets */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total Saved in Buckets
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-light text-slate-900 font-heading text-emerald-700">
              {formatINR(totalSavedCorpus)}
            </h3>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, overallProgressPercent)}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-slate-700">
                {overallProgressPercent.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Total Target Corpus */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Cumulative Target Goal
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-light text-slate-900 font-heading">
              {formatINR(totalTargetCorpus)}
            </h3>
            <p className="mt-1 text-[11px] text-slate-500">
              Across {goals.length} Active & Completed Buckets
            </p>
          </div>
        </div>

        {/* 3. Monthly Savings Requirement */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Monthly SIP Allocation
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-light text-slate-900 font-heading text-amber-700">
              {formatINR(totalMonthlyTarget)}
            </h3>
            <p className="mt-1 text-[11px] text-slate-500">
              Required monthly deposit for on-time targets
            </p>
          </div>
        </div>

        {/* 4. Top Monthly Streak */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Top Consistency Streak
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-light text-slate-900 font-heading text-rose-600 flex items-center gap-1">
                <span>{maxStreak}</span>
                <span className="text-sm font-bold text-slate-600">Months 🔥</span>
              </h3>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {completedGoalsCount} goal{completedGoalsCount !== 1 ? 's' : ''} 100% completed
            </p>
          </div>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeCategoryFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Buckets ({goals.length})
        </button>
        <button
          onClick={() => setActiveCategoryFilter('emergency')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeCategoryFilter === 'emergency'
              ? 'bg-emerald-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Emergency Funds
        </button>
        <button
          onClick={() => setActiveCategoryFilter('house')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeCategoryFilter === 'house'
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Real Estate
        </button>
        <button
          onClick={() => setActiveCategoryFilter('travel')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeCategoryFilter === 'travel'
              ? 'bg-amber-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Vacations
        </button>
        <button
          onClick={() => setActiveCategoryFilter('completed')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeCategoryFilter === 'completed'
              ? 'bg-emerald-700 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Completed ({completedGoalsCount})
        </button>
      </div>

      {/* Goal Buckets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
        {filteredGoals.map((goal) => {
          const isCompleted = goal.currentSaved >= goal.targetAmount;
          const progress = goal.targetAmount > 0 ? (goal.currentSaved / goal.targetAmount) * 100 : 0;
          const remainingAmount = Math.max(0, goal.targetAmount - goal.currentSaved);

          return (
            <div
              key={goal.id}
              className={`rounded-3xl border p-5.5 bg-white shadow-2xs flex flex-col justify-between transition-all hover:shadow-md ${
                isCompleted
                  ? 'border-emerald-300 ring-1 ring-emerald-100'
                  : 'border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div>
                {/* Card Top Title & Category Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0"
                      style={{ backgroundColor: goal.color }}
                    >
                      {getCategoryIcon(goal.category)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                        {goal.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {goal.category}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                            goal.priority === 'high'
                              ? 'bg-rose-100 text-rose-700'
                              : goal.priority === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {goal.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Dropdown / Edit */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingGoal(goal);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Edit Goal Bucket"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete goal bucket "${goal.title}"?`)) {
                          onDeleteGoal(goal.id);
                        }
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Corpus */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-600">Saved Corpus</span>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900 font-heading">
                        {formatINR(goal.currentSaved)}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-normal">
                        of {formatINR(goal.targetAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : progress > 70
                          ? 'bg-indigo-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className={isCompleted ? 'text-emerald-700' : 'text-indigo-600'}>
                      {progress.toFixed(1)}% Completed
                    </span>
                    <span className="text-slate-500">
                      {isCompleted ? 'Goal Achieved 🎉' : `${formatINR(remainingAmount)} Remaining`}
                    </span>
                  </div>
                </div>

                {/* Monthly Streak Badge & Target info */}
                <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                      <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      <span>{goal.monthlyStreak}-Month Streak</span>
                    </div>
                    <p className="text-[9px] text-amber-700 mt-0.5">
                      {goal.lastContributionMonth === '2026-08'
                        ? 'August deposit done ✅'
                        : 'Pending this month'}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Target Date:
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {new Date(goal.targetDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action Deposit Button */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 font-medium">
                  SIP: <strong className="text-slate-800">{formatINR(goal.monthlyTarget)}/mo</strong>
                </span>

                <button
                  onClick={() => setDepositGoal(goal)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-100 flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>+ Deposit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <AddEditGoalModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={onSaveGoal}
        editingGoal={editingGoal}
        accounts={accounts}
      />

      <GoalDepositModal
        isOpen={depositGoal !== null}
        onClose={() => setDepositGoal(null)}
        goal={depositGoal}
        accounts={accounts}
        onRecordDeposit={onRecordDeposit}
      />

      <GoalBadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        badges={badges}
      />
    </div>
  );
};
