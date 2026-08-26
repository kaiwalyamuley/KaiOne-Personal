import React from 'react';
import {
  Sparkles,
  Calendar as CalendarIcon,
  Crown,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  Info,
  Gift,
} from 'lucide-react';
import { MonthlyFestivalArt } from '../../types';

interface FestivalHeroArtProps {
  festivalArt: MonthlyFestivalArt;
  selectedYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToCurrentMonth: () => void;
  onOpenAddEventModal: () => void;
}

export const FestivalHeroArt: React.FC<FestivalHeroArtProps> = ({
  festivalArt,
  selectedYear,
  onPrevMonth,
  onNextMonth,
  onJumpToCurrentMonth,
  onOpenAddEventModal,
}) => {
  const isSeptember = festivalArt.monthIndex === 8; // Month 8 is September (0-indexed)

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/20 shadow-md bg-gradient-to-r ${festivalArt.gradientBg} text-white p-6 sm:p-8 transition-all duration-500`}
    >
      {/* Dynamic Background SVG Festive Motifs */}
      <div className="absolute inset-0 pointer-events-none opacity-15 overflow-hidden">
        {festivalArt.artMotif === 'ganesh_birthday' && (
          <svg className="absolute -right-10 -bottom-10 w-96 h-96 text-white" viewBox="0 0 200 200" fill="currentColor">
            {/* Ganesha Symbolic Motif & Sacred Modak */}
            <path d="M100,20 C85,20 75,30 75,45 C75,60 85,70 100,70 C115,70 125,60 125,45 C125,30 115,20 100,20 Z" />
            <path d="M100,75 C70,75 45,95 45,130 C45,165 75,185 100,185 C125,185 155,165 155,130 C155,95 130,75 100,75 Z" opacity="0.6" />
            <circle cx="100" cy="40" r="6" />
            <path d="M88,50 Q100,90 112,50" stroke="currentColor" strokeWidth="4" fill="none" />
            <circle cx="70" cy="110" r="14" />
            <circle cx="130" cy="110" r="14" />
          </svg>
        )}

        {festivalArt.artMotif === 'diwali_diyas' && (
          <svg className="absolute right-0 bottom-0 w-80 h-80 text-yellow-200" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 20 Q55 5 50 0 Q45 5 50 20 Z" />
            <path d="M20 50 Q50 90 80 50 Q50 60 20 50 Z" />
          </svg>
        )}

        {festivalArt.artMotif === 'holi_colors' && (
          <svg className="absolute -right-8 -top-8 w-80 h-80 text-pink-300" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="30" cy="30" r="25" />
            <circle cx="70" cy="40" r="20" />
            <circle cx="50" cy="70" r="28" />
          </svg>
        )}

        {/* Decorative Grid Mesh overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
      </div>

      {/* Floating Sparkle Particles */}
      <div className="absolute top-4 right-1/3 opacity-40 animate-pulse hidden md:block">
        <Sparkles className="w-6 h-6 text-amber-200" />
      </div>
      <div className="absolute bottom-6 left-1/4 opacity-30 animate-pulse hidden md:block">
        <Star className="w-4 h-4 text-white" />
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {/* Header Bar: Month Navigator, Year, Quick Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-black/20 backdrop-blur-md rounded-2xl p-1 border border-white/20">
              <button
                id="btn-calendar-prev-month"
                onClick={onPrevMonth}
                className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 text-center">
                <span className="text-xs uppercase tracking-wider font-semibold opacity-80 block">
                  Calendar Month
                </span>
                <span className="text-sm font-extrabold tracking-wide font-mono">
                  {festivalArt.monthName} {selectedYear}
                </span>
              </div>
              <button
                id="btn-calendar-next-month"
                onClick={onNextMonth}
                className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onJumpToCurrentMonth}
              className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-xs font-bold text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>Current Month</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddEventModal}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-amber-50 text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Add Event / Reminder</span>
            </button>
          </div>
        </div>

        {/* Hero Banner Body: Festive Title & Cultural Highlight */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            {/* Tag / Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide border border-white/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Monthly Festival Arts & Observances</span>
              </span>

              {isSeptember && (
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-extrabold tracking-wide border border-amber-300 shadow-sm flex items-center gap-1 animate-bounce">
                  <Crown className="w-3.5 h-3.5 text-slate-950" />
                  <span>👑 VIP: Kaiwalya's Birthday (1st Sep) & Ganpati Festival</span>
                </span>
              )}
            </div>

            {/* Main Hero Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-heading leading-tight drop-shadow-xs">
              {festivalArt.heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-white/90 max-w-2xl font-medium leading-relaxed">
              {festivalArt.heroSubtitle}
            </p>

            {/* Cultural Quote Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 text-xs text-amber-200 font-serif italic">
              <span>{festivalArt.culturalQuote}</span>
            </div>
          </div>

          {/* Right Side: Major Month Festivities Cards */}
          <div className="lg:col-span-4 bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-inner space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-white/90 border-b border-white/15 pb-2">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                Key Dates in {festivalArt.monthName}
              </span>
              <span className="text-[10px] text-white/60 font-mono">
                {festivalArt.festivals.length} Highlights
              </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {festivalArt.festivals.map((fest, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl transition-all border ${
                    fest.isPersonalMilestone
                      ? 'bg-amber-500/30 border-amber-300/60 shadow-xs'
                      : 'bg-white/10 border-white/10 hover:bg-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{fest.icon}</span>
                      <span className="text-xs font-bold text-white truncate">
                        {fest.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-white/20 font-mono shrink-0">
                      {fest.dateStr}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/80 mt-1 line-clamp-2 leading-relaxed">
                    {fest.culturalNote}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
