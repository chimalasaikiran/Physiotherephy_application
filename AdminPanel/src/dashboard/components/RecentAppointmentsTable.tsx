import React, { useState } from 'react';
import { MoreVertical, Eye, Clock, XCircle, Loader2, Trash2 } from 'lucide-react';
import { updateScheduleStatusRecord, deleteScheduleRecord } from '@/services/scheduleService';

export interface RecentAppointmentRow {
  id: string;
  patientName: string;
  avatarInitials: string;
  avatarBg: string;
  therapistName: string;
  type: string;
  typeBg: string;
  typeColor: string;
  status: 'Confirmed' | 'In Progress' | 'Completed' | 'Scheduled' | 'Pending' | 'Cancelled';
  statusColor: string;
  dotColor: string;
  time: string;
  raw?: any;
}

interface RecentAppointmentsTableProps {
  recentAppointments?: RecentAppointmentRow[];
  isLoading?: boolean;
  onSelectSession?: (session?: any) => void;
  onViewAll?: () => void;
}

const DEFAULT_SAMPLE_APPOINTMENTS: RecentAppointmentRow[] = [
  {
    id: 'sample-1',
    patientName: 'Arjun Reddy',
    avatarInitials: 'AR',
    avatarBg: 'bg-[#D8E2FF] text-[#003D9B]',
    therapistName: 'Dr. Emily Watson',
    type: 'Physiotherapy',
    typeBg: 'bg-[#EADEFF]',
    typeColor: 'text-[#6750A4]',
    status: 'Confirmed',
    statusColor: 'text-[#051A3E]',
    dotColor: 'bg-[#006A6B]',
    time: '10:30 AM',
  },
  {
    id: 'sample-2',
    patientName: 'Sana Nair',
    avatarInitials: 'SN',
    avatarBg: 'bg-[#D8E2FF] text-[#003D9B]',
    therapistName: 'Dr. Sarah Chen',
    type: 'Initial Consultation',
    typeBg: 'bg-[#D8E2FF]',
    typeColor: 'text-[#003D9B]',
    status: 'In Progress',
    statusColor: 'text-[#051A3E]',
    dotColor: 'bg-[#003D9B]',
    time: '09:15 AM',
  },
  {
    id: 'sample-3',
    patientName: 'Meera Kapoor',
    avatarInitials: 'MK',
    avatarBg: 'bg-[#D8E2FF] text-[#003D9B]',
    therapistName: 'Dr. Alan Grant',
    type: 'Speech Therapy',
    typeBg: 'bg-[#C2F0EE]',
    typeColor: 'text-[#006A6B]',
    status: 'Completed',
    statusColor: 'text-slate-600',
    dotColor: 'bg-slate-300',
    time: 'Yesterday',
  },
];

