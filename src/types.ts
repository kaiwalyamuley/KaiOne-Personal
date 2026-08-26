export type TransactionType =
  | 'expense'
  | 'income'
  | 'refund'
  | 'transfer'
  | 'investment'
  | 'lend'
  | 'borrow';

export type AccountType =
  | 'bank'
  | 'cash'
  | 'credit_card'
  | 'wallet'
  | 'investment'
  | 'other';

export type PaymentMode =
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Cash'
  | 'Net Banking'
  | 'Cheque'
  | 'Auto Debit'
  | 'Other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  bankName?: string;
  accountNumberLast4?: string;
  color?: string;
  isDefault?: boolean;
  interestRate?: number; // Annual interest % for savings/FD
  ifscCode?: string;
  notes?: string;
}

export type CardNetwork = 'Visa' | 'Mastercard' | 'RuPay' | 'Amex' | 'Diners';

export interface CreditCard {
  id: string;
  name: string;
  bankName: string;
  cardNumberLast4: string;
  cardNetwork: CardNetwork;
  creditLimit: number; // in INR
  currentOutstanding: number; // in INR
  billingCycleDay: number; // 1 - 31 (Statement generation date)
  paymentDueDay: number; // 1 - 31 (Due date)
  minAmountDue?: number;
  rewardPoints?: number;
  annualFee?: number;
  annualFeeWaiverSpend?: number;
  annualSpent?: number;
  cardColor?: string;
  status: 'active' | 'blocked' | 'closed';
  linkedAccountId?: string; // Account for auto-pay
  notes?: string;
}

export type LoanType =
  | 'home'
  | 'car'
  | 'personal'
  | 'education'
  | 'gold'
  | 'consumer_emi'
  | 'business';

export interface Loan {
  id: string;
  name: string;
  lenderName: string;
  loanType: LoanType;
  principalAmount: number; // Original sanctioned loan amount in INR
  outstandingPrincipal: number; // Remaining principal balance in INR
  interestRatePercent: number; // Annual interest % (e.g. 8.5)
  interestType: 'fixed' | 'floating';
  tenureMonths: number; // Total tenure in months
  tenureCompletedMonths: number; // Months already paid
  monthlyEmi: number; // Monthly installment amount in INR
  emiDueDay: number; // 1 - 31 (Day of month when EMI is debited)
  linkedAccountId?: string; // Account auto-debited for EMI
  startDate: string; // YYYY-MM-DD
  endDate?: string; // Projected closure date
  prepaymentTotal?: number; // Total extra prepayments made
  accountNumber?: string; // Loan A/c Number
  status: 'active' | 'closed';
  notes?: string;
}

export interface InstitutionSlice {
  bankName: string;
  accounts: Account[];
  creditCards: CreditCard[];
  loans: Loan[];
  totalAssetValue: number;
  totalLiabilityValue: number;
  netExposure: number; // Assets - Liabilities with this bank
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType | 'all';
  icon: string;
  color?: string;
  subcategories?: string[];
  defaultMonthlyBudget?: number; // Standard monthly base budget
  isRolloverEnabled?: boolean; // Default rollover preference
  defaultMaxRolloverCap?: number | null; // Standard maximum rollover cap in INR
}

export interface MonthlyCategoryBudget {
  id: string; // e.g. 'budget_2026-08_cat_transport'
  month: string; // 'YYYY-MM', e.g. '2026-08'
  categoryId: string; // Category ID or name
  baseBudget: number; // Base allocated budget for this specific month (e.g. 2000)
  rolloverEnabled: boolean; // Whether rollover is active (default true)
  maxRolloverCap?: number | null; // Maximum rollover cap amount in INR (null = uncapped)
  manualRolloverOverride: number | null; // User manual edit of rolled amount (null = auto compute)
  manualRolloverNotes?: string; // Reason or memo for manual adjustment
  notes?: string;
  updatedAt?: string;
}

export interface CategoryBudgetStatus {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor?: string;
  month: string; // 'YYYY-MM'
  baseBudget: number;
  isRolloverEnabled: boolean;
  maxRolloverCap: number | null; // Maximum rollover cap (null = uncapped)
  isRolloverCapped: boolean; // True if computed surplus was clamped by the cap
  uncappedRollover: number; // Raw computed rollover before capping
  cappedExcessAmount: number; // Amount discarded or preserved by the cap
  previousMonthSpent: number;
  previousMonthEffectiveBudget: number;
  computedRolloverFromPrevMonth: number; // Unspent surplus (+ve) or Overspent deficit (-ve)
  manualRolloverOverride: number | null;
  isManuallyOverridden: boolean;
  effectiveRollover: number; // Final rollover applied (manual if set, else computed after cap)
  totalEffectiveBudget: number; // baseBudget + effectiveRollover
  actualSpent: number; // Sum of expenses in this month
  remainingBudget: number; // totalEffectiveBudget - actualSpent
  utilizationPercent: number; // (actualSpent / totalEffectiveBudget) * 100
  status: 'healthy' | 'warning' | 'overspent' | 'empty';
  transactionsCount: number;
  manualRolloverNotes?: string;
}

