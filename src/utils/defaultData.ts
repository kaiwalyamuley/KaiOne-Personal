import { Account, Category, CreditCard, Loan, Transaction, SavingsGoalBucket, GoalAchievementBadge, WealthForecastParams, VitalsLog, WorkoutSession, Habit, HabitBadge, RecurringRule } from '../types';

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc_primary_bank',
    name: 'Primary Bank Account',
    type: 'bank',
    bankName: 'Primary Bank',
    accountNumberLast4: '0001',
    initialBalance: 0,
    color: '#0284c7',
    isDefault: true,
    notes: 'Main bank account for salary, transfers and expenses',
  },
  {
    id: 'acc_cash_wallet',
    name: 'Cash in Hand',
    type: 'cash',
    initialBalance: 0,
    color: '#16a34a',
    isDefault: false,
    notes: 'Physical cash in wallet',
  },
];

export const DEFAULT_CREDIT_CARDS: CreditCard[] = [];

export const DEFAULT_LOANS: Loan[] = [];

export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses
  { id: 'cat_food', name: 'Food & Dining', type: 'expense', icon: 'Utensils', subcategories: ['Chai/Snacks', 'Groceries', 'Restaurants', 'Swiggy/Zomato', 'Cafes'] },
  { id: 'cat_groceries', name: 'Groceries & Provisions', type: 'expense', icon: 'ShoppingBag', subcategories: ['Blinkit/Zepto', 'Supermarket', 'Vegetables/Fruits', 'Dairy'] },
  { id: 'cat_transport', name: 'Transport & Fuel', type: 'expense', icon: 'Car', subcategories: ['Petrol/Diesel', 'Auto/Cab/Ola/Uber', 'Metro/Train', 'Parking/Toll'] },
  { id: 'cat_bills', name: 'Bills & Utilities', type: 'expense', icon: 'Zap', subcategories: ['Electricity', 'Mobile/Broadband', 'LPG Gas', 'Maintenance', 'Water'] },
  { id: 'cat_shopping', name: 'Shopping & Electronics', type: 'expense', icon: 'ShoppingCart', subcategories: ['Clothing', 'Amazon/Flipkart', 'Gadgets', 'Home Decor'] },
  { id: 'cat_health', name: 'Health & Medical', type: 'expense', icon: 'HeartPulse', subcategories: ['Doctor Consultation', 'Pharmacy/Medicines', 'Lab Tests', 'Health Insurance'] },
  { id: 'cat_entertainment', name: 'Entertainment & OTT', type: 'expense', icon: 'Film', subcategories: ['Netflix/Prime', 'Movies/Cinema', 'Gaming', 'Events'] },
  { id: 'cat_rent', name: 'Rent & Housing', type: 'expense', icon: 'Home', subcategories: ['House Rent', 'Society Dues', 'Furnishing'] },
  { id: 'cat_education', name: 'Education & Learning', type: 'expense', icon: 'GraduationCap', subcategories: ['Courses', 'Books', 'Certifications'] },
  { id: 'cat_personal', name: 'Personal Care & Grooming', type: 'expense', icon: 'Sparkles', subcategories: ['Salon', 'Cosmetics', 'Gym/Fitness'] },
  { id: 'cat_misc_exp', name: 'Miscellaneous', type: 'expense', icon: 'MoreHorizontal', subcategories: ['Donations/Gifts', 'Fines', 'Repairs'] },

  // Income
  { id: 'cat_salary', name: 'Salary / Monthly Pay', type: 'income', icon: 'Briefcase', subcategories: ['Fixed Pay', 'Bonus', 'Incentives', 'Reimbursements'] },
  { id: 'cat_freelance', name: 'Freelance & Consulting', type: 'income', icon: 'Laptop', subcategories: ['Client Projects', 'Hourly Work', 'Advisory'] },
  { id: 'cat_business', name: 'Business Profits', type: 'income', icon: 'Building2', subcategories: ['Sales', 'Services', 'Commercial'] },
  { id: 'cat_interest', name: 'Interest & Dividends', type: 'income', icon: 'TrendingUp', subcategories: ['Bank Savings Interest', 'FD Interest', 'Stock Dividends'] },
  { id: 'cat_rental_inc', name: 'Rental Income', type: 'income', icon: 'Key', subcategories: ['Property Rent', 'Commercial Rent'] },
  { id: 'cat_gift_inc', name: 'Gifts & Rewards', type: 'income', icon: 'Gift', subcategories: ['Cashback', 'Festival Gift', 'Family Gift'] },

  // Investments / Savings
  { id: 'cat_mf', name: 'Mutual Funds / SIP', type: 'investment', icon: 'PieChart', subcategories: ['Index Fund', 'Large Cap', 'Small/Mid Cap', 'ELSS Tax Saver'] },
  { id: 'cat_stocks', name: 'Direct Equity / Stocks', type: 'investment', icon: 'TrendingUp', subcategories: ['Long Term', 'Swing Trading', 'Bluechip'] },
  { id: 'cat_fd_rd', name: 'Fixed Deposit / RD', type: 'investment', icon: 'Landmark', subcategories: ['Bank FD', 'Corporate FD', 'Recurring Deposit'] },
  { id: 'cat_gold', name: 'Gold / SGB', type: 'investment', icon: 'Coins', subcategories: ['Sovereign Gold Bonds', 'Digital Gold', 'Physical Gold'] },
  { id: 'cat_ppf_epf', name: 'PPF / NPS / PF', type: 'investment', icon: 'ShieldCheck', subcategories: ['PPF Contribution', 'NPS Tier 1', 'Voluntary PF'] },
  { id: 'cat_crypto', name: 'Crypto / Alternative', type: 'investment', icon: 'Binary', subcategories: ['Bitcoin', 'Ethereum', 'USDT'] },

  // Lend / Borrow / Transfers / Refunds
  { id: 'cat_transfer', name: 'Self Account Transfer', type: 'transfer', icon: 'ArrowRightLeft', subcategories: ['Savings to Savings', 'ATM Cash Withdrawal', 'Credit Card Bill Payment', 'Wallet Top-up'] },
  { id: 'cat_refund', name: 'Refund / Cash Back', type: 'refund', icon: 'RotateCcw', subcategories: ['Amazon/Flipkart Return', 'Failed UPI Refund', 'Flight/Train Ticket Refund', 'Merchant Reversal'] },
  { id: 'cat_lend', name: 'Lent to Person / Receivable', type: 'lend', icon: 'UserCheck', subcategories: ['Friend Help', 'Family Support', 'Colleague Split', 'Advance Payment'] },
  { id: 'cat_borrow', name: 'Borrowed from Person / Payable', type: 'borrow', icon: 'UserMinus', subcategories: ['Emergency Loan', 'Friend Loan', 'Family Loan', 'Credit Advance'] },
];

