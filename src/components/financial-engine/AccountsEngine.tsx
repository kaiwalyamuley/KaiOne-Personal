import React, { useState, useMemo } from 'react';
import { Account, AccountType, Transaction } from '../../types';
import { formatINR } from '../../utils/formatters';
import {
  Building2,
  Wallet,
  Coins,
  TrendingUp,
  Plus,
  ArrowRightLeft,
  Search,
  Landmark,
  ShieldCheck,
  Edit2,
  Trash2,
  CreditCard,
  Percent,
} from 'lucide-react';

interface AccountsEngineProps {
  accounts: Account[];
  balances: Record<string, number>;
  transactions: Transaction[];
  onAddAccount: () => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
  onQuickTransfer: (fromAccId?: string) => void;
  onFilterTransactionsByAccount?: (accountId: string) => void;
}

export const AccountsEngine: React.FC<AccountsEngineProps> = ({
  accounts,
  balances,
  transactions,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  onQuickTransfer,
  onFilterTransactionsByAccount,
}) => {
  const [typeFilter, setTypeFilter] = useState<AccountType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Aggregated totals
  const totalLiquid = useMemo(() => {
    return accounts
      .filter((a) => a.type === 'bank' || a.type === 'cash' || a.type === 'wallet')
      .reduce((sum, a) => sum + (balances[a.id] || 0), 0);
  }, [accounts, balances]);

  const totalInvestments = useMemo(() => {
    return accounts
      .filter((a) => a.type === 'investment')
      .reduce((sum, a) => sum + (balances[a.id] || 0), 0);
  }, [accounts, balances]);

  const totalAllAccounts = useMemo(() => {
    return accounts.reduce((sum, a) => sum + (balances[a.id] || 0), 0);
  }, [accounts, balances]);

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      if (typeFilter !== 'all' && acc.type !== typeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = acc.name.toLowerCase().includes(q);
        const matchesBank = acc.bankName?.toLowerCase().includes(q);
        const matchesAccNo = acc.accountNumberLast4?.includes(q);
        if (!matchesName && !matchesBank && !matchesAccNo) return false;
      }

      return true;
    });
  }, [accounts, typeFilter, searchQuery]);

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return <Building2 className="h-4 w-4 text-sky-600" />;
      case 'cash':
        return <Coins className="h-4 w-4 text-emerald-600" />;
      case 'investment':
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case 'credit_card':
        return <CreditCard className="h-4 w-4 text-amber-600" />;
      default:
        return <Wallet className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Aggregates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Liquid Funds */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Liquid Cash & Bank
            </span>
            <span className="p-1 rounded-md bg-sky-50 text-sky-600">
              <Building2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 font-heading">
            {formatINR(totalLiquid)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Savings, Salary & Pocket Cash
          </p>
        </div>

        {/* Total Demat / Investments */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Demat & Holdings
            </span>
            <span className="p-1 rounded-md bg-purple-50 text-purple-600">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-700 font-heading">
            {formatINR(totalInvestments)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Stocks, SIPs & Gold Bonds
          </p>
        </div>

        {/* Total Asset Value */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total Managed Assets
            </span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700 font-heading">
            {formatINR(totalAllAccounts)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {accounts.length} linked accounts
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
              placeholder="Search accounts, banks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-48 sm:w-56"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            {(['all', 'bank', 'cash', 'investment'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  typeFilter === t
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t === 'all'
                  ? 'All'
                  : t === 'bank'
                  ? 'Banks'
                  : t === 'cash'
                  ? 'Cash'
                  : 'Investments'}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQuickTransfer()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider shadow-2xs transition-colors"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-indigo-600" />
            <span>Self Transfer</span>
          </button>

          <button
            onClick={onAddAccount}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider shadow-2xs transition-all active:scale-98"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Account</span>
          </button>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map((acc) => {
          const bal = balances[acc.id] !== undefined ? balances[acc.id] : acc.initialBalance;
          const isNegative = bal < 0;

          // Count transactions in this account
          const txCount = transactions.filter(
            (t) => t.accountFromId === acc.id || t.accountToId === acc.id
          ).length;

          return (
            <div
              key={acc.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md transition-all space-y-4"
            >
              {/* Top Details */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: `${acc.color || '#4f46e5'}15` }}
                    >
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-slate-900 font-heading">
                          {acc.name}
                        </h4>
                        {acc.isDefault && (
                          <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                            Primary
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                        {acc.bankName || acc.type.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {acc.accountNumberLast4 && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      •• {acc.accountNumberLast4}
                    </span>
                  )}
                </div>

                {acc.notes && (
                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-1 italic">
                    "{acc.notes}"
                  </p>
                )}
              </div>

              {/* Balance Display */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                  Available Balance
                </span>
                <span
                  className={`text-xl font-bold font-heading ${
                    isNegative ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {formatINR(bal)}
                </span>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>Initial: {formatINR(acc.initialBalance || 0)}</span>
                  <span>{txCount} Transactions</span>
                </div>
              </div>

              {/* Interest Rate & IFSC if available */}
              {(acc.interestRate || acc.ifscCode) && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  {acc.interestRate && (
                    <span className="flex items-center gap-1 font-medium text-indigo-700">
                      <Percent className="h-3 w-3 text-indigo-500" />
                      <span>{acc.interestRate}% p.a.</span>
                    </span>
                  )}
                  {acc.ifscCode && (
                    <span className="text-[10px] font-mono text-slate-400">
                      IFSC: {acc.ifscCode}
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditAccount(acc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Edit account"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteAccount(acc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete account"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onQuickTransfer(acc.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
                  >
                    <ArrowRightLeft className="h-3 w-3" />
                    <span>Transfer</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
