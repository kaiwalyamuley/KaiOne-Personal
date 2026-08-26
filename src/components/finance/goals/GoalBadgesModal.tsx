import React from 'react';
import { X, Award, Flame, Zap, Trophy, Crown, Coins, Sprout, CheckCircle2, Lock } from 'lucide-react';
import { GoalAchievementBadge } from '../../../types';

interface GoalBadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: GoalAchievementBadge[];
}

export const GoalBadgesModal: React.FC<GoalBadgesModalProps> = ({ isOpen, onClose, badges }) => {
  if (!isOpen) return null;

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5" />;
      case 'Crown':
        return <Crown className="w-5 h-5" />;
      case 'Coins':
        return <Coins className="w-5 h-5" />;
      case 'Sprout':
        return <Sprout className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-amber-500/10 via-indigo-50/50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 font-heading">
                  Goal Savings Badges & Milestones
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                  {unlockedCount} / {badges.length} Unlocked
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Celebrate monthly streaks and consistency in building wealth
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Badges Grid */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {badges.map((badge) => {
              const isUnlocked = badge.isUnlocked;

              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    isUnlocked
                      ? 'bg-white border-amber-200 shadow-xs ring-1 ring-amber-100'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isUnlocked ? getIconComponent(badge.icon) : <Lock className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{badge.title}</h4>
                      {isUnlocked && (
                        <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded uppercase">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{badge.description}</p>

                    {isUnlocked && badge.unlockedAt && (
                      <p className="text-[9px] text-amber-700 font-semibold mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Unlocked on {badge.unlockedAt}
                      </p>
                    )}

                    {!isUnlocked && (
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
                          <span>Progress:</span>
                          <span>{badge.progressPercent.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${badge.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Keep contributing every month to maintain your streak flame 🔥</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
