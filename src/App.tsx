/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle,
  Users,
  Building2,
  Download,
  Wallet,
  Activity,
  CheckSquare,
  Sparkles,
  TrendingUp,
  Landmark,
  Layers,
  Flame,
  Target,
  RefreshCw,
} from 'lucide-react';
import {
  Account,
  Category,
  CreditCard,
  FinancialSummary,
  Loan,
  MonthlyCategoryBudget,
  PersonLedger,
  Transaction,
  TransactionType,
  SavingsGoalBucket,
  GoalAchievementBadge,
  GoalContribution,
  WealthForecastParams,
  VitalsLog,
  WorkoutSession,
  Habit,
  HabitCompletionRecord,
  HabitBadge,
  UserProfile,
  VacationPlan,
  DateToRemember,
  RecurringRule,
} from './types';
import {
  loadTransactions,
  saveTransactions,
  loadAccounts,
  saveAccounts,
  loadCategories,
  saveCategories,
  loadCreditCards,
  saveCreditCards,
  loadLoans,
  saveLoans,
  loadSavingsGoals,
  saveSavingsGoals,
  loadGoalBadges,
  saveGoalBadges,
  loadWealthParams,
  saveWealthParams,
  loadVitalsLogs,
  saveVitalsLogs,
  loadWorkouts,
  saveWorkouts,
  loadHabits,
  saveHabits,
  loadHabitCompletions,
  saveHabitCompletions,
  loadHabitBadges,
  saveHabitBadges,
  loadUserProfile,
  saveUserProfile,
  loadVacations,
  saveVacations,
  loadDatesToRemember,
  saveDatesToRemember,
  loadRecurringRules,
  saveRecurringRules,
  calculateAccountBalances,
  calculateFinancialSummary,
  calculatePersonLedgers,
} from './utils/storage';
import {
  loadMonthlyBudgets,
  saveMonthlyBudgets,
  INITIAL_MONTHLY_BUDGETS,
} from './utils/budgetUtils';
import {
  INITIAL_SAMPLE_TRANSACTIONS,
  DEFAULT_ACCOUNTS,
  DEFAULT_CATEGORIES,
  DEFAULT_CREDIT_CARDS,
  DEFAULT_LOANS,
  DEFAULT_SAVINGS_GOALS,
  DEFAULT_GOAL_BADGES,
  DEFAULT_WEALTH_PARAMS,
  DEFAULT_VITALS_LOGS,
  DEFAULT_WORKOUT_SESSIONS,
  DEFAULT_HABITS,
  DEFAULT_HABIT_BADGES,
  DEFAULT_RECURRING_RULES,
} from './utils/defaultData';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_VACATIONS,
  DEFAULT_DATES_TO_REMEMBER,
} from './utils/calendarAndPlannerData';
import {
  processAllDueRecurringRules,
  executeSingleRuleManually,
} from './utils/recurringEngine';
import { formatINR } from './utils/formatters';
import { Navbar, MainPillar, FinanceSubTab } from './components/Navbar';
import { SummaryCards } from './components/SummaryCards';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { PersonLedgerModal } from './components/PersonLedgerModal';
import { AccountsModal } from './components/AccountsModal';
import { ExportImportModal } from './components/ExportImportModal';
import { FinancialEngineView } from './components/financial-engine/FinancialEngineView';
import { BudgetEngineView } from './components/budget-engine/BudgetEngineView';
import { GoalSavingsBucketsView } from './components/finance/goals/GoalSavingsBucketsView';
import { WealthForecastingView } from './components/finance/forecasting/WealthForecastingView';
import { RecurringTransactionsView } from './components/finance/RecurringTransactionsView';
import { HealthModuleView } from './components/health/HealthModuleView';
import { HabitsModuleView } from './components/habits/HabitsModuleView';
import { UnifiedDashboardView } from './components/dashboard/UnifiedDashboardView';
import { CalendarView } from './components/calendar/CalendarView';
import { LifePlannerView } from './components/planner/LifePlannerView';
import { PersonalProfileModal } from './components/profile/PersonalProfileModal';
import { AddEditDateModal } from './components/planner/AddEditDateModal';
import { AddEditVacationModal } from './components/planner/AddEditVacationModal';
import { LogVitalsModal } from './components/health/LogVitalsModal';
import { LogWorkoutModal } from './components/health/LogWorkoutModal';
import { AddEditHabitModal } from './components/habits/AddEditHabitModal';
import { User } from 'firebase/auth';
import { CategoryManagementModal } from './components/categories/CategoryManagementModal';
import { AddEditCategoryModal } from './components/categories/AddEditCategoryModal';
import { AddEditAccountModal } from './components/financial-engine/AddEditAccountModal';
import { AIAdvisorModal } from './components/ai-advisor/AIAdvisorModal';
import { AIFloatingTrigger } from './components/ai-advisor/AIFloatingTrigger';
import { MultiDeviceSyncModal } from './components/sync/MultiDeviceSyncModal';
import { GmailDailyReminderModal } from './components/sync/GmailDailyReminderModal';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { MobileQuickActionMenu } from './components/navigation/MobileQuickActionMenu';
import { motion, AnimatePresence } from 'motion/react';
import {
  initAuth,
  subscribeToSubcollection,
  subscribeToUserProfile,
  syncSaveDoc,
  syncDeleteDoc,
  syncSaveUserProfile,
  migrateLocalDataToCloud,
  getDynamicSyncTokenFromUrl,
  getEffectiveSyncId,
  autoSeedCloudIfEmpty,
  ensureCleanFreshSlate,
  setCustomSyncCode,
  wipeAndResetAllData,
  DEFAULT_SYNC_WORKSPACE_ID,
} from './utils/firebaseSync';

