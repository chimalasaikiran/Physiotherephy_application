import React, { useState, useMemo, useEffect } from 'react';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import {
  TrendingUp,
  UserPlus,
  ChevronDown,
  MoreVertical,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
  FileEdit,
  UserMinus,
  ExternalLink,
  Activity,
  Calendar,
  Loader2,
} from 'lucide-react';
import type { ProgramAssignment, AssignmentStatus } from '../types';
import {
  subscribeToAssignedPatients,
  removePatientAssignment,
  updatePatientAssignment,
} from '@/services/programService';

interface AssignedPatientsTabContentProps {
  onShowToast?: (msg: string) => void;
  onOpenAssignModal?: () => void;
  programId?: string;
}

export const AssignedPatientsTabContent: React.FC<AssignedPatientsTabContentProps> = ({
  onShowToast,
  onOpenAssignModal,
  programId,
}) => {
  const [patientsList, setPatientsList] = useState<ProgramAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState<'current' | 'archived'>('current');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [weekFilter, setWeekFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Selected Patient Details Drawer/Modal
  const [selectedPatient, setSelectedPatient] = useState<ProgramAssignment | null>(null);

  const handleToast = (msg: string) => {
    if (onShowToast) onShowToast(msg);
  };

  // ─── Real-time Firestore subscription ───
  useEffect(() => {
    if (!programId) {
      setLoading(false);
      return;
    }

    const unsub = subscribeToAssignedPatients(
      programId,
      (assignments) => {
        setPatientsList(assignments);
        setLoading(false);
      },
      (err) => {
        console.warn('AssignedPatients subscription error:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [programId]);

  // ─── Dynamic stat metrics calculations ───
  const activePatientsCount = useMemo(
    () => patientsList.filter((p) => !p.isArchived && p.status === 'active').length,
    [patientsList]
  );

  const avgAdherence = useMemo(() => {
    const active = patientsList.filter((p) => !p.isArchived);
    if (active.length === 0) return 0;
    const total = active.reduce((acc, p) => acc + p.adherence, 0);
    return Math.round(total / active.length);
  }, [patientsList]);

  const riskAlertsCount = useMemo(
    () => patientsList.filter((p) => p.assignmentStatus === 'Review Needed' && !p.isArchived).length,
    [patientsList]
  );

  const avgProgressPercent = useMemo(() => {
    const active = patientsList.filter((p) => !p.isArchived);
    if (active.length === 0) return 0;
    return Math.round(active.reduce((acc, p) => acc + p.progressPercent, 0) / active.length);
  }, [patientsList]);

  // ─── Pagination state ───
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;

  // ─── Filtered logic ───
  const filteredPatients = useMemo(() => {
    return patientsList.filter((pt) => {
      const isArchived = Boolean(pt.isArchived);
      if (viewTab === 'current' && isArchived) return false;
      if (viewTab === 'archived' && !isArchived) return false;

      if (statusFilter !== 'all' && pt.assignmentStatus !== statusFilter) return false;

      if (weekFilter !== 'all') {
        if (weekFilter === '1' && pt.currentWeek !== 1) return false;
        if (weekFilter === '2' && pt.currentWeek !== 2) return false;
        if (weekFilter === '3' && pt.currentWeek !== 3) return false;
        if (weekFilter === '4' && pt.currentWeek !== 4) return false;
        if (weekFilter === '5-6' && (pt.currentWeek < 5 || pt.currentWeek > 6)) return false;
        if (weekFilter === '7-8' && (pt.currentWeek < 7 || pt.currentWeek > 8)) return false;
      }

      if (
        searchQuery &&
        !pt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !pt.patientCondition.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [patientsList, viewTab, statusFilter, weekFilter, searchQuery]);

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage]);

  // ─── Handlers ───
  const handleUnassignPatient = async (assignment: ProgramAssignment) => {
    if (!programId) return;
    try {
      await removePatientAssignment(assignment.id, programId);
      setActiveMenuId(null);
      handleToast(`Unassigned ${assignment.patientName} from this program.`);
    } catch (err) {
      console.error('Unassign error:', err);
      handleToast('Failed to unassign patient.');
    }
  };

  const handleToggleArchive = async (assignment: ProgramAssignment) => {
    try {
      await updatePatientAssignment(assignment.id, { isArchived: !assignment.isArchived });
      setActiveMenuId(null);
      handleToast(`Updated status for ${assignment.patientName}`);
    } catch (err) {
      console.error('Archive toggle error:', err);
      handleToast('Failed to update patient status.');
    }
  };

  // ─── Renderers ───
  const renderAdherenceBadge = (percentage: number) => {
    let strokeColor = '#3b82f6';
    let textColor = 'text-blue-600';
    let ringBg = 'stroke-blue-100';

    if (percentage >= 95) {
      strokeColor = '#0d9488';
      textColor = 'text-teal-600';
      ringBg = 'stroke-teal-100';
    } else if (percentage < 60) {
      strokeColor = '#ef4444';
      textColor = 'text-rose-600';
      ringBg = 'stroke-rose-100';
    } else if (percentage >= 90) {
      strokeColor = '#2563eb';
      textColor = 'text-blue-600';
      ringBg = 'stroke-blue-100';
    }

    const radius = 15;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center w-10 h-10">
        <svg className="w-10 h-10 transform -rotate-90">
          <circle cx="20" cy="20" r={radius} className={`${ringBg} fill-none`} strokeWidth="3" />
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className={`absolute text-[11px] font-extrabold ${textColor}`}>{percentage}%</span>
      </div>
    );
  };

  const renderStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case 'On Track':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-full border border-sky-200/60 shadow-2xs">
            On Track
          </span>
        );
      case 'Review Needed':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200/60 shadow-2xs">
            Review Needed
          </span>
        );
      case 'Ahead':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/60 shadow-2xs">
            Ahead
          </span>
        );
      default:
        return null;
    }
  };

  const formatLastActivity = (iso: string): string => {
    if (!iso) return 'Unknown';
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffD = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH} hour${diffH > 1 ? 's' : ''} ago`;
    if (diffD === 1) return 'Yesterday';
    if (diffD < 7) return `${diffD} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-sm font-medium text-slate-500">Loading assigned patients…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: ACTIVE PATIENTS */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs border-l-4 border-l-blue-600 flex items-center justify-between hover:border-blue-200 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              ACTIVE PATIENTS
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {activePatientsCount}
            </div>
          </div>
          <span className="px-2.5 py-1 bg-sky-50 text-sky-600 text-xs font-bold rounded-full border border-sky-200/60 shrink-0">
            Live
          </span>
        </div>

        {/* Card 2: AVG. ADHERENCE */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs border-l-4 border-l-blue-600 flex items-center justify-between hover:border-blue-200 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              AVG. ADHERENCE
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {avgAdherence}%
            </div>
          </div>
          <span className={`px-3 py-1 text-xs font-bold rounded-full border shrink-0 ${avgAdherence >= 80 ? 'bg-cyan-50 text-cyan-700 border-cyan-200/60' : 'bg-amber-50 text-amber-700 border-amber-200/60'}`}>
            {avgAdherence >= 80 ? 'High' : 'Moderate'}
          </span>
        </div>

        {/* Card 3: AVG. PROGRESS */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs border-l-4 border-l-blue-600 flex items-center justify-between hover:border-blue-200 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              AVG. PROGRESS
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {avgProgressPercent}%
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Card 4: RISK ALERTS */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs border-l-4 border-l-rose-500 flex items-center justify-between hover:border-rose-200 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              RISK ALERTS
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {riskAlertsCount}
            </div>
          </div>
          <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-full border border-rose-200/60 shrink-0">
            {riskAlertsCount > 0 ? 'Action Req' : 'None'}
          </span>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Toggle Pills & Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tabs: Current Patients vs Archived */}
          <div className="inline-flex items-center p-1 bg-slate-200/60 rounded-full border border-slate-200/80">
            <button
              onClick={() => { setViewTab('current'); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewTab === 'current' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Current Patients
            </button>
            <button
              onClick={() => { setViewTab('archived'); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewTab === 'archived' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Archived
            </button>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="appearance-none pl-3.5 pr-8 py-2 bg-white border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 cursor-pointer shadow-2xs"
            >
              <option value="all">Status: All</option>
              <option value="On Track">Status: On Track</option>
              <option value="Review Needed">Status: Review Needed</option>
              <option value="Ahead">Status: Ahead</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Week Filter */}
          <div className="relative">
            <select
              value={weekFilter}
              onChange={(e) => { setWeekFilter(e.target.value); setCurrentPage(1); }}
              className="appearance-none pl-3.5 pr-8 py-2 bg-white border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 cursor-pointer shadow-2xs"
            >
              <option value="all">Week: All</option>
              <option value="1">Week 1</option>
              <option value="2">Week 2</option>
              <option value="3">Week 3</option>
              <option value="4">Week 4</option>
              <option value="5-6">Week 5 - 6</option>
              <option value="7-8">Week 7 - 8</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200/80 rounded-full text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 shadow-2xs"
            />
          </div>
        </div>

        {/* Right Side: Assign Patient Button */}
        <div className="shrink-0">
          <button
            onClick={() => { if (onOpenAssignModal) onOpenAssignModal(); }}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-full transition-all duration-200 shadow-md shadow-blue-600/25 cursor-pointer active:scale-98"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Assign Patient</span>
          </button>
        </div>
      </div>

      {/* Main Assigned Patients Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden relative">
        <div className="overflow-x-auto min-h-[320px]">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200/70 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Patient</th>
                <th className="py-4 px-6">Program Week</th>
                <th className="py-4 px-6 text-center">Adherence</th>
                <th className="py-4 px-6">Progress</th>
                <th className="py-4 px-6">Last Activity</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                        <UserPlus className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">
                        {programId ? 'No assigned patients yet' : 'No program selected'}
                      </p>
                      <p className="text-xs font-medium text-slate-400">
                        {programId
                          ? 'Click "Assign Patient" to add your first patient to this program.'
                          : 'Open a program to see its assigned patients.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    {/* Patient Column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3.5">
                        <InitialsAvatar name={patient.patientName} className="w-10 h-10 text-xs font-bold shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {patient.patientName}
                          </h4>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {patient.patientCondition}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Program Week Column */}
                    <td className="py-4 px-6 text-sm font-bold text-slate-800">
                      Week {patient.currentWeek} of {patient.totalWeeks}
                    </td>

                    {/* Adherence Column */}
                    <td className="py-4 px-6 text-center">
                      {renderAdherenceBadge(patient.adherence)}
                    </td>

                    {/* Progress Column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2 min-w-[100px]">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-700"
                            style={{ width: `${patient.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600 shrink-0">
                          {patient.progressPercent}%
                        </span>
                      </div>
                    </td>

                    {/* Last Activity Column */}
                    <td className="py-4 px-6 text-xs font-semibold text-slate-500">
                      {formatLastActivity(patient.lastActivityAt)}
                    </td>

                    {/* Status Column */}
                    <td className="py-4 px-6">
                      {renderStatusBadge(patient.assignmentStatus)}
                    </td>

                    {/* Actions Column */}
                    <td
                      className="py-4 px-6 text-right relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === patient.id ? null : patient.id)}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === patient.id && (
                        <div className="absolute right-6 top-12 z-30 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 animate-in fade-in zoom-in-95 duration-150 text-left">
                          <button
                            onClick={() => { setSelectedPatient(patient); setActiveMenuId(null); }}
                            className="w-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-2 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                            <span>View Full Profile</span>
                          </button>
                          <button
                            onClick={() => { handleToast(`Message sent to ${patient.patientName}`); setActiveMenuId(null); }}
                            className="w-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-2 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                            <span>Send Message</span>
                          </button>
                          <button
                            onClick={() => { handleToast(`Modifying protocol for ${patient.patientName}`); setActiveMenuId(null); }}
                            className="w-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-2 cursor-pointer"
                          >
                            <FileEdit className="w-3.5 h-3.5 text-slate-400" />
                            <span>Modify Protocol</span>
                          </button>
                          <div className="my-1 border-t border-slate-100" />
                          <button
                            onClick={() => handleToggleArchive(patient)}
                            className="w-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{patient.isArchived ? 'Unarchive Patient' : 'Archive Record'}</span>
                          </button>
                          <button
                            onClick={() => handleUnassignPatient(patient)}
                            className="w-full px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <UserMinus className="w-3.5 h-3.5 text-rose-500" />
                            <span>Unassign Patient</span>
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

        {/* Table Footer with Pagination */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-semibold text-slate-400">
            Showing {paginatedPatients.length} of {filteredPatients.length} patients
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PATIENT PROFILE DRAWER MODAL */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedPatient(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center space-x-4">
              <InitialsAvatar name={selectedPatient.patientName} className="w-16 h-16 text-xl font-bold shrink-0 shadow-md" />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedPatient.patientName}</h3>
                  {renderStatusBadge(selectedPatient.assignmentStatus)}
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-1">{selectedPatient.patientCondition}</p>
                <p className="text-[11px] text-slate-400 font-medium">Started: {selectedPatient.startDate}</p>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">ADHERENCE</span>
                <span className="text-lg font-extrabold text-blue-600 mt-1 block">{selectedPatient.adherence}%</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">PROGRESS</span>
                <span className="text-lg font-extrabold text-emerald-600 mt-1 block">{selectedPatient.progressPercent}%</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">WEEK</span>
                <span className="text-xs font-bold text-slate-800 mt-1.5 block">
                  {selectedPatient.currentWeek} / {selectedPatient.totalWeeks}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">SESSIONS</span>
                <span className="text-xs font-bold text-slate-800 mt-1.5 block">
                  {selectedPatient.completedSessions} / {selectedPatient.totalSessions}
                </span>
              </div>
            </div>

            {/* Exercise completion breakdown */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Exercise Progress</span>
                <span className="text-blue-600">
                  {selectedPatient.completedExercises.length} completed
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-700"
                  style={{ width: `${selectedPatient.progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span>{selectedPatient.completedExercises.length} done</span>
                <span>{selectedPatient.pendingExercises.length} remaining</span>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-2 text-xs font-medium text-slate-600">
              {selectedPatient.email && (
                <div className="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl">
                  <span className="text-slate-400 font-bold">Email:</span>
                  <span className="text-slate-900 font-semibold">{selectedPatient.email}</span>
                </div>
              )}
              {selectedPatient.phone && (
                <div className="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl">
                  <span className="text-slate-400 font-bold">Phone:</span>
                  <span className="text-slate-900 font-semibold">{selectedPatient.phone}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl">
                <span className="text-slate-400 font-bold">Assigned:</span>
                <span className="text-slate-900 font-semibold">
                  {new Date(selectedPatient.assignedAt).toLocaleDateString('en-US', {
                    month: 'short', day: '2-digit', year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => {
                  handleToast(`Reminder sent to ${selectedPatient.patientName}`);
                  setSelectedPatient(null);
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
              >
                Send Reminder
              </button>
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedPatientsTabContent;
