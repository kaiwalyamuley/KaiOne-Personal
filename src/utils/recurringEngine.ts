import { RecurringRule, RecurrenceInterval, Transaction } from '../types';

/**
 * Format a Date object into YYYY-MM-DD string
 */
export function formatDateYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's local date as YYYY-MM-DD string
 */
export function getTodayYMD(): string {
  return formatDateYMD(new Date());
}

/**
 * Calculate the next execution date given a starting date and interval rule
 */
export function calculateNextOccurrence(
  currentDateStr: string,
  interval: RecurrenceInterval,
  intervalCount: number = 1,
  dayOfMonth?: number,
  dayOfWeek?: number
): string {
  const parts = currentDateStr.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);

  const count = Math.max(1, intervalCount);

  switch (interval) {
    case 'daily': {
      date.setDate(date.getDate() + count);
      break;
    }
    case 'weekly': {
      date.setDate(date.getDate() + count * 7);
      if (typeof dayOfWeek === 'number' && dayOfWeek >= 0 && dayOfWeek <= 6) {
        const currentDay = date.getDay();
        const diff = (dayOfWeek - currentDay + 7) % 7;
        if (diff > 0) {
          date.setDate(date.getDate() + diff);
        }
      }
      break;
    }
    case 'monthly': {
      const targetMonth = date.getMonth() + count;
      const targetYear = date.getFullYear() + Math.floor(targetMonth / 12);
      const normalizedMonth = targetMonth % 12;

      // Desired day of month
      let targetDay = dayOfMonth || parts[2];
      const maxDaysInTargetMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
      targetDay = Math.min(targetDay, maxDaysInTargetMonth);

      const nextDate = new Date(targetYear, normalizedMonth, targetDay, 12, 0, 0);
      return formatDateYMD(nextDate);
    }
    case 'yearly': {
      date.setFullYear(date.getFullYear() + count);
      break;
    }
  }

  return formatDateYMD(date);
}

/**
 * Create a new Transaction instance from an active RecurringRule
 */
