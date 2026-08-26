import React, { useState, useMemo } from 'react';
import {
  Plane,
  Calendar,
  Sparkles,
  Plus,
  Tag,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  ListTodo,
  Luggage,
  Ticket,
  Heart,
  Gift,
  Crown,
  Search,
  Filter,
  Flame,
  ArrowRight,
} from 'lucide-react';
import {
  VacationPlan,
  DateToRemember,
  DateCategory,
  VacationStatus,
  UserProfile,
  PackingItem,
} from '../../types';
import { formatINR } from '../../utils/formatters';
import { AddEditDateModal } from './AddEditDateModal';
import { AddEditVacationModal } from './AddEditVacationModal';

interface LifePlannerViewProps {
  userProfile: UserProfile;
  vacations: VacationPlan[];
  datesToRemember: DateToRemember[];
  onSaveVacation?: (vacation: VacationPlan) => void;
  onDeleteVacation?: (id: string) => void;
  onSaveDateToRemember?: (date: DateToRemember) => void;
  onDeleteDateToRemember?: (id: string) => void;
  onOpenCalendarView?: () => void;
  onNavigateToCalendar?: () => void;
  onOpenAddVacation?: () => void;
  onOpenEditVacation?: (vacation: VacationPlan) => void;
  onTogglePackingItem?: (vacationId: string, itemId: string) => void;
  onOpenAddDate?: () => void;
  onOpenEditDate?: (date: DateToRemember) => void;
  onOpenProfileModal?: () => void;
}

