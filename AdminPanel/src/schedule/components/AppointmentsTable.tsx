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
        return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'Online':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Home Visit':
        return 'bg-teal-50 text-teal-700 border-teal-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getStatusBadgeClass = (status: AppointmentItem['status']) => {
    switch (status) {
      case 'Confirmed':
      case 'Scheduled':
        return 'bg-sky-50 text-sky-600 border-sky-100';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'No Show':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Expired' as any:
        return 'bg-amber-100/70 text-amber-900 border-amber-300';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getPaymentBadgeClass = (paymentStatus?: string) => {
    const ps = (paymentStatus || '').toUpperCase();
    if (ps === 'PAID') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (ps === 'PENDING') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (ps === 'REFUNDED' || ps === 'REFUND_PENDING') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (ps === 'PARTIAL') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
      {viewMode === 'list' ? (
        <>
          {/* Table Container */}
          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  <th className="py-4 px-6">PATIENT</th>
                  <th className="py-4 px-6">THERAPIST</th>
                  <th className="py-4 px-6">TYPE</th>
                  <th className="py-4 px-6">DATE & TIME</th>
                  <th className="py-4 px-6">PAYMENT</th>
                  <th className="py-4 px-6">STATUS</th>
                  <th className="py-4 px-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No appointments found matching your search.
                    </td>
                  </tr>
                ) : (
                  appointments.map((item) => {
                    const formatAmount = item.amount || item.pricing?.totalAmount || 1500;
                    const methodLabel = item.paymentMethod === 'CASH' ? 'Cash' : 'Online';
                    const statusLabel = (item.paymentStatus || 'Pending').toString();
                    const isCashPending = item.paymentMethod === 'CASH' && statusLabel.toUpperCase() === 'PENDING';

                    return (
                      <tr
                        key={item.id}
                        onClick={() => onSelectSession?.(item)}
                        className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      >
                        {/* Patient Column */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <InitialsAvatar name={item.patientName} className="w-10 h-10 text-xs font-bold shrink-0" />
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {item.patientName}
                              </div>
                              <div className="text-xs text-slate-400 font-medium">
                                {item.patientSubtitle}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Therapist Column */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <InitialsAvatar name={item.therapistName} className="w-9 h-9 text-xs font-bold shrink-0" />
                            <div>
                              <div className="font-bold text-slate-800 text-xs">
                                {item.therapistName}
                              </div>
                              <div className="text-[11px] text-slate-400 font-medium">
                                {item.therapistSubtitle}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type Column */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getTypeBadgeClass(
                              item.type
                            )}`}
                          >
                            {formatAppointmentTypeLabel(item.type)}
                          </span>
                        </td>

                        {/* Date & Time Column */}
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-bold text-slate-900 text-xs">
                              {item.date}
                            </div>
                            <div className="text-xs text-slate-400 font-medium mt-0.5">
                              {item.time}
                            </div>
                          </div>
                        </td>

                        {/* Payment Column */}
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <div className="font-extrabold text-slate-900 text-xs">
                              ₹{formatAmount.toLocaleString('en-IN')}
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${getPaymentBadgeClass(
                                  statusLabel
                                )}`}
                              >
                                {methodLabel} • {statusLabel}
                              </span>
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
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border cursor-pointer outline-none transition-all ${getStatusBadgeClass(
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

                        {/* Options / Action Column */}
                        <td className="py-4 px-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
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
        </>
      ) : (
        /* Grid / Cards Mode */
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {appointments.map((item) => {
            const formatAmount = item.amount || item.pricing?.totalAmount || 1500;
            const methodLabel = item.paymentMethod === 'CASH' ? 'Cash' : 'Online';
            const statusLabel = (item.paymentStatus || 'Pending').toString();

            return (
              <div
                key={item.id}
                onClick={() => onSelectSession?.(item)}
                className="p-5 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-4 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${getPaymentBadgeClass(
                        statusLabel
                      )}`}
                    >
                      ₹{formatAmount} • {methodLabel} • {statusLabel}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getTypeBadgeClass(
                        item.type
                      )}`}
                    >
                      {formatAppointmentTypeLabel(item.type)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <InitialsAvatar name={item.patientName} className="w-12 h-12 text-sm font-bold shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900">{item.patientName}</h4>
                    <p className="text-xs text-slate-500">{item.patientSubtitle}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <InitialsAvatar name={item.therapistName} className="w-7 h-7 text-[10px] font-bold shrink-0" />
                    <span className="font-semibold text-slate-700">{item.therapistName}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{item.date}</div>
                    <div className="text-slate-400">{item.time}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
        <div>
          Showing 1-{appointments.length} of {totalResults} results
        </div>

        <div className="flex items-center space-x-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Previous
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
