import React, { useState } from 'react';
import { X, Dumbbell, Flame, Clock, Navigation } from 'lucide-react';
import { WorkoutSession } from '../../types';

interface LogWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveWorkout: (workout: WorkoutSession) => void;
}

const WORKOUT_TYPES: WorkoutSession['type'][] = [
  'Gym / Strength',
  'Running',
  'Walking',
  'Yoga',
  'Swimming',
  'Cycling',
  'HIIT',
  'Other',
];

export const LogWorkoutModal: React.FC<LogWorkoutModalProps> = ({
  isOpen,
  onClose,
  onSaveWorkout,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<WorkoutSession['type']>('Gym / Strength');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(320);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'high' | 'peak'>('high');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const workout: WorkoutSession = {
      id: `wo_${Date.now()}`,
      date,
      type,
      durationMinutes: Number(durationMinutes) || 30,
      caloriesBurned: Number(caloriesBurned) || undefined,
      distanceKm: Number(distanceKm) > 0 ? Number(distanceKm) : undefined,
      intensity,
      notes: notes.trim() || undefined,
    };

    onSaveWorkout(workout);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 border-b border-slate-200 bg-rose-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Log Physical Activity / Workout
              </h3>
              <p className="text-xs text-slate-500">Track training volume and active calories</p>
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
            {/* Left Column: Date, Type, Intensity */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Workout Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-rose-500 outline-none bg-slate-50/60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Discipline / Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-rose-500 outline-none bg-slate-50/60 cursor-pointer"
                >
                  {WORKOUT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Intensity Tier
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['light', 'moderate', 'high', 'peak'] as const).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setIntensity(lvl)}
                      className={`py-2 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                        intensity === lvl
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Duration, Calories & Exercises */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:border-rose-500 outline-none bg-slate-50/60"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Active Calories (kcal)
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={caloriesBurned}
                    onChange={(e) => setCaloriesBurned(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-rose-600 focus:border-rose-500 outline-none bg-slate-50/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Workout Log & Exercises Completed
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 4 sets Squats (80kg), Bench Press, Dumbbell Rows, 15 min Stairmaster cooldown..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:border-rose-500 outline-none bg-slate-50/60 resize-none"
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
              className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Log Workout Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
