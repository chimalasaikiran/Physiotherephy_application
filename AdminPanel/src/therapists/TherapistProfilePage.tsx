import React, { useState } from 'react';
import {
  ChevronRight,
  ArrowLeft,
  Star,
  Globe,
  Calendar,
  Users,
  ClipboardList,
  Clock,
  Banknote,
  TrendingUp,
  ShieldCheck,
  Activity,
  CheckCircle2,
  CalendarCheck,
  UserPlus,
  FilePlus,
} from 'lucide-react';
import type { Therapist } from './types';
import { AvailabilityTab } from './AvailabilityTab';
import { AssignedPatientsTab } from './AssignedPatientsTab';
import { TherapistProgramsTab } from './TherapistProgramsTab';
import { TherapistRevenueTab } from './TherapistRevenueTab';
import { TherapistCertificationsTab } from './TherapistCertificationsTab';

interface TherapistProfilePageProps {
  therapist?: Therapist | null;
  onBack?: () => void;
  defaultTab?: string;
}

export const TherapistProfilePage: React.FC<TherapistProfilePageProps> = ({
  therapist: initialTherapist,
  onBack,
  defaultTab = 'Profile',
}) => {
  // Fallback to Dr. Ananya Iyer from Figma design if initialTherapist is missing/partial
  const therapistName = initialTherapist?.name || 'Dr. Ananya Iyer';
  const therapistDegree = initialTherapist?.degree || 'MPT Orthopedic Physiotherapy';
  const therapistExp = initialTherapist?.experience || '8 Years Exp';
  const therapistRating = initialTherapist?.rating ?? 4.9;
  const therapistAvatar =
    initialTherapist?.avatarUrl ||
    'https://images.unsplash.com/photo-1594824813566-88855ce78905?w=400&auto=format&fit=crop&q=80';
  const specializations = initialTherapist?.specializations || ['Sports Rehabilitation', 'Active'];
  const patientsCount = initialTherapist?.patientsCount ?? 42;
  const therapistStatus = initialTherapist?.status || 'ACTIVE';

  // Sub-tab navigation state
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const tabs = [
    'Profile',
    'Availability',
    'Assigned Patients',
    'Programs',
    'Revenue',
    'Certifications',
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Breadcrumb Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-1 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              title="Back to Therapists"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
          >
            Therapists
          </button>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span className="text-slate-900 font-bold">{therapistName}</span>
        </div>
      </div>

      {/* 2. Top Hero Card Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 lg:p-8 border border-slate-100 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Avatar + Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative flex-shrink-0">
              <img
                src={therapistAvatar}
                alt={therapistName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-slate-50 shadow-sm"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="space-y-2">
              {/* Doctor Name & Rating */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {therapistName}
                </h1>
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/70 rounded-full text-xs font-extrabold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{therapistRating.toFixed(1)}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </span>
              </div>

              {/* Subtitle / Degree & Experience */}
              <p className="text-xs sm:text-sm font-bold text-slate-600">
                {therapistDegree} • {therapistExp}
              </p>

              {/* Languages Line */}
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Languages: English, Hindi</span>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {specializations.map((spec, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100/80 rounded-full text-xs font-bold"
                  >
                    {spec}
                  </span>
                ))}
                {therapistStatus === 'ACTIVE' && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold">
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3 self-start lg:self-center flex-wrap gap-y-2">
            <button
              onClick={() => showToast('Edit Profile dialog opened.')}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              Edit Profile
            </button>
            <button
              onClick={() => showToast('Manage Schedule view opened.')}
              className="flex items-center space-x-2 px-6 py-2.5 bg-[#0C3E6D] hover:bg-[#092e52] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Manage Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Stat Cards Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Patients */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Active Patients</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{patientsCount}</h3>
            <p className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+12% from last month</span>
            </p>
          </div>
        </div>

        {/* Metric 2: Programs Assigned */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Programs Assigned</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">18</h3>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Current active programs</p>
          </div>
        </div>

        {/* Metric 3: Sessions This Month */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Sessions This Month</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">164</h3>
            <p className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>On track to exceed target</span>
            </p>
          </div>
        </div>

        {/* Metric 4: Monthly Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Monthly Revenue</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">₹1.8L</h3>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              Performance payout pending
            </p>
          </div>
        </div>
      </div>

      {/* 4. Sub-Tab Navigation Bar */}
      <div className="border-b border-slate-200/80 overflow-x-auto no-scrollbar scroll-smooth">
        <nav className="flex space-x-6 min-w-max pb-0.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* 5. Main Content Grid (Two Columns: Left ~65%, Right ~35%) */}
      {activeTab === 'Profile' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* LEFT COLUMN (2 Columns on Desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1: Professional Overview */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
              <div className="flex items-center space-x-2.5 text-blue-600">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Professional Overview
                </h3>
              </div>

              <div className="space-y-4 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                <p>
                  Dr. Ananya Iyer is a highly specialized Orthopedic Physiotherapist with over 8
                  years of clinical experience. She specializes in advanced sports rehabilitation,
                  focusing on non-invasive recovery protocols for elite athletes and post-operative
                  orthopedic recovery.
                </p>
                <p>
                  Her approach integrates traditional physiotherapy with modern bio-mechanical
                  analysis and personalized recovery tracking. She has successfully led recovery
                  programs for state-level athletes and maintains a high patient satisfaction rate
                  through empathetic care and evidence-based practice.
                </p>
              </div>

              {/* Bottom Education & Certifications Summary Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Education
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    Masters in Physiotherapy (MPT) - Orthopedics, Manipal University
                  </p>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Certifications
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    Manual Therapy (COMT), Dry Needling (Level 2)
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Recent Activity */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 text-blue-600">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Recent Activity
                  </h3>
                </div>
                <button
                  onClick={() => showToast('Full activity log opened.')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  View All
                </button>
              </div>

              {/* Activity Timeline Items */}
              <div className="space-y-4 relative before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-100">
                {/* Activity Item 1 */}
                <div className="flex items-start space-x-4 relative">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 z-10 border border-white">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1 pt-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                        Completed Session with Rohan Mehta
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-400">
                        2 hours ago
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Knee Mobility Protocol - Week 4 Progress Review. Note: "Excellent recovery in
                      range of motion."
                    </p>
                  </div>
                </div>

                {/* Activity Item 2 */}
                <div className="flex items-start space-x-4 relative">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 z-10 border border-white">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1 pt-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                        Assigned New Program: Post-ACL Recovery
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-400">
                        5 hours ago
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Assigned to Ananya Singh. Program duration: 12 weeks. High-intensity track.
                    </p>
                  </div>
                </div>

                {/* Activity Item 3 */}
                <div className="flex items-start space-x-4 relative">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 z-10 border border-white">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1 pt-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                        New Patient Assigned
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-400">Yesterday</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Vikram Malhotra transferred from General Wellness to Orthopedic Rehab.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (1 Column on Desktop) */}
          <div className="space-y-6">
            {/* Card 1: Today's Schedule */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Today's Schedule
                </h3>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                  4 Pending
                </span>
              </div>

              <div className="space-y-3">
                {/* Schedule Item 1 */}
                <div className="p-4 bg-blue-50/50 border-l-4 border-blue-600 rounded-2xl space-y-1">
                  <span className="text-[11px] font-extrabold text-blue-700 tracking-wider uppercase">
                    10:30 AM - 11:15 AM
                  </span>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Arjun Kapoor</h4>
                  <p className="text-xs font-medium text-slate-500">Shoulder Impingement</p>
                </div>

                {/* Schedule Item 2 */}
                <div className="p-4 bg-purple-50/50 border-l-4 border-purple-600 rounded-2xl space-y-1">
                  <span className="text-[11px] font-extrabold text-purple-700 tracking-wider uppercase">
                    12:00 PM - 12:45 PM
                  </span>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Sanya Malhotra
                  </h4>
                  <p className="text-xs font-medium text-slate-500">Post-Op Hip Rehab</p>
                </div>

                {/* Schedule Item 3 */}
                <div className="p-4 bg-slate-50 border-l-4 border-slate-300 rounded-2xl space-y-1 opacity-75">
                  <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase">
                    02:30 PM - 03:15 PM
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-700">Rohan Mehta</h4>
                  <p className="text-xs font-medium text-slate-400">Completed (Knee Rehab)</p>
                </div>
              </div>

              <button
                onClick={() => showToast('Calendar view opened.')}
                className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-700 pt-2 block cursor-pointer"
              >
                Open Calendar
              </button>
            </div>

            {/* Card 2: Performance Summary */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Performance Summary
              </h3>

              <div className="space-y-4">
                {/* Progress Bar 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-extrabold">
                    <span className="text-slate-600">Patient Satisfaction</span>
                    <span className="text-slate-900">98%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>

                {/* Progress Bar 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-extrabold">
                    <span className="text-slate-600">Program Completion Rate</span>
                    <span className="text-slate-900">85%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                {/* Metric Summary Pair */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-center">
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    <h4 className="text-xl font-extrabold text-slate-900">12</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                      New Leads
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl">
                    <h4 className="text-xl font-extrabold text-slate-900">4.8</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                      Avg. Rating
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Quick Actions */}
            <div className="bg-[#0C3E6D] text-white rounded-3xl p-6 shadow-md space-y-4">
              <h3 className="text-base sm:text-lg font-extrabold text-white">Quick Actions</h3>

              <div className="space-y-3">
                <button
                  onClick={() => showToast('Assign Patient dialog opened.')}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-white text-[#0C3E6D] hover:bg-slate-100 rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Assign Patient</span>
                </button>

                <button
                  onClick={() => showToast('Create Program dialog opened.')}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600/60 hover:bg-blue-600 text-white border border-blue-400/40 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>Create Program</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'Availability' ? (
        <AvailabilityTab therapist={initialTherapist} />
      ) : activeTab === 'Assigned Patients' ? (
        <AssignedPatientsTab therapist={initialTherapist} />
      ) : activeTab === 'Programs' ? (
        <TherapistProgramsTab therapist={initialTherapist} />
      ) : activeTab === 'Revenue' ? (
        <TherapistRevenueTab therapist={initialTherapist} />
      ) : activeTab === 'Certifications' ? (
        <TherapistCertificationsTab therapist={initialTherapist} />
      ) : (
        /* Sub-tab view placeholders */
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-100 shadow-2xs text-center max-w-2xl mx-auto my-6 space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
            {activeTab.charAt(0)}
          </div>
          <h3 className="text-xl font-bold text-slate-900">{activeTab} Details</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Comprehensive {activeTab.toLowerCase()} record and breakdown for {therapistName} are synchronized with clinic schedule.
          </p>
          <button
            onClick={() => setActiveTab('Profile')}
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer"
          >
            Back to Profile Overview
          </button>
        </div>
      )}
    </div>
  );
};

export default TherapistProfilePage;
