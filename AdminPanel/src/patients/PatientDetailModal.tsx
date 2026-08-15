import React from 'react';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { X, Phone, Mail, Calendar, Activity, FileText, CheckCircle2 } from 'lucide-react';
import type { Patient } from './types';


interface PatientDetailModalProps {
  patient: Patient | null;
  onClose: () => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({ patient, onClose }) => {
  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drawer Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold font-mono text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/50">
              {patient.patientId}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                patient.status === 'Active Treatment'
                  ? 'bg-teal-50 text-teal-700 border border-teal-100'
                  : patient.status === 'Recovered'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {patient.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Profile Card Header */}
          <div className="flex items-center space-x-4">
            <InitialsAvatar name={patient.name} className="w-16 h-16 text-xl font-bold shrink-0" />
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">{patient.name}</h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                {patient.age} Yrs • {patient.gender}
              </p>
              <p className="text-xs text-slate-400 mt-1">Patient registered: {patient.joinedDate || 'Aug 2023'}</p>
            </div>
          </div>

          {/* Recovery Score Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Recovery Score Progress</span>
              </span>
              <span className="text-lg font-extrabold text-blue-600">{patient.recoveryScore}%</span>
            </div>

            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${patient.recoveryScore}%` }}
              />
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Target goal is 90%+. Currently performing home exercises and weekly supervised therapy.
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Condition */}
            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Clinical Condition
              </span>
              <span className="text-sm font-bold text-slate-800">{patient.condition}</span>
            </div>

            {/* Assigned Therapist */}
            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Therapist
              </span>
              <div className="flex items-center space-x-2">
                <InitialsAvatar name={patient.therapistName} className="w-5 h-5 text-[9px] font-bold shrink-0" />
                <span className="text-sm font-bold text-slate-800 truncate">{patient.therapistName}</span>
              </div>
            </div>

            {/* Next Appointment */}
            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-2xs col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Next Scheduled Session</span>
              </span>
              <span className="text-sm font-bold text-slate-900">
                {patient.nextAppointmentDate} at {patient.nextAppointmentTime}
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact Information</h4>
            <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-2.5">
              <div className="flex items-center space-x-3 text-sm text-slate-700 font-medium">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{patient.phone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-700 font-medium">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{patient.email || 'patient@example.com'}</span>
              </div>
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Recent Clinical Notes</span>
            </h4>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600 leading-relaxed font-medium">
              {patient.notes || 'No extra clinical notes recorded.'}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center space-x-3">
          <button
            onClick={() => alert(`Calling ${patient.name}...`)}
            className="flex-1 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Call Patient</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
