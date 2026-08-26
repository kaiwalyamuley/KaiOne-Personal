import React, { useState } from 'react';
import { X, Activity, Droplets, Moon, Heart, Scale, Zap } from 'lucide-react';
import { VitalsLog } from '../../types';

interface LogVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveVitals: (log: VitalsLog) => void;
}

export const LogVitalsModal: React.FC<LogVitalsModalProps> = ({ isOpen, onClose, onSaveVitals }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [weightKg, setWeightKg] = useState<number>(72.4);
  const [systolicBp, setSystolicBp] = useState<number>(120);
  const [diastolicBp, setDiastolicBp] = useState<number>(80);
  const [restingHeartRate, setRestingHeartRate] = useState<number>(65);
  const [bloodSugarMgDl, setBloodSugarMgDl] = useState<number>(94);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<'poor' | 'fair' | 'good' | 'optimal'>('good');
  const [waterMl, setWaterMl] = useState<number>(3000);
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const log: VitalsLog = {
      id: `vl_${Date.now()}`,
      date,
      weightKg: Number(weightKg) || undefined,
      systolicBp: Number(systolicBp) || undefined,
      diastolicBp: Number(diastolicBp) || undefined,
      restingHeartRate: Number(restingHeartRate) || undefined,
      bloodSugarMgDl: Number(bloodSugarMgDl) || undefined,
      sleepHours: Number(sleepHours) || undefined,
      sleepQuality,
      waterMl: Number(waterMl) || undefined,
      energyLevel,
      notes: notes.trim() || undefined,
    };

    onSaveVitals(log);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 border-b border-slate-200 bg-rose-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Log Daily Vitals & Biometrics
              </h3>
              <p className="text-xs text-slate-500">Record daily health parameters and recovery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Date & Core Physical Vitals */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-rose-500 outline-none bg-slate-50/60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Body Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:border-rose-500 outline-none bg-slate-50/60"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Resting Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    value={restingHeartRate}
                    onChange={(e) => setRestingHeartRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:border-rose-500 outline-none bg-slate-50/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Blood Pressure (Sys / Dia)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="120"
                      value={systolicBp}
                      onChange={(e) => setSystolicBp(Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none bg-slate-50/60 focus:border-rose-500 text-center"
                    />
                    <span className="text-slate-400 font-bold">/</span>
                    <input
                      type="number"
                      placeholder="80"
                      value={diastolicBp}
                      onChange={(e) => setDiastolicBp(Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none bg-slate-50/60 focus:border-rose-500 text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Fasting Sugar (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={bloodSugarMgDl}
                    onChange={(e) => setBloodSugarMgDl(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none bg-slate-50/60 focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Recovery, Sleep, Hydration & Energy */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Sleep Duration (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-indigo-700 outline-none bg-slate-50/60 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Hydration (ml)
                  </label>
                  <input
                    type="number"
                    step="250"
                    value={waterMl}
                    onChange={(e) => setWaterMl(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-cyan-700 outline-none bg-slate-50/60 focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Energy & Wellness Feeling (1-5)
                </label>
                <div className="flex items-center gap-1.5">
                  {([1, 2, 3, 4, 5] as const).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setEnergyLevel(lvl)}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        energyLevel === lvl
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {lvl === 5 ? '⚡ 5 Peak' : lvl === 1 ? '😴 1' : lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Wellness Notes & Symptoms
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. High morning alertness, relaxed HRV recovery..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 outline-none bg-slate-50/60 focus:border-rose-500 resize-none"
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
              Log Daily Vitals
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
