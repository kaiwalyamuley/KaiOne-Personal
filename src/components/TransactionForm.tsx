import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  ArrowRightLeft,
  PiggyBank,
  UserCheck,
  UserMinus,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Tag,
  AlignLeft,
  Building2,
  Users,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  Account,
  Category,
  PaymentMode,
  Transaction,
  TransactionType,
} from '../types';
import { getCurrentLocalDateTime, formatINR } from '../utils/formatters';
import { QUICK_PRESETS } from '../utils/defaultData';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  accounts: Account[];
  categories: Category[];
  existingTransactions: Transaction[];
  editTransaction?: Transaction | null;
  defaultType?: TransactionType;
  defaultPersonName?: string;
  onOpenAddCategory?: () => void;
  onOpenAddAccount?: () => void;
}

const TRANSACTION_TYPES: {
  type: TransactionType;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  colorClass: string;
  activeBg: string;
  description: string;
}[] = [
  {
    type: 'expense',
    label: 'Expense',
    shortLabel: 'Expense',
    icon: ArrowUpRight,
    colorClass: 'text-rose-600',
    activeBg: 'bg-rose-600 text-white shadow-xs',
    description: 'Money spent on food, bills, shopping, travel, etc.',
  },
  {
    type: 'income',
    label: 'Income',
    shortLabel: 'Income',
    icon: ArrowDownLeft,
    colorClass: 'text-emerald-600',
    activeBg: 'bg-emerald-600 text-white shadow-xs',
    description: 'Salary, freelance earnings, dividends, gifts received.',
  },
  {
    type: 'refund',
    label: 'Refund',
    shortLabel: 'Refund',
    icon: RotateCcw,
    colorClass: 'text-amber-600',
    activeBg: 'bg-amber-600 text-white shadow-xs',
    description: 'Money credited back from merchant return or failed payment.',
  },
  {
    type: 'transfer',
    label: 'Self Transfer',
    shortLabel: 'Transfer',
    icon: ArrowRightLeft,
    colorClass: 'text-blue-600',
    activeBg: 'bg-blue-600 text-white shadow-xs',
    description: 'Moving money between your own accounts, cards, or cash.',
  },
  {
    type: 'investment',
    label: 'Investment / Saving',
    shortLabel: 'Investment',
    icon: PiggyBank,
    colorClass: 'text-indigo-600',
    activeBg: 'bg-indigo-600 text-white shadow-xs',
    description: 'Mutual funds, SIPs, stocks, gold, PPF, or fixed deposits.',
  },
  {
    type: 'lend',
    label: 'Lend To (Receivable)',
    shortLabel: 'Lend To',
    icon: UserCheck,
    colorClass: 'text-violet-600',
    activeBg: 'bg-violet-600 text-white shadow-xs',
    description: 'Money given to a friend, family, or colleague that they will repay.',
  },
  {
    type: 'borrow',
    label: 'Borrowed From (Payable)',
    shortLabel: 'Borrowed',
    icon: UserMinus,
    colorClass: 'text-orange-600',
    activeBg: 'bg-orange-600 text-white shadow-xs',
    description: 'Money taken from someone that you owe back.',
  },
];

const PAYMENT_MODES: PaymentMode[] = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Cash',
  'Net Banking',
  'Auto Debit',
  'Cheque',
  'Other',
];

