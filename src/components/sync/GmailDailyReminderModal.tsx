import React, { useState, useEffect } from 'react';
import {
  Mail,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  X,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  Bell,
  RefreshCw,
} from 'lucide-react';
import {
  GmailReminderSettings,
  Transaction,
  Habit,
  HabitCompletionRecord,
  WorkoutSession,
  VitalsLog,
} from '../../types';
import {
  getStoredGmailSettings,
  saveStoredGmailSettings,
  getStoredGmailToken,
  requestGmailOAuthToken,
  sendGmailReminderEmail,
  syncScheduleWithServer,
} from '../../utils/gmailReminder';

interface GmailDailyReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  habits: Habit[];
  habitCompletions: HabitCompletionRecord[];
  workouts: WorkoutSession[];
  vitalsLogs: VitalsLog[];
}

export const GmailDailyReminderModal: React.FC<GmailDailyReminderModalProps> = ({
  isOpen,
  onClose,
  transactions,
  habits,
  habitCompletions,
  workouts,
  vitalsLogs,
}) => {
  const [settings, setSettings] = useState<GmailReminderSettings>(getStoredGmailSettings);
  const [oauthToken, setOauthToken] = useState<string | null>(getStoredGmailToken);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'preview'>('settings');

  useEffect(() => {
    if (isOpen) {
      const current = getStoredGmailSettings();
      setSettings(current);
      setOauthToken(getStoredGmailToken());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Prepare Today's Data Summary for Email
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(
    (t) => (t.dateTime && t.dateTime.startsWith(todayStr)) || (t as any).date === todayStr
  );
  const todaySpend = todayTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayIncome = todayTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayCompletions = habitCompletions.filter(
    (c) => c.date === todayStr && c.completed
  );
  const completedHabitIds = new Set(todayCompletions.map((c) => c.habitId));
  const pendingHabits = habits.filter((h) => !completedHabitIds.has(h.id));

  const summaryData = {
    todaySpend,
    todayIncome,
    monthNet: todayIncome - todaySpend,
    habitsDone: todayCompletions.length,
    habitsTotal: habits.length,
    pendingHabitsList: pendingHabits.map((h) => `${h.title} (${h.category})`),
    workoutsCount: workouts.filter((w) => w.date === todayStr).length,
    vitalsLogged: vitalsLogs.some((v) => v.date === todayStr),
  };

  const handleAuthorize = async () => {
    setIsAuthorizing(true);
    setStatusMessage(null);
    try {
      const token = await requestGmailOAuthToken();
      setOauthToken(token);
      setStatusMessage({
        type: 'success',
        text: 'Gmail permissions connected successfully!',
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      console.error('Auth error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Authorization failed. Please try again.',
      });
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleSaveSettings = async (updated: GmailReminderSettings) => {
    setSettings(updated);
    saveStoredGmailSettings(updated);
    await syncScheduleWithServer(updated);
  };

  const handleSendTestEmail = async () => {
    setIsSending(true);
    setStatusMessage(null);
    try {
      let token = oauthToken;
      if (!token) {
        token = await requestGmailOAuthToken();
        setOauthToken(token);
      }

      const result = await sendGmailReminderEmail(token, {
        to: settings.recipientEmail || 'kaiwalya.2501@gmail.com',
        subject: `🌙 KAIONE 22:30 Daily Reminder — Log Expenses, Habits & Vitals`,
        summaryData,
        customMessage:
          'Here is your automated evening check-in reminder. Keep your daily streaks and financial ledger up to date!',
      });

      const updated = {
        ...settings,
        lastSentTimestamp: result.sentAt || new Date().toISOString(),
        lastStatus: 'success' as const,
      };
      await handleSaveSettings(updated);

      setStatusMessage({
        type: 'success',
        text: `Daily reminder email successfully delivered to ${settings.recipientEmail}!`,
      });
      setTimeout(() => setStatusMessage(null), 4500);
    } catch (err: any) {
      console.error('Send error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to dispatch email. Please re-authorize Gmail.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      id="modal_gmail_daily_reminder"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300">
              <Mail className="w-5 h-5 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-heading">
                  Daily 22:30 Gmail Reminder
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ⚡ Auto 22:30 Daily
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Automated evening check-in via Google Workspace Gmail Integration
              </p>
            </div>
          </div>
          <button
            id="btn_close_gmail_modal"
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/70 text-xs font-bold">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Schedule & Settings
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Email Preview
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-800">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold animate-fadeIn ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'settings' ? (
            <div className="space-y-4">
              {/* Status Banner */}
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold text-indigo-950">
                      Automated 22:30 Daily Dispatcher
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Scheduled to deliver daily at{' '}
                      <span className="font-mono font-bold text-indigo-700">
                        {settings.reminderTime}
                      </span>{' '}
                      ({settings.timezone})
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.isEnabled}
                    onChange={(e) =>
                      handleSaveSettings({
                        ...settings,
                        isEnabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Recipient & Timing Form */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.recipientEmail}
                    onChange={(e) =>
                      handleSaveSettings({
                        ...settings,
                        recipientEmail: e.target.value,
                      })
                    }
                    placeholder="kaiwalya.2501@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" /> Reminder Time
                    </label>
                    <input
                      type="time"
                      value={settings.reminderTime}
                      onChange={(e) =>
                        handleSaveSettings({
                          ...settings,
                          reminderTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) =>
                        handleSaveSettings({
                          ...settings,
                          timezone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sections to Include in Digest */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Digest Content Modules
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={settings.includeFinanceSummary}
                      onChange={(e) =>
                        handleSaveSettings({
                          ...settings,
                          includeFinanceSummary: e.target.checked,
                        })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>💰 Today's Spend & Net</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={settings.includeHabitsChecklist}
                      onChange={(e) =>
                        handleSaveSettings({
                          ...settings,
                          includeHabitsChecklist: e.target.checked,
                        })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>🎯 Incomplete Habits</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={settings.includeHealthVitals}
                      onChange={(e) =>
                        handleSaveSettings({
                          ...settings,
                          includeHealthVitals: e.target.checked,
                        })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>🏃‍♂️ Workouts & Vitals</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={settings.includeUpcomingEvents}
                      onChange={(e) =>
                        handleSaveSettings({
                          ...settings,
                          includeUpcomingEvents: e.target.checked,
                        })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>📅 Tomorrow's Events</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button
                  id="btn_send_test_daily_reminder"
                  onClick={handleSendTestEmail}
                  disabled={isSending || isAuthorizing}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  {isSending ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                  <span>
                    {isSending
                      ? 'Dispatching Reminder Email...'
                      : `Send Daily Reminder to ${settings.recipientEmail} Now`}
                  </span>
                </button>

                {!oauthToken && (
                  <button
                    onClick={handleAuthorize}
                    disabled={isAuthorizing}
                    className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Authorize Google Workspace Gmail Scope</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Email Preview Tab */
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs text-xs">
              <div className="bg-slate-900 p-4 text-white">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  🌙 22:30 Daily Reflection
                </span>
                <h3 className="text-base font-bold mt-1 text-white">
                  KAIONE Daily Check-In
                </h3>
                <p className="text-[11px] text-slate-300">
                  Prepared for {settings.recipientEmail}
                </p>
              </div>
              <div className="p-4 space-y-3 bg-white">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-base font-bold text-slate-900">
                      ₹{todaySpend.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-500">Today's Logged Spend</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-base font-bold text-emerald-600">
                      ₹{(todayIncome - todaySpend).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-500">Monthly Net Cash Flow</p>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/50 rounded-lg border-l-4 border-indigo-600 text-slate-700 text-[11px] leading-relaxed">
                  <p className="font-bold text-indigo-950 mb-1">
                    ⚡ 1-Minute Daily Log Check
                  </p>
                  <p>
                    Take 60 seconds before sleeping to record any pending cash or UPI spends, log workout calories, and check off completed habits.
                  </p>
                </div>

                {pendingHabits.length > 0 && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px]">
                    <p className="font-bold mb-1">🎯 Evening Habits to Check Off:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                      {pendingHabits.slice(0, 3).map((h) => (
                        <li key={h.id}>{h.title}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-center pt-2">
                  <span className="inline-block bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg text-xs">
                    Open KAIONE App & Log Entry
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
          <span>Target: {settings.recipientEmail}</span>
          <span className="font-mono text-indigo-600 font-bold">22:30 Daily</span>
        </div>
      </div>
    </div>
  );
};
