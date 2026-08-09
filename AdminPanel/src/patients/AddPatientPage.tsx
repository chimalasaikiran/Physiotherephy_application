import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Activity,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import type { Patient, ConditionType, PatientStatus } from './types';

interface AddPatientPageProps {
  onBack?: () => void;
  onPatientCreated?: (patient: Omit<Patient, 'id'>) => void;
}

export const AddPatientPage: React.FC<AddPatientPageProps> = ({
  onBack,
  onPatientCreated,
}) => {
  // Form Fields State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<string>('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // Emergency Contact State
  const [contactName, setContactName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Medical Info State
  const [primaryCondition, setPrimaryCondition] = useState<string>('');
  const [painLevel, setPainLevel] = useState<number>(5);
  const [injuryDate, setInjuryDate] = useState('');
  const [assignedTherapist, setAssignedTherapist] = useState<string>('');
  const [existingConditions, setExistingConditions] = useState('');

  // Appointment Info State
  const [firstAppointmentDate, setFirstAppointmentDate] = useState('');
  const [sessionType, setSessionType] = useState<'Clinic Visit' | 'Home Visit' | 'Online'>('Clinic Visit');

  // Quick Notes State
  const [quickNotes, setQuickNotes] = useState('');

  // Status feedback
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fullName = `${firstName.trim() || 'John'} ${lastName.trim() || 'Doe'}`;
    const conditionVal: ConditionType =
      (primaryCondition as ConditionType) || 'Post-Op Rehab';
    const therapistVal = assignedTherapist || 'Dr. Sarah Chen';

    let initials = 'SC';
    let bg = 'bg-blue-100 text-blue-700';
    if (therapistVal.includes('Ananya')) {
      initials = 'AS';
      bg = 'bg-purple-100 text-purple-700';
    } else if (therapistVal.includes('Rohan')) {
      initials = 'RK';
      bg = 'bg-teal-100 text-teal-700';
    } else if (therapistVal.includes('Dev')) {
      initials = 'DM';
      bg = 'bg-indigo-100 text-indigo-700';
    }

    const newPatientData: Omit<Patient, 'id'> = {
      patientId: `#OM-${Math.floor(8900 + Math.random() * 100)}`,
      name: fullName,
      age: dob ? Math.max(18, new Date().getFullYear() - new Date(dob).getFullYear()) : 32,
      gender: (gender as 'Male' | 'Female' | 'Other') || 'Male',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      condition: conditionVal,
      therapistName: therapistVal,
      therapistInitials: initials,
      therapistAvatarBg: bg,
      nextAppointmentDate: firstAppointmentDate || 'Tomorrow',
      nextAppointmentTime: '10:00 AM',
      recoveryScore: Math.max(20, 100 - painLevel * 8),
      status: 'Active Treatment' as PatientStatus,
      phone: mobile || '+1 (555) 000-0000',
      email: email || `${firstName.toLowerCase() || 'john'}.${lastName.toLowerCase() || 'doe'}@example.com`,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      notes: quickNotes || 'Initial intake session scheduled.',
    };

    if (onPatientCreated) {
      onPatientCreated(newPatientData);
    }

    setIsSaved(true);
    setTimeout(() => {
      if (onBack) onBack();
    }, 1200);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Top Header Row with Title & Optional Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 mb-2 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Patients</span>
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Add Patient
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Create a new patient profile and begin their recovery journey.
          </p>
        </div>

        {isSaved && (
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Patient Profile Created Successfully!</span>
          </div>
        )}
      </div>

      {/* Main Grid: Left Form Cards (8 cols) & Right Preview Side Panel (4 cols) */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Form Container */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Personal Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 text-slate-900 border-b border-slate-50 pb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* First Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Mobile
                </label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="text"
                  placeholder="mm/dd/yyyy"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Height (cm) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Height (cm)
                </label>
                <input
                  type="text"
                  placeholder="180"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Weight (kg) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="text"
                  placeholder="75"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Emergency Contact */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 text-slate-900 border-b border-slate-50 pb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Emergency Contact</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Contact Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Relationship
                </label>
                <input
                  type="text"
                  placeholder="Spouse"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Medical Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 text-slate-900 border-b border-slate-50 pb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Medical Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Primary Condition */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Primary Condition
                </label>
                <select
                  value={primaryCondition}
                  onChange={(e) => setPrimaryCondition(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="">Select Condition</option>
                  <option value="Post-Op Rehab">Post-Op Rehab</option>
                  <option value="ACL Recovery">ACL Recovery</option>
                  <option value="Neuropathy">Neuropathy</option>
                  <option value="Hypertension">Hypertension</option>
                  <option value="Chronic Pain">Chronic Pain</option>
                  <option value="Orthopedic">Orthopedic</option>
                  <option value="Rehab">Rehab</option>
                </select>
              </div>

              {/* Pain Level Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">Pain Level</label>
                  <span className="text-sm font-bold text-blue-600">{painLevel}</span>
                </div>
                <div className="py-2">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={painLevel}
                    onChange={(e) => setPainLevel(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mt-1">
                    <span>MILD</span>
                    <span>SEVERE</span>
                  </div>
                </div>
              </div>

              {/* Injury Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Injury Date
                </label>
                <input
                  type="text"
                  placeholder="mm/dd/yyyy"
                  value={injuryDate}
                  onChange={(e) => setInjuryDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Assigned Therapist */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Assigned Therapist
                </label>
                <select
                  value={assignedTherapist}
                  onChange={(e) => setAssignedTherapist(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="">Select Therapist</option>
                  <option value="Dr. Sarah Chen">Dr. Sarah Chen</option>
                  <option value="Dr. Ananya Sharma">Dr. Ananya Sharma</option>
                  <option value="Dr. Rohan Kapoor">Dr. Rohan Kapoor</option>
                  <option value="Dr. Dev Mukherjee">Dr. Dev Mukherjee</option>
                </select>
              </div>

              {/* Existing Conditions */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Existing Conditions
                </label>
                <textarea
                  rows={3}
                  placeholder="List any allergies, surgeries, or chronic illnesses..."
                  value={existingConditions}
                  onChange={(e) => setExistingConditions(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Appointment Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 text-slate-900 border-b border-slate-50 pb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Appointment Information</h3>
            </div>

            <div className="space-y-5">
              {/* First Appointment Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  First Appointment Date
                </label>
                <input
                  type="text"
                  placeholder="mm/dd/yyyy"
                  value={firstAppointmentDate}
                  onChange={(e) => setFirstAppointmentDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Session Type
                </label>
                <div className="bg-slate-100/70 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200/40">
                  {(['Clinic Visit', 'Home Visit', 'Online'] as const).map((type) => {
                    const isActive = sessionType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSessionType(type)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                alert('Draft saved locally.');
              }}
              className="px-5 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Save Draft
            </button>

            <button
              type="submit"
              className="px-6 py-3 bg-[#0F4C81] hover:bg-blue-800 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 cursor-pointer"
            >
              <span>Create Patient</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side Summary Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Preview Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs text-center space-y-5">
            {/* Avatar Circle */}
            <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto border-2 border-slate-50 shadow-inner">
              <User className="w-10 h-10" />
            </div>

            {/* Profile Title & Badge */}
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {firstName || lastName ? `${firstName} ${lastName}` : 'New Profile'}
              </h3>
              <div className="mt-2">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[11px] font-extrabold tracking-wider uppercase border border-blue-100">
                  NEW PATIENT
                </span>
              </div>
            </div>

            {/* Metadata Rows */}
            <div className="border-t border-b border-slate-100 py-4 space-y-3 text-xs text-left">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Assigned Therapist</span>
                <span className="font-bold text-slate-900">
                  {assignedTherapist || '--'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Upcoming Appointment</span>
                <span className="font-bold text-slate-900">
                  {firstAppointmentDate || '--'}
                </span>
              </div>
            </div>

            {/* Quick Notes Section */}
            <div className="text-left space-y-2 pt-1">
              <label className="block text-xs font-bold text-slate-900">
                Quick Notes
              </label>
              <textarea
                rows={3}
                placeholder="Add internal notes about the patient's intake process..."
                value={quickNotes}
                onChange={(e) => setQuickNotes(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-50/60 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* AI Suggestion Tip Card */}
          <div className="bg-[#0F4C81] rounded-3xl p-6 sm:p-7 text-white shadow-lg space-y-4 relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-blue-200">
              <Lightbulb className="w-5 h-5 fill-blue-200/20 stroke-blue-200" />
            </div>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              &quot;Adding <span className="font-bold text-white">a Primary Condition early</span> helps our AI suggest <span className="font-bold text-white">the best therapist matching the injury type.</span>&quot;
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPatientPage;
