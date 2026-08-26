import React, { useState, useMemo } from 'react';
import {
  Account,
  CreditCard,
  FinancialSummary,
  InstitutionSlice,
  Loan,
  Transaction,
  TransactionType,
} from '../../types';
import { formatINR } from '../../utils/formatters';
import { AccountsEngine } from './AccountsEngine';
import { CreditCardsEngine } from './CreditCardsEngine';
import { LoansEngine } from './LoansEngine';
import { InstitutionSliceDice } from './InstitutionSliceDice';
import { AmortizationModal } from './AmortizationModal';
import { AddEditCardModal } from './AddEditCardModal';
import { AddEditLoanModal } from './AddEditLoanModal';
import { AddEditAccountModal } from './AddEditAccountModal';
import {
  Layers,
  Building2,
  CreditCard as CardIcon,
  Landmark,
  PieChart,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  ArrowRightLeft,
  Plus,
  ArrowUpRight,
  Sparkles,
  Zap,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface FinancialEngineViewProps {
  accounts: Account[];
  creditCards: CreditCard[];
  loans: Loan[];
  transactions: Transaction[];
  balances: Record<string, number>;
  summary: FinancialSummary;
  onSaveAccount: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
  onSaveCreditCard: (card: CreditCard) => void;
  onDeleteCreditCard: (cardId: string) => void;
  onSaveLoan: (loan: Loan) => void;
  onDeleteLoan: (loanId: string) => void;
  onOpenLogTx: (type: TransactionType, defaultAccFrom?: string, defaultAccTo?: string, defaultCategory?: string, defaultAmt?: number, defaultDesc?: string) => void;
}

export type EngineSubTab = 'overview' | 'accounts' | 'cards' | 'loans' | 'institutions';

export const FinancialEngineView: React.FC<FinancialEngineViewProps> = ({
  accounts,
  creditCards,
  loans,
  transactions,
  balances,
  summary,
  onSaveAccount,
  onDeleteAccount,
  onSaveCreditCard,
  onDeleteCreditCard,
  onSaveLoan,
  onDeleteLoan,
  onOpenLogTx,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<EngineSubTab>('overview');

  // Modals inside Financial Engine
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);

  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [editCard, setEditCard] = useState<CreditCard | null>(null);

  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [editLoan, setEditLoan] = useState<Loan | null>(null);

  const [isAmortizationOpen, setIsAmortizationOpen] = useState(false);
  const [selectedAmortizationLoan, setSelectedAmortizationLoan] = useState<Loan | null>(null);

  // Upcoming Bills & EMIs in next 30 days
  const upcomingObligations = useMemo(() => {
    const today = new Date().getDate();
    const items: {
      type: 'card' | 'loan';
      name: string;
      lenderOrBank: string;
      amount: number;
      dueDay: number;
      isDueSoon: boolean;
      data: CreditCard | Loan;
    }[] = [];

    // Credit Cards due
    creditCards.forEach((c) => {
      if (c.status === 'active' && c.currentOutstanding > 0) {
        const daysDiff = c.paymentDueDay >= today ? c.paymentDueDay - today : 30 - today + c.paymentDueDay;
        items.push({
          type: 'card',
          name: c.name,
          lenderOrBank: c.bankName,
          amount: c.currentOutstanding,
          dueDay: c.paymentDueDay,
          isDueSoon: daysDiff <= 7,
          data: c,
        });
      }
    });

    // Loans EMI due
    loans.forEach((l) => {
      if (l.status === 'active') {
        const daysDiff = l.emiDueDay >= today ? l.emiDueDay - today : 30 - today + l.emiDueDay;
        items.push({
          type: 'loan',
          name: l.name,
          lenderOrBank: l.lenderName,
          amount: l.monthlyEmi,
          dueDay: l.emiDueDay,
          isDueSoon: daysDiff <= 7,
          data: l,
        });
      }
    });

    // Sort by soonest due day
    items.sort((a, b) => {
      const diffA = a.dueDay >= today ? a.dueDay - today : 30 - today + a.dueDay;
      const diffB = b.dueDay >= today ? b.dueDay - today : 30 - today + b.dueDay;
      return diffA - diffB;
    });

    return items;
  }, [creditCards, loans]);

  // Handlers for quick card/loan payments
  const handlePayCardBill = (card: CreditCard) => {
    onOpenLogTx(
      'transfer',
      card.linkedAccountId || accounts[0]?.id,
      card.id,
      'Self Account Transfer',
      card.currentOutstanding,
      `Credit Card Bill Payment for ${card.name} (•••• ${card.cardNumberLast4})`
    );
  };

  const handleLogCardSpend = (card: CreditCard) => {
    onOpenLogTx(
      'expense',
      card.id,
      undefined,
      'Shopping & Electronics',
      undefined,
      `Card spend on ${card.name}`
    );
  };

  const handlePayLoanEmi = (loan: Loan) => {
    onOpenLogTx(
      'expense',
      loan.linkedAccountId || accounts[0]?.id,
      undefined,
      'Bills & Utilities',
      loan.monthlyEmi,
      `Monthly EMI for ${loan.name} (${loan.lenderName})`
    );
  };

  const handlePrepaymentTransaction = (loan: Loan, prepayAmt: number) => {
    onOpenLogTx(
      'expense',
      loan.linkedAccountId || accounts[0]?.id,
      undefined,
      'Bills & Utilities',
      prepayAmt,
      `Part Prepayment on ${loan.name} principal`
    );
  };

  const handleOpenAmortization = (loan: Loan) => {
    setSelectedAmortizationLoan(loan);
    setIsAmortizationOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Geometric Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 bg-indigo-600 transform rotate-45" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Financial Engine • Multi-Asset & Debt Management
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-light text-slate-800 font-heading">
            Accounts, Cards & Loans Engine
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Slice and dice your liquid bank balances, credit card limits, active loan obligations, and institutional banking exposure.
          </p>
        </div>

        {/* Quick Engine Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="engine-btn-add-account"
            onClick={() => {
              setEditAccount(null);
              setIsAddAccountOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider shadow-2xs transition-colors"
          >
            <Building2 className="h-3.5 w-3.5 text-sky-600" />
            <span>+ Bank / Account</span>
          </button>

          <button
            id="engine-btn-add-card"
            onClick={() => {
              setEditCard(null);
              setIsAddCardOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider shadow-2xs transition-colors"
          >
            <CardIcon className="h-3.5 w-3.5 text-amber-600" />
            <span>+ Card</span>
          </button>

          <button
            id="engine-btn-add-loan"
            onClick={() => {
              setEditLoan(null);
              setIsAddLoanOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider shadow-2xs transition-colors"
          >
            <Landmark className="h-3.5 w-3.5 text-indigo-600" />
            <span>+ Loan</span>
          </button>

          <button
            id="engine-btn-transfer"
            onClick={() => onOpenLogTx('transfer')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>Transfer</span>
          </button>
        </div>
      </div>

      {/* Sub-Engine Navigation Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto scrollbar-none pb-px text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PieChart className="h-4 w-4" />
          <span>Overview & Slice/Dice</span>
        </button>

        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'accounts'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Bank Accounts & Cash ({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cards')}
          className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'cards'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CardIcon className="h-4 w-4" />
          <span>Credit Cards Engine ({creditCards.length})</span>
          {summary.totalCreditCardOutstanding > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-800 font-bold">
              {formatINR(summary.totalCreditCardOutstanding)}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('loans')}
          className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'loans'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Landmark className="h-4 w-4" />
          <span>Loans & EMIs Engine ({loans.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('institutions')}
          className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'institutions'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Bank Explorer</span>
        </button>
      </div>

      {/* Sub-Tab 1: Overview & Master Slice / Dice */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Master Net Worth & Health Scorecard Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Total Net Worth Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Calculated Net Worth
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Live Score
                  </span>
                </div>
                <h3 className="text-3xl font-light text-slate-900 font-heading mt-2">
                  {formatINR(summary.netWorthEstimate)}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Total Assets ({formatINR(summary.totalAssets)}) minus Liabilities ({formatINR(summary.totalLiabilities)})
                </p>
              </div>

              {/* Assets vs Liabilities Quick Bar */}
              <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                    <span>Assets (Banks + Demat + Receivables)</span>
                  </span>
                  <strong className="text-slate-900">{formatINR(summary.totalAssets)}</strong>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
                    <span>Liabilities (CC Dues + Loans + Payables)</span>
                  </span>
                  <strong className="text-rose-700">{formatINR(summary.totalLiabilities)}</strong>
                </div>
              </div>
            </div>

            {/* Middle: Credit & Debt Health Indicators */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Credit & Debt Health Index
                </span>
                <div className="mt-4 space-y-4">
                  {/* Metric A: Credit Card Utilization */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">CC Utilization</span>
                      <strong
                        className={`font-bold ${
                          summary.creditUtilizationPercent <= 30
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {Math.round(summary.creditUtilizationPercent)}% (Limit: {formatINR(summary.totalCreditLimit)})
                      </strong>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          summary.creditUtilizationPercent > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, summary.creditUtilizationPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Metric B: Monthly Debt Service / EMI Burden */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">Monthly EMI Obligation</span>
                      <strong className="text-indigo-700 font-bold">
                        {formatINR(summary.totalMonthlyEmiObligation)}/mo
                      </strong>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Across {loans.filter((l) => l.status === 'active').length} active loan accounts
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Maintaining CC utilization below 30% boosts CIBIL / Experian credit scores.</span>
              </div>
            </div>

            {/* Right: Upcoming 30-Day Dues & Timeline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Upcoming Due Dates (30 Days)
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {upcomingObligations.length} Due
                </span>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-48 pr-1">
                {upcomingObligations.length > 0 ? (
                  upcomingObligations.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {item.type === 'card' ? (
                          <CardIcon className="h-3.5 w-3.5 text-amber-600" />
                        ) : (
                          <Landmark className="h-3.5 w-3.5 text-indigo-600" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-slate-400">Due on {item.dueDay}th</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-slate-900 block">
                          {formatINR(item.amount)}
                        </span>
                        <button
                          onClick={() => {
                            if (item.type === 'card') handlePayCardBill(item.data as CreditCard);
                            else handlePayLoanEmi(item.data as Loan);
                          }}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline"
                        >
                          Pay Now
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No credit card dues or upcoming loan EMIs detected.
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
                <span>Total Due this cycle:</span>
                <strong className="text-slate-900">
                  {formatINR(
                    upcomingObligations.reduce((sum, item) => sum + item.amount, 0)
                  )}
                </strong>
              </div>
            </div>
          </div>

          {/* Quick Engine Jump Cards (3 Bento Boxes) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Accounts */}
            <div
              onClick={() => setActiveSubTab('accounts')}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 group-hover:scale-105 transition-transform">
                  <Building2 className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-heading">
                Bank Accounts & Wallets
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {accounts.length} accounts configured • Total Balance: {formatINR(summary.totalBalance)}
              </p>
            </div>

            {/* Box 2: Credit Cards */}
            <div
              onClick={() => setActiveSubTab('cards')}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
                  <CardIcon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-heading">
                Credit Cards Engine
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {creditCards.length} cards active • Total Dues: {formatINR(summary.totalCreditCardOutstanding)}
              </p>
            </div>

            {/* Box 3: Loans */}
            <div
              onClick={() => setActiveSubTab('loans')}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
                  <Landmark className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-heading">
                Loans & EMIs Engine
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {loans.length} active loans • Outstanding: {formatINR(summary.totalLoanOutstanding)}
              </p>
            </div>
          </div>

          {/* Institution Slices Preview */}
          <InstitutionSliceDice
            accounts={accounts}
            creditCards={creditCards}
            loans={loans}
            balances={balances}
          />
        </div>
      )}

      {/* Sub-Tab 2: Accounts Engine */}
      {activeSubTab === 'accounts' && (
        <AccountsEngine
          accounts={accounts}
          balances={balances}
          transactions={transactions}
          onAddAccount={() => {
            setEditAccount(null);
            setIsAddAccountOpen(true);
          }}
          onEditAccount={(acc) => {
            setEditAccount(acc);
            setIsAddAccountOpen(true);
          }}
          onDeleteAccount={onDeleteAccount}
          onQuickTransfer={(fromAccId) => onOpenLogTx('transfer', fromAccId)}
        />
      )}

      {/* Sub-Tab 3: Credit Cards Engine */}
      {activeSubTab === 'cards' && (
        <CreditCardsEngine
          creditCards={creditCards}
          onAddCard={() => {
            setEditCard(null);
            setIsAddCardOpen(true);
          }}
          onEditCard={(card) => {
            setEditCard(card);
            setIsAddCardOpen(true);
          }}
          onDeleteCard={onDeleteCreditCard}
          onPayBill={handlePayCardBill}
          onLogSpend={handleLogCardSpend}
        />
      )}

      {/* Sub-Tab 4: Loans & EMIs Engine */}
      {activeSubTab === 'loans' && (
        <LoansEngine
          loans={loans}
          onAddLoan={() => {
            setEditLoan(null);
            setIsAddLoanOpen(true);
          }}
          onEditLoan={(loan) => {
            setEditLoan(loan);
            setIsAddLoanOpen(true);
          }}
          onDeleteLoan={onDeleteLoan}
          onOpenAmortization={handleOpenAmortization}
          onPayEmi={handlePayLoanEmi}
        />
      )}

      {/* Sub-Tab 5: Bank Explorer */}
      {activeSubTab === 'institutions' && (
        <InstitutionSliceDice
          accounts={accounts}
          creditCards={creditCards}
          loans={loans}
          balances={balances}
        />
      )}

      {/* Modals */}
      {/* 0. Add / Edit Bank Account / Wallet Modal */}
      <AddEditAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => {
          setIsAddAccountOpen(false);
          setEditAccount(null);
        }}
        onSave={onSaveAccount}
        onDelete={onDeleteAccount}
        editAccount={editAccount}
        existingAccounts={accounts}
      />

      {/* 1. Add / Edit Credit Card Modal */}
      <AddEditCardModal
        isOpen={isAddCardOpen}
        onClose={() => {
          setIsAddCardOpen(false);
          setEditCard(null);
        }}
        onSave={onSaveCreditCard}
        editCard={editCard}
        accounts={accounts}
      />

      {/* 2. Add / Edit Loan Modal */}
      <AddEditLoanModal
        isOpen={isAddLoanOpen}
        onClose={() => {
          setIsAddLoanOpen(false);
          setEditLoan(null);
        }}
        onSave={onSaveLoan}
        editLoan={editLoan}
        accounts={accounts}
      />

      {/* 3. Amortization & Prepayment Simulator Modal */}
      <AmortizationModal
        isOpen={isAmortizationOpen}
        onClose={() => {
          setIsAmortizationOpen(false);
          setSelectedAmortizationLoan(null);
        }}
        loan={selectedAmortizationLoan}
        onMakePrepayment={handlePrepaymentTransaction}
      />
    </div>
  );
};