export default function App() {
  // Navigation State: Dashboard + 3 Main Pillars + Finance 5 Sub-Modules
  const [activePillar, setActivePillar] = useState<MainPillar>('dashboard');
  const [financeSubTab, setFinanceSubTab] = useState<FinanceSubTab>('daily_log');
  const [activeTypeFilter, setActiveTypeFilter] = useState<TransactionType | 'all'>('all');
  const [isMobileQuickMenuOpen, setIsMobileQuickMenuOpen] = useState<boolean>(false);

  // Firebase Multi-Device Dynamic Sync State (<20ms Latency)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authUserId, setAuthUserId] = useState<string>(() => getEffectiveSyncId());
  const [syncLatencyMs, setSyncLatencyMs] = useState<number>(2);
  const [isSyncConnected, setIsSyncConnected] = useState<boolean>(true);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isGmailReminderModalOpen, setIsGmailReminderModalOpen] = useState<boolean>(false);

  // Pillar 1: Finance State
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>(() => loadRecurringRules());
  const [accounts, setAccounts] = useState<Account[]>(() => loadAccounts());
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [creditCards, setCreditCards] = useState<CreditCard[]>(() => loadCreditCards());
  const [loans, setLoans] = useState<Loan[]>(() => loadLoans());
  const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyCategoryBudget[]>(() => loadMonthlyBudgets());
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoalBucket[]>(() => loadSavingsGoals());
  const [goalBadges, setGoalBadges] = useState<GoalAchievementBadge[]>(() => loadGoalBadges());
  const [wealthParams, setWealthParams] = useState<WealthForecastParams>(() => loadWealthParams());

  // Automatic Due Recurring Rules Processor on App Load
  useEffect(() => {
    if (recurringRules.length > 0) {
      const result = processAllDueRecurringRules(recurringRules);
      if (result.generatedTransactions.length > 0) {
        setTransactions((prev) => [...result.generatedTransactions, ...prev]);
        saveTransactions([...result.generatedTransactions, ...transactions]);
        setRecurringRules(result.updatedRules);
        saveRecurringRules(result.updatedRules);
        if (authUserId) {
          result.generatedTransactions.forEach((tx) => syncSaveDoc(authUserId, 'transactions', tx));
          result.updatedRules.forEach((rule) => syncSaveDoc(authUserId, 'recurringRules', rule));
        }
      }
    }
  }, []);

  // Pillar 2: Health State
  const [vitalsLogs, setVitalsLogs] = useState<VitalsLog[]>(() => loadVitalsLogs());
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(() => loadWorkouts());
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);

  // Pillar 3: Habits State
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletionRecord[]>(() => loadHabitCompletions());
  const [habitBadges, setHabitBadges] = useState<HabitBadge[]>(() => loadHabitBadges());
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Pillar 4 & 5: Profile, Vacations & Dates to Remember State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());
  const [vacations, setVacations] = useState<VacationPlan[]>(() => loadVacations());
  const [datesToRemember, setDatesToRemember] = useState<DateToRemember[]>(() => loadDatesToRemember());

  // Initialize Firebase Auth & Real-Time Sync Token
  useEffect(() => {
    ensureCleanFreshSlate();
    getDynamicSyncTokenFromUrl();
    const unsubAuth = initAuth((user) => {
      setCurrentUser(user);
      const syncId = getEffectiveSyncId(user);
      setAuthUserId(syncId);
      setIsSyncConnected(true);
    });
    return () => unsubAuth();
  }, []);

  // Multi-Device Cloud Real-Time Firestore Sync Listeners & Cloud Auto-Seed
  useEffect(() => {
    if (!authUserId) return;

    // Auto-seed cloud if the cloud collection is empty so other devices immediately sync
    autoSeedCloudIfEmpty(authUserId, {
      transactions,
      recurringRules,
      accounts,
      categories,
      creditCards,
      loans,
      monthlyBudgets,
      savingsGoals,
      goalBadges,
      wealthParams,
      habits,
      habitCompletions,
      habitBadges,
      workouts,
      vitalsLogs,
      vacations,
      datesToRemember,
      userProfile,
    });

    const unsubs: (() => void)[] = [];

    // Transactions listener (sorted newest first)
    unsubs.push(
      subscribeToSubcollection<Transaction>(authUserId, 'transactions', (items) => {
        const sorted = [...items].sort((a, b) => {
          const timeA = new Date(a.dateTime || a.createdAt || 0).getTime();
          const timeB = new Date(b.dateTime || b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        setTransactions(sorted);
        saveTransactions(sorted);
      })
    );

    // Recurring Rules listener
    unsubs.push(
      subscribeToSubcollection<RecurringRule>(authUserId, 'recurringRules', (items) => {
        setRecurringRules(items);
        saveRecurringRules(items);
      })
    );

    // Accounts listener
    unsubs.push(
      subscribeToSubcollection<Account>(authUserId, 'accounts', (items) => {
        if (items.length > 0) {
          setAccounts(items);
          saveAccounts(items);
        } else {
          setAccounts(DEFAULT_ACCOUNTS);
          saveAccounts(DEFAULT_ACCOUNTS);
        }
      })
    );

    // Categories listener
    unsubs.push(
      subscribeToSubcollection<Category>(authUserId, 'categories', (items) => {
        if (items.length > 0) {
          setCategories(items);
          saveCategories(items);
        } else {
          setCategories(DEFAULT_CATEGORIES);
          saveCategories(DEFAULT_CATEGORIES);
        }
      })
    );

    // Credit Cards listener
    unsubs.push(
      subscribeToSubcollection<CreditCard>(authUserId, 'creditCards', (items) => {
        setCreditCards(items);
        saveCreditCards(items);
      })
    );

    // Loans listener
    unsubs.push(
      subscribeToSubcollection<Loan>(authUserId, 'loans', (items) => {
        setLoans(items);
        saveLoans(items);
      })
    );

    // Monthly Budgets listener
    unsubs.push(
      subscribeToSubcollection<MonthlyCategoryBudget>(authUserId, 'monthlyBudgets', (items) => {
        setMonthlyBudgets(items);
        saveMonthlyBudgets(items);
      })
    );

    // Savings Goals listener
    unsubs.push(
      subscribeToSubcollection<SavingsGoalBucket>(authUserId, 'savingsGoals', (items) => {
        setSavingsGoals(items);
        saveSavingsGoals(items);
      })
    );

    // Goal Badges listener
    unsubs.push(
      subscribeToSubcollection<GoalAchievementBadge>(authUserId, 'goalBadges', (items) => {
        setGoalBadges(items);
        saveGoalBadges(items);
      })
    );

    // Habits listener
    unsubs.push(
      subscribeToSubcollection<Habit>(authUserId, 'habits', (items) => {
        setHabits(items);
        saveHabits(items);
      })
    );

    // Habit Completions listener
    unsubs.push(
      subscribeToSubcollection<HabitCompletionRecord>(authUserId, 'habitCompletions', (items) => {
        setHabitCompletions(items);
        saveHabitCompletions(items);
      })
    );

    // Habit Badges listener
    unsubs.push(
      subscribeToSubcollection<HabitBadge>(authUserId, 'habitBadges', (items) => {
        setHabitBadges(items);
        saveHabitBadges(items);
      })
    );

    // Workouts listener
    unsubs.push(
      subscribeToSubcollection<WorkoutSession>(authUserId, 'workouts', (items) => {
        setWorkouts(items);
        saveWorkouts(items);
      })
    );

    // Vitals listener
    unsubs.push(
      subscribeToSubcollection<VitalsLog>(authUserId, 'vitals', (items) => {
        setVitalsLogs(items);
        saveVitalsLogs(items);
      })
    );

    // Vacations listener
    unsubs.push(
      subscribeToSubcollection<VacationPlan>(authUserId, 'vacations', (items) => {
        setVacations(items);
        saveVacations(items);
      })
    );

    // Dates to remember listener
    unsubs.push(
      subscribeToSubcollection<DateToRemember>(authUserId, 'datesToRemember', (items) => {
        setDatesToRemember(items);
        saveDatesToRemember(items);
      })
    );

    // User Profile listener
    unsubs.push(
      subscribeToUserProfile(authUserId, (profile) => {
        if (profile && profile.name) {
          setUserProfile(profile);
          saveUserProfile(profile);
        }
      })
    );

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [authUserId]);

  const handleMigrateLocalToCloud = async () => {
    if (!authUserId) return;
    await migrateLocalDataToCloud(authUserId, {
      transactions,
      recurringRules,
      accounts,
      categories,
      creditCards,
      loans,
      monthlyBudgets,
      savingsGoals,
      goalBadges,
      wealthParams,
      habits,
      habitCompletions,
      habitBadges,
      workouts,
      vitalsLogs,
      vacations,
      datesToRemember,
      userProfile,
    });
  };

  const handleSwitchSyncWorkspace = (newWorkspaceId: string) => {
    setAuthUserId(newWorkspaceId);
  };

  // Profile & Planner Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddDateModalOpen, setIsAddDateModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<DateToRemember | null>(null);
  const [isAddVacationModalOpen, setIsAddVacationModalOpen] = useState(false);
  const [editingVacation, setEditingVacation] = useState<VacationPlan | null>(null);

  // Transaction Form & Navigation Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [formDefaultType, setFormDefaultType] = useState<TransactionType>('expense');
  const [formDefaultPerson, setFormDefaultPerson] = useState<string>('');
  const [formDefaultAccountFrom, setFormDefaultAccountFrom] = useState<string>('');
  const [formDefaultAccountTo, setFormDefaultAccountTo] = useState<string>('');
  const [formDefaultCategory, setFormDefaultCategory] = useState<string>('');
  const [formDefaultAmount, setFormDefaultAmount] = useState<number | undefined>(undefined);
  const [formDefaultDescription, setFormDefaultDescription] = useState<string>('');

  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // AI Advisor State (Simple Words & 100% Satisfaction)
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [aiAdvisorInitialPrompt, setAiAdvisorInitialPrompt] = useState<string | undefined>(undefined);

  const handleOpenAIAdvisor = (prompt?: string) => {
    setAiAdvisorInitialPrompt(prompt);
    setIsAIAdvisorOpen(true);
  };

  // Category & Quick Bank Account Modal States
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isQuickAddAccountOpen, setIsQuickAddAccountOpen] = useState(false);
  const [editingQuickAccount, setEditingQuickAccount] = useState<Account | null>(null);

  // Sync to localStorage
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveCreditCards(creditCards);
  }, [creditCards]);

  useEffect(() => {
    saveLoans(loans);
  }, [loans]);

  useEffect(() => {
    saveMonthlyBudgets(monthlyBudgets);
  }, [monthlyBudgets]);

  useEffect(() => {
    saveSavingsGoals(savingsGoals);
  }, [savingsGoals]);

  useEffect(() => {
    saveGoalBadges(goalBadges);
  }, [goalBadges]);

  useEffect(() => {
    saveWealthParams(wealthParams);
  }, [wealthParams]);

  useEffect(() => {
    saveVitalsLogs(vitalsLogs);
  }, [vitalsLogs]);

  useEffect(() => {
    saveWorkouts(workouts);
  }, [workouts]);

  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  useEffect(() => {
    saveHabitCompletions(habitCompletions);
  }, [habitCompletions]);

  useEffect(() => {
    saveHabitBadges(habitBadges);
  }, [habitBadges]);

  useEffect(() => {
    saveUserProfile(userProfile);
  }, [userProfile]);

  useEffect(() => {
    saveVacations(vacations);
  }, [vacations]);

  useEffect(() => {
    saveDatesToRemember(datesToRemember);
  }, [datesToRemember]);

  // Derived Calculations
  const accountBalances = useMemo(() => {
    return calculateAccountBalances(accounts, transactions);
  }, [accounts, transactions]);

  const financialSummary: FinancialSummary = useMemo(() => {
    return calculateFinancialSummary(accounts, transactions, creditCards, loans);
  }, [accounts, transactions, creditCards, loans]);

  const personLedgers: PersonLedger[] = useMemo(() => {
    return calculatePersonLedgers(transactions);
  }, [transactions]);

  const formattedToday = useMemo(() => {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  }, []);

  // Handlers for Transactions
  const handleOpenNewTransaction = (
    type: TransactionType = 'expense',
    person?: string,
    accountFrom?: string,
    accountTo?: string,
    category?: string,
    amount?: number,
    description?: string
  ) => {
    setEditTx(null);
    setFormDefaultType(type);
    setFormDefaultPerson(person || '');
    setFormDefaultAccountFrom(accountFrom || '');
    setFormDefaultAccountTo(accountTo || '');
    setFormDefaultCategory(category || '');
    setFormDefaultAmount(amount);
    setFormDefaultDescription(description || '');
    setIsFormOpen(true);
  };

  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    const nowIso = new Date().toISOString();

    if (editId) {
      const updatedTx: Transaction = {
        ...txData,
        id: editId,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setTransactions((prev) =>
        prev.map((t) => (t.id === editId ? updatedTx : t))
      );
      if (authUserId) {
        syncSaveDoc(authUserId, 'transactions', updatedTx).then((lat) => setSyncLatencyMs(lat));
      }
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setTransactions((prev) => [newTx, ...prev]);
      if (authUserId) {
        syncSaveDoc(authUserId, 'transactions', newTx).then((lat) => setSyncLatencyMs(lat));
      }

      if (txData.type === 'transfer' && txData.accountToId) {
        const matchedCard = creditCards.find((c) => c.id === txData.accountToId);
        if (matchedCard) {
          const updatedCard = {
            ...matchedCard,
            currentOutstanding: Math.max(0, matchedCard.currentOutstanding - txData.amount),
          };
          setCreditCards((prev) =>
            prev.map((c) => (c.id === matchedCard.id ? updatedCard : c))
          );
          if (authUserId) {
            syncSaveDoc(authUserId, 'creditCards', updatedCard);
          }
        }
      }
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (authUserId) {
      syncDeleteDoc(authUserId, 'transactions', id).then((lat) => setSyncLatencyMs(lat));
    }
  };

  // Handlers for Recurring Rules
  const handleSaveRecurringRule = (
    ruleData: Omit<RecurringRule, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    const nowIso = new Date().toISOString();
    if (editId) {
      const existing = recurringRules.find((r) => r.id === editId);
      const updatedRule: RecurringRule = {
        ...ruleData,
        id: editId,
        totalTimesGenerated: existing ? existing.totalTimesGenerated : 0,
        totalAmountGenerated: existing ? existing.totalAmountGenerated : 0,
        lastGeneratedDate: existing ? existing.lastGeneratedDate : undefined,
        createdAt: existing ? existing.createdAt : nowIso,
        updatedAt: nowIso,
      };
      setRecurringRules((prev) =>
        prev.map((r) => (r.id === editId ? updatedRule : r))
      );
      saveRecurringRules(
        recurringRules.map((r) => (r.id === editId ? updatedRule : r))
      );
      if (authUserId) {
        syncSaveDoc(authUserId, 'recurringRules', updatedRule).then((lat) => setSyncLatencyMs(lat));
      }
    } else {
      const newRule: RecurringRule = {
        ...ruleData,
        id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        totalTimesGenerated: 0,
        totalAmountGenerated: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      const updatedRules = [newRule, ...recurringRules];
      setRecurringRules(updatedRules);
      saveRecurringRules(updatedRules);
      if (authUserId) {
        syncSaveDoc(authUserId, 'recurringRules', newRule).then((lat) => setSyncLatencyMs(lat));
      }
    }
  };

  const handleDeleteRecurringRule = (id: string) => {
    const updated = recurringRules.filter((r) => r.id !== id);
    setRecurringRules(updated);
    saveRecurringRules(updated);
    if (authUserId) {
      syncDeleteDoc(authUserId, 'recurringRules', id).then((lat) => setSyncLatencyMs(lat));
    }
  };

  const handleToggleRecurringRuleStatus = (id: string, newStatus: 'active' | 'paused' | 'stopped') => {
    let updatedRule: RecurringRule | null = null;
    const updated = recurringRules.map((r) => {
      if (r.id === id) {
        updatedRule = {
          ...r,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
        return updatedRule;
      }
      return r;
    });
    setRecurringRules(updated);
    saveRecurringRules(updated);
    if (updatedRule && authUserId) {
      syncSaveDoc(authUserId, 'recurringRules', updatedRule).then((lat) => setSyncLatencyMs(lat));
    }
  };

  const handleExecuteRecurringRuleNow = (rule: RecurringRule) => {
    const { generatedTransaction, updatedRule } = executeSingleRuleManually(rule);
    const updatedTxs = [generatedTransaction, ...transactions];
    setTransactions(updatedTxs);
    saveTransactions(updatedTxs);

    const updatedRules = recurringRules.map((r) => (r.id === rule.id ? updatedRule : r));
    setRecurringRules(updatedRules);
    saveRecurringRules(updatedRules);

    if (authUserId) {
      syncSaveDoc(authUserId, 'transactions', generatedTransaction).then((lat) => setSyncLatencyMs(lat));
      syncSaveDoc(authUserId, 'recurringRules', updatedRule).then((lat) => setSyncLatencyMs(lat));
    }
  };

  const handleProcessAllDueRecurringRules = () => {
    const result = processAllDueRecurringRules(recurringRules);
    if (result.generatedTransactions.length > 0) {
      const updatedTxs = [...result.generatedTransactions, ...transactions];
      setTransactions(updatedTxs);
      saveTransactions(updatedTxs);

      setRecurringRules(result.updatedRules);
      saveRecurringRules(result.updatedRules);

      if (authUserId) {
        result.generatedTransactions.forEach((tx) => syncSaveDoc(authUserId, 'transactions', tx));
        result.updatedRules.forEach((rule) => syncSaveDoc(authUserId, 'recurringRules', rule));
      }
    }
  };

  const handleDuplicateTransaction = (tx: Transaction) => {
    const duplicated: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_dup`,
      dateTime: new Date().toISOString(),
      description: tx.description ? `${tx.description} (Copy)` : 'Copy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransactions((prev) => [duplicated, ...prev]);
    if (authUserId) {
      syncSaveDoc(authUserId, 'transactions', duplicated).then((lat) => setSyncLatencyMs(lat));
    }
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditTx(tx);
    setIsFormOpen(true);
  };

  const handleQuickSettleFromList = (tx: Transaction) => {
    if (!tx.personName) return;
    const settleType = tx.type === 'lend' ? 'income' : 'expense';
    handleOpenNewTransaction(settleType, tx.personName);
  };

  const handleSettleWithPersonFromModal = (
    personName: string,
    settleType: 'income' | 'expense',
    suggestedAmount: number
  ) => {
    setIsLedgerModalOpen(false);
    handleOpenNewTransaction(
      settleType,
      personName,
      undefined,
      undefined,
      settleType === 'income' ? 'Khata Settlement' : 'Khata Settle Payment',
      suggestedAmount,
      `Khata settlement with ${personName}`
    );
  };

  const handleUpdatePersonPhoneAndDueDate = (
    personName: string,
    phone: string,
    dueDate: string
  ) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.personName && t.personName.toLowerCase() === personName.toLowerCase()) {
          return {
            ...t,
            personPhone: phone || t.personPhone,
            dueDate: dueDate || t.dueDate,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  // Account Handlers
  const handleSaveAccount = (newAcc: Account) => {
    setAccounts((prev) => {
      const exists = prev.some((a) => a.id === newAcc.id);
      if (exists) {
        return prev.map((a) => (a.id === newAcc.id ? newAcc : a));
      }
      return [...prev, newAcc];
    });
    if (authUserId) {
      syncSaveDoc(authUserId, 'accounts', newAcc).then((lat) => setSyncLatencyMs(lat));
    }
  };

  const handleDeleteAccount = (accId: string) => {
    if (accounts.length <= 1) {
      alert('You must keep at least one account.');
      return;
    }
    if (window.confirm('Delete this account? Existing transaction records will be preserved.')) {
      setAccounts((prev) => prev.filter((a) => a.id !== accId));
      if (authUserId) {
        syncDeleteDoc(authUserId, 'accounts', accId).then((lat) => setSyncLatencyMs(lat));
      }
    }
  };

  // Credit Card Handlers
  const handleSaveCreditCard = (card: CreditCard) => {
    setCreditCards((prev) => {
      const exists = prev.some((c) => c.id === card.id);
      if (exists) {
        return prev.map((c) => (c.id === card.id ? card : c));
      }
      return [...prev, card];
    });
    if (authUserId) {
      syncSaveDoc(authUserId, 'creditCards', card).then((lat) => setSyncLatencyMs(lat));
    }
  };

  const handleDeleteCreditCard = (cardId: string) => {
    if (window.confirm('Are you sure you want to remove this credit card?')) {
      setCreditCards((prev) => prev.filter((c) => c.id !== cardId));
      if (authUserId) {
        syncDeleteDoc(authUserId, 'creditCards', cardId).then((lat) => setSyncLatencyMs(lat));
      }
    }
  };

  // Loan Handlers
  const handleSaveLoan = (loan: Loan) => {
    setLoans((prev) => {
      const exists = prev.some((l) => l.id === loan.id);
      if (exists) {
        return prev.map((l) => (l.id === loan.id ? loan : l));
      }
      return [...prev, loan];
    });
    if (authUserId) {
      syncSaveDoc(authUserId, 'loans', loan).then((lat) => setSyncLatencyMs(lat));
    }
  };

  const handleDeleteLoan = (loanId: string) => {
    if (window.confirm('Are you sure you want to remove this loan record?')) {
      setLoans((prev) => prev.filter((l) => l.id !== loanId));
      if (authUserId) {
        syncDeleteDoc(authUserId, 'loans', loanId).then((lat) => setSyncLatencyMs(lat));
      }
    }
  };

  // Budget Rollover & Annual Matrix Handlers
  const handleSaveMonthlyBudget = (budget: MonthlyCategoryBudget) => {
    setMonthlyBudgets((prev) => {
      const idx = prev.findIndex(
        (b) => b.month === budget.month && b.categoryId === budget.categoryId
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = budget;
        return next;
      }
      return [...prev, budget];
    });
    if (authUserId) {
      syncSaveDoc(authUserId, 'monthlyBudgets', budget, `${budget.month}_${budget.categoryId}`).then((lat) =>
        setSyncLatencyMs(lat)
      );
    }
  };

  const handleSaveBatchMonthlyBudgets = (budgets: MonthlyCategoryBudget[]) => {
    setMonthlyBudgets((prev) => {
      const updatedMap = new Map<string, MonthlyCategoryBudget>();
      prev.forEach((b) => updatedMap.set(`${b.month}_${b.categoryId}`, b));
      budgets.forEach((b) => updatedMap.set(`${b.month}_${b.categoryId}`, b));
      return Array.from(updatedMap.values());
    });
    if (authUserId) {
      budgets.forEach((b) => {
        syncSaveDoc(authUserId, 'monthlyBudgets', b, `${b.month}_${b.categoryId}`);
      });
    }
  };

  // Category Management Handlers
  const handleSaveCategory = (cat: Category) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === cat.id);
      if (exists) {
        return prev.map((c) => (c.id === cat.id ? cat : c));
      }
      return [...prev, cat];
    });
    if (authUserId) {
      syncSaveDoc(authUserId, 'categories', cat).then((lat) => setSyncLatencyMs(lat));
    }
  };

  const handleDeleteCategory = (catId: string) => {
    if (categories.length <= 1) {
      alert('You must keep at least one category.');
      return;
    }
    if (window.confirm('Delete this category? Existing transactions will retain their category name.')) {
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      if (authUserId) {
        syncDeleteDoc(authUserId, 'categories', catId).then((lat) => setSyncLatencyMs(lat));
      }
    }
  };

  // Savings Goal Handlers
  const handleSaveGoal = (goal: SavingsGoalBucket) => {
    setSavingsGoals((prev) => {
      const exists = prev.some((g) => g.id === goal.id);
      if (exists) {
        return prev.map((g) => (g.id === goal.id ? goal : g));
      }
      return [...prev, goal];
    });
    if (authUserId) {
      syncSaveDoc(authUserId, 'savingsGoals', goal).then((lat) => setSyncLatencyMs(lat));
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== goalId));
    if (authUserId) {
      syncDeleteDoc(authUserId, 'savingsGoals', goalId).then((lat) => setSyncLatencyMs(lat));
    }
  };

  const handleRecordGoalDeposit = (
    goalId: string,
    contribution: GoalContribution,
    newTotalSaved: number,
    isStreakIncrement: boolean
  ) => {
    let updatedGoal: SavingsGoalBucket | null = null;
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const newStreak = isStreakIncrement ? g.monthlyStreak + 1 : g.monthlyStreak;
          const status = newTotalSaved >= g.targetAmount ? 'completed' : 'in_progress';
          updatedGoal = {
            ...g,
            currentSaved: newTotalSaved,
            monthlyStreak: newStreak,
            lastContributionMonth: contribution.month,
            status,
            contributions: [contribution, ...(g.contributions || [])],
          };
          return updatedGoal;
        }
        return g;
      })
    );

    if (updatedGoal && authUserId) {
      syncSaveDoc(authUserId, 'savingsGoals', updatedGoal).then((lat) => setSyncLatencyMs(lat));
    }

    // Also auto-evaluate badges
    setGoalBadges((prev) =>
      prev.map((b) => {
        if (b.id === 'badge_first_deposit' && !b.isUnlocked) {
          return {
            ...b,
            isUnlocked: true,
            progressPercent: 100,
            unlockedAt: new Date().toISOString().split('T')[0],
          };
        }
        return b;
      })
    );
  };

  // Health Handlers
  const handleSaveVitals = (log: VitalsLog) => {
    setVitalsLogs((prev) => [log, ...prev.filter((l) => l.date !== log.date)]);
    if (authUserId) {
      syncSaveDoc(authUserId, 'vitals', log).then((lat) => setSyncLatencyMs(lat));
    }
  };

  const handleSaveWorkout = (workout: WorkoutSession) => {
    setWorkouts((prev) => [workout, ...prev]);
    if (authUserId) {
      syncSaveDoc(authUserId, 'workouts', workout).then((lat) => setSyncLatencyMs(lat));
    }
  };

  // Habits Handlers
  const handleSaveHabit = (habit: Habit) => {
    setHabits((prev) => {
      const exists = prev.some((h) => h.id === habit.id);
      if (exists) {
        return prev.map((h) => (h.id === habit.id ? habit : h));
      }
      return [...prev, habit];
    });
    if (authUserId) {
      syncSaveDoc(authUserId, 'habits', habit).then((lat) => setSyncLatencyMs(lat));
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    if (authUserId) {
      syncDeleteDoc(authUserId, 'habits', habitId).then((lat) => setSyncLatencyMs(lat));
    }
  };

  const handleToggleHabitCompletion = (habitId: string, date: string) => {
    const existingIndex = habitCompletions.findIndex(
      (c) => c.habitId === habitId && c.date === date
    );

    let nextCompleted = true;
    let completionRecord: HabitCompletionRecord;

    if (existingIndex >= 0) {
      nextCompleted = !habitCompletions[existingIndex].completed;
      completionRecord = { ...habitCompletions[existingIndex], completed: nextCompleted };
      setHabitCompletions((prev) => {
        const next = [...prev];
        next[existingIndex] = completionRecord;
        return next;
      });
    } else {
      completionRecord = {
        id: `hc_${Date.now()}`,
        habitId,
        date,
        completed: true,
        timestamp: new Date().toISOString(),
      };
      setHabitCompletions((prev) => [...prev, completionRecord]);
    }

    if (authUserId) {
      syncSaveDoc(authUserId, 'habitCompletions', completionRecord).then((lat) => setSyncLatencyMs(lat));
    }

    // Update habit streak count
    let updatedHabit: Habit | null = null;
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const newCurrentStreak = nextCompleted
            ? h.currentStreak + 1
            : Math.max(0, h.currentStreak - 1);
          const newBest = Math.max(h.bestStreak, newCurrentStreak);
          const newTotal = nextCompleted ? h.totalCompletions + 1 : Math.max(0, h.totalCompletions - 1);

          updatedHabit = {
            ...h,
            currentStreak: newCurrentStreak,
            bestStreak: newBest,
            totalCompletions: newTotal,
          };
          return updatedHabit;
        }
        return h;
      })
    );

    if (updatedHabit && authUserId) {
      syncSaveDoc(authUserId, 'habits', updatedHabit);
    }
  };

  // Vacation & Planner Handlers
  const handleSaveVacation = (vacation: VacationPlan) => {
    setVacations((prev) => {
      const exists = prev.some((v) => v.id === vacation.id);
      if (exists) {
        return prev.map((v) => (v.id === vacation.id ? vacation : v));
      }
      return [vacation, ...prev];
    });
    if (authUserId) {
      syncSaveDoc(authUserId, 'vacations', vacation).then((lat) => setSyncLatencyMs(lat));
    }
  };

  const handleDeleteVacation = (vacationId: string) => {
    setVacations((prev) => prev.filter((v) => v.id !== vacationId));
    if (authUserId) {
      syncDeleteDoc(authUserId, 'vacations', vacationId).then((lat) => setSyncLatencyMs(lat));
    }
  };

  const handleTogglePackingItem = (vacationId: string, itemId: string) => {
    let updatedVacation: VacationPlan | null = null;
    setVacations((prev) =>
      prev.map((v) => {
        if (v.id === vacationId) {
          updatedVacation = {
            ...v,
            packingList: v.packingList.map((item) =>
              item.id === itemId ? { ...item, isPacked: !item.isPacked } : item
            ),
          };
          return updatedVacation;
        }
        return v;
      })
    );
    if (updatedVacation && authUserId) {
      syncSaveDoc(authUserId, 'vacations', updatedVacation);
    }
  };

  const handleSaveDateToRemember = (dateItem: DateToRemember) => {
    setDatesToRemember((prev) => {
      const exists = prev.some((d) => d.id === dateItem.id);
      if (exists) {
        return prev.map((d) => (d.id === dateItem.id ? dateItem : d));
      }
      return [...prev, dateItem].sort((a, b) => a.date.localeCompare(b.date));
    });
    if (authUserId) {
      syncSaveDoc(authUserId, 'datesToRemember', dateItem).then((lat) => setSyncLatencyMs(lat));
    }
  };

  const handleDeleteDateToRemember = (id: string) => {
    setDatesToRemember((prev) => prev.filter((d) => d.id !== id));
    if (authUserId) {
      syncDeleteDoc(authUserId, 'datesToRemember', id).then((lat) => setSyncLatencyMs(lat));
    }
  };

  const handleSaveUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    if (authUserId) {
      syncSaveUserProfile(authUserId, profile).then((lat) => setSyncLatencyMs(lat));
    }
  };

  // Export / Backup Handlers
  const handleImportTransactions = (imported: Transaction[]) => {
    setTransactions(imported);
  };

  const handleResetBudgetsToDefault = () => {
    setCategories(DEFAULT_CATEGORIES);
    setMonthlyBudgets(INITIAL_MONTHLY_BUDGETS);
    saveCategories(DEFAULT_CATEGORIES);
    saveMonthlyBudgets(INITIAL_MONTHLY_BUDGETS);
  };

  const handleResetData = async () => {
    if (authUserId) {
      await wipeAndResetAllData(authUserId);
    }
    // Reset all financial records
    setTransactions(INITIAL_SAMPLE_TRANSACTIONS);
    saveTransactions(INITIAL_SAMPLE_TRANSACTIONS);

    setAccounts(DEFAULT_ACCOUNTS);
    saveAccounts(DEFAULT_ACCOUNTS);

    setCreditCards(DEFAULT_CREDIT_CARDS);
    saveCreditCards(DEFAULT_CREDIT_CARDS);

    setLoans(DEFAULT_LOANS);
    saveLoans(DEFAULT_LOANS);

    setCategories(DEFAULT_CATEGORIES);
    saveCategories(DEFAULT_CATEGORIES);

    setMonthlyBudgets(INITIAL_MONTHLY_BUDGETS);
    saveMonthlyBudgets(INITIAL_MONTHLY_BUDGETS);

    setSavingsGoals(DEFAULT_SAVINGS_GOALS);
    saveSavingsGoals(DEFAULT_SAVINGS_GOALS);

    setGoalBadges(DEFAULT_GOAL_BADGES);
    saveGoalBadges(DEFAULT_GOAL_BADGES);

    setRecurringRules(DEFAULT_RECURRING_RULES);
    saveRecurringRules(DEFAULT_RECURRING_RULES);

    setWealthParams(DEFAULT_WEALTH_PARAMS);
    saveWealthParams(DEFAULT_WEALTH_PARAMS);

    // Reset health & habits
    setVitalsLogs(DEFAULT_VITALS_LOGS);
    saveVitalsLogs(DEFAULT_VITALS_LOGS);

    setWorkouts(DEFAULT_WORKOUT_SESSIONS);
    saveWorkouts(DEFAULT_WORKOUT_SESSIONS);

    setHabits(DEFAULT_HABITS);
    saveHabits(DEFAULT_HABITS);

    setHabitBadges(DEFAULT_HABIT_BADGES);
    saveHabitBadges(DEFAULT_HABIT_BADGES);

    // Reset Calendar & Planner
    setUserProfile(DEFAULT_USER_PROFILE);
    saveUserProfile(DEFAULT_USER_PROFILE);

    setVacations(DEFAULT_VACATIONS);
    saveVacations(DEFAULT_VACATIONS);

    setDatesToRemember(DEFAULT_DATES_TO_REMEMBER);
    saveDatesToRemember(DEFAULT_DATES_TO_REMEMBER);
  };

  const handleMobileQuickAction = (action: string) => {
    switch (action) {
      case 'add_expense':
        handleOpenNewTransaction('expense');
        break;
      case 'add_income':
        handleOpenNewTransaction('income');
        break;
      case 'add_transfer':
        handleOpenNewTransaction('transfer');
        break;
      case 'log_vitals':
        setIsVitalsModalOpen(true);
        break;
      case 'log_workout':
        setIsWorkoutModalOpen(true);
        break;
      case 'add_habit':
        setEditingHabit(null);
        setIsHabitModalOpen(true);
        break;
      case 'open_ai':
        handleOpenAIAdvisor();
        break;
      case 'open_gmail_reminder':
        setIsGmailReminderModalOpen(true);
        break;
      case 'open_sync':
        setIsSyncModalOpen(true);
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col antialiased selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation Bar with 3 Main Pillars & Finance 5 Sub-Modules */}
      <Navbar
        activePillar={activePillar}
        setActivePillar={setActivePillar}
        financeSubTab={financeSubTab}
        setFinanceSubTab={setFinanceSubTab}
        onOpenNewTx={() => handleOpenNewTransaction('expense')}
        onOpenLedgers={() => setIsLedgerModalOpen(true)}
        onOpenAccounts={() => setIsAccountsModalOpen(true)}
        onOpenCategories={() => setIsCategoryManagerOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAIAdvisor={() => handleOpenAIAdvisor()}
        onOpenSync={() => setIsSyncModalOpen(true)}
        onOpenGmailReminder={() => setIsGmailReminderModalOpen(true)}
        isSyncConnected={isSyncConnected}
        syncLatencyMs={syncLatencyMs}
        currentUser={currentUser}
        userProfile={userProfile}
        totalTransactionsCount={transactions.length}
        activeGoalsCount={savingsGoals.length}
        activeHabitsCount={habits.length}
        activeRecurringCount={recurringRules.filter((r) => r.status === 'active').length}
      />

      {/* Main Workspace Body with Fluid Pillar Animations */}
      <main className="flex-1 pb-24 md:pb-12 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePillar + (activePillar === 'finance' ? `-${financeSubTab}` : '')}
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* ======================================================== */}
            {/* PILLAR 1: INTERACTIVE UNIFIED LIFE DASHBOARD */}
            {/* ======================================================== */}
            {activePillar === 'dashboard' && (
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
                <UnifiedDashboardView
                  onNavigateToPillar={(pillar, subTab) => {
                    setActivePillar(pillar);
                    if (subTab) setFinanceSubTab(subTab);
                  }}
                  financialSummary={financialSummary}
                  accounts={accounts}
                  transactions={transactions}
                  categories={categories}
                  creditCards={creditCards}
                  loans={loans}
                  savingsGoals={savingsGoals}
                  goalBadges={goalBadges}
                  monthlyBudgets={monthlyBudgets}
                  onOpenLogTransaction={(type) => handleOpenNewTransaction((type as TransactionType) || 'expense')}
                  vitalsLogs={vitalsLogs}
                  workouts={workouts}
                  onSaveVitals={handleSaveVitals}
                  onOpenLogVitalsModal={() => setIsVitalsModalOpen(true)}
                  onOpenLogWorkoutModal={() => setIsWorkoutModalOpen(true)}
                  habits={habits}
                  habitCompletions={habitCompletions}
                  habitBadges={habitBadges}
                  onToggleHabitCompletion={handleToggleHabitCompletion}
                  onOpenAddHabitModal={() => {
                    setEditingHabit(null);
                    setIsHabitModalOpen(true);
                  }}
                  userProfile={userProfile}
                  onOpenAIAdvisor={handleOpenAIAdvisor}
                />
              </div>
            )}

            {/* ======================================================== */}
            {/* PILLAR 2: FINANCE OS MODULES */}
            {/* ======================================================== */}
            {activePillar === 'finance' && (
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
                {/* 1. Daily Log & Khata */}
                {financeSubTab === 'daily_log' && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-2 h-2 bg-indigo-600 transform rotate-45" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Finance OS • Daily Transaction & Khata Ledger
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-light text-slate-800 font-heading">
                          Daily Log & Cashflow
                        </h2>
                        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                          Record income, expenses, accounts transfers, and person Khata in Indian Rupee (₹).
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right border-r border-slate-200 pr-4">
                          <p className="text-xs font-semibold text-slate-700">{formattedToday}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                            India • Live Local State
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            id="header-btn-lend-borrow"
                            onClick={() => setIsLedgerModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold uppercase tracking-wider shadow-2xs transition-colors cursor-pointer"
                          >
                            <Users className="h-3.5 w-3.5 text-indigo-600" />
                            <span>Khata ({personLedgers.length})</span>
                          </button>

                          <button
                            id="header-btn-log-tx"
                            onClick={() => handleOpenNewTransaction('expense')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-98 cursor-pointer"
                          >
                            <PlusCircle className="h-4 w-4" />
                            <span>+ Log Transaction</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <SummaryCards
                      summary={financialSummary}
                      accounts={accounts}
                      balances={accountBalances}
                      activeTypeFilter={activeTypeFilter}
                      onSelectTypeFilter={setActiveTypeFilter}
                      onOpenAccountsModal={() => setIsAccountsModalOpen(true)}
                      onOpenLedgersModal={() => setIsLedgerModalOpen(true)}
                    />

                    <TransactionList
                      transactions={transactions}
                      accounts={accounts}
                      categories={categories}
                      activeTypeFilter={activeTypeFilter}
                      onSelectTypeFilter={setActiveTypeFilter}
                      onEdit={handleEditTransaction}
                      onDelete={handleDeleteTransaction}
                      onDuplicate={handleDuplicateTransaction}
                      onOpenNewTx={() => handleOpenNewTransaction('expense')}
                      onQuickSettle={handleQuickSettleFromList}
                      onOpenRecurring={() => setFinanceSubTab('recurring')}
                    />
                  </div>
                )}

                {/* 2. Financial Engine: Accounts, Cards & Loans */}
                {financeSubTab === 'financial_engine' && (
                  <FinancialEngineView
                    accounts={accounts}
                    creditCards={creditCards}
                    loans={loans}
                    transactions={transactions}
                    balances={accountBalances}
                    summary={financialSummary}
                    onSaveAccount={handleSaveAccount}
                    onDeleteAccount={handleDeleteAccount}
                    onSaveCreditCard={handleSaveCreditCard}
                    onDeleteCreditCard={handleDeleteCreditCard}
                    onSaveLoan={handleSaveLoan}
                    onDeleteLoan={handleDeleteLoan}
                    onOpenLogTx={(type, accFrom, accTo, cat, amt, desc) =>
                      handleOpenNewTransaction(type, undefined, accFrom, accTo, cat, amt, desc)
                    }
                  />
                )}

                {/* 3. Budget Rollover & Annual Matrix */}
                {financeSubTab === 'budget_engine' && (
                  <BudgetEngineView
                    categories={categories}
                    transactions={transactions}
                    savedBudgets={monthlyBudgets}
                    onSaveMonthlyBudget={handleSaveMonthlyBudget}
                    onSaveBatchMonthlyBudgets={handleSaveBatchMonthlyBudgets}
                    onResetBudgetsToDefault={handleResetBudgetsToDefault}
                    onResetEntireApp={handleResetData}
                    onOpenLogTx={(type, cat, amt, desc) =>
                      handleOpenNewTransaction(type, undefined, undefined, undefined, cat, amt, desc)
                    }
                    onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
                    onOpenAddCategory={() => {
                      setEditingCategory(null);
                      setIsAddCategoryOpen(true);
                    }}
                    onOpenEditCategory={(cat) => {
                      setEditingCategory(cat);
                      setIsAddCategoryOpen(true);
                    }}
                    onDeleteCategory={handleDeleteCategory}
                  />
                )}

                {/* 4. Goal Savings Bucket Module */}
                {financeSubTab === 'goal_savings' && (
                  <GoalSavingsBucketsView
                    goals={savingsGoals}
                    accounts={accounts}
                    badges={goalBadges}
                    onSaveGoal={handleSaveGoal}
                    onDeleteGoal={handleDeleteGoal}
                    onRecordDeposit={handleRecordGoalDeposit}
                  />
                )}

                {/* 5. Wealth Forecasting Engine */}
                {financeSubTab === 'wealth_forecasting' && (
                  <WealthForecastingView
                    initialParams={wealthParams}
                    financialSummary={financialSummary}
                    accounts={accounts}
                    onSaveParams={(params) => setWealthParams(params)}
                  />
                )}

                {/* 6. Recurring Transactions & Standing Rules Engine */}
                {financeSubTab === 'recurring' && (
                  <RecurringTransactionsView
                    rules={recurringRules}
                    accounts={accounts}
                    categories={categories}
                    transactions={transactions}
                    onSaveRule={handleSaveRecurringRule}
                    onDeleteRule={handleDeleteRecurringRule}
                    onToggleRuleStatus={handleToggleRecurringRuleStatus}
                    onExecuteRuleNow={handleExecuteRecurringRuleNow}
                    onProcessAllDueRules={handleProcessAllDueRecurringRules}
                    onEditTransaction={handleEditTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                  />
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* PILLAR 3: HEALTH & VITALITY MODULE */}
            {/* ======================================================== */}
            {activePillar === 'health' && (
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
                <HealthModuleView
                  vitalsLogs={vitalsLogs}
                  workouts={workouts}
                  onSaveVitals={handleSaveVitals}
                  onSaveWorkout={handleSaveWorkout}
                />
              </div>
            )}

            {/* ======================================================== */}
            {/* PILLAR 4: HABITS & STREAKS MODULE */}
            {/* ======================================================== */}
            {activePillar === 'habits' && (
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
                <HabitsModuleView
                  habits={habits}
                  completions={habitCompletions}
                  badges={habitBadges}
                  onSaveHabit={handleSaveHabit}
                  onDeleteHabit={handleDeleteHabit}
                  onToggleHabitCompletion={handleToggleHabitCompletion}
                />
              </div>
            )}

            {/* ======================================================== */}
            {/* PILLAR 5: CALENDAR 360° (LIFE LEDGER & FESTIVAL ART) */}
            {/* ======================================================== */}
            {activePillar === 'calendar' && (
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
                <CalendarView
                  transactions={transactions}
                  habits={habits}
                  habitCompletions={habitCompletions}
                  vitalsLogs={vitalsLogs}
                  workouts={workouts}
                  vacations={vacations}
                  datesToRemember={datesToRemember}
                  userProfile={userProfile}
                  onOpenLogTransaction={(type) => handleOpenNewTransaction((type as TransactionType) || 'expense')}
                  onOpenAddHabit={() => {
                    setEditingHabit(null);
                    setIsHabitModalOpen(true);
                  }}
                  onOpenAddVacation={() => {
                    setEditingVacation(null);
                    setIsAddVacationModalOpen(true);
                  }}
                  onOpenAddDate={() => {
                    setEditingDate(null);
                    setIsAddDateModalOpen(true);
                  }}
                  onOpenProfileModal={() => setIsProfileModalOpen(true)}
                />
              </div>
            )}

            {/* ======================================================== */}
            {/* PILLAR 6: LIFE PLANNER (VACATIONS & DATES TO REMEMBER) */}
            {/* ======================================================== */}
            {activePillar === 'planner' && (
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
                <LifePlannerView
                  vacations={vacations}
                  datesToRemember={datesToRemember}
                  userProfile={userProfile}
                  onOpenAddVacation={() => {
                    setEditingVacation(null);
                    setIsAddVacationModalOpen(true);
                  }}
                  onOpenEditVacation={(vac) => {
                    setEditingVacation(vac);
                    setIsAddVacationModalOpen(true);
                  }}
                  onDeleteVacation={handleDeleteVacation}
                  onTogglePackingItem={handleTogglePackingItem}
                  onOpenAddDate={() => {
                    setEditingDate(null);
                    setIsAddDateModalOpen(true);
                  }}
                  onOpenEditDate={(dateItem) => {
                    setEditingDate(dateItem);
                    setIsAddDateModalOpen(true);
                  }}
                  onDeleteDateToRemember={handleDeleteDateToRemember}
                  onOpenProfileModal={() => setIsProfileModalOpen(true)}
                  onNavigateToCalendar={() => setActivePillar('calendar')}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Quick Module Switcher */}
      <footer className="border-t border-slate-200 bg-white px-4 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
        <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
          <button
            onClick={() => setActivePillar('dashboard')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              activePillar === 'dashboard'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            1. Command Dashboard
          </button>

          <button
            onClick={() => {
              setActivePillar('finance');
              setFinanceSubTab('daily_log');
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              activePillar === 'finance'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            2. Finance OS (5 Tools)
          </button>

          <button
            onClick={() => setActivePillar('health')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              activePillar === 'health'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            3. Health & Vitality
          </button>

          <button
            onClick={() => setActivePillar('habits')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              activePillar === 'habits'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            4. Habits & Streaks
          </button>

          <button
            onClick={() => setActivePillar('calendar')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              activePillar === 'calendar'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            5. Calendar 360°
          </button>

          <button
            onClick={() => setActivePillar('planner')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              activePillar === 'planner'
                ? 'bg-cyan-700 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            6. Life Planner
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          KAIONE OS • Executive Finance, Health, Habits & Life Synergy Engine
        </div>
      </footer>

      {/* Global Modals */}
      {/* 1. Transaction Form Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditTx(null);
          setFormDefaultAmount(undefined);
          setFormDefaultDescription('');
          setFormDefaultAccountFrom('');
          setFormDefaultAccountTo('');
          setFormDefaultCategory('');
        }}
        onSave={handleSaveTransaction}
        accounts={accounts}
        categories={categories}
        existingTransactions={transactions}
        editTransaction={editTx}
        defaultType={formDefaultType}
        defaultPersonName={formDefaultPerson}
        onOpenAddCategory={() => {
          setEditingCategory(null);
          setIsAddCategoryOpen(true);
        }}
        onOpenAddAccount={() => {
          setEditingQuickAccount(null);
          setIsQuickAddAccountOpen(true);
        }}
      />

      {/* 2. Person Ledger / Khata Modal */}
      <PersonLedgerModal
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
        personLedgers={personLedgers}
        onOpenSettleWithPerson={handleSettleWithPersonFromModal}
        onUpdatePersonPhoneAndDueDate={handleUpdatePersonPhoneAndDueDate}
      />

      {/* 3. Accounts Management Modal */}
      <AccountsModal
        isOpen={isAccountsModalOpen}
        onClose={() => setIsAccountsModalOpen(false)}
        accounts={accounts}
        balances={accountBalances}
        onSaveAccount={handleSaveAccount}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* 4. Category Management Full Hub Modal */}
      <CategoryManagementModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        onOpenAddCategory={() => {
          setEditingCategory(null);
          setIsAddCategoryOpen(true);
        }}
        onOpenEditCategory={(cat) => {
          setEditingCategory(cat);
          setIsAddCategoryOpen(true);
        }}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* 5. Add / Edit Category Dialog Modal */}
      <AddEditCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => {
          setIsAddCategoryOpen(false);
          setEditingCategory(null);
        }}
        onSaveCategory={handleSaveCategory}
        categoryToEdit={editingCategory}
        onDeleteCategory={handleDeleteCategory}
        existingCategories={categories}
      />

      {/* 6. Quick Add / Edit Account / Bank Modal */}
      <AddEditAccountModal
        isOpen={isQuickAddAccountOpen}
        onClose={() => {
          setIsQuickAddAccountOpen(false);
          setEditingQuickAccount(null);
        }}
        onSave={handleSaveAccount}
        onDelete={handleDeleteAccount}
        editAccount={editingQuickAccount}
        existingAccounts={accounts}
      />

      {/* 7. Export / Import Backup Modal */}
      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        accounts={accounts}
        onImportTransactions={handleImportTransactions}
        onResetData={handleResetData}
      />

      {/* 8. Health Log Vitals Modal */}
      <LogVitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        onSaveVitals={handleSaveVitals}
      />

      {/* 9. Health Log Workout Modal */}
      <LogWorkoutModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
        onSaveWorkout={handleSaveWorkout}
      />

      {/* 10. Habits Add/Edit Modal */}
      <AddEditHabitModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setEditingHabit(null);
        }}
        onSaveHabit={handleSaveHabit}
        editingHabit={editingHabit}
      />

      {/* 11. Personal Profile & VIP Milestones Modal */}
      <PersonalProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveUserProfile}
      />

      {/* 12. Add/Edit Date to Remember Modal */}
      <AddEditDateModal
        isOpen={isAddDateModalOpen}
        onClose={() => {
          setIsAddDateModalOpen(false);
          setEditingDate(null);
        }}
        onSaveDate={handleSaveDateToRemember}
        editingDate={editingDate}
      />

      {/* 13. Add/Edit Vacation Plan Modal */}
      <AddEditVacationModal
        isOpen={isAddVacationModalOpen}
        onClose={() => {
          setIsAddVacationModalOpen(false);
          setEditingVacation(null);
        }}
        onSaveVacation={handleSaveVacation}
        editingVacation={editingVacation}
      />

      {/* 14. VitaFlow AI Advisor (Simple Words & 100% Satisfaction) */}
      <AIAdvisorModal
        isOpen={isAIAdvisorOpen}
        onClose={() => {
          setIsAIAdvisorOpen(false);
          setAiAdvisorInitialPrompt(undefined);
        }}
        financialSummary={financialSummary}
        accounts={accounts}
        transactions={transactions}
        categories={categories}
        monthlyBudgets={monthlyBudgets}
        savingsGoals={savingsGoals}
        workoutSessions={workouts}
        habits={habits}
        habitRecords={habitCompletions}
        userProfile={userProfile}
        initialPrompt={aiAdvisorInitialPrompt}
      />

      {/* Global Floating AI Advisor Pill */}
      <AIFloatingTrigger onOpen={() => handleOpenAIAdvisor()} />

      {/* 15. Multi-Device Cloud Sync Modal */}
      <MultiDeviceSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        userId={authUserId}
        currentUser={currentUser}
        latencyMs={syncLatencyMs}
        isConnected={isSyncConnected}
        onResetAllData={handleResetData}
        onMigrateLocalToCloud={handleMigrateLocalToCloud}
        onSwitchSyncWorkspace={handleSwitchSyncWorkspace}
        itemCounts={{
          transactions: transactions.length,
          accounts: accounts.length,
          habits: habits.length,
          goals: savingsGoals.length,
          vitals: vitalsLogs.length,
          vacations: vacations.length,
        }}
      />

      {/* 16. Gmail Daily 22:30 Automated Reminder Modal */}
      <GmailDailyReminderModal
        isOpen={isGmailReminderModalOpen}
        onClose={() => setIsGmailReminderModalOpen(false)}
        transactions={transactions}
        habits={habits}
        habitCompletions={habitCompletions}
        workouts={workouts}
        vitalsLogs={vitalsLogs}
      />

      {/* 17. Mobile Bottom Navigation Bar (Fixed for Mobile Viewports) */}
      <MobileBottomNav
        activePillar={activePillar}
        setActivePillar={(p) => setActivePillar(p)}
        onOpenQuickAction={() => setIsMobileQuickMenuOpen(true)}
        onOpenMoreMenu={() => setIsMobileQuickMenuOpen(true)}
        activeHabitsCount={habits.length}
        totalTransactionsCount={transactions.length}
      />

      {/* 18. Mobile Quick Action & Hub Drawer */}
      <MobileQuickActionMenu
        isOpen={isMobileQuickMenuOpen}
        onClose={() => setIsMobileQuickMenuOpen(false)}
        onSelectAction={handleMobileQuickAction}
        onNavigatePillar={(p) => {
          setActivePillar(p);
          setIsMobileQuickMenuOpen(false);
        }}
        activePillar={activePillar}
      />
    </div>
  );
}
