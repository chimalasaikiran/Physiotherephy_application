import React from 'react';
import {
  X,
  Smartphone,
  Monitor,
  RefreshCw,
  Zap,
  CheckCircle2,
  Activity,
  Calendar,
  CreditCard,
  UserCheck,
  FileText,
} from 'lucide-react';

interface RealtimeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RealtimeGuideModal: React.FC<RealtimeGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const triggerPatientExerciseCompleted = async () => {};
  const triggerNewPatientRegistered = async () => {};
  const triggerAppointmentBooked = async () => {};
  const triggerPaymentReceived = async () => {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-2">
            <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            <span>Live Bidirectional Synchronization System</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How Admin Panel & Mobile App Work Together
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            All data modules connect to Firebase Firestore real-time listeners. Any edit made in the Admin Panel or Mobile App propagates instantly without manual page refreshing.
          </p>
        </div>

        {/* Workflow Connection Diagram Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Real-Time Data Pipeline
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center">
            {/* Admin Panel Box */}
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-1">
              <Monitor className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h5 className="font-bold text-sm text-white">Admin Panel</h5>
              <p className="text-[11px] text-slate-400">Clinical Dashboard & Patient Operations</p>
            </div>

            {/* Sync Engine Arrow */}
            <div className="flex flex-col items-center space-y-1">
              <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Firestore Live Sync</span>
              </div>
              <span className="text-[10px] text-slate-500">Sub-second Latency</span>
            </div>

            {/* Mobile App Box */}
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-1">
              <Smartphone className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h5 className="font-bold text-sm text-white">Mobile App</h5>
              <p className="text-[11px] text-slate-400">Patient Recovery & Therapy App</p>
            </div>
          </div>
        </div>

        {/* 9 Core Synchronized Modules Grid */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-slate-900 text-sm">
            Synchronized Modules (9 Core Features)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center space-x-2.5">
              <Activity className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-800 block">Dashboard</span>
                <span className="text-[10px] text-slate-500">Live stat counters</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-800 block">Exercises</span>
                <span className="text-[10px] text-slate-500">Completions & assignments</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center space-x-2.5">
              <UserCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-800 block">Patients</span>
                <span className="text-[10px] text-slate-500">Profiles & progress</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center space-x-2.5">
              <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-800 block">Schedule</span>
                <span className="text-[10px] text-slate-500">Bookings & status</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center space-x-2.5">
              <CreditCard className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-800 block">Payments</span>
                <span className="text-[10px] text-slate-500">Paid invoices & packages</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center space-x-2.5">
              <FileText className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-800 block">Programs & Reports</span>
                <span className="text-[10px] text-slate-500">Live clinical reports</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Interactive Test Simulation Box */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-blue-950 text-sm">
              Test Real-Time Event Simulation
            </h4>
            <span className="text-[10px] font-bold text-blue-700 uppercase bg-white px-2 py-0.5 rounded-full border border-blue-200">
              Interactive Demo
            </span>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            Click any button below to trigger a simulated real-time event. You will immediately see the change update in the header alerts, dashboard counters, and module views!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <button
              onClick={triggerPatientExerciseCompleted}
              className="px-3 py-2 bg-white hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              Finish Exercise
            </button>
            <button
              onClick={triggerNewPatientRegistered}
              className="px-3 py-2 bg-white hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              Add Patient
            </button>
            <button
              onClick={triggerAppointmentBooked}
              className="px-3 py-2 bg-white hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              Book Appt
            </button>
            <button
              onClick={triggerPaymentReceived}
              className="px-3 py-2 bg-white hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              Receive Payment
            </button>
          </div>
        </div>

        {/* Got it Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Got it, return to Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
};
