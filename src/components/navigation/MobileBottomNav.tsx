import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  Activity,
  CheckSquare,
  Plus,
  Compass,
  Calendar,
  Plane,
  Sparkles,
} from 'lucide-react';
import { MainPillar } from '../Navbar';

interface MobileBottomNavProps {
  activePillar: MainPillar;
  setActivePillar: (pillar: MainPillar) => void;
  onOpenQuickAction: () => void;
  onOpenMoreMenu: () => void;
  activeHabitsCount?: number;
  totalTransactionsCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activePillar,
  setActivePillar,
  onOpenQuickAction,
  onOpenMoreMenu,
  activeHabitsCount = 0,
  totalTransactionsCount = 0,
}) => {
  return (
    <div
      id="mobile_bottom_navigation_bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden pb-safe"
    >
      <div className="flex items-center justify-around px-2 py-1.5 h-16 max-w-lg mx-auto">
        {/* 1. Dashboard */}
        <button
          id="mobile-nav-dashboard"
          onClick={() => setActivePillar('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative cursor-pointer ${
            activePillar === 'dashboard'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activePillar === 'dashboard'
                ? 'bg-indigo-50 text-indigo-600 scale-105'
                : ''
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-tight mt-0.5">Dashboard</span>
          {activePillar === 'dashboard' && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-0.5" />
          )}
        </button>

        {/* 2. Finance */}
        <button
          id="mobile-nav-finance"
          onClick={() => setActivePillar('finance')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative cursor-pointer ${
            activePillar === 'finance'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all relative ${
              activePillar === 'finance'
                ? 'bg-indigo-50 text-indigo-600 scale-105'
                : ''
            }`}
          >
            <Wallet className="w-5 h-5" />
            {totalTransactionsCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[8px] font-extrabold bg-indigo-600 text-white rounded-full px-1 min-w-[14px] h-[14px] flex items-center justify-center">
                {totalTransactionsCount > 99 ? '99+' : totalTransactionsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight mt-0.5">Finance</span>
          {activePillar === 'finance' && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-0.5" />
          )}
        </button>

        {/* 3. Center Quick Action "+" Button */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-5">
          <button
            id="mobile-nav-quick-add"
            onClick={onOpenQuickAction}
            aria-label="Quick Log Entry"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-700 via-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center active:scale-90 transition-transform cursor-pointer border-2 border-white ring-2 ring-indigo-100"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[10px] font-extrabold text-indigo-700 mt-1">
            + Log
          </span>
        </div>

        {/* 4. Health */}
        <button
          id="mobile-nav-health"
          onClick={() => setActivePillar('health')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative cursor-pointer ${
            activePillar === 'health'
              ? 'text-rose-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activePillar === 'health'
                ? 'bg-rose-50 text-rose-600 scale-105'
                : ''
            }`}
          >
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-tight mt-0.5">Health</span>
          {activePillar === 'health' && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-0.5" />
          )}
        </button>

        {/* 5. Habits / Life Hub */}
        <button
          id="mobile-nav-more"
          onClick={onOpenMoreMenu}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative cursor-pointer ${
            ['habits', 'calendar', 'planner'].includes(activePillar)
              ? 'text-purple-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all relative ${
              ['habits', 'calendar', 'planner'].includes(activePillar)
                ? 'bg-purple-50 text-purple-600 scale-105'
                : ''
            }`}
          >
            <Compass className="w-5 h-5" />
            {activeHabitsCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[8px] font-extrabold bg-purple-600 text-white rounded-full px-1 min-w-[14px] h-[14px] flex items-center justify-center">
                {activeHabitsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight mt-0.5">
            {activePillar === 'habits'
              ? 'Habits'
              : activePillar === 'calendar'
              ? 'Calendar'
              : activePillar === 'planner'
              ? 'Planner'
              : 'More'}
          </span>
          {['habits', 'calendar', 'planner'].includes(activePillar) && (
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};