// Clean 100% Fresh Start: Zero Transactions
export const INITIAL_SAMPLE_TRANSACTIONS: Transaction[] = [];

// Clean 100% Fresh Start: Zero Savings Goals
export const DEFAULT_SAVINGS_GOALS: SavingsGoalBucket[] = [];

// Clean 100% Fresh Start: Zero Goal Badges
export const DEFAULT_GOAL_BADGES: GoalAchievementBadge[] = [];

// Quick 1-Click Logging Presets
export const QUICK_PRESETS = [
  { label: 'Chai / Coffee', category: 'Food & Dining', subCategory: 'Chai/Snacks', location: 'Local Cafe', paymentMode: 'upi' as const, amount: 20, type: 'expense' as const, icon: 'Coffee' },
  { label: 'Groceries / Milk', category: 'Groceries & Provisions', subCategory: 'Dairy', location: 'Local Mart', paymentMode: 'upi' as const, amount: 250, type: 'expense' as const, icon: 'ShoppingBag' },
  { label: 'Petrol / Fuel', category: 'Transport & Fuel', subCategory: 'Petrol/Diesel', location: 'Fuel Station', paymentMode: 'upi' as const, amount: 500, type: 'expense' as const, icon: 'Fuel' },
  { label: 'Auto / Cab', category: 'Transport & Fuel', subCategory: 'Auto/Cab/Ola/Uber', location: 'City Ride', paymentMode: 'upi' as const, amount: 150, type: 'expense' as const, icon: 'Car' },
  { label: 'Swiggy / Zomato', category: 'Food & Dining', subCategory: 'Swiggy/Zomato', location: 'Online Delivery', paymentMode: 'upi' as const, amount: 350, type: 'expense' as const, icon: 'Utensils' },
  { label: 'Mobile Recharge', category: 'Bills & Utilities', subCategory: 'Mobile/Broadband', location: 'Jio / Airtel', paymentMode: 'upi' as const, amount: 299, type: 'expense' as const, icon: 'Smartphone' },
];

// Wealth Forecasting Default Base Parameters
export const DEFAULT_WEALTH_PARAMS: WealthForecastParams = {
  currentLiquidAssets: 0,
  currentInvestments: 0,
  currentTotalLiabilities: 0,
  monthlyNetIncome: 75000,
  annualIncomeGrowthRate: 8.0,
  monthlyExpenses: 40000,
  annualExpenseInflationRate: 6.0,
  monthlyInvestmentContribution: 25000,
  expectedEquityReturnRate: 12.0,
  expectedDebtReturnRate: 7.0,
  portfolioEquityAllocationPercent: 70,
  simulationYears: 15,
  retirementAgeTarget: 55,
  currentAge: 28,
  lifeEvents: [],
};

// Clean 100% Fresh Start: Zero Vitals Logs
export const DEFAULT_VITALS_LOGS: VitalsLog[] = [];

// Clean 100% Fresh Start: Zero Workouts
export const DEFAULT_WORKOUT_SESSIONS: WorkoutSession[] = [];

// Clean 100% Fresh Start: Zero Habits
export const DEFAULT_HABITS: Habit[] = [];

// Clean 100% Fresh Start: Zero Habit Badges
export const DEFAULT_HABIT_BADGES: HabitBadge[] = [];

// Clean 100% Fresh Start: Zero Recurring Rules
export const DEFAULT_RECURRING_RULES: RecurringRule[] = [];
