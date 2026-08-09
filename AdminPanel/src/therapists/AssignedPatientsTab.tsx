import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  User,
  Calendar,
  Activity,
  MessageSquare,
  FileText,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import type { Therapist } from './types';

export interface AssignedPatient {
  id: string;
  patientId: string; // e.g. "PT-2091"
  name: string;
  avatarUrl?: string;
  condition: string;
  weekProgress: string; // e.g. "Wk 4 of 12"
  progressPercent: number; // e.g. 65
  nextSession: {
    time: string; // e.g. "Today, 4:30 PM"
    location: string; // e.g. "Room 204B"
  };
  status: 'On Track' | 'Recovering' | 'Needs Review';
}

const MOCK_ASSIGNED_PATIENTS: AssignedPatient[] = [
  {
    id: 'p-1',
    patientId: 'PT-2091',
    name: 'Sanya Malhotra',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    condition: 'Post-Op Hip Rehab',
    weekProgress: 'Wk 4 of 12',
    progressPercent: 65,
    nextSession: {
      time: 'Today, 4:30 PM',
      location: 'Room 204B',
    },
    status: 'On Track',
  },
  {
    id: 'p-2',
    patientId: 'PT-1822',
    name: 'Arjun Kapoor',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    condition: 'ACL Recovery',
    weekProgress: 'Wk 8 of 16',
    progressPercent: 42,
    nextSession: {
      time: 'Tomorrow, 10:00 AM',
      location: 'Virtual Consultation',
    },
    status: 'Recovering',
  },
  {
    id: 'p-3',
    patientId: 'PT-3310',
    name: 'Rohan Mehta',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    condition: 'Rotator Cuff Tear',
    weekProgress: 'Wk 2 of 20',
    progressPercent: 12,
    nextSession: {
      time: '24 Oct, 11:30 AM',
      location: 'Room 105A',
    },
    status: 'Needs Review',
  },
  {
    id: 'p-4',
    patientId: 'PT-4421',
    name: 'Priyanshu Singh',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    condition: 'Lumber Disc Bulge',
    weekProgress: 'Wk 10 of 12',
    progressPercent: 92,
    nextSession: {
      time: '25 Oct, 09:00 AM',
      location: 'Room 202C',
    },
    status: 'On Track',
  },
  {
    id: 'p-5',
    patientId: 'PT-5102',
    name: 'Ananya Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    condition: 'Cervical Spondylosis',
    weekProgress: 'Wk 3 of 8',
    progressPercent: 38,
    nextSession: {
      time: '26 Oct, 02:15 PM',
      location: 'Room 108',
    },
    status: 'Recovering',
  },
  {
    id: 'p-6',
    patientId: 'PT-6391',
    name: 'Vikram Patel',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    condition: 'Tennis Elbow Rehab',
    weekProgress: 'Wk 6 of 6',
    progressPercent: 98,
    nextSession: {
      time: '27 Oct, 11:00 AM',
      location: 'Room 204B',
    },
    status: 'On Track',
  },
  {
    id: 'p-7',
    patientId: 'PT-7210',
    name: 'Kavita Joshi',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    condition: 'Ankle Ligament Tear',
    weekProgress: 'Wk 1 of 10',
    progressPercent: 15,
    nextSession: {
      time: '28 Oct, 03:30 PM',
      location: 'Virtual Consultation',
    },
    status: 'Needs Review',
  },
  {
    id: 'p-8',
    patientId: 'PT-8834',
    name: 'Devendra Roy',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    condition: 'Post Knee Replacement',
    weekProgress: 'Wk 7 of 14',
    progressPercent: 55,
    nextSession: {
      time: '29 Oct, 10:30 AM',
      location: 'Room 301',
    },
    status: 'Recovering',
  },
  {
    id: 'p-9',
    patientId: 'PT-9125',
    name: 'Meera Deshmukh',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    condition: 'Frozen Shoulder Therapy',
    weekProgress: 'Wk 5 of 12',
    progressPercent: 78,
    nextSession: {
      time: '30 Oct, 04:00 PM',
      location: 'Room 204B',
    },
    status: 'On Track',
  },
  {
    id: 'p-10',
    patientId: 'PT-1044',
    name: 'Rajesh Verma',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    condition: 'Sciatica Nerve Pain',
    weekProgress: 'Wk 4 of 8',
    progressPercent: 48,
    nextSession: {
      time: '31 Oct, 09:30 AM',
      location: 'Room 105A',
    },
    status: 'Recovering',
  },
];

interface AssignedPatientsTabProps {
  therapist?: Therapist | null;
}

export const AssignedPatientsTab: React.FC<AssignedPatientsTabProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'On Track' | 'Recovering' | 'Needs Review'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const itemsPerPage = 10;
  const totalCount = 42; // Matches Figma "Showing 1-10 of 42 patients"

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filtered List
  const filteredPatients = useMemo(() => {
    return MOCK_ASSIGNED_PATIENTS.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.condition.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // Paginated List
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

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

  const getProgressBarColor = (status: AssignedPatient['status']) => {
    switch (status) {
      case 'On Track':
        return 'bg-teal-500';
      case 'Recovering':
        return 'bg-blue-600';
      case 'Needs Review':
        return 'bg-rose-500';
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
          <table className="w-full text-left border-collapse min-w-[768px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6 font-extrabold">Patient Name</th>
                <th className="py-4 px-6 font-extrabold">Condition</th>
                <th className="py-4 px-6 font-extrabold">Recovery Progress</th>
                <th className="py-4 px-6 font-extrabold">Next Session</th>
                <th className="py-4 px-6 font-extrabold">Status</th>
                <th className="py-4 px-6 text-right font-extrabold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700">
              {paginatedPatients.length > 0 ? (
                paginatedPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                  >
                    {/* Patient Name + ID + Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3.5">
                        {patient.avatarUrl ? (
                          <img
                            src={patient.avatarUrl}
                            alt={patient.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-100 flex-shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {patient.name.charAt(0)}
                          </div>
                        )}
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

                    {/* Condition + Week */}
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-slate-900">{patient.condition}</p>
                        <span className="text-xs font-extrabold text-blue-600/90 block mt-0.5">
                          {patient.weekProgress}
                        </span>
                      </div>
                    </td>

                    {/* Recovery Progress Bar + Percentage */}
                    <td className="py-4 px-6 min-w-[170px]">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(
                              patient.status
                            )}`}
                            style={{ width: `${patient.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-extrabold text-teal-600 flex-shrink-0 w-8 text-right">
                          {patient.progressPercent}%
                        </span>
                      </div>
                    </td>

                    {/* Next Session + Location */}
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-extrabold text-slate-900">
                          {patient.nextSession.time}
                        </p>
                        <span className="text-xs font-medium text-slate-400 block mt-0.5">
                          {patient.nextSession.location}
                        </span>
                      </div>
                    </td>

                    {/* Status Pill Badge */}
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
                                triggerToast(`Opening profile for ${patient.name}`);
                              }}
                              className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                              <User className="w-3.5 h-3.5 text-blue-600" />
                              <span>View Profile</span>
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
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="space-y-2">
                      <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-600">No assigned patients found</p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search query or filter options.
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
            Showing <span className="font-bold text-slate-800">1-10</span> of{' '}
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
