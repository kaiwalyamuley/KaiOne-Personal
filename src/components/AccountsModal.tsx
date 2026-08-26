import React, { useState } from 'react';
import {
  X,
  Building2,
  Plus,
  Wallet,
  CreditCard,
  Landmark,
  PiggyBank,
  Check,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { Account, AccountType } from '../types';
import { formatINR } from '../utils/formatters';
import { AddEditAccountModal } from './financial-engine/AddEditAccountModal';

interface AccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  balances: Record<string, number>;
  onSaveAccount: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
}

export const AccountsModal: React.FC<AccountsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  balances,
  onSaveAccount,
  onDeleteAccount,
}) => {
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [selectedAccountToEdit, setSelectedAccountToEdit] = useState<Account | null>(null);

  if (!isOpen) return null;

  const handleOpenAddNew = () => {
    setSelectedAccountToEdit(null);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setSelectedAccountToEdit(acc);
    setIsAddEditOpen(true);
  };

  const getAccountIcon = (accType: AccountType) => {
    switch (accType) {
      case 'bank':
        return Landmark;
      case 'credit_card':
        return CreditCard;
      case 'cash':
        return Wallet;
      case 'investment':
        return PiggyBank;
      default:
        return Building2;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
        <div
          id="accounts-modal"
          className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-indigo-600 rounded-xs transform rotate-45 flex items-center justify-center">
                <Building2 className="transform -rotate-45 h-3 w-3 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                  Accounts & Banks Hub
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                    {accounts.length} Accounts
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Manage bank accounts, credit lines, cash reserves, and investment demat balances
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-white">
            {/* Add Account Button */}
            <button
              id="btn-add-new-account-modal"
              onClick={handleOpenAddNew}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-300 py-3.5 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/70 hover:border-indigo-400 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 text-indigo-600" />
              <span>+ Add Bank / Card / Wallet Account</span>
            </button>

            {/* Existing Accounts List */}
            <div className="space-y-2.5">
              {accounts.map((acc) => {
                const Icon = getAccountIcon(acc.type);
                const liveBalance = balances[acc.id] ?? acc.initialBalance;

                return (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-2xs font-bold shrink-0"
                        style={{ backgroundColor: acc.color || '#4f46e5' }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {acc.name}
                          </span>
                          {acc.isDefault && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                              Default
                            </span>
                          )}
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {acc.type}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {acc.bankName || acc.type.toUpperCase()}{' '}
                          {acc.accountNumberLast4 ? `••${acc.accountNumberLast4}` : ''}
                          {acc.interestRate ? ` • ${acc.interestRate}% p.a.` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900 font-heading">
                          {formatINR(liveBalance)}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Initial: {formatINR(acc.initialBalance)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(acc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Edit Account Details"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {accounts.length > 1 && (
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Delete account "${acc.name}"? Transactions associated with this account will be preserved.`
                                )
                              ) {
                                onDeleteAccount(acc.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete account"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Account Modal */}
      <AddEditAccountModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSaveAccount={(acc) => {
          onSaveAccount(acc);
          setIsAddEditOpen(false);
        }}
        accountToEdit={selectedAccountToEdit}
        onDeleteAccount={(id) => {
          onDeleteAccount(id);
          setIsAddEditOpen(false);
        }}
        existingAccounts={accounts}
      />
    </>
  );
};
