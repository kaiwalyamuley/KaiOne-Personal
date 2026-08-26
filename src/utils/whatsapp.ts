/**
 * WhatsApp Helper Utilities for VitaFlow Khata & Person Ledgers
 * Generates direct click-to-chat redirection URLs with prefilled messages and contact phone targeting.
 */

import { formatINR } from './formatters';

export type WhatsAppTemplateType =
  | 'friendly'
  | 'formal'
  | 'quick_upi'
  | 'detailed_statement';

/**
 * Cleans phone number by removing spaces, dashes, parentheses and ensuring country code
 */
export function cleanPhoneNumber(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  // If 10 digits (Standard Indian Mobile without country code), default prefix with 91
  if (digits.length === 10) {
    return `91${digits}`;
  }

  // If 11 digits starting with 0 (e.g. 09876543210), replace leading 0 with 91
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }

  return digits;
}

/**
 * Formats date string into a friendly readable date (e.g. 30 Aug 2026)
 */
export function formatFriendlyDueDate(dateStr?: string): string {
  if (!dateStr) return 'As soon as possible';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export interface WhatsAppMessageParams {
  personName: string;
  netBalance: number;
  dueDate?: string;
  upiId?: string;
  customNote?: string;
  template: WhatsAppTemplateType;
  totalLent?: number;
  totalBorrowed?: number;
}

/**
 * Builds standard, professional WhatsApp formatted markdown text
 */
export function generateWhatsAppMessage({
  personName,
  netBalance,
  dueDate,
  upiId,
  customNote,
  template,
  totalLent = 0,
  totalBorrowed = 0,
}: WhatsAppMessageParams): string {
  const isReceivable = netBalance > 0;
  const isPayable = netBalance < 0;
  const amountStr = formatINR(Math.abs(netBalance));
  const readableDueDate = formatFriendlyDueDate(dueDate);
  const upiLine = upiId?.trim() ? `\n💳 *UPI ID:* \`${upiId.trim()}\`` : '';
  const noteLine = customNote?.trim() ? `\n📝 *Note:* _${customNote.trim()}_` : '';

  if (isReceivable) {
    switch (template) {
      case 'friendly':
        return (
          `👋 *Hi ${personName},*\n\n` +
          `Hope you're having a great day! ✨\n\n` +
          `This is a gentle reminder regarding the outstanding balance on our Khata ledger:\n` +
          `💰 *Outstanding Amount:* *${amountStr}*\n` +
          `📅 *Due Date:* *${readableDueDate}*` +
          `${upiLine}` +
          `${noteLine}\n\n` +
          `Kindly transfer the amount at your convenience. Thank you! 🙏\n\n` +
          `_Sent via KAIONE Life & Wealth OS_`
        );

      case 'formal':
        return (
          `📋 *PAYMENT DUE NOTICE*\n\n` +
          `Dear *${personName}*,\n\n` +
          `Please find below the current status of your pending Khata balance:\n` +
          `• *Outstanding Balance:* *${amountStr}*\n` +
          `• *Payment Due Date:* *${readableDueDate}*\n` +
          `• *Status:* Pending Settlement` +
          `${upiLine}` +
          `${noteLine}\n\n` +
          `Kindly arrange for the settlement on or before the due date.\n\n` +
          `Thank you,\n` +
          `_KAIONE Finance Ledger_`
        );

      case 'quick_upi':
        return (
          `👋 Hi *${personName}*! Quick reminder for the pending balance of *${amountStr}* (Due: *${readableDueDate}*).` +
          `${upiLine ? ` UPI: \`${upiId?.trim()}\`` : ''}` +
          `${noteLine ? ` (${customNote?.trim()})` : ''}` +
          ` Please settle when you get a moment. Thanks! 🚀`
        );

      case 'detailed_statement':
        return (
          `📊 *KHATA ACCOUNT STATEMENT*\n\n` +
          `*Account:* ${personName}\n` +
          `------------------------------\n` +
          `• *Total Lent (Given):* ${formatINR(totalLent)}\n` +
          `• *Total Repaid:* ${formatINR(totalLent - netBalance)}\n` +
          `• *NET OUTSTANDING DUE:* *${amountStr}*\n` +
          `• *Agreed Due Date:* *${readableDueDate}*\n` +
          `------------------------------` +
          `${upiLine}` +
          `${noteLine}\n\n` +
          `Please check and clear the dues by *${readableDueDate}*. Thanks! 🙏`
        );
    }
  } else if (isPayable) {
    switch (template) {
      case 'friendly':
        return (
          `👋 *Hi ${personName},*\n\n` +
          `I wanted to check in regarding the balance I owe you:\n` +
          `💰 *Amount Payable:* *${amountStr}*\n` +
          `📅 *Target Pay Date:* *${readableDueDate}*` +
          `${noteLine}\n\n` +
          `I will be transferring this to you shortly. Please let me know your preferred UPI / Account details if changed. Thank you! 🙌\n\n` +
          `_Sent via KAIONE Life OS_`
        );

      case 'formal':
        return (
          `📋 *PAYMENT INTIMATION*\n\n` +
          `Dear *${personName}*,\n\n` +
          `This is to confirm that I have an active payable balance of *${amountStr}* scheduled for settlement on or before *${readableDueDate}*.` +
          `${noteLine}\n\n` +
          `Thank you for your patience.\n` +
          `_KAIONE Finance Ledger_`
        );

      case 'quick_upi':
        return (
          `👋 Hi *${personName}*, noting that I have to pay you *${amountStr}* by *${readableDueDate}*. Will transfer via UPI soon! 👍`
        );

      case 'detailed_statement':
        return (
          `📊 *KHATA ACCOUNT STATEMENT*\n\n` +
          `*Account:* ${personName}\n` +
          `• *Total Borrowed:* ${formatINR(totalBorrowed)}\n` +
          `• *Current Net Payable:* *${amountStr}*\n` +
          `• *Target Due Date:* *${readableDueDate}*` +
          `${noteLine}\n\n` +
          `Will initiate the repayment shortly. Thank you!`
        );
    }
  } else {
    // Settled (netBalance === 0)
    return (
      `👋 *Hi ${personName},*\n\n` +
      `Great news! Our Khata ledger is all settled up.\n` +
      `✅ *Net Balance:* ₹0 (All Clear)\n\n` +
      `Thank you for the smooth transaction! ✨\n\n` +
      `_Sent via KAIONE Life & Wealth OS_`
    );
  }
}

/**
 * Creates the direct WhatsApp redirection link
 * Uses https://api.whatsapp.com/send which opens WhatsApp App on mobile or WhatsApp Web/Desktop on PC.
 */
export function buildWhatsAppRedirectUrl(phone?: string, message?: string): string {
  const cleanPhone = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(message || '');

  if (cleanPhone) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }

  // If no phone number is provided, open WhatsApp with text draft so user can select the chat/contact
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}
