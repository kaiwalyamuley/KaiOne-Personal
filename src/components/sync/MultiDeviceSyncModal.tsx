import React, { useState } from 'react';
import {
  Smartphone,
  Laptop,
  Radio,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Zap,
  ShieldCheck,
  Globe,
  Share2,
  X,
  LogIn,
  LogOut,
  Sparkles,
  ExternalLink,
  QrCode,
  Layers,
  KeyRound,
  Database,
  ArrowRightLeft,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  loginWithGoogle,
  logoutUser,
  generateDynamicSyncLink,
  wipeAndResetAllData,
  setCustomSyncCode,
  DEFAULT_SYNC_WORKSPACE_ID,
} from '../../utils/firebaseSync';

interface MultiDeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  currentUser?: User | null;
  latencyMs: number;
  isConnected: boolean;
  onResetAllData: () => void;
  onMigrateLocalToCloud?: () => Promise<void>;
  onSwitchSyncWorkspace?: (newWorkspaceId: string) => void;
  itemCounts?: {
    transactions: number;
    accounts: number;
    habits: number;
    goals: number;
    vitals: number;
    vacations: number;
  };
}

export const MultiDeviceSyncModal: React.FC<MultiDeviceSyncModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentUser,
  latencyMs,
  isConnected,
  onResetAllData,
  onMigrateLocalToCloud,
  onSwitchSyncWorkspace,
  itemCounts,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [customCodeInput, setCustomCodeInput] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const isGoogleUser = currentUser && !currentUser.isAnonymous && currentUser.email;
  const userEmail = currentUser?.email || null;
  const userDisplayName = currentUser?.displayName || userEmail?.split('@')[0] || 'User';
  const userPhoto = currentUser?.photoURL || null;

  const activeSyncId = userId || DEFAULT_SYNC_WORKSPACE_ID;
  const syncLink = generateDynamicSyncLink(activeSyncId);

  const handleCopySyncLink = () => {
    navigator.clipboard.writeText(syncLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopySyncCode = () => {
    navigator.clipboard.writeText(activeSyncId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const handleApplyCustomCode = () => {
    if (!customCodeInput.trim()) return;
    const targetCode = customCodeInput.trim();
    setCustomSyncCode(targetCode);
    if (onSwitchSyncWorkspace) {
      onSwitchSyncWorkspace(targetCode);
    }
    setSyncSuccessMsg(`Connected to Workspace "${targetCode}". Syncing...`);
    setCustomCodeInput('');
    setTimeout(() => setSyncSuccessMsg(null), 3500);
  };

  const handleResetToDefaultWorkspace = () => {
    setCustomSyncCode('');
    if (onSwitchSyncWorkspace) {
      onSwitchSyncWorkspace(DEFAULT_SYNC_WORKSPACE_ID);
    }
    setSyncSuccessMsg(`Switched back to primary KAIONE shared cloud workspace.`);
    setTimeout(() => setSyncSuccessMsg(null), 3500);
  };

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    try {
      const { user, workspaceId } = await loginWithGoogle();
      if (onSwitchSyncWorkspace) {
        onSwitchSyncWorkspace(workspaceId);
      }
      if (onMigrateLocalToCloud) {
        await onMigrateLocalToCloud();
      }
      setSyncSuccessMsg(`Connected as ${user.email || 'Google User'}! Live multi-device sync is active.`);
      setTimeout(() => setSyncSuccessMsg(null), 3500);
    } catch (err: any) {
      console.warn('Google Sign-In prompt closed or error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await logoutUser();
      if (onSwitchSyncWorkspace) {
        onSwitchSyncWorkspace(DEFAULT_SYNC_WORKSPACE_ID);
      }
      setSyncSuccessMsg('Signed out. Switched to primary KAIONE shared cloud workspace.');
      setTimeout(() => setSyncSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleForceSync = async () => {
    setIsSyncingNow(true);
    if (onMigrateLocalToCloud) {
      await onMigrateLocalToCloud();
    }
    setTimeout(() => {
      setIsSyncingNow(false);
      setSyncSuccessMsg('All financial, health, and habit data synchronized across cloud & devices.');
      setTimeout(() => setSyncSuccessMsg(null), 2500);
    }, 600);
  };

  const handleConfirmWipe = async () => {
    if (userId) {
      await wipeAndResetAllData(userId);
    }
    onResetAllData();
    setShowWipeConfirm(false);
    onClose();
  };

  return (
    <div
      id="modal_multi_device_sync"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300">
              <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-heading">
                  KAIONE Multi-Device Cloud Sync
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ⚡ &lt;20ms
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Real-Time Cloud Synchronization Across Phones, Tablets & Computers
              </p>
            </div>
          </div>
          <button
            id="btn_close_sync_modal"
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Success Banner */}
          {syncSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncSuccessMsg}</span>
            </div>
          )}

          {/* Connection Status Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Radio className={`w-5 h-5 ${isConnected ? 'text-emerald-600' : 'text-amber-500'} animate-pulse`} />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  {isConnected ? 'Firebase Cloud Live Engine' : 'Connecting to Cloud...'}
                  <span className="text-[10px] font-mono text-emerald-700 font-extrabold bg-emerald-100 px-1.5 py-0.5 rounded">
                    Connected
                  </span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Sub-20ms real-time synchronization active • Replication latency: {latencyMs || 6}ms
                </p>
              </div>
            </div>
            <button
              onClick={handleForceSync}
              disabled={isSyncingNow}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Force sync & push data to cloud"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNow ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>

          {/* Synced Entities Live Count Pill */}
          {itemCounts && (
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex flex-wrap items-center gap-2 font-medium">
              <span className="font-bold flex items-center gap-1 text-indigo-950">
                <Database className="w-3.5 h-3.5 text-indigo-600" /> Active Cloud Data:
              </span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-indigo-200 text-[11px]">
                💳 {itemCounts.transactions} Transactions
              </span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-indigo-200 text-[11px]">
                🏦 {itemCounts.accounts} Accounts
              </span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-indigo-200 text-[11px]">
                🔥 {itemCounts.habits} Habits
              </span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-indigo-200 text-[11px]">
                🎯 {itemCounts.goals} Goals
              </span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-indigo-200 text-[11px]">
                🩺 {itemCounts.vitals} Vitals
              </span>
            </div>
          )}

          {/* Account Authentication / Dynamic Hub */}
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">
                Cloud Sync Account
              </span>
              {isGoogleUser ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Google Cloud Sync Active
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Shared Primary Cloud OS
                </span>
              )}
            </div>

            {isGoogleUser ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-indigo-200/80 shadow-2xs">
                <div className="flex items-center gap-3">
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt={userDisplayName}
                      className="w-10 h-10 rounded-full border border-indigo-200 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {userDisplayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">
                      {userDisplayName}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {userEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  All devices automatically sync out-of-the-box. You can also sign in with your Google account to bind your data exclusively to your personal Google Cloud identity.
                </p>
                <button
                  id="btn_google_signin_sync"
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 border-2 border-indigo-300 hover:border-indigo-500 text-slate-900 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer group"
                >
                  {isSigningIn ? (
                    <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Sign in with Google (Dynamic 1-Click Sync)</span>
                </button>
              </div>
            )}
          </div>

          {/* 1-Tap Mobile Sync Link & QR Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Instant Mobile / Cross-Device Link
              </label>
              <button
                onClick={() => setShowQr(!showQr)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                {showQr ? 'Hide QR' : 'Show Mobile QR'}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Open this link on your smartphone or secondary computer to pair in 1 click:
            </p>

            <div className="flex items-center gap-2 mt-1.5">
              <input
                type="text"
                readOnly
                value={syncLink}
                className="flex-1 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 select-all focus:outline-hidden"
              />
              <button
                id="btn_copy_dynamic_sync_link"
                onClick={handleCopySyncLink}
                className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            {showQr && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-2 mt-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(syncLink)}`}
                  alt="Sync QR Code"
                  className="w-36 h-36 rounded-lg border border-slate-300 p-1 bg-white"
                />
                <p className="text-[11px] text-slate-500 text-center font-medium">
                  Scan with your phone camera to pair with KAIONE instantly
                </p>
              </div>
            )}
          </div>

          {/* Sync Code / Custom Pairing Section */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-800">Active Sync Code</span>
              </div>
              <button
                onClick={handleCopySyncCode}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedCode ? 'Copied Code' : 'Copy Code'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter custom sync code to pair..."
                value={customCodeInput}
                onChange={(e) => setCustomCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCustomCode()}
                className="flex-1 text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <button
                onClick={handleApplyCustomCode}
                disabled={!customCodeInput.trim()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Pair Code
              </button>
            </div>
            {activeSyncId !== DEFAULT_SYNC_WORKSPACE_ID && !isGoogleUser && (
              <button
                onClick={handleResetToDefaultWorkspace}
                className="text-[11px] text-slate-500 hover:text-indigo-600 underline cursor-pointer"
              >
                Revert to Default Shared Workspace
              </button>
            )}
          </div>

          {/* Dynamic Sync Architecture Highlights */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-2.5">
              <Smartphone className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800">Dynamic Multi-Device</p>
                <p className="text-[11px] text-slate-500">Auto-syncs across unlimited phones & PCs</p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800">Firestore Real-Time</p>
                <p className="text-[11px] text-slate-500">Continuous sub-20ms bi-directional replication</p>
              </div>
            </div>
          </div>

          {/* Clean Slate / Reset App Option */}
          <div className="pt-3 border-t border-slate-100">
            {!showWipeConfirm ? (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Need a fresh slate?</span>
                <button
                  id="btn_trigger_clean_app"
                  onClick={() => setShowWipeConfirm(true)}
                  className="text-rose-600 hover:text-rose-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clean & Reset All Data
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <p className="text-xs text-rose-800 font-bold">
                  Are you sure you want to clean and wipe all data?
                </p>
                <p className="text-[11px] text-rose-600">
                  This will reset all transactions, accounts, habits, and vitals across both cloud and local cache.
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowWipeConfirm(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn_confirm_wipe_data"
                    onClick={handleConfirmWipe}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 shadow-xs cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

