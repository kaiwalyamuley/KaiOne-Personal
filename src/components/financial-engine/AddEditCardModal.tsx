import React, { useState, useEffect } from 'react';
import { Account, CardNetwork, CreditCard } from '../../types';
import { X, CreditCard as CardIcon, Building2, Calendar, Shield, Award, IndianRupee } from 'lucide-react';

interface AddEditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: CreditCard) => void;
  editCard?: CreditCard | null;
  accounts: Account[];
}

export const AddEditCardModal: React.FC<AddEditCardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editCard,
  accounts,
}) => {
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [cardNumberLast4, setCardNumberLast4] = useState('');
  const [cardNetwork, setCardNetwork] = useState<CardNetwork>('Visa');
  const [creditLimit, setCreditLimit] = useState<number>(100000);
  const [currentOutstanding, setCurrentOutstanding] = useState<number>(0);
  const [billingCycleDay, setBillingCycleDay] = useState<number>(15);
  const [paymentDueDay, setPaymentDueDay] = useState<number>(5);
  const [minAmountDue, setMinAmountDue] = useState<number>(0);
  const [rewardPoints, setRewardPoints] = useState<number>(0);
  const [annualFee, setAnnualFee] = useState<number>(0);
  const [annualFeeWaiverSpend, setAnnualFeeWaiverSpend] = useState<number>(100000);
  const [cardColor, setCardColor] = useState<string>('#002f6c');
  const [linkedAccountId, setLinkedAccountId] = useState<string>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editCard) {
      setName(editCard.name || '');
      setBankName(editCard.bankName || 'HDFC Bank');
      setCardNumberLast4(editCard.cardNumberLast4 || '');
      setCardNetwork(editCard.cardNetwork || 'Visa');
      setCreditLimit(editCard.creditLimit || 100000);
      setCurrentOutstanding(editCard.currentOutstanding || 0);
      setBillingCycleDay(editCard.billingCycleDay || 15);
      setPaymentDueDay(editCard.paymentDueDay || 5);
      setMinAmountDue(editCard.minAmountDue || 0);
      setRewardPoints(editCard.rewardPoints || 0);
      setAnnualFee(editCard.annualFee !== undefined ? editCard.annualFee : 0);
      setAnnualFeeWaiverSpend(editCard.annualFeeWaiverSpend || 100000);
      setCardColor(editCard.cardColor || '#002f6c');
      setLinkedAccountId(editCard.linkedAccountId || '');
      setNotes(editCard.notes || '');
    } else {
      setName('');
      setBankName('HDFC Bank');
      setCardNumberLast4('');
      setCardNetwork('Visa');
      setCreditLimit(150000);
      setCurrentOutstanding(0);
      setBillingCycleDay(15);
      setPaymentDueDay(5);
      setMinAmountDue(0);
      setRewardPoints(0);
      setAnnualFee(0);
      setAnnualFeeWaiverSpend(100000);
      setCardColor('#002f6c');
      setLinkedAccountId(accounts[0]?.id || '');
      setNotes('');
    }
  }, [editCard, isOpen, accounts]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a card name (e.g. HDFC Regalia, ICICI Amazon Pay)');
      return;
    }

    const newCard: CreditCard = {
      id: editCard?.id || `cc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      bankName: bankName.trim(),
      cardNumberLast4: cardNumberLast4.trim() || '0000',
      cardNetwork,
      creditLimit: Number(creditLimit) || 0,
      currentOutstanding: Number(currentOutstanding) || 0,
      billingCycleDay: Number(billingCycleDay) || 15,
      paymentDueDay: Number(paymentDueDay) || 5,
      minAmountDue: Number(minAmountDue) || Math.round(Number(currentOutstanding) * 0.05),
      rewardPoints: Number(rewardPoints) || 0,
      annualFee: Number(annualFee) || 0,
      annualFeeWaiverSpend: Number(annualFeeWaiverSpend) || 0,
      cardColor,
      status: 'active',
      linkedAccountId: linkedAccountId || undefined,
      notes: notes.trim() || undefined,
    };

    onSave(newCard);
    onClose();
  };

  const BANK_PRESETS = [
    'HDFC Bank',
    'State Bank of India',
    'ICICI Bank',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Standard Chartered',
    'RBL Bank',
    'IDFC FIRST Bank',
    'American Express',
    'Other',
  ];

  const COLOR_PRESETS = [
    { label: 'HDFC Navy', color: '#002f6c' },
    { label: 'ICICI Maroon', color: '#831843' },
    { label: 'SBI Blue', color: '#1e40af' },
    { label: 'Axis Burgundy', color: '#701a75' },
    { label: 'Obsidian Black', color: '#0f172a' },
    { label: 'Emerald Luxe', color: '#064e3b' },
    { label: 'Amber Gold', color: '#78350f' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <CardIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {editCard ? 'Edit Credit Card' : 'Add Credit Card'}
              </h3>
              <p className="text-xs text-slate-500">
                Track limit, utilization, billing cycle & rewards.
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
          {/* 1. Card Name & Bank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Card Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Millennia, Amazon Pay, Regalia"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Issuing Bank / Entity
              </label>
              <input
                type="text"
                list="bank-presets"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
              <datalist id="bank-presets">
                {BANK_PRESETS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
          </div>

          {/* 2. Network & Last 4 Digits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Card Network
              </label>
              <select
                value={cardNetwork}
                onChange={(e) => setCardNetwork(e.target.value as CardNetwork)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              >
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="RuPay">RuPay (UPI Enabled)</option>
                <option value="Amex">American Express</option>
                <option value="Diners">Diners Club</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Card Number (Last 4 Digits)
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="4821"
                value={cardNumberLast4}
                onChange={(e) => setCardNumberLast4(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 3. Credit Limit & Current Outstanding */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Total Credit Limit (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Current Outstanding Due (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={currentOutstanding}
                  onChange={(e) => setCurrentOutstanding(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-rose-700 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 4. Billing Cycle & Due Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Statement Generation Day (1-31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={billingCycleDay}
                onChange={(e) => setBillingCycleDay(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Payment Due Day of Month (1-31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={paymentDueDay}
                onChange={(e) => setPaymentDueDay(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 5. Rewards & Annual Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Reward Points Balance
              </label>
              <input
                type="number"
                min="0"
                value={rewardPoints}
                onChange={(e) => setRewardPoints(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Annual Fee (₹, 0 for Lifetime Free)
              </label>
              <input
                type="number"
                min="0"
                value={annualFee}
                onChange={(e) => setAnnualFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 6. Card Visual Color Theme */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Card Theme Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.color}
                  onClick={() => setCardColor(p.color)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                    cardColor === p.color
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 7. Notes & Perks */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Key Card Perks / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 5% cashback on Swiggy/Zomato, 4 lounge visits per quarter"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
            />
          </div>

          {/* Footer Submit */}
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
              {editCard ? 'Save Changes' : '+ Add Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
