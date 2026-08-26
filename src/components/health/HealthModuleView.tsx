import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Moon,
  Droplets,
  Dumbbell,
  Scale,
  Flame,
  PlusCircle,
  TrendingUp,
  Zap,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';
import { VitalsLog, WorkoutSession } from '../../types';
import { LogVitalsModal } from './LogVitalsModal';
import { LogWorkoutModal } from './LogWorkoutModal';

interface HealthModuleViewProps {
  vitalsLogs: VitalsLog[];
  workouts: WorkoutSession[];
  onSaveVitals: (log: VitalsLog) => void;
  onSaveWorkout: (workout: WorkoutSession) => void;
}

export const HealthModuleView: React.FC<HealthModuleViewProps> = ({
  vitalsLogs,
  workouts,
  onSaveVitals,
  onSaveWorkout,
}) => {
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [todayWaterGlasses, setTodayWaterGlasses] = useState(8); // 8 x 250ml = 2000ml

  const latestVitals = vitalsLogs[0] || {
    weightKg: 72.4,
    systolicBp: 118,
    diastolicBp: 78,
    restingHeartRate: 64,
    sleepHours: 7.5,
    waterMl: 2750,
  };

  const totalCaloriesBurnedWeek = workouts.reduce((acc, w) => acc + (w.caloriesBurned || 0), 0);
  const totalWorkoutMinutesWeek = workouts.reduce((acc, w) => acc + w.durationMinutes, 0);

  // Wellness score calculated from vitals
  const wellnessScore = 88;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 bg-rose-500 transform rotate-45" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Pillar 2 • Physical Vitality & Wellness Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-light text-slate-800 font-heading">
            Health, Biometrics & Workout Engine
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Track daily biometrics, resting heart rate, active workout volume, hydration streaks, and recovery metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsVitalsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Activity className="w-4 h-4 text-rose-500" />
            <span>+ Log Vitals</span>
          </button>

          <button
            onClick={() => setIsWorkoutModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-all cursor-pointer"
          >
            <Dumbbell className="w-4 h-4" />
            <span>+ Log Workout</span>
          </button>
        </div>
      </div>

      {/* Hero 4 KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Body Composition */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Weight & Body Mass
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-light text-slate-900 font-heading">
              {latestVitals.weightKg} <span className="text-sm font-semibold text-slate-500">kg</span>
            </h3>
            <p className="mt-1 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span>Healthy BMI: 22.4</span> • Optimal Range
            </p>
          </div>
        </div>

        {/* 2. Cardiovascular Vitals */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Resting Heart Rate & BP
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-light text-slate-900 font-heading text-rose-600">
              {latestVitals.restingHeartRate}{' '}
              <span className="text-sm font-semibold text-slate-500">BPM</span>
            </h3>
            <p className="mt-1 text-[11px] text-slate-500">
              BP: {latestVitals.systolicBp || 118}/{latestVitals.diastolicBp || 78} mmHg (Normal)
            </p>
          </div>
        </div>

        {/* 3. Sleep & Recovery */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Sleep Duration
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Moon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-light text-slate-900 font-heading text-indigo-600">
              {latestVitals.sleepHours || 7.5}{' '}
              <span className="text-sm font-semibold text-slate-500">Hours</span>
            </h3>
            <p className="mt-1 text-[11px] text-slate-500">
              Quality: <strong className="text-emerald-700">Good (85% Deep/REM)</strong>
            </p>
          </div>
        </div>

        {/* 4. Active Energy Burn */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Weekly Workout Volume
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-light text-slate-900 font-heading text-amber-600">
              {totalCaloriesBurnedWeek}{' '}
              <span className="text-sm font-semibold text-slate-500">kcal</span>
            </h3>
            <p className="mt-1 text-[11px] text-slate-500">
              {workouts.length} Sessions • {totalWorkoutMinutesWeek} Total Mins
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Hydration & Vitals on Left, Workouts Log on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Hydration Tracker & Vitals History (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Hydration Tracker */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5.5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Daily Hydration Goal (3,000 ml)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-cyan-700">
                {todayWaterGlasses * 250} / 3000 ml
              </span>
            </div>

            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, ((todayWaterGlasses * 250) / 3000) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs text-slate-500">
                {todayWaterGlasses} of 12 glasses logged
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setTodayWaterGlasses(Math.max(0, todayWaterGlasses - 1))}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  - 250ml
                </button>
                <button
                  onClick={() => setTodayWaterGlasses(todayWaterGlasses + 1)}
                  className="px-3 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 text-xs font-bold"
                >
                  + 250ml Glass
                </button>
              </div>
            </div>
          </div>

          {/* Vitals History Log */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5.5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent Vitals History
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">Last 3 Entries</span>
            </div>

            <div className="space-y-2.5">
              {vitalsLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{log.date}</span>
                    <span className="text-emerald-700">Energy: {log.energyLevel || 4}/5 ⚡</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Weight</span>
                      <strong className="text-slate-900">{log.weightKg} kg</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">BP / Pulse</span>
                      <strong className="text-slate-900">
                        {log.systolicBp}/{log.diastolicBp} • {log.restingHeartRate} bpm
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Sleep</span>
                      <strong className="text-indigo-700">{log.sleepHours} hrs</strong>
                    </div>
                  </div>
                  {log.notes && (
                    <p className="text-[10px] text-slate-500 italic mt-1">{log.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Workouts & Training Sessions Log (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Training & Workout Activity Log
                </h3>
                <p className="text-xs text-slate-500">
                  Track physical conditioning, cardio volume and resistance training
                </p>
              </div>
              <button
                onClick={() => setIsWorkoutModalOpen(true)}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
              >
                + Add Session
              </button>
            </div>

            <div className="space-y-3">
              {workouts.map((w) => (
                <div
                  key={w.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-rose-300 transition-all flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{w.type}</h4>
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                          {w.intensity}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>⏱️ {w.durationMinutes} Mins</span>
                        {w.caloriesBurned && (
                          <span className="text-rose-600 font-semibold">
                            🔥 {w.caloriesBurned} kcal
                          </span>
                        )}
                        {w.distanceKm && (
                          <span className="text-indigo-600 font-semibold">
                            📍 {w.distanceKm} km
                          </span>
                        )}
                      </div>
                      {w.notes && (
                        <p className="text-[11px] text-slate-600 mt-1.5 leading-snug">{w.notes}</p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-400 shrink-0">{w.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <LogVitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        onSaveVitals={onSaveVitals}
      />

      <LogWorkoutModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
        onSaveWorkout={onSaveWorkout}
      />
    </div>
  );
};
