import { GmailReminderSettings } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

declare global {
  interface Window {
    google?: any;
  }
}

const GMAIL_SETTINGS_STORAGE_KEY = 'vf_gmail_reminder_settings_v1';
const GMAIL_TOKEN_STORAGE_KEY = 'vf_gmail_access_token_v1';

export const OAUTH_CLIENT_ID =
  (firebaseConfig as any)?.oAuthClientId ||
  '469213965401-v4k7f1lndr3vbjc606fecssid435oqvb.apps.googleusercontent.com';

export const DEFAULT_GMAIL_SETTINGS: GmailReminderSettings = {
  isEnabled: true,
  recipientEmail: 'kaiwalya.2501@gmail.com',
  reminderTime: '22:30',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
  includeFinanceSummary: true,
  includeHabitsChecklist: true,
  includeHealthVitals: true,
  includeUpcomingEvents: true,
  lastSentTimestamp: null,
  lastStatus: null,
};

export function getStoredGmailSettings(): GmailReminderSettings {
  try {
    const raw = localStorage.getItem(GMAIL_SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_GMAIL_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to parse stored gmail settings:', e);
  }
  return DEFAULT_GMAIL_SETTINGS;
}

export function saveStoredGmailSettings(settings: GmailReminderSettings): void {
  try {
    localStorage.setItem(GMAIL_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save gmail settings:', e);
  }
}

export function getStoredGmailToken(): string | null {
  try {
    return localStorage.getItem(GMAIL_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredGmailToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(GMAIL_TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(GMAIL_TOKEN_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to update stored gmail token:', e);
  }
}

/**
 * Request Google OAuth Access Token with gmail.send scope using Google Identity Services
 */
export function requestGmailOAuthToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(
        new Error(
          'Google Identity Services script is still loading. Please try again in 2 seconds.'
        )
      );
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: OAUTH_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/gmail.send',
        prompt: 'consent',
        callback: (response: any) => {
          if (response.error) {
            console.error('OAuth token error:', response);
            reject(new Error(response.error_description || response.error));
            return;
          }
          if (response.access_token) {
            setStoredGmailToken(response.access_token);
            resolve(response.access_token);
          } else {
            reject(new Error('No access token returned from Google'));
          }
        },
      });

      client.requestAccessToken();
    } catch (err: any) {
      reject(err);
    }
  });
}

/**
 * Send instant daily reminder email via backend Gmail proxy
 */
export async function sendGmailReminderEmail(
  token: string,
  payload: {
    to: string;
    subject?: string;
    summaryData?: any;
    customMessage?: string;
  }
): Promise<{ success: boolean; messageId?: string; sentAt?: string }> {
  const response = await fetch('/api/gmail/send-reminder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to send email reminder');
  }

  return data;
}

/**
 * Sync schedule settings with backend
 */
export async function syncScheduleWithServer(settings: GmailReminderSettings): Promise<void> {
  try {
    await fetch('/api/gmail/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isEnabled: settings.isEnabled,
        recipientEmail: settings.recipientEmail,
        reminderTime: settings.reminderTime,
        timezone: settings.timezone,
      }),
    });
  } catch (err) {
    console.warn('Failed to sync schedule with server:', err);
  }
}
