import {
  Account,
  Category,
  CreditCard,
  FinancialSummary,
  InstitutionSlice,
  Loan,
  PersonLedger,
  Transaction,
  SavingsGoalBucket,
  GoalAchievementBadge,
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
} from '../types';
import {
  DEFAULT_ACCOUNTS,
  DEFAULT_CATEGORIES,
  DEFAULT_CREDIT_CARDS,
  DEFAULT_LOANS,
  INITIAL_SAMPLE_TRANSACTIONS,
  DEFAULT_SAVINGS_GOALS,
  DEFAULT_GOAL_BADGES,
  DEFAULT_WEALTH_PARAMS,
  DEFAULT_VITALS_LOGS,
  DEFAULT_WORKOUT_SESSIONS,
  DEFAULT_HABITS,
  DEFAULT_HABIT_BADGES,
  DEFAULT_RECURRING_RULES,
} from './defaultData';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_VACATIONS,
  DEFAULT_DATES_TO_REMEMBER,
} from './calendarAndPlannerData';

// Ensure legacy sample keys are wiped clean on first launch

const STORAGE_KEYS = {
  TRANSACTIONS: 'pf_transactions_v1',
  ACCOUNTS: 'pf_accounts_v1',
  CATEGORIES: 'pf_categories_v1',
  CREDIT_CARDS: 'pf_credit_cards_v1',
  LOANS: 'pf_loans_v1',
  SAVINGS_GOALS: 'pf_savings_goals_v1',
  GOAL_BADGES: 'pf_goal_badges_v1',
  WEALTH_PARAMS: 'pf_wealth_params_v1',
  HEALTH_VITALS: 'pf_health_vitals_v1',
  HEALTH_WORKOUTS: 'pf_health_workouts_v1',
  HABITS: 'pf_habits_v1',
  HABIT_COMPLETIONS: 'pf_habit_completions_v1',
  HABIT_BADGES: 'pf_habit_badges_v1',
  USER_PROFILE: 'pf_user_profile_v1',
  VACATIONS: 'pf_vacations_v1',
  DATES_TO_REMEMBER: 'pf_dates_to_remember_v1',
  RECURRING_RULES: 'pf_recurring_rules_v1',
};

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      saveTransactions(INITIAL_SAMPLE_TRANSACTIONS);
      return INITIAL_SAMPLE_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load transactions:', e);
    return INITIAL_SAMPLE_TRANSACTIONS;
  }
}

export function saveTransactions(txs: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  } catch (e) {
    console.error('Failed to save transactions:', e);
  }
}

export function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) {
      saveAccounts(DEFAULT_ACCOUNTS);
      return DEFAULT_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load accounts:', e);
    return DEFAULT_ACCOUNTS;
  }
}

export function saveAccounts(accounts: Account[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts:', e);
  }
}

export function loadCreditCards(): CreditCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CREDIT_CARDS);
    if (!raw) {
      saveCreditCards(DEFAULT_CREDIT_CARDS);
      return DEFAULT_CREDIT_CARDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load credit cards:', e);
    return DEFAULT_CREDIT_CARDS;
  }
}

export function saveCreditCards(cards: CreditCard[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(cards));
  } catch (e) {
    console.error('Failed to save credit cards:', e);
  }
}

export function loadLoans(): Loan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOANS);
    if (!raw) {
      saveLoans(DEFAULT_LOANS);
      return DEFAULT_LOANS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load loans:', e);
    return DEFAULT_LOANS;
  }
}

export function saveLoans(loans: Loan[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  } catch (e) {
    console.error('Failed to save loans:', e);
  }
}

export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load categories:', e);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories:', e);
  }
}

/**
 * Compute real-time account balances
 */
