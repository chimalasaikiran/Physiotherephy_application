import React, { useState, useEffect, useMemo } from 'react';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  User,
  Calendar,
  Activity,
  MessageSquare,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { Therapist } from './types';
import { db } from '@/auth/config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

import { formatPatientId } from '@/services/patientService';

export interface AssignedPatient {
  id: string;
  patientId: string; // e.g. "PAT-1001"
  name: string;
  avatarUrl?: string;
  condition: string;
  sessionsCount: number;
  latestAppointmentDate: string;
  latestAppointmentTime: string;
  appointmentStatus: string;
  paymentStatus: 'Paid' | 'Pending';
  status: 'On Track' | 'Recovering' | 'Needs Review';
}

interface AssignedPatientsTabProps {
  therapist?: Therapist | null;
}

export const AssignedPatientsTab: React.FC<AssignedPatientsTabProps> = ({ therapist }) => {
  const [assignedPatients, setAssignedPatients] = useState<AssignedPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'On Track' | 'Recovering' | 'Needs Review'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const itemsPerPage = 10;

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Subscribe to real-time Firestore appointments & users for this therapist
  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    let rawUsersMap: Record<string, any> = {};
    let rawAppts: any[] = [];

    const processData = () => {
      const patientMap: Record<string, AssignedPatient> = {};

      const therapistId = therapist?.id;
      const therapistNameClean = therapist?.name?.toLowerCase().trim();
      const assignedIdsSet = new Set<string>(therapist?.assignedPatientIds || []);

      // 1. Process matching appointments
      rawAppts.forEach((appt) => {
        const matchesTherapist =
          !therapist ||
          (therapistId && (appt.doctorId === therapistId || appt.therapistId === therapistId)) ||
          (therapistNameClean && (
            (appt.doctorName && appt.doctorName.toLowerCase().includes(therapistNameClean)) ||
            (appt.therapistName && appt.therapistName.toLowerCase().includes(therapistNameClean))
          ));

        if (matchesTherapist) {
          const pId = appt.userId || appt.patientId || appt.userName || 'patient_demo';
          const userDoc = rawUsersMap[pId] || rawUsersMap[appt.userId] || rawUsersMap[appt.patientId] || {};

          const pName = userDoc.fullName || userDoc.name || appt.userName || appt.patientName || 'Patient';
          const formattedId = formatPatientId(pId, userDoc.patientId || appt.patientId);
          const pAvatar =
            userDoc.avatarUri ||
            userDoc.avatarUrl ||
            appt.patientAvatar ||
            appt.userAvatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';
          const condition =
            appt.serviceTitle || appt.patientSubtitle || appt.patientCondition || userDoc.condition || userDoc.primaryConcern || 'Physiotherapy Session';
          const apptDate = appt.fullDate || appt.dateLabel || appt.date || 'Scheduled Date';
          const apptTime = appt.timeSlot || appt.time || '10:00 AM';
          const apptStatus = appt.status || 'Upcoming';
          const payStatus: 'Paid' | 'Pending' =
            appt.paymentStatus || (appt.paymentMode === 'online' ? 'Paid' : 'Pending');

          if (!patientMap[pId]) {
            patientMap[pId] = {
              id: pId,
              patientId: formattedId,
              name: pName,
              avatarUrl: pAvatar,
              condition,
              sessionsCount: 1,
              latestAppointmentDate: apptDate,
              latestAppointmentTime: apptTime,
              appointmentStatus: apptStatus,
              paymentStatus: payStatus,
              status:
                apptStatus === 'Cancelled'
                  ? 'Needs Review'
                  : apptStatus === 'Completed'
                  ? 'Recovering'
                  : 'On Track',
            };
          } else {
            patientMap[pId].sessionsCount += 1;
            if (apptDate >= patientMap[pId].latestAppointmentDate) {
              patientMap[pId].latestAppointmentDate = apptDate;
              patientMap[pId].latestAppointmentTime = apptTime;
              patientMap[pId].appointmentStatus = apptStatus;
              patientMap[pId].paymentStatus = payStatus;
              if (apptStatus === 'Cancelled') patientMap[pId].status = 'Needs Review';
            }
          }
        }
      });

      // 2. Process matching users from users collection not yet added from appointments
      Object.values(rawUsersMap).forEach((uDoc) => {
        const pId = uDoc.id;
        const matchesUserTherapist =
          (therapistId && (uDoc.doctorId === therapistId || uDoc.therapistId === therapistId)) ||
          (therapistNameClean && uDoc.therapistName && uDoc.therapistName.toLowerCase().includes(therapistNameClean)) ||
          assignedIdsSet.has(pId);

        if (matchesUserTherapist && !patientMap[pId]) {
          const pName = uDoc.fullName || uDoc.name || `Patient (${uDoc.phone || pId.slice(0, 6)})`;
          const formattedId = formatPatientId(pId, uDoc.patientId);
          patientMap[pId] = {
            id: pId,
            patientId: formattedId,
            name: pName,
            avatarUrl:
              uDoc.avatarUri ||
              uDoc.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
            condition: uDoc.condition || uDoc.primaryConcern || 'General Rehab',
            sessionsCount: 1,
            latestAppointmentDate: 'Pending Schedule',
            latestAppointmentTime: '--',
            appointmentStatus: 'Confirmed',
            paymentStatus: 'Paid',
            status: 'On Track',
          };
        }
      });

      setAssignedPatients(Object.values(patientMap));
      setIsLoading(false);
    };

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const uMap: Record<string, any> = {};
        snapshot.forEach((docSnap) => {
          uMap[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
        });
        rawUsersMap = uMap;
        processData();
      },
      (err) => console.warn('AssignedPatientsTab users listener error:', err)
    );

    const unsubAppts = onSnapshot(
      collection(db, 'appointments'),
      (snapshot) => {
        const appts: any[] = [];
        snapshot.forEach((docSnap) => {
          appts.push({ id: docSnap.id, ...docSnap.data() });
        });
        rawAppts = appts;
        processData();
      },
      (err) => console.warn('AssignedPatientsTab appts listener error:', err)
    );

    return () => {
      unsubUsers();
      unsubAppts();
    };
  }, [therapist?.id, therapist?.name, therapist?.assignedPatientIds]);

  // Filtered List
  const filteredPatients = useMemo(() => {
    return assignedPatients.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.condition.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [assignedPatients, searchQuery, statusFilter]);

  const totalCount = filteredPatients.length;

  // Paginated List
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  const getStatusBadge = (status: AssignedPatient['status']) => {
    switch (status) {
      case 'On Track':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200/60 rounded-full text-xs font-bold">
            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
            <span>On Track</span>
          </span>
        );
      case 'Recovering':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-full text-xs font-bold">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <span>Recovering</span>
          </span>
        );
      case 'Needs Review':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200/60 rounded-full text-xs font-bold">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
            <span>Needs Review</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getApptStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Confirmed':
      case 'Upcoming':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filter & Search Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient name, ID, or condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-1 sm:pt-0">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center space-x-1 hidden md:flex">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          {(['ALL', 'On Track', 'Recovering', 'Needs Review'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              {st === 'ALL' ? 'All Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Patient Data Card Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
        {/* Desktop & Tablet Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6 font-extrabold">Patient Name</th>
                <th className="py-4 px-6 font-extrabold">Session Details</th>
                <th className="py-4 px-6 font-extrabold text-center">Sessions</th>
                <th className="py-4 px-6 font-extrabold">Payment</th>
                <th className="py-4 px-6 font-extrabold">Appointment Status</th>
                <th className="py-4 px-6 font-extrabold">Recovery Status</th>
                <th className="py-4 px-6 text-right font-extrabold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-sm font-bold text-slate-600">Loading assigned patients from Firestore...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedPatients.length > 0 ? (
                paginatedPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                  >
                    {/* Patient Name + ID + Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3.5">
                        <InitialsAvatar name={patient.name} className="w-10 h-10 text-xs font-bold shrink-0" />
                        <div>
                          <h4 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {patient.name}
                          </h4>
                          <span className="text-xs font-bold text-slate-400 block mt-0.5">
                            ID: {patient.patientId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Session Details + Date & Time */}
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-slate-900">{patient.condition}</p>
                        <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                          {patient.latestAppointmentDate} • {patient.latestAppointmentTime}
                        </span>
                      </div>
                    </td>

                    {/* Sessions Count */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-800 rounded-xl text-xs font-extrabold">
                        {patient.sessionsCount} {patient.sessionsCount === 1 ? 'Session' : 'Sessions'}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                          patient.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {patient.paymentStatus}
                      </span>
                    </td>

                    {/* Appointment Status */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${getApptStatusBadge(
                          patient.appointmentStatus
                        )}`}
                      >
                        {patient.appointmentStatus}
                      </span>
                    </td>

                    {/* Recovery Status */}
                    <td className="py-4 px-6">{getStatusBadge(patient.status)}</td>

                    {/* Actions Menu */}
                    <td className="py-4 px-6 text-right relative">
                      <div className="inline-block text-left">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(
                              activeMenuId === patient.id ? null : patient.id
                            );
                          }}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Action Dropdown Menu */}
                        {activeMenuId === patient.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-6 top-12 w-48 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-20 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                triggerToast(`Viewing details for ${patient.name}`);
                              }}
                              className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                              <User className="w-3.5 h-3.5 text-blue-600" />
                              <span>View Patient</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                triggerToast(`Reschedule dialog opened for ${patient.name}`);
                              }}
                              className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                              <Calendar className="w-3.5 h-3.5 text-purple-600" />
                              <span>Reschedule Session</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                triggerToast(`Updating progress for ${patient.name}`);
                              }}
                              className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                              <Activity className="w-3.5 h-3.5 text-teal-600" />
                              <span>Update Progress</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                triggerToast(`Message sent to ${patient.name}`);
                              }}
                              className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                              <span>Send Message</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="space-y-2">
                      <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-600">No assigned patients found</p>
                      <p className="text-xs text-slate-400">
                        Patients who book appointments with {therapist?.name || 'this therapist'} will automatically appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Bar */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <p className="text-xs font-semibold text-slate-500">
            Showing <span className="font-bold text-slate-800">{totalCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, totalCount)}</span> of{' '}
            <span className="font-bold text-slate-800">{totalCount}</span> patients
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1 text-xs font-extrabold text-blue-600 bg-blue-50 border border-blue-100 rounded-xl">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignedPatientsTab;
