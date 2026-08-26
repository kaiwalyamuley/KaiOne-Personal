import React, { useState, useMemo } from 'react';
import {
  RefreshCw,
  Plus,
  Play,
  Pause,
  StopCircle,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Wallet,
  Building2,
  Tag,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowRightLeft,
  Search,
  Filter,
  Layers,
  History,
  X,
  Zap,
} from 'lucide-react';
import {
  Account,
  Category,
  PaymentMode,
  RecurringRule,
  RecurrenceInterval,
  Transaction,
  TransactionType,
} from '../../types';
import { formatINR, formatDateTime } from '../../utils/formatters';
import {
  getTodayYMD,
  getRecurrenceDescription,
  calculateRecurringSummary,
  calculateNextOccurrence,
} from '../../utils/recurringEngine';

interface RecurringTransactionsViewProps {
  rules: RecurringRule[];
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  onSaveRule: (rule: Omit<RecurringRule, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  onDeleteRule: (id: string) => void;
  onToggleRuleStatus: (id: string, newStatus: 'active' | 'paused' | 'stopped') => void;
  onExecuteRuleNow: (rule: RecurringRule) => void;
  onProcessAllDueRules: () => void;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
}

const RECURRING_PRESETS = [
  {
    title: 'House Rent',
    type: 'expense' as const,
    amount: 25000,
    interval: 'monthly' as const,
    dayOfMonth: 1,
    category: 'Rent & Housing',
    subCategory: 'House Rent',
    paymentMode: 'Net Banking' as const,
    description: 'Monthly Apartment Rent Transfer',
  },
  {
    title: 'Monthly Salary Credit',
    type: 'income' as const,
    amount: 95000,
    interval: 'monthly' as const,
    dayOfMonth: 1,
    category: 'Salary / Monthly Pay',
    subCategory: 'Fixed Pay',
    paymentMode: 'Net Banking' as const,
    description: 'Corporate Monthly Salary Direct Credit',
  },
  {
    title: 'Index Fund SIP (Nifty 50)',
    type: 'investment' as const,
    amount: 10000,
    interval: 'monthly' as const,
    dayOfMonth: 10,
    category: 'Mutual Funds / SIP',
    subCategory: 'Index Fund',
    paymentMode: 'Auto Debit' as const,
    description: 'Automated Monthly Index Fund SIP',
  },
  {
    title: 'Netflix 4K Premium',
    type: 'expense' as const,
    amount: 649,
    interval: 'monthly' as const,
    dayOfMonth: 15,
    category: 'Entertainment & OTT',
    subCategory: 'Netflix/Prime',
    paymentMode: 'Credit Card' as const,
    description: 'Netflix Monthly Ultra HD Subscription',
  },
  {
    title: 'Jio Fiber / Airtel Broadband',
    type: 'expense' as const,
    amount: 1179,
    interval: 'monthly' as const,
    dayOfMonth: 5,
    category: 'Bills & Utilities',
    subCategory: 'Mobile/Broadband',
    paymentMode: 'Auto Debit' as const,
    description: 'High-speed Fiber Broadband Monthly Bill',
  },
  {
    title: 'Gym & Fitness Membership',
    type: 'expense' as const,
    amount: 3000,
    interval: 'monthly' as const,
    dayOfMonth: 1,
    category: 'Personal Care & Grooming',
    subCategory: 'Gym/Fitness',
    paymentMode: 'UPI' as const,
    description: 'Monthly Gym Training Fee',
  },
  {
    title: 'Amazon Prime Annual',
    type: 'expense' as const,
    amount: 1499,
    interval: 'yearly' as const,
    dayOfMonth: 15,
    category: 'Entertainment & OTT',
    subCategory: 'Netflix/Prime',
    paymentMode: 'Credit Card' as const,
    description: 'Amazon Prime Yearly Membership & Fast Delivery',
  },
];

export const RecurringTransactionsView: React.FC<RecurringTransactionsViewProps> = ({
  rules,
  accounts,
  categories,
  transactions,
  onSaveRule,
  onDeleteRule,
  onToggleRuleStatus,
  onExecuteRuleNow,
  onProcessAllDueRules,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'stopped'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [intervalFilter, setIntervalFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<RecurringRule | null>(null);
  const [viewHistoryRule, setViewHistoryRule] = useState<RecurringRule | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState<string>('');
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formInterval, setFormInterval] = useState<RecurrenceInterval>('monthly');
  const [formIntervalCount, setFormIntervalCount] = useState<number>(1);
  const [formDayOfMonth, setFormDayOfMonth] = useState<number>(1);
  const [formDayOfWeek, setFormDayOfWeek] = useState<number>(1);
  const [formStartDate, setFormStartDate] = useState<string>(getTodayYMD());
  const [formEndDate, setFormEndDate] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('');
  const [formSubCategory, setFormSubCategory] = useState<string>('');
  const [formAccountFromId, setFormAccountFromId] = useState<string>('');
  const [formAccountToId, setFormAccountToId] = useState<string>('');
  const [formPaymentMode, setFormPaymentMode] = useState<PaymentMode>('Auto Debit');
  const [formLocation, setFormLocation] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formAutoGenerate, setFormAutoGenerate] = useState<boolean>(true);
  const [formError, setFormError] = useState<string>('');

  const todayStr = getTodayYMD();

  // Summary Metrics
  const summary = useMemo(() => calculateRecurringSummary(rules), [rules]);

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (intervalFilter !== 'all' && r.interval !== intervalFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchCat = r.category.toLowerCase().includes(q);
        const matchDesc = r.description?.toLowerCase().includes(q);
        const matchLoc = r.location?.toLowerCase().includes(q);
        const matchAmt = r.amount.toString().includes(q);
        if (!matchTitle && !matchCat && !matchDesc && !matchLoc && !matchAmt) return false;
      }
      return true;
    });
  }, [rules, statusFilter, typeFilter, intervalFilter, searchQuery]);

  // Accounts Map for quick lookup
  const accountsMap = useMemo(() => {
    const map = new Map<string, Account>();
    accounts.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  // Open Form for New / Edit
  const handleOpenAdd = (preset?: typeof RECURRING_PRESETS[0]) => {
    setEditingRule(null);
    setFormError('');

    const defaultAcc = accounts.find((a) => a.isDefault) || accounts[0];
    const secondAcc = accounts.find((a) => a.id !== defaultAcc?.id) || accounts[1] || defaultAcc;

    if (preset) {
      setFormTitle(preset.title);
      setFormType(preset.type);
      setFormAmount(preset.amount.toString());
      setFormInterval(preset.interval);
      setFormIntervalCount(1);
      setFormDayOfMonth(preset.dayOfMonth || 1);
      setFormDayOfWeek(1);
      setFormStartDate(todayStr);
      setFormEndDate('');
      setFormCategory(preset.category);
      setFormSubCategory(preset.subCategory || '');
      setFormPaymentMode(preset.paymentMode || 'Auto Debit');
      setFormLocation(preset.title);
      setFormDescription(preset.description || '');
      setFormAutoGenerate(true);

      if (preset.type === 'income') {
        setFormAccountToId(defaultAcc?.id || '');
        setFormAccountFromId('');
      } else {
        setFormAccountFromId(defaultAcc?.id || '');
        setFormAccountToId('');
      }
    } else {
      setFormTitle('');
      setFormType('expense');
      setFormAmount('');
      setFormInterval('monthly');
      setFormIntervalCount(1);
      setFormDayOfMonth(new Date().getDate());
      setFormDayOfWeek(1);
      setFormStartDate(todayStr);
      setFormEndDate('');
      setFormPaymentMode('Auto Debit');
      setFormLocation('');
      setFormDescription('');
      setFormAutoGenerate(true);

      const matchingCats = categories.filter((c) => c.type === 'expense' || c.type === 'all');
      if (matchingCats.length > 0) {
        setFormCategory(matchingCats[0].name);
        setFormSubCategory(matchingCats[0].subcategories?.[0] || '');
      } else {
        setFormCategory('General');
        setFormSubCategory('');
      }

      setFormAccountFromId(defaultAcc?.id || '');
      setFormAccountToId('');
    }

    setIsFormOpen(true);
  };

  const handleOpenEdit = (rule: RecurringRule) => {
    setEditingRule(rule);
    setFormError('');
    setFormTitle(rule.title);
    setFormType(rule.type);
    setFormAmount(rule.amount.toString());
    setFormInterval(rule.interval);
    setFormIntervalCount(rule.intervalCount || 1);
    setFormDayOfMonth(rule.dayOfMonth || 1);
    setFormDayOfWeek(typeof rule.dayOfWeek === 'number' ? rule.dayOfWeek : 1);
    setFormStartDate(rule.startDate || todayStr);
    setFormEndDate(rule.endDate || '');
    setFormCategory(rule.category);
    setFormSubCategory(rule.subCategory || '');
    setFormAccountFromId(rule.accountFromId || '');
    setFormAccountToId(rule.accountToId || '');
    setFormPaymentMode(rule.paymentMode || 'Auto Debit');
    setFormLocation(rule.location || '');
    setFormDescription(rule.description || '');
    setFormAutoGenerate(rule.autoGenerate ?? true);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(formAmount);

    if (!formTitle.trim()) {
      setFormError('Please enter a descriptive title for this recurring rule.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid recurring amount greater than ₹0.');
      return;
    }
    if (formType === 'transfer' && (!formAccountFromId || !formAccountToId)) {
      setFormError('Please select both Account From and Account To for recurring transfers.');
      return;
    }
    if (formType !== 'income' && !formAccountFromId) {
      setFormError('Please select the Account From which this rule is debited.');
      return;
    }
    if (formType === 'income' && !formAccountToId) {
      setFormError('Please select the Account To which this income is credited.');
      return;
    }

    // Compute next execution date
    const nextDate = editingRule
      ? editingRule.nextExecutionDate
      : calculateNextOccurrence(
          formStartDate,
          formInterval,
          formIntervalCount,
          formInterval === 'monthly' ? formDayOfMonth : undefined,
          formInterval === 'weekly' ? formDayOfWeek : undefined
        );

    const payload: Omit<RecurringRule, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formTitle.trim(),
      type: formType,
      amount: numAmount,
      interval: formInterval,
      intervalCount: formIntervalCount || 1,
      dayOfMonth: formInterval === 'monthly' ? formDayOfMonth : undefined,
      dayOfWeek: formInterval === 'weekly' ? formDayOfWeek : undefined,
      startDate: formStartDate,
      endDate: formEndDate.trim() || undefined,
      nextExecutionDate: nextDate,
      category: formCategory.trim() || 'General',
      subCategory: formSubCategory.trim() || undefined,
      accountFromId: formAccountFromId || undefined,
      accountToId: formAccountToId || undefined,
      paymentMode: formPaymentMode,
      location: formLocation.trim() || formTitle.trim(),
      description: formDescription.trim() || undefined,
      status: editingRule ? editingRule.status : 'active',
      autoGenerate: formAutoGenerate,
      totalTimesGenerated: editingRule ? editingRule.totalTimesGenerated : 0,
      totalAmountGenerated: editingRule ? editingRule.totalAmountGenerated : 0,
      lastGeneratedDate: editingRule ? editingRule.lastGeneratedDate : undefined,
    };

    onSaveRule(payload, editingRule?.id);
    setIsFormOpen(false);
    setSuccessMessage(
      editingRule
        ? `Updated recurring rule: "${formTitle}"`
        : `Successfully scheduled recurring rule: "${formTitle}"`
    );
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleExecuteNow = (rule: RecurringRule) => {
    onExecuteRuleNow(rule);
    setSuccessMessage(`⚡ Executed "${rule.title}" (₹${formatINR(rule.amount)}) & logged transaction.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Find transactions generated by a specific rule
  const ruleTransactions = useMemo(() => {
    if (!viewHistoryRule) return [];
    return transactions.filter((t) => t.recurringRuleId === viewHistoryRule.id);
  }, [transactions, viewHistoryRule]);

  return (
    <div className="space-y-6">
      {/* 1. TOP HERO SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Rules Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Rules
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {summary.activeCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              of {summary.totalRules} total
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{summary.pausedCount} Paused</span>
            <span>•</span>
            <span>{summary.stoppedCount} Stopped</span>
          </div>
        </div>

        {/* Monthly Recurring Expenses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Monthly Outflow
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-rose-600 font-mono">
              {formatINR(summary.totalMonthlyExpense)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Rent, utilities, OTT, bills & subs
          </div>
        </div>

        {/* Monthly Recurring Income */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Monthly Inflow
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-indigo-700 font-mono">
              {formatINR(summary.totalMonthlyIncome)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Salary, rentals & fixed dividends
          </div>
        </div>

        {/* Action / Due Radar */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Schedule Radar
              </span>
              {summary.dueTodayCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider animate-pulse">
                  {summary.dueTodayCount} Due Now
                </span>
              )}
            </div>
            <div className="mt-2">
              <span className="text-lg font-bold text-white">
                {summary.dueTodayCount > 0
                  ? `${summary.dueTodayCount} Due for Execution`
                  : summary.dueIn7DaysCount > 0
                  ? `${summary.dueIn7DaysCount} Due in Next 7 Days`
                  : 'All Schedules Up to Date'}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {summary.dueTodayCount > 0 ? (
              <button
                onClick={onProcessAllDueRules}
                className="w-full py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Process {summary.dueTodayCount} Due Today
              </button>
            ) : (
              <button
                onClick={() => handleOpenAdd()}
                className="w-full py-2 px-3 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Recurring Rule
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. CONTROLS & FILTER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, category, merchant, note, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-800 font-medium"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAdd()}
              className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Rule</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['all', 'active', 'paused', 'stopped'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Interval & Type Dropdowns */}
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="investment">Investment</option>
              <option value="transfer">Transfer</option>
            </select>

            <select
              value={intervalFilter}
              onChange={(e) => setIntervalFilter(e.target.value)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Frequencies</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. QUICK TEMPLATES / POPULAR PRESETS STRIP (WHEN FEW RULES) */}
      {rules.length < 5 && (
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Instant Presets (1-Click Setup)
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">Click to quickly add common rules</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {RECURRING_PRESETS.slice(0, 4).map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleOpenAdd(p)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                  <span>{p.title}</span>
                  <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>{formatINR(p.amount)}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {p.interval}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. MAIN RECURRING RULES LIST */}
      {filteredRules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-3">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-heading">
            No Recurring Rules Found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'No rules matched your current search and filter criteria.'
              : 'Automate your monthly rent, OTT subscriptions, SIPs, utilities, and salary credits with zero manual logging.'}
          </p>
          <button
            onClick={() => handleOpenAdd()}
            className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Recurring Rule</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule) => {
            const accFrom = rule.accountFromId ? accountsMap.get(rule.accountFromId) : null;
            const accTo = rule.accountToId ? accountsMap.get(rule.accountToId) : null;
            const isDueToday = rule.nextExecutionDate <= todayStr && rule.status === 'active';
            const cadenceText = getRecurrenceDescription(rule);

            return (
              <div
                key={rule.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between ${
                  isDueToday
                    ? 'border-indigo-400 ring-2 ring-indigo-500/10'
                    : rule.status === 'paused'
                    ? 'border-slate-200 opacity-80'
                    : rule.status === 'stopped'
                    ? 'border-slate-200 bg-slate-50/50 opacity-60'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top Row: Title, Type Badge & Status */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-slate-900 truncate font-heading">
                          {rule.title}
                        </h4>
                        <span
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            rule.type === 'expense'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : rule.type === 'income'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : rule.type === 'investment'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {rule.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {rule.category} {rule.subCategory ? `• ${rule.subCategory}` : ''}
                      </p>
                    </div>

                    {/* Formatted Amount */}
                    <div className="text-right shrink-0">
                      <span
                        className={`text-lg font-black font-mono ${
                          rule.type === 'expense'
                            ? 'text-rose-600'
                            : rule.type === 'income'
                            ? 'text-emerald-700'
                            : rule.type === 'investment'
                            ? 'text-indigo-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {rule.type === 'expense' ? '-' : '+'}
                        {formatINR(rule.amount)}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">
                        {rule.interval}
                      </span>
                    </div>
                  </div>

                  {/* Recurrence Cadence & Account Info */}
                  <div className="space-y-2 py-2.5 border-y border-slate-100 text-xs">
                    {/* Cadence */}
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="font-semibold">{cadenceText}</span>
                    </div>

                    {/* Next Run / Status Chip */}
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-500">Next Due:</span>
                        <span
                          className={`font-bold ${
                            isDueToday
                              ? 'text-indigo-600 font-mono underline'
                              : 'text-slate-800'
                          }`}
                        >
                          {rule.nextExecutionDate}
                        </span>
                        {isDueToday && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-extrabold text-[9px]">
                            DUE TODAY
                          </span>
                        )}
                      </div>

                      {/* Status pill */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          rule.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rule.status === 'paused'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {rule.status}
                      </span>
                    </div>

                    {/* Account Flow */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <Wallet className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {rule.type === 'transfer' ? (
                        <span>
                          {accFrom?.name || 'Account'} ➔ {accTo?.name || 'Account'}
                        </span>
                      ) : (
                        <span>
                          {accFrom ? `From: ${accFrom.name}` : ''}
                          {accTo ? `To: ${accTo.name}` : ''}
                          {rule.paymentMode ? ` (${rule.paymentMode})` : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rule Telemetry / Execution History Stats */}
                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Generated <strong className="text-slate-700">{rule.totalTimesGenerated || 0}</strong> times (₹{formatINR(rule.totalAmountGenerated || 0)})
                    </span>
                    {rule.autoGenerate ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Auto-Gen Active
                      </span>
                    ) : (
                      <span className="text-slate-400">Manual Approval</span>
                    )}
                  </div>
                </div>

                {/* Card Action Controls Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Left: Execute / Trigger */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleExecuteNow(rule)}
                      title="Generate this transaction immediately today"
                      className="py-1.5 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Run Now</span>
                    </button>

                    {rule.status === 'active' ? (
                      <button
                        onClick={() => onToggleRuleStatus(rule.id, 'paused')}
                        title="Pause automatic executions"
                        className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : rule.status === 'paused' ? (
                      <button
                        onClick={() => onToggleRuleStatus(rule.id, 'active')}
                        title="Resume rule"
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onToggleRuleStatus(rule.id, 'active')}
                        title="Restart stopped rule"
                        className="p-1.5 text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}

                    {rule.status !== 'stopped' && (
                      <button
                        onClick={() => onToggleRuleStatus(rule.id, 'stopped')}
                        title="Permanently stop rule"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <StopCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Right: History, Edit, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewHistoryRule(rule)}
                      title="View all transactions generated by this rule"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(rule)}
                      title="Edit recurring rule"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(rule.id)}
                      title="Delete recurring rule"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. CREATE / EDIT RULE MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600 text-white rounded-xl">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    {editingRule ? 'Edit Recurring Rule' : 'Schedule Recurring Transaction'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Automated cadence for rent, subscriptions, salary & SIPs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rule Title / Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House Rent, Netflix Premium, Monthly SIP"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-800 font-medium"
                />
              </div>

              {/* Type & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Transaction Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as TransactionType)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-800 font-semibold"
                  >
                    <option value="expense">Expense (Outflow)</option>
                    <option value="income">Income (Inflow)</option>
                    <option value="investment">Investment / SIP</option>
                    <option value="transfer">Account Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Amount (INR) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      placeholder="0.00"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-900 font-bold font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Frequency Cadence Grid */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Recurrence Schedule & Cadence <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((inv) => (
                    <button
                      key={inv}
                      type="button"
                      onClick={() => setFormInterval(inv)}
                      className={`py-1.5 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                        formInterval === inv
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {inv}
                    </button>
                  ))}
                </div>

                {/* Interval specific parameters */}
                {formInterval === 'monthly' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Day of Month (1 - 31)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formDayOfMonth}
                      onChange={(e) => setFormDayOfMonth(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
                    />
                  </div>
                )}

                {formInterval === 'weekly' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Day of Week
                    </label>
                    <select
                      value={formDayOfWeek}
                      onChange={(e) => setFormDayOfWeek(parseInt(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
                    >
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                      <option value={0}>Sunday</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Category & Payment Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      setFormCategory(e.target.value);
                      const cat = categories.find((c) => c.name === e.target.value);
                      if (cat?.subcategories && cat.subcategories.length > 0) {
                        setFormSubCategory(cat.subcategories[0]);
                      } else {
                        setFormSubCategory('');
                      }
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-800 font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={formPaymentMode}
                    onChange={(e) => setFormPaymentMode(e.target.value as PaymentMode)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-800 font-semibold"
                  >
                    <option value="Auto Debit">Auto Debit (Mandate / e-NACH)</option>
                    <option value="UPI">UPI (Autopay / Mandate)</option>
                    <option value="Credit Card">Credit Card Standing Instruction</option>
                    <option value="Net Banking">Net Banking Standing Instruction</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              {/* Account Mapping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formType !== 'income' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account From (Debited) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formAccountFromId}
                      onChange={(e) => setFormAccountFromId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-800 font-semibold"
                    >
                      <option value="">Select Account</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.bankName || acc.type})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(formType === 'income' || formType === 'transfer') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account To (Credited) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formAccountToId}
                      onChange={(e) => setFormAccountToId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-800 font-semibold"
                    >
                      <option value="">Select Account</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.bankName || acc.type})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Auto Generate Toggle */}
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-900 block">
                    ⚡ Auto-Generate on Due Date
                  </span>
                  <span className="text-[11px] text-indigo-700">
                    Automatically creates transactions when date arrives without manual clicking.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formAutoGenerate}
                  onChange={(e) => setFormAutoGenerate(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  {editingRule ? 'Save Changes' : 'Schedule Recurring Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. HISTORY OF GENERATED TRANSACTIONS MODAL */}
      {viewHistoryRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-scaleUp">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Generated History: {viewHistoryRule.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {ruleTransactions.length} transaction entries logged by this rule
                </p>
              </div>
              <button
                onClick={() => setViewHistoryRule(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-2.5 flex-1">
              {ruleTransactions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No transactions have been logged by this rule yet.
                </div>
              ) : (
                ruleTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{tx.category}</span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {formatDateTime(tx.dateTime)} • {tx.paymentMode || 'Auto Debit'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black font-mono text-slate-900">
                        {formatINR(tx.amount)}
                      </span>
                      {onEditTransaction && (
                        <button
                          onClick={() => {
                            setViewHistoryRule(null);
                            onEditTransaction(tx);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteTransaction && (
                        <button
                          onClick={() => {
                            onDeleteTransaction(tx.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setViewHistoryRule(null)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. DELETE CONFIRMATION MODAL (IN-APP DIALOG) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Delete Recurring Rule?
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              This will remove the recurrence rule. Existing logged transactions in your history will remain untouched.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteRule(deleteConfirmId);
                  setDeleteConfirmId(null);
                  setSuccessMessage('Recurring rule deleted successfully.');
                  setTimeout(() => setSuccessMessage(null), 3000);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Delete Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
