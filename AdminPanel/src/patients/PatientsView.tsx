import React, { useState, useMemo } from 'react';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Table as TableIcon,
  LayoutGrid,
  ChevronDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Activity,
  RefreshCw,
  Eye,
  Edit,
  Phone,
  Trash2,
  Filter,
  ArrowUpDown,
  Radio,
  AlertCircle,
  Database,
  Loader2,
} from 'lucide-react';

import type { Patient, PatientFilters, ConditionType, PatientStatus } from './types';
import { usePatients } from './usePatients';
import { ImportPatientsModal } from './ImportPatientsModal';
import { AddPatientPage } from './AddPatientPage';
import { PatientProfilePage } from './PatientProfilePage';

interface PatientsViewProps {
  onNavigateToAddPatient?: () => void;
  onSelectPatient?: (patient: Patient) => void;
  initialAddMode?: boolean;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  onNavigateToAddPatient,
  onSelectPatient,
  initialAddMode = false,
}) => {
  const {
    patients,
    stats,
    isLoading,
    error,
    isRealtimeActive,
    refresh,
    deletePatient,
    addPatient,
  } = usePatients();

  const [isAddPageOpen, setIsAddPageOpen] = useState(initialAddMode);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Selected patient dynamically pulled from live patients array
  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return patients.find((p) => p.id === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  const handleSelectPatient = (patient: Patient) => {
    if (onSelectPatient) {
      onSelectPatient(patient);
    } else {
      setSelectedPatientId(patient.id);
    }
  };

  // Filters State
  const [filters, setFilters] = useState<PatientFilters>({
    searchQuery: '',
    condition: 'all',
    therapist: 'all',
    status: 'all',
    ageGroup: 'all',
    sortBy: 'recently_updated',
    viewMode: 'table',
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter & Sort Logic
  const filteredPatients = useMemo(() => {
    return patients
      .filter((p) => {
        // Search query filter
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(query);
          const matchesId = p.patientId.toLowerCase().includes(query);
          const matchesCondition = (p.condition || '').toLowerCase().includes(query);
          const matchesTherapist = (p.therapistName || '').toLowerCase().includes(query);
          if (!matchesName && !matchesId && !matchesCondition && !matchesTherapist) {
            return false;
          }
        }

        // Condition filter
        if (filters.condition !== 'all' && p.condition !== filters.condition) {
          return false;
        }

        // Therapist filter
        if (filters.therapist !== 'all' && !p.therapistName.includes(filters.therapist)) {
          return false;
        }

        // Status filter
        if (filters.status !== 'all' && p.status !== filters.status) {
          return false;
        }

        // Age group filter
        if (filters.ageGroup !== 'all') {
          if (filters.ageGroup === 'under_30' && p.age >= 30) return false;
          if (filters.ageGroup === '30_50' && (p.age < 30 || p.age > 50)) return false;
          if (filters.ageGroup === 'above_50' && p.age <= 50) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        if (filters.sortBy === 'score_desc') {
          return (b.recoveryScore || 0) - (a.recoveryScore || 0);
        }
        if (filters.sortBy === 'id') {
          return a.patientId.localeCompare(b.patientId);
        }
        // Recently updated default
        return (
          new Date(b.updatedAt || b.createdAt || 0).getTime() -
          new Date(a.updatedAt || a.createdAt || 0).getTime()
        );
      });
  }, [patients, filters]);

  // Paginated patients
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage, itemsPerPage]);

  // Condition Badge Style Helper
  const getConditionStyle = (condition: ConditionType | string) => {
    switch (condition) {
      case 'Post-Op Rehab':
        return 'bg-teal-50 text-teal-700 border-teal-100';
      case 'Neuropathy':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Hypertension':
        return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'Rehab':
        return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'ACL Recovery':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Orthopedic':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Chronic Pain':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Status Badge Helper
  const getStatusStyle = (status: PatientStatus) => {
    switch (status) {
      case 'Active Treatment':
      case 'active':
        return {
          bg: 'bg-teal-50 text-teal-700 border-teal-100',
          dot: 'bg-teal-500',
        };
      case 'Observation':
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
        };
      case 'Recovered':
      case 'completed':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          dot: 'bg-emerald-500',
        };
      case 'On Hold':
      case 'pending':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-100',
          dot: 'bg-amber-500',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  if (isAddPageOpen) {
    return (
      <AddPatientPage
        onBack={() => setIsAddPageOpen(false)}
        onPatientCreated={async (newPatientData) => {
          await addPatient(newPatientData);
          setIsAddPageOpen(false);
        }}
      />
    );
  }

  if (selectedPatient) {
    return (
      <PatientProfilePage
        patient={selectedPatient}
        onBack={() => setSelectedPatientId(null)}
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Page Header Section with Real-time Badge & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Patients
            </h2>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1 max-w-xl">
            Manage patient records, recovery plans, and clinical history.
          </p>
        </div>

        {/* Right Header Action Buttons */}
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          {/* Refresh Button */}
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold text-sm transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Manual Refresh from Backend"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Import Patients Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-xl font-semibold text-sm transition-all shadow-2xs hover:shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Add Patient Button */}
          <button
            onClick={() => {
              if (onNavigateToAddPatient) {
                onNavigateToAddPatient();
              } else {
                setIsAddPageOpen(true);
              }
            }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#0F4C81] hover:bg-blue-800 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Error Alert Banner if any */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between text-rose-700 text-sm font-semibold animate-in fade-in duration-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={refresh}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* 2. Filter & Controls Toolbar Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-4">
        {/* Top Row: Search Input + View Mode Toggle Switch */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => {
                setFilters((f) => ({ ...f, searchQuery: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="Search patients by name, ID or condition..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all"
            />
          </div>

          {/* View Mode Segmented Switch */}
          <div className="flex items-center space-x-3 self-end lg:self-auto">
            <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
              <button
                onClick={() => setFilters((f) => ({ ...f, viewMode: 'table' }))}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filters.viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <TableIcon className="w-4 h-4" />
                <span>Table</span>
              </button>

              <button
                onClick={() => setFilters((f) => ({ ...f, viewMode: 'cards' }))}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filters.viewMode === 'cards'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row: Dropdown Filters & Sorting Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-50">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
            {/* Filter: Condition */}
            <div className="relative">
              <select
                value={filters.condition}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, condition: e.target.value }));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="all">All Conditions</option>
                <option value="Post-Op Rehab">Post-Op Rehab</option>
                <option value="Neuropathy">Neuropathy</option>
                <option value="Hypertension">Hypertension</option>
                <option value="Rehab">Rehab</option>
                <option value="ACL Recovery">ACL Recovery</option>
                <option value="Orthopedic">Orthopedic</option>
                <option value="Chronic Pain">Chronic Pain</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter: Assigned Therapist */}
            <div className="relative">
              <select
                value={filters.therapist}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, therapist: e.target.value }));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="all">Assigned Therapist</option>
                <option value="Ananya">Dr. Ananya Sharma</option>
                <option value="Rohan">Dr. Rohan Kapoor</option>
                <option value="Dev">Dr. Dev Mukherjee</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter: Status */}
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, status: e.target.value }));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="all">Status: All</option>
                <option value="Active Treatment">Active Treatment</option>
                <option value="Observation">Observation</option>
                <option value="Recovered">Recovered</option>
                <option value="On Hold">On Hold</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter: Age */}
            <div className="relative">
              <select
                value={filters.ageGroup}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, ageGroup: e.target.value }));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="all">Age: All Groups</option>
                <option value="under_30">Under 30</option>
                <option value="30_50">30 - 50</option>
                <option value="above_50">50+</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Right Sort Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Sort By:
            </span>
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    sortBy: e.target.value as PatientFilters['sortBy'],
                  }))
                }
                className="appearance-none bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <option value="recently_updated">Recently Updated</option>
                <option value="name_asc">Name A-Z</option>
                <option value="score_desc">Recovery Score (High-Low)</option>
                <option value="id">Patient ID</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Data Presentation (Loading Skeleton / Table / Cards View / Empty State) */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-xs text-center space-y-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Connecting to Firestore `patient details` collection...</p>
          <p className="text-xs text-slate-400">Synchronizing patient profiles, history, and medical records.</p>
        </div>
      ) : patients.length === 0 ? (
        /* EMPTY STATE WHEN NO PATIENTS EXIST IN FIRESTORE */
        <div className="bg-white rounded-3xl p-12 sm:p-16 border border-slate-100 shadow-xs text-center space-y-5 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xs">
            <Database className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900">No Patient Records in Firestore</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your Firestore collection (`patient details`) is currently empty. Create a new patient to get started.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-4 pt-2">
            <button
              onClick={() => setIsAddPageOpen(true)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[#0F4C81] hover:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Patient</span>
            </button>
          </div>
        </div>
      ) : filters.viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">PATIENT</th>
                  <th className="py-4 px-4">PATIENT ID</th>
                  <th className="py-4 px-4">CONDITION</th>
                  <th className="py-4 px-4">ASSIGNED THERAPIST</th>
                  <th className="py-4 px-4">NEXT APPOINTMENT</th>
                  <th className="py-4 px-4">RECOVERY SCORE</th>
                  <th className="py-4 px-4">STATUS</th>
                  <th className="py-4 px-6 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70 text-sm font-medium">
                {paginatedPatients.length > 0 ? (
                  paginatedPatients.map((patient) => {
                    const statusStyle = getStatusStyle(patient.status);
                    return (
                      <tr
                        key={patient.id}
                        onClick={() => handleSelectPatient(patient)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        {/* Patient Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3.5">
                            <InitialsAvatar name={patient.name} className="w-10 h-10 text-xs font-bold shrink-0" />
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {patient.name}
                              </div>
                              <div className="text-xs text-slate-400 font-medium">
                                {patient.age} yrs, {patient.gender}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Patient ID */}
                        <td className="py-4 px-4">
                          <span className="inline-block px-2.5 py-1 bg-blue-50/90 text-blue-600 rounded-lg text-xs font-bold font-mono border border-blue-100/60">
                            {patient.patientId}
                          </span>
                        </td>

                        {/* Condition */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getConditionStyle(
                              patient.condition
                            )}`}
                          >
                            {patient.condition}
                          </span>
                        </td>

                        {/* Assigned Therapist */}
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <InitialsAvatar name={patient.therapistName} className="w-6 h-6 text-[10px] font-bold shrink-0" />
                            <span className="text-xs font-bold text-slate-800">
                              {patient.therapistName}
                            </span>
                          </div>
                        </td>

                        {/* Next Appointment */}
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-bold text-xs text-slate-900">
                              {patient.nextAppointmentDate}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">
                              {patient.nextAppointmentTime}
                            </div>
                          </div>
                        </td>

                        {/* Recovery Score Bar */}
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3 max-w-[150px]">
                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                                style={{ width: `${patient.recoveryScore}%` }}
                              />
                            </div>
                            <span className="text-xs font-extrabold text-slate-800 w-8">
                              {patient.recoveryScore}%
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            <span>{patient.status}</span>
                          </span>
                        </td>

                        {/* Actions Dropdown */}
                        <td className="py-4 px-6 text-right relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() =>
                              setActiveMenuId(activeMenuId === patient.id ? null : patient.id)
                            }
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === patient.id && (
                            <div className="absolute right-6 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 text-left text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-150">
                              <button
                                onClick={() => {
                                  handleSelectPatient(patient);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center space-x-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-800"
                              >
                                <Eye className="w-4 h-4 text-blue-600" />
                                <span>View Details</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleSelectPatient(patient);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center space-x-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-800"
                              >
                                <Edit className="w-4 h-4 text-slate-400" />
                                <span>Edit Record</span>
                              </button>
                              <button
                                onClick={() => {
                                  alert(`Call ${patient.phone || patient.name}`);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center space-x-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-800"
                              >
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span>Contact Patient</span>
                              </button>
                              <div className="my-1 border-t border-slate-100" />
                              <button
                                onClick={async () => {
                                  if (confirm(`Delete patient record for ${patient.name}?`)) {
                                    await deletePatient(patient.id);
                                  }
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center space-x-2.5 px-3.5 py-2 hover:bg-rose-50 text-rose-600"
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
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="space-y-2">
                        <Filter className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-bold text-slate-600">No matching patient records found</p>
                        <p className="text-xs">Try clearing or adjusting your search filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Pagination */}
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
            <p className="text-xs font-semibold text-slate-500">
              Showing <span className="text-slate-900 font-bold">{paginatedPatients.length}</span> of{' '}
              <span className="text-slate-900 font-bold">{filteredPatients.length}</span> patients
            </p>

            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedPatients.map((patient) => {
              const statusStyle = getStatusStyle(patient.status);
              return (
                <div
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer space-y-4 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <InitialsAvatar name={patient.name} className="w-12 h-12 text-sm font-bold shrink-0" />
                      <div>
                        <h4 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {patient.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-semibold">
                          {patient.age} Yrs, {patient.gender}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold font-mono">
                      {patient.patientId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getConditionStyle(
                        patient.condition
                      )}`}
                    >
                      {patient.condition}
                    </span>

                    <span
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                      <span>{patient.status}</span>
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-50 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-medium">Therapist</span>
                      <span className="font-bold text-slate-800">{patient.therapistName}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-medium">Next Session</span>
                      <span className="font-bold text-slate-800">
                        {patient.nextAppointmentDate} at {patient.nextAppointmentTime}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Recovery Score</span>
                      <span className="text-blue-600">{patient.recoveryScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${patient.recoveryScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cards View Pagination */}
          <div className="px-6 py-4 bg-white rounded-3xl border border-slate-100 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Showing <span className="text-slate-900 font-bold">{paginatedPatients.length}</span> of {filteredPatients.length} patients
            </p>
            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bottom Dynamic Metric Summary Cards (Live computed stats) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        {/* Card 1: Total & Active Patients */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <UserPlus className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total & Active Patients
            </p>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {stats.totalPatients} Patients
            </h4>
            <p className="text-xs text-teal-600 font-bold mt-0.5">
              {stats.activePatients} Active Treatment
            </p>
          </div>
        </div>

        {/* Card 2: Upcoming & Completed Sessions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Appointments Summary
            </p>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {stats.upcomingAppointments} Upcoming
            </h4>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              {stats.completedAppointments} Completed Sessions
            </p>
          </div>
        </div>

        {/* Card 3: Pending & Collected Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <RefreshCw className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Billing & Revenue Status
            </p>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              ₹{stats.monthlyRevenue.toLocaleString()} Paid
            </h4>
            <p className="text-xs text-amber-600 font-bold mt-0.5">
              ₹{stats.pendingPayments.toLocaleString()} Pending Balance
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ImportPatientsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};

export default PatientsView;
