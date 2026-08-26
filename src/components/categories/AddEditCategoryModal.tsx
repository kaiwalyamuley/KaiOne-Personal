import React, { useState, useEffect } from 'react';
import {
  X,
  Tag,
  Sparkles,
  Check,
  Trash2,
  Sliders,
  Plus,
  Layers,
  Palette,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Category, TransactionType } from '../../types';

interface AddEditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCategory: (cat: Category) => void;
  categoryToEdit?: Category | null;
  onDeleteCategory?: (categoryId: string) => void;
  existingCategories?: Category[];
}

const PRESET_ICONS = [
  '🏷️', '🍔', '🛒', '🚗', '💡', '🛍️', '🏥', '🍿', '🏠', '📚',
  '☕', '✈️', '💼', '💳', '🎁', '⚡', '🏋️', '📱', '🍼', '🐾',
  '💰', '📈', '🤝', '🏦', '🎓', '🏖️', '💎', '🛠️', '🥦', '🍕'
];

const PRESET_COLORS = [
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#dc2626', // Red
  '#d97706', // Amber
  '#7c3aed', // Violet
  '#0284c7', // Sky
  '#db2777', // Pink
  '#ea580c', // Orange
  '#0d9488', // Teal
  '#64748b', // Slate
];

export const AddEditCategoryModal: React.FC<AddEditCategoryModalProps> = ({
  isOpen,
  onClose,
  onSaveCategory,
  categoryToEdit,
  onDeleteCategory,
  existingCategories = [],
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType | 'all'>('expense');
  const [icon, setIcon] = useState('🏷️');
  const [color, setColor] = useState('#4f46e5');
  const [defaultBudget, setDefaultBudget] = useState('3000');
  const [isRolloverEnabled, setIsRolloverEnabled] = useState(true);
  const [isCapEnabled, setIsCapEnabled] = useState(false);
  const [maxRolloverCap, setMaxRolloverCap] = useState('5000');
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [newSubcatInput, setNewSubcatInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setType(categoryToEdit.type);
      setIcon(categoryToEdit.icon || '🏷️');
      setColor(categoryToEdit.color || '#4f46e5');
      setDefaultBudget(
        categoryToEdit.defaultMonthlyBudget !== undefined
          ? String(categoryToEdit.defaultMonthlyBudget)
          : '3000'
      );
      setIsRolloverEnabled(categoryToEdit.isRolloverEnabled ?? true);
      if (
        categoryToEdit.defaultMaxRolloverCap !== null &&
        categoryToEdit.defaultMaxRolloverCap !== undefined &&
        categoryToEdit.defaultMaxRolloverCap > 0
      ) {
        setIsCapEnabled(true);
        setMaxRolloverCap(String(categoryToEdit.defaultMaxRolloverCap));
      } else {
        setIsCapEnabled(false);
        setMaxRolloverCap('5000');
      }
      setSubcategories(categoryToEdit.subcategories || []);
    } else {
      setName('');
      setType('expense');
      setIcon('🏷️');
      setColor('#4f46e5');
      setDefaultBudget('3000');
      setIsRolloverEnabled(true);
      setIsCapEnabled(false);
      setMaxRolloverCap('5000');
      setSubcategories([]);
    }
    setErrorMsg('');
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddSubcat = () => {
    if (!newSubcatInput.trim()) return;
    if (!subcategories.includes(newSubcatInput.trim())) {
      setSubcategories([...subcategories, newSubcatInput.trim()]);
    }
    setNewSubcatInput('');
  };

  const handleRemoveSubcat = (subToRemove: string) => {
    setSubcategories(subcategories.filter((s) => s !== subToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }

    // Check duplicate name
    const duplicate = existingCategories.find(
      (c) =>
        c.name.toLowerCase() === name.trim().toLowerCase() &&
        c.id !== categoryToEdit?.id
    );

    if (duplicate) {
      setErrorMsg(`A category named "${name.trim()}" already exists.`);
      return;
    }

    const budgetNum = Math.max(0, parseFloat(defaultBudget) || 0);
    const capNum = isCapEnabled ? Math.max(0, parseFloat(maxRolloverCap) || 0) : null;

    const newCategory: Category = {
      id: categoryToEdit?.id || `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      type,
      icon: icon || '🏷️',
      color,
      defaultMonthlyBudget: budgetNum,
      isRolloverEnabled,
      defaultMaxRolloverCap: capNum,
      subcategories: subcategories.length > 0 ? subcategories : undefined,
    };

    onSaveCategory(newCategory);
    onClose();
  };

  const handleDelete = () => {
    if (!categoryToEdit) return;
    if (
      window.confirm(
        `Are you sure you want to delete category "${categoryToEdit.name}"? Existing transaction records will keep their history.`
      )
    ) {
      onDeleteCategory?.(categoryToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-3 sm:p-4 md:p-6 backdrop-blur-xs">
      <div
        id="add-edit-category-modal"
        className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-2xs font-bold"
              style={{
                backgroundColor: `${color}20`,
                color: color,
                border: `1px solid ${color}40`,
              }}
            >
              {icon}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                {categoryToEdit ? 'Edit Category' : 'Create New Category'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Configure category name, type, default base budget & rollover preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body - 2 Column Layout */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1 bg-white space-y-4">
          {errorMsg && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Identity, Type & Subcategories */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pet Care, Fitness, Utilities"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Primary Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TransactionType | 'all')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="expense">Expense (Spend)</option>
                  <option value="income">Income (Earnings)</option>
                  <option value="investment">Investment / Savings</option>
                  <option value="lend">Lend To (Receivable)</option>
                  <option value="borrow">Borrowed (Payable)</option>
                  <option value="all">Universal (All Types)</option>
                </select>
              </div>

              {/* Subcategories */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Subcategories / Tags (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Coffee, Dining, Medicines..."
                    value={newSubcatInput}
                    onChange={(e) => setNewSubcatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubcat();
                      }
                    }}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:border-indigo-600 focus:outline-none text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcat}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-xs font-bold text-indigo-700 transition-colors cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                {subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                    {subcategories.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-slate-700 text-[11px] font-medium border border-slate-200 shadow-2xs"
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubcat(sub)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Icon, Theme Color & Budget Configuration */}
            <div className="space-y-4">
              {/* Icon Choice & Color Palette */}
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Select Icon / Symbol
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1.5 bg-white rounded-lg border border-slate-200">
                    {PRESET_ICONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setIcon(emoji)}
                        className={`w-7 h-7 flex items-center justify-center text-sm rounded-md cursor-pointer transition-all ${
                          icon === emoji
                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                            : 'hover:bg-slate-100'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Theme Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                          color === c ? 'scale-125 ring-2 ring-slate-900 ring-offset-2' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Default Base Budget & Rollover Engine Settings */}
              {type === 'expense' || type === 'all' ? (
                <div className="p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                      Monthly Budget & Rollover
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-indigo-900 uppercase tracking-widest mb-1">
                        Default Base Budget (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={defaultBudget}
                        onChange={(e) => setDefaultBudget(e.target.value)}
                        className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-1.5 text-xs focus:border-indigo-600 focus:outline-none font-semibold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-indigo-900 uppercase tracking-widest mb-1">
                        Rollover Surplus/Deficit
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold mt-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isRolloverEnabled}
                          onChange={(e) => setIsRolloverEnabled(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <span>Carry forward</span>
                      </label>
                    </div>
                  </div>

                  {/* Maximum Rollover Cap */}
                  {isRolloverEnabled && (
                    <div className="pt-2 border-t border-indigo-100/80">
                      <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold mb-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isCapEnabled}
                          onChange={(e) => setIsCapEnabled(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <span>Enable Maximum Rollover Cap</span>
                      </label>

                      {isCapEnabled && (
                        <div className="pl-6">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                            Max Allowed Rollover Cap (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={maxRolloverCap}
                            onChange={(e) => setMaxRolloverCap(e.target.value)}
                            placeholder="e.g. 5000"
                            className="w-full max-w-xs bg-white border border-indigo-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-600 focus:outline-none font-semibold text-slate-900"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 shrink-0">
            {categoryToEdit && existingCategories.length > 1 ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Category</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm active:scale-98 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Category</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
