import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  RotateCcw,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Account, Transaction } from '../types';
import { INITIAL_SAMPLE_TRANSACTIONS, DEFAULT_ACCOUNTS } from '../utils/defaultData';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  accounts: Account[];
  onImportTransactions: (txs: Transaction[]) => void;
  onResetData: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  accounts,
  onImportTransactions,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const accountsMap = new Map(accounts.map((a) => [a.id, a.name]));

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const headers = [
        'Transaction ID',
        'Date & Time',
        'Type',
        'Amount (INR)',
        'Category',
        'Subcategory',
        'Location',
        'Account From',
        'Account To',
        'Person / Ledger',
        'Payment Mode',
        'Description',
        'Tags',
      ];

      const rows = transactions.map((t) => [
        t.id,
        `"${t.dateTime}"`,
        t.type,
        t.amount,
        `"${t.category}"`,
        `"${t.subCategory || ''}"`,
        `"${t.location || ''}"`,
        `"${t.accountFromId ? accountsMap.get(t.accountFromId) || t.accountFromId : ''}"`,
        `"${t.accountToId ? accountsMap.get(t.accountToId) || t.accountToId : ''}"`,
        `"${t.personName || ''}"`,
        `"${t.paymentMode || ''}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${(t.tags || []).join(', ')}"`,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `Personal_Finance_Log_INR_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMsg('CSV export downloaded successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      setErrorMsg('Failed to export CSV.');
    }
  };

  // Export to JSON
  const handleExportJSON = () => {
    try {
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(transactions, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `Personal_Finance_Backup_${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setSuccessMsg('JSON backup downloaded successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      setErrorMsg('Failed to export JSON.');
    }
  };

  // Import JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportTransactions(parsed);
          setSuccessMsg(`Successfully imported ${parsed.length} transactions!`);
          setTimeout(() => {
            setSuccessMsg('');
            onClose();
          }, 1500);
        } else {
          setErrorMsg('Invalid file format. Expected a JSON array of transactions.');
        }
      } catch (err) {
        setErrorMsg('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
      <div
        id="export-import-modal"
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-indigo-600 rounded-xs transform rotate-45 flex items-center justify-center">
              <Download className="transform -rotate-45 h-3 w-3 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Export & Backup Data
              </h2>
              <p className="text-[11px] text-slate-500">
                Safely backup or export your INR transactions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-medium">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 font-medium">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-2.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              1. Download / Export Records
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-left shadow-2xs"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 shrink-0 border border-emerald-100">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Export as CSV</div>
                  <span className="text-[11px] text-slate-500">Excel / Google Sheets</span>
                </div>
              </button>

              <button
                onClick={handleExportJSON}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-left shadow-2xs"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 shrink-0 border border-indigo-100">
                  <FileCode className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Backup JSON</div>
                  <span className="text-[11px] text-slate-500">Full Raw Backup</span>
                </div>
              </button>
            </div>
          </div>

          {/* Import Option */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              2. Restore from Backup
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition-colors"
            >
              <Upload className="h-4 w-4 text-indigo-600" />
              <span>Select JSON Backup File to Restore</span>
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Reset Demo Starter Data</div>
                <p className="text-[11px] text-slate-500">
                  Replaces current logs with standard INR demo starter entries
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Reset transactions to default sample entries?')) {
                    onResetData();
                    setSuccessMsg('Reset to default demo data.');
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Reset Demo
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