export const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  onSave,
  accounts,
  categories,
  existingTransactions,
  editTransaction,
  defaultType = 'expense',
  defaultPersonName,
  onOpenAddCategory,
  onOpenAddAccount,
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [dateTime, setDateTime] = useState<string>(getCurrentLocalDateTime());
  const [location, setLocation] = useState<string>('');
  const [accountFromId, setAccountFromId] = useState<string>('');
  const [accountToId, setAccountToId] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [personName, setPersonName] = useState<string>('');
  const [personPhone, setPersonPhone] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Collect unique previous locations and persons for autocomplete
  const previousLocations = Array.from(
    new Set(existingTransactions.map((t) => t.location).filter(Boolean))
  ).slice(0, 8);

  const previousPersons = Array.from(
    new Set(existingTransactions.map((t) => t.personName).filter(Boolean) as string[])
  );

  // Initialize or reset form on open / edit
  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(editTransaction.amount.toString());
      setDateTime(
        editTransaction.dateTime
          ? editTransaction.dateTime.slice(0, 16)
          : getCurrentLocalDateTime()
      );
      setLocation(editTransaction.location || '');
      setAccountFromId(editTransaction.accountFromId || '');
      setAccountToId(editTransaction.accountToId || '');
      setCategory(editTransaction.category || '');
      setSubCategory(editTransaction.subCategory || '');
      setPersonName(editTransaction.personName || '');
      setPersonPhone(editTransaction.personPhone || '');
      setDueDate(editTransaction.dueDate || '');
      setDescription(editTransaction.description || '');
      setPaymentMode(editTransaction.paymentMode || 'UPI');
      setTags(editTransaction.tags || []);
    } else {
      // Defaults for new entry
      setType(defaultType);
      setAmount('');
      setDateTime(getCurrentLocalDateTime());
      setLocation('');
      setPersonName(defaultPersonName || '');
      setPersonPhone('');
      setDueDate('');
      setDescription('');
      setPaymentMode('UPI');
      setTags([]);
      setErrorMsg('');

      // Auto pick default account
      const defaultAcc = accounts.find((a) => a.isDefault) || accounts[0];
      const secondAcc = accounts.find((a) => a.id !== defaultAcc?.id) || accounts[1] || defaultAcc;

      if (defaultType === 'income' || defaultType === 'borrow') {
        setAccountToId(defaultAcc?.id || '');
        setAccountFromId('');
      } else if (defaultType === 'transfer') {
        setAccountFromId(defaultAcc?.id || '');
        setAccountToId(secondAcc?.id || '');
      } else {
        setAccountFromId(defaultAcc?.id || '');
        setAccountToId('');
      }

      // Default category
      const matchingCats = categories.filter(
        (c) => c.type === defaultType || c.type === 'all'
      );
      if (matchingCats.length > 0) {
        setCategory(matchingCats[0].name);
        setSubCategory(matchingCats[0].subcategories?.[0] || '');
      }
    }
  }, [isOpen, editTransaction, defaultType, defaultPersonName, accounts]);

  // When type changes, adapt default categories and accounts
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setErrorMsg('');

    const defaultAcc = accounts.find((a) => a.isDefault) || accounts[0];
    const secondAcc = accounts.find((a) => a.id !== defaultAcc?.id) || accounts[1] || defaultAcc;

    if (newType === 'income' || newType === 'borrow') {
      setAccountToId(accountToId || defaultAcc?.id || '');
      setAccountFromId('');
    } else if (newType === 'refund') {
      setAccountToId(accountToId || defaultAcc?.id || '');
      setAccountFromId(accountFromId || accounts.find((a) => a.type === 'credit_card')?.id || '');
    } else if (newType === 'transfer') {
      setAccountFromId(accountFromId || defaultAcc?.id || '');
      setAccountToId(accountToId || secondAcc?.id || '');
    } else {
      setAccountFromId(accountFromId || defaultAcc?.id || '');
      setAccountToId('');
    }

    // Set category for new type
    const matchingCats = categories.filter(
      (c) => c.type === newType || c.type === 'all'
    );
    if (matchingCats.length > 0) {
      setCategory(matchingCats[0].name);
      setSubCategory(matchingCats[0].subcategories?.[0] || '');
    }
  };

  const handleCategoryChange = (catName: string) => {
    setCategory(catName);
    const catObj = categories.find((c) => c.name === catName);
    if (catObj?.subcategories && catObj.subcategories.length > 0) {
      setSubCategory(catObj.subcategories[0]);
    } else {
      setSubCategory('');
    }
  };

  const handleAddAmount = (addValue: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addValue).toString());
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const applyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setType(preset.type as TransactionType);
    setAmount(preset.amount.toString());
    setCategory(preset.category);
    setSubCategory(preset.subCategory);
    setLocation(preset.location);
    setPaymentMode(preset.paymentMode as PaymentMode);
    setDescription(`Quick log: ${preset.label}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount in INR greater than 0.');
      return;
    }

    // Validation based on type
    if (type === 'transfer') {
      if (!accountFromId || !accountToId) {
        setErrorMsg('Please select both Account From and Account To for a transfer.');
        return;
      }
      if (accountFromId === accountToId) {
        setErrorMsg('Account From and Account To cannot be the same account.');
        return;
      }
    }

    if ((type === 'expense' || type === 'investment' || type === 'lend') && !accountFromId) {
      setErrorMsg('Please select the Account From which the amount is debited.');
      return;
    }

    if ((type === 'income' || type === 'borrow') && !accountToId) {
      setErrorMsg('Please select the Account To which the amount is credited.');
      return;
    }

    if (type === 'refund' && !accountToId) {
      setErrorMsg('Please select the Account To where the refund was received.');
      return;
    }

    if ((type === 'lend' || type === 'borrow') && !personName.trim()) {
      setErrorMsg('Please specify the Person / Ledger name for this transaction.');
      return;
    }

    const payload: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
      type,
      amount: numAmount,
      dateTime: new Date(dateTime).toISOString(),
      location: location.trim(),
      accountFromId: accountFromId || undefined,
      accountToId: accountToId || undefined,
      category: category.trim() || 'General',
      subCategory: subCategory.trim() || undefined,
      personName: personName.trim() || undefined,
      personPhone: personPhone.trim() || undefined,
      dueDate: dueDate || undefined,
      description: description.trim(),
      paymentMode,
      tags: tags.length > 0 ? tags : undefined,
      status: 'completed',
    };

    onSave(payload, editTransaction?.id);
    onClose();
  };

  if (!isOpen) return null;

  const currentTypeConfig = TRANSACTION_TYPES.find((t) => t.type === type)!;
  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === 'all'
  );
  const selectedCategoryObj = categories.find((c) => c.name === category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-900/60 p-3 sm:p-4 md:p-6 backdrop-blur-xs">
      <div
        id="transaction-modal-container"
        className="relative w-full max-w-5xl xl:max-w-6xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3.5 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center shadow-xs">
              <span className="text-[11px] font-extrabold text-white font-mono">₹</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-heading">
                  {editTransaction ? 'Edit Transaction Record' : 'Daily Log Entry'}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  type === 'income' ? 'bg-emerald-100 text-emerald-800' :
                  type === 'expense' ? 'bg-rose-100 text-rose-800' :
                  type === 'transfer' ? 'bg-blue-100 text-blue-800' :
                  type === 'investment' ? 'bg-indigo-100 text-indigo-800' :
                  type === 'lend' ? 'bg-violet-100 text-violet-800' :
                  type === 'borrow' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                }`}>
                  {currentTypeConfig.shortLabel}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {currentTypeConfig.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body - Panoramic 2-Column Desktop Grid for Low Scrolling */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 flex-1 bg-white">
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Type, Amount & Presets, Category & Account */}
            <div className="lg:col-span-6 space-y-4">
              {/* 1. Transaction Type Segmented Grid Tabs */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  1. Transaction Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-1.5 p-1.5 bg-slate-100/80 rounded-xl border border-slate-200">
                  {TRANSACTION_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = type === t.type;
                    return (
                      <button
                        key={t.type}
                        type="button"
                        onClick={() => handleTypeChange(t.type)}
                        className={`py-2 px-2 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs scale-[1.02]'
                            : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 bg-white/40'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{t.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Amount in INR (Hero Display) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    2. Amount (INR) <span className="text-rose-500">*</span>
                  </label>
                  {amount && (
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {formatINR(parseFloat(amount) || 0)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 border-b-2 border-slate-300 pb-1.5 focus-within:border-indigo-600 transition-colors bg-white px-3 py-1.5 rounded-lg">
                  <span className="text-3xl sm:text-4xl font-light text-slate-400 select-none">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-3xl sm:text-4xl font-bold w-full focus:outline-none text-slate-900 bg-transparent font-heading"
                    autoFocus={!editTransaction}
                  />
                  {amount && (
                    <button
                      type="button"
                      onClick={() => setAmount('')}
                      className="px-2 py-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 text-[10px] font-bold transition-colors shrink-0"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Quick Increment Adders */}
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Add:</span>
                  {[100, 500, 1000, 2000, 5000, 10000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAddAmount(val)}
                      className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-200 transition-colors cursor-pointer"
                    >
                      +₹{val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </div>

                {/* Everyday Indian Presets */}
                {!editTransaction && (
                  <div className="pt-1.5 border-t border-slate-200/80">
                    <div className="flex items-center gap-1 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      <span>One-Tap Indian Presets</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {QUICK_PRESETS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applyPreset(p)}
                          className="px-2 py-0.5 rounded bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 text-[10px] font-medium border border-slate-200 transition-colors cursor-pointer"
                        >
                          {p.label} <span className="font-bold text-slate-900">₹{p.amount}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-slate-50/60 rounded-xl border border-slate-200">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    {onOpenAddCategory && (
                      <button
                        type="button"
                        onClick={onOpenAddCategory}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-indigo-600 focus:outline-none transition-colors cursor-pointer font-semibold text-slate-800"
                  >
                    {filteredCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Sub-Category / Item
                  </label>
                  {selectedCategoryObj?.subcategories && selectedCategoryObj.subcategories.length > 0 ? (
                    <select
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-indigo-600 focus:outline-none transition-colors cursor-pointer font-semibold text-slate-800"
                    >
                      <option value="">None / General</option>
                      {selectedCategoryObj.subcategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Dining out, Grocery..."
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-indigo-600 focus:outline-none transition-colors font-medium text-slate-800 placeholder:text-slate-400"
                    />
                  )}
                </div>
              </div>

              {/* 4. Accounts Selection (Dynamic based on Type) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-slate-50/60 rounded-xl border border-slate-200">
                {/* Account From */}
                {(type === 'expense' ||
                  type === 'transfer' ||
                  type === 'investment' ||
                  type === 'lend' ||
                  type === 'refund') && (
                  <div className={type === 'expense' || type === 'investment' || type === 'lend' ? 'sm:col-span-2' : ''}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Account From (Debited) <span className="text-rose-500">*</span>
                      </label>
                      {onOpenAddAccount && (
                        <button
                          type="button"
                          onClick={onOpenAddAccount}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Bank</span>
                        </button>
                      )}
                    </div>
                    <select
                      value={accountFromId}
                      onChange={(e) => setAccountFromId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-indigo-600 focus:outline-none font-semibold text-slate-800 cursor-pointer"
                    >
                      <option value="">Select Account From...</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.type.toUpperCase()}) {acc.accountNumberLast4 ? `••${acc.accountNumberLast4}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Account To */}
                {(type === 'income' ||
                  type === 'refund' ||
                  type === 'transfer' ||
                  type === 'borrow') && (
                  <div className={type === 'income' || type === 'borrow' ? 'sm:col-span-2' : ''}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Account To (Credited) <span className="text-rose-500">*</span>
                      </label>
                      {onOpenAddAccount && (
                        <button
                          type="button"
                          onClick={onOpenAddAccount}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Bank</span>
                        </button>
                      )}
                    </div>
                    <select
                      value={accountToId}
                      onChange={(e) => setAccountToId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-indigo-600 focus:outline-none font-semibold text-slate-800 cursor-pointer"
                    >
                      <option value="">Select Account To...</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.type.toUpperCase()}) {acc.accountNumberLast4 ? `••${acc.accountNumberLast4}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Date/Time, Location, Khata/Person, Payment Mode & Notes, Tags */}
            <div className="lg:col-span-6 space-y-4">
              {/* 5. Date & Time + Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-slate-50/60 rounded-xl border border-slate-200">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Date & Time <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setDateTime(getCurrentLocalDateTime())}
                      className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider hover:underline cursor-pointer"
                    >
                      Set Now
                    </button>
                  </div>
                  <input
                    type="datetime-local"
                    required
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-indigo-600 focus:outline-none font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Location / Merchant / Platform
                  </label>
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-600 transition-colors">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. Swiggy, Amazon, ATM"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full text-xs bg-transparent focus:outline-none font-medium text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                  {previousLocations.length > 0 && !location && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {previousLocations.slice(0, 3).map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setLocation(loc)}
                          className="text-[9px] text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded hover:bg-slate-100 cursor-pointer"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 6. Person / Khata Ledger (Receivables & Payables & Optional tagging) */}
              {(type === 'lend' || type === 'borrow' || type === 'income' || type === 'expense') && (
                <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-indigo-900 uppercase tracking-widest flex items-center gap-1">
                      <Users className="w-3 h-3 text-indigo-600" />
                      <span>Person / Khata Ledger {type === 'lend' || type === 'borrow' ? <span className="text-rose-500">*</span> : <span className="text-slate-400 text-[9px] font-normal">(Optional Tag)</span>}</span>
                    </label>
                    {type === 'lend' && <span className="text-[9px] text-violet-700 bg-violet-100 font-bold uppercase px-1.5 py-0.5 rounded">Receivable (Lent)</span>}
                    {type === 'borrow' && <span className="text-[9px] text-amber-800 bg-amber-100 font-bold uppercase px-1.5 py-0.5 rounded">Payable (Owed)</span>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Person / Company Name"
                        value={personName}
                        onChange={(e) => setPersonName(e.target.value)}
                        className="w-full bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-indigo-600 focus:outline-none text-slate-800 font-medium placeholder:text-slate-400"
                      />
                      {previousPersons.length > 0 && !personName && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-[9px] text-slate-400">Recent:</span>
                          {previousPersons.slice(0, 3).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPersonName(p)}
                              className="text-[9px] text-indigo-800 bg-white border border-indigo-200 px-1.5 py-0.5 rounded hover:bg-indigo-100 cursor-pointer font-medium"
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Phone / WhatsApp Contact"
                        value={personPhone}
                        onChange={(e) => setPersonPhone(e.target.value)}
                        className="w-full bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-indigo-600 focus:outline-none text-slate-800 font-medium placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {(type === 'lend' || type === 'borrow') && (
                    <div className="pt-1">
                      <label className="block text-[10px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
                        Expected Settlement Due Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-indigo-600 focus:outline-none text-slate-800 font-medium"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 7. Payment Mode & Description/Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-3.5 bg-slate-50/60 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-indigo-600 focus:outline-none cursor-pointer font-semibold text-slate-800"
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Description / Specific Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Specific item notes, purpose, receipt details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-indigo-600 focus:outline-none font-medium text-slate-800 placeholder:text-slate-400 italic"
                  />
                </div>
              </div>

              {/* 8. Tags */}
              <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <Tag className="h-3 w-3 text-slate-400" />
                  <span>Custom Tags (Press Enter)</span>
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-slate-200 bg-white min-h-[38px]">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-semibold border border-indigo-200"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="text-indigo-400 hover:text-indigo-700 cursor-pointer ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={tags.length === 0 ? "Add tags e.g. 'TaxSaver', 'Vacation'..." : "Add tag..."}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="flex-1 min-w-[120px] text-xs text-slate-800 bg-transparent border-none outline-none focus:ring-0 p-0.5"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Bottom Bar */}
        <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-200 shrink-0">
          <div className="text-xs text-slate-600 font-medium flex items-center gap-2">
            {amount ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Total Value:</span>
                <span className="text-slate-900 font-extrabold text-base font-heading">
                  {formatINR(parseFloat(amount) || 0)}
                </span>
                <span className="text-slate-400 text-xs">({type.toUpperCase()})</span>
              </div>
            ) : (
              <span className="text-slate-500">Enter amount and details to record</span>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-indigo-700 transition-all active:scale-98 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editTransaction ? 'Update Entry' : 'Save Transaction'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
