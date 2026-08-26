import React from 'react';
import { CreditCard as CreditCardType } from '../../types';
import { formatINR } from '../../utils/formatters';
import { CreditCard as CardIcon, AlertTriangle, Calendar, Award, Zap, Edit2, Trash2, ArrowUpRight } from 'lucide-react';

interface CreditCardVisualProps {
  card: CreditCardType;
  onPayBill: (card: CreditCardType) => void;
  onLogSpend: (card: CreditCardType) => void;
  onEdit: (card: CreditCardType) => void;
  onDelete: (cardId: string) => void;
}

export const CreditCardVisual: React.FC<CreditCardVisualProps> = ({
  card,
  onPayBill,
  onLogSpend,
  onEdit,
  onDelete,
}) => {
  const creditLimit = Number(card.creditLimit) || 1;
  const currentOutstanding = Number(card.currentOutstanding) || 0;
  const availableCredit = Math.max(0, creditLimit - currentOutstanding);
  const utilizationPercent = Math.min(100, Math.round((currentOutstanding / creditLimit) * 100));

  // Determine card style based on theme / bank / color
  const getGradient = () => {
    if (card.cardColor) {
      if (card.cardColor === '#002f6c') return 'from-[#002f6c] via-[#0a3d80] to-[#041a3a]';
      if (card.cardColor === '#831843') return 'from-[#831843] via-[#9d174d] to-[#4c0519]';
      if (card.cardColor === '#1e40af') return 'from-[#1e40af] via-[#2563eb] to-[#172554]';
      if (card.cardColor === '#ea580c') return 'from-[#c2410c] via-[#ea580c] to-[#7c2d12]';
      return `from-slate-800 via-slate-900 to-black`;
    }
    return 'from-slate-800 via-slate-900 to-black';
  };

  const isHighUtilization = utilizationPercent > 70;
  const isModerateUtilization = utilizationPercent > 30 && utilizationPercent <= 70;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
      {/* 3D Physical Card Simulation Frame */}
      <div
        className={`relative overflow-hidden rounded-xl bg-gradient-to-tr ${getGradient()} p-5 text-white shadow-md aspect-[1.586/1] flex flex-col justify-between`}
      >
        {/* Subtle holographic sheen overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/30 pointer-events-none" />

        {/* Top: Bank Name & Network */}
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/70">
              {card.bankName}
            </span>
            <h4 className="text-sm font-bold text-white font-heading tracking-wide">
              {card.name}
            </h4>
          </div>
          <div className="text-right">
            <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-white/20 backdrop-blur-xs text-white border border-white/20">
              {card.cardNetwork}
            </span>
          </div>
        </div>

        {/* Middle: EMV Chip & Contactless */}
        <div className="relative z-10 flex items-center justify-between my-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-6 rounded-md bg-amber-300/80 border border-amber-400/90 shadow-inner flex items-center justify-center">
              <div className="w-5 h-3 border border-amber-600/50 rounded-xs" />
            </div>
            <Zap className="h-3.5 w-3.5 text-white/50" />
          </div>
          <div className="text-xs tracking-widest font-mono text-white/80">
            •••• •••• •••• {card.cardNumberLast4 || '0000'}
          </div>
        </div>

        {/* Bottom: Outstanding & Limit Preview */}
        <div className="relative z-10 flex items-end justify-between pt-2 border-t border-white/15">
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-white/70 block">
              Current Due
            </span>
            <span className="text-base sm:text-lg font-bold text-white font-heading">
              {formatINR(currentOutstanding)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold tracking-wider text-white/70 block">
              Limit
            </span>
            <span className="text-xs font-semibold text-white/90">
              {formatINR(creditLimit)}
            </span>
          </div>
        </div>
      </div>

      {/* Utilization Metric & Details */}
      <div className="mt-4 space-y-3">
        {/* Utilization Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              Utilization: <span className={isHighUtilization ? 'text-rose-600 font-bold' : isModerateUtilization ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>{utilizationPercent}%</span>
            </span>
            <span className="text-[11px] font-medium text-slate-600">
              Avail: <strong className="text-slate-900">{formatINR(availableCredit)}</strong>
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isHighUtilization
                  ? 'bg-rose-500'
                  : isModerateUtilization
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${utilizationPercent}%` }}
            />
          </div>
          {isHighUtilization && (
            <p className="text-[10px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
              <AlertTriangle className="h-3 w-3" /> Exceeds 30% recommended credit health ratio
            </p>
          )}
        </div>

        {/* Billing & Due Cycle */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Bill Date
            </span>
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3 text-slate-400" />
              {card.billingCycleDay}th of month
            </span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Payment Due
            </span>
            <span className="text-xs font-bold text-indigo-700 flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3 text-indigo-500" />
              {card.paymentDueDay}th of month
            </span>
          </div>
        </div>

        {/* Extra Perks / Rewards / Fee */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          {card.rewardPoints !== undefined && (
            <span className="flex items-center gap-1 font-medium text-amber-700">
              <Award className="h-3.5 w-3.5 text-amber-500" />
              <span>{card.rewardPoints.toLocaleString('en-IN')} Pts</span>
            </span>
          )}
          {card.annualFee !== undefined && (
            <span className="text-[10px] text-slate-400">
              Annual: {card.annualFee === 0 ? 'LTF (₹0)' : `₹${card.annualFee}`}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(card)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Edit card details"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(card.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete credit card"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onLogSpend(card)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Log Spend
            </button>
            {currentOutstanding > 0 && (
              <button
                onClick={() => onPayBill(card)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
              >
                <span>Pay Bill</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
