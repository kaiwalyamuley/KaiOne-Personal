import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Landmark,
  Wallet,
  CreditCard,
  TrendingUp,
  Coins,
  Check,
  Trash2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Account, AccountType } from '../../types';

interface AddEditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAccount?: (account: Account) => void;
  onSave?: (account: Account) => void;
  accountToEdit?: Account | null;
  editAccount?: Account | null;
  onDeleteAccount?: (accountId: string) => void;
  onDelete?: (accountId: string) => void;
  existingAccounts?: Account[];
}

const PRESET_BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra',
  'IndusInd Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Federal Bank',
  'Paytm Payments Bank',
  'Zerodha / Demat',
  'Cash in Hand',
];

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed', // Violet
  '#db2777', // Pink
  '#ea580c', // Orange
  '#64748b', // Slate
];

export const AddEditAccountModal: React.FC<AddEditAccountModalProps> = ({
  isOpen,
  onClose,
  onSaveAccount,
  onSave,
  accountToEdit,
  editAccount,
  onDeleteAccount,
  onDelete,
  existingAccounts = [],
}) => {
  const targetAccount = accountToEdit || editAccount;
  const handleSave = onSaveAccount || onSave || (() => {});
  const handleDeleteAction = onDeleteAccount || onDelete;

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [bankName, setBankName] = useState('');
  const [accountNumberLast4, setAccountNumberLast4] = useState('');
  const [initialBalance, setInitialBalance] = useState('0');
  const [interestRate, setInterestRate] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [isDefault, setIsDefault] = useState(false);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (targetAccount) {
      setName(targetAccount.name);
      setType(targetAccount.type);
      setBankName(targetAccount.bankName || '');
      setAccountNumberLast4(targetAccount.accountNumberLast4 || '');
      setInitialBalance(String(targetAccount.initialBalance ?? 0));
      setInterestRate(
        targetAccount.interestRate !== undefined ? String(targetAccount.interestRate) : ''
      );
      setIfscCode(targetAccount.ifscCode || '');
      setColor(targetAccount.color || '#3b82f6');
      setIsDefault(targetAccount.isDefault || false);
      setNotes(targetAccount.notes || '');
    } else {
      setName('');
      setType('bank');
      setBankName('');
      setAccountNumberLast4('');
      setInitialBalance('0');
      setInterestRate('');
      setIfscCode('');
      setColor('#3b82f6');
      setIsDefault((existingAccounts?.length ?? 0) === 0);
      setNotes('');
    }
    setErrorMsg('');
  }, [targetAccount, isOpen, existingAccounts]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Account name is required.');
      return;
    }

    const initBal = parseFloat(initialBalance) || 0;
    const rateNum = interestRate ? parseFloat(interestRate) : undefined;

    const newAccount: Account = {
      id: targetAccount?.id || `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      type,
      bankName: bankName.trim() || undefined,
      accountNumberLast4: accountNumberLast4.trim() || undefined,
      initialBalance: initBal,
      interestRate: rateNum,
      ifscCode: ifscCode.trim() || undefined,
      color,
      isDefault,
      notes: notes.trim() || undefined,
    };

    handleSave(newAccount);
    onClose();
  };

  const handleDelete = () => {
    if (!targetAccount) return;
    if ((existingAccounts?.length ?? 0) <= 1 && existingAccounts.length > 0) {
      alert('You must have at least one account in the system.');
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to remove account "${targetAccount.name}"? Transactions associated with this account will be preserved.`
      )
    ) {
      handleDeleteAction?.(targetAccount.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-3 sm:p-4 md:p-6 backdrop-blur-xs">
      <div
        id="add-edit-account-modal"
        className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-2xs font-bold"
              style={{ backgroundColor: color }}
            >
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                {accountToEdit ? 'Edit Bank Account / Wallet' : 'Add Bank Account / Wallet'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Manage account credentials, initial opening balance, and institution details
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

        {/* Form Body - Wide 2-Column Desktop Grid */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1 bg-white space-y-4">
          {errorMsg && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Core Identity & Institution */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Account Nickname *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Salary, Axis Savings, Cash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Account Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AccountType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="bank">Bank Account (Savings / Current)</option>
                  <option value="cash">Cash in Hand / Physical Wallet</option>
                  <option value="credit_card">Credit Card Line of Credit</option>
                  <option value="wallet">Digital Wallet (PayTM / Amazon Pay)</option>
                  <option value="investment">Investment / Demat Account</option>
                  <option value="other">Other Account</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Bank / Institution Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank, SBI, ICICI, Zerodha"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none font-medium text-slate-800"
                />
                {/* Quick Bank Presets */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {PRESET_BANKS.slice(0, 6).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBankName(b)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded cursor-pointer transition-colors"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Notes / Memo (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Salary branch, Minimum balance ₹10k"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none text-slate-800"
                />
              </div>
            </div>

            {/* Right Column: Balances, Numbers, IFSC & Color */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Initial Balance (₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Last 4 Digits
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 4821"
                    value={accountNumberLast4}
                    onChange={(e) => setAccountNumberLast4(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    placeholder="e.g. 3.5 or 7.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0001234"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none font-medium text-slate-800 uppercase"
                  />
                </div>
              </div>

              {/* Theme Color & Default Account */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Account Accent Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                          color === c ? 'scale-125 ring-2 ring-slate-900 ring-offset-2' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer pt-2 border-t border-slate-200">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Set as primary default account</span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 shrink-0">
            {accountToEdit && existingAccounts.length > 1 ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm active:scale-98 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Account</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
