import React, { useState, useEffect } from 'react';
import {
  X,
  Plane,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  Check,
  Save,
  Sparkles,
} from 'lucide-react';
import { VacationPlan, VacationStatus } from '../../types';

interface AddEditVacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveVacation: (vacation: VacationPlan) => void;
  editingVacation?: VacationPlan | null;
}

const GRADIENT_PRESETS = [
  { name: 'Sunset Tropical', val: 'from-amber-500 via-rose-500 to-indigo-600', emoji: '🏖️' },
  { name: 'Alpine Pine', val: 'from-emerald-600 via-teal-600 to-cyan-700', emoji: '🏔️' },
  { name: 'Sakura Blossom', val: 'from-pink-500 via-purple-500 to-indigo-600', emoji: '🌸' },
  { name: 'Ocean Azure', val: 'from-cyan-500 via-blue-600 to-indigo-800', emoji: '🌊' },
  { name: 'Desert Dune', val: 'from-amber-600 via-orange-600 to-stone-900', emoji: '🏜️' },
  { name: 'Northern Lights', val: 'from-emerald-500 via-cyan-600 to-purple-900', emoji: '🌌' },
];

export const AddEditVacationModal: React.FC<AddEditVacationModalProps> = ({
  isOpen,
  onClose,
  onSaveVacation,
  editingVacation,
}) => {
  const [title, setTitle] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [country, setCountry] = useState<string>('India');
  const [startDate, setStartDate] = useState<string>('2026-11-20');
  const [endDate, setEndDate] = useState<string>('2026-11-24');
  const [status, setStatus] = useState<VacationStatus>('planning');
  const [estimatedBudget, setEstimatedBudget] = useState<string>('40000');
  const [coverGradient, setCoverGradient] = useState<string>(GRADIENT_PRESETS[0].val);
  const [coverEmoji, setCoverEmoji] = useState<string>('🏖️');
  const [travelCompanions, setTravelCompanions] = useState<string>('Friends Circle');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (editingVacation) {
      setTitle(editingVacation.title);
      setDestination(editingVacation.destination);
      setCountry(editingVacation.country);
      setStartDate(editingVacation.startDate);
      setEndDate(editingVacation.endDate);
      setStatus(editingVacation.status);
      setEstimatedBudget(String(editingVacation.estimatedBudget || 0));
      setCoverGradient(editingVacation.coverGradient || GRADIENT_PRESETS[0].val);
      setCoverEmoji(editingVacation.coverEmoji || '🏖️');
      setTravelCompanions(editingVacation.travelCompanions.join(', '));
      setNotes(editingVacation.notes || '');
    } else {
      setTitle('');
      setDestination('');
      setCountry('India');
      setStartDate('2026-11-20');
      setEndDate('2026-11-24');
      setStatus('planning');
      setEstimatedBudget('40000');
      setCoverGradient(GRADIENT_PRESETS[0].val);
      setCoverEmoji('🏖️');
      setTravelCompanions('Friends Circle');
      setNotes('');
    }
  }, [editingVacation, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim() || !startDate || !endDate) return;

    const companionsArray = travelCompanions
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const record: VacationPlan = {
      id: editingVacation?.id || `vac_${Date.now()}`,
      title: title.trim(),
      destination: destination.trim(),
      country: country.trim() || 'India',
      startDate,
      endDate,
      status,
      estimatedBudget: parseFloat(estimatedBudget) || 0,
      actualSpent: editingVacation?.actualSpent || 0,
      coverGradient,
      coverEmoji,
      travelCompanions: companionsArray.length ? companionsArray : ['Solo'],
      itinerary: editingVacation?.itinerary || [
        {
          id: `itin_${Date.now()}_1`,
          dayNumber: 1,
          date: startDate,
          title: `Arrival in ${destination}`,
          activities: ['Check in to stay', 'Unpack & explore local markets', 'Welcome dinner'],
        },
      ],
      packingList: editingVacation?.packingList || [
        { id: `pk_${Date.now()}_1`, item: 'Government ID & Tickets', category: 'documents', isPacked: false },
        { id: `pk_${Date.now()}_2`, item: 'Phone charger & Powerbank', category: 'electronics', isPacked: false },
        { id: `pk_${Date.now()}_3`, item: 'Comfortable footwear & Clothes', category: 'clothing', isPacked: false },
      ],
      bookings: editingVacation?.bookings || [],
      notes: notes.trim() || undefined,
      createdAt: editingVacation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveVacation(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with selected gradient preview */}
        <div className={`p-5 bg-gradient-to-r ${coverGradient} text-white flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-white/20 rounded-2xl backdrop-blur-md">
              {coverEmoji}
            </span>
            <div>
              <h2 className="text-base font-bold font-heading">
                {editingVacation ? 'Edit Vacation Trip' : 'Plan New Vacation Retreat'}
              </h2>
              <p className="text-xs text-white/80">
                Itineraries, packing checklists, bookings & budget tracking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - 2 Column Layout */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Title, Destination, Dates & Companions */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Vacation Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goa Coastal Escape & Sunset Cruise"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-cyan-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Destination *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. South Goa, Manali"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-cyan-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    placeholder="India, Japan"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-cyan-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-cyan-600 font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-cyan-600 font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Travel Companions (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Friends Circle, Family, Partner, Solo"
                  value={travelCompanions}
                  onChange={(e) => setTravelCompanions(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-cyan-600 font-medium"
                />
              </div>
            </div>

            {/* Right Column: Status, Budget, Theme Palette & Notes */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Trip Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VacationStatus)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-cyan-600 font-medium cursor-pointer"
                  >
                    <option value="planning">📝 In Planning</option>
                    <option value="booked">🎫 Confirmed & Booked</option>
                    <option value="completed">✅ Completed Memory</option>
                    <option value="dream">✨ Dream Bucket List</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Estimated Budget (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-cyan-600 font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Card Atmosphere & Theme
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {GRADIENT_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCoverGradient(preset.val);
                        setCoverEmoji(preset.emoji);
                      }}
                      className={`h-11 rounded-xl bg-gradient-to-r ${preset.val} flex items-center justify-center text-lg shadow-2xs transition-all cursor-pointer ${
                        coverGradient === preset.val ? 'ring-3 ring-cyan-500 scale-105' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={preset.name}
                    >
                      {preset.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Trip Objective & Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Highlights, beach goals, scenic drives, or gear checklist notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-cyan-600 font-medium resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingVacation ? 'Save Changes' : 'Create Vacation Plan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
