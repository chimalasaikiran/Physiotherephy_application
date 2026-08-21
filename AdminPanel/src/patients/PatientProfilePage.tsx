import React, { useState } from 'react';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import {
  ChevronRight,
  Briefcase,
  Calendar,
  Clock,
  ExternalLink,
  Plus,
  Download,
  CheckCircle2,
  Circle,
  FileText,
  UserPlus,
  UploadCloud,
  CreditCard,
  TrendingUp,
  Zap,
  ClipboardList,
  CheckCircle,
  ArrowLeft,
  Trash2,
  Edit,
  X,
} from 'lucide-react';
import type { Patient } from './types';
import { addGoalToPatient, toggleGoalStatus, deletePatientRecord, updatePatientRecord } from '@/services/patientService';
import { usePatientProfileData } from './usePatientProfileData';
import { MedicalHistoryTab } from './MedicalHistoryTab';
import { ProgramsTab } from './ProgramsTab';
import { ProgressTab } from './ProgressTab';
import { ReportsTab } from './ReportsTab';
import { PaymentsTab } from './PaymentsTab';
import { NotesTab } from './NotesTab';
import { HistoryTab } from './HistoryTab';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/auth/config/firebase';

interface PatientProfilePageProps {
  patient: Patient;
  onBack?: () => void;
  defaultTab?: string;
}

