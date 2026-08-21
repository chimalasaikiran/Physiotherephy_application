import React, { useState } from 'react';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { Calendar as CalendarIcon, Clock, MoreVertical, Eye, Trash2 } from 'lucide-react';
import { formatAppointmentTypeLabel } from '@/utils/appointmentUtils';

export interface AppointmentItem {
  id: string;
  patientName: string;
  patientSubtitle: string;
  patientAvatar: string;
  therapistName: string;
  therapistSubtitle: string;
  therapistAvatar: string;
  type: 'Clinic Visit' | 'Online' | 'Home Visit';
  date: string;
  time: string;
  status: 'Confirmed' | 'Scheduled' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
  appointmentStatus?: string;
  paymentMethod?: 'ONLINE' | 'CASH';
  paymentStatus?: 'PAID' | 'PENDING' | 'FAILED' | 'PARTIAL' | 'REFUND_PENDING' | 'REFUNDED' | 'Paid' | 'Pending';
  amount?: number;
  pricing?: any;
  location?: any;
  paidAt?: string;
  collectedBy?: string;
}

interface AppointmentsTableProps {
  appointments: AppointmentItem[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onPageChange: (page: number) => void;
  viewMode: 'list' | 'grid';
  onSelectSession?: (item: AppointmentItem) => void;
  onStatusChange?: (item: AppointmentItem, newStatus: AppointmentItem['status']) => void;
  onMarkCashPaid?: (item: AppointmentItem) => void;
  onDeleteAppointment?: (item: AppointmentItem) => void;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  currentPage,
  totalPages,
  totalResults,
  onPageChange,
  viewMode,
  onSelectSession,
  onStatusChange,
  onMarkCashPaid,
  onDeleteAppointment,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getTypeBadgeClass = (type: AppointmentItem['type']) => {
    switch (type) {
      case 'Clinic Visit':
        return 'bg-cyan-300/20 text-sky-800';
      case 'Online':
        return 'bg-indigo-700/10 text-indigo-800';
      case 'Home Visit':
        return 'bg-sky-800/10 text-sky-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusBadgeClass = (status: AppointmentItem['status']) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-sky-100 text-sky-700';
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      case 'No Show':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPaymentBadgeClass = (paymentStatus?: string) => {
    const ps = (paymentStatus || '').toUpperCase();
    if (ps === 'PAID') return 'bg-green-100 text-green-800';
    if (ps === 'PENDING') return 'bg-yellow-100 text-yellow-800';
    if (ps === 'REFUNDED' || ps === 'REFUND_PENDING') return 'bg-red-100 text-red-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="w-full bg-white/70 rounded-3xl shadow-[0px_4px_24px_-1px_rgba(0,104,123,0.05)] outline outline-1 outline-offset-[-1px] outline-white/40 backdrop-blur-[10px] flex flex-col justify-start items-start overflow-hidden">
      {viewMode === 'list' ? (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-indigo-50/50 border-b border-slate-300/30 text-gray-500 text-xs font-bold font-['Inter'] uppercase leading-4 tracking-wide">
                <th className="py-5 px-6">PATIENT</th>
                <th className="py-5 px-6">THERAPIST</th>
                <th className="py-5 px-6">TYPE</th>
                <th className="py-5 px-6">DATE & TIME</th>
                <th className="py-5 px-6">STATUS</th>
                <th className="py-5 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300/20 text-xs font-['Inter']">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No appointments found matching your search.
                  </td>
                </tr>
              ) : (
                appointments.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectSession?.(item)}
                      className="hover:bg-white/50 transition-colors cursor-pointer group"
                    >
                      {/* Patient Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-10 bg-indigo-100 rounded-full outline outline-1 outline-offset-[-1px] outline-white flex items-center justify-center overflow-hidden shrink-0">
                            <InitialsAvatar name={item.patientName} className="w-full h-full text-xs font-bold text-slate-800" />
                          </div>
                          <div className="flex flex-col justify-start items-start">
                            <div className="text-slate-900 text-sm font-bold font-['Inter'] leading-5 group-hover:text-blue-900 transition-colors">
                              {item.patientName}
                            </div>
                            <div className="text-gray-500 text-xs font-normal font-['Inter'] leading-4">
                              {item.patientSubtitle}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Therapist Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-8 bg-cyan-200 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                            <InitialsAvatar name={item.therapistName} className="w-full h-full text-xs font-semibold text-slate-900" />
                          </div>
                          <div className="flex flex-col justify-start items-start">
                            <div className="text-slate-900 text-xs font-semibold font-['Inter'] leading-5">
                              {item.therapistName}
                            </div>
                            <div className="text-gray-500 text-xs font-normal font-['Inter'] leading-4">
                              {item.therapistSubtitle || 'Physiotherapist'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type Column */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold font-['Inter'] leading-4 ${getTypeBadgeClass(
                            item.type
                          )}`}
                        >
                          {formatAppointmentTypeLabel(item.type)}
                        </span>
                      </td>

                      {/* Date & Time Column */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col justify-start items-start">
                          <div className="text-slate-900 text-xs font-semibold font-['Inter'] leading-5">
                            {item.date}
                          </div>
                          <div className="text-gray-500 text-xs font-normal font-['Inter'] leading-4">
                            {item.time}
                          </div>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={item.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as AppointmentItem['status'];
                            onStatusChange?.(item, newStatus);
                          }}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-['Inter'] leading-4 cursor-pointer border-none outline-none transition-all ${getStatusBadgeClass(
                            item.status
                          )}`}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="No Show">No Show</option>
                        </select>
                      </td>

                      {/* Options Column */}
                      <td className="py-4 px-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
                          aria-label="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === item.id && (
                          <div className="absolute right-4 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 text-left text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-150">
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onSelectSession?.(item);
                              }}
                              className="w-full flex items-center space-x-2 px-3.5 py-2 hover:bg-slate-50 text-slate-800 cursor-pointer"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                              <span>View Details</span>
                            </button>
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                if (confirm(`Delete appointment record for ${item.patientName}?`)) {
                                  onDeleteAppointment?.(item);
                                }
                              }}
                              className="w-full flex items-center space-x-2 px-3.5 py-2 hover:bg-rose-50 text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                              <span>Delete Record</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid / Cards Mode */
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {appointments.map((item) => {
            return (
              <div
                key={item.id}
                onClick={() => onSelectSession?.(item)}
                className="p-5 rounded-2xl border border-white/40 bg-white/50 hover:bg-white hover:shadow-md transition-all space-y-4 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-['Inter'] ${getStatusBadgeClass(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-['Inter'] ${getTypeBadgeClass(
                      item.type
                    )}`}
                  >
                    {formatAppointmentTypeLabel(item.type)}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <InitialsAvatar name={item.patientName} className="w-full h-full text-xs font-bold text-slate-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 font-['Inter']">{item.patientName}</h4>
                    <p className="text-xs text-gray-500 font-['Inter']">{item.patientSubtitle}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-300/20 flex items-center justify-between text-xs font-['Inter']">
                  <div className="flex items-center space-x-2">
                    <InitialsAvatar name={item.therapistName} className="w-6 h-6 text-[10px] font-bold shrink-0" />
                    <span className="font-semibold text-slate-900">{item.therapistName}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">{item.date}</div>
                    <div className="text-gray-500">{item.time}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="w-full px-6 py-4 bg-indigo-50/30 border-t border-slate-300/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-normal font-['Inter']">
        <div>
          Showing 1-{appointments.length} of {totalResults} results
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3 py-1.5 opacity-80 rounded-[32px] outline outline-1 outline-offset-[-1px] outline-slate-300 text-slate-900 text-xs font-normal font-['Inter'] hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
          >
            Previous
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3 py-1.5 rounded-[32px] outline outline-1 outline-offset-[-1px] outline-slate-300 text-slate-900 text-xs font-normal font-['Inter'] hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
