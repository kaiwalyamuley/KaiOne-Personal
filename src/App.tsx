/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle,
  Users,
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
import { supabase } from './supabaseClient';

const ACTIVE_USER_ID = 'kai_primary_user';

export default function App() {
  // Navigation State
  const [activePillar, setActivePillar] = useState<MainPillar>('dashboard');
  const [financeSubTab, setFinanceSubTab] = useState<FinanceSubTab>('daily_log');
  const [activeTypeFilter, setActiveTypeFilter] = useState<TransactionType | 'all'>('all');
  const [isMobileQuickMenuOpen, setIsMobileQuickMenuOpen] = useState<boolean>(false);

  // Sync State
  const [authUserId, setAuthUserId] = useState<string>(ACTIVE_USER_ID);
  const [syncLatencyMs, setSyncLatencyMs] = useState<number>(5);
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

  // Supabase Table Sync Loader & Realtime Listener
  useEffect(() => {
    async function loadCloudData() {
      const startTime = performance.now();
      try {
        const { data: txData } = await supabase.from('transactions').select('*').eq('user_id', authUserId).order('date_time', { ascending: false });
        if (txData && txData.length > 0) {
          const mappedTx: Transaction[] = txData.map((r: any) => ({
            id: r.id,
            type: r.type,
            amount: Number(r.amount),
            dateTime: r.date_time,
            category: r.category,
            subCategory: r.sub_category,
            accountFromId: r.account_from_id,
            accountToId: r.account_to_id,
            personName: r.person_name,
            personPhone: r.person_phone,
            dueDate: r.due_date,
            description: r.description,
            paymentMode: r.payment_mode,
            tags: r.tags || [],
            status: r.status,
            recurringRuleId: r.recurring_rule_id,
            createdAt: r.created_at,
            updatedAt: r.updated_at
          }));
          setTransactions(mappedTx);
          saveTransactions(mappedTx);
        }

        const { data: accData } = await supabase.from('accounts').select('*').eq('user_id', authUserId);
        if (accData && accData.length > 0) {
          const mappedAcc: Account[] = accData.map((r: any) => ({
            id: r.id,
            name: r.name,
            type: r.type,
            initialBalance: Number(r.initial_balance),
            bankName: r.bank_name,
            accountNumberLast4: r.account_number_last4,
            color: r.color,
            isDefault: r.is_default,
            interestRate: Number(r.interest_rate),
            ifscCode: r.ifsc_code,
            notes: r.notes
          }));
          setAccounts(mappedAcc);
          saveAccounts(mappedAcc);
        }

        const { data: catData } = await supabase.from('categories').select('*').eq('user_id', authUserId);
        if (catData && catData.length > 0) {
          const mappedCat: Category[] = catData.map((r: any) => ({
            id: r.id,
            name: r.name,
            type: r.type,
            icon: r.icon,
            color: r.color,
            subcategories: r.subcategories || [],
            defaultMonthlyBudget: Number(r.default_monthly_budget || 0),
            isRolloverEnabled: r.is_rollover_enabled,
            defaultMaxRolloverCap: r.default_max_rollover_cap ? Number(r.default_max_rollover_cap) : undefined
          }));
          setCategories(mappedCat);
          saveCategories(mappedCat);
        }

        const { data: cardData } = await supabase.from('credit_cards').select('*').eq('user_id', authUserId);
        if (cardData && cardData.length > 0) {
          const mappedCards: CreditCard[] = cardData.map((r: any) => ({
            id: r.id,
            name: r.name,
            bankName: r.bank_name,
            cardNumberLast4: r.card_number_last4,
            cardNetwork: r.card_network,
            creditLimit: Number(r.credit_limit),
            currentOutstanding: Number(r.current_outstanding),
            billingCycleDay: r.billing_cycle_day,
            paymentDueDay: r.payment_due_day,
            minAmountDue: Number(r.min_amount_due),
            rewardPoints: r.reward_points,
            annualFee: Number(r.annual_fee),
            annualFeeWaiverSpend: Number(r.annual_fee_waiver_spend),
            annualSpent: Number(r.annual_spent),
            cardColor: r.card_color,
            status: r.status,
            linkedAccountId: r.linked_account_id,
            notes: r.notes
          }));
          setCreditCards(mappedCards);
          saveCreditCards(mappedCards);
        }

        const { data: loanData } = await supabase.from('loans').select('*').eq('user_id', authUserId);
        if (loanData && loanData.length > 0) {
          const mappedLoans: Loan[] = loanData.map((r: any) => ({
            id: r.id,
            name: r.name,
            lenderName: r.lender_name,
            loanType: r.loan_type,
            principalAmount: Number(r.principal_amount),
            outstandingPrincipal: Number(r.outstanding_principal),
            interestRatePercent: Number(r.interest_rate_percent),
            interestType: r.interest_type,
            tenureMonths: r.tenure_months,
            tenureCompletedMonths: r.tenure_completed_months,
            monthlyEmi: Number(r.monthly_emi),
            emiDueDay: r.emi_due_day,
            linkedAccountId: r.linked_account_id,
            startDate: r.start_date,
            endDate: r.end_date,
            prepaymentTotal: Number(r.prepayment_total),
            accountNumber: r.account_number,
            status: r.status,
            notes: r.notes
          }));
          setLoans(mappedLoans);
          saveLoans(mappedLoans);
        }

        const { data: profData } = await supabase.from('user_profiles').select('*').eq('id', authUserId).single();
        if (profData) {
          const mappedProf: UserProfile = {
            id: profData.id,
            name: profData.name,
            email: profData.email,
            phone: profData.phone,
            birthdate: profData.birthdate,
            birthdayFormatted: profData.birthday_formatted,
            bio: profData.bio,
            avatar: profData.avatar,
            city: profData.city,
            country: profData.country,
            occupation: profData.occupation,
            bloodGroup: profData.blood_group,
            emergencyContactName: profData.emergency_contact_name,
            emergencyContactPhone: profData.emergency_contact_phone,
            currencySymbol: profData.currency_symbol,
            monthlySavingsTarget: Number(profData.monthly_savings_target),
            emergencyFundTarget: Number(profData.emergency_fund_target),
            targetWeightKg: Number(profData.target_weight_kg),
            dailyWaterGoalMl: profData.daily_water_goal_ml,
            targetDailySleepHours: Number(profData.target_daily_sleep_hours),
            favoriteFestivals: profData.favorite_festivals || [],
            themePreference: profData.theme_preference
          };
          setUserProfile(mappedProf);
          saveUserProfile(mappedProf);
        }

        setIsSyncConnected(true);
        setSyncLatencyMs(Math.round(performance.now() - startTime));
      } catch (err) {
        console.error('Supabase initial load failed:', err);
      }
    }

    loadCloudData();

    // Supabase Realtime channel subscription across devices
    const channel = supabase
      .channel(`sync_${authUserId}`)
      .on('postgres_changes', { event: '*', schema: 'public', filter: `user_id=eq.${authUserId}` }, () => {
        loadCloudData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUserId]);

  // Automatic Due Recurring Rules Processor
  useEffect(() => {
    if (recurringRules.length > 0) {
      const result = processAllDueRecurringRules(recurringRules);
      if (result.generatedTransactions.length > 0) {
        setTransactions((prev) => [...result.generatedTransactions, ...prev]);
        saveTransactions([...result.generatedTransactions, ...transactions]);
        setRecurringRules(result.updatedRules);
        saveRecurringRules(result.updatedRules);
      }
    }
  }, []);

  // Sync to localStorage
  useEffect(() => { saveTransactions(transactions); }, [transactions]);
  useEffect(() => { saveAccounts(accounts); }, [accounts]);
  useEffect(() => { saveCategories(categories); }, [categories]);
  useEffect(() => { saveCreditCards(creditCards); }, [creditCards]);
  useEffect(() => { saveLoans(loans); }, [loans]);
  useEffect(() => { saveMonthlyBudgets(monthlyBudgets); }, [monthlyBudgets]);
  useEffect(() => { saveSavingsGoals(savingsGoals); }, [savingsGoals]);
  useEffect(() => { saveGoalBadges(goalBadges); }, [goalBadges]);
  useEffect(() => { saveWealthParams(wealthParams); }, [wealthParams]);
  useEffect(() => { saveVitalsLogs(vitalsLogs); }, [vitalsLogs]);
  useEffect(() => { saveWorkouts(workouts); }, [workouts]);
  useEffect(() => { saveHabits(habits); }, [habits]);
  useEffect(() => { saveHabitCompletions(habitCompletions); }, [habitCompletions]);
  useEffect(() => { saveHabitBadges(habitBadges); }, [habitBadges]);
  useEffect(() => { saveUserProfile(userProfile); }, [userProfile]);
  useEffect(() => { saveVacations(vacations); }, [vacations]);
  useEffect(() => { saveDatesToRemember(datesToRemember); }, [datesToRemember]);

  // Modal States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddDateModalOpen, setIsAddDateModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<DateToRemember | null>(null);
  const [isAddVacationModalOpen, setIsAddVacationModalOpen] = useState(false);
  const [editingVacation, setEditingVacation] = useState<VacationPlan | null>(null);
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
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [aiAdvisorInitialPrompt, setAiAdvisorInitialPrompt] = useState<string | undefined>(undefined);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isQuickAddAccountOpen, setIsQuickAddAccountOpen] = useState(false);
  const [editingQuickAccount, setEditingQuickAccount] = useState<Account | null>(null);

  // Derived Calculations
  const accountBalances = useMemo(() => calculateAccountBalances(accounts, transactions), [accounts, transactions]);
  const financialSummary: FinancialSummary = useMemo(() => calculateFinancialSummary(accounts, transactions, creditCards, loans), [accounts, transactions, creditCards, loans]);
  const personLedgers: PersonLedger[] = useMemo(() => calculatePersonLedgers(transactions), [transactions]);
  const formattedToday = useMemo(() => new Intl.DateTimeFormat('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()), []);

  const handleOpenAIAdvisor = (prompt?: string) => {
    setAiAdvisorInitialPrompt(prompt);
    setIsAIAdvisorOpen(true);
  };

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

  const handleSaveTransaction = async (
    txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    const nowIso = new Date().toISOString();
    const txId = editId || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newTx: Transaction = {
      ...txData,
      id: txId,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (editId) {
      setTransactions((prev) => prev.map((t) => (t.id === editId ? newTx : t)));
    } else {
      setTransactions((prev) => [newTx, ...prev]);
    }

    await supabase.from('transactions').upsert({
      id: txId,
      user_id: authUserId,
      type: newTx.type,
      amount: newTx.amount,
      date_time: newTx.dateTime,
      category: newTx.category,
      sub_category: newTx.subCategory || null,
      account_from_id: newTx.accountFromId || null,
      account_to_id: newTx.accountToId || null,
      person_name: newTx.personName || null,
      person_phone: newTx.personPhone || null,
      due_date: newTx.dueDate || null,
      description: newTx.description || null,
      payment_mode: newTx.paymentMode || 'UPI',
      tags: newTx.tags || [],
      status: newTx.status || 'completed',
      recurring_rule_id: newTx.recurringRuleId || null,
    });
  };

  const handleDeleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await supabase.from('transactions').delete().eq('id', id);
  };

  const handleSaveAccount = async (newAcc: Account) => {
    setAccounts((prev) => {
      const exists = prev.some((a) => a.id === newAcc.id);
      return exists ? prev.map((a) => (a.id === newAcc.id ? newAcc : a)) : [...prev, newAcc];
    });

    await supabase.from('accounts').upsert({
      id: newAcc.id,
      user_id: authUserId,
      name: newAcc.name,
      type: newAcc.type,
      initial_balance: newAcc.initialBalance,
      bank_name: newAcc.bankName || null,
      account_number_last4: newAcc.accountNumberLast4 || null,
      color: newAcc.color || null,
      is_default: newAcc.isDefault || false,
      interest_rate: newAcc.interestRate || 0,
      ifsc_code: newAcc.ifscCode || null,
      notes: newAcc.notes || null,
    });
  };

  const handleDeleteAccount = async (accId: string) => {
    if (accounts.length <= 1) {
      alert('You must keep at least one account.');
      return;
    }
    if (window.confirm('Delete this account? Existing transaction records will be preserved.')) {
      setAccounts((prev) => prev.filter((a) => a.id !== accId));
      await supabase.from('accounts').delete().eq('id', accId);
    }
  };

  const handleSaveCategory = async (cat: Category) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === cat.id);
      return exists ? prev.map((c) => (c.id === cat.id ? cat : c)) : [...prev, cat];
    });

    await supabase.from('categories').upsert({
      id: cat.id,
      user_id: authUserId,
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
      color: cat.color || null,
      subcategories: cat.subcategories || [],
      default_monthly_budget: cat.defaultMonthlyBudget || 0,
      is_rollover_enabled: cat.isRolloverEnabled ?? true,
      default_max_rollover_cap: cat.defaultMaxRolloverCap || null,
    });
  };

  const handleDeleteCategory = async (catId: string) => {
    if (categories.length <= 1) {
      alert('You must keep at least one category.');
      return;
    }
    if (window.confirm('Delete this category? Existing transactions will retain their category name.')) {
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      await supabase.from('categories').delete().eq('id', catId);
    }
  };

  const handleSaveCreditCard = async (card: CreditCard) => {
    setCreditCards((prev) => {
      const exists = prev.some((c) => c.id === card.id);
      return exists ? prev.map((c) => (c.id === card.id ? card : c)) : [...prev, card];
    });

    await supabase.from('credit_cards').upsert({
      id: card.id,
      user_id: authUserId,
      name: card.name,
      bank_name: card.bankName,
      card_number_last4: card.cardNumberLast4,
      card_network: card.cardNetwork,
      credit_limit: card.creditLimit,
      current_outstanding: card.currentOutstanding,
      billing_cycle_day: card.billingCycleDay,
      payment_due_day: card.paymentDueDay,
      min_amount_due: card.minAmountDue || 0,
      reward_points: card.rewardPoints || 0,
      annual_fee: card.annualFee || 0,
      annual_fee_waiver_spend: card.annualFeeWaiverSpend || 0,
      annual_spent: card.annualSpent || 0,
      card_color: card.cardColor || null,
      status: card.status,
      linked_account_id: card.linkedAccountId || null,
      notes: card.notes || null,
    });
  };

  const handleDeleteCreditCard = async (cardId: string) => {
    if (window.confirm('Are you sure you want to remove this credit card?')) {
      setCreditCards((prev) => prev.filter((c) => c.id !== cardId));
      await supabase.from('credit_cards').delete().eq('id', cardId);
    }
  };

  const handleSaveLoan = async (loan: Loan) => {
    setLoans((prev) => {
      const exists = prev.some((l) => l.id === loan.id);
      return exists ? prev.map((l) => (l.id === loan.id ? loan : l)) : [...prev, loan];
    });

    await supabase.from('loans').upsert({
      id: loan.id,
      user_id: authUserId,
      name: loan.name,
      lender_name: loan.lenderName,
      loan_type: loan.loanType,
      principal_amount: loan.principalAmount,
      outstanding_principal: loan.outstandingPrincipal,
      interest_rate_percent: loan.interestRatePercent,
      interest_type: loan.interestType,
      tenure_months: loan.tenureMonths,
      tenure_completed_months: loan.tenureCompletedMonths,
      monthly_emi: loan.monthlyEmi,
      emi_due_day: loan.emiDueDay,
      linked_account_id: loan.linkedAccountId || null,
      start_date: loan.startDate,
      end_date: loan.endDate || null,
      prepayment_total: loan.prepaymentTotal || 0,
      account_number: loan.accountNumber || null,
      status: loan.status,
      notes: loan.notes || null,
    });
  };

  const handleDeleteLoan = async (loanId: string) => {
    if (window.confirm('Are you sure you want to remove this loan record?')) {
      setLoans((prev) => prev.filter((l) => l.id !== loanId));
      await supabase.from('loans').delete().eq('id', loanId);
    }
  };

  const handleSaveMonthlyBudget = async (budget: MonthlyCategoryBudget) => {
    setMonthlyBudgets((prev) => {
      const idx = prev.findIndex((b) => b.month === budget.month && b.categoryId === budget.categoryId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = budget;
        return next;
      }
      return [...prev, budget];
    });

    await supabase.from('monthly_category_budgets').upsert({
      id: `${authUserId}_${budget.month}_${budget.categoryId}`,
      user_id: authUserId,
      month: budget.month,
      category_id: budget.categoryId,
      base_budget: budget.baseBudget,
      rollover_enabled: budget.rolloverEnabled,
      max_rollover_cap: budget.maxRolloverCap || null,
      manual_rollover_override: budget.manualRolloverOverride || null,
      manual_rollover_notes: budget.manualRolloverNotes || null,
      notes: budget.notes || null,
    });
  };

  const handleSaveBatchMonthlyBudgets = async (budgets: MonthlyCategoryBudget[]) => {
    setMonthlyBudgets((prev) => {
      const updatedMap = new Map<string, MonthlyCategoryBudget>();
      prev.forEach((b) => updatedMap.set(`${b.month}_${b.categoryId}`, b));
      budgets.forEach((b) => updatedMap.set(`${b.month}_${b.categoryId}`, b));
      return Array.from(updatedMap.values());
    });

    for (const b of budgets) {
      await handleSaveMonthlyBudget(b);
    }
  };

  const handleSaveGoal = async (goal: SavingsGoalBucket) => {
    setSavingsGoals((prev) => {
      const exists = prev.some((g) => g.id === goal.id);
      return exists ? prev.map((g) => (g.id === goal.id ? goal : g)) : [...prev, goal];
    });

    await supabase.from('savings_goals').upsert({
      id: goal.id,
      user_id: authUserId,
      title: goal.title,
      category: goal.category,
      target_amount: goal.targetAmount,
      current_saved: goal.currentSaved,
      target_date: goal.targetDate,
      start_date: goal.startDate,
      monthly_target: goal.monthlyTarget || 0,
      priority: goal.priority || 'medium',
      color: goal.color || null,
      icon: goal.icon || null,
      linked_account_id: goal.linkedAccountId || null,
      monthly_streak: goal.monthlyStreak || 0,
      last_contribution_month: goal.lastContributionMonth || null,
      status: goal.status || 'in_progress',
      notes: goal.notes || null,
    });
  };

  const handleDeleteGoal = async (goalId: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== goalId));
    await supabase.from('savings_goals').delete().eq('id', goalId);
  };

  const handleRecordGoalDeposit = async (
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

    if (updatedGoal) {
      await handleSaveGoal(updatedGoal);
      await supabase.from('goal_contributions').insert({
        id: contribution.id || `gc_${Date.now()}`,
        goal_id: goalId,
        amount: contribution.amount,
        date: contribution.date,
        month: contribution.month,
        note: contribution.note || null,
        from_account_id: contribution.fromAccountId || null,
      });
    }
  };

  const handleSaveRecurringRule = async (
    ruleData: Omit<RecurringRule, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    const nowIso = new Date().toISOString();
    const ruleId = editId || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const updatedRule: RecurringRule = {
      ...ruleData,
      id: ruleId,
      totalTimesGenerated: 0,
      totalAmountGenerated: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (editId) {
      setRecurringRules((prev) => prev.map((r) => (r.id === editId ? updatedRule : r)));
    } else {
      setRecurringRules((prev) => [updatedRule, ...prev]);
    }

    await supabase.from('recurring_rules').upsert({
      id: ruleId,
      user_id: authUserId,
      title: updatedRule.title,
      type: updatedRule.type,
      amount: updatedRule.amount,
      category: updatedRule.category,
      sub_category: updatedRule.subCategory || null,
      account_from_id: updatedRule.accountFromId || null,
      account_to_id: updatedRule.accountToId || null,
      payment_mode: updatedRule.paymentMode || 'Auto Debit',
      location: updatedRule.location || null,
      description: updatedRule.description || null,
      interval: updatedRule.interval,
      interval_count: updatedRule.intervalCount || 1,
      day_of_month: updatedRule.dayOfMonth || null,
      day_of_week: updatedRule.dayOfWeek ?? null,
      start_date: updatedRule.startDate,
      end_date: updatedRule.endDate || null,
      next_execution_date: updatedRule.nextExecutionDate,
      last_generated_date: updatedRule.lastGeneratedDate || null,
      total_times_generated: updatedRule.totalTimesGenerated || 0,
      total_amount_generated: updatedRule.totalAmountGenerated || 0,
      status: updatedRule.status,
      auto_generate: updatedRule.autoGenerate ?? true,
      tags: updatedRule.tags || [],
    });
  };

  const handleDeleteRecurringRule = async (id: string) => {
    setRecurringRules((prev) => prev.filter((r) => r.id !== id));
    await supabase.from('recurring_rules').delete().eq('id', id);
  };

  const handleToggleRecurringRuleStatus = (id: string, newStatus: 'active' | 'paused' | 'stopped') => {
    setRecurringRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const u = { ...r, status: newStatus, updatedAt: new Date().toISOString() };
          handleSaveRecurringRule(u, id);
          return u;
        }
        return r;
      })
    );
  };

  const handleExecuteRecurringRuleNow = (rule: RecurringRule) => {
    const { generatedTransaction, updatedRule } = executeSingleRuleManually(rule);
    handleSaveTransaction(generatedTransaction);
    handleSaveRecurringRule(updatedRule, updatedRule.id);
  };

  const handleProcessAllDueRecurringRules = () => {
    const result = processAllDueRecurringRules(recurringRules);
    result.generatedTransactions.forEach((tx) => handleSaveTransaction(tx));
    result.updatedRules.forEach((rule) => handleSaveRecurringRule(rule, rule.id));
  };

  const handleDuplicateTransaction = (tx: Transaction) => {
    handleSaveTransaction({
      ...tx,
      dateTime: new Date().toISOString(),
      description: tx.description ? `${tx.description} (Copy)` : 'Copy',
    });
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

  const handleUpdatePersonPhoneAndDueDate = (personName: string, phone: string, dueDate: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.personName && t.personName.toLowerCase() === personName.toLowerCase()) {
          const updated = { ...t, personPhone: phone || t.personPhone, dueDate: dueDate || t.dueDate };
          handleSaveTransaction(updated, updated.id);
          return updated;
        }
        return t;
      })
    );
  };

  const handleSaveVitals = async (log: VitalsLog) => {
    setVitalsLogs((prev) => [log, ...prev.filter((l) => l.date !== log.date)]);
    await supabase.from('vitals_logs').upsert({
      id: `${authUserId}_${log.date}`,
      user_id: authUserId,
      date: log.date,
      weight_kg: log.weightKg || null,
      systolic_bp: log.systolicBp || null,
      diastolic_bp: log.diastolicBp || null,
      resting_heart_rate: log.restingHeartRate || null,
      blood_sugar_mg_dl: log.bloodSugarMgDl || null,
      sleep_hours: log.sleepHours || null,
      sleep_quality: log.sleepQuality || null,
      water_ml: log.waterMl || null,
      energy_level: log.energyLevel || null,
      notes: log.notes || null,
    });
  };

  const handleSaveWorkout = async (workout: WorkoutSession) => {
    const wId = workout.id || `wo_${Date.now()}`;
    const newWo = { ...workout, id: wId };
    setWorkouts((prev) => [newWo, ...prev]);

    await supabase.from('workout_sessions').upsert({
      id: wId,
      user_id: authUserId,
      date: newWo.date,
      type: newWo.type,
      duration_minutes: newWo.durationMinutes,
      calories_burned: newWo.caloriesBurned || null,
      distance_km: newWo.distanceKm || null,
      intensity: newWo.intensity,
      notes: newWo.notes || null,
    });
  };

  const handleSaveHabit = async (habit: Habit) => {
    setHabits((prev) => {
      const exists = prev.some((h) => h.id === habit.id);
      return exists ? prev.map((h) => (h.id === habit.id ? habit : h)) : [...prev, habit];
    });

    await supabase.from('habits').upsert({
      id: habit.id,
      user_id: authUserId,
      title: habit.title,
      category: habit.category,
      cue: habit.cue || null,
      routine: habit.routine,
      reward: habit.reward || null,
      frequency: habit.frequency,
      time_of_day: habit.timeOfDay,
      target_days_per_month: habit.targetDaysPerMonth || 30,
      color: habit.color || null,
      icon: habit.icon || null,
      current_streak: habit.currentStreak || 0,
      best_streak: habit.bestStreak || 0,
      total_completions: habit.totalCompletions || 0,
      active: habit.active ?? true,
    });
  };

  const handleDeleteHabit = async (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    await supabase.from('habits').delete().eq('id', habitId);
  };

  const handleToggleHabitCompletion = async (habitId: string, date: string) => {
    const existingIndex = habitCompletions.findIndex((c) => c.habitId === habitId && c.date === date);
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

    await supabase.from('habit_completions').upsert({
      id: completionRecord.id,
      habit_id: habitId,
      user_id: authUserId,
      date,
      completed: nextCompleted,
    });
  };

  const handleSaveVacation = async (vacation: VacationPlan) => {
    setVacations((prev) => {
      const exists = prev.some((v) => v.id === vacation.id);
      return exists ? prev.map((v) => (v.id === vacation.id ? vacation : v)) : [vacation, ...prev];
    });

    await supabase.from('vacation_plans').upsert({
      id: vacation.id,
      user_id: authUserId,
      title: vacation.title,
      destination: vacation.destination,
      country: vacation.country || 'India',
      start_date: vacation.startDate,
      end_date: vacation.endDate,
      status: vacation.status,
      estimated_budget: vacation.estimatedBudget || 0,
      actual_spent: vacation.actualSpent || 0,
      cover_gradient: vacation.coverGradient || null,
      cover_emoji: vacation.coverEmoji || null,
      travel_companions: vacation.travelCompanions || [],
      itinerary: vacation.itinerary || [],
      packing_list: vacation.packingList || [],
      bookings: vacation.bookings || [],
      notes: vacation.notes || null,
    });
  };

  const handleDeleteVacation = async (vacationId: string) => {
    setVacations((prev) => prev.filter((v) => v.id !== vacationId));
    await supabase.from('vacation_plans').delete().eq('id', vacationId);
  };

  const handleTogglePackingItem = (vacationId: string, itemId: string) => {
    setVacations((prev) =>
      prev.map((v) => {
        if (v.id === vacationId) {
          const updated = {
            ...v,
            packingList: v.packingList.map((item) => (item.id === itemId ? { ...item, isPacked: !item.isPacked } : item)),
          };
          handleSaveVacation(updated);
          return updated;
        }
        return v;
      })
    );
  };

  const handleSaveDateToRemember = async (dateItem: DateToRemember) => {
    setDatesToRemember((prev) => {
      const exists = prev.some((d) => d.id === dateItem.id);
      return exists ? prev.map((d) => (d.id === dateItem.id ? dateItem : d)) : [...prev, dateItem].sort((a, b) => a.date.localeCompare(b.date));
    });

    await supabase.from('dates_to_remember').upsert({
      id: dateItem.id,
      user_id: authUserId,
      title: dateItem.title,
      date: dateItem.date,
      category: dateItem.category,
      is_annual_recurring: dateItem.isAnnualRecurring ?? true,
      reminder_days_before: dateItem.reminderDaysBefore || 1,
      estimated_cost: dateItem.estimatedCost || 0,
      icon: dateItem.icon || null,
      color: dateItem.color || null,
      person_name: dateItem.personName || null,
      description: dateItem.description || null,
      tags: dateItem.tags || [],
      is_important: dateItem.isImportant ?? false,
    });
  };

  const handleDeleteDateToRemember = async (id: string) => {
    setDatesToRemember((prev) => prev.filter((d) => d.id !== id));
    await supabase.from('dates_to_remember').delete().eq('id', id);
  };

  const handleSaveUserProfile = async (profile: UserProfile) => {
    setUserProfile(profile);
    await supabase.from('user_profiles').upsert({
      id: authUserId,
      name: profile.name,
      email: profile.email,
      phone: profile.phone || null,
      birthdate: profile.birthdate || null,
      birthday_formatted: profile.birthdayFormatted || null,
      bio: profile.bio || null,
      avatar: profile.avatar || null,
      city: profile.city || null,
      country: profile.country || 'India',
      occupation: profile.occupation || null,
      blood_group: profile.bloodGroup || null,
      emergency_contact_name: profile.emergencyContactName || null,
      emergency_contact_phone: profile.emergencyContactPhone || null,
      currency_symbol: profile.currencySymbol || '₹',
      monthly_savings_target: profile.monthlySavingsTarget || 0,
      emergency_fund_target: profile.emergencyFundTarget || 0,
      target_weight_kg: profile.targetWeightKg || null,
      daily_water_goal_ml: profile.dailyWaterGoalMl || 3000,
      target_daily_sleep_hours: profile.targetDailySleepHours || 7.5,
      favorite_festivals: profile.favoriteFestivals || [],
      theme_preference: profile.themePreference || 'emerald',
    });
  };

  const handleResetData = async () => {
    await supabase.from('transactions').delete().eq('user_id', authUserId);
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
    setVitalsLogs(DEFAULT_VITALS_LOGS);
    saveVitalsLogs(DEFAULT_VITALS_LOGS);
    setWorkouts(DEFAULT_WORKOUT_SESSIONS);
    saveWorkouts(DEFAULT_WORKOUT_SESSIONS);
    setHabits(DEFAULT_HABITS);
    saveHabits(DEFAULT_HABITS);
    setHabitBadges(DEFAULT_HABIT_BADGES);
    saveHabitBadges(DEFAULT_HABIT_BADGES);
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
        currentUser={null}
        userProfile={userProfile}
        totalTransactionsCount={transactions.length}
        activeGoalsCount={savingsGoals.length}
        activeHabitsCount={habits.length}
        activeRecurringCount={recurringRules.filter((r) => r.status === 'active').length}
      />

      <main className="flex-1 pb-24 md:pb-12 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePillar + (activePillar === 'finance' ? `-${financeSubTab}` : '')}
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
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

            {activePillar === 'finance' && (
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
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
                            India • Live Supabase State
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

                {financeSubTab === 'budget_engine' && (
                  <BudgetEngineView
                    categories={categories}
                    transactions={transactions}
                    savedBudgets={monthlyBudgets}
                    onSaveMonthlyBudget={handleSaveMonthlyBudget}
                    onSaveBatchMonthlyBudgets={handleSaveBatchMonthlyBudgets}
                    onResetBudgetsToDefault={() => {
                      setCategories(DEFAULT_CATEGORIES);
                      setMonthlyBudgets(INITIAL_MONTHLY_BUDGETS);
                    }}
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

                {financeSubTab === 'wealth_forecasting' && (
                  <WealthForecastingView
                    initialParams={wealthParams}
                    financialSummary={financialSummary}
                    accounts={accounts}
                    onSaveParams={(params) => setWealthParams(params)}
                  />
                )}

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

      <PersonLedgerModal
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
        personLedgers={personLedgers}
        onOpenSettleWithPerson={handleSettleWithPersonFromModal}
        onUpdatePersonPhoneAndDueDate={handleUpdatePersonPhoneAndDueDate}
      />

      <AccountsModal
        isOpen={isAccountsModalOpen}
        onClose={() => setIsAccountsModalOpen(false)}
        accounts={accounts}
        balances={accountBalances}
        onSaveAccount={handleSaveAccount}
        onDeleteAccount={handleDeleteAccount}
      />

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

      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        accounts={accounts}
        onImportTransactions={(imported) => setTransactions(imported)}
        onResetData={handleResetData}
      />

      <LogVitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        onSaveVitals={handleSaveVitals}
      />

      <LogWorkoutModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
        onSaveWorkout={handleSaveWorkout}
      />

      <AddEditHabitModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setEditingHabit(null);
        }}
        onSaveHabit={handleSaveHabit}
        editingHabit={editingHabit}
      />

      <PersonalProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveUserProfile}
      />

      <AddEditDateModal
        isOpen={isAddDateModalOpen}
        onClose={() => {
          setIsAddDateModalOpen(false);
          setEditingDate(null);
        }}
        onSaveDate={handleSaveDateToRemember}
        editingDate={editingDate}
      />

      <AddEditVacationModal
        isOpen={isAddVacationModalOpen}
        onClose={() => {
          setIsAddVacationModalOpen(false);
          setEditingVacation(null);
        }}
        onSaveVacation={handleSaveVacation}
        editingVacation={editingVacation}
      />

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

      <AIFloatingTrigger onOpen={() => handleOpenAIAdvisor()} />

      <MultiDeviceSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        userId={authUserId}
        currentUser={null}
        latencyMs={syncLatencyMs}
        isConnected={isSyncConnected}
        onResetAllData={handleResetData}
        onMigrateLocalToCloud={async () => {}}
        onSwitchSyncWorkspace={(newId) => setAuthUserId(newId)}
        itemCounts={{
          transactions: transactions.length,
          accounts: accounts.length,
          habits: habits.length,
          goals: savingsGoals.length,
          vitals: vitalsLogs.length,
          vacations: vacations.length,
        }}
      />

      <GmailDailyReminderModal
        isOpen={isGmailReminderModalOpen}
        onClose={() => setIsGmailReminderModalOpen(false)}
        transactions={transactions}
        habits={habits}
        habitCompletions={habitCompletions}
        workouts={workouts}
        vitalsLogs={vitalsLogs}
      />

      <MobileBottomNav
        activePillar={activePillar}
        setActivePillar={(p) => setActivePillar(p)}
        onOpenQuickAction={() => setIsMobileQuickMenuOpen(true)}
        onOpenMoreMenu={() => setIsMobileQuickMenuOpen(true)}
        activeHabitsCount={habits.length}
        totalTransactionsCount={transactions.length}
      />

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
