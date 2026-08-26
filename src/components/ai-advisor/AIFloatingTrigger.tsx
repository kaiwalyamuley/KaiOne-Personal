import React from 'react';
import { Sparkles, ShieldCheck, Bot } from 'lucide-react';

interface AIFloatingTriggerProps {
  onOpen: () => void;
}

export const AIFloatingTrigger: React.FC<AIFloatingTriggerProps> = ({ onOpen }) => {
  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={onOpen}
        className="group flex items-center gap-2.5 px-3.5 py-2.5 md:px-4 md:py-3 rounded-full bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl hover:shadow-2xl border border-amber-400/40 hover:border-amber-300 transition-all hover:scale-105 cursor-pointer ring-4 ring-indigo-500/10 active:scale-95"
        title="Open AI Advisor (Simple Words, 100% Satisfaction)"
      >
        <div className="relative">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 p-0.5 flex items-center justify-center shadow-xs">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            </div>
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border border-slate-900 rounded-full animate-ping" />
        </div>

        <div className="text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-extrabold text-xs tracking-tight text-white font-heading">
              AI Advisor
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
              100%
            </span>
          </div>
          <span className="text-[10px] text-indigo-200 font-medium leading-tight block mt-0.5">
            Simple Words
          </span>
        </div>
      </button>
    </div>
  );
};
