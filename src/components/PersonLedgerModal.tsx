import React, { useState } from 'react';
import {
  X,
  Users,
  UserCheck,
  UserMinus,
  Phone,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  ExternalLink,
  Sparkles,
  Clock,
} from 'lucide-react';
import { PersonLedger, Transaction } from '../types';
import { formatINR, formatDateTime } from '../utils/formatters';
import { WhatsAppReminderModal } from './finance/WhatsAppReminderModal';
import { formatFriendlyDueDate, buildWhatsAppRedirectUrl, generateWhatsAppMessage } from '../utils/whatsapp';

interface PersonLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  personLedgers: PersonLedger[];
  onOpenSettleWithPerson: (personName: string, type: 'income' | 'expense', suggestedAmount: number) => void;
  onUpdatePersonPhoneAndDueDate?: (personName: string, phone: string, dueDate: string) => void;
}

export const PersonLedgerModal: React.FC<PersonLedgerModalProps> = ({
  isOpen,
  onClose,
  personLedgers,
  onOpenSettleWithPerson,
  onUpdatePersonPhoneAndDueDate,
}) => {
  const [selectedPerson, setSelectedPerson] = useState<PersonLedger | null>(null);
  const [whatsAppTargetPerson, setWhatsAppTargetPerson] = useState<PersonLedger | null>(null);

  if (!isOpen) return null;

  const currentLedger = selectedPerson
    ? personLedgers.find((p) => p.name.toLowerCase() === selectedPerson.name.toLowerCase()) || selectedPerson
    : personLedgers[0] || null;

  const totalReceivable = personLedgers
    .filter((p) => p.netBalance > 0)
    .reduce((sum, p) => sum + p.netBalance, 0);

  const totalPayable = personLedgers
    .filter((p) => p.netBalance < 0)
    .reduce((sum, p) => sum + Math.abs(p.netBalance), 0);

  // Quick 1-click WhatsApp redirect for active ledger
  const handleQuickWhatsAppSend = (person: PersonLedger) => {
    const msg = generateWhatsAppMessage({
      personName: person.name,
      netBalance: person.netBalance,
      dueDate: person.dueDate,
      template: 'friendly',
      totalLent: person.totalLent,
      totalBorrowed: person.totalBorrowed,
    });
    const url = buildWhatsAppRedirectUrl(person.phone, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
        <div
          id="person-ledger-modal"
          className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-indigo-600 rounded-xs transform rotate-45 flex items-center justify-center">
                <Users className="transform -rotate-45 h-3 w-3 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 font-heading">
                    Khata & Person Ledgers
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <MessageSquare className="h-2.5 w-2.5" />
                    <span>WhatsApp Dues Enabled</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Track money lent/borrowed and send direct WhatsApp reminders with outstanding amounts and due dates
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

          {/* Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border-b border-slate-200">
            <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Total Receivables (You will get)</span>
              <div className="text-xl font-light text-emerald-600 font-heading">
                {formatINR(totalReceivable)}
              </div>
            </div>

            <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Total Payables (You owe)</span>
              <div className="text-xl font-light text-rose-600 font-heading">
                {formatINR(totalPayable)}
              </div>
            </div>

            <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Active Ledgers</span>
              <div className="text-xl font-light text-slate-900 font-heading">
                {personLedgers.length} Persons
              </div>
            </div>
          </div>

          {/* Main Split View */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
            {/* Left Column: Person List */}
            <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto max-h-[55vh] md:max-h-[60vh] p-3 space-y-2 bg-slate-50">
              {personLedgers.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No person ledger transactions yet. Use 'Lend To' or 'Borrowed From' when logging entries!
                </div>
              ) : (
                personLedgers.map((person) => {
                  const isSelected =
                    currentLedger?.name.toLowerCase() === person.name.toLowerCase();
                  const isReceivable = person.netBalance > 0;
                  const isPayable = person.netBalance < 0;
                  const isSettled = person.netBalance === 0;

                  return (
                    <div
                      key={person.name}
                      onClick={() => setSelectedPerson(person)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer group ${
                        isSelected
                          ? 'border-indigo-600 bg-white shadow-sm ring-1 ring-indigo-600'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {person.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {isReceivable && (
                            <span className="text-xs font-bold text-emerald-600">
                              +{formatINR(person.netBalance)}
                            </span>
                          )}
                          {isPayable && (
                            <span className="text-xs font-bold text-rose-600">
                              -{formatINR(Math.abs(person.netBalance))}
                            </span>
                          )}
                          {isSettled && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Settled
                            </span>
                          )}

                          {/* Quick WhatsApp icon trigger on item */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setWhatsAppTargetPerson(person);
                            }}
                            className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                            title={`Send WhatsApp message with dues & due date to ${person.name}`}
                          >
                            <MessageSquare className="h-3.5 w-3.5 fill-emerald-100" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          {person.phone ? (
                            <span className="font-mono text-[10px]">{person.phone}</span>
                          ) : (
                            <span>{person.transactions.length} entries</span>
                          )}
                          {person.dueDate && (
                            <span className="text-[9px] text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded font-medium">
                              Due: {formatFriendlyDueDate(person.dueDate)}
                            </span>
                          )}
                        </span>
                        <span className="text-[9px] uppercase font-bold tracking-wider">
                          {isReceivable && <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Receivable</span>}
                          {isPayable && <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Payable</span>}
                          {isSettled && <span className="text-slate-400">All clear</span>}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Ledger Details of Selected Person */}
            <div className="md:col-span-7 overflow-y-auto max-h-[55vh] md:max-h-[60vh] p-5 sm:p-6 space-y-5 bg-white flex flex-col justify-between">
              {currentLedger ? (
                <div className="space-y-5">
                  {/* Person Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 pb-3 gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
                        <span>{currentLedger.name}</span>
                        {currentLedger.netBalance > 0 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                            Owes you {formatINR(currentLedger.netBalance)}
                          </span>
                        ) : currentLedger.netBalance < 0 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                            You owe {formatINR(Math.abs(currentLedger.netBalance))}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">
                            All Settled
                          </span>
                        )}
                      </h3>
                      {currentLedger.phone ? (
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                          <Phone className="h-3 w-3 text-emerald-600" />
                          <span>{currentLedger.phone}</span>
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-0.5">
                          No phone number linked yet
                        </p>
                      )}
                    </div>

                    {/* Header Action Buttons (Settle + WhatsApp) */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* WhatsApp Direct Action Button */}
                      <button
                        type="button"
                        id="btn-whatsapp-person"
                        onClick={() => setWhatsAppTargetPerson(currentLedger)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
                        title="Send WhatsApp message with Outstanding Amount and Due Date"
                      >
                        <MessageSquare className="h-3.5 w-3.5 fill-white/20" />
                        <span>WhatsApp Dues</span>
                      </button>

                      {/* Settle Action Button */}
                      {currentLedger.netBalance !== 0 && (
                        <>
                          {currentLedger.netBalance > 0 ? (
                            <button
                              onClick={() =>
                                onOpenSettleWithPerson(
                                  currentLedger.name,
                                  'income',
                                  currentLedger.netBalance
                                )
                              }
                              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
                            >
                              + Record Repayment
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                onOpenSettleWithPerson(
                                  currentLedger.name,
                                  'expense',
                                  Math.abs(currentLedger.netBalance)
                                )
                              }
                              className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
                            >
                              + Pay Back Dues
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Outstanding Amount & Due Date WhatsApp Banner Card */}
                  {currentLedger.netBalance !== 0 && (
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/40 border border-emerald-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-950">
                              Send Direct WhatsApp Reminder
                            </span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 uppercase">
                              1-Click
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-800 mt-0.5">
                            Drafts message with <strong className="text-emerald-950 font-bold">{formatINR(Math.abs(currentLedger.netBalance))}</strong> dues and scheduled due date <span className="font-semibold text-emerald-950">({formatFriendlyDueDate(currentLedger.dueDate)})</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => setWhatsAppTargetPerson(currentLedger)}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                          <span>Draft & Send</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Balance Cards for Person */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Lent</span>
                      <div className="text-base font-light text-slate-900 font-heading mt-0.5">
                        {formatINR(currentLedger.totalLent)}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Borrowed</span>
                      <div className="text-base font-light text-slate-900 font-heading mt-0.5">
                        {formatINR(currentLedger.totalBorrowed)}
                      </div>
                    </div>
                  </div>

                  {/* History Timeline */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                      Transaction History
                    </h4>
                    <div className="space-y-2">
                      {currentLedger.transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">
                              {tx.type === 'lend' && '🤝 You Lent Money'}
                              {tx.type === 'borrow' && '📥 You Borrowed Money'}
                              {tx.type === 'income' && '✅ Repayment Received'}
                              {tx.type === 'expense' && '📤 You Paid Back'}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                              <span>{formatDateTime(tx.dateTime)} • {tx.location || 'General'}</span>
                              {tx.dueDate && (
                                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                                  📅 Due: {formatFriendlyDueDate(tx.dueDate)}
                                </span>
                              )}
                            </div>
                            {tx.description && (
                              <div className="text-[11px] text-slate-600 italic mt-0.5">
                                "{tx.description}"
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-slate-900">
                              {formatINR(tx.amount)}
                            </div>
                            <span className="text-[9px] text-slate-400 uppercase font-semibold">
                              {tx.paymentMode || 'UPI'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Select a person from the list to view their ledger.
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Reminder Drafter & Direct Redirect Modal */}
      <WhatsAppReminderModal
        isOpen={Boolean(whatsAppTargetPerson)}
        onClose={() => setWhatsAppTargetPerson(null)}
        personLedger={whatsAppTargetPerson}
        onUpdatePhoneAndDueDate={onUpdatePersonPhoneAndDueDate}
      />
    </>
  );
};