export function calculateAccountBalances(
  accounts: Account[],
  transactions: Transaction[]
): Record<string, number> {
  const balances: Record<string, number> = {};

  // Start with initial balance
  accounts.forEach((acc) => {
    balances[acc.id] = acc.initialBalance || 0;
  });

  // Apply transactions chronologically
  transactions.forEach((tx) => {
    const amount = Number(tx.amount) || 0;

    switch (tx.type) {
      case 'expense':
      case 'investment':
      case 'lend':
        if (tx.accountFromId && balances[tx.accountFromId] !== undefined) {
          balances[tx.accountFromId] -= amount;
        }
        break;

      case 'income':
      case 'borrow':
        if (tx.accountToId && balances[tx.accountToId] !== undefined) {
          balances[tx.accountToId] += amount;
        }
        break;

      case 'refund':
        // Refund adds money to accountToId
        if (tx.accountToId && balances[tx.accountToId] !== undefined) {
          balances[tx.accountToId] += amount;
        }
        break;

      case 'transfer':
        if (tx.accountFromId && balances[tx.accountFromId] !== undefined) {
          balances[tx.accountFromId] -= amount;
        }
        if (tx.accountToId && balances[tx.accountToId] !== undefined) {
          balances[tx.accountToId] += amount;
        }
        break;
    }
  });

  return balances;
}

/**
 * Compute Overall Financial Summary across Accounts, Khata, Cards, and Loans
 */
export function calculateFinancialSummary(
  accounts: Account[],
  transactions: Transaction[],
  creditCards: CreditCard[] = DEFAULT_CREDIT_CARDS,
  loans: Loan[] = DEFAULT_LOANS
): FinancialSummary {
  const balances = calculateAccountBalances(accounts, transactions);

  // Bank & Liquid Cash
  const liquidAccounts = accounts.filter((a) => a.type === 'bank' || a.type === 'cash' || a.type === 'wallet');
  const totalBalance = liquidAccounts.reduce((sum, a) => sum + (balances[a.id] || 0), 0);

  // Demat & Investment accounts
  const investmentAccounts = accounts.filter((a) => a.type === 'investment');
  const totalInvestmentsInAccounts = investmentAccounts.reduce((sum, a) => sum + (balances[a.id] || 0), 0);

  let totalIncome = 0;
  let totalExpense = 0;
  let totalInvestmentsInTransactions = 0;
  let totalRefunds = 0;
  let totalLentOutstanding = 0;
  let totalBorrowedOutstanding = 0;

  // Person ledger map to calculate outstanding lend/borrow
  const personLedgers = calculatePersonLedgers(transactions);
  personLedgers.forEach((pl) => {
    if (pl.netBalance > 0) {
      totalLentOutstanding += pl.netBalance; // They owe me
    } else if (pl.netBalance < 0) {
      totalBorrowedOutstanding += Math.abs(pl.netBalance); // I owe them
    }
  });

  transactions.forEach((tx) => {
    const amount = Number(tx.amount) || 0;
    if (tx.type === 'income') totalIncome += amount;
    if (tx.type === 'expense') totalExpense += amount;
    if (tx.type === 'investment') totalInvestmentsInTransactions += amount;
    if (tx.type === 'refund') totalRefunds += amount;
  });

  // Credit Cards Engine aggregates
  const totalCreditLimit = creditCards.reduce((sum, c) => sum + (Number(c.creditLimit) || 0), 0);
  const totalCreditCardOutstanding = creditCards
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + (Number(c.currentOutstanding) || 0), 0);
  const creditUtilizationPercent =
    totalCreditLimit > 0 ? (totalCreditCardOutstanding / totalCreditLimit) * 100 : 0;

  // Loans Engine aggregates
  const activeLoans = loans.filter((l) => l.status === 'active');
  const totalLoanSanctioned = activeLoans.reduce((sum, l) => sum + (Number(l.principalAmount) || 0), 0);
  const totalLoanOutstanding = activeLoans.reduce((sum, l) => sum + (Number(l.outstandingPrincipal) || 0), 0);
  const totalMonthlyEmiObligation = activeLoans.reduce((sum, l) => sum + (Number(l.monthlyEmi) || 0), 0);

  // Total Assets & Liabilities
  const totalAssets = totalBalance + totalInvestmentsInAccounts + totalLentOutstanding;
  const totalLiabilities = totalCreditCardOutstanding + totalLoanOutstanding + totalBorrowedOutstanding;
  const netWorthEstimate = totalAssets - totalLiabilities;

  // Estimated Debt to Income %
  const estimatedMonthlyIncome = totalIncome > 0 ? totalIncome : 100000;
  const debtToIncomeRatio = (totalMonthlyEmiObligation / estimatedMonthlyIncome) * 100;

  return {
    totalBalance,
    totalIncome,
    totalExpense,
    totalInvestments: totalInvestmentsInAccounts + totalInvestmentsInTransactions,
    totalRefunds,
    totalLentOutstanding,
    totalBorrowedOutstanding,
    totalCreditLimit,
    totalCreditCardOutstanding,
    creditUtilizationPercent,
    totalLoanSanctioned,
    totalLoanOutstanding,
    totalMonthlyEmiObligation,
    totalAssets,
    totalLiabilities,
    netWorthEstimate,
    debtToIncomeRatio,
  };
}

