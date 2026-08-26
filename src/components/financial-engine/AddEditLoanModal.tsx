import React, { useState, useEffect } from 'react';
import { Account, Loan, LoanType } from '../../types';
import { X, Landmark, Calculator, Calendar, Percent, Shield, Clock } from 'lucide-react';

interface AddEditLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loan: Loan) => void;
  editLoan?: Loan | null;
  accounts: Account[];
}

export const AddEditLoanModal: React.FC<AddEditLoanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editLoan,
  accounts,
}) => {
  const [name, setName] = useState('');
  const [lenderName, setLenderName] = useState('State Bank of India');
  const [loanType, setLoanType] = useState<LoanType>('home');
  const [principalAmount, setPrincipalAmount] = useState<number>(3000000);
  const [outstandingPrincipal, setOutstandingPrincipal] = useState<number>(2500000);
  const [interestRatePercent, setInterestRatePercent] = useState<number>(8.5);
  const [interestType, setInterestType] = useState<'fixed' | 'floating'>('floating');
  const [tenureMonths, setTenureMonths] = useState<number>(240);
  const [tenureCompletedMonths, setTenureCompletedMonths] = useState<number>(24);
  const [monthlyEmi, setMonthlyEmi] = useState<number>(26000);
  const [emiDueDay, setEmiDueDay] = useState<number>(5);
  const [linkedAccountId, setLinkedAccountId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editLoan) {
      setName(editLoan.name || '');
      setLenderName(editLoan.lenderName || 'State Bank of India');
      setLoanType(editLoan.loanType || 'home');
      setPrincipalAmount(editLoan.principalAmount || 0);
      setOutstandingPrincipal(editLoan.outstandingPrincipal || 0);
      setInterestRatePercent(editLoan.interestRatePercent || 8.5);
      setInterestType(editLoan.interestType || 'floating');
      setTenureMonths(editLoan.tenureMonths || 240);
      setTenureCompletedMonths(editLoan.tenureCompletedMonths || 0);
      setMonthlyEmi(editLoan.monthlyEmi || 0);
      setEmiDueDay(editLoan.emiDueDay || 5);
      setLinkedAccountId(editLoan.linkedAccountId || '');
      setStartDate(editLoan.startDate || new Date().toISOString().split('T')[0]);
      setAccountNumber(editLoan.accountNumber || '');
      setNotes(editLoan.notes || '');
    } else {
      setName('');
      setLenderName('State Bank of India');
      setLoanType('home');
      setPrincipalAmount(3000000);
      setOutstandingPrincipal(2800000);
      setInterestRatePercent(8.5);
      setInterestType('floating');
      setTenureMonths(240);
      setTenureCompletedMonths(12);
      setMonthlyEmi(26035);
      setEmiDueDay(5);
      setLinkedAccountId(accounts[0]?.id || '');
      setStartDate(new Date().toISOString().split('T')[0]);
      setAccountNumber('');
      setNotes('');
    }
  }, [editLoan, isOpen, accounts]);

  // Auto-calculate suggested EMI when principal, rate, or tenure changes
  const calculateSuggestedEmi = () => {
    const P = Number(principalAmount) || 0;
    const r = (Number(interestRatePercent) || 0) / 12 / 100;
    const n = Number(tenureMonths) || 12;

    if (P <= 0 || n <= 0) return;

    if (r === 0) {
      setMonthlyEmi(Math.round(P / n));
      return;
    }

    const calculated = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    if (!isNaN(calculated) && isFinite(calculated)) {
      setMonthlyEmi(Math.round(calculated));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a loan title (e.g. SBI Home Loan, Creta Car Loan)');
      return;
    }

    const newLoan: Loan = {
      id: editLoan?.id || `loan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      lenderName: lenderName.trim(),
      loanType,
      principalAmount: Number(principalAmount) || 0,
      outstandingPrincipal: Number(outstandingPrincipal) || 0,
      interestRatePercent: Number(interestRatePercent) || 0,
      interestType,
      tenureMonths: Number(tenureMonths) || 12,
      tenureCompletedMonths: Number(tenureCompletedMonths) || 0,
      monthlyEmi: Number(monthlyEmi) || 0,
      emiDueDay: Number(emiDueDay) || 5,
      linkedAccountId: linkedAccountId || undefined,
      startDate: startDate || new Date().toISOString().split('T')[0],
      accountNumber: accountNumber.trim() || undefined,
      prepaymentTotal: editLoan?.prepaymentTotal || 0,
      status: 'active',
      notes: notes.trim() || undefined,
    };

    onSave(newLoan);
    onClose();
  };

  const LENDER_PRESETS = [
    'State Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Bajaj Finserv',
    'Tata Capital',
    'Bank of Baroda',
    'Kotak Mahindra Bank',
    'LIC Housing Finance',
    'Other',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {editLoan ? 'Edit Loan / EMI' : 'Add Loan / EMI'}
              </h3>
              <p className="text-xs text-slate-500">
                Track principal payoff, interest rate, tenure, and monthly EMI.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* 1. Loan Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Loan Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SBI Home Loan, Creta Car Loan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Loan Category
              </label>
              <select
                value={loanType}
                onChange={(e) => setLoanType(e.target.value as LoanType)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              >
                <option value="home">Home Loan</option>
                <option value="car">Auto / Car Loan</option>
                <option value="consumer_emi">0% No-Cost Consumer EMI</option>
                <option value="personal">Personal Loan</option>
                <option value="education">Education Loan</option>
                <option value="gold">Gold Loan</option>
                <option value="business">Business / Commercial Loan</option>
              </select>
            </div>
          </div>

          {/* 2. Lender Name & Account Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Lending Bank / NBFC
              </label>
              <input
                type="text"
                list="lender-presets"
                value={lenderName}
                onChange={(e) => setLenderName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
              <datalist id="lender-presets">
                {LENDER_PRESETS.map((lp) => (
                  <option key={lp} value={lp} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Loan Account Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. HL-SBIN-8923412"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 3. Sanctioned Principal & Outstanding Principal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Sanctioned Principal (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="10000"
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Outstanding Balance Remaining (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 font-bold">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="10000"
                  value={outstandingPrincipal}
                  onChange={(e) => setOutstandingPrincipal(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-rose-700 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 4. Interest Rate & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Annual Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="50"
                value={interestRatePercent}
                onChange={(e) => setInterestRatePercent(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Rate Structure
              </label>
              <select
                value={interestType}
                onChange={(e) => setInterestType(e.target.value as 'fixed' | 'floating')}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              >
                <option value="floating">Floating (Repo Rate Linked)</option>
                <option value="fixed">Fixed Rate</option>
              </select>
            </div>
          </div>

          {/* 5. Tenure (Total vs Completed) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Total Tenure (Months)
              </label>
              <input
                type="number"
                min="1"
                max="480"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Completed Months Paid
              </label>
              <input
                type="number"
                min="0"
                max={tenureMonths}
                value={tenureCompletedMonths}
                onChange={(e) => setTenureCompletedMonths(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 6. Monthly EMI & Due Day with Auto-Calculate Trigger */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Monthly EMI (₹) *
                </label>
                <button
                  type="button"
                  onClick={calculateSuggestedEmi}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline"
                >
                  Recalculate
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={monthlyEmi}
                  onChange={(e) => setMonthlyEmi(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                EMI Auto-Debit Day (1-31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={emiDueDay}
                onChange={(e) => setEmiDueDay(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 7. Auto Debit Source Account */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Linked Auto-Debit Account (NACH Mandate)
            </label>
            <select
              value={linkedAccountId}
              onChange={(e) => setLinkedAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
            >
              <option value="">-- Select Bank Account --</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.bankName || acc.type})
                </option>
              ))}
            </select>
          </div>

          {/* 8. Notes */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Loan Purpose / Property / Asset Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 3BHK flat Whitefield, tax exemption under Sec 80C & 24b"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
            >
              {editLoan ? 'Save Changes' : '+ Add Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
