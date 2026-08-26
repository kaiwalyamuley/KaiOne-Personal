import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  ArrowRightLeft,
  PiggyBank,
  UserCheck,
  UserMinus,
  MapPin,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Tag,
  CreditCard,
  ChevronDown,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import {
  Account,
  Category,
  Transaction,
  TransactionType,
} from '../types';
import {
  formatINR,
  formatDateTime,
  getDateGroupTitle,
  formatDateOnly,
  formatTimeOnly,
} from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  activeTypeFilter: TransactionType | 'all';
  onSelectTypeFilter: (type: TransactionType | 'all') => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onDuplicate: (tx: Transaction) => void;
  onOpenNewTx: () => void;
  onQuickSettle: (tx: Transaction) => void;
  onOpenRecurring?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  accounts,
  categories,
  activeTypeFilter,
  onSelectTypeFilter,
  onEdit,
  onDelete,
  onDuplicate,
  onOpenNewTx,
  onQuickSettle,
  onOpenRecurring,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPerson, setSelectedPerson] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this_week' | 'this_month'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const accountsMap = useMemo(() => {
    return new Map(accounts.map((a) => [a.id, a]));
  }, [accounts]);

  const uniquePersons = useMemo(() => {
    return Array.from(
      new Set(transactions.map((t) => t.personName).filter(Boolean) as string[])
    );
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type Filter
      if (activeTypeFilter !== 'all' && tx.type !== activeTypeFilter) {
        return false;
      }

      // Account Filter
      if (selectedAccountId !== 'all') {
        if (
          tx.accountFromId !== selectedAccountId &&
          tx.accountToId !== selectedAccountId
        ) {
          return false;
        }
      }

      // Category Filter
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
        return false;
      }

      // Person Filter
      if (selectedPerson !== 'all' && tx.personName !== selectedPerson) {
        return false;
      }

      // Date Range Filter
      if (dateFilter !== 'all') {
        const txDate = new Date(tx.dateTime);
        const now = new Date();

        if (dateFilter === 'today') {
          const isToday =
            txDate.getDate() === now.getDate() &&
            txDate.getMonth() === now.getMonth() &&
            txDate.getFullYear() === now.getFullYear();
          if (!isToday) return false;
        } else if (dateFilter === 'this_week') {
          const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
          if (txDate < oneWeekAgo) return false;
        } else if (dateFilter === 'this_month') {
          const isThisMonth =
            txDate.getMonth() === now.getMonth() &&
            txDate.getFullYear() === now.getFullYear();
          if (!isThisMonth) return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNote = tx.description?.toLowerCase().includes(q);
        const matchCat = tx.category?.toLowerCase().includes(q);
        const matchSubCat = tx.subCategory?.toLowerCase().includes(q);
        const matchLoc = tx.location?.toLowerCase().includes(q);
        const matchPerson = tx.personName?.toLowerCase().includes(q);
        const matchAmt = tx.amount.toString().includes(q);
        const matchTags = tx.tags?.some((t) => t.toLowerCase().includes(q));

        if (!matchNote && !matchCat && !matchSubCat && !matchLoc && !matchPerson && !matchAmt && !matchTags) {
          return false;
        }
      }

      return true;
    });
  }, [
    transactions,
    activeTypeFilter,
    selectedAccountId,
    selectedCategory,
    selectedPerson,
    dateFilter,
    searchQuery,
  ]);

  // Sort
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      }
      if (sortBy === 'highest') {
        return b.amount - a.amount;
      }
      if (sortBy === 'lowest') {
        return a.amount - b.amount;
      }
      return 0;
    });
  }, [filteredTransactions, sortBy]);

  // Group by Date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    sortedTransactions.forEach((tx) => {
      const groupKey = getDateGroupTitle(tx.dateTime);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(tx);
    });
    return groups;
  }, [sortedTransactions]);

  const getTypeBadge = (type: TransactionType) => {
    switch (type) {
      case 'expense':
        return {
          label: 'Expense',
          icon: ArrowUpRight,
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          amountClass: 'text-rose-600 font-bold',
          prefix: '-',
        };
      case 'income':
        return {
          label: 'Income',
          icon: ArrowDownLeft,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          amountClass: 'text-emerald-700 font-bold',
          prefix: '+',
        };
      case 'refund':
        return {
          label: 'Refund',
          icon: RotateCcw,
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          amountClass: 'text-amber-700 font-bold',
          prefix: '+',
        };
      case 'transfer':
        return {
          label: 'Self Transfer',
          icon: ArrowRightLeft,
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          amountClass: 'text-indigo-700 font-bold',
          prefix: '⇄ ',
        };
      case 'investment':
        return {
          label: 'Investment',
          icon: PiggyBank,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          amountClass: 'text-blue-700 font-bold',
          prefix: '',
        };
      case 'lend':
        return {
          label: 'Lent (Receivable)',
          icon: UserCheck,
          bg: 'bg-violet-50 text-violet-700 border-violet-200',
          amountClass: 'text-violet-700 font-bold',
          prefix: '→ ',
        };
      case 'borrow':
        return {
          label: 'Borrowed (Payable)',
          icon: UserMinus,
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          amountClass: 'text-orange-700 font-bold',
          prefix: '← ',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Search & Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        {/* Top Row: Search & Action */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by notes, category, location, person, amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold uppercase"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="this_week">Past 7 Days</option>
              <option value="this_month">This Month</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Row: Type Pills */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto no-scrollbar scroll-smooth">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1.5 flex items-center gap-1 shrink-0">
            <Filter className="h-3 w-3" /> Type:
          </span>
          {[
            { key: 'all', label: 'All Logs' },
            { key: 'expense', label: 'Expenses' },
            { key: 'income', label: 'Incomes' },
            { key: 'refund', label: 'Refunds' },
            { key: 'transfer', label: 'Self Transfers' },
            { key: 'investment', label: 'Investments' },
            { key: 'lend', label: 'Lend To' },
            { key: 'borrow', label: 'Borrowed' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => onSelectTypeFilter(item.key as any)}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all uppercase tracking-wider shrink-0 cursor-pointer active:scale-95 ${
                activeTypeFilter === item.key
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Advanced Filters: Account, Category, Person */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Account Filter */}
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-1 px-2 text-xs font-medium text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="all">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-1 px-2 text-xs font-medium text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Person Filter */}
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-1 px-2 text-xs font-medium text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="all">All Persons / Ledgers</option>
              {uniquePersons.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Quick Status */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-900 font-bold">{sortedTransactions.length}</strong> transactions
        </span>
        {(searchQuery || activeTypeFilter !== 'all' || selectedAccountId !== 'all' || selectedCategory !== 'all' || selectedPerson !== 'all' || dateFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              onSelectTypeFilter('all');
              setSelectedAccountId('all');
              setSelectedCategory('all');
              setSelectedPerson('all');
              setDateFilter('all');
            }}
            className="text-indigo-600 font-bold uppercase tracking-wider hover:underline text-[10px]"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Transaction List Groups */}
      {sortedTransactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-slate-500">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900 font-heading">
            No transactions found
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || activeTypeFilter !== 'all'
              ? 'Try changing your search term or clearing active filters.'
              : 'Start by logging your daily income, expense, self transfer, refund, or lend/borrow transaction.'}
          </p>
          <div className="mt-4">
            <button
              onClick={onOpenNewTx}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-xs hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Log First Entry in INR</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.entries(groupedTransactions) as [string, Transaction[]][]).map(([dateGroup, items]) => (
            <div key={dateGroup} className="space-y-2">
              {/* Group Heading with Subtotal */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 font-heading">
                  {dateGroup}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {items.length} {items.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              {/* Transaction Cards List */}
              <div className="space-y-2">
                {items.map((tx) => {
                  const badge = getTypeBadge(tx.type);
                  const Icon = badge.icon;
                  const accFrom = tx.accountFromId ? accountsMap.get(tx.accountFromId) : null;
                  const accTo = tx.accountToId ? accountsMap.get(tx.accountToId) : null;

                  return (
                    <div
                      key={tx.id}
                      className="group relative rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Left: Icon & Core Details */}
                        <div className="flex items-start gap-3.5 min-w-0">
                          {/* Type Icon Badge */}
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${badge.bg}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          {/* Content */}
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 font-heading">
                                {tx.category}
                              </span>
                              {tx.subCategory && (
                                <span className="text-[11px] text-slate-500 font-medium">
                                  • {tx.subCategory}
                                </span>
                              )}
                              <span
                                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${badge.bg}`}
                              >
                                {badge.label}
                              </span>
                            </div>

                            {/* Description / Notes */}
                            {tx.description && (
                              <p className="text-xs text-slate-700 line-clamp-1 font-medium">
                                {tx.description}
                              </p>
                            )}

                            {/* Metadata Chips (Location, Account flow, Person, Payment Mode) */}
                            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-slate-500">
                              {/* Location */}
                              {tx.location && (
                                <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                  <MapPin className="h-3 w-3 text-slate-400" />
                                  <span>{tx.location}</span>
                                </span>
                              )}

                              {/* Account Flow */}
                              {tx.type === 'transfer' ? (
                                <span className="flex items-center gap-1 font-semibold text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                  <span>{accFrom?.name || 'Account'}</span>
                                  <span>➔</span>
                                  <span>{accTo?.name || 'Account'}</span>
                                </span>
                              ) : (
                                <>
                                  {accFrom && (
                                    <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                      <Building2 className="h-3 w-3 text-slate-400" />
                                      <span>From: {accFrom.name}</span>
                                    </span>
                                  )}
                                  {accTo && (
                                    <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                      <Building2 className="h-3 w-3 text-emerald-500" />
                                      <span>To: {accTo.name}</span>
                                    </span>
                                  )}
                                </>
                              )}

                              {/* Person / Ledger */}
                              {tx.personName && (
                                <span className="flex items-center gap-1 font-bold text-violet-800 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-200">
                                  <Users className="h-3 w-3 text-violet-600" />
                                  <span>{tx.personName}</span>
                                </span>
                              )}

                              {/* Payment Mode */}
                              {tx.paymentMode && (
                                <span className="text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                                  {tx.paymentMode}
                                </span>
                              )}

                              {/* Recurring Transaction Badge */}
                              {tx.recurringRuleId && (
                                <span
                                  onClick={() => onOpenRecurring && onOpenRecurring()}
                                  className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded cursor-pointer hover:bg-indigo-100"
                                  title="Generated by automated Recurring Rule (Click to manage)"
                                >
                                  ⚡ Recurring
                                </span>
                              )}

                              {/* Time */}
                              <span className="text-slate-400 text-[10px] font-medium">
                                {formatTimeOnly(tx.dateTime)}
                              </span>
                            </div>

                            {/* Tags */}
                            {tx.tags && tx.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {tx.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Formatted INR Amount & Quick Action Controls */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <div className={`text-base sm:text-lg font-heading ${badge.amountClass}`}>
                            {badge.prefix}
                            {formatINR(tx.amount)}
                          </div>

                          {/* Action Buttons: Edit, Delete, Duplicate, Settle */}
                          <div className="flex items-center gap-1 opacity-100 transition-opacity">
                            {/* Quick Settle for Lend/Borrow */}
                            {(tx.type === 'lend' || tx.type === 'borrow') && tx.personName && (
                              <button
                                onClick={() => onQuickSettle(tx)}
                                title={`Record repayment from/to ${tx.personName}`}
                                className="px-2 py-1 rounded bg-violet-100 hover:bg-violet-200 text-violet-800 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                Settle
                              </button>
                            )}

                            <button
                              onClick={() => onDuplicate(tx)}
                              title="Duplicate transaction"
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => onEdit(tx)}
                              title="Edit transaction details"
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => setTxToDelete(tx)}
                              title="Delete transaction"
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* IN-APP DELETE TRANSACTION CONFIRMATION MODAL */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Delete Transaction?
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-2">
              Are you sure you want to delete this {txToDelete.type} entry of{' '}
              <strong className="text-slate-800">₹{formatINR(txToDelete.amount)}</strong> for{' '}
              <strong className="text-slate-800">{txToDelete.category}</strong>?
            </p>
            <p className="text-[11px] text-slate-400 mb-5">
              Account balances will automatically recalculate.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setTxToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(txToDelete.id);
                  setTxToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
