import React, { useState, useMemo } from 'react';
import { Loan, LoanType } from '../../types';
import { formatINR } from '../../utils/formatters';
import {
  Landmark,
  Plus,
  Calendar,
  Clock,
  TrendingDown,
  PieChart,
  Home,
  Car,
  Laptop,
  Briefcase,
  Coins,
  ShieldCheck,
  Calculator,
  ArrowUpRight,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
} from 'lucide-react';

interface LoansEngineProps {
  loans: Loan[];
  onAddLoan: () => void;
  onEditLoan: (loan: Loan) => void;
  onDeleteLoan: (loanId: string) => void;
  onOpenAmortization: (loan: Loan) => void;
  onPayEmi: (loan: Loan) => void;
}

export const LoansEngine: React.FC<LoansEngineProps> = ({
  loans,
  onAddLoan,
  onEditLoan,
  onDeleteLoan,
  onOpenAmortization,
  onPayEmi,
}) => {
  const [typeFilter, setTypeFilter] = useState<LoanType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Aggregated Loan Metrics
  const totalSanctioned = useMemo(() => {
    return loans.reduce((sum, l) => sum + (Number(l.principalAmount) || 0), 0);
  }, [loans]);

  const totalOutstanding = useMemo(() => {
    return loans
      .filter((l) => l.status === 'active')
      .reduce((sum, l) => sum + (Number(l.outstandingPrincipal) || 0), 0);
  }, [loans]);

  const totalMonthlyEmi = useMemo(() => {
    return loans
      .filter((l) => l.status === 'active')
      .reduce((sum, l) => sum + (Number(l.monthlyEmi) || 0), 0);
  }, [loans]);

  const totalPrepayments = useMemo(() => {
    return loans.reduce((sum, l) => sum + (l.prepaymentTotal || 0), 0);
  }, [loans]);

  // Filtered Loans
  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      if (typeFilter !== 'all' && loan.loanType !== typeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = loan.name.toLowerCase().includes(q);
        const matchesLender = loan.lenderName.toLowerCase().includes(q);
        const matchesAcc = loan.accountNumber?.toLowerCase().includes(q);
        if (!matchesName && !matchesLender && !matchesAcc) return false;
      }

      return true;
    });
  }, [loans, typeFilter, searchQuery]);

  const getLoanIcon = (type: LoanType) => {
    switch (type) {
      case 'home':
        return <Home className="h-4 w-4 text-indigo-600" />;
      case 'car':
        return <Car className="h-4 w-4 text-sky-600" />;
      case 'consumer_emi':
        return <Laptop className="h-4 w-4 text-emerald-600" />;
      case 'business':
        return <Briefcase className="h-4 w-4 text-amber-600" />;
      case 'gold':
        return <Coins className="h-4 w-4 text-amber-500" />;
      default:
        return <Landmark className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Loan Metrics & Monthly EMI Burden */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Total Outstanding Principal */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Outstanding Principal
            </span>
            <span className="p-1 rounded-md bg-rose-50 text-rose-600">
              <TrendingDown className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 font-heading">
            {formatINR(totalOutstanding)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Sanctioned: {formatINR(totalSanctioned)}
          </p>
        </div>

        {/* Metric 2: Monthly EMI Obligation */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total Monthly EMI
            </span>
            <span className="p-1 rounded-md bg-indigo-50 text-indigo-600">
              <Calendar className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-indigo-700 font-heading">
            {formatINR(totalMonthlyEmi)}
            <span className="text-xs font-normal text-slate-500">/mo</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {loans.filter((l) => l.status === 'active').length} active loans
          </p>
        </div>

        {/* Metric 3: Debt Repayment Progress */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Repaid Principal
            </span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700 font-heading">
            {formatINR(Math.max(0, totalSanctioned - totalOutstanding))}
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{
                width: `${
                  totalSanctioned > 0
                    ? Math.round(((totalSanctioned - totalOutstanding) / totalSanctioned) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Metric 4: Prepayments Made */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total Prepayments
            </span>
            <span className="p-1 rounded-md bg-amber-50 text-amber-600">
              <Coins className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-800 font-heading">
            {formatINR(totalPrepayments)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Saved compound interest
          </p>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search loans, lenders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-48 sm:w-56"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            {(['all', 'home', 'car', 'consumer_emi', 'personal'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  typeFilter === t
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t === 'all'
                  ? 'All Loans'
                  : t === 'consumer_emi'
                  ? '0% EMIs'
                  : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Add Loan Button */}
        <button
          onClick={onAddLoan}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider shadow-2xs transition-all active:scale-98"
        >
          <Plus className="h-4 w-4" />
          <span>+ Add Loan / EMI</span>
        </button>
      </div>

      {/* Loans Grid */}
      {filteredLoans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLoans.map((loan) => {
            const principal = Number(loan.principalAmount) || 1;
            const outstanding = Number(loan.outstandingPrincipal) || 0;
            const repaidPercent = Math.min(
              100,
              Math.round(((principal - outstanding) / principal) * 100)
            );
            const tenureProgress =
              loan.tenureMonths > 0
                ? Math.min(
                    100,
                    Math.round((loan.tenureCompletedMonths / loan.tenureMonths) * 100)
                  )
                : 0;

            return (
              <div
                key={loan.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-slate-100">
                        {getLoanIcon(loan.loanType)}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                          {loan.lenderName}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 font-heading">
                          {loan.name}
                        </h4>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {loan.interestRatePercent}% {loan.interestType}
                    </span>
                  </div>

                  {loan.accountNumber && (
                    <p className="text-[10px] font-mono text-slate-400 mt-1 pl-1">
                      A/c: {loan.accountNumber}
                    </p>
                  )}
                </div>

                {/* Principal Numbers */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                      Outstanding
                    </span>
                    <span className="text-base font-bold text-slate-900 font-heading">
                      {formatINR(outstanding)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                      Sanctioned
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {formatINR(principal)}
                    </span>
                  </div>
                </div>

                {/* Tenure & Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>
                      Tenure: <strong>{loan.tenureCompletedMonths}</strong> / {loan.tenureMonths} mos
                    </span>
                    <span className="font-bold text-indigo-600">{tenureProgress}% done</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all"
                      style={{ width: `${tenureProgress}%` }}
                    />
                  </div>
                </div>

                {/* Monthly EMI & Due Date */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50/50 border border-indigo-100/60 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-600 block">
                      Monthly EMI
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatINR(loan.monthlyEmi)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                      Due Day
                    </span>
                    <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {loan.emiDueDay}th of month
                    </span>
                  </div>
                </div>

                {/* Prepayments if any */}
                {loan.prepaymentTotal ? (
                  <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>Prepaid {formatINR(loan.prepaymentTotal)} so far</span>
                  </div>
                ) : null}

                {/* Action Controls */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditLoan(loan)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Edit loan"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteLoan(loan.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete loan"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenAmortization(loan)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors"
                      title="Amortization & Prepayment Simulator"
                    >
                      <Calculator className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Simulator</span>
                    </button>

                    <button
                      onClick={() => onPayEmi(loan)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
                    >
                      <span>Pay EMI</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
          <Landmark className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No Loans Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery || typeFilter !== 'all'
              ? 'No loans match your search or filter.'
              : 'Add your home loans, car loans, personal loans, or 0% consumer EMIs to track payoff timelines and interest savings.'}
          </p>
          <button
            onClick={onAddLoan}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-colors"
          >
            + Add Your First Loan
          </button>
        </div>
      )}
    </div>
  );
};
