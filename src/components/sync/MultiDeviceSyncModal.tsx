/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Database,
  Cloud,
  Laptop,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

interface MultiDeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentUser: any;
  latencyMs: number;
  isConnected: boolean;
  onResetAllData: () => void;
  onMigrateLocalToCloud: () => Promise<void>;
  onSwitchSyncWorkspace: (newId: string) => void;
  itemCounts: {
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
  latencyMs,
  isConnected,
  onResetAllData,
  onSwitchSyncWorkspace,
  itemCounts,
}) => {
  const [copied, setCopied] = useState(false);
  const [customCode, setCustomCode] = useState('');

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCode.trim()) {
      onSwitchSyncWorkspace(customCode.trim());
      setCustomCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/50">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 font-heading">
                Multi-Device Cloud Sync
              </h3>
              <p className="text-xs text-slate-500">
                Connected via Supabase Realtime Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Status Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  {isConnected ? 'Database Connected' : 'Connecting to Cloud...'}
                </p>
                <p className="text-[11px] text-emerald-700">
                  Active User ID: <span className="font-mono font-semibold">{userId}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-white/80 px-2.5 py-1 rounded-full border border-emerald-200">
                {latencyMs}ms Latency
              </span>
            </div>
          </div>

          {/* Sync Topology Visual */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
              <Laptop className="h-5 w-5 text-indigo-600 mb-1" />
              <span className="text-xs font-semibold text-slate-700">Laptop</span>
              <span className="text-[10px] text-emerald-600 font-medium">Synced</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex flex-col items-center">
              <Database className="h-5 w-5 text-indigo-600 mb-1" />
              <span className="text-xs font-semibold text-indigo-900">Supabase</span>
              <span className="text-[10px] text-indigo-600 font-medium">PostgreSQL</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
              <Smartphone className="h-5 w-5 text-indigo-600 mb-1" />
              <span className="text-xs font-semibold text-slate-700">Mobile</span>
              <span className="text-[10px] text-emerald-600 font-medium">Synced</span>
            </div>
          </div>

          {/* Current Stored Records Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Database Records
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-[11px]">Transactions</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{itemCounts.transactions}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-[11px]">Accounts</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{itemCounts.accounts}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-[11px]">Habits & Goals</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{itemCounts.habits + itemCounts.goals}</p>
              </div>
            </div>
          </div>

          {/* Switch User Workspace Form */}
          <form onSubmit={handleApplyWorkspace} className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Switch Sync ID / Profile
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter custom user ID..."
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <button
                type="submit"
                disabled={!customCode.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Switch
              </button>
            </div>
          </form>

          {/* Copy Share Link */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'URL Copied to Clipboard!' : 'Copy App URL for Other Devices'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all data in database?')) {
                  onResetAllData();
                }
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