/**
 * Slice and Dice by Bank / Financial Institution
 */
export function calculateInstitutionSlices(
  accounts: Account[],
  creditCards: CreditCard[],
  loans: Loan[],
  balances: Record<string, number>
): InstitutionSlice[] {
  const institutionMap = new Map<string, { accounts: Account[]; cards: CreditCard[]; loans: Loan[] }>();

  const getCleanBankName = (rawName?: string): string => {
    if (!rawName || !rawName.trim()) return 'Independent / Other';
    const n = rawName.trim();
    if (/hdfc/i.test(n)) return 'HDFC Bank';
    if (/sbi|state bank/i.test(n)) return 'State Bank of India';
    if (/icici/i.test(n)) return 'ICICI Bank';
    if (/axis/i.test(n)) return 'Axis Bank';
    if (/kotak/i.test(n)) return 'Kotak Mahindra Bank';
    if (/bajaj/i.test(n)) return 'Bajaj Finserv';
    if (/zerodha/i.test(n)) return 'Zerodha Broking';
    if (/cash/i.test(n)) return 'Physical Cash';
    return n;
  };

  accounts.forEach((acc) => {
    const bank = getCleanBankName(acc.bankName || (acc.type === 'cash' ? 'Physical Cash' : acc.name));
    if (!institutionMap.has(bank)) {
      institutionMap.set(bank, { accounts: [], cards: [], loans: [] });
    }
    institutionMap.get(bank)!.accounts.push(acc);
  });

  creditCards.forEach((card) => {
    const bank = getCleanBankName(card.bankName);
    if (!institutionMap.has(bank)) {
      institutionMap.set(bank, { accounts: [], cards: [], loans: [] });
    }
    institutionMap.get(bank)!.cards.push(card);
  });

  loans.forEach((loan) => {
    const bank = getCleanBankName(loan.lenderName);
    if (!institutionMap.has(bank)) {
      institutionMap.set(bank, { accounts: [], cards: [], loans: [] });
    }
    institutionMap.get(bank)!.loans.push(loan);
  });

  const slices: InstitutionSlice[] = [];

  institutionMap.forEach((data, bankName) => {
    const totalAssetValue = data.accounts.reduce((sum, a) => sum + Math.max(0, balances[a.id] || 0), 0);
    const cardLiabilities = data.cards.reduce((sum, c) => sum + (c.status === 'active' ? c.currentOutstanding : 0), 0);
    const loanLiabilities = data.loans.reduce((sum, l) => sum + (l.status === 'active' ? l.outstandingPrincipal : 0), 0);
    const totalLiabilityValue = cardLiabilities + loanLiabilities;

    slices.push({
      bankName,
      accounts: data.accounts,
      creditCards: data.cards,
      loans: data.loans,
      totalAssetValue,
      totalLiabilityValue,
      netExposure: totalAssetValue - totalLiabilityValue,
    });
  });

  // Sort by highest total activity/exposure
  slices.sort((a, b) => (b.totalAssetValue + b.totalLiabilityValue) - (a.totalAssetValue + a.totalLiabilityValue));

  return slices;
}

/**
 * Generate Loan Amortization Schedule (Yearly summary & monthly preview)
 */
export interface AmortizationRow {
  month: number;
  year: number;
  openingPrincipal: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  closingPrincipal: number;
}

