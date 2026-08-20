import React, { useState } from 'react';
import { MoreVertical, Eye, Clock, XCircle, Loader2 } from 'lucide-react';
import { updateScheduleStatusRecord } from '@/services/scheduleService';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';

export interface RecentAppointmentRow {
  id: string;
  patientName: string;
  avatarInitials: string;
  avatarBg: string;
  therapistName: string;
  type: string;
  typeBg: string;
  typeColor: string;
  status: 'Confirmed' | 'In Progress' | 'Completed' | 'Scheduled' | 'Cancelled' | 'Expired';
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
        await updateScheduleStatusRecord(
          apt.id,
          'Cancelled',
          apt.raw?.doctorId || apt.raw?.therapistId,
          apt.raw?.fullDate,
          apt.raw?.timeSlot || apt.raw?.time
        );
      } catch (err) {
        console.error('Error cancelling appointment:', err);
      }
    }
  };

  const displayAppointments = recentAppointments;

  return (
    <div className="self-stretch bg-white/70 rounded-[32px] shadow-[0px_8px_32px_0px_rgba(0,61,155,0.05)] outline outline-1 outline-offset-[-1px] outline-white/40 backdrop-blur-[10px] flex flex-col justify-start items-start overflow-hidden">
      {/* Header */}
      <div className="self-stretch p-8 border-b border-blue-100/30 inline-flex justify-between items-center w-full">
        <div className="inline-flex flex-col justify-start items-start">
          <h3 className="justify-center text-slate-900 text-2xl font-semibold font-['Inter'] leading-8">Recent Appointments</h3>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-center justify-center text-blue-900 text-sm font-bold font-['Inter'] leading-5 cursor-pointer hover:underline"
          >
            View All
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="self-stretch flex flex-col justify-start items-start overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-indigo-50/30 border-b border-blue-100/20">
              <th className="px-6 py-4 text-gray-700 text-base font-bold font-['Inter'] leading-6">Patient Name</th>
              <th className="px-6 py-4 text-gray-700 text-base font-bold font-['Inter'] leading-6">Therapist</th>
              <th className="px-6 py-4 text-gray-700 text-base font-bold font-['Inter'] leading-6">Type</th>
              <th className="px-6 py-4 text-gray-700 text-base font-bold font-['Inter'] leading-6">Status</th>
              <th className="px-6 py-4 text-gray-700 text-base font-bold font-['Inter'] leading-6">Time</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100/20 text-base font-normal font-['Inter']">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-slate-400 font-medium">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-900" />
                    <span>Loading real-time appointments...</span>
                  </div>
                </td>
              </tr>
            ) : displayAppointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500 text-sm font-normal">
                  No appointments recorded in the system.
                </td>
              </tr>
            ) : (
              displayAppointments.map((apt) => (
                <tr
                  key={apt.id}
                  onClick={() => onSelectSession?.(apt.raw)}
                  className="hover:bg-indigo-50/20 transition-colors cursor-pointer"
                >
                  {/* Patient Name with Avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex justify-center items-center text-blue-900 text-xs font-bold font-['Inter'] leading-4 shrink-0">
                        {apt.avatarInitials || apt.patientName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="justify-center text-slate-900 text-base font-normal font-['Inter'] leading-6">{apt.patientName}</span>
                    </div>
                  </td>

                  {/* Therapist */}
                  <td className="px-6 py-4 text-gray-700 text-base font-normal font-['Inter'] leading-6">
                    {apt.therapistName}
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-[2.50px] rounded-full text-xs font-bold font-['Inter'] leading-4 ${apt.typeBg || 'bg-purple-200'} ${apt.typeColor || 'text-indigo-800'}`}
                    >
                      {apt.type}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`size-2 rounded-full ${apt.dotColor || 'bg-sky-800'}`} />
                      <span className={`text-base font-normal font-['Inter'] leading-6 ${apt.statusColor || 'text-slate-900'}`}>
                        {apt.status}
                      </span>
                    </div>
                  </td>

                  {/* Time */}
                  <td className="px-6 py-4 text-gray-700 text-base font-normal font-['Inter'] leading-6">
                    {apt.time}
                  </td>

                  {/* Actions Dropdown */}
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === apt.id ? null : apt.id);
                      }}
                      className="p-1.5 text-gray-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenuId === apt.id && (
                      <div className="absolute right-6 mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 text-left text-xs font-semibold text-slate-700">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            onSelectSession?.(apt.raw);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-slate-50 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>View Details</span>
                        </button>
                        {onViewAll && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              onViewAll();
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-slate-50 cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Go to Schedule</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => handleCancel(apt, e)}
                          className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-rose-50 text-rose-600 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span>Cancel Session</span>
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