export interface BudgetSummary {
  month: string; // 'YYYY-MM'
  totalBaseBudget: number;
  totalRolloverIn: number; // Net rolled over from previous month
  totalEffectiveBudget: number;
  totalActualSpent: number;
  totalRemaining: number;
  totalOverspentAmount: number;
  totalSurplusSavings: number;
  totalCappedExcessAmount?: number; // Total surplus clipped by caps
  overallUtilizationPercent: number;
  totalCategoriesCount: number;
  overspentCategoriesCount: number;
  warningCategoriesCount: number;
  healthyCategoriesCount: number;
  cappedCategoriesCount?: number; // Number of categories with capped rollovers
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // in INR
  dateTime: string; // ISO format or YYYY-MM-DDTHH:mm
  location: string; // Store, merchant, online portal, or city
  accountFromId?: string; // Where money came out from
  accountToId?: string; // Where money went into (for Incomes, Refunds, Transfers, Borrowed)
  category: string;
  subCategory?: string;
  personName?: string; // For Lend To / Borrowed From / Refund source
  personPhone?: string;
  dueDate?: string; // Optional due date for lend/borrow
  description: string; // Notes / Details
  paymentMode?: PaymentMode;
  tags?: string[];
  status?: 'completed' | 'pending' | 'cleared';
  recurringRuleId?: string; // Link to recurring rule that generated this
  createdAt: string;
  updatedAt: string;
}

export type RecurrenceInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringRule {
  id: string;
  title: string; // e.g. "House Rent", "Netflix Subscription", "Salary", "SIP"
  type: TransactionType;
  amount: number; // in INR
  category: string;
  subCategory?: string;
  accountFromId?: string; // Debited from
  accountToId?: string; // Credited to
  paymentMode?: PaymentMode;
  location?: string; // Merchant / platform / landlord
  description?: string; // Memo / notes
  interval: RecurrenceInterval; // daily | weekly | monthly | yearly
  intervalCount?: number; // e.g. every 1 month, every 2 weeks (default 1)
  dayOfMonth?: number; // 1-31 (for monthly recurrence)
  dayOfWeek?: number; // 0 (Sun) to 6 (Sat) for weekly recurrence
  startDate: string; // YYYY-MM-DD
  endDate?: string; // Optional YYYY-MM-DD
  nextExecutionDate: string; // YYYY-MM-DD
  lastGeneratedDate?: string; // YYYY-MM-DD
  totalTimesGenerated: number;
  totalAmountGenerated: number;
  status: 'active' | 'paused' | 'stopped';
  autoGenerate: boolean; // true = auto generate on due date; false = prompt only
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PersonLedger {
  name: string;
  phone?: string;
  dueDate?: string; // Target / agreed settlement due date
  totalLent: number; // You gave them (they owe you)
  totalLentRepaid: number; // They paid you back
  totalBorrowed: number; // You took from them (you owe them)
  totalBorrowedRepaid: number; // You paid them back
  netBalance: number; // Positive = They owe you (Receivable), Negative = You owe them (Payable)
  transactions: Transaction[];
  lastTransactionDate?: string;
}

export interface FinancialSummary {
  totalBalance: number; // Bank & liquid cash
  totalIncome: number;
  totalExpense: number;
  totalInvestments: number; // Demat/SIP/FD
  totalRefunds: number;
  totalLentOutstanding: number; // Total receivables (Khata)
  totalBorrowedOutstanding: number; // Total payables (Khata)
  totalCreditLimit: number; // Sum of all credit card limits
  totalCreditCardOutstanding: number; // Current dues on all cards
  creditUtilizationPercent: number; // (Total Outstanding / Total Limit) * 100
  totalLoanSanctioned: number; // Original principal
  totalLoanOutstanding: number; // Remaining loan principal
  totalMonthlyEmiObligation: number; // Sum of active EMIs
  totalAssets: number; // Liquid Balance + Investments + Lent Receivables
  totalLiabilities: number; // CC Dues + Loan Outstanding + Borrowed Payables
  netWorthEstimate: number; // Total Assets - Total Liabilities
  debtToIncomeRatio?: number; // Estimated %
}

// ----------------------------------------------------
// 1.d Goal Savings Bucket & Streak Achievements
// ----------------------------------------------------
export type GoalCategory =
  | 'emergency'
  | 'house'
  | 'vehicle'
  | 'travel'
  | 'retirement'
  | 'gadget'
  | 'wedding'
  | 'education'
  | 'other';

export interface GoalContribution {
  id: string;
  amount: number; // in INR
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  note?: string;
  fromAccountId?: string;
}

export interface SavingsGoalBucket {
  id: string;
  title: string;
  category: GoalCategory;
  targetAmount: number; // in INR
  currentSaved: number; // in INR
  targetDate: string; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
  monthlyTarget: number; // in INR
  priority: 'high' | 'medium' | 'low';
  color: string;
  icon: string;
  linkedAccountId?: string;
  contributions: GoalContribution[];
  monthlyStreak: number; // Consecutive months with on-time contributions
  lastContributionMonth?: string; // YYYY-MM
  status: 'in_progress' | 'completed' | 'paused';
  notes?: string;
}

export interface GoalAchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  category: 'streak' | 'amount' | 'milestone' | 'consistency';
  progressPercent: number;
}

