import React, { useState } from 'react';
import { MoreVertical, Eye, Clock, XCircle } from 'lucide-react';

interface Appointment {
  id: string;
  patientName: string;
  avatarInitials: string;
  avatarBg: string;
  therapistName: string;
  type: string;
  typeBg: string;
  typeColor: string;
  status: 'Confirmed' | 'In Progress' | 'Completed';
  statusColor: string;
  dotColor: string;
  time: string;
}

interface RecentAppointmentsTableProps {
  onSelectSession?: () => void;
}

export const RecentAppointmentsTable: React.FC<RecentAppointmentsTableProps> = ({
  onSelectSession,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const appointments: Appointment[] = [
    {
      id: 'apt-1',
      patientName: 'Arjun Reddy',
      avatarInitials: 'AR',
      avatarBg: 'bg-blue-100 text-blue-700',
      therapistName: 'Dr. Emily Watson',
      type: 'Physiotherapy',
      typeBg: 'bg-purple-50',
      typeColor: 'text-purple-700',
      status: 'Confirmed',
      statusColor: 'text-slate-700',
      dotColor: 'bg-emerald-500',
      time: '10:30 AM',
    },
    {
      id: 'apt-2',
      patientName: 'Sana Nair',
      avatarInitials: 'SN',
      avatarBg: 'bg-indigo-100 text-indigo-700',
      therapistName: 'Dr. Sarah Chen',
      type: 'Initial Consultation',
      typeBg: 'bg-blue-50',
      typeColor: 'text-blue-700',
      status: 'In Progress',
      statusColor: 'text-slate-700',
      dotColor: 'bg-blue-500',
      time: '09:15 AM',
    },
    {
      id: 'apt-3',
      patientName: 'Meera Kapoor',
      avatarInitials: 'MK',
      avatarBg: 'bg-teal-100 text-teal-700',
      therapistName: 'Dr. Alan Grant',
      type: 'Speech Therapy',
      typeBg: 'bg-teal-50',
      typeColor: 'text-teal-700',
      status: 'Completed',
      statusColor: 'text-slate-700',
      dotColor: 'bg-slate-400',
      time: 'Yesterday',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-900">Recent Appointments</h3>
        <button className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">
          View All
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100 pb-3">
              <th className="py-3 px-2">Patient Name</th>
              <th className="py-3 px-2">Therapist</th>
              <th className="py-3 px-2">Type</th>
              <th className="py-3 px-2">Status</th>
              <th className="py-3 px-2">Time</th>
              <th className="py-3 px-2 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm font-medium">
            {appointments.map((apt) => (
              <tr
                key={apt.id}
                onClick={() => onSelectSession?.()}
                className="hover:bg-slate-50/60 transition-colors cursor-pointer"
              >
                {/* Patient Name with Avatar */}
                <td className="py-3.5 px-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${apt.avatarBg}`}
                    >
                      {apt.avatarInitials}
                    </div>
                    <span className="font-semibold text-slate-900">{apt.patientName}</span>
                  </div>
                </td>

                {/* Therapist */}
                <td className="py-3.5 px-2 text-slate-600 font-medium">
                  {apt.therapistName}
                </td>

                {/* Type */}
                <td className="py-3.5 px-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${apt.typeBg} ${apt.typeColor}`}
                  >
                    {apt.type}
                  </span>
                </td>

                {/* Status */}
                <td className="py-3.5 px-2">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${apt.dotColor}`} />
                    <span className={`text-xs font-semibold ${apt.statusColor}`}>
                      {apt.status}
                    </span>
                  </div>
                </td>

                {/* Time */}
                <td className="py-3.5 px-2 text-xs font-medium text-slate-500">
                  {apt.time}
                </td>

                {/* Actions Dropdown */}
                <td className="py-3.5 px-2 text-right relative">
                  <button
                    onClick={() =>
                      setActiveMenuId(activeMenuId === apt.id ? null : apt.id)
                    }
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuId === apt.id && (
                    <div className="absolute right-2 mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 text-left text-xs font-semibold text-slate-700">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(null);
                          onSelectSession?.();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-slate-50 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>View Details</span>
                      </button>
                      <button
                        onClick={() => setActiveMenuId(null)}
                        className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-slate-50"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reschedule</span>
                      </button>
                      <button
                        onClick={() => setActiveMenuId(null)}
                        className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-rose-50 text-rose-600"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
