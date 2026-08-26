// Indian Rupee & Date Formatters

/**
 * Format a number as Indian Rupee (INR)
 * e.g., 125000 -> ₹1,25,000.00 or ₹1,25,000
 */
export function formatINR(
  amount: number,
  includeDecimals: boolean = false,
  compact: boolean = false
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  if (compact && Math.abs(amount) >= 10000000) {
    // Crores
    const cr = amount / 10000000;
    return `₹${cr.toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (compact && Math.abs(amount) >= 100000) {
    // Lakhs
    const lk = amount / 100000;
    return `₹${lk.toFixed(2).replace(/\.00$/, '')} L`;
  }
  if (compact && Math.abs(amount) >= 1000) {
    // Thousands
    const k = amount / 1000;
    return `₹${k.toFixed(1).replace(/\.0$/, '')} k`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Format Date & Time for display
 */
export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-IN', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return `${day} ${month} ${year}, ${time}`;
  } catch {
    return isoString;
  }
}

export function formatDateOnly(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-IN', { month: 'short' });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

/**
 * Return current local ISO string formatted for datetime-local input
 */
export function getCurrentLocalDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function isSameDay(d1: Date | string, d2: Date | string): boolean {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function getDateGroupTitle(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) {
    return 'Today';
  } else if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  } else {
    return formatDateOnly(dateString);
  }
}
