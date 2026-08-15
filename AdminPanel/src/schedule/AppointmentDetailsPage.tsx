import React, { useState, useEffect } from 'react';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Info,
  Play,
  FileText,
  Download,
  Bell,
  XCircle,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  ArrowLeft,
  Share2,
} from 'lucide-react';

import { updateScheduleStatusRecord } from '@/services/scheduleService';

interface AppointmentDetailsPageProps {
  appointment?: any;
  onBack?: () => void;
  onNavigateToPatient?: () => void;
  onNavigateToTherapist?: () => void;
  onNavigateToReschedule?: () => void;
}

export const AppointmentDetailsPage: React.FC<AppointmentDetailsPageProps> = ({
  appointment,
  onBack,
  onNavigateToPatient,
  onNavigateToTherapist,
  onNavigateToReschedule,
}) => {

  // Local states for interactivity
  const [sessionStatus, setSessionStatus] = useState<'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled'>(
    appointment?.status || 'Confirmed'
  );
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for reschedule
  const [newDate, setNewDate] = useState('2026-08-20');
  const [newTime, setNewTime] = useState('02:00 PM');

  // Sync sessionStatus with appointment prop changes
  useEffect(() => {
    if (appointment?.status) {
      setSessionStatus(appointment.status);
    }
  }, [appointment]);

  // Trigger toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleStartSession = async () => {
    let newSt: 'In Progress' | 'Completed' = 'In Progress';
    if (sessionStatus === 'Confirmed') {
      newSt = 'In Progress';
      setSessionStatus('In Progress');
      triggerToast('Session started successfully! Timer is now active.');
    } else if (sessionStatus === 'In Progress') {
      newSt = 'Completed';
      setSessionStatus('Completed');
      triggerToast('Session completed and recorded into patient history.');
    }
    if (appointment?.id) {
      await updateScheduleStatusRecord(appointment.id, newSt);
    }
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowRescheduleModal(false);
    triggerToast(`Appointment rescheduled to ${newDate} at ${newTime}`);
  };

  const handleCancelConfirm = async () => {
    setSessionStatus('Cancelled');
    setShowCancelModal(false);
    triggerToast('Appointment has been cancelled.');
    if (appointment?.id) {
      await updateScheduleStatusRecord(
        appointment.id,
        'Cancelled',
        appointment.therapistId || appointment.doctorId,
        appointment.fullDate,
        appointment.timeSlot || appointment.time
      );
    }
  };

  const handleDownloadPdf = () => {
    triggerToast('Downloading MRI_Scan_Knee_Oct.pdf...');
  };

  const handleSendReminder = () => {
    triggerToast(`SMS and Email reminder sent to ${appointment?.patientName || 'Patient'}`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Breadcrumb & Page Header */}
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-4 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Schedule
          </button>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Appointment Details
              </h1>
              {sessionStatus === 'Confirmed' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Confirmed
                </span>
              )}
              {sessionStatus === 'In Progress' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                  In Progress
                </span>
              )}
              {sessionStatus === 'Completed' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Completed
                </span>
              )}
              {sessionStatus === 'Cancelled' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full border border-rose-200">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Cancelled
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-500">
              View booking information, session details and actions.
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onNavigateToReschedule ? onNavigateToReschedule() : setShowRescheduleModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              Reschedule
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 text-sm font-semibold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleStartSession}
              disabled={sessionStatus === 'Cancelled' || sessionStatus === 'Completed'}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer ${
                sessionStatus === 'In Progress'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : sessionStatus === 'Completed' || sessionStatus === 'Cancelled'
                  ? 'bg-slate-300 text-slate-500 shadow-none cursor-not-allowed'
                  : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              {sessionStatus === 'In Progress' ? 'Complete Session' : 'Start Session'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Left Main Column (2 Spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Appointment Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Appointment Information
              </h2>
              <button
                onClick={() => triggerToast('Appointment details created on Oct 12, 2024 by Clinic Admin')}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Info"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4">
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  ID
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  {appointment ? `#APT-${appointment.id.slice(0, 6)}` : '#APT-1024'}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  SESSION TYPE
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  {appointment?.type || 'Clinic Visit'}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  DATE
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  {appointment?.date || 'Wednesday, Oct 23, 2024'}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  TIME
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  {appointment?.time || '01:45 PM'}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  DURATION
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  {appointment?.sessionDuration || '45 mins'}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  LOCATION
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  One Medical Hub, MG Road
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Patient Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Patient Information
              </h2>
              <button
                onClick={onNavigateToPatient}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                View Patient
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
              <InitialsAvatar
                name={appointment?.patientName || 'Sanya Malhotra'}
                className="w-20 h-20 text-xl font-bold shrink-0 shadow-sm border border-slate-100"
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 flex-1 w-full">
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    NAME
                  </span>
                  <span className="text-base font-extrabold text-slate-900 block leading-tight">
                    {appointment?.patientName || 'Sanya Malhotra'}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    CONDITION
                  </span>
                  <span className="text-sm font-bold text-slate-900 block leading-tight">
                    {appointment?.patientSubtitle || 'ACL Recovery'}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    RECOVERSCORE
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: '78%' }}
                      ></div>
                    </div>
                    <span className="text-sm font-extrabold text-slate-900">
                      78%
                    </span>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    CONTACT
                  </span>
                  <span className="text-sm font-bold text-slate-900 block leading-tight">
                    +919876543210
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Row 3: Two Cards (Therapist & Session Notes Preview) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Therapist Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Therapist
                  </h2>
                  <button
                    onClick={onNavigateToTherapist}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    View
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <InitialsAvatar
                    name={appointment?.therapistName || 'Dr. Arjun Mehta'}
                    className="w-14 h-14 text-base font-bold shrink-0 border border-slate-100 shadow-2xs"
                  />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {appointment?.therapistName || 'Dr. Arjun Mehta'}
                    </h3>
                    <p className="text-xs font-medium text-slate-500">
                      {appointment?.therapistSubtitle || 'Orthopedic Physiotherapy'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Indicator Bar */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl py-2.5 px-4 text-xs font-bold text-emerald-800 flex items-center justify-between">
                <span>Status: Available</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
              </div>
            </div>

            {/* Session Notes Preview Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-4">
                  Session Notes Preview
                </h2>

                {/* Previous Summary Box */}
                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 mb-3">
                  <span className="block text-xs font-bold text-slate-500 mb-1">
                    Previous Summary
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-2 leading-relaxed">
                    Patient shows improved range of motion in left knee. Extension increased by 12 degrees.
                  </p>
                </div>

                {/* PDF Attachment Item */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3 flex items-center justify-between group hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-900 truncate">
                        MRI_Scan_Knee_Oct.pdf
                      </span>
                      <span className="block text-[11px] font-medium text-slate-400">
                        2.4 MB • Uploaded Oct 16
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadPdf}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0 ml-2 cursor-pointer"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column (1 Span) */}
        <div className="space-y-6">
          {/* Card 1: Appointment Status Timeline */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-6">
              Appointment Status
            </h2>

            <div className="relative pl-6 space-y-6 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {/* Step 1: Booked */}
              <div className="relative">
                <span className="absolute -left-[24px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white ring-4 ring-blue-50 shadow-xs"></span>
                <div>
                  <span className="block text-sm font-bold text-slate-900">
                    Booked
                  </span>
                  <span className="block text-xs font-medium text-slate-400 mt-0.5">
                    Oct 12, 10:30 AM
                  </span>
                </div>
              </div>

              {/* Step 2: Confirmed */}
              <div className="relative">
                <span className="absolute -left-[24px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white ring-4 ring-blue-50 shadow-xs"></span>
                <div>
                  <span className="block text-sm font-bold text-slate-900">
                    Confirmed
                  </span>
                  <span className="block text-xs font-medium text-slate-400 mt-0.5">
                    Oct 12, 02:15 PM
                  </span>
                </div>
              </div>

              {/* Step 3: Reminder Sent */}
              <div className="relative">
                <span className="absolute -left-[24px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white ring-4 ring-blue-50 shadow-xs"></span>
                <div>
                  <span className="block text-sm font-bold text-slate-900">
                    Reminder Sent
                  </span>
                  <span className="block text-xs font-medium text-slate-400 mt-0.5">
                    Oct 22, 09:00 AM
                  </span>
                </div>
              </div>

              {/* Step 4: Session Started */}
              <div className="relative">
                <span
                  className={`absolute -left-[24px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                    sessionStatus === 'In Progress' || sessionStatus === 'Completed'
                      ? 'bg-blue-600 border-white ring-4 ring-blue-50'
                      : 'border-slate-300'
                  }`}
                ></span>
                <div>
                  <span
                    className={`block text-sm font-bold ${
                      sessionStatus === 'In Progress' || sessionStatus === 'Completed'
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    Session Started
                  </span>
                  <span className="block text-xs font-medium text-slate-400 mt-0.5">
                    Expected 01:45 PM
                  </span>
                </div>
              </div>

              {/* Step 5: Completed */}
              <div className="relative">
                <span
                  className={`absolute -left-[24px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                    sessionStatus === 'Completed'
                      ? 'bg-blue-600 border-white ring-4 ring-blue-50'
                      : 'border-slate-300'
                  }`}
                ></span>
                <div>
                  <span
                    className={`block text-sm font-bold ${
                      sessionStatus === 'Completed' ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    Completed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: QUICK ACTIONS */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              QUICK ACTIONS
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => onNavigateToReschedule ? onNavigateToReschedule() : setShowRescheduleModal(true)}
                className="w-full flex items-center justify-start gap-3.5 px-5 py-3 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <Calendar className="w-4 h-4 text-slate-500" />
                Reschedule
              </button>

              <button
                onClick={handleSendReminder}
                className="w-full flex items-center justify-start gap-3.5 px-5 py-3 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <Bell className="w-4 h-4 text-slate-500" />
                Send Reminder
              </button>

              <button
                onClick={() => setShowSummaryModal(true)}
                className="w-full flex items-center justify-start gap-3.5 px-5 py-3 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                Generate Summary
              </button>

              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full flex items-center justify-start gap-3.5 px-5 py-3 rounded-2xl border border-slate-200/90 bg-white hover:bg-rose-50/60 text-rose-600 text-sm font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <XCircle className="w-4 h-4 text-rose-500" />
                Cancel Appointment
              </button>
            </div>
          </div>

          {/* Card 3: RELATED SESSIONS */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              RELATED SESSIONS
            </h3>

            <div className="space-y-3">
              {/* Previous Session */}
              <div className="bg-blue-50/40 border border-blue-100/70 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
                    PREVIOUS
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100/90 text-emerald-700 text-[10px] font-extrabold rounded-md uppercase">
                    COMPLETED
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Oct 16, 2024
                </h4>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Follow-up Session
                </p>
              </div>

              {/* Next Session */}
              <div
                onClick={() => triggerToast('Navigating to upcoming session scheduled on Oct 30...')}
                className="bg-white border border-slate-200/80 hover:border-blue-300 rounded-2xl p-4 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
                    NEXT
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Oct 30, 2024
                </h4>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Routine Checkup
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">
                Reschedule Appointment
              </h3>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select New Time
                </label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="01:45 PM">01:45 PM</option>
                  <option value="03:15 PM">03:15 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Cancel Appointment?
              </h3>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Are you sure you want to cancel appointment #APT-1024 for Sanya Malhotra? This action will notify the patient and therapist.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancelConfirm}
                className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Yes, Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Generator Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  AI Clinical Summary
                </h3>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              <p>
                <strong>Patient:</strong> Sanya Malhotra (ACL Recovery)
              </p>
              <p>
                <strong>Date:</strong> Oct 23, 2024 | <strong>Therapist:</strong> Dr. Arjun Mehta
              </p>
              <hr className="border-slate-200 my-2" />
              <p>
                Patient demonstrates steady progression with ACL rehabilitation. Flexion range has reached 115 degrees with minimal discomfort. Quadriceps strength index is currently at 78%. Recommended continuing hamstring curls and progressive weight loading for upcoming 2 weeks.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  triggerToast('Clinical summary copied to clipboard!');
                }}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Copy Text
              </button>
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  triggerToast('Clinical summary saved to patient medical records.');
                }}
                className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save to Medical Chart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentDetailsPage;