export function calculateAmortizationSchedule(loan: Loan): {
  yearlySummary: { year: number; principalPaid: number; interestPaid: number; balance: number }[];
  totalInterest: number;
  totalPayment: number;
} {
  const P = Number(loan.principalAmount) || 0;
  const r = (Number(loan.interestRatePercent) || 0) / 12 / 100;
  const n = Number(loan.tenureMonths) || 12;
  const emi = Number(loan.monthlyEmi) || (r > 0 ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n);

  let currentPrincipal = P;
  let totalInterest = 0;
  const yearlyMap = new Map<number, { principalPaid: number; interestPaid: number; balance: number }>();

  for (let m = 1; m <= n; m++) {
    const year = Math.ceil(m / 12);
    const interest = r > 0 ? currentPrincipal * r : 0;
    const principal = Math.min(currentPrincipal, emi - interest);
    currentPrincipal = Math.max(0, currentPrincipal - principal);
    totalInterest += interest;

    if (!yearlyMap.has(year)) {
      yearlyMap.set(year, { principalPaid: 0, interestPaid: 0, balance: 0 });
    }
    const yRecord = yearlyMap.get(year)!;
    yRecord.principalPaid += principal;
    yRecord.interestPaid += interest;
    yRecord.balance = currentPrincipal;
  }

  const yearlySummary = Array.from(yearlyMap.entries()).map(([year, data]) => ({
    year,
    ...data,
  }));

  return {
    yearlySummary,
    totalInterest,
    totalPayment: P + totalInterest,
  };
}

/**
 * Prepayment & Interest Savings Simulator
 */
export function calculatePrepaymentSavings(
  outstandingPrincipal: number,
  interestRatePercent: number,
  monthlyEmi: number,
  lumpSumPrepayment: number,
  additionalMonthlyEmi: number
): {
  originalMonthsRemaining: number;
  newMonthsRemaining: number;
  monthsSaved: number;
  originalInterestRemaining: number;
  newInterestRemaining: number;
  totalInterestSaved: number;
} {
  const P = Math.max(0, outstandingPrincipal - lumpSumPrepayment);
  const r = (Number(interestRatePercent) || 0) / 12 / 100;
  const originalEmi = monthlyEmi;
  const newEmi = monthlyEmi + additionalMonthlyEmi;

  if (r === 0) {
    const origM = Math.ceil(outstandingPrincipal / originalEmi);
    const newM = Math.ceil(P / newEmi);
    return {
      originalMonthsRemaining: origM,
      newMonthsRemaining: newM,
      monthsSaved: Math.max(0, origM - newM),
      originalInterestRemaining: 0,
      newInterestRemaining: 0,
      totalInterestSaved: 0,
    };
  }

  // Calculate original scenario
  let origP = outstandingPrincipal;
  let origInterest = 0;
  let origM = 0;
  while (origP > 0 && origM < 600) {
    const interest = origP * r;
    const principal = Math.min(origP, originalEmi - interest);
    origInterest += interest;
    origP -= principal;
    origM++;
  }

  // Calculate new scenario
  let newP = P;
  let newInterest = 0;
  let newM = 0;
  while (newP > 0 && newM < 600) {
    const interest = newP * r;
    const principal = Math.min(newP, newEmi - interest);
    newInterest += interest;
    newP -= principal;
    newM++;
  }

  return {
    originalMonthsRemaining: origM,
    newMonthsRemaining: newM,
    monthsSaved: Math.max(0, origM - newM),
    originalInterestRemaining: origInterest,
    newInterestRemaining: newInterest,
    totalInterestSaved: Math.max(0, origInterest - newInterest),
  };
}

/**
 * Compute Person Ledgers (Khata / Lend & Borrow Tracking)
 */
