import React from 'react';
import {
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Users,
} from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import { Account, FinancialSummary, TransactionType } from '../types';
import { formatINR } from '../utils/formatters';

interface SummaryCardsProps {
  summary: FinancialSummary;
  accounts: Account[];
  balances: Record<string, number>;
  activeTypeFilter: TransactionType | 'all';
  onSelectTypeFilter: (type: TransactionType | 'all') => void;
  onOpenAccountsModal: () => void;
  onOpenLedgersModal: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  accounts,
  balances,
  activeTypeFilter,
  onSelectTypeFilter,
  onOpenAccountsModal,
  onOpenLedgersModal,
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5"
    >
      {/* 1. Total Net Liquid Balance */}
      <motion.div
        variants={cardItemVariants}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        id="card-total-balance"
        className="relative overflow-hidden rounded-2xl border border-slate-900/80 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-4 shadow-md col-span-2 sm:col-span-1 lg:col-span-1"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            Total Account Balance
          </span>
          <button
            onClick={onOpenAccountsModal}
            className="text-[11px] text-indigo-300 hover:text-white flex items-center gap-1 font-medium transition-colors px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 active:scale-95"
            title="Manage Accounts"
          >
            <Building2 className="h-3 w-3" />
            <span>{accounts.length} A/cs</span>
          </button>
        </div>

        <div className="mt-2 flex items-baseline gap-1">
          <h3 className="text-2xl font-light tracking-tight text-white font-heading">
            {formatINR(summary.totalBalance)}
          </h3>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300 border-t border-slate-800/80 pt-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Net Worth Est:</span>
          <span className="font-semibold text-emerald-400">
            {formatINR(summary.netWorthEstimate, false, true)}
          </span>
        </div>
      </motion.div>

      {/* 2. Total Incomes */}
      <motion.div
        variants={cardItemVariants}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        id="card-total-income"
        onClick={() => onSelectTypeFilter(activeTypeFilter === 'income' ? 'all' : 'income')}
        className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition-all duration-200 active:scale-98 ${
          activeTypeFilter === 'income'
            ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-sm'
            : 'border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            Total Income
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <ArrowDownLeft className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <h3 className="text-xl font-light tracking-tight text-slate-900 font-heading">
            {formatINR(summary.totalIncome)}
          </h3>
          <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-emerald-700 font-semibold">+{formatINR(summary.totalRefunds, false, true)}</span> refunds
          </p>
        </div>
      </motion.div>

      {/* 3. Total Expenses */}
      <motion.div
        variants={cardItemVariants}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        id="card-total-expense"
        onClick={() => onSelectTypeFilter(activeTypeFilter === 'expense' ? 'all' : 'expense')}
        className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition-all duration-200 active:scale-98 ${
          activeTypeFilter === 'expense'
            ? 'border-rose-500 bg-rose-50/70 ring-2 ring-rose-500/20 shadow-sm'
            : 'border-slate-200/80 bg-white hover:border-rose-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            Total Expenses
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <h3 className="text-xl font-light tracking-tight text-slate-900 font-heading">
            {formatINR(summary.totalExpense)}
          </h3>
          <p className="mt-1 text-[11px] text-slate-500">
            Outflow logged in INR
          </p>
        </div>
      </motion.div>

      {/* 4. Total Investments */}
      <motion.div
        variants={cardItemVariants}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        id="card-total-investments"
        onClick={() => onSelectTypeFilter(activeTypeFilter === 'investment' ? 'all' : 'investment')}
        className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition-all duration-200 active:scale-98 ${
          activeTypeFilter === 'investment'
            ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-sm'
            : 'border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            Investments / SIP
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <PiggyBank className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <h3 className="text-xl font-light tracking-tight text-slate-900 font-heading">
            {formatINR(summary.totalInvestments)}
          </h3>
          <p className="mt-1 text-[11px] text-slate-500">
            MFs, Stocks, PPF & Assets
          </p>
        </div>
      </motion.div>

      {/* 5. Lend & Borrow Net Khata */}
      <motion.div
        variants={cardItemVariants}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        id="card-total-lend-borrow"
        onClick={onOpenLedgersModal}
        className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all duration-200 hover:border-violet-300 hover:shadow-xs col-span-2 sm:col-span-2 lg:col-span-1 active:scale-98"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            Person Ledgers
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700">Receivable:</span>
            <div className="text-sm font-bold text-slate-900">
              {formatINR(summary.totalLentOutstanding)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-rose-700">Payable:</span>
            <div className="text-sm font-bold text-slate-900">
              {formatINR(summary.totalBorrowedOutstanding)}
            </div>
          </div>
        </div>
        <div className="mt-2 border-t border-slate-100 pt-1.5 text-right">
          <span className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold hover:underline">
            View Khata Details →
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};