// ----------------------------------------------------
// 1.e Wealth Forecasting Engine
// ----------------------------------------------------
export interface LifeEventImpact {
  id: string;
  title: string;
  yearOffset: number; // Years from now (e.g. 2 for 2028)
  amount: number; // +ve for windfall/inheritance, -ve for major expense (e.g. house downpayment)
  type: 'expense' | 'windfall' | 'income_boost' | 'expense_increase';
  recurringYears?: number; // 0 for one-time
  description?: string;
}

export interface WealthForecastParams {
  currentLiquidAssets: number; // in INR
  currentInvestments: number; // in INR
  currentTotalLiabilities: number; // in INR
  monthlyNetIncome: number; // in INR
  annualIncomeGrowthRate: number; // % e.g. 8.0
  monthlyExpenses: number; // in INR
  annualExpenseInflationRate: number; // % e.g. 6.0
  monthlyInvestmentContribution: number; // in INR
  expectedEquityReturnRate: number; // % e.g. 12.0
  expectedDebtReturnRate: number; // % e.g. 7.0
  portfolioEquityAllocationPercent: number; // % e.g. 70
  simulationYears: number; // e.g. 10, 20, 30
  retirementAgeTarget?: number;
  currentAge?: number;
  lifeEvents: LifeEventImpact[];
}

export interface YearlyWealthProjection {
  year: number;
  calendarYear: number;
  age: number;
  annualIncome: number;
  annualExpenses: number;
  annualSavings: number;
  investmentCorpusNominal: number;
  investmentCorpusReal: number; // Inflation adjusted
  liabilitiesRemaining: number;
  netWorthNominal: number;
  netWorthReal: number; // Inflation adjusted purchasing power
  passiveIncomeAnnual: number; // Safe Withdrawal 4% or Interest yield
  passiveIncomeMonthly: number;
  financialIndependenceScore: number; // (Passive Income / Annual Expenses) * 100
  isFireAchieved: boolean;
}

export interface WealthForecastResult {
  projections: YearlyWealthProjection[];
  baselineNetWorthFinal: number;
  optimisticNetWorthFinal: number;
  conservativeNetWorthFinal: number;
  fireYear?: number;
  totalCompoundedInterestEarned: number;
  totalPrincipalInvested: number;
}

// ----------------------------------------------------
// 2. Health Module Types
// ----------------------------------------------------
export interface VitalsLog {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg?: number;
  systolicBp?: number;
  diastolicBp?: number;
  restingHeartRate?: number;
  bloodSugarMgDl?: number;
  sleepHours?: number;
  sleepQuality?: 'poor' | 'fair' | 'good' | 'optimal';
  waterMl?: number; // e.g. 3000
  energyLevel?: 1 | 2 | 3 | 4 | 5; // 1 to 5
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  type: 'Gym / Strength' | 'Running' | 'Walking' | 'Yoga' | 'Swimming' | 'Cycling' | 'HIIT' | 'Other';
  durationMinutes: number;
  caloriesBurned?: number;
  distanceKm?: number;
  intensity: 'light' | 'moderate' | 'high' | 'peak';
  notes?: string;
}

export interface HealthSummary {
  currentWeightKg: number;
  targetWeightKg: number;
  bmi: number;
  avgSleepHours: number;
  todayWaterMl: number;
  waterGoalMl: number;
  weeklyWorkoutsCount: number;
  activeHealthStreak: number; // Days logged consecutively
  wellnessScore: number; // 0-100
}