export function calculatePersonLedgers(transactions: Transaction[]): PersonLedger[] {
  const map = new Map<string, PersonLedger>();

  // Filter transactions involving a person
  const personTxs = transactions.filter(
    (tx) => (tx.type === 'lend' || tx.type === 'borrow' || tx.personName) && tx.personName?.trim()
  );

  personTxs.forEach((tx) => {
    const name = tx.personName!.trim();
    const key = name.toLowerCase();

    if (!map.has(key)) {
      map.set(key, {
        name,
        phone: tx.personPhone,
        dueDate: tx.dueDate,
        totalLent: 0,
        totalLentRepaid: 0,
        totalBorrowed: 0,
        totalBorrowedRepaid: 0,
        netBalance: 0,
        transactions: [],
        lastTransactionDate: tx.dateTime,
      });
    }

    const ledger = map.get(key)!;
    ledger.transactions.push(tx);
    if (!ledger.phone && tx.personPhone) ledger.phone = tx.personPhone;
    if (!ledger.dueDate && tx.dueDate) ledger.dueDate = tx.dueDate;

    const amount = Number(tx.amount) || 0;

    if (tx.type === 'lend') {
      // You gave money to this person
      ledger.totalLent += amount;
    } else if (tx.type === 'borrow') {
      // You took money from this person
      ledger.totalBorrowed += amount;
    } else if (tx.type === 'income' && tx.personName) {
      // Repayment received from lent money
      ledger.totalLentRepaid += amount;
    } else if (tx.type === 'expense' && tx.personName) {
      // Repayment made for borrowed money
      ledger.totalBorrowedRepaid += amount;
    }
  });

  // Calculate Net Balance for each person
  const result: PersonLedger[] = [];
  map.forEach((ledger) => {
    // Net = (Lent - LentRepaid) - (Borrowed - BorrowedRepaid)
    // Positive: Person owes you (Receivable)
    // Negative: You owe person (Payable)
    ledger.netBalance =
      ledger.totalLent - ledger.totalLentRepaid - (ledger.totalBorrowed - ledger.totalBorrowedRepaid);

    // Sort transactions within ledger
    ledger.transactions.sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );
    if (ledger.transactions.length > 0) {
      ledger.lastTransactionDate = ledger.transactions[0].dateTime;
    }

    result.push(ledger);
  });

  // Sort by highest absolute net balance
  result.sort((a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance));

  return result;
}

// ----------------------------------------------------------------------
// Goal Savings Buckets Storage
// ----------------------------------------------------------------------
export function loadSavingsGoals(): SavingsGoalBucket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
    if (!raw) {
      saveSavingsGoals(DEFAULT_SAVINGS_GOALS);
      return DEFAULT_SAVINGS_GOALS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load savings goals:', e);
    return DEFAULT_SAVINGS_GOALS;
  }
}

export function saveSavingsGoals(goals: SavingsGoalBucket[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
  } catch (e) {
    console.error('Failed to save savings goals:', e);
  }
}

export function loadGoalBadges(): GoalAchievementBadge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOAL_BADGES);
    if (!raw) {
      saveGoalBadges(DEFAULT_GOAL_BADGES);
      return DEFAULT_GOAL_BADGES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load goal badges:', e);
    return DEFAULT_GOAL_BADGES;
  }
}

export function saveGoalBadges(badges: GoalAchievementBadge[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GOAL_BADGES, JSON.stringify(badges));
  } catch (e) {
    console.error('Failed to save goal badges:', e);
  }
}

// ----------------------------------------------------------------------
// Wealth Forecasting Params Storage
// ----------------------------------------------------------------------
export function loadWealthForecastParams(): WealthForecastParams {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEALTH_PARAMS);
    if (!raw) {
      saveWealthForecastParams(DEFAULT_WEALTH_PARAMS);
      return DEFAULT_WEALTH_PARAMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load wealth params:', e);
    return DEFAULT_WEALTH_PARAMS;
  }
}

export function saveWealthForecastParams(params: WealthForecastParams): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEALTH_PARAMS, JSON.stringify(params));
  } catch (e) {
    console.error('Failed to save wealth params:', e);
  }
}

// ----------------------------------------------------------------------
// Health Module Storage
// ----------------------------------------------------------------------
export function loadVitalsLogs(): VitalsLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HEALTH_VITALS);
    if (!raw) {
      saveVitalsLogs(DEFAULT_VITALS_LOGS);
      return DEFAULT_VITALS_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load vitals logs:', e);
    return DEFAULT_VITALS_LOGS;
  }
}

