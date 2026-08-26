import React, { useState, useMemo } from 'react';
import {
  X,
  Tag,
  Plus,
  Edit2,
  Trash2,
  Search,
  Sliders,
  Check,
  ShieldCheck,
  RefreshCw,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Category, TransactionType } from '../../types';
import { formatINR } from '../../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onOpenAddCategory: () => void;
  onOpenEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  isOpen,
  onClose,
  categories,
  onOpenAddCategory,
  onOpenEditCategory,
  onDeleteCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (typeFilter !== 'all' && cat.type !== typeFilter && cat.type !== 'all') {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = cat.name.toLowerCase().includes(q);
        const matchesSub = cat.subcategories?.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesSub) return false;
      }
      return true;
    });
  }, [categories, typeFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
      <div
        id="category-management-modal"
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                Category Management Hub
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                  {categories.length} Categories
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Add, customize, edit base budgets, and configure rollover rules across all categories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {(['all', 'expense', 'income', 'investment', 'lend', 'borrow'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-lg transition-colors capitalize cursor-pointer ${
                  typeFilter === t
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {t === 'all' ? 'All Types' : t}
              </button>
            ))}
          </div>

          {/* Search & Add New Button */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 w-44"
              />
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenAddCategory();
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Category</span>
            </button>
          </div>
        </div>

        {/* Categories List */}
        <div className="p-6 overflow-y-auto space-y-2.5 flex-1 bg-white">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No categories found matching your query.
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <CategoryIcon
                    icon={cat.icon}
                    color={cat.color}
                    size="md"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {cat.name}
                      </span>
                      <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {cat.type}
                      </span>
                      {cat.isRolloverEnabled && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-0.5">
                          <RefreshCw className="w-2.5 h-2.5" /> Rollover Active
                        </span>
                      )}
                      {cat.defaultMaxRolloverCap !== null &&
                        cat.defaultMaxRolloverCap !== undefined &&
                        cat.defaultMaxRolloverCap > 0 && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                            Cap: {formatINR(cat.defaultMaxRolloverCap)}
                          </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                      {cat.subcategories && cat.subcategories.length > 0 ? (
                        <span>Subcategories: {cat.subcategories.join(', ')}</span>
                      ) : (
                        <span>Standard Category</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {cat.defaultMonthlyBudget !== undefined && (
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Base Budget
                      </span>
                      <span className="text-xs font-bold text-slate-900 font-heading">
                        {formatINR(cat.defaultMonthlyBudget)} / mo
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenEditCategory(cat);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {categories.length > 1 && (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete category "${cat.name}"? Transactions will keep their record history.`
                            )
                          ) {
                            onDeleteCategory(cat.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenAddCategory();
            }}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Add Another Category</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