export const PatientProfilePage: React.FC<PatientProfilePageProps> = ({
  patient: initialPatient,
  onBack,
  defaultTab = 'Overview',
}) => {
  // Live real-time Firestore subscriber hook for this specific patient
  const {
    patient,
    assignedPrograms,
    reports,
    payments,
    invoices,
    appointments,
    activityLogs,
    progressRecords,
    medicalHistoryList,
    clinicalNotesList,
    computedMetrics,
    uploadReport,
    assignProgram,
    addClinicalNote,
    removeClinicalNote,
    addProgress,
    addMedicalHistory,
    logActivity,
  } = usePatientProfileData(initialPatient);

  const patientName = (patient.name && patient.name !== 'Unnamed Patient') ? patient.name : `Patient (${patient.patientId || patient.id.slice(0, 6)})`;
  const patientAge = patient.age || 30;
  const patientGender = patient.gender || 'Not specified';
  const patientCondition = patient.condition || 'General Rehab';
  const patientStatus = patient.status || 'Active Treatment';
  const therapistName = patient.therapistName || 'No therapist assigned';
  const nextApptDate = patient.nextAppointmentDate || 'Pending Schedule';
  const nextApptTime = patient.nextAppointmentTime || '--';

  // Live dynamic computed metrics from Firestore
  const recoveryScore = computedMetrics.avgProgramProgress;
  const painLevel = patient.painLevel || 'Mild';
  const programsCount = computedMetrics.programsCount;
  const sessionsCompleted = computedMetrics.sessionsCompleted;
  const sessionsTotal = computedMetrics.sessionsTotal;

  // Active sub-tab state
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Modal states
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isBookApptModalOpen, setIsBookApptModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit Profile Form state
  const [editName, setEditName] = useState(patient.name || '');
  const [editPhone, setEditPhone] = useState(patient.phone || '');
  const [editEmail, setEditEmail] = useState(patient.email || '');
  const [editCondition, setEditCondition] = useState(patient.condition || '');
  const [editTherapist, setEditTherapist] = useState(patient.therapistName || '');
  const [editGender, setEditGender] = useState(patient.gender || 'Male');
  const [editAddress, setEditAddress] = useState(patient.address || '');

  // Book Appointment Form state
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('10:00 AM');
  const [apptTherapist, setApptTherapist] = useState(therapistName);
  const [apptType, setApptType] = useState('Physiotherapy Session');

  // New goal input modal state
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<'SHORT TERM' | 'LONG TERM'>('SHORT TERM');

  // Action notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleGoal = async (goalId: string) => {
    try {
      await toggleGoalStatus(patient.id, patient.goals || [], goalId);
      showToast('Goal status updated');
    } catch (err: any) {
      showToast('Failed to update goal status');
    }
  };

  const handleAddGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    try {
      await addGoalToPatient(patient.id, patient.goals || [], {
        text: newGoalText.trim(),
        category: newGoalCategory,
        completed: false,
      });
      setNewGoalText('');
      setIsAddGoalModalOpen(false);
      showToast('New recovery goal added to Firestore!');
    } catch (err: any) {
      showToast('Failed to save goal to Firestore');
    }
  };

  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updatePatientRecord(patient.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
        condition: editCondition.trim(),
        therapistName: editTherapist.trim(),
        gender: editGender as any,
        address: editAddress.trim(),
      });

      await logActivity({
        action: 'Profile updated',
        description: 'Admin updated patient profile information',
        performedBy: 'Admin',
      });

      setIsEditProfileModalOpen(false);
      showToast('Patient profile updated successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to update patient profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBookAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptDate) {
      showToast('Please select an appointment date');
      return;
    }
    setIsSaving(true);
    try {
      const apptColRef = collection(db, 'appointments');
      await addDoc(apptColRef, {
        userId: patient.id,
        patientId: patient.id,
        patientName: patientName,
        patientPhone: patient.phone || '',
        doctorName: apptTherapist || therapistName,
        therapistName: apptTherapist || therapistName,
        date: apptDate,
        fullDate: apptDate,
        timeSlot: apptTime,
        time: apptTime,
        type: apptType,
        service: apptType,
        status: 'Upcoming',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await updatePatientRecord(patient.id, {
        nextAppointmentDate: apptDate,
        nextAppointmentTime: apptTime,
      });

      await logActivity({
        action: 'Appointment created',
        description: `Scheduled ${apptType} for ${apptDate} at ${apptTime}`,
        performedBy: 'Admin',
      });

      setIsBookApptModalOpen(false);
      showToast(`Appointment booked successfully for ${apptDate}!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule appointment');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    'Overview',
    'Medical History',
    'Programs',
    'Progress',
    'Reports',
    'Payments',
    'Notes',
    'History',
  ];

  // Upcoming appointments list
  const upcomingAppointmentsList = appointments.filter(
    (a) => (a.status || 'Upcoming').toLowerCase() === 'upcoming' || (a.status || '').toLowerCase() === 'scheduled'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
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
              title="Back to Patients"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
          >
            Patients
          </button>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span className="text-slate-900 font-bold">{patientName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-mono font-bold border border-blue-100">
            {patient.patientId}
          </span>
        </div>
      </div>

      {/* 2. Top Patient Banner Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 lg:p-8 border border-slate-100 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Avatar + Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
            <InitialsAvatar
              name={patientName}
              className="w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl font-extrabold border-4 border-slate-50 shadow-sm shrink-0"
            />
            <div className="space-y-2">
              {/* Name & Condition/Status Badges */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {patientName}
                </h1>
                {/* Condition Badge */}
                <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-full text-xs font-bold">
                  {patientCondition}
                </span>
                {/* Status Badge */}
                <span className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-xs font-bold">
                  {patientStatus}
                </span>
              </div>

              {/* Sub-info line */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm font-semibold text-slate-500">
                <span>
                  {patientAge} years • {patientGender}
                </span>
                {patient.phone && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{patient.phone}</span>
                  </>
                )}
                {patient.email && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{patient.email}</span>
                  </>
                )}
                <span className="text-slate-300">•</span>
                <span className="flex items-center space-x-1.5 text-slate-700">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{therapistName}</span>
                </span>
              </div>

              {/* Next Session Pill */}
              <div className="pt-1">
                <span className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs font-bold text-blue-700">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Next: {nextApptDate} • {nextApptTime}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3 self-start lg:self-center flex-wrap gap-y-2">
            <button
              onClick={() => {
                setEditName(patient.name || '');
                setEditPhone(patient.phone || '');
                setEditEmail(patient.email || '');
                setEditCondition(patient.condition || '');
                setEditTherapist(patient.therapistName || '');
                setEditGender(patient.gender || 'Male');
                setEditAddress(patient.address || '');
                setIsEditProfileModalOpen(true);
              }}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center space-x-2"
            >
              <Edit className="w-4 h-4 text-slate-500" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setIsBookApptModalOpen(true)}
              className="px-6 py-2.5 bg-[#0C3E6D] hover:bg-[#092e52] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs sm:text-sm font-bold rounded-2xl transition-all cursor-pointer flex items-center space-x-2"
              title="Delete Patient Record"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Record</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Four Key Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Recovery Score */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-full border border-blue-100">
              Live Progress
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Recovery Score
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{recoveryScore}%</h3>
          </div>
        </div>

        {/* Metric 2: Pain Level */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-400">Current Pain</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pain Level</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{painLevel}</h3>
          </div>
        </div>

        {/* Metric 3: Programs Assigned */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Programs Assigned
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {programsCount} Active
            </h3>
          </div>
        </div>

        {/* Metric 4: Sessions Completed */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full"
                style={{ width: `${Math.min(100, (sessionsCompleted / (sessionsTotal || 1)) * 100)}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Sessions Completed
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {sessionsCompleted} / {sessionsTotal}
            </h3>
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

      {/* 5. Main Content Grid */}
      {activeTab === 'Overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Current Treatment Plan Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Current Treatment Plan
                </h3>
                <button
                  onClick={() => setActiveTab('Programs')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {assignedPrograms.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900">
                          {assignedPrograms[0].programTitle}
                        </h4>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                          Assigned therapist: {(assignedPrograms[0] as any).therapistName || therapistName}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-blue-600 whitespace-nowrap">
                      {assignedPrograms[0].progressPercent || 0}% Progress
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${assignedPrograms[0].progressPercent || 0}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        STATUS
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 block uppercase">
                        {assignedPrograms[0].status || 'Active'}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        DURATION
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 block">
                        {assignedPrograms[0].totalWeeks || 8} Weeks Plan
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-600">No active treatment plan assigned.</p>
                  <button
                    onClick={() => setActiveTab('Programs')}
                    className="text-xs text-blue-600 hover:underline font-bold"
                  >
                    + Assign Program
                  </button>
                </div>
              )}
            </div>

            {/* 2. Recovery Goals Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Recovery Goals
                </h3>
                <button
                  onClick={() => setIsAddGoalModalOpen(true)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Add Goal"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Goal List */}
              <div className="space-y-3">
                {patient.goals && patient.goals.length > 0 ? (
                  patient.goals.map((goal) => (
                    <div
                      key={goal.id}
                      onClick={() => handleToggleGoal(goal.id)}
                      className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0 pr-2">
                        {goal.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 group-hover:text-slate-400 flex-shrink-0" />
                        )}
                        <span
                          className={`text-xs sm:text-sm font-semibold truncate ${
                            goal.completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {goal.text}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider whitespace-nowrap ${
                          goal.category === 'SHORT TERM'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-indigo-50 text-indigo-600'
                        }`}
                      >
                        {goal.category}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No recovery goals recorded yet. Click + to add one.</p>
                )}
              </div>
            </div>

            {/* 3. Recent Reports Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Recent Reports
                </h3>
                <button
                  onClick={() => setActiveTab('Reports')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {reports.length > 0 ? (
                  reports.slice(0, 3).map((rep) => (
                    <div key={rep.id} className="flex items-center justify-between p-4 bg-slate-50/60 rounded-2xl border border-slate-100">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{rep.title || rep.name}</h4>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {rep.date} • {rep.size}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => showToast(`Downloading ${rep.title || rep.name}...`)}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                        title="Download Report"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No reports available.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* 1. Upcoming Appointments Card */}
            <div className="self-stretch p-6 relative bg-white/70 rounded-3xl outline outline-1 outline-offset-[-1px] outline-white/40 backdrop-blur-[10px] flex flex-col justify-start items-start gap-4 shadow-[0px_4px_24px_-1px_rgba(0,0,0,0.03)]">
              <div className="self-stretch flex items-center justify-between">
                <div className="text-slate-900 text-base font-bold font-['Inter'] leading-6">
                  Upcoming Appointments
                </div>
                <button
                  onClick={() => setIsBookApptModalOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  + Book
                </button>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                {upcomingAppointmentsList.length > 0 ? (
                  upcomingAppointmentsList.map((appt, idx) => (
                    <div
                      key={appt.id || idx}
                      className={`self-stretch p-4 relative rounded-2xl flex flex-col justify-start items-start gap-1 shadow-xs ${
                        idx === 0 ? 'bg-blue-900 text-white' : 'bg-indigo-50/70 border border-slate-200 text-slate-900'
                      }`}
                    >
                      <div className="self-stretch inline-flex justify-between items-start">
                        <div className={`text-xs font-bold uppercase tracking-wider ${idx === 0 ? 'opacity-80 text-white' : 'text-indigo-900'}`}>
                          {idx === 0 ? 'NEXT SESSION' : 'UPCOMING'}
                        </div>
                      </div>
                      <div className="self-stretch pt-2 flex flex-col justify-start items-start">
                        <div className={`text-base font-bold leading-6 ${idx === 0 ? 'text-white' : 'text-slate-900'}`}>
                          {appt.fullDate || appt.date}
                        </div>
                      </div>
                      <div className="self-stretch pb-2 inline-flex justify-start items-center gap-1.5">
                        <Clock className={`w-3.5 h-3.5 ${idx === 0 ? 'text-white' : 'text-slate-500'}`} />
                        <div className={`text-xs font-normal leading-4 ${idx === 0 ? 'text-white' : 'text-slate-600'}`}>
                          {appt.timeSlot || appt.time} • {appt.service || appt.type || 'Session'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No upcoming appointments scheduled.</p>
                )}
              </div>
            </div>

            {/* 2. Clinical Notes Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Clinical Notes
                </h3>
                <button
                  onClick={() => setActiveTab('Notes')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {clinicalNotesList.length > 0 ? (
                  clinicalNotesList.slice(0, 2).map((cn) => (
                    <div key={cn.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3">
                      <p className="text-xs italic text-slate-700 font-medium leading-relaxed">
                        "{cn.content || cn.text}"
                      </p>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                        <span>{cn.date}</span>
                        <span>{cn.author || cn.doctorName}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No clinical notes recorded yet.</p>
                )}
              </div>
            </div>

            {/* 3. Quick Actions Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Quick Actions</h3>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('Programs')}
                  className="w-full flex items-center space-x-3 p-3.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer text-left"
                >
                  <UserPlus className="w-4 h-4 text-slate-500" />
                  <span>Assign Program</span>
                </button>

                <button
                  onClick={() => setActiveTab('Reports')}
                  className="w-full flex items-center space-x-3 p-3.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer text-left"
                >
                  <UploadCloud className="w-4 h-4 text-slate-500" />
                  <span>Upload Report</span>
                </button>

                <button
                  onClick={() => setActiveTab('Payments')}
                  className="w-full flex items-center space-x-3 p-3.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer text-left"
                >
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <span>Payments & Billing</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'Medical History' ? (
        <MedicalHistoryTab
          patientName={patientName}
          patient={patient}
          medicalHistoryList={medicalHistoryList}
          onAddMedicalHistory={addMedicalHistory}
        />
      ) : activeTab === 'Programs' ? (
        <ProgramsTab
          patientName={patientName}
          therapistName={therapistName}
          patient={patient}
          assignedPrograms={assignedPrograms}
          onAssignProgram={assignProgram}
        />
      ) : activeTab === 'Progress' ? (
        <ProgressTab
          patientName={patientName}
          therapistName={therapistName}
          patient={patient}
          assignedPrograms={assignedPrograms}
          progressRecords={progressRecords}
          onAddProgress={addProgress}
        />
      ) : activeTab === 'Reports' ? (
        <ReportsTab
          patientName={patientName}
          therapistName={therapistName}
          patient={patient}
          reports={reports}
          onUploadReport={uploadReport}
        />
      ) : activeTab === 'Payments' ? (
        <PaymentsTab
          patientName={patientName}
          therapistName={therapistName}
          patient={patient}
          payments={payments}
          invoices={invoices}
        />
      ) : activeTab === 'Notes' ? (
        <NotesTab
          patientName={patientName}
          therapistName={therapistName}
          patient={patient}
          notesList={clinicalNotesList}
          onAddNote={addClinicalNote}
          onDeleteNote={removeClinicalNote}
        />
      ) : activeTab === 'History' ? (
        <HistoryTab
          patientName={patientName}
          therapistName={therapistName}
          patient={patient}
          activityLogs={activityLogs}
          onAddActivityLog={logActivity}
        />
      ) : null}

      {/* Edit Patient Profile Modal */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">Edit Patient Profile</h3>
              <button onClick={() => setIsEditProfileModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProfileSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Gender</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Primary Condition</label>
                <input
                  type="text"
                  value={editCondition}
                  onChange={(e) => setEditCondition(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Assigned Therapist</label>
                <input
                  type="text"
                  value={editTherapist}
                  onChange={(e) => setEditTherapist(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {isBookApptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">Schedule Appointment</h3>
              <button onClick={() => setIsBookApptModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookAppointmentSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Appointment Date *</label>
                <input
                  type="date"
                  value={apptDate}
                  onChange={(e) => setApptDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Time Slot</label>
                  <select
                    value={apptTime}
                    onChange={(e) => setApptTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:15 PM">04:15 PM</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Service Type</label>
                  <select
                    value={apptType}
                    onChange={(e) => setApptType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Physiotherapy Session">Physiotherapy Session</option>
                    <option value="Rehab Evaluation">Rehab Evaluation</option>
                    <option value="Video Call Consult">Video Call Consult</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Therapist Name</label>
                <input
                  type="text"
                  value={apptTherapist}
                  onChange={(e) => setApptTherapist(e.target.value)}
                  placeholder="e.g. Dr. Ananya Iyer"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBookApptModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0C3E6D] hover:bg-[#092e52] rounded-xl cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {isSaving ? 'Scheduling...' : 'Save Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-extrabold text-slate-900">Add Recovery Goal</h3>

            <form onSubmit={handleAddGoalSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Goal Description
                </label>
                <input
                  type="text"
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  placeholder="e.g., Hold plank for 60 seconds without discomfort"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  value={newGoalCategory}
                  onChange={(e) =>
                    setNewGoalCategory(e.target.value as 'SHORT TERM' | 'LONG TERM')
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SHORT TERM">SHORT TERM</option>
                  <option value="LONG TERM">LONG TERM</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
                >
                  Add Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Patient Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Delete Patient Record?</h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                Are you sure you want to permanently delete the patient record for <strong className="text-slate-900">{patientName}</strong> ({patient.patientId})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deletePatientRecord(patient.id);
                    setIsDeleteModalOpen(false);
                    if (onBack) onBack();
                  } catch (e: any) {
                    showToast(e.message || 'Failed to delete patient record.');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfilePage;
