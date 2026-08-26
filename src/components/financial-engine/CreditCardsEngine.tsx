import React, { useState, useMemo } from 'react';
import { CreditCard, CardNetwork } from '../../types';
import { formatINR } from '../../utils/formatters';
import { CreditCardVisual } from './CreditCardVisual';
import {
  CreditCard as CardIcon,
  Plus,
  ShieldCheck,
  AlertCircle,
  TrendingDown,
  Sparkles,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
} from 'lucide-react';

interface CreditCardsEngineProps {
  creditCards: CreditCard[];
  onAddCard: () => void;
  onEditCard: (card: CreditCard) => void;
  onDeleteCard: (cardId: string) => void;
  onPayBill: (card: CreditCard) => void;
  onLogSpend: (card: CreditCard) => void;
}

export const CreditCardsEngine: React.FC<CreditCardsEngineProps> = ({
  creditCards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onPayBill,
  onLogSpend,
}) => {
  const [networkFilter, setNetworkFilter] = useState<CardNetwork | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [utilizationFilter, setUtilizationFilter] = useState<'all' | 'high' | 'safe'>('all');

  // Aggregated Metrics
  const totalLimit = useMemo(() => {
    return creditCards.reduce((sum, c) => sum + (Number(c.creditLimit) || 0), 0);
  }, [creditCards]);

  const totalOutstanding = useMemo(() => {
    return creditCards
      .filter((c) => c.status === 'active')
      .reduce((sum, c) => sum + (Number(c.currentOutstanding) || 0), 0);
  }, [creditCards]);

  const totalAvailable = Math.max(0, totalLimit - totalOutstanding);
  const overallUtilizationPercent = totalLimit > 0 ? Math.round((totalOutstanding / totalLimit) * 100) : 0;
  const totalRewardPoints = creditCards.reduce((sum, c) => sum + (c.rewardPoints || 0), 0);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return creditCards.filter((card) => {
      // Network filter
      if (networkFilter !== 'all' && card.cardNetwork !== networkFilter) return false;

      // Utilization filter
      const cardUtil = (card.currentOutstanding / (card.creditLimit || 1)) * 100;
      if (utilizationFilter === 'high' && cardUtil <= 30) return false;
      if (utilizationFilter === 'safe' && cardUtil > 30) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = card.name.toLowerCase().includes(q);
        const matchesBank = card.bankName.toLowerCase().includes(q);
        const matchesLast4 = card.cardNumberLast4.includes(q);
        if (!matchesName && !matchesBank && !matchesLast4) return false;
      }

      return true;
    });
  }, [creditCards, networkFilter, utilizationFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Credit Utilization & Key Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Total Outstanding Due */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total CC Dues
            </span>
            <span className="p-1 rounded-md bg-rose-50 text-rose-600">
              <TrendingDown className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 font-heading">
            {formatINR(totalOutstanding)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {creditCards.length} active credit cards
          </p>
        </div>

        {/* Metric 2: Available Credit Limit */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Available Limit
            </span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700 font-heading">
            {formatINR(totalAvailable)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Total Sanctioned Limit: {formatINR(totalLimit)}
          </p>
        </div>

        {/* Metric 3: Credit Utilization Ratio Gauge */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Credit Utilization
            </span>
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                overallUtilizationPercent > 30
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {overallUtilizationPercent <= 30 ? 'Safe (<30%)' : 'Caution (>30%)'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-heading">
              {overallUtilizationPercent}%
            </span>
            <span className="text-xs text-slate-500 font-medium">used</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                overallUtilizationPercent > 70
                  ? 'bg-rose-500'
                  : overallUtilizationPercent > 30
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallUtilizationPercent)}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Reward Points Pool */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Reward Points Pool
            </span>
            <span className="p-1 rounded-md bg-amber-50 text-amber-600">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-800 font-heading">
            {totalRewardPoints.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Redeemable for flights & cashback
          </p>
        </div>
      </div>

      {/* Action Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search cards, banks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-48 sm:w-56"
            />
          </div>

          {/* Network Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            {(['all', 'Visa', 'Mastercard', 'RuPay', 'Amex'] as const).map((net) => (
              <button
                key={net}
                onClick={() => setNetworkFilter(net)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  networkFilter === net
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {net === 'all' ? 'All Networks' : net}
              </button>
            ))}
          </div>

          {/* Utilization Filter */}
          <select
            value={utilizationFilter}
            onChange={(e) => setUtilizationFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="all">All Utilization</option>
            <option value="safe">Safe (≤ 30%)</option>
            <option value="high">High (&gt; 30%)</option>
          </select>
        </div>

        {/* Add Card Button */}
        <button
          onClick={onAddCard}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider shadow-2xs transition-all active:scale-98"
        >
          <Plus className="h-4 w-4" />
          <span>+ Add Credit Card</span>
        </button>
      </div>

      {/* Cards Visual Grid */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <CreditCardVisual
              key={card.id}
              card={card}
              onPayBill={onPayBill}
              onLogSpend={onLogSpend}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
          <CardIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No Credit Cards Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery || networkFilter !== 'all' || utilizationFilter !== 'all'
              ? 'No cards match your search and filter criteria.'
              : 'Add your credit cards to track credit limits, billing dates, utilization, and rewards.'}
          </p>
          <button
            onClick={onAddCard}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-colors"
          >
            + Add Your First Card
          </button>
        </div>
      )}
    </div>
  );
};
