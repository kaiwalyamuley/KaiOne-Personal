import React from 'react';
import {
  Wallet,
  PlusCircle,
  Users,
  Building2,
  Download,
  Activity,
  CheckSquare,
  Flame,
  Layers,
  CreditCard,
  Landmark,
  RefreshCw,
  Target,
  TrendingUp,
  Sparkles,
  LayoutDashboard,
  Calendar as CalendarIcon,
  Plane,
  Crown,
  User as UserIcon,
  Zap,
  Mail,
  Bell,
  ChevronRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';

export type MainPillar = 'dashboard' | 'calendar' | 'planner' | 'finance' | 'health' | 'habits';
export type FinanceSubTab = 'daily_log' | 'recurring' | 'financial_engine' | 'budget_engine' | 'goal_savings' | 'wealth_forecasting';

interface NavbarProps {
  activePillar: MainPillar;
  setActivePillar: (pillar: MainPillar) => void;
  financeSubTab: FinanceSubTab;
  setFinanceSubTab: (tab: FinanceSubTab) => void;
  onOpenNewTx: () => void;
  onOpenLedgers: () => void;
  onOpenAccounts: () => void;
  onOpenCategories?: () => void;
  onOpenExport: () => void;
  onOpenProfile: () => void;
  onOpenAIAdvisor: () => void;
  onOpenSync?: () => void;
  onOpenGmailReminder?: () => void;
  isSyncConnected?: boolean;
  syncLatencyMs?: number;
  currentUser?: User | null;
  userProfile: UserProfile;
  totalTransactionsCount: number;
  activeGoalsCount?: number;
  activeHabitsCount?: number;
  activeRecurringCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePillar,
  setActivePillar,
  financeSubTab,
  setFinanceSubTab,
  onOpenNewTx,
  onOpenLedgers,
  onOpenAccounts,
  onOpenCategories,
  onOpenExport,
  onOpenProfile,
  onOpenAIAdvisor,
  onOpenSync,
  onOpenGmailReminder,
  isSyncConnected = true,
  syncLatencyMs = 2,
  currentUser,
  userProfile,
  totalTransactionsCount,
  activeGoalsCount = 4,
  activeHabitsCount = 5,
  activeRecurringCount = 0,
}) => {
  const isGoogleUser = currentUser && !currentUser.isAnonymous && currentUser.email;

  const pillars: { id: MainPillar; label: string; icon: any; badge?: string; color: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-indigo-600' },
    { id: 'finance', label: 'Finance OS', icon: Wallet, color: 'text-indigo-600' },
    { id: 'health', label: 'Health & Vitals', icon: Activity, color: 'text-rose-500' },
    { id: 'habits', label: 'Habits & Streaks', icon: CheckSquare, badge: activeHabitsCount > 0 ? `${activeHabitsCount}` : undefined, color: 'text-purple-600' },
    { id: 'calendar', label: 'Calendar 360°', icon: CalendarIcon, badge: 'Art', color: 'text-amber-500' },
    { id: 'planner', label: 'Life Planner', icon: Plane, color: 'text-cyan-600' },
  ];

  const financeTabs: { id: FinanceSubTab; label: string; icon: any; badge?: string; badgeColor?: string; description: string }[] = [
    { id: 'daily_log', label: 'Daily Log & Khata', icon: Wallet, badge: `${totalTransactionsCount}`, badgeColor: 'bg-indigo-100 text-indigo-700', description: 'Income, Expense, Transfers & Khata' },
    { id: 'recurring', label: 'Recurring Rules', icon: RefreshCw, badge: activeRecurringCount > 0 ? `${activeRecurringCount}` : undefined, badgeColor: 'bg-emerald-100 text-emerald-800', description: 'Automated Subscriptions, SIPs & Rent' },
    { id: 'financial_engine', label: 'Accounts & Cards', icon: Landmark, description: 'Bank Balances, Cards & Loans' },
    { id: 'budget_engine', label: 'Budget & Rollover', icon: RefreshCw, description: 'Monthly Allocations & Rollover' },
    { id: 'goal_savings', label: 'Savings Buckets', icon: Target, badge: '🔥 Goals', badgeColor: 'bg-amber-100 text-amber-900', description: 'Target Milestone Vaults' },
    { id: 'wealth_forecasting', label: 'Wealth Forecast', icon: TrendingUp, description: 'Net Worth & 10Y Trajectory' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all duration-300">
      {/* ========================================================================= */}
      {/* ROW 1: BRAND IDENTITY (KAIONE), CLOUD SYNC, AI ADVISOR, REMINDER & ACTIONS */}
      {/* ========================================================================= */}
      <div className="border-b border-slate-100/90 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* KAIONE Brand Logo & Geometric Mark */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActivePillar('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group"
            >
              {/* Luxury Geometric K1 Logo Badge */}
              <div className="relative flex h-8 w-8 items-center justify-center bg-gradient-to-tr from-slate-900 via-indigo-900 to-indigo-600 rounded-xl transform rotate-45 shadow-md shadow-indigo-600/25 border border-indigo-400/30 group-hover:scale-105 group-hover:rotate-90 transition-all duration-300 ease-out">
                <span className="transform -rotate-45 group-hover:-rotate-90 text-[11px] font-black text-white tracking-tighter transition-all duration-300 font-heading flex items-center justify-center">
                  K<span className="text-amber-400 text-[9px]">1</span>
                </span>
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-heading leading-none">
                    KAI<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600">ONE</span>
                  </h1>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-indigo-50/90 text-indigo-700 border border-indigo-100/90 uppercase tracking-widest leading-none">
                    OS
                  </span>
                </div>
              </div>
            </div>

            {/* Cloud Sync Status Indicator */}
            {onOpenSync && (
              <button
                id="nav-btn-cloud-sync"
                onClick={onOpenSync}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 ${
                  isGoogleUser
                    ? 'border-indigo-200/80 bg-indigo-50/50 hover:bg-indigo-100/70 text-indigo-900'
                    : 'border-emerald-200/80 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900'
                }`}
                title={
                  isGoogleUser
                    ? `KAIONE Live Cloud Sync: ${currentUser?.email} (<20ms)`
                    : 'KAIONE Multi-Device Dynamic Firebase Sync'
                }
              >
                <div className="relative flex items-center justify-center">
                  {isGoogleUser && currentUser?.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="User Avatar"
                      className="w-3.5 h-3.5 rounded-full border border-indigo-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Zap className={`w-3 h-3 ${isGoogleUser ? 'text-indigo-600' : 'text-emerald-600'}`} />
                  )}
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <div className="leading-tight">
                  <span className="text-[10px] font-bold block truncate max-w-[120px]">
                    {isGoogleUser ? (currentUser?.displayName?.split(' ')[0] || 'Synced') : 'Cloud Live'}
                  </span>
                  <span className={`text-[8px] font-mono font-black block ${isGoogleUser ? 'text-indigo-600' : 'text-emerald-600'}`}>
                    ⚡ {syncLatencyMs ? `${syncLatencyMs}ms` : '<20ms'}
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* Right Action Tools & Profile in Row 1 */}
          <div className="flex items-center gap-2 shrink-0">
            {/* AI Advisor Trigger Button */}
            <button
              id="nav-btn-ai-advisor"
              onClick={onOpenAIAdvisor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white hover:border-amber-300/80 border border-amber-400/30 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-indigo-500/10 active:scale-95 group"
              title="Open KAIONE AI Advisor (Simple Words • 100% Satisfaction)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
              <div className="flex items-center gap-1 leading-none">
                <span className="text-xs font-bold font-heading text-white">
                  AI Advisor
                </span>
                <span className="hidden sm:inline-block text-[8px] font-black px-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  100%
                </span>
              </div>
            </button>

            {/* Daily 22:30 Gmail Reminder Button */}
            {onOpenGmailReminder && (
              <button
                id="nav-btn-gmail-reminder"
                onClick={onOpenGmailReminder}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-200/80 bg-indigo-50/60 hover:bg-indigo-100/70 text-indigo-900 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 group"
                title="Daily 22:30 Gmail Reminder to kaiwalya.2501@gmail.com"
              >
                <div className="p-1 rounded-md bg-indigo-600 text-white shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Mail className="w-3 h-3" />
                </div>
                <div className="hidden xl:block text-left leading-none">
                  <span className="text-[11px] font-bold text-indigo-950 block">
                    22:30 Digest
                  </span>
                  <span className="text-[8px] font-semibold text-indigo-600 block truncate max-w-[120px]">
                    kaiwalya.2501@gmail.com
                  </span>
                </div>
              </button>
            )}

            {/* Backup / Export Data */}
            <button
              id="nav-btn-export"
              onClick={onOpenExport}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 shadow-2xs active:scale-95"
              title="Backup Data & Export"
            >
              <Download className="h-3.5 w-3.5 text-slate-600" />
              <span>Backup</span>
            </button>

            {/* User Profile Trigger Button */}
            <button
              id="nav-btn-profile"
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-800 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 group"
              title="Edit Personal Profile & VIP Milestones"
            >
              <span className="text-base transform group-hover:scale-110 transition-transform">
                {userProfile.avatar || '👑'}
              </span>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 block leading-tight">
                  {userProfile.name || 'Kaiwalya'}
                </span>
                <span className="text-[9px] text-amber-700 font-semibold block leading-none">
                  Sep 1 • B'day
                </span>
              </div>
            </button>

            {/* Primary Action Button: Log Entry */}
            <button
              id="nav-btn-add-tx"
              onClick={onOpenNewTx}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 px-3.5 py-2 text-xs font-bold text-white uppercase tracking-wider shadow-sm hover:shadow-indigo-500/20 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">+ Log Entry</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 2: MAIN 6 PILLARS NAVIGATION BAR */}
      {/* ========================================================================= */}
      <div className="px-4 sm:px-6 lg:px-8 py-2 bg-slate-50/80 border-t border-slate-100/70">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
          {/* Main 6 Pillars Horizontal Navigation */}
          <nav className="flex items-center bg-slate-200/70 p-1 rounded-xl border border-slate-200/90 text-xs font-semibold overflow-x-auto no-scrollbar shadow-inner relative w-full sm:w-auto">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              const isActive = activePillar === pillar.id;

              return (
                <button
                  key={pillar.id}
                  id={`pillar-btn-${pillar.id}`}
                  onClick={() => setActivePillar(pillar.id)}
                  className={`relative flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all duration-200 shrink-0 cursor-pointer select-none z-10 ${
                    isActive
                      ? 'text-slate-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pillar-indicator"
                      className="absolute inset-0 bg-white rounded-lg shadow-xs border border-slate-200/90"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className={`h-3.5 w-3.5 ${pillar.color} transition-transform duration-200`} />
                    <span>{pillar.label}</span>
                    {pillar.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                        {pillar.badge}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Pill for Current View */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700 text-[11px]">
              {activePillar === 'dashboard' && 'Unified Executive Dashboard'}
              {activePillar === 'finance' && 'Finance Command Center'}
              {activePillar === 'health' && 'Health & Vitals Center'}
              {activePillar === 'habits' && 'Habits & Streaks Tracker'}
              {activePillar === 'calendar' && 'Calendar 360°'}
              {activePillar === 'planner' && 'Life Planner'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400 font-mono text-[11px]">🇮🇳 INR (₹)</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED 5-ENGINES SUB-NAVBAR (OPENS DIRECTLY BELOW WHEN FINANCE OS IS ACTIVE) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activePillar === 'finance' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-indigo-100/80 bg-gradient-to-r from-indigo-50/90 via-slate-50/90 to-indigo-50/80 px-4 sm:px-6 lg:px-8 shadow-inner"
          >
            <div className="mx-auto max-w-7xl py-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
              {/* The 5 Finance Sub-Engines with Smooth Pill Selection */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 shrink-0">
                <span className="hidden xl:inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-indigo-900/60 mr-1">
                  <Compass className="w-3 h-3 text-indigo-600" />
                  Engines:
                </span>

                {financeTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = financeSubTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      id={`subnav-${tab.id}`}
                      onClick={() => setFinanceSubTab(tab.id)}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 cursor-pointer select-none ${
                        isActive
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : 'bg-white/90 hover:bg-white text-slate-700 hover:text-indigo-900 border border-slate-200/80 shadow-2xs'
                      }`}
                      title={tab.description}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : tab.badgeColor || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions Shortcuts for Finance */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <button
                  id="subnav-btn-ledgers"
                  onClick={onOpenLedgers}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-indigo-200/70 bg-white/90 text-slate-700 hover:text-indigo-900 hover:bg-white text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <Users className="h-3 w-3 text-indigo-600" />
                  <span>Person Khata</span>
                </button>

                <button
                  id="subnav-btn-accounts"
                  onClick={onOpenAccounts}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-indigo-200/70 bg-white/90 text-slate-700 hover:text-indigo-900 hover:bg-white text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <Building2 className="h-3 w-3 text-indigo-600" />
                  <span>Bank Accounts</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
