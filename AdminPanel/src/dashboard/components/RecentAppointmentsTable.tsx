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
  status: 'Confirmed' | 'In Progress' | 'Completed' | 'Scheduled' | 'Cancelled';
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

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-900">Recent Appointments</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            View All
          </button>
        )}
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
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-slate-400 font-medium">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Loading real-time appointments...</span>
                  </div>
                </td>
              </tr>
            ) : recentAppointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-slate-400 font-medium">
                  No recent appointments found in Firestore
                </td>
              </tr>
            ) : (
              recentAppointments.map((apt) => (
                <tr
                  key={apt.id}
                  onClick={() => onSelectSession?.(apt.raw)}
                  className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                >
                  {/* Patient Name with Avatar */}
                  <td className="py-3.5 px-2">
                    <div className="flex items-center space-x-3">
                      <InitialsAvatar name={apt.patientName} className="w-9 h-9 text-xs font-bold" />
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === apt.id ? null : apt.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