export function saveVitalsLogs(logs: VitalsLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HEALTH_VITALS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save vitals logs:', e);
  }
}

export function loadWorkoutSessions(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HEALTH_WORKOUTS);
    if (!raw) {
      saveWorkoutSessions(DEFAULT_WORKOUT_SESSIONS);
      return DEFAULT_WORKOUT_SESSIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load workouts:', e);
    return DEFAULT_WORKOUT_SESSIONS;
  }
}

export function saveWorkoutSessions(workouts: WorkoutSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HEALTH_WORKOUTS, JSON.stringify(workouts));
  } catch (e) {
    console.error('Failed to save workouts:', e);
  }
}

export const loadWealthParams = loadWealthForecastParams;
export const saveWealthParams = saveWealthForecastParams;
export const loadWorkouts = loadWorkoutSessions;
export const saveWorkouts = saveWorkoutSessions;

// ----------------------------------------------------------------------
// Habits Module Storage
// ----------------------------------------------------------------------
export function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) {
      saveHabits(DEFAULT_HABITS);
      return DEFAULT_HABITS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load habits:', e);
    return DEFAULT_HABITS;
  }
}

export function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Failed to save habits:', e);
  }
}

export function loadHabitCompletions(): HabitCompletionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABIT_COMPLETIONS);
    if (!raw) {
      // Generate initial 14-day history for sample habits
      const initial: HabitCompletionRecord[] = [];
      const today = new Date();
      DEFAULT_HABITS.forEach((h) => {
        for (let i = 0; i < 14; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          // Completed ~80% of days
          if ((i + h.title.length) % 5 !== 0) {
            initial.push({
              habitId: h.id,
              date: dateStr,
              completed: true,
              completedAt: `${dateStr}T10:00:00.000Z`,
            });
          }
        }
      });
      saveHabitCompletions(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load habit completions:', e);
    return [];
  }
}

export function saveHabitCompletions(records: HabitCompletionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HABIT_COMPLETIONS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save habit completions:', e);
  }
}

export function loadHabitBadges(): HabitBadge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABIT_BADGES);
    if (!raw) {
      saveHabitBadges(DEFAULT_HABIT_BADGES);
      return DEFAULT_HABIT_BADGES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load habit badges:', e);
    return DEFAULT_HABIT_BADGES;
  }
}

export function saveHabitBadges(badges: HabitBadge[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HABIT_BADGES, JSON.stringify(badges));
  } catch (e) {
    console.error('Failed to save habit badges:', e);
  }
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) {
      saveUserProfile(DEFAULT_USER_PROFILE);
      return DEFAULT_USER_PROFILE;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load user profile:', e);
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile:', e);
  }
}

export function loadVacations(): VacationPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VACATIONS);
    if (!raw) {
      saveVacations(DEFAULT_VACATIONS);
      return DEFAULT_VACATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load vacations:', e);
    return DEFAULT_VACATIONS;
  }
}

export function saveVacations(vacations: VacationPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VACATIONS, JSON.stringify(vacations));
  } catch (e) {
    console.error('Failed to save vacations:', e);
  }
}

export function loadDatesToRemember(): DateToRemember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DATES_TO_REMEMBER);
    if (!raw) {
      saveDatesToRemember(DEFAULT_DATES_TO_REMEMBER);
      return DEFAULT_DATES_TO_REMEMBER;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load dates to remember:', e);
    return DEFAULT_DATES_TO_REMEMBER;
  }
}

export function saveDatesToRemember(dates: DateToRemember[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DATES_TO_REMEMBER, JSON.stringify(dates));
  } catch (e) {
    console.error('Failed to save dates to remember:', e);
  }
}

export function loadRecurringRules(): RecurringRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECURRING_RULES);
    if (!raw) {
      saveRecurringRules(DEFAULT_RECURRING_RULES);
      return DEFAULT_RECURRING_RULES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load recurring rules:', e);
    return DEFAULT_RECURRING_RULES;
  }
}

export function saveRecurringRules(rules: RecurringRule[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECURRING_RULES, JSON.stringify(rules));
  } catch (e) {
    console.error('Failed to save recurring rules:', e);
  }
}

