import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Sliders,
  DollarSign,
  PieChart,
  Calendar,
  Sparkles,
  Zap,
  ShieldCheck,
  Award,
  ChevronRight,
  PlusCircle,
  Trash2,
  Download,
  Info,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  Account,
  FinancialSummary,
  LifeEventImpact,
  WealthForecastParams,
  YearlyWealthProjection,
} from '../../../types';
import { formatINR } from '../../../utils/formatters';
import { AddLifeEventModal } from './AddLifeEventModal';

interface WealthForecastingViewProps {
  initialParams: WealthForecastParams;
  financialSummary: FinancialSummary;
  accounts: Account[];
  onSaveParams: (params: WealthForecastParams) => void;
}

export const WealthForecastingView: React.FC<WealthForecastingViewProps> = ({
  initialParams,
  financialSummary,
  accounts,
  onSaveParams,
}) => {
  // Model state
  const [params, setParams] = useState<WealthForecastParams>(initialParams);
  const [scenarioMode, setScenarioMode] = useState<'conservative' | 'baseline' | 'optimistic'>('baseline');
  const [selectedHorizonYears, setSelectedHorizonYears] = useState<number>(params.simulationYears || 15);
  const [isLifeEventModalOpen, setIsLifeEventModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'table' | 'fire'>('chart');

  // Compute live projections
  const forecastData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const projections: YearlyWealthProjection[] = [];

    // Scenario return modifiers
    const returnModifier =
      scenarioMode === 'optimistic' ? 2.5 : scenarioMode === 'conservative' ? -2.5 : 0;
    const equityCAGR = (params.expectedEquityReturnRate + returnModifier) / 100;
    const debtCAGR = (params.expectedDebtReturnRate + (returnModifier > 0 ? 0.5 : -0.5)) / 100;
    const blendedReturnRate =
      equityCAGR * (params.portfolioEquityAllocationPercent / 100) +
      debtCAGR * (1 - params.portfolioEquityAllocationPercent / 100);

    const incomeGrowthRate = params.annualIncomeGrowthRate / 100;
    const inflationRate = params.annualExpenseInflationRate / 100;

    let currentInvestments =
      params.currentInvestments || financialSummary.totalInvestments || 500000;
    let currentLiquid =
      params.currentLiquidAssets || financialSummary.totalBalance || 100000;
    let liabilitiesRemaining =
      params.currentTotalLiabilities || financialSummary.totalLiabilities || 0;

    let monthlyIncome = params.monthlyNetIncome || 95000;
    let monthlyExpense = params.monthlyExpenses || 42000;
    let monthlyInvest = params.monthlyInvestmentContribution || 30000;

    let totalInvestedPrincipal = currentInvestments;
    let fireYear: number | undefined = undefined;

    const startAge = params.currentAge || 29;

    for (let yr = 1; yr <= selectedHorizonYears; yr++) {
      const calYear = currentYear + yr;
      const age = startAge + yr;

      // Annual salary hike
      monthlyIncome = monthlyIncome * (1 + incomeGrowthRate);
      // Annual expense inflation
      monthlyExpense = monthlyExpense * (1 + inflationRate);
      // Scale monthly investments with salary growth
      monthlyInvest = monthlyInvest * (1 + incomeGrowthRate * 0.8);

      const annualIncome = monthlyIncome * 12;
      const annualExpenses = monthlyExpense * 12;
      const annualInvested = monthlyInvest * 12;
      totalInvestedPrincipal += annualInvested;

      // Compound growth on existing corpus + newly invested capital mid-year
      currentInvestments =
        currentInvestments * (1 + blendedReturnRate) + annualInvested * (1 + blendedReturnRate / 2);

      // Process Life Events occurring in this year
      params.lifeEvents.forEach((ev) => {
        if (ev.yearOffset === yr) {
          if (ev.type === 'expense') {
            currentInvestments = Math.max(0, currentInvestments + ev.amount); // negative
          } else if (ev.type === 'windfall') {
            currentInvestments += ev.amount;
          } else if (ev.type === 'income_boost') {
            currentInvestments += ev.amount * 12;
          }
        }
      });

      // Liabilities amortize and decrease over time
      liabilitiesRemaining = Math.max(0, liabilitiesRemaining * 0.82);

      // Net Worth Calculations
      const netWorthNominal = currentInvestments + currentLiquid - liabilitiesRemaining;
      const inflationDiscountFactor = Math.pow(1 + inflationRate, yr);
      const netWorthReal = netWorthNominal / inflationDiscountFactor;
      const investmentCorpusReal = currentInvestments / inflationDiscountFactor;

      // Safe Withdrawal Rate (4% Rule) for Financial Independence
      const passiveIncomeAnnual = currentInvestments * 0.04;
      const passiveIncomeMonthly = passiveIncomeAnnual / 12;
      const financialIndependenceScore =
        annualExpenses > 0 ? (passiveIncomeAnnual / annualExpenses) * 100 : 0;
      const isFireAchieved = financialIndependenceScore >= 100;

      if (isFireAchieved && !fireYear) {
        fireYear = calYear;
      }

      projections.push({
        year: yr,
        calendarYear: calYear,
        age,
        annualIncome,
        annualExpenses,
        annualSavings: annualIncome - annualExpenses,
        investmentCorpusNominal: currentInvestments,
        investmentCorpusReal,
        liabilitiesRemaining,
        netWorthNominal,
        netWorthReal,
        passiveIncomeAnnual,
        passiveIncomeMonthly,
        financialIndependenceScore,
        isFireAchieved,
      });
    }

    const finalProjection = projections[projections.length - 1];

    return {
      projections,
      finalNetWorthNominal: finalProjection?.netWorthNominal || 0,
      finalNetWorthReal: finalProjection?.netWorthReal || 0,
      fireYear,
      totalInvestedPrincipal,
      totalCompoundedInterestEarned: Math.max(
        0,
        (finalProjection?.investmentCorpusNominal || 0) - totalInvestedPrincipal
      ),
      blendedReturnRatePercent: (blendedReturnRate * 100).toFixed(1),
    };
  }, [params, scenarioMode, selectedHorizonYears, financialSummary]);

  const handleUpdateParam = <K extends keyof WealthForecastParams>(
    key: K,
    value: WealthForecastParams[K]
  ) => {
    const updated = { ...params, [key]: value };
    setParams(updated);
    onSaveParams(updated);
  };

  const handleAddLifeEvent = (event: LifeEventImpact) => {
    const updatedEvents = [...params.lifeEvents, event];
    handleUpdateParam('lifeEvents', updatedEvents);
  };

  const handleDeleteLifeEvent = (eventId: string) => {
    const updatedEvents = params.lifeEvents.filter((e) => e.id !== eventId);
    handleUpdateParam('lifeEvents', updatedEvents);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 bg-emerald-600 transform rotate-45" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Financial Engine • Long-Term Projections
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-light text-slate-800 font-heading">
            Wealth & Net Worth Forecasting Engine
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Simulate compound asset growth, inflation purchasing power, salary increments, debt payoff trajectories, and FIRE milestone dates.
          </p>
        </div>

        {/* Scenario Selectors */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setScenarioMode('conservative')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                scenarioMode === 'conservative'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Conservative (-2.5%)
            </button>
            <button
              onClick={() => setScenarioMode('baseline')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                scenarioMode === 'baseline'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Baseline ({forecastData.blendedReturnRatePercent}%)
            </button>
            <button
              onClick={() => setScenarioMode('optimistic')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                scenarioMode === 'optimistic'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Optimistic (+2.5%)
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Impact KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Projected Nominal Net Worth */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {selectedHorizonYears}-Yr Nominal Net Worth
          </span>
          <div className="mt-2">
            <h3 className="text-2xl font-light text-slate-900 font-heading text-indigo-600">
              {formatINR(forecastData.finalNetWorthNominal)}
            </h3>
            <p className="mt-1 text-[11px] text-slate-500">
              At Age {(params.currentAge || 29) + selectedHorizonYears} in Year{' '}
              {new Date().getFullYear() + selectedHorizonYears}
            </p>
          </div>
        </div>

        {/* 2. Inflation Adjusted Real Wealth */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Inflation-Adjusted (Today's ₹)
          </span>
          <div className="mt-2">
            <h3 className="text-2xl font-light text-slate-900 font-heading text-emerald-700">
              {formatINR(forecastData.finalNetWorthReal)}
            </h3>
            <p className="mt-1 text-[11px] text-slate-500">
              Real purchasing power at {params.annualExpenseInflationRate}% inflation
            </p>
          </div>
        </div>

        {/* 3. Compound Returns vs Principal */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Compounded Wealth Multiplier
          </span>
          <div className="mt-2">
            <h3 className="text-2xl font-light text-slate-900 font-heading text-amber-700">
              {formatINR(forecastData.totalCompoundedInterestEarned)}
            </h3>
            <p className="mt-1 text-[11px] text-slate-500">
              Free capital created by compounding returns
            </p>
          </div>
        </div>

        {/* 4. Financial Independence (FIRE) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Financial Independence Target
          </span>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-light text-slate-900 font-heading text-rose-600">
                {forecastData.fireYear ? `Year ${forecastData.fireYear}` : 'Target > 30 Yrs'}
              </h3>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {forecastData.fireYear
                ? `Passive income replaces 100% of living expenses!`
                : 'Increase monthly SIP to accelerate FIRE'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls Sliders + Right Projections Table/Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Simulation Sliders (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Forecast Assumptions
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400">Live Calibration</span>
            </div>

            {/* Time Horizon */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Simulation Horizon</span>
                <span className="text-indigo-600">{selectedHorizonYears} Years</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 15, 25].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => {
                      setSelectedHorizonYears(yr);
                      handleUpdateParam('simulationYears', yr);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedHorizonYears === yr
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {yr} Yrs
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Net Income */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Monthly Net Income</span>
                <span className="font-bold text-slate-900">{formatINR(params.monthlyNetIncome)}</span>
              </div>
              <input
                type="range"
                min="30000"
                max="500000"
                step="5000"
                value={params.monthlyNetIncome}
                onChange={(e) => handleUpdateParam('monthlyNetIncome', Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Monthly SIP Contribution */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Monthly SIP / Investments</span>
                <span className="font-bold text-emerald-600">
                  {formatINR(params.monthlyInvestmentContribution)}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="300000"
                step="2500"
                value={params.monthlyInvestmentContribution}
                onChange={(e) =>
                  handleUpdateParam('monthlyInvestmentContribution', Number(e.target.value))
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Asset Allocation: Equity vs Debt */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Asset Split: Equity vs Debt</span>
                <span className="font-bold text-slate-900">
                  {params.portfolioEquityAllocationPercent}% Eq / {100 - params.portfolioEquityAllocationPercent}% Debt
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={params.portfolioEquityAllocationPercent}
                onChange={(e) =>
                  handleUpdateParam('portfolioEquityAllocationPercent', Number(e.target.value))
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Conservative (20% Eq)</span>
                <span>Aggressive (100% Eq)</span>
              </div>
            </div>

            {/* Expected Returns */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Equity CAGR (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={params.expectedEquityReturnRate}
                  onChange={(e) =>
                    handleUpdateParam('expectedEquityReturnRate', Number(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Inflation Rate (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={params.annualExpenseInflationRate}
                  onChange={(e) =>
                    handleUpdateParam('annualExpenseInflationRate', Number(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Injected Life Events Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Future Life Events ({params.lifeEvents.length})
                </h4>
              </div>
              <button
                onClick={() => setIsLifeEventModalOpen(true)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                + Inject Event
              </button>
            </div>

            <div className="space-y-2">
              {params.lifeEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{ev.title}</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                        Year +{ev.yearOffset} ({new Date().getFullYear() + ev.yearOffset})
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-0.5 block ${
                        ev.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {ev.amount >= 0 ? `+${formatINR(ev.amount)}` : formatINR(ev.amount)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteLifeEvent(ev.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Projection Curve & Detailed Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Year-by-Year Wealth Trajectory
                </h3>
                <p className="text-xs text-slate-500">
                  Nominal Corpus vs Inflation-Discounted Real Net Worth & FIRE progress
                </p>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('chart')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'chart'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Visual Trajectory
                </button>
                <button
                  onClick={() => setActiveTab('table')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'table'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Detailed Table
                </button>
              </div>
            </div>

            {/* View: Visual Step Curves */}
            {activeTab === 'chart' && (
              <div className="mt-5 space-y-4">
                <div className="space-y-2.5">
                  {forecastData.projections.map((p, idx) => {
                    const maxVal = forecastData.finalNetWorthNominal || 1;
                    const nominalWidth = Math.min(100, (p.netWorthNominal / maxVal) * 100);
                    const realWidth = Math.min(100, (p.netWorthReal / maxVal) * 100);

                    return (
                      <div key={p.year} className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs">
                        <div className="flex items-center justify-between font-semibold text-slate-800 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-indigo-700">Yr {p.year}</span>
                            <span className="text-slate-400">({p.calendarYear} • Age {p.age})</span>
                            {p.isFireAchieved && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">
                                FIRE Reached 🎯
                              </span>
                            )}
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <span className="font-extrabold text-slate-900">{formatINR(p.netWorthNominal)}</span>
                            <span className="text-slate-400 text-[11px]">Real: {formatINR(p.netWorthReal)}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                              style={{ width: `${Math.max(4, nominalWidth)}%` }}
                              title={`Nominal: ${formatINR(p.netWorthNominal)}`}
                            />
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                              style={{ width: `${Math.max(4, realWidth)}%` }}
                              title={`Inflation-Adjusted: ${formatINR(p.netWorthReal)}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-indigo-600" />
                      <span>Nominal Net Worth</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-emerald-500" />
                      <span>Inflation-Adjusted Purchasing Power</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View: Detailed Breakdown Table */}
            {activeTab === 'table' && (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                      <th className="py-2.5 px-3">Year / Age</th>
                      <th className="py-2.5 px-3">Annual Income</th>
                      <th className="py-2.5 px-3">Expenses</th>
                      <th className="py-2.5 px-3">Investment Corpus</th>
                      <th className="py-2.5 px-3">Nominal Net Worth</th>
                      <th className="py-2.5 px-3">Real Wealth</th>
                      <th className="py-2.5 px-3">Passive Mo.</th>
                      <th className="py-2.5 px-3">FIRE %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {forecastData.projections.map((p) => (
                      <tr key={p.year} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {p.calendarYear} <span className="text-slate-400 font-normal">({p.age})</span>
                        </td>
                        <td className="py-2 px-3">{formatINR(p.annualIncome)}</td>
                        <td className="py-2 px-3 text-slate-500">{formatINR(p.annualExpenses)}</td>
                        <td className="py-2 px-3 font-semibold text-indigo-700">
                          {formatINR(p.investmentCorpusNominal)}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {formatINR(p.netWorthNominal)}
                        </td>
                        <td className="py-2 px-3 text-emerald-700 font-semibold">
                          {formatINR(p.netWorthReal)}
                        </td>
                        <td className="py-2 px-3 font-bold text-amber-700">
                          {formatINR(p.passiveIncomeMonthly)}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              p.isFireAchieved
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.financialIndependenceScore.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddLifeEventModal
        isOpen={isLifeEventModalOpen}
        onClose={() => setIsLifeEventModalOpen(false)}
        onAddEvent={handleAddLifeEvent}
      />
    </div>
  );
};
