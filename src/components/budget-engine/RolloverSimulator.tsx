import React, { useState } from 'react';
import {
  Sparkles,
  Calculator,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Info,
  Sliders,
} from 'lucide-react';
import { Category } from '../../types';
import { formatINR } from '../../utils/formatters';

interface RolloverSimulatorProps {
  categories: Category[];
}

export const RolloverSimulator: React.FC<RolloverSimulatorProps> = ({ categories }) => {
  const expenseCategories = categories.filter(
    (c) => c.type === 'expense' || c.type === 'all'
  );

  // Simulation Parameters
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('Transport & Fuel');
  const [baseBudget, setBaseBudget] = useState<number>(2000);
  const [month1Spend, setMonth1Spend] = useState<number>(1400); // Matches user prompt
  const [month2Spend, setMonth2Spend] = useState<number>(2200);
  const [month3Spend, setMonth3Spend] = useState<number>(1800);

  // Computed Waterfall Simulation
  // Month 1:
  const m1Opening = 0;
  const m1Effective = baseBudget + m1Opening;
  const m1Variance = m1Effective - month1Spend; // e.g. 2000 - 1400 = +600

  // Month 2:
  const m2Opening = m1Variance; // +600
  const m2Effective = baseBudget + m2Opening; // 2000 + 600 = 2600
  const m2Variance = m2Effective - month2Spend; // 2600 - 2200 = +400

  // Month 3:
  const m3Opening = m2Variance; // +400
  const m3Effective = baseBudget + m3Opening; // 2000 + 400 = 2400
  const m3Variance = m3Effective - month3Spend; // 2400 - 1800 = +600

  // Month 4 projected opening:
  const m4ProjectedOpening = m3Variance; // +600

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Interactive Budget Rollover Scenario Sandbox
            </h3>
            <p className="text-xs text-slate-500">
              Simulate how under-spending (+surplus) or over-spending (-deficit) ripples into future month budgets.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setBaseBudget(2000);
            setMonth1Spend(1400);
            setMonth2Spend(2200);
            setMonth3Spend(1800);
          }}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Prompt Example</span>
        </button>
      </div>

      {/* Inputs Configuration Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
            Category Name
          </label>
          <select
            value={selectedCategoryName}
            onChange={(e) => setSelectedCategoryName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none"
          >
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
            Base Monthly Budget (₹)
          </label>
          <input
            type="number"
            value={baseBudget}
            onChange={(e) => setBaseBudget(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
            Month 1 Actual Spend (₹)
          </label>
          <input
            type="number"
            value={month1Spend}
            onChange={(e) => setMonth1Spend(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
            Month 2 Projected Spend (₹)
          </label>
          <input
            type="number"
            value={month2Spend}
            onChange={(e) => setMonth2Spend(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 outline-none"
          />
        </div>
      </div>

      {/* Simulated Sequential Outcome */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Month 1 Card */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Month 1 (e.g. August 2026)
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
              Baseline
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Base Budget:</span>
              <span className="font-bold text-slate-800">{formatINR(baseBudget)}</span>
            </div>
            <div className="flex justify-between">
              <span>Actual Spend:</span>
              <span className="font-bold text-slate-800">{formatINR(month1Spend)}</span>
            </div>
            <div className={`p-2 rounded-lg border flex justify-between font-bold ${
              m1Variance >= 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <span>{m1Variance >= 0 ? 'Surplus Remaining:' : 'Overspent Deficit:'}</span>
              <span>{m1Variance >= 0 ? '+' : ''}{formatINR(m1Variance)}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
            <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
            <span>Rolls {m1Variance >= 0 ? '+' : ''}{formatINR(m1Variance)} into Month 2</span>
          </div>
        </div>

        {/* Month 2 Card */}
        <div className="p-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-950">
              Month 2 (e.g. September 2026)
            </span>
            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold">
              Rollover Active
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Base Budget:</span>
              <span className="font-semibold text-slate-800">{formatINR(baseBudget)}</span>
            </div>
            <div className="flex justify-between">
              <span>Rolled In from Month 1:</span>
              <span className={`font-bold ${m1Variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {m1Variance >= 0 ? '+' : ''}{formatINR(m1Variance)}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-indigo-200 flex justify-between font-extrabold text-indigo-900 text-sm">
              <span>Overall New Budget:</span>
              <span>{formatINR(m2Effective)}</span>
            </div>
            <div className="flex justify-between">
              <span>Month 2 Spend:</span>
              <span className="font-semibold text-slate-800">{formatINR(month2Spend)}</span>
            </div>
            <div className={`p-2 rounded-lg border flex justify-between font-bold ${
              m2Variance >= 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <span>{m2Variance >= 0 ? 'Surplus Carryforward:' : 'Deficit Carryforward:'}</span>
              <span>{m2Variance >= 0 ? '+' : ''}{formatINR(m2Variance)}</span>
            </div>
          </div>

          <div className="text-[11px] text-indigo-800 font-medium flex items-center gap-1.5 pt-1">
            <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
            <span>Rolls {m2Variance >= 0 ? '+' : ''}{formatINR(m2Variance)} into Month 3</span>
          </div>
        </div>

        {/* Month 3 Card */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Month 3 (e.g. October 2026)
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
              Projected
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Base Budget:</span>
              <span className="font-semibold text-slate-800">{formatINR(baseBudget)}</span>
            </div>
            <div className="flex justify-between">
              <span>Rolled In from Month 2:</span>
              <span className={`font-bold ${m2Variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {m2Variance >= 0 ? '+' : ''}{formatINR(m2Variance)}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between font-bold text-slate-900">
              <span>Overall New Budget:</span>
              <span>{formatINR(m3Effective)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