export const RecentAppointmentsTable: React.FC<RecentAppointmentsTableProps> = ({
  recentAppointments = [],
  isLoading = false,
  onSelectSession,
  onViewAll,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleCancel = async (apt: RecentAppointmentRow, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    if (confirm(`Are you sure you want to cancel the appointment for ${apt.patientName}?`)) {
      try {
        if (apt.id && !apt.id.startsWith('sample-')) {
          await updateScheduleStatusRecord(
            apt.id,
            'Cancelled',
            apt.raw?.doctorId || apt.raw?.therapistId,
            apt.raw?.fullDate,
            apt.raw?.timeSlot || apt.raw?.time
          );
        }
      } catch (err) {
        console.error('Error cancelling appointment:', err);
      }
    }
  };

  const handleDelete = async (apt: RecentAppointmentRow, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    if (confirm(`Are you sure you want to delete the appointment record for ${apt.patientName}?`)) {
      try {
        if (apt.id && !apt.id.startsWith('sample-')) {
          await deleteScheduleRecord(
            apt.id,
            apt.raw?.doctorId || apt.raw?.therapistId,
            apt.raw?.fullDate,
            apt.raw?.timeSlot || apt.raw?.time
          );
        }
      } catch (err) {
        console.error('Error deleting appointment:', err);
      }
    }
  };

  const displayAppointments =
    recentAppointments && recentAppointments.length > 0
      ? recentAppointments
      : DEFAULT_SAMPLE_APPOINTMENTS;

  return (
    <div className="self-stretch bg-white rounded-[32px] shadow-[0px_8px_32px_0px_rgba(0,61,155,0.05)] border border-slate-100 flex flex-col justify-start items-start overflow-hidden w-full">
      {/* Header matching exact Tailwind HTML design specification */}
      <div className="self-stretch p-8 border-b border-blue-100/30 flex justify-between items-center w-full">
        <div className="flex flex-col justify-start items-start">
          <h3 className="justify-center text-[#051A3E] text-2xl font-semibold font-['Inter'] leading-8">
            Recent Appointments
          </h3>
        </div>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-center justify-center text-[#003D9B] hover:text-[#051A3E] text-sm font-bold font-['Inter'] leading-5 cursor-pointer hover:underline transition-colors"
          >
            View All
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="self-stretch flex flex-col justify-start items-start overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-blue-100/20">
              <th className="px-8 py-5 text-[#051A3E]/70 text-base font-semibold font-['Inter'] leading-6">
                Patient Name
              </th>
              <th className="px-8 py-5 text-[#051A3E]/70 text-base font-semibold font-['Inter'] leading-6">
                Therapist
              </th>
              <th className="px-8 py-5 text-[#051A3E]/70 text-base font-semibold font-['Inter'] leading-6">
                Type
              </th>
              <th className="px-8 py-5 text-[#051A3E]/70 text-base font-semibold font-['Inter'] leading-6">
                Status
              </th>
              <th className="px-8 py-5 text-[#051A3E]/70 text-base font-semibold font-['Inter'] leading-6">
                Time
              </th>
              <th className="px-8 py-5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100/20 text-base font-normal font-['Inter']">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-slate-400 font-medium">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#003D9B]" />
                    <span>Loading real-time appointments...</span>
                  </div>
                </td>
              </tr>
            ) : displayAppointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 text-sm font-normal">
                  No appointments recorded in the system.
                </td>
              </tr>
            ) : (
              displayAppointments.map((apt) => (
                <tr
                  key={apt.id}
                  onClick={() => onSelectSession?.(apt.raw)}
                  className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                >
                  {/* Patient Name with Avatar */}
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-9 h-9 rounded-full bg-[#D8E2FF] flex justify-center items-center text-[#003D9B] text-xs font-bold font-['Inter'] leading-4 shrink-0">
                        {apt.avatarInitials ||
                          apt.patientName
                            .split(' ')
                            .filter(Boolean)
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()}
                      </div>
                      <span className="justify-center text-[#051A3E] text-base font-medium font-['Inter'] leading-6">
                        {apt.patientName}
                      </span>
                    </div>
                  </td>

                  {/* Therapist */}
                  <td className="px-8 py-5 text-[#051A3E]/80 text-base font-normal font-['Inter'] leading-6">
                    {apt.therapistName}
                  </td>

                  {/* Type */}
                  <td className="px-8 py-5">
                    <span
                      className={`inline-flex px-3.5 py-1 rounded-full text-xs font-semibold font-['Inter'] leading-4 ${
                        apt.typeBg || 'bg-[#EADEFF]'
                      } ${apt.typeColor || 'text-[#6750A4]'}`}
                    >
                      {apt.type}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${apt.dotColor || 'bg-[#006A6B]'}`} />
                      <span
                        className={`text-base font-medium font-['Inter'] leading-6 ${
                          apt.statusColor || 'text-[#051A3E]'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  </td>

                  {/* Time */}
                  <td className="px-8 py-5 text-[#051A3E]/80 text-base font-normal font-['Inter'] leading-6">
                    {apt.time}
                  </td>

                  {/* Actions Dropdown */}
                  <td className="px-8 py-5 text-right relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === apt.id ? null : apt.id);
                      }}
                      className="p-2 text-slate-400 hover:text-[#051A3E] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenuId === apt.id && (
                      <div className="absolute right-8 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 text-left text-xs font-semibold text-slate-700">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            onSelectSession?.(apt.raw);
                          }}
                          className="w-full flex items-center space-x-2 px-3.5 py-2 hover:bg-slate-50 cursor-pointer text-[#051A3E]"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>View Details</span>
                        </button>
                        {onViewAll && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              onViewAll();
                            }}
                            className="w-full flex items-center space-x-2 px-3.5 py-2 hover:bg-slate-50 cursor-pointer text-[#051A3E]"
                          >
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Go to Schedule</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleCancel(apt, e)}
                          className="w-full flex items-center space-x-2 px-3.5 py-2 hover:bg-amber-50 text-amber-700 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Cancel Session</span>
                        </button>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          type="button"
                          onClick={(e) => handleDelete(apt, e)}
                          className="w-full flex items-center space-x-2 px-3.5 py-2 hover:bg-rose-50 text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Delete Record</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

