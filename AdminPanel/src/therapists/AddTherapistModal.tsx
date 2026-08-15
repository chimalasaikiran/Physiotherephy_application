import React, { useState } from 'react';
import { X, UserPlus, Sparkles, Loader2 } from 'lucide-react';
import type { Therapist, AvailabilityStatus, TherapistStatus } from './types';

interface AddTherapistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTherapist: (therapist: Omit<Therapist, 'id' | 'patientsCount' | 'rating'>) => Promise<void> | void;
}

const AVAILABLE_SPECIALIZATIONS = [
  'Sports Rehab',
  'Orthopedic',
  'Neurological',
  'MSK',
  'Pelvic Health',
  'Pediatrics',
  'Geriatrics',
  'Manual Therapy',
];

export const AddTherapistModal: React.FC<AddTherapistModalProps> = ({
  isOpen,
  onClose,
  onAddTherapist,
}) => {
  const [name, setName] = useState('');
  const [degree, setDegree] = useState('BPT, MPT');
  const [experience, setExperience] = useState('5 Years Exp.');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Building A, Room 101');
  const [bio, setBio] = useState('');
  const [availability, setAvailability] = useState<AvailabilityStatus>('Available Today');
  const [status, setStatus] = useState<TherapistStatus>('ACTIVE');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(['Sports Rehab']);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSpecialization = (spec: string) => {
    if (selectedSpecs.includes(spec)) {
      if (selectedSpecs.length > 1) {
        setSelectedSpecs(selectedSpecs.filter((s) => s !== spec));
      }
    } else {
      setSelectedSpecs([...selectedSpecs, spec]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await onAddTherapist({
        name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
        degree,
        experience,
        email,
        phone: phone || '+1 (555) 100-2000',
        location,
        bio: bio || 'Specialist physical therapist providing evidence-based rehabilitation.',
        availability,
        status,
        specializations: selectedSpecs,
        initials: name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
        assignedPatientIds: [],
      });
      onClose();
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save therapist.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                Add New Therapist
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Create record and assign clinic credentials
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Full Name & Degree */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Arjun Mehta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Degrees & Qualifications
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BPT, MPT"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Experience & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Experience
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 10 Years Exp."
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Clinic Location / Room
              </label>
              <input
                type="text"
                placeholder="e.g. Building A, Room 204"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. arjun@onemedical.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Specializations Tags Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Specializations (Select up to 3)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SPECIALIZATIONS.map((spec) => {
                const isSelected = selectedSpecs.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialization(spec)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-400/30 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Availability
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Available Today">Available Today</option>
                <option value="Busy">Busy</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TherapistStatus)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Short Professional Bio
            </label>
            <textarea
              rows={2}
              placeholder="Clinical focus and expertise summary..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-col items-stretch space-y-2">
            {saveError && (
              <p className="text-xs text-rose-600 font-semibold text-center">{saveError}</p>
            )}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Saving…' : 'Save Therapist'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
