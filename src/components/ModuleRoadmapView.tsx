import React from 'react';
import {
  Activity,
  CheckSquare,
  Sparkles,
  ArrowLeft,
  HeartPulse,
  Flame,
  Droplet,
  Moon,
  Footprints,
  CalendarCheck,
  Target,
  Trophy,
} from 'lucide-react';

interface ModuleRoadmapViewProps {
  moduleType: 'health' | 'habits';
  onBackToFinance: () => void;
}

export const ModuleRoadmapView: React.FC<ModuleRoadmapViewProps> = ({
  moduleType,
  onBackToFinance,
}) => {
  const isHealth = moduleType === 'health';

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6 px-4">
      {/* Back Button */}
      <button
        onClick={onBackToFinance}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>← Back to Active Module 1: Daily Finance Log (INR)</span>
      </button>

      {/* Main Roadmap Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              isHealth
                ? 'bg-rose-100 text-rose-600'
                : 'bg-indigo-100 text-indigo-600'
            }`}
          >
            {isHealth ? (
              <Activity className="h-6 w-6" />
            ) : (
              <CheckSquare className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                Coming Next in Workflow
              </span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 mt-1">
              {isHealth
                ? 'Module 2: Health & Wellness Tracker'
                : 'Module 3: Daily Habits & Streak Tracker'}
            </h2>
          </div>
        </div>

        <p className="mt-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
          {isHealth
            ? 'We are currently focused on completing Module 1: Daily Finance Log Entry (INR). Once you are satisfied with Module 1, we will activate the full Health Tracker with nutrition, workouts, water intake, sleep cycles, and vitals.'
            : 'We are currently focused on completing Module 1: Daily Finance Log Entry (INR). Once you are ready, we will build out the Habit Tracker with daily streaks, routine checklists, frequency targets, and milestone badges.'}
        </p>

        {/* Feature Preview Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-stone-100">
          {isHealth ? (
            <>
              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span>Calories & Nutrition Log</span>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Track breakfast, lunch, dinner, macros (protein, carbs, fats), and calorie deficit.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <Droplet className="h-4 w-4 text-blue-500" />
                  <span>Water & Hydration Tracker</span>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Daily 3-4L water glass counter with timely reminders and progress rings.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <Footprints className="h-4 w-4 text-emerald-500" />
                  <span>Workouts & Step Count</span>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Gym logs, running distance, cardio intensity, and 10,000 steps tracker.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <span>Sleep & Recovery</span>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Sleep duration, deep sleep quality, wake-up times, and resting energy.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <CalendarCheck className="h-4 w-4 text-indigo-600" />
                  <span>Daily Morning & Evening Checklists</span>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Meditation, reading 20 pages, journaling, morning stretches, and screen detox.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <Flame className="h-4 w-4 text-orange-600" />
                  <span>Streak Engine & Heatmaps</span>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  GitHub-style consistency heatmaps, current streaks, and longest unbroken chains.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <Target className="h-4 w-4 text-rose-600" />
                  <span>Flexible Frequency Rules</span>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Daily, 3x per week (e.g. gym), or weekend-only habit scheduling.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <Trophy className="h-4 w-4 text-amber-600" />
                  <span>Milestones & Badges</span>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  7-day, 21-day, 50-day, and 100-day consistency achievement milestones.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onBackToFinance}
            className="rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 transition-all"
          >
            Go to Active Module 1: Daily Log Entry →
          </button>
        </div>
      </div>
    </div>
  );
};
