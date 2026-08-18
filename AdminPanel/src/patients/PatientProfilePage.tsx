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
  MoreVertical,
  CheckCircle2,
  Circle,
  FileText,
  UserPlus,
  UploadCloud,
  CreditCard,
  Flag,
  TrendingUp,
  Zap,
  ClipboardList,
  CheckCircle,
  Video,
  ArrowLeft,
} from 'lucide-react';
import type { Patient, PatientGoal } from './types';
import { addGoalToPatient, toggleGoalStatus, addClinicalNoteToPatient } from '@/services/patientService';
import { usePatientProfileData } from './usePatientProfileData';
import { MedicalHistoryTab } from './MedicalHistoryTab';
import { ProgramsTab } from './ProgramsTab';
import { ProgressTab } from './ProgressTab';
import { ReportsTab } from './ReportsTab';
import { PaymentsTab } from './PaymentsTab';
import { NotesTab } from './NotesTab';
import { HistoryTab } from './HistoryTab';

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
    computedMetrics,
    uploadReport,
    assignProgram,
  } = usePatientProfileData(initialPatient);

  const patientName = patient.name || 'Unnamed Patient';
  const patientAge = patient.age || 30;
  const patientGender = patient.gender || 'Male';
  const patientAvatar =
    patient.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
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

  // New goal input modal state
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
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
                {patient.bloodGroup && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-blue-600 font-bold">Blood Group: {patient.bloodGroup}</span>
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
              onClick={() => showToast('Edit Profile dialog opened.')}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              Edit Profile
            </button>
            <button
              onClick={() => showToast('Book Appointment dialog opened.')}
              className="px-6 py-2.5 bg-[#0C3E6D] hover:bg-[#092e52] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Book Appointment
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
                  onClick={() => showToast('Viewing treatment plan details')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Treatment Plan Inner Banner */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">
                        {patient.treatmentPlan?.title || `${patientCondition} Protocol`}
                      </h4>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        {patient.treatmentPlan?.subtitle ||
                          'Targeted physical rehab and progressive mobility exercise program.'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-blue-600 whitespace-nowrap">
                    {patient.treatmentPlan?.progress || recoveryScore}% Progress
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${patient.treatmentPlan?.progress || recoveryScore}%` }}
                  />
                </div>

                {/* Two Pill Details Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      FREQUENCY
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 block">
                      {patient.treatmentPlan?.frequency || '3x per week'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      DURATION
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 block">
                      {patient.treatmentPlan?.duration || '8 Weeks Plan'}
                    </span>
                  </div>
                </div>
              </div>
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
                {patient.reports && patient.reports.length > 0 ? (
                  patient.reports.map((rep) => (
                    <div key={rep.id} className="flex items-center justify-between p-4 bg-slate-50/60 rounded-2xl border border-slate-100">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{rep.title}</h4>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {rep.date} • {rep.size}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => showToast(`Downloading ${rep.title}...`)}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                        title="Download Report"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No reports uploaded yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* 1. Upcoming Appointments Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Upcoming Appointments
              </h3>

              <div className="space-y-3">
                {/* Active Next Session Card */}
                <div className="bg-[#0C3E6D] text-white rounded-3xl p-5 space-y-4 shadow-md">
                  <div className="flex items-center justify-between text-[11px] font-extrabold tracking-wider uppercase opacity-80">
                    <span>NEXT SESSION</span>
                    <button
                      onClick={() => showToast('Appointment options')}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-lg font-extrabold text-white">{nextApptDate}</h4>
                    <p className="text-xs text-blue-100 flex items-center space-x-1.5 mt-1 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{nextApptTime}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/15 flex items-center space-x-3">
                    <InitialsAvatar name={therapistName} className="w-8 h-8 text-xs font-bold border border-white/30 shrink-0" />
                    <span className="text-xs font-bold text-white">{therapistName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Clinical Notes Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Clinical Notes
                </h3>
                <button
                  onClick={() => showToast('Add note dialog opened.')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Add Note
                </button>
              </div>

              <div className="space-y-4">
                {patient.clinicalNotes && patient.clinicalNotes.length > 0 ? (
                  patient.clinicalNotes.map((cn) => (
                    <div key={cn.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3">
                      <p className="text-xs italic text-slate-700 font-medium leading-relaxed">
                        "{cn.text}"
                      </p>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                        <span>{cn.date}</span>
                        <span>{cn.doctorName}</span>
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
                  onClick={() => showToast('Assign Program clicked')}
                  className="w-full flex items-center space-x-3 p-3.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer text-left"
                >
                  <UserPlus className="w-4 h-4 text-slate-500" />
                  <span>Assign Program</span>
                </button>

                <button
                  onClick={() => showToast('Upload Report clicked')}
                  className="w-full flex items-center space-x-3 p-3.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer text-left"
                >
                  <UploadCloud className="w-4 h-4 text-slate-500" />
                  <span>Upload Report</span>
                </button>

                <button
                  onClick={() => showToast('New Bill clicked')}
                  className="w-full flex items-center space-x-3 p-3.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer text-left"
                >
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <span>New Bill</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'Medical History' ? (
        <MedicalHistoryTab patientName={patientName} patient={patient} />
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
        <NotesTab patientName={patientName} therapistName={therapistName} patient={patient} />
      ) : activeTab === 'History' ? (
        <HistoryTab patientName={patientName} therapistName={therapistName} patient={patient} />
      ) : null}

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
    </div>
  );
};

export default PatientProfilePage;
