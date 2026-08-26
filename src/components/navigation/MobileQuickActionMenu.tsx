import React from 'react';
import {
  X,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  Activity,
  Dumbbell,
  CheckSquare,
  Calendar,
  Plane,
  Sparkles,
  Mail,
  Zap,
  Download,
  Settings,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { MainPillar } from '../Navbar';
import { TransactionType } from '../../types';

interface MobileQuickActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string) => void;
  onNavigatePillar: (pillar: MainPillar) => void;
  activePillar: MainPillar;
}

export const MobileQuickActionMenu: React.FC<MobileQuickActionMenuProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  onNavigatePillar,
  activePillar,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="modal_mobile_quick_menu"
      className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn md:hidden"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl max-h-[85vh] w-full overflow-hidden shadow-2xl border-t border-slate-200 flex flex-col animate-slideUp pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Quick Mobile Actions
            </h3>
            <p className="text-xs text-slate-500">
              1-Tap Fast Logging & Life Navigation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(85vh-110px)]">
          {/* 1. Fast Transaction Logging */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              ⚡ Fast Financial Logging
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                id="mobile-act-expense"
                onClick={() => {
                  onSelectAction('add_expense');
                  onClose();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 hover:bg-rose-100 transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <div className="p-2 bg-rose-500 text-white rounded-xl mb-1.5 shadow-2xs">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">- Expense</span>
                <span className="text-[9px] text-rose-600 font-medium">Daily Spend</span>
              </button>

              <button
                id="mobile-act-income"
                onClick={() => {
                  onSelectAction('add_income');
                  onClose();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 hover:bg-emerald-100 transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <div className="p-2 bg-emerald-500 text-white rounded-xl mb-1.5 shadow-2xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">+ Income</span>
                <span className="text-[9px] text-emerald-600 font-medium">Salary/Earnings</span>
              </button>

              <button
                id="mobile-act-transfer"
                onClick={() => {
                  onSelectAction('add_transfer');
                  onClose();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-800 hover:bg-indigo-100 transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <div className="p-2 bg-indigo-600 text-white rounded-xl mb-1.5 shadow-2xs">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">⇄ Transfer</span>
                <span className="text-[9px] text-indigo-600 font-medium">Bank/Wallet</span>
              </button>
            </div>
          </div>

          {/* 2. Health & Habit Check-in */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              🏃 Daily Health & Routine
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                id="mobile-act-vitals"
                onClick={() => {
                  onSelectAction('log_vitals');
                  onClose();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-900 hover:bg-rose-100 transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <div className="p-2 bg-rose-500 text-white rounded-xl mb-1.5 shadow-2xs">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Log Vitals</span>
                <span className="text-[9px] text-rose-700 font-medium">Water, Sleep, BP</span>
              </button>

              <button
                id="mobile-act-workout"
                onClick={() => {
                  onSelectAction('log_workout');
                  onClose();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-orange-50 border border-orange-200 text-orange-900 hover:bg-orange-100 transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <div className="p-2 bg-orange-500 text-white rounded-xl mb-1.5 shadow-2xs">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Workout</span>
                <span className="text-[9px] text-orange-700 font-medium">Gym, Run, Yoga</span>
              </button>

              <button
                id="mobile-act-habit"
                onClick={() => {
                  onSelectAction('add_habit');
                  onClose();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 hover:bg-purple-100 transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <div className="p-2 bg-purple-600 text-white rounded-xl mb-1.5 shadow-2xs">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">+ New Habit</span>
                <span className="text-[9px] text-purple-700 font-medium">Build Streak</span>
              </button>
            </div>
          </div>

          {/* 3. Life & Smart Features Hub */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              🧭 Complete Life & Cloud Hub
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onNavigatePillar('habits');
                  onClose();
                }}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white text-left transition-all cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Habits & Streaks
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Daily routine score
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  onNavigatePillar('calendar');
                  onClose();
                }}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white text-left transition-all cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Calendar 360°
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Indian festivals & Art
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  onNavigatePillar('planner');
                  onClose();
                }}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white text-left transition-all cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-cyan-100 text-cyan-800">
                  <Plane className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Life Planner
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Vacations & Dates
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectAction('open_ai');
                  onClose();
                }}
                className="flex items-center gap-3 p-3 rounded-xl bg-indigo-900 text-white border border-indigo-800 hover:bg-indigo-950 text-left transition-all cursor-pointer shadow-xs"
              >
                <div className="p-2 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    AI Advisor
                  </span>
                  <span className="text-[10px] text-indigo-200 block">
                    Simple words 100%
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectAction('open_gmail_reminder');
                  onClose();
                }}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white text-left transition-all cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    22:30 Reminder
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Daily email digest
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectAction('open_sync');
                  onClose();
                }}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white text-left transition-all cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Cloud Sync
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Sub-20ms Firestore
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