export const LifePlannerView: React.FC<LifePlannerViewProps> = ({
  userProfile,
  vacations,
  datesToRemember,
  onSaveVacation,
  onDeleteVacation,
  onSaveDateToRemember,
  onDeleteDateToRemember,
  onOpenCalendarView,
  onNavigateToCalendar,
  onOpenAddVacation,
  onOpenEditVacation,
  onTogglePackingItem,
  onOpenAddDate,
  onOpenEditDate,
  onOpenProfileModal,
}) => {
  const [activeTab, setActiveTab] = useState<'vacations' | 'dates_to_remember' | 'bucket_list'>('vacations');

  // Vacation modal state
  const [isVacationModalOpen, setIsVacationModalOpen] = useState<boolean>(false);
  const [editingVacation, setEditingVacation] = useState<VacationPlan | null>(null);
  const [expandedVacationId, setExpandedVacationId] = useState<string | null>(vacations[0]?.id || null);

  // New packing item input state per vacation
  const [newPackingText, setNewPackingText] = useState<{ [vacId: string]: string }>({});

  // Dates to remember state
  const [isDateModalOpen, setIsDateModalOpen] = useState<boolean>(false);
  const [editingDate, setEditingDate] = useState<DateToRemember | null>(null);
  const [dateSearchQuery, setDateSearchQuery] = useState<string>('');
  const [dateCategoryFilter, setDateCategoryFilter] = useState<string>('all');

  // Toggle Packing Item
  const handleTogglePacking = (vacation: VacationPlan, itemId: string) => {
    const updatedPacking = vacation.packingList.map((item) =>
      item.id === itemId ? { ...item, isPacked: !item.isPacked } : item
    );
    onSaveVacation({
      ...vacation,
      packingList: updatedPacking,
      updatedAt: new Date().toISOString(),
    });
  };

  // Add Packing Item
  const handleAddPackingItem = (vacation: VacationPlan) => {
    const text = (newPackingText[vacation.id] || '').trim();
    if (!text) return;

    const newItem: PackingItem = {
      id: `pk_${Date.now()}`,
      item: text,
      category: 'gear',
      isPacked: false,
    };

    onSaveVacation({
      ...vacation,
      packingList: [...vacation.packingList, newItem],
      updatedAt: new Date().toISOString(),
    });

    setNewPackingText((prev) => ({ ...prev, [vacation.id]: '' }));
  };

  // Delete Packing Item
  const handleDeletePackingItem = (vacation: VacationPlan, itemId: string) => {
    onSaveVacation({
      ...vacation,
      packingList: vacation.packingList.filter((item) => item.id !== itemId),
      updatedAt: new Date().toISOString(),
    });
  };

  // Filtered Dates to Remember
  const filteredDates = useMemo(() => {
    return datesToRemember
      .filter((d) => {
        if (dateCategoryFilter !== 'all' && d.category !== dateCategoryFilter) return false;
        if (dateSearchQuery.trim()) {
          const q = dateSearchQuery.toLowerCase();
          return (
            d.title.toLowerCase().includes(q) ||
            (d.personName && d.personName.toLowerCase().includes(q)) ||
            (d.description && d.description.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [datesToRemember, dateCategoryFilter, dateSearchQuery]);

  // Aggregate vacation stats
  const vacationStats = useMemo(() => {
    const totalBudget = vacations.reduce((acc, v) => acc + (v.estimatedBudget || 0), 0);
    const bookedCount = vacations.filter((v) => v.status === 'booked').length;
    const planningCount = vacations.filter((v) => v.status === 'planning').length;
    const completedCount = vacations.filter((v) => v.status === 'completed').length;
    return { totalBudget, bookedCount, planningCount, completedCount };
  }, [vacations]);

  // Next VIP event (e.g. Kaiwalya's Birthday on Sep 1)
  const upcomingVipDate = useMemo(() => {
    return datesToRemember.find((d) => d.isImportant || d.title.includes('Birthday')) || datesToRemember[0];
  }, [datesToRemember]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Top Life Planner Hero Banner */}
      <div className="rounded-3xl border border-cyan-200/80 bg-gradient-to-r from-cyan-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-xs font-bold flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-cyan-300" />
                <span>Comprehensive Life & Travel Planner</span>
              </span>

              {upcomingVipDate && (
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1 shadow-sm">
                  <Gift className="w-3.5 h-3.5" />
                  <span>Next Celebration: {upcomingVipDate.title} ({upcomingVipDate.date})</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              Life Milestones, Vacations & Dates to Remember
            </h1>
            <p className="text-sm text-cyan-100/90 max-w-2xl font-medium">
              Plan memorable vacations, day-wise itineraries, gear packing checklists, and never miss birthdays, cultural festivals or policy renewal deadlines.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setEditingVacation(null);
                setIsVacationModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Plan New Vacation</span>
            </button>

            <button
              onClick={() => {
                setEditingDate(null);
                setIsDateModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>+ Add Milestone / Date</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Planner Sub-Tabs Navigation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('vacations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'vacations'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>Vacation & Travel Planner ({vacations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dates_to_remember')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dates_to_remember'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Dates to Remember & Milestones ({datesToRemember.length})</span>
          </button>
        </div>

        <button
          onClick={onOpenCalendarView}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
        >
          <span>View on 360° Calendar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* ================= TAB 1: VACATIONS & TRAVEL ================= */}
      {activeTab === 'vacations' && (
        <div className="space-y-6">
          {/* Vacation Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Travel Budget
              </span>
              <span className="text-lg font-bold font-mono text-cyan-900 mt-1 block">
                {formatINR(vacationStats.totalBudget)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Confirmed & Booked
              </span>
              <span className="text-lg font-bold font-mono text-emerald-700 mt-1 block">
                {vacationStats.bookedCount} Trips
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                In Planning Stage
              </span>
              <span className="text-lg font-bold font-mono text-amber-700 mt-1 block">
                {vacationStats.planningCount} Trips
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Completed Memories
              </span>
              <span className="text-lg font-bold font-mono text-indigo-700 mt-1 block">
                {vacationStats.completedCount} Trips
              </span>
            </div>
          </div>

          {/* Vacations List */}
          <div className="space-y-4">
            {vacations.map((vac) => {
              const isExpanded = expandedVacationId === vac.id;
              const totalPacked = vac.packingList.filter((p) => p.isPacked).length;
              const totalPackingItems = vac.packingList.length;
              const packingPercent = totalPackingItems > 0 ? Math.round((totalPacked / totalPackingItems) * 100) : 0;

              return (
                <div
                  key={vac.id}
                  className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all"
                >
                  {/* Vacation Card Hero Top */}
                  <div
                    className={`p-5 sm:p-6 bg-gradient-to-r ${
                      vac.coverGradient || 'from-cyan-600 to-indigo-700'
                    } text-white`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-3.5">
                        <span className="text-3xl sm:text-4xl p-2.5 bg-white/20 rounded-2xl backdrop-blur-md shrink-0">
                          {vac.coverEmoji}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wide border border-white/20">
                              {vac.status === 'booked' ? '🎫 Booked & Ready' : vac.status === 'planning' ? '📝 Planning' : '✨ Dream'}
                            </span>
                            <span className="text-xs text-white/80 font-medium">
                              {vac.destination}, {vac.country}
                            </span>
                          </div>
                          <h2 className="text-lg sm:text-xl font-extrabold font-heading text-white mt-1">
                            {vac.title}
                          </h2>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-white/90 mt-1 font-medium">
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3.5 h-3.5 text-cyan-200" />
                              {vac.startDate} to {vac.endDate}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-cyan-200" />
                              {vac.travelCompanions.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Budget Badge & Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <div className="px-3.5 py-2 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20 text-right">
                          <span className="text-[10px] uppercase text-white/70 block font-semibold">
                            Est. Budget
                          </span>
                          <span className="text-sm font-extrabold font-mono text-white">
                            {formatINR(vac.estimatedBudget)}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setEditingVacation(vac);
                            setIsVacationModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                          title="Edit Vacation"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteVacation(vac.id)}
                          className="p-2 rounded-xl bg-white/20 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                          title="Delete Vacation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setExpandedVacationId(isExpanded ? null : vac.id)}
                          className="p-2 rounded-xl bg-white text-slate-900 hover:bg-amber-50 font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <span className="text-xs">{isExpanded ? 'Collapse' : 'Details'}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Vacation Expandable Section (Itinerary, Packing, Bookings) */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 bg-slate-50/70 border-t border-slate-200 space-y-6">
                      {/* Notes / Highlights */}
                      {vac.notes && (
                        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                          <span className="font-bold text-slate-900 block mb-0.5">
                            Trip Notes & Objectives:
                          </span>
                          {vac.notes}
                        </div>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* LEFT (7 cols): Day-by-Day Itinerary */}
                        <div className="lg:col-span-7 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                              <ListTodo className="w-4 h-4 text-cyan-600" />
                              Day-by-Day Travel Itinerary ({vac.itinerary.length} Days)
                            </h3>
                          </div>

                          <div className="space-y-3">
                            {vac.itinerary.map((day) => (
                              <div
                                key={day.id}
                                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2"
                              >
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-lg bg-cyan-50 border border-cyan-200 font-mono text-xs font-bold text-cyan-900">
                                      Day {day.dayNumber}
                                    </span>
                                    <span className="text-xs font-bold text-slate-900">
                                      {day.title}
                                    </span>
                                  </div>
                                  <span className="text-[11px] font-mono text-slate-400 font-semibold">
                                    {day.date}
                                  </span>
                                </div>

                                <ul className="space-y-1.5 text-xs text-slate-600">
                                  {day.activities.map((act, aIdx) => (
                                    <li key={aIdx} className="flex items-start gap-2">
                                      <span className="text-cyan-500 font-bold shrink-0 mt-0.5">•</span>
                                      <span>{act}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* RIGHT (5 cols): Interactive Packing Checklist & Bookings */}
                        <div className="lg:col-span-5 space-y-5">
                          {/* Packing Checklist */}
                          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Luggage className="w-4 h-4 text-indigo-600" />
                                Packing Checklist ({totalPacked}/{totalPackingItems})
                              </h3>
                              <span className="text-xs font-bold font-mono text-indigo-600">
                                {packingPercent}%
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${packingPercent}%` }}
                              />
                            </div>

                            {/* Checklist items */}
                            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                              {vac.packingList.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors text-xs"
                                >
                                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={item.isPacked}
                                      onChange={() => handleTogglePacking(vac, item.id)}
                                      className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                                    />
                                    <span
                                      className={`truncate ${
                                        item.isPacked
                                          ? 'line-through text-slate-400'
                                          : 'text-slate-800 font-medium'
                                      }`}
                                    >
                                      {item.item}
                                    </span>
                                  </label>
                                  <button
                                    onClick={() => handleDeletePackingItem(vac, item.id)}
                                    className="text-slate-300 hover:text-rose-500 p-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Add item input */}
                            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                              <input
                                type="text"
                                placeholder="Add packing item..."
                                value={newPackingText[vac.id] || ''}
                                onChange={(e) =>
                                  setNewPackingText({ ...newPackingText, [vac.id]: e.target.value })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddPackingItem(vac);
                                }}
                                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600"
                              />
                              <button
                                onClick={() => handleAddPackingItem(vac)}
                                className="p-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Bookings & Reservations */}
                          {vac.bookings.length > 0 && (
                            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                                <Ticket className="w-4 h-4 text-emerald-600" />
                                Confirmed Bookings ({vac.bookings.length})
                              </h3>
                              <div className="space-y-2">
                                {vac.bookings.map((b) => (
                                  <div
                                    key={b.id}
                                    className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs flex items-center justify-between"
                                  >
                                    <div>
                                      <span className="font-bold text-emerald-950 block">
                                        {b.provider} ({b.type})
                                      </span>
                                      <span className="text-[10px] text-emerald-700 font-mono">
                                        {b.confirmationCode ? `PNR: ${b.confirmationCode} • ` : ''}
                                        {b.date}
                                      </span>
                                    </div>
                                    <span className="font-mono font-bold text-emerald-800">
                                      {formatINR(b.cost)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: DATES TO REMEMBER & MILESTONES ================= */}
      {activeTab === 'dates_to_remember' && (
        <div className="space-y-6">
          {/* Search and Category Filter Bar */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dates, person, milestones..."
                  value={dateSearchQuery}
                  onChange={(e) => setDateSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <select
                value={dateCategoryFilter}
                onChange={(e) => setDateCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 font-medium"
              >
                <option value="all">All Categories</option>
                <option value="birthday">🎂 Birthdays</option>
                <option value="festival">🌺 Festivals</option>
                <option value="anniversary">💍 Anniversaries</option>
                <option value="renewal">🚗 Policy Renewals</option>
                <option value="bill_due">💳 Bill & Tax Dues</option>
                <option value="medical">🩺 Health Checkups</option>
                <option value="milestone">🎯 Milestones</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEditingDate(null);
                setIsDateModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer self-end sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Date to Remember</span>
            </button>
          </div>

          {/* VIP Birthday Banner highlight */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 bg-white/20 rounded-2xl backdrop-blur-md">👑</span>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/20">
                  Annual VIP Milestone
                </span>
                <h3 className="text-base font-bold font-heading mt-0.5">
                  Kaiwalya's Birthday — 1st September
                </h3>
                <p className="text-xs text-white/90">
                  Celebrated every year alongside Ganeshotsav with special blessings & milestones.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const bdayDate = datesToRemember.find((d) => d.title.includes('Birthday'));
                if (bdayDate) {
                  setEditingDate(bdayDate);
                  setIsDateModalOpen(true);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-white text-slate-900 hover:bg-amber-50 text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Edit Details
            </button>
          </div>

          {/* Dates Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDates.map((dtr) => (
              <div
                key={dtr.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                        {dtr.icon || '📌'}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                          {dtr.title}
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                          {dtr.category} {dtr.personName ? `• ${dtr.personName}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingDate(dtr);
                          setIsDateModalOpen(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteDateToRemember(dtr.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Date & Recurring info */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      {dtr.date}
                    </span>
                    {dtr.isAnnualRecurring && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold">
                        Annual Repeat
                      </span>
                    )}
                  </div>

                  {dtr.description && (
                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                      {dtr.description}
                    </p>
                  )}
                </div>

                {dtr.estimatedCost ? (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Planned Budget:</span>
                    <span className="font-mono font-bold text-indigo-600">
                      {formatINR(dtr.estimatedCost)}
                    </span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddEditVacationModal
        isOpen={isVacationModalOpen}
        onClose={() => setIsVacationModalOpen(false)}
        onSaveVacation={onSaveVacation}
        editingVacation={editingVacation}
      />

      <AddEditDateModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onSaveDate={onSaveDateToRemember}
        editingDate={editingDate}
      />
    </div>
  );
};