export function generateTransactionFromRule(
  rule: RecurringRule,
  executionDateStr?: string
): Transaction {
  const nowIso = new Date().toISOString();
  const dateStr = executionDateStr || rule.nextExecutionDate || getTodayYMD();
  
  // Use today's time if executing today, else 09:00:00
  const timePortion = dateStr === getTodayYMD() 
    ? new Date().toTimeString().slice(0, 8) 
    : '09:00:00';
  const fullDateTime = `${dateStr}T${timePortion}`;

  const defaultTags = ['recurring'];
  if (rule.tags) {
    rule.tags.forEach((t) => {
      if (!defaultTags.includes(t)) defaultTags.push(t);
    });
  }

  return {
    id: `tx_rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type: rule.type,
    amount: rule.amount,
    dateTime: fullDateTime,
    location: rule.location?.trim() || rule.title,
    accountFromId: rule.accountFromId,
    accountToId: rule.accountToId,
    category: rule.category || 'General',
    subCategory: rule.subCategory,
    description: rule.description
      ? `[Recurring] ${rule.description}`
      : `[Auto-Recurring: ${rule.interval.toUpperCase()}] ${rule.title}`,
    paymentMode: rule.paymentMode || 'Auto Debit',
    tags: defaultTags,
    status: 'completed',
    recurringRuleId: rule.id,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

/**
 * Process all active recurring rules against the current date.
 * Automatically generates transactions for rules that are due and marked with autoGenerate = true.
 */
export function processAllDueRecurringRules(
  rules: RecurringRule[],
  currentDateStr: string = getTodayYMD()
): {
  generatedTransactions: Transaction[];
  updatedRules: RecurringRule[];
  generatedCount: number;
} {
  const generatedTransactions: Transaction[] = [];
  const updatedRules: RecurringRule[] = [];
  let generatedCount = 0;

  for (const rule of rules) {
    if (rule.status !== 'active') {
      updatedRules.push(rule);
      continue;
    }

    // Check if end date passed
    if (rule.endDate && rule.endDate < currentDateStr && rule.nextExecutionDate > rule.endDate) {
      updatedRules.push({
        ...rule,
        status: 'stopped',
        updatedAt: new Date().toISOString(),
      });
      continue;
    }

    // Check if due today or earlier
    if (rule.nextExecutionDate <= currentDateStr) {
      if (rule.autoGenerate) {
        // Generate the transaction
        const tx = generateTransactionFromRule(rule, rule.nextExecutionDate);
        generatedTransactions.push(tx);
        generatedCount++;

        // Calculate next execution date
        const nextDate = calculateNextOccurrence(
          rule.nextExecutionDate,
          rule.interval,
          rule.intervalCount || 1,
          rule.dayOfMonth,
          rule.dayOfWeek
        );

        const isExpired = rule.endDate ? nextDate > rule.endDate : false;

        updatedRules.push({
          ...rule,
          lastGeneratedDate: rule.nextExecutionDate,
          nextExecutionDate: nextDate,
          totalTimesGenerated: (rule.totalTimesGenerated || 0) + 1,
          totalAmountGenerated: (rule.totalAmountGenerated || 0) + rule.amount,
          status: isExpired ? 'stopped' : 'active',
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Rule is due but requires manual confirmation
        updatedRules.push(rule);
      }
    } else {
      updatedRules.push(rule);
    }
  }

  return {
    generatedTransactions,
    updatedRules,
    generatedCount,
  };
}

/**
 * Execute a single recurring rule manually right now
 */
export function executeSingleRuleManually(
  rule: RecurringRule,
  customDateStr: string = getTodayYMD()
): {
  generatedTransaction: Transaction;
  updatedRule: RecurringRule;
} {
  const tx = generateTransactionFromRule(rule, customDateStr);
  const nextDate = calculateNextOccurrence(
    rule.nextExecutionDate || customDateStr,
    rule.interval,
    rule.intervalCount || 1,
    rule.dayOfMonth,
    rule.dayOfWeek
  );

  const isExpired = rule.endDate ? nextDate > rule.endDate : false;

  const updatedRule: RecurringRule = {
    ...rule,
    lastGeneratedDate: customDateStr,
    nextExecutionDate: nextDate,
    totalTimesGenerated: (rule.totalTimesGenerated || 0) + 1,
    totalAmountGenerated: (rule.totalAmountGenerated || 0) + rule.amount,
    status: isExpired ? 'stopped' : rule.status,
    updatedAt: new Date().toISOString(),
  };

  return {
    generatedTransaction: tx,
    updatedRule,
  };
}

/**
 * Calculate friendly recurrence text description
 */
export function getRecurrenceDescription(rule: RecurringRule): string {
  const intervalLabel = {
    daily: rule.intervalCount && rule.intervalCount > 1 ? `Every ${rule.intervalCount} days` : 'Daily',
    weekly: rule.intervalCount && rule.intervalCount > 1 ? `Every ${rule.intervalCount} weeks` : 'Weekly',
    monthly: rule.intervalCount && rule.intervalCount > 1 ? `Every ${rule.intervalCount} months` : 'Monthly',
    yearly: rule.intervalCount && rule.intervalCount > 1 ? `Every ${rule.intervalCount} years` : 'Yearly',
  }[rule.interval];

  let details = '';
  if (rule.interval === 'monthly' && rule.dayOfMonth) {
    const suffix =
      rule.dayOfMonth === 1 || rule.dayOfMonth === 21 || rule.dayOfMonth === 31
        ? 'st'
        : rule.dayOfMonth === 2 || rule.dayOfMonth === 22
        ? 'nd'
        : rule.dayOfMonth === 3 || rule.dayOfMonth === 23
        ? 'rd'
        : 'th';
    details = ` on the ${rule.dayOfMonth}${suffix}`;
  } else if (rule.interval === 'weekly' && typeof rule.dayOfWeek === 'number') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    details = ` on ${days[rule.dayOfWeek] || 'day'}`;
  }

  return `${intervalLabel}${details}`;
}

/**
 * Calculate recurring monthly commitment stats
 */
export function calculateRecurringSummary(rules: RecurringRule[]) {
  const activeRules = rules.filter((r) => r.status === 'active');
  const today = getTodayYMD();

  let totalMonthlyExpense = 0;
  let totalMonthlyIncome = 0;
  let totalMonthlyInvestment = 0;
  let dueTodayCount = 0;
  let dueIn7DaysCount = 0;

  const in7Days = new Date();
  in7Days.setDate(in7Days.getDate() + 7);
  const in7DaysStr = formatDateYMD(in7Days);

  activeRules.forEach((rule) => {
    // Normalize to monthly equivalent
    let monthlyEquivalent = rule.amount;
    if (rule.interval === 'daily') monthlyEquivalent = rule.amount * 30;
    else if (rule.interval === 'weekly') monthlyEquivalent = rule.amount * 4.33;
    else if (rule.interval === 'yearly') monthlyEquivalent = rule.amount / 12;

    if (rule.type === 'expense') totalMonthlyExpense += monthlyEquivalent;
    else if (rule.type === 'income') totalMonthlyIncome += monthlyEquivalent;
    else if (rule.type === 'investment') totalMonthlyInvestment += monthlyEquivalent;

    if (rule.nextExecutionDate <= today) {
      dueTodayCount++;
    } else if (rule.nextExecutionDate <= in7DaysStr) {
      dueIn7DaysCount++;
    }
  });

  return {
    totalRules: rules.length,
    activeCount: activeRules.length,
    pausedCount: rules.filter((r) => r.status === 'paused').length,
    stoppedCount: rules.filter((r) => r.status === 'stopped').length,
    totalMonthlyExpense,
    totalMonthlyIncome,
    totalMonthlyInvestment,
    dueTodayCount,
    dueIn7DaysCount,
  };
}
