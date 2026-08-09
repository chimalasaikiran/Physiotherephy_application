import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Building2,
  Lock,
  Upload,
  CheckCircle2,
  Info,
  ArrowLeft,
  Stethoscope,
  Clock,
  CircleDollarSign,
  MapPin,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { Therapist } from './types';

interface AddTherapistPageProps {
  onBack?: () => void;
  onTherapistCreated?: (therapist: Omit<Therapist, 'id' | 'patientsCount' | 'rating'>) => void;
}

export const AddTherapistPage: React.FC<AddTherapistPageProps> = ({
  onBack,
  onTherapistCreated,
}) => {
  // Personal Info State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileCode, setMobileCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Professional Info State
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [languages, setLanguages] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Clinic Info State
  const [consultationFee, setConsultationFee] = useState('');
  const [sessionDuration, setSessionDuration] = useState('60 Minutes');
  const [availabilityType, setAvailabilityType] = useState('Full-Time');
  const [onlineConsultation, setOnlineConsultation] = useState(true);
  const [homeVisitEnabled, setHomeVisitEnabled] = useState(false);

  // Account Settings State
  const [username, setUsername] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [systemRole, setSystemRole] = useState('Medical Practitioner');
  const [accountStatus, setAccountStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Form Submission feedback
  const [isSaved, setIsSaved] = useState(false);

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fullName = `${firstName.trim() || 'Aarav'} ${lastName.trim() || 'Sharma'}`;
    const formattedName = fullName.startsWith('Dr.') ? fullName : `Dr. ${fullName}`;

    const newTherapistData: Omit<Therapist, 'id' | 'patientsCount' | 'rating'> = {
      name: formattedName,
      degree: qualification || 'MPT (Sports Medicine), BPT',
      experience: experienceYears ? `${experienceYears} Years Exp.` : '5 Years Exp.',
      email: email || 'aarav.s@onemedical.in',
      phone: `${mobileCode} ${mobileNumber || '98765 43210'}`,
      location: 'Building A, Clinic Room 102',
      bio: `Specialist in ${specialization || 'Sports Rehab'} with ${experienceYears || '5'} years of clinical experience.`,
      availability: 'Available Today',
      status: accountStatus,
      specializations: specialization ? [specialization] : ['Sports Rehab'],
      avatarUrl: profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      initials: fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase(),
    };

    if (onTherapistCreated) {
      onTherapistCreated(newTherapistData);
    }

    setIsSaved(true);
    setTimeout(() => {
      if (onBack) onBack();
    }, 1200);
  };

  const handleSaveDraft = () => {
    alert('Therapist profile draft saved successfully!');
  };

  const fullNameDisplay =
    firstName || lastName
      ? `Dr. ${firstName} ${lastName}`.trim()
      : 'New Therapist';

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-28">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 mb-2 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Therapists</span>
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Add Therapist
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Create a therapist profile and configure their professional information.
          </p>
        </div>

        {isSaved && (
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Therapist Profile Created Successfully!</span>
          </div>
        )}
      </div>

      {/* 2. Main Content Grid */}
      <form id="add-therapist-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form Column (8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-6">
            {/* CARD 1: Personal Information */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
              <div className="flex items-center space-x-3 text-slate-900 border-b border-slate-50 pb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Personal Information</h3>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Photo Upload Area */}
                <div className="flex flex-col items-center flex-shrink-0 w-full sm:w-auto">
                  <label className="relative w-36 h-36 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/30 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile preview"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-extrabold text-slate-400 group-hover:text-blue-600 uppercase tracking-wider mt-2">
                          UPLOAD
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs font-semibold text-slate-400 mt-2">
                    Profile Photo
                  </span>
                </div>

                {/* Form Fields right of Photo */}
                <div className="flex-1 w-full space-y-4">
                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                        FIRST NAME
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Aarav"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                        LAST NAME
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sharma"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email & Mobile Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        placeholder="aarav.s@onemedical.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                        MOBILE NUMBER
                      </label>
                      <div className="flex rounded-2xl border border-slate-200/90 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                        <select
                          value={mobileCode}
                          onChange={(e) => setMobileCode(e.target.value)}
                          className="bg-slate-50 border-r border-slate-200 px-3 py-3 text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
                        >
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                        </select>
                        <input
                          type="text"
                          placeholder="98765 43210"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="w-full px-4 py-3 bg-white text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date of Birth & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                        DATE OF BIRTH
                      </label>
                      <input
                        type="text"
                        placeholder="mm/dd/yyyy"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                        GENDER
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Professional Information */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
              <div className="flex items-center space-x-3 text-slate-900 border-b border-slate-50 pb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Professional Information</h3>
              </div>

              <div className="space-y-4">
                {/* Qualification & Specialization */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      QUALIFICATION
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MPT (Sports Medicine), BPT"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      SPECIALIZATION
                    </label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="">Select Specialization</option>
                      <option value="Sports Rehab">Sports Rehab</option>
                      <option value="Orthopedic">Orthopedic</option>
                      <option value="Neurological">Neurological</option>
                      <option value="MSK">MSK</option>
                      <option value="Pelvic Health">Pelvic Health</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Geriatrics">Geriatrics</option>
                      <option value="Manual Therapy">Manual Therapy</option>
                    </select>
                  </div>
                </div>

                {/* Experience & Languages */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      YEARS OF EXPERIENCE
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 8"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      LANGUAGES SPOKEN
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. English, Hindi, Marathi"
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Medical License Number */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    MEDICAL LICENSE NUMBER
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IAP-REG-2023-XXXX"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* CARD 3: Clinic Information */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
              <div className="flex items-center space-x-3 text-slate-900 border-b border-slate-50 pb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Clinic Information</h3>
              </div>

              <div className="space-y-4">
                {/* Fee & Session Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      CONSULTATION FEE (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-sm font-bold text-slate-400 pointer-events-none">
                        ₹
                      </span>
                      <input
                        type="text"
                        placeholder="1200"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      SESSION DURATION
                    </label>
                    <select
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="30 Minutes">30 Minutes</option>
                      <option value="45 Minutes">45 Minutes</option>
                      <option value="60 Minutes">60 Minutes</option>
                      <option value="90 Minutes">90 Minutes</option>
                    </select>
                  </div>
                </div>

                {/* Availability Type & Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      AVAILABILITY TYPE
                    </label>
                    <select
                      value={availabilityType}
                      onChange={(e) => setAvailabilityType(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="On-Call">On-Call</option>
                    </select>
                  </div>

                  {/* Toggle Switches */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Online Consultation
                      </span>
                      <button
                        type="button"
                        onClick={() => setOnlineConsultation(!onlineConsultation)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                          onlineConsultation ? 'bg-blue-700' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            onlineConsultation ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Home Visit Enabled
                      </span>
                      <button
                        type="button"
                        onClick={() => setHomeVisitEnabled(!homeVisitEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                          homeVisitEnabled ? 'bg-blue-700' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            homeVisitEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: Account Settings */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
              <div className="flex items-center space-x-3 text-slate-900 border-b border-slate-50 pb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Account Settings</h3>
              </div>

              <div className="space-y-4">
                {/* Username & Temp Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      USERNAME
                    </label>
                    <input
                      type="text"
                      placeholder="aarav_sharma_physio"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      TEMP PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="********"
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* System Role & Account Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      SYSTEM ROLE
                    </label>
                    <select
                      value={systemRole}
                      onChange={(e) => setSystemRole(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="Medical Practitioner">Medical Practitioner</option>
                      <option value="Senior Physiotherapist">Senior Physiotherapist</option>
                      <option value="Consultant">Consultant</option>
                      <option value="Clinic Admin">Clinic Admin</option>
                    </select>
                  </div>

                  {/* Account Status Switch */}
                  <div className="flex items-center justify-between sm:justify-start sm:space-x-6 pt-3 sm:pt-4">
                    <span className="text-xs font-bold text-slate-800">
                      Account Status
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          setAccountStatus(
                            accountStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                          )
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                          accountStatus === 'ACTIVE' ? 'bg-blue-700' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            accountStatus === 'ACTIVE'
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-xs font-extrabold tracking-wider uppercase text-blue-700">
                        {accountStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Preview Side Column (4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Top PROFILE PREVIEW Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
              {/* Dark Hero Banner with Portrait / Avatar */}
              <div className="relative h-44 bg-slate-900 overflow-hidden flex items-end p-5">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Preview avatar"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-800 opacity-90 flex items-center justify-center">
                    <User className="w-24 h-24 text-slate-700 stroke-[1]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                <div className="relative z-10 text-white">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
                    PROFILE PREVIEW
                  </span>
                  <h3 className="text-lg font-extrabold tracking-tight text-white mt-0.5">
                    {fullNameDisplay}
                  </h3>
                </div>
              </div>

              {/* Preview Info Rows */}
              <div className="p-6 space-y-4">
                <div className="space-y-3 text-xs">
                  {/* Specialization */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        SPECIALIZATION
                      </div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {specialization || '—'}
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        EXPERIENCE
                      </div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {experienceYears ? `${experienceYears} Years` : '— Years'}
                      </div>
                    </div>
                  </div>

                  {/* Consultation Fee */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <CircleDollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        CONSULTATION FEE
                      </div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {consultationFee ? `₹ ${consultationFee}` : '₹ 0'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CLINIC STATUS box */}
                <div className="bg-sky-50/80 border border-sky-100 rounded-2xl p-3.5 space-y-1">
                  <div className="text-[10px] font-extrabold text-sky-700 uppercase tracking-wider">
                    CLINIC STATUS
                  </div>
                  <p className="text-xs font-semibold text-sky-900 leading-snug">
                    Ready to accept appointments upon profile completion.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom ONBOARDING TIPS Card */}
            <div className="bg-[#EBF1FA] rounded-3xl p-6 sm:p-7 space-y-4 border border-blue-100/60">
              <div className="flex items-center space-x-2 text-[#0F4C81]">
                <MapPin className="w-4 h-4" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider">
                  ONBOARDING TIPS
                </h4>
              </div>

              <ul className="space-y-3 text-xs font-medium text-slate-700">
                <li className="flex items-start space-x-2.5">
                  <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Ensure the License Number is valid for audit compliance.</span>
                </li>

                <li className="flex items-start space-x-2.5">
                  <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Upload a professional headshot for the patient portal.</span>
                </li>

                <li className="flex items-start space-x-2.5">
                  <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Set an accurate Session Duration to avoid schedule overlaps.</span>
                </li>

                <li className="flex items-start space-x-2.5">
                  <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Confirm Languages Spoken to help patient matching.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </form>

      {/* 3. Sticky Bottom Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:pl-64 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-6 py-4 transition-all">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left info notice */}
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>Unsaved changes will be lost unless drafted.</span>
          </div>

          {/* Right action buttons */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 transition-all shadow-2xs cursor-pointer"
            >
              Save Draft
            </button>

            <button
              type="submit"
              form="add-therapist-form"
              className="px-6 py-2.5 bg-[#0F4C81] hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Create Therapist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTherapistPage;
