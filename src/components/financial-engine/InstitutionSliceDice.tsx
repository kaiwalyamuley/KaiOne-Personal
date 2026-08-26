import React, { useMemo } from 'react';
import { Account, CreditCard, InstitutionSlice, Loan } from '../../types';
import { formatINR } from '../../utils/formatters';
import { calculateInstitutionSlices } from '../../utils/storage';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CreditCard as CardIcon,
  Landmark,
  Wallet,
  ArrowRight,
} from 'lucide-react';

interface InstitutionSliceDiceProps {
  accounts: Account[];
  creditCards: CreditCard[];
  loans: Loan[];
  balances: Record<string, number>;
  onSelectAccount?: (account: Account) => void;
  onSelectCard?: (card: CreditCard) => void;
  onSelectLoan?: (loan: Loan) => void;
}

export const InstitutionSliceDice: React.FC<InstitutionSliceDiceProps> = ({
  accounts,
  creditCards,
  loans,
  balances,
  onSelectAccount,
  onSelectCard,
  onSelectLoan,
}) => {
  const slices: InstitutionSlice[] = useMemo(() => {
    return calculateInstitutionSlices(accounts, creditCards, loans, balances);
  }, [accounts, creditCards, loans, balances]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Institution-wise Financial Slice & Dice
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidated exposure, total assets vs liabilities grouped across all your banking partners.
          </p>
        </div>
        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
          {slices.length} Financial Institutions
        </span>
      </div>

      {/* Institution Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {slices.map((slice) => {
          const isNetPositive = slice.netExposure >= 0;

          return (
            <div
              key={slice.bankName}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md transition-all space-y-4"
            >
              {/* Institution Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold font-heading shadow-xs">
                    {slice.bankName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-heading">
                      {slice.bankName}
                    </h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {slice.accounts.length} Accounts • {slice.creditCards.length} Cards • {slice.loans.length} Loans
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                    Net Exposure
                  </span>
                  <span
                    className={`text-base font-bold font-heading ${
                      isNetPositive ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {isNetPositive ? '+' : ''}
                    {formatINR(slice.netExposure)}
                  </span>
                </div>
              </div>

              {/* Assets vs Liabilities Breakdown Bar */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Assets Deposited
                  </span>
                  <span className="text-sm font-bold text-emerald-700 font-heading flex items-center gap-1 mt-0.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    {formatINR(slice.totalAssetValue)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Dues & Loans
                  </span>
                  <span className="text-sm font-bold text-rose-700 font-heading flex items-center justify-end gap-1 mt-0.5">
                    <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
                    {formatINR(slice.totalLiabilityValue)}
                  </span>
                </div>
              </div>

              {/* Linked Products Nested List */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                {/* Accounts */}
                {slice.accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-sky-600" />
                      <span className="font-semibold text-slate-800">{acc.name}</span>
                      {acc.accountNumberLast4 && (
                        <span className="text-[10px] font-mono text-slate-400">
                          (••{acc.accountNumberLast4})
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-slate-900">
                      {formatINR(balances[acc.id] !== undefined ? balances[acc.id] : acc.initialBalance)}
                    </span>
                  </div>
                ))}

                {/* Credit Cards */}
                {slice.creditCards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CardIcon className="h-3.5 w-3.5 text-amber-600" />
                      <span className="font-semibold text-slate-800">{card.name}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        ({card.cardNetwork})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-600 block">
                        Due: {formatINR(card.currentOutstanding)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Loans */}
                {slice.loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Landmark className="h-3.5 w-3.5 text-indigo-600" />
                      <span className="font-semibold text-slate-800">{loan.name}</span>
                      <span className="text-[10px] text-indigo-600 font-bold">
                        ({loan.interestRatePercent}%)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-600 block">
                        {formatINR(loan.outstandingPrincipal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
