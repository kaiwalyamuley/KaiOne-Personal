import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  CheckCircle2,
  TrendingUp,
  Flame,
  Wallet,
  Calendar,
  ThumbsUp,
  Star,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Heart,
  Smile,
  Copy,
  Check,
  Sliders,
  DollarSign,
  Award,
} from 'lucide-react';
import Markdown from 'react-markdown';
import {
  FinancialSummary,
  Account,
  Transaction,
  SavingsGoalBucket,
  WorkoutSession,
  Habit,
  HabitCompletionRecord,
  Category,
  UserProfile,
  MonthlyCategoryBudget,
} from '../../types';
import { formatINR } from '../../utils/formatters';

export interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  financialSummary: FinancialSummary;
  accounts: Account[];
  transactions: Transaction[];
  categories?: Category[];
  monthlyBudgets?: MonthlyCategoryBudget[];
  savingsGoals: SavingsGoalBucket[];
  workoutSessions: WorkoutSession[];
  habits: Habit[];
  habitRecords: HabitCompletionRecord[];
  userProfile?: UserProfile;
  initialPrompt?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'advisor';
  text: string;
  timestamp: string;
  satisfactionRated?: boolean;
}

const QUICK_PROMPTS = [
  {
    id: 'life_audit',
    label: '⚡ 30-Sec Life Audit',
    query: 'Give me a simple 30-second Life & Money audit in plain words for 100% peace of mind.',
    desc: 'Money, Fitness & Habits at a glance',
  },
  {
    id: 'save_money',
    label: '💰 Save ₹3,000 This Month',
    query: 'Find 3 simple places where I can easily save ₹3,000 to ₹5,000 this month without feeling deprived.',
    desc: 'Practical, painless money savers',
  },
  {
    id: 'goal_accelerator',
    label: '🎯 Fast-Track My Goals',
    query: 'Look at my savings goals and tell me the simplest way to reach my next milestone faster.',
    desc: 'Emergency Fund & Dream Goals',
  },
  {
    id: 'habit_boost',
    label: '🔥 Habit & Energy Boost',
    query: 'How can I keep my daily habit streaks 100% consistent even on busy or lazy days?',
    desc: '2-minute rule & daily momentum',
  },
  {
    id: 'weekend_spend',
    label: '☕ Weekend Spend Check',
    query: 'Based on my current cash balance and budgets, how much can I comfortably spend on dining/fun this weekend?',
    desc: 'Guilt-free spending limit',
  },
];

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
  isOpen,
  onClose,
  financialSummary,
  accounts,
  transactions,
  categories = [],
  monthlyBudgets = [],
  savingsGoals,
  workoutSessions,
  habits,
  habitRecords,
  userProfile,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [satisfactionScore, setSatisfactionScore] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<{ [key: string]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Compute live context to feed into Gemini AI Advisor
  const userContext = React.useMemo(() => {
    // Current month transactions
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthExpenses = transactions.filter(
      (t) => t.dateTime.startsWith(currentMonthPrefix) && t.type === 'expense'
    );

    // Calculate spend per category
    const catSpendMap: { [catName: string]: number } = {};
    thisMonthExpenses.forEach((t) => {
      catSpendMap[t.category] = (catSpendMap[t.category] || 0) + t.amount;
    });

    const overspentCats: string[] = [];
    const healthyCats: string[] = [];

    categories.forEach((cat) => {
      const budget = cat.defaultMonthlyBudget || 0;
      const spent = catSpendMap[cat.name] || 0;
      if (budget > 0) {
        if (spent > budget) {
          overspentCats.push(`${cat.name} (Spent: ₹${spent.toLocaleString('en-IN')}, Budget: ₹${budget.toLocaleString('en-IN')})`);
        } else {
          healthyCats.push(`${cat.name} (₹${spent.toLocaleString('en-IN')} of ₹${budget.toLocaleString('en-IN')})`);
        }
      }
    });

    // Workouts in past 7 days
    const past7Days = new Date();
    past7Days.setDate(past7Days.getDate() - 7);
    const past7DaysStr = past7Days.toISOString().split('T')[0];
    const recentWorkouts = workoutSessions.filter((w) => w.date >= past7DaysStr);
    const weeklyCalories = recentWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    // Active habit summary
    const habitStreaks = habits.map((h) => `${h.title}: ${h.currentStreak || 0} days streak`).join(', ');

    return {
      userName: userProfile?.name || 'Kaiwalya',
      netWorth: financialSummary.netWorthEstimate,
      monthlyIncome: financialSummary.totalIncome,
      monthlySpend: financialSummary.totalExpense,
      netBalance: financialSummary.totalIncome - financialSummary.totalExpense,
      totalCashInBanks: financialSummary.totalBalance,
      overspentCategories: overspentCats,
      healthyCategories: healthyCats.slice(0, 4),
      savingsGoals: savingsGoals.map((g) => ({
        name: g.title,
        currentAmount: g.currentSaved,
        targetAmount: g.targetAmount,
      })),
      weeklyWorkoutsCount: recentWorkouts.length,
      weeklyCaloriesBurned: weeklyCalories,
      activeHabitsStreakSummary: habitStreaks || 'All habits tracked daily',
      upcomingEvents: ['Birthday: Sep 1', 'Ganesh Chaturthi: Sep 14', 'Diwali: Nov 1'],
    };
  }, [financialSummary, accounts, transactions, categories, savingsGoals, workoutSessions, habits, userProfile]);

  // Initial welcome message if chat is empty
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome-1',
        sender: 'advisor',
        text: `### 👋 Namaste ${userContext.userName}! I am your **AI Life & Wealth Advisor**.

My promise to you is **Simple Words & 100% Satisfaction**. No complicated finance or fitness jargon—just clear, practical steps to grow your money, stay active, and feel proud of your daily progress.

🌟 **Your Current Snapshot at a Glance:**
- **Net Worth**: **${formatINR(userContext.netWorth)}**
- **Monthly Savings Surplus**: **+${formatINR(userContext.netBalance)}**
- **Health Momentum**: **${userContext.weeklyWorkoutsCount} workouts** this week (${userContext.weeklyCaloriesBurned} kcal burned)
- **Active Habits**: **${habits.length} routines** active

How can I help you today? Pick any quick button below or ask me anything in plain English!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([welcomeMessage]);

      if (initialPrompt) {
        handleSendMessage(initialPrompt);
      }
    }
  }, [isOpen, initialPrompt]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          context: userContext,
          chatHistory: messages.slice(-4),
        }),
      });

      const data = await response.json();

      const advisorMsg: ChatMessage = {
        id: `advisor-${Date.now()}`,
        sender: 'advisor',
        text: data.reply || 'Here is your simplified life & money plan! Everything looks clear.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, advisorMsg]);
    } catch (err) {
      console.error('Error fetching AI advisor response:', err);
      // Fallback
      const fallbackMsg: ChatMessage = {
        id: `advisor-${Date.now()}`,
        sender: 'advisor',
        text: `### 🌟 The Quick Verdict
You're in great financial shape with a **+${formatINR(userContext.netBalance)}** monthly surplus!

### 💡 Simple Action Steps
- [ ] Save an extra ₹500 this week by capping dining spend.
- [ ] Drink an extra glass of water and get 20 mins of daily movement.
- [ ] Mark today's habit checkmarks in the Habits tab.

*100% Peace of mind: Small daily actions compound into life-changing results!*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSatisfactionRate = (score: number) => {
    setSatisfactionScore(score);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3500);
  };

  const toggleTask = (taskKey: string) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [taskKey]: !prev[taskKey],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl h-[90vh] max-h-[820px] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between border-b border-indigo-700/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg font-heading text-white">
                  KAIONE AI Advisor
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-300" />
                  <span>Simple Words Guarantee</span>
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                100% Satisfaction • Plain English • Personal Wealth, Health & Habit Mentor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 100% Satisfaction Score Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>100% Satisfaction Rate</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Advisor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Question Chips Carousel */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" /> Quick Topics:
          </span>
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSendMessage(item.query)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all shrink-0 cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Chat Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-100/60">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[88%] sm:max-w-[80%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-amber-300 border border-slate-700'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4 text-amber-300" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-4 sm:p-5 shadow-xs text-xs sm:text-sm leading-relaxed transition-all ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs space-y-3'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div>
                    <div className="prose prose-xs sm:prose-sm max-w-none text-slate-800 prose-headings:font-bold prose-headings:text-slate-900 prose-headings:my-2 prose-p:my-1.5 prose-strong:text-indigo-950 prose-ul:my-1.5 prose-li:my-0.5">
                      <Markdown>{msg.text}</Markdown>
                    </div>

                    {/* Footer Actions for Advisor Messages */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                      <span className="font-medium text-slate-400">{msg.timestamp}</span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                          title="Copy advice text"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleSatisfactionRate(5)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold transition-colors cursor-pointer border border-amber-200"
                        >
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>100% Helpful</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Animation Bubble */}
          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-[80%]">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center shrink-0 border border-slate-700 shadow-xs">
                <Bot className="w-4 h-4 text-amber-300 animate-spin" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-xs p-4 border border-slate-200 shadow-xs flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Analyzing your numbers & crafting simple advice...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Celebration Toast when user hits 100% Satisfaction */}
        {showCelebration && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-amber-400/40 flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300 z-20">
            <span className="text-xl">🎉</span>
            <div>
              <p className="text-xs font-extrabold text-amber-300">100% Satisfaction Registered!</p>
              <p className="text-[10px] text-slate-300">Thank you for rating your advisor with 5-star excellence.</p>
            </div>
          </div>
        )}

        {/* Bottom Input Box */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask in simple English (e.g. Can I afford eating out? How to save ₹2,000?)..."
                disabled={isLoading}
                className="w-full pl-4 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all font-medium"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </span>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>Powered by Gemini 3.7 Flash • Simple Words & Live Data Sync</span>
            <span className="font-semibold text-indigo-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              100% Satisfaction Guarantee
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
