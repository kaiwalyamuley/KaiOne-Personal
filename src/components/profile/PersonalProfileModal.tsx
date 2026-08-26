import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Crown,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Heart,
  Droplets,
  DollarSign,
  Save,
  Check,
  Flame,
  Shield,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface PersonalProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

const AVATAR_OPTIONS = ['👑', '🚀', '🕉️', '⚡', '🧘‍♂️', '🏖️', '💻', '🎯', '🌿', '🦁'];

const FESTIVAL_CHECKLIST = [
  'Ganesh Chaturthi',
  'Diwali',
  'Holi',
  'Makar Sankranti',
  'Navratri & Dussehra',
  'Raksha Bandhan',
  'Janmashtami',
  'Independence Day',
  'New Year',
];

export const PersonalProfileModal: React.FC<PersonalProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [birthdate, setBirthdate] = useState<string>('2000-09-01');
  const [avatar, setAvatar] = useState<string>('👑');
  const [bio, setBio] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [occupation, setOccupation] = useState<string>('');
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [emergencyContact, setEmergencyContact] = useState<string>('');
  const [targetWeightKg, setTargetWeightKg] = useState<string>('72');
  const [targetDailyWaterMl, setTargetDailyWaterMl] = useState<string>('3000');
  const [targetDailySleepHours, setTargetDailySleepHours] = useState<string>('7.5');
  const [monthlySavingsTarget, setMonthlySavingsTarget] = useState<string>('50000');
  const [favoriteFestivals, setFavoriteFestivals] = useState<string[]>([]);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || 'Kaiwalya');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '');
      setBirthdate(userProfile.birthdate || '2000-09-01');
      setAvatar(userProfile.avatar || '👑');
      setBio(userProfile.bio || '');
      setCity(userProfile.city || 'Mumbai, India');
      setOccupation(userProfile.occupation || 'Software Engineer');
      setBloodGroup(userProfile.bloodGroup || 'O+');
      setEmergencyContact(userProfile.emergencyContact || '');
      setTargetWeightKg(String(userProfile.targetWeightKg || 72));
      setTargetDailyWaterMl(String(userProfile.targetDailyWaterMl || 3000));
      setTargetDailySleepHours(String(userProfile.targetDailySleepHours || 7.5));
      setMonthlySavingsTarget(String(userProfile.monthlySavingsTarget || 50000));
      setFavoriteFestivals(userProfile.favoriteFestivals || ['Ganesh Chaturthi', 'Diwali']);
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const handleToggleFestival = (fest: string) => {
    if (favoriteFestivals.includes(fest)) {
      setFavoriteFestivals(favoriteFestivals.filter((f) => f !== fest));
    } else {
      setFavoriteFestivals([...favoriteFestivals, fest]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: UserProfile = {
      ...userProfile,
      name: name.trim() || 'Kaiwalya',
      email: email.trim(),
      phone: phone.trim(),
      birthdate,
      avatar,
      bio: bio.trim(),
      city: city.trim(),
      occupation: occupation.trim(),
      bloodGroup,
      emergencyContact: emergencyContact.trim(),
      targetWeightKg: parseFloat(targetWeightKg) || 72,
      targetDailyWaterMl: parseInt(targetDailyWaterMl) || 3000,
      targetDailySleepHours: parseFloat(targetDailySleepHours) || 7.5,
      monthlySavingsTarget: parseFloat(monthlySavingsTarget) || 50000,
      favoriteFestivals,
    };

    onSaveProfile(updatedProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-600 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-3xl p-2 bg-white/10 rounded-2xl backdrop-blur-md">
              {avatar}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  Personal Life Profile
                </span>
              </div>
              <h2 className="text-lg font-extrabold font-heading text-white">
                {name || 'Kaiwalya'}'s Profile Settings
              </h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-800 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Avatar & Personal Identity */}
            <div className="space-y-4">
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Profile Avatar Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setAvatar(em)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                        avatar === em
                          ? 'bg-amber-500 text-slate-950 scale-105 shadow-md ring-2 ring-amber-300'
                          : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Identity & Personal Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <User className="w-4 h-4" />
                  Identity & Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Birth (VIP) *
                    </label>
                    <input
                      type="date"
                      required
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 font-mono font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="kaiwalya@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone / WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City / Location
                    </label>
                    <input
                      type="text"
                      placeholder="Mumbai, India"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Occupation
                    </label>
                    <input
                      type="text"
                      placeholder="Software Engineer"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Personal Bio & Life Manifesto
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Share your goals, principles, and mindfulness mindset..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 font-medium resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Health Baselines, Financial Goals, Festivals */}
            <div className="space-y-4">
              {/* Health Baselines */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <Heart className="w-4 h-4" />
                  Health Baselines & Vitality Goals
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Blood Group
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-600 font-medium cursor-pointer"
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Target Wt (kg)
                    </label>
                    <input
                      type="number"
                      value={targetWeightKg}
                      onChange={(e) => setTargetWeightKg(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-600 font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Water (ml)
                    </label>
                    <input
                      type="number"
                      step="250"
                      value={targetDailyWaterMl}
                      onChange={(e) => setTargetDailyWaterMl(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-600 font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Sleep (hrs)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={targetDailySleepHours}
                      onChange={(e) => setTargetDailySleepHours(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-600 font-mono font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Goals */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <DollarSign className="w-4 h-4" />
                  Monthly Savings & Emergency Contact
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Monthly Savings Target (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      value={monthlySavingsTarget}
                      onChange={(e) => setMonthlySavingsTarget(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      placeholder="Family (+91...)"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Favorite Cultural Festivals */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <Sparkles className="w-4 h-4" />
                  Favorite Festivals & Celebrations
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FESTIVAL_CHECKLIST.map((fest) => {
                    const isSelected = favoriteFestivals.includes(fest);
                    return (
                      <button
                        key={fest}
                        type="button"
                        onClick={() => handleToggleFestival(fest)}
                        className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{fest}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Updates</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
