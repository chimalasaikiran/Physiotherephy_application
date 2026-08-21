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
  DollarSign,
  Video,
  Home,
  Building2,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { updateScheduleStatusRecord, markCashAsPaidRecord, deleteScheduleRecord } from '@/services/scheduleService';
import { ProcessRefundModal, type ProcessRefundModalTarget } from '@/payments/components/ProcessRefundModal';
import { formatAppointmentTypeLabel } from '@/utils/appointmentUtils';

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

  const [sessionStatus, setSessionStatus] = useState<string>(
    appointment?.status || appointment?.appointmentStatus || 'Confirmed'
  );
  const [paymentStatus, setPaymentStatus] = useState<string>(
    appointment?.paymentStatus || (appointment?.paymentMethod === 'CASH' ? 'PENDING' : 'PAID')
  );
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [newDate, setNewDate] = useState('2026-08-20');
  const [newTime, setNewTime] = useState('02:00 PM');

  useEffect(() => {
    if (appointment?.status || appointment?.appointmentStatus) {
      setSessionStatus(appointment.status || appointment.appointmentStatus);
    }
    if (appointment?.paymentStatus) {
      setPaymentStatus(appointment.paymentStatus);
    }
  }, [appointment]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleStartSession = async () => {
    let newSt: 'In Progress' | 'Completed' = 'In Progress';
    if (sessionStatus === 'Confirmed' || sessionStatus === 'CONFIRMED' || sessionStatus === 'Scheduled') {
      newSt = 'In Progress';
      setSessionStatus('In Progress');
      triggerToast('Session started successfully! Timer is now active.');
    } else if (sessionStatus === 'In Progress' || sessionStatus === 'IN_PROGRESS') {
      newSt = 'Completed';
      setSessionStatus('Completed');
      triggerToast('Session completed and recorded into patient history.');
    }
    if (appointment?.id) {
      await updateScheduleStatusRecord(appointment.id, newSt);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!appointment?.id) return;
    try {
      await markCashAsPaidRecord(appointment.id, 'Clinic Admin');
      setPaymentStatus('PAID');
      triggerToast('Cash payment collected & marked as PAID successfully!');
    } catch (err: any) {
      triggerToast(err.message || 'Failed to mark cash payment as paid.');
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
    triggerToast('Appointment cancelled. Audit trail updated.');
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

  const refundTarget: ProcessRefundModalTarget = {
    paymentId: appointment?.paymentId || appointment?.id,
    appointmentId: appointment?.id,
    bookingId: appointment?.id,
    patientId: appointment?.patientId || appointment?.userId,
    patientName: appointment?.patientName || 'Sanya Malhotra',
    therapistName: appointment?.therapistName || 'Dr. Arjun Mehta',
    appointmentDate: appointment?.date || appointment?.fullDate || 'Oct 23, 2026',
    appointmentTime: appointment?.time || appointment?.timeSlot || '01:45 PM',
    sessionType: appointment?.type || 'Clinic Visit',
    originalAmount: Number(appointment?.amount || appointment?.pricing?.totalAmount || 1500),
    refundedAmount: Number(appointment?.refundedAmount || 0),
    remainingRefundableAmount: Number(appointment?.remainingRefundableAmount ?? Number(appointment?.amount || appointment?.pricing?.totalAmount || 1500)),
    paymentMethod: appointment?.paymentMethod || 'ONLINE',
    transactionId: appointment?.transactionId || `TXN-${appointment?.id?.slice(0, 6) || '1024'}`,
    cancellationReason: 'Patient requested cancellation',
  };

  const handleDownloadPdf = () => {
    triggerToast('Downloading Medical_Report_Scan.pdf...');
  };

  const handleSendReminder = () => {
    triggerToast(`SMS and Email reminder sent to ${appointment?.patientName || 'Patient'}`);
  };

  // Pricing values
  const pricing = appointment?.pricing || {
    baseAmount: appointment?.sessionFee || 1500,
    visitFee: appointment?.facilityCharges || 0,
    travelFee: 0,
    discount: appointment?.insuranceCoverage || 0,
    tax: 0,
    totalAmount: appointment?.amount || appointment?.totalPayable || 1500,
  };

  const isCashPending = (appointment?.paymentMethod === 'CASH' || appointment?.paymentMode === 'clinic') && paymentStatus.toUpperCase() === 'PENDING';

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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-800 text-xs font-bold rounded-full border border-sky-200">
                {sessionStatus}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${
                paymentStatus.toUpperCase() === 'PAID'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}>
                Payment: {appointment?.paymentMethod || 'CASH'} • {paymentStatus}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500">
              View booking information, session details, financial pricing breakdown, and quick actions.
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {isCashPending && (
              <button
                onClick={handleMarkAsPaid}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                Mark Cash as Paid
              </button>
            )}

            {(sessionStatus === 'Cancelled' || sessionStatus === 'CANCELLED') && (
              <button
                onClick={() => setShowRefundModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Process Refund
              </button>
            )}

            <button
              onClick={() => onNavigateToReschedule ? onNavigateToReschedule() : setShowRescheduleModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              Reschedule
            </button>

            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-amber-700 hover:text-amber-800 hover:bg-amber-50/80 text-sm font-semibold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete Record
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
        {/* Left Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Appointment & Location Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs relative overflow-hidden space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Appointment Information
              </h2>
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                {formatAppointmentTypeLabel(appointment?.type)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4">
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  APPOINTMENT ID
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
                  {appointment ? `#APT-${appointment.id.slice(0, 8)}` : '#APT-1024'}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  TYPE
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  {appointment?.type || 'Clinic Visit'}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  DATE & TIME
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  {appointment?.date || 'Today'} • {appointment?.time || '10:00 AM'}
                </span>
              </div>
            </div>

            {/* LOCATION OR ONLINE MEETING BREAKDOWN */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                LOCATION / SESSION LINK
              </span>
              {appointment?.type === 'Online' || appointment?.location?.type === 'ONLINE' ? (
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2">
                  <div className="flex items-center space-x-2 text-purple-900 font-bold text-sm">
                    <Video className="w-4 h-4 text-purple-700" />
                    <span>Tele-Health Online Video Session</span>
                  </div>
                  <div className="text-xs text-purple-800 font-mono break-all">
                    URL: <a href={appointment?.location?.meetingUrl || '#'} target="_blank" rel="noreferrer" className="underline font-bold">{appointment?.location?.meetingUrl || 'https://meet.physioadmin.com/room-session'}</a>
                  </div>
                </div>
              ) : appointment?.type === 'Home Visit' || appointment?.location?.type === 'HOME_VISIT' ? (
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 space-y-1">
                  <div className="flex items-center space-x-2 text-teal-900 font-bold text-sm">
                    <span>Patient Home Location</span>
                  </div>
                  <p className="text-xs font-semibold text-teal-800">
                    {appointment?.location?.address || '123 Primary Resident Address, Bengaluru'}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-100 space-y-1">
                  <div className="flex items-center space-x-2 text-cyan-900 font-bold text-sm">
                    <span>Spine & Wellness Center Clinic</span>
                  </div>
                  <p className="text-xs font-semibold text-cyan-800">
                    One Medical Hub, Ground Floor, MG Road, Bengaluru
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Patient & Therapist Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Patient & Therapist
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <InitialsAvatar name={appointment?.patientName || 'Patient'} className="w-12 h-12 text-sm font-bold shrink-0" />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{appointment?.patientName || 'Patient'}</h4>
                  <p className="text-xs font-medium text-slate-500">{appointment?.patientSubtitle || 'General Rehab'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <InitialsAvatar name={appointment?.therapistName || 'Dr. Arjun Mehta'} className="w-12 h-12 text-sm font-bold shrink-0" />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{appointment?.therapistName || 'Dr. Arjun Mehta'}</h4>
                  <p className="text-xs font-medium text-slate-500">{appointment?.therapistSubtitle || 'Physiotherapist'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Financial Pricing Breakdown */}
          <div className="bg-blue-50/30 rounded-3xl p-6 sm:p-7 border border-blue-100/70 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-blue-950 tracking-wider uppercase">
                FINANCIAL PRICING BREAKDOWN
              </h3>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                paymentStatus.toUpperCase() === 'PAID'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}>
                {appointment?.paymentMethod || 'CASH'} • {paymentStatus}
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-600">
                <span>Base Session Amount</span>
                <span className="text-slate-900 font-extrabold">₹{Number(pricing.baseAmount || 1500).toLocaleString('en-IN')}</span>
              </div>

              {appointment?.type === 'Home Visit' && (
                <>
                  <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-600">
                    <span>Home Visit Fee</span>
                    <span className="text-slate-900 font-extrabold">₹{Number(pricing.visitFee || 300).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-600">
                    <span>Travel / Distance Fee</span>
                    <span className="text-slate-900 font-extrabold">₹{Number(pricing.travelFee || 200).toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}

              {pricing.discount > 0 && (
                <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
                  <span className="text-slate-600">Discount</span>
                  <span className="text-emerald-600 font-extrabold">-₹{Number(pricing.discount).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-600">
                <span>Tax</span>
                <span className="text-slate-900 font-extrabold">₹{Number(pricing.tax || 0).toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-3 border-t border-blue-100 flex justify-between items-center">
                <span className="text-sm font-extrabold text-slate-900">Total Amount Payable</span>
                <span className="text-lg sm:text-xl font-black text-blue-900 tracking-tight">
                  ₹{Number(pricing.totalAmount || appointment?.amount || 1500).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* Card 1: QUICK ACTIONS */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              QUICK ACTIONS
            </h3>

            <div className="space-y-3">
              {isCashPending && (
                <button
                  onClick={handleMarkAsPaid}
                  className="w-full flex items-center justify-start gap-3.5 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all cursor-pointer shadow-md"
                >
                  <DollarSign className="w-4 h-4" />
                  Mark Cash as Paid
                </button>
              )}

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
                onClick={() => setShowCancelModal(true)}
                className="w-full flex items-center justify-start gap-3.5 px-5 py-3 rounded-2xl border border-slate-200/90 bg-white hover:bg-rose-50/60 text-rose-600 text-sm font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <XCircle className="w-4 h-4 text-rose-500" />
                Cancel Appointment
              </button>
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
                Are you sure you want to cancel this appointment for {appointment?.patientName || 'Patient'}? Cancellation policy rules will be evaluated automatically.
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

      {/* Process Refund Modal */}
      {showRefundModal && (
        <ProcessRefundModal
          target={refundTarget}
          isOpen={showRefundModal}
          onClose={() => setShowRefundModal(false)}
          onSuccess={() => triggerToast('Refund processed successfully!')}
        />
      )}
      {/* Delete Record Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Delete Appointment Record?
              </h3>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Are you sure you want to permanently delete the appointment record for <strong className="text-slate-900">{appointment?.patientName || 'Patient'}</strong>? The booked slot will be freed in Firestore.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Keep Record
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    if (appointment?.id) {
                      await deleteScheduleRecord(
                        appointment.id,
                        appointment.doctorId || appointment.therapistId,
                        appointment.fullDate,
                        appointment.timeSlot || appointment.time
                      );
                    }
                    setShowDeleteModal(false);
                    if (onBack) onBack();
                  } catch (e: any) {
                    triggerToast(e.message || 'Failed to delete appointment record.');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
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

export default AppointmentDetailsPage;
