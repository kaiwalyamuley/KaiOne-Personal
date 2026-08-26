import React, { useState, useMemo } from 'react';
import { Loan } from '../../types';
import { formatINR } from '../../utils/formatters';
import { calculateAmortizationSchedule, calculatePrepaymentSavings } from '../../utils/storage';
import { X, Calculator, Calendar, PiggyBank, Clock, CheckCircle2, ChevronRight, TrendingDown } from 'lucide-react';

interface AmortizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  onMakePrepayment?: (loan: Loan, amount: number) => void;
}

export const AmortizationModal: React.FC<AmortizationModalProps> = ({
  isOpen,
  onClose,
  loan,
  onMakePrepayment,
}) => {
  const [lumpSum, setLumpSum] = useState<number>(50000);
  const [extraMonthly, setExtraMonthly] = useState<number>(2000);
  const [activeTab, setActiveTab] = useState<'schedule' | 'prepay_calc'>('prepay_calc');

  // Amortization Schedule
  const amortizationData = useMemo(() => {
    if (!loan) return null;
    return calculateAmortizationSchedule(loan);
  }, [loan]);

  // Prepayment Savings
  const savingsData = useMemo(() => {
    if (!loan) return null;
    return calculatePrepaymentSavings(
      loan.outstandingPrincipal,
      loan.interestRatePercent,
      loan.monthlyEmi,
      lumpSum,
      extraMonthly
    );
  }, [loan, lumpSum, extraMonthly]);

  if (!isOpen || !loan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                {loan.loanType.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 font-medium">• {loan.lenderName}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading mt-0.5">
              {loan.name} — Schedule & Simulator
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Loan Quick Metrics Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white border-b border-slate-100 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Principal</span>
            <span className="text-sm font-bold text-slate-800">{formatINR(loan.principalAmount)}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding</span>
            <span className="text-sm font-bold text-rose-700">{formatINR(loan.outstandingPrincipal)}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Interest Rate</span>
            <span className="text-sm font-bold text-indigo-700">{loan.interestRatePercent}% ({loan.interestType})</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly EMI</span>
            <span className="text-sm font-bold text-slate-900">{formatINR(loan.monthlyEmi)}</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-6 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('prepay_calc')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'prepay_calc'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Calculator className="h-4 w-4" />
            <span>Prepayment & Savings Simulator</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'schedule'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Yearly Amortization Schedule</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'prepay_calc' && savingsData && (
            <div className="space-y-6">
              {/* Savings Highlight Box */}
              <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/40 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    Calculated Potential Savings
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-lg border border-emerald-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total Interest You Will Save
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-emerald-700 font-heading">
                      {formatINR(savingsData.totalInterestSaved)}
                    </span>
                    <p className="text-[11px] text-emerald-600 mt-0.5">
                      Direct cash saved from compound interest!
                    </p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-lg border border-emerald-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Tenure Reduction
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-indigo-700 font-heading">
                      {savingsData.monthsSaved} Months Faster
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ({(savingsData.monthsSaved / 12).toFixed(1)} years closer to debt freedom)
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Inputs */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Simulate Prepayment Inputs
                </h4>

                {/* 1. Lump Sum Prepayment */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>One-time Lump Sum Prepayment:</span>
                    <strong className="text-indigo-600 font-bold">{formatINR(lumpSum)}</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.min(1000000, loan.outstandingPrincipal)}
                    step="10000"
                    value={lumpSum}
                    onChange={(e) => setLumpSum(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex gap-2 mt-2">
                    {[25000, 50000, 100000, 200000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setLumpSum(amt)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        +{formatINR(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Extra Monthly EMI */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Additional Monthly EMI Contribution:</span>
                    <strong className="text-indigo-600 font-bold">+{formatINR(extraMonthly)}/mo</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25000"
                    step="1000"
                    value={extraMonthly}
                    onChange={(e) => setExtraMonthly(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex gap-2 mt-2">
                    {[1000, 2500, 5000, 10000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setExtraMonthly(amt)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        +{formatINR(amt)}/mo
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              {onMakePrepayment && lumpSum > 0 && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      onMakePrepayment(loan, lumpSum);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                  >
                    <PiggyBank className="h-4 w-4" />
                    <span>Log {formatINR(lumpSum)} Prepayment Transaction</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && amortizationData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span>
                  Total Projected Interest: <strong className="text-rose-700">{formatINR(amortizationData.totalInterest)}</strong>
                </span>
                <span>
                  Total Repayment (P + I): <strong className="text-slate-900">{formatINR(amortizationData.totalPayment)}</strong>
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Year</th>
                      <th className="px-4 py-2.5">Principal Paid</th>
                      <th className="px-4 py-2.5">Interest Paid</th>
                      <th className="px-4 py-2.5">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {amortizationData.yearlySummary.map((row) => (
                      <tr key={row.year} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-2 font-bold text-slate-800">Year {row.year}</td>
                        <td className="px-4 py-2 text-emerald-700">{formatINR(Math.round(row.principalPaid))}</td>
                        <td className="px-4 py-2 text-rose-600">{formatINR(Math.round(row.interestPaid))}</td>
                        <td className="px-4 py-2 text-slate-700 font-semibold">{formatINR(Math.round(row.balance))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