// ----------------------------------------------------
// 3. Habits Module Types
// ----------------------------------------------------
export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | '3x_weekly';
export type HabitCategoryType = 'mind' | 'body' | 'productivity' | 'wealth' | 'growth';

export interface Habit {
  id: string;
  title: string;
  category: HabitCategoryType;
  cue?: string; // Trigger (e.g. "After morning tea")
  routine: string; // Action (e.g. "Read 10 pages of book")
  reward?: string; // Reward (e.g. "Check social media")
  frequency: HabitFrequency;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  targetDaysPerMonth: number;
  color: string;
  icon: string;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  active: boolean;
  createdAt: string;
}

export interface HabitCompletionRecord {
  id?: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
  timestamp?: string;
  note?: string;
}

export interface HabitBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlockedAt?: string;
  isUnlocked: boolean;
}

// ----------------------------------------------------
// 4. Personal Profile, Calendar, Vacation & Dates to Remember
// ----------------------------------------------------
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthdate: string; // YYYY-MM-DD or MM-DD (e.g. 1998-09-01)
  birthdayFormatted?: string; // e.g. "1st September"
  bio: string;
  avatar: string; // Emoji, preset icon, or image URL
  city: string;
  country: string;
  occupation: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContact?: string;
  currencySymbol: string;
  monthlySavingsTarget: number;
  emergencyFundTarget: number;
  targetWeightKg?: number;
  dailyWaterGoalMl?: number;
  targetDailyWaterMl?: number;
  targetDailySleepHours?: number;
  favoriteFestivals?: string[];
  themePreference?: 'indigo' | 'slate' | 'emerald' | 'amber' | 'rose';
  updatedAt?: string;
}

export type VacationStatus = 'planning' | 'booked' | 'completed' | 'dream';

export interface VacationItineraryItem {
  id: string;
  dayNumber: number;
  date: string; // YYYY-MM-DD
  title: string;
  activities: string[];
  notes?: string;
}

export interface VacationPackingItem {
  id: string;
  item: string;
  category: 'clothing' | 'documents' | 'electronics' | 'health' | 'toiletries' | 'gear' | 'other';
  isPacked: boolean;
}

export type PackingItem = VacationPackingItem;

export interface VacationBooking {
  id: string;
  type: 'flight' | 'hotel' | 'train' | 'cab' | 'activity' | 'visa';
  provider: string;
  confirmationCode?: string;
  date?: string;
  cost?: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
}

export interface VacationPlan {
  id: string;
  title: string;
  destination: string;
  country: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: VacationStatus;
  estimatedBudget: number;
  actualSpent: number;
  coverGradient: string;
  coverEmoji: string;
  travelCompanions: string[];
  itinerary: VacationItineraryItem[];
  packingList: VacationPackingItem[];
  bookings: VacationBooking[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type DateCategory =
  | 'birthday'
  | 'festival'
  | 'anniversary'
  | 'renewal'
  | 'bill_due'
  | 'milestone'
  | 'medical'
  | 'personal';

export interface DateToRemember {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD or MM-DD
  category: DateCategory;
  isAnnualRecurring: boolean;
  reminderDaysBefore: number;
  estimatedCost?: number;
  icon: string;
  color: string;
  personName?: string;
  description?: string;
  tags?: string[];
  isImportant?: boolean;
}

export interface FestivalHighlight {
  name: string;
  dateStr: string; // e.g. "Sep 14"
  tagline: string;
  culturalNote: string;
  icon: string;
  isPersonalMilestone?: boolean;
}

export interface MonthlyFestivalArt {
  monthIndex: number; // 0 - 11
  monthName: string; // "January" ... "December"
  heroTitle: string;
  heroSubtitle: string;
  culturalQuote: string;
  themeColor: string;
  gradientBg: string;
  accentBorder: string;
  artMotif: 'kites_sun' | 'shivratri_moon' | 'holi_colors' | 'harvest_baisakhi' | 'buddha_lotus' | 'yoga_monsoon' | 'guru_greenery' | 'rakhi_tricolor' | 'ganesh_birthday' | 'navratri_dussehra' | 'diwali_diyas' | 'christmas_stars';
  festivals: FestivalHighlight[];
}

export interface GmailReminderSettings {
  isEnabled: boolean;
  recipientEmail: string;
  reminderTime: string; // e.g. "22:30"
  timezone: string;
  includeFinanceSummary: boolean;
  includeHabitsChecklist: boolean;
  includeHealthVitals: boolean;
  includeUpcomingEvents: boolean;
  lastSentTimestamp?: string | null;
  lastStatus?: 'success' | 'failed' | null;
}
